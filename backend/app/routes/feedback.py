from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import HRFeedback, Candidate
from app.schemas import HRFeedbackCreate, HRFeedbackOut

router = APIRouter(prefix="/ananya-aegis/hr-feedback", tags=["HR Feedback"])


@router.get("", response_model=list[HRFeedbackOut])
def list_feedback(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(HRFeedback).offset(skip).limit(limit).all()


@router.post("", response_model=HRFeedbackOut, status_code=status.HTTP_201_CREATED)
def create_feedback(payload: HRFeedbackCreate, db: Session = Depends(get_db)):
    # Validate candidate exists
    candidate = db.get(Candidate, payload.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Check if feedback already exists
    existing = (
        db.query(HRFeedback)
        .filter(HRFeedback.candidate_id == payload.candidate_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409, detail="Feedback already exists for this candidate"
        )

    feedback = HRFeedback(**payload.model_dump())
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback