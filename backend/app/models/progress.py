from typing import List, Optional
from pydantic import BaseModel, Field

class SkillProgressUpdate(BaseModel):
    skill_name: str = Field(..., example="Python")
    status: str = Field("In Progress", example="In Progress / Completed") # Not Started, In Progress, Completed
    completion_percentage: float = Field(..., ge=0.0, le=100.0, example=75.0)
    notes: Optional[str] = Field("", example="Completed basic loops, OOP, and data structures with mentor.")

class ProgressOut(BaseModel):
    id: str
    user_id: str
    skill_name: str
    status: str
    completion_percentage: float
    notes: str
    updated_at: str
