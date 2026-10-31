from typing import List, Optional
from pydantic import BaseModel, Field

class SkillAdd(BaseModel):
    skill_name: str = Field(..., example="Python")
    category: str = Field("Technical", example="Technical") # Technical, Non-Technical, Soft Skills
    proficiency_level: str = Field("Intermediate", example="Beginner / Intermediate / Expert")

class SkillListUpdate(BaseModel):
    teach_skills: List[str]
    learn_skills: List[str]

class SkillOut(BaseModel):
    teach_skills: List[str]
    learn_skills: List[str]
