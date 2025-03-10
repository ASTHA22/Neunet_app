from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class Question(BaseModel):
    question: str
    weight: int
    scoring: str = ""

class QuestionCategory(BaseModel):
    questions: List[Question]

class QuestionnaireCreate(BaseModel):
    questionnaire: Dict[str, List[Question]]
    job_id: str
    id: Optional[str] = None

class QuestionnaireResponse(QuestionnaireCreate):
    _rid: Optional[str] = None
    _self: Optional[str] = None
    _etag: Optional[str] = None
    _attachments: Optional[str] = None
    _ts: Optional[int] = None
