from pydantic import BaseModel, Field

class FeedbackCreate(BaseModel):
    session_id: str = Field(..., example="session_123")
    mentor_id: str = Field(..., example="user_mentor_123")
    rating: float = Field(..., ge=1.0, le=5.0, example=5.0)
    comment: str = Field(..., example="Great mentor! Explained Python concepts clearly with practical examples.")

class FeedbackOut(BaseModel):
    id: str
    session_id: str
    learner_id: str
    learner_name: str
    mentor_id: str
    rating: float
    comment: str
    created_at: str
