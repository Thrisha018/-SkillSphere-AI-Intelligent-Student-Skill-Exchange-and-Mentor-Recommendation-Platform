import uuid
import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.feedback import FeedbackCreate
from app.utils.auth import get_current_user
from app.database import get_database

router = APIRouter(prefix="/feedback", tags=["Rating & Feedback"])

@router.post("", status_code=status.HTTP_201_CREATED)
def submit_feedback(feedback_data: FeedbackCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    learner_id = str(current_user["_id"])
    mentor_id = feedback_data.mentor_id.strip()
    session_id = feedback_data.session_id.strip()

    session = db.sessions.find_one({"_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Mentoring session not found.")

    if session["learner_id"] != learner_id:
        raise HTTPException(status_code=403, detail="Only the session learner can submit feedback.")

    mentor = db.users.find_one({"_id": mentor_id})
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found.")

    feedback_id = str(uuid.uuid4())
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

    feedback_doc = {
        "_id": feedback_id,
        "session_id": session_id,
        "learner_id": learner_id,
        "learner_name": current_user.get("name", "Student Learner"),
        "mentor_id": mentor_id,
        "rating": float(feedback_data.rating),
        "comment": feedback_data.comment.strip(),
        "created_at": now_str
    }

    db.feedback.insert_one(feedback_doc)

    # Mark session as Completed if not already completed
    db.sessions.update_one(
        {"_id": session_id},
        {"$set": {"status": "Completed", "updated_at": now_str}}
    )

    # Recalculate mentor's overall average rating and update feedback_history
    current_rating = mentor.get("rating", 5.0)
    current_totals = mentor.get("total_ratings", 0)
    
    new_totals = current_totals + 1
    new_avg_rating = round(((current_rating * current_totals) + feedback_data.rating) / new_totals, 2)

    feedback_entry = {
        "feedback_id": feedback_id,
        "learner_name": current_user.get("name"),
        "rating": float(feedback_data.rating),
        "comment": feedback_data.comment.strip(),
        "date": now_str
    }

    db.users.update_one(
        {"_id": mentor_id},
        {
            "$set": {"rating": new_avg_rating, "total_ratings": new_totals},
            "$push": {"feedback_history": feedback_entry}
        }
    )

    return {
        "message": "Feedback & rating submitted successfully!",
        "feedback": {
            "id": feedback_id,
            "session_id": session_id,
            "mentor_id": mentor_id,
            "rating": feedback_data.rating,
            "comment": feedback_data.comment,
            "created_at": now_str
        },
        "updated_mentor_rating": new_avg_rating
    }

@router.get("/mentor/{mentor_id}")
def get_mentor_feedback(mentor_id: str):
    db = get_database()
    feedbacks = list(db.feedback.find({"mentor_id": mentor_id}))
    for f in feedbacks:
        f["id"] = str(f.pop("_id"))
    return feedbacks
