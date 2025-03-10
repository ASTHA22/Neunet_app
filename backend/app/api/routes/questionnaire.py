from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from ...core.db import db
from ...models.questionnaire import QuestionnaireCreate, QuestionnaireResponse

router = APIRouter()

@router.post("/create", response_model=QuestionnaireResponse)
async def create_questionnaire(questionnaire: QuestionnaireCreate):
    """Create a new job questionnaire"""
    success = await db.create_questionnaire(questionnaire.dict())
    if not success:
        raise HTTPException(status_code=400, detail="Failed to create questionnaire")
    return questionnaire

@router.get("/{job_id}", response_model=Optional[QuestionnaireResponse])
async def get_questionnaire(job_id: str):
    """Get a job questionnaire by job ID"""
    questionnaire = await db.get_questionnaire(job_id)
    if not questionnaire:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    return questionnaire
