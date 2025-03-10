from pydantic import BaseModel
from typing import List, Optional, Dict

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    job_id: Optional[int] = None
    candidate_email: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    suggested_actions: Optional[List[Dict[str, str]]] = None
