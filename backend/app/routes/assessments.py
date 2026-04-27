from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Assessment
from app.schemas import AssessmentOut

router = APIRouter(prefix="/ananya-ageis/assessments", tags=["Assessments"])


@router.get("", response_model=list[AssessmentOut])
def list_assessments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Assessment).offset(skip).limit(limit).all()


@router.get("/{candidate_id}", response_model=AssessmentOut)
def get_assessment_by_candidate(candidate_id: int, db: Session = Depends(get_db)):
    assessment = (
        db.query(Assessment).filter(Assessment.candidate_id == candidate_id).first()
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found for this candidate")
    return assessment