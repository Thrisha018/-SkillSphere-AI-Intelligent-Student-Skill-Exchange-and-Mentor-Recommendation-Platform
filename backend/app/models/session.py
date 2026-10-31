from typing import Optional
from pydantic import BaseModel, Field

class MentoringRequestCreate(BaseModel):
    mentor_id: str = Field(..., example="user_mentor_123")
    skill_topic: str = Field(..., example="Python & Data Structures")
    message: str = Field(..., example="Hi! I would love to learn Python basics from you.")
    proposed_time: Optional[str] = Field("Weekends 4 PM", example="Weekends 4 PM")

class RequestStatusUpdate(BaseModel):
    status: str = Field(..., example="Accepted") # Accepted, Rejected, Completed

class MentoringSessionOut(BaseModel):
    id: str
    learner_id: str
    learner_name: str
    learner_email: str
    mentor_id: str
    mentor_name: str
    mentor_email: str
    skill_topic: str
    message: str
    proposed_time: str
    status: str # Pending, Accepted, Rejected, Completed
    created_at: str
    updated_at: str
