from fastapi import APIRouter, HTTPException, status, Depends
from app.models.skill import SkillAdd, SkillListUpdate
from app.utils.auth import get_current_user
from app.database import get_database

router = APIRouter(prefix="/skills", tags=["Skill Management"])

@router.get("")
def get_user_skills(current_user: dict = Depends(get_current_user)):
    return {
        "teach_skills": current_user.get("teach_skills", []),
        "learn_skills": current_user.get("learn_skills", [])
    }

@router.post("/teach")
def add_teach_skill(skill: SkillAdd, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    skill_name = skill.skill_name.strip()

    teach_skills = current_user.get("teach_skills", [])
    if skill_name not in teach_skills:
        teach_skills.append(skill_name)
        db.users.update_one({"_id": user_id}, {"$set": {"teach_skills": teach_skills}})

    return {
        "message": f"Added '{skill_name}' to teach skills",
        "teach_skills": teach_skills,
        "learn_skills": current_user.get("learn_skills", [])
    }

@router.post("/learn")
def add_learn_skill(skill: SkillAdd, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    skill_name = skill.skill_name.strip()

    learn_skills = current_user.get("learn_skills", [])
    if skill_name not in learn_skills:
        learn_skills.append(skill_name)
        db.users.update_one({"_id": user_id}, {"$set": {"learn_skills": learn_skills}})

    return {
        "message": f"Added '{skill_name}' to learn skills",
        "teach_skills": current_user.get("teach_skills", []),
        "learn_skills": learn_skills
    }

@router.put("/batch")
def update_skills_batch(skills: SkillListUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]

    clean_teach = [s.strip() for s in skills.teach_skills if s.strip()]
    clean_learn = [s.strip() for s in skills.learn_skills if s.strip()]

    db.users.update_one(
        {"_id": user_id},
        {"$set": {"teach_skills": clean_teach, "learn_skills": clean_learn}}
    )

    return {
        "message": "Skills updated successfully",
        "teach_skills": clean_teach,
        "learn_skills": clean_learn
    }

@router.delete("/teach/{skill_name}")
def remove_teach_skill(skill_name: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]

    teach_skills = [s for s in current_user.get("teach_skills", []) if s.lower() != skill_name.lower()]
    db.users.update_one({"_id": user_id}, {"$set": {"teach_skills": teach_skills}})

    return {
        "message": f"Removed '{skill_name}' from teach skills",
        "teach_skills": teach_skills,
        "learn_skills": current_user.get("learn_skills", [])
    }

@router.delete("/learn/{skill_name}")
def remove_learn_skill(skill_name: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]

    learn_skills = [s for s in current_user.get("learn_skills", []) if s.lower() != skill_name.lower()]
    db.users.update_one({"_id": user_id}, {"$set": {"learn_skills": learn_skills}})

    return {
        "message": f"Removed '{skill_name}' from learn skills",
        "teach_skills": current_user.get("teach_skills", []),
        "learn_skills": learn_skills
    }
