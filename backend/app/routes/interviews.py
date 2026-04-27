from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Interview
from app.schemas import InterviewOut

router = APIRouter(prefix="/ananya-ageis/interviews", tags=["Interviews"])


def _filter_by_status(db: Session, status_val: str) -> list[Interview]:
    return db.query(Interview).filter(Interview.status == status_val).all()


@router.get("", response_model=list[InterviewOut])
def list_interviews(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Interview).offset(skip).limit(limit).all()


@router.get("/scheduled", response_model=list[InterviewOut])
def get_scheduled(db: Session = Depends(get_db)):
    return _filter_by_status(db, "Scheduled")


@router.get("/completed", response_model=list[InterviewOut])
def get_completed(db: Session = Depends(get_db)):
    return _filter_by_status(db, "Completed")


@router.get("/in-progress", response_model=list[InterviewOut])
def get_in_progress(db: Session = Depends(get_db)):
    return _filter_by_status(db, "In Progress")


@router.get("/escalated", response_model=list[InterviewOut])
def get_escalated(db: Session = Depends(get_db)):
    return _filter_by_status(db, "Escalated")