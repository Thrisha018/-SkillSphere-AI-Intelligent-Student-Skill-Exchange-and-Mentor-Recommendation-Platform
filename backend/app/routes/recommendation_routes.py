from fastapi import APIRouter, Depends, HTTPException
from app.utils.auth import get_current_user
from app.database import get_database
from app.services.recommendation import recommend_mentors

router = APIRouter(prefix="/recommendations", tags=["AI Mentor Recommendations"])

@router.get("/mentors")
def get_mentor_recommendations(current_user: dict = Depends(get_current_user)):
    """
    Analyzes current learner's requested skills, availability, and preferences.
    Calculates weighted skill compatibility, rating, experience, availability, and feedback score.
    Returns ranked mentor recommendations.
    """
    db = get_database()

    # Fetch all candidate mentors from MongoDB
    all_users = list(db.users.find({}))
    
    # Filter out current user from candidate list
    candidate_mentors = [u for u in all_users if str(u["_id"]) != str(current_user["_id"])]

    recommendations = recommend_mentors(current_user, candidate_mentors)

    return {
        "learner_id": str(current_user["_id"]),
        "learner_skills": current_user.get("learn_skills", []),
        "learner_availability": current_user.get("availability", "Flexible"),
        "total_recommendations": len(recommendations),
        "recommendations": recommendations
    }
