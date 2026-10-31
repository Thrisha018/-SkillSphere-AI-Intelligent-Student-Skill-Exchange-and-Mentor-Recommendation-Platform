import uuid
import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.session import MentoringRequestCreate, RequestStatusUpdate
from app.utils.auth import get_current_user
from app.database import get_database

router = APIRouter(prefix="/sessions", tags=["Mentoring Sessions"])

@router.post("/request", status_code=status.HTTP_201_CREATED)
def create_mentoring_request(req_data: MentoringRequestCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    learner_id = str(current_user["_id"])
    mentor_id = req_data.mentor_id.strip()

    if learner_id == mentor_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot request mentoring from yourself."
        )

    mentor = db.users.find_one({"_id": mentor_id})
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found.")

    session_id = str(uuid.uuid4())
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

    session_doc = {
        "_id": session_id,
        "learner_id": learner_id,
        "learner_name": current_user.get("name", "Student Learner"),
        "learner_email": current_user.get("email", ""),
        "mentor_id": mentor_id,
        "mentor_name": mentor.get("name", "Student Mentor"),
        "mentor_email": mentor.get("email", ""),
        "skill_topic": req_data.skill_topic.strip(),
        "message": req_data.message.strip(),
        "proposed_time": req_data.proposed_time.strip() if req_data.proposed_time else "Flexible",
        "status": "Pending",  # Pending, Accepted, Rejected, Completed
        "created_at": now_str,
        "updated_at": now_str
    }

    db.sessions.insert_one(session_doc)

    return {
        "message": "Mentoring request sent successfully!",
        "session": {
            "id": session_id,
            "mentor_id": mentor_id,
            "mentor_name": mentor.get("name"),
            "skill_topic": req_data.skill_topic,
            "status": "Pending",
            "created_at": now_str
        }
    }

@router.put("/{session_id}/status")
def update_session_status(session_id: str, status_update: RequestStatusUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = str(current_user["_id"])
    new_status = status_update.status.strip()

    valid_statuses = ["Pending", "Accepted", "Rejected", "Completed"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    session = db.sessions.find_one({"_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session/Request not found.")

    # Only learner or mentor of this session can update it
    if session["learner_id"] != user_id and session["mentor_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this mentoring session.")

    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
    db.sessions.update_one(
        {"_id": session_id},
        {"$set": {"status": new_status, "updated_at": now_str}}
    )

    # If completed, increment mentoring_count for mentor
    if new_status == "Completed":
        db.users.update_one(
            {"_id": session["mentor_id"]},
            {"$inc": {"mentoring_count": 1}}
        )

    updated_session = db.sessions.find_one({"_id": session_id})
    updated_session["id"] = updated_session.pop("_id")
    return {
        "message": f"Session status updated to '{new_status}'",
        "session": updated_session
    }

@router.get("/my-requests")
def get_learner_requests(current_user: dict = Depends(get_current_user)):
    """Returns requests sent by the current user as a learner."""
    db = get_database()
    user_id = str(current_user["_id"])

    requests = list(db.sessions.find({"learner_id": user_id}))
    for r in requests:
        r["id"] = str(r.pop("_id"))
    return requests

@router.get("/mentor-requests")
def get_mentor_received_requests(current_user: dict = Depends(get_current_user)):
    """Returns requests received by the current user as a mentor."""
    db = get_database()
    user_id = str(current_user["_id"])

    requests = list(db.sessions.find({"mentor_id": user_id}))
    for r in requests:
        r["id"] = str(r.pop("_id"))
    return requests
