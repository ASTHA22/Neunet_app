from pydantic import BaseModel
from typing import Dict, Optional

class ApplicationCreate(BaseModel):
    job_id: str
    job_questionnaire_id: str
    id: str
    candidate_email: str
    
class CandidateApplication(BaseModel):
    Unique_id: str
    ranking: float
    conversation: str
    resume: str
    job_description: str

class ApplicationResponse(BaseModel):
    job_id: str
    job_questionnaire_id: str
    id: str
    applications: Dict[str, CandidateApplication]
    _rid: Optional[str] = None
    _self: Optional[str] = None
    _etag: Optional[str] = None
    _attachments: Optional[str] = None
    _ts: Optional[int] = None
