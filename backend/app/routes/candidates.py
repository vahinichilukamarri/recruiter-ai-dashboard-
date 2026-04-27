from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Candidate
from app.schemas import CandidateCreate, CandidateOut, CandidateUpdate, MessageResponse

router = APIRouter(prefix="/ananya-aegis/candidates", tags=["Candidates"])


@router.get("", response_model=list[CandidateOut])
def list_candidates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Candidate).offset(skip).limit(limit).all()


@router.get("/{candidate_id}", response_model=CandidateOut)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.post("", response_model=CandidateOut, status_code=status.HTTP_201_CREATED)
def create_candidate(payload: CandidateCreate, db: Session = Depends(get_db)):
    existing = db.query(Candidate).filter(Candidate.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    candidate = Candidate(**payload.model_dump())
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


@router.put("/{candidate_id}", response_model=CandidateOut)
def update_candidate(
    candidate_id: int, payload: CandidateUpdate, db: Session = Depends(get_db)
):
    candidate = db.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(candidate, field, value)

    db.commit()
    db.refresh(candidate)
    return candidate


@router.delete("/{candidate_id}", response_model=MessageResponse)
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(candidate)
    db.commit()
    return {"message": f"Candidate {candidate_id} deleted successfully"}