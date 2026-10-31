from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import ProfileUpdate
from app.utils.auth import get_current_user
from app.database import get_database

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

@router.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    return {
        "id": user_id,
        "name": current_user.get("name", ""),
        "email": current_user.get("email", ""),
        "college": current_user.get("college", ""),
        "department": current_user.get("department", ""),
        "year": current_user.get("year", ""),
        "bio": current_user.get("bio", ""),
        "teach_skills": current_user.get("teach_skills", []),
        "learn_skills": current_user.get("learn_skills", []),
        "experience_years": current_user.get("experience_years", 1.0),
        "availability": current_user.get("availability", "Flexible"),
        "rating": current_user.get("rating", 5.0),
        "total_ratings": current_user.get("total_ratings", 0),
        "mentoring_count": current_user.get("mentoring_count", 0),
        "feedback_history": current_user.get("feedback_history", [])
    }

@router.put("/profile")
def update_profile(profile: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]

    update_fields = {}
    if profile.name is not None:
        update_fields["name"] = profile.name.strip()
    if profile.college is not None:
        update_fields["college"] = profile.college.strip()
    if profile.department is not None:
        update_fields["department"] = profile.department.strip()
    if profile.year is not None:
        update_fields["year"] = profile.year.strip()
    if profile.bio is not None:
        update_fields["bio"] = profile.bio.strip()
    if profile.experience_years is not None:
        update_fields["experience_years"] = profile.experience_years
    if profile.availability is not None:
        update_fields["availability"] = profile.availability.strip()
    if profile.teach_skills is not None:
        update_fields["teach_skills"] = profile.teach_skills
    if profile.learn_skills is not None:
        update_fields["learn_skills"] = profile.learn_skills

    if update_fields:
        db.users.update_one({"_id": user_id}, {"$set": update_fields})

    updated_user = db.users.find_one({"_id": user_id})
    updated_user.pop("hashed_password", None)
    return {
        "message": "Profile updated successfully",
        "user": updated_user
    }

@router.get("/{user_id}")
def get_user_by_id(user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    target_user = db.users.find_one({"_id": user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    target_user.pop("hashed_password", None)
    return target_user
