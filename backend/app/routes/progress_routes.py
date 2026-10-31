import uuid
import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.progress import SkillProgressUpdate
from app.utils.auth import get_current_user
from app.database import get_database

router = APIRouter(prefix="/progress", tags=["Progress Tracking"])

@router.get("")
def get_user_progress(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = str(current_user["_id"])

    # Fetch progress entries for user
    progress_entries = list(db.progress.find({"user_id": user_id}))
    for p in progress_entries:
        p["id"] = str(p.pop("_id"))

    # Fetch completed sessions count
    completed_sessions = db.sessions.count_documents({"learner_id": user_id, "status": "Completed"})
    active_sessions = db.sessions.count_documents({"learner_id": user_id, "status": "Accepted"})

    # Ensure all learn_skills have a progress record
    learn_skills = current_user.get("learn_skills", [])
    existing_skills = {p["skill_name"].lower() for p in progress_entries}

    for skill in learn_skills:
        if skill.lower() not in existing_skills:
            # Create a default progress entry
            prog_id = str(uuid.uuid4())
            now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
            default_entry = {
                "_id": prog_id,
                "user_id": user_id,
                "skill_name": skill,
                "status": "In Progress",
                "completion_percentage": 25.0,
                "notes": "Skill added to learning list.",
                "updated_at": now_str
            }
            db.progress.insert_one(default_entry)
            default_entry["id"] = prog_id
            default_entry.pop("_id", None)
            progress_entries.append(default_entry)

    return {
        "user_id": user_id,
        "learn_skills_count": len(learn_skills),
        "completed_sessions_count": completed_sessions,
        "active_sessions_count": active_sessions,
        "progress_records": progress_entries
    }

@router.post("/update")
def update_skill_progress(prog_data: SkillProgressUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = str(current_user["_id"])
    skill_name = prog_data.skill_name.strip()
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

    existing = db.progress.find_one({"user_id": user_id, "skill_name": skill_name})

    if existing:
        db.progress.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "status": prog_data.status,
                "completion_percentage": float(prog_data.completion_percentage),
                "notes": prog_data.notes if prog_data.notes else "",
                "updated_at": now_str
            }}
        )
        record_id = str(existing["_id"])
    else:
        record_id = str(uuid.uuid4())
        doc = {
            "_id": record_id,
            "user_id": user_id,
            "skill_name": skill_name,
            "status": prog_data.status,
            "completion_percentage": float(prog_data.completion_percentage),
            "notes": prog_data.notes if prog_data.notes else "",
            "updated_at": now_str
        }
        db.progress.insert_one(doc)

    return {
        "message": f"Learning progress for '{skill_name}' updated successfully.",
        "progress": {
            "id": record_id,
            "skill_name": skill_name,
            "status": prog_data.status,
            "completion_percentage": prog_data.completion_percentage,
            "notes": prog_data.notes,
            "updated_at": now_str
        }
    }
