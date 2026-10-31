import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserRegister, UserLogin, UserOut
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_user
from app.database import get_database

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister):
    db = get_database()
    
    # Check duplicate email
    existing_user = db.users.find_one({"email": user_data.email.strip().lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "name": user_data.name.strip(),
        "email": user_data.email.strip().lower(),
        "hashed_password": hash_password(user_data.password),
        "college": user_data.college.strip(),
        "department": user_data.department.strip(),
        "year": user_data.year.strip(),
        "bio": user_data.bio.strip() if user_data.bio else "",
        "teach_skills": [],
        "learn_skills": [],
        "experience_years": 1.0,
        "availability": "Flexible",
        "rating": 5.0,
        "total_ratings": 0,
        "mentoring_count": 0,
        "feedback_history": []
    }

    db.users.insert_one(user_doc)

    # Generate JWT token
    token = create_access_token(data={"sub": user_id, "email": user_doc["email"]})

    return {
        "message": "User registered successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user_doc["name"],
            "email": user_doc["email"],
            "college": user_doc["college"],
            "department": user_doc["department"],
            "year": user_doc["year"]
        }
    }

@router.post("/login")
def login(credentials: UserLogin):
    db = get_database()
    email_clean = credentials.email.strip().lower()
    
    user = db.users.find_one({"email": email_clean})
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(data={"sub": user["_id"], "email": user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "name": user["name"],
            "email": user["email"],
            "college": user.get("college", ""),
            "department": user.get("department", ""),
            "year": user.get("year", ""),
            "teach_skills": user.get("teach_skills", []),
            "learn_skills": user.get("learn_skills", [])
        }
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
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
