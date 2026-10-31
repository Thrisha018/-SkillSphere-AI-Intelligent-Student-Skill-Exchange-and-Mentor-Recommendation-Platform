from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    name: str = Field(..., example="Aarav Sharma")
    email: str = Field(..., example="aarav@college.edu")
    password: str = Field(..., min_length=6, example="password123")
    college: str = Field("IIT Bombay", example="IIT Bombay")
    department: str = Field("Computer Science", example="Computer Science")
    year: str = Field("3rd Year", example="3rd Year")
    bio: Optional[str] = Field("Passionate student & learner", example="Passionate about AI & web dev.")

class UserLogin(BaseModel):
    email: str = Field(..., example="aarav@college.edu")
    password: str = Field(..., example="password123")

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[float] = None
    availability: Optional[str] = None  # e.g., "Weekdays Evenings", "Weekends", "Flexible"
    teach_skills: Optional[List[str]] = None
    learn_skills: Optional[List[str]] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    college: str
    department: str
    year: str
    bio: Optional[str] = ""
    teach_skills: List[str] = []
    learn_skills: List[str] = []
    experience_years: float = 1.0
    availability: str = "Flexible"
    rating: float = 5.0
    total_ratings: int = 0
    mentoring_count: int = 0
    feedback_history: List[dict] = []
