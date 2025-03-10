from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ...core.db import db
from ...models.application import ApplicationCreate, ApplicationResponse

router = APIRouter()

@router.post("/submit", response_model=ApplicationResponse)
async def submit_application(application: ApplicationCreate):
    """Submit a new job application"""
    success = await db.create_application(application.dict())
    if not success:
        raise HTTPException(status_code=400, detail="Failed to submit application")
    return application

@router.get("/job/{job_id}", response_model=List[ApplicationResponse])
async def get_job_applications(job_id: str):
    """Get all applications for a specific job"""
    applications = await db.get_applications(job_id)
    if not applications:
        return []
    return applications

@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(application_id: str):
    """Get a specific application by ID"""
    application = await db.get_application(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application
