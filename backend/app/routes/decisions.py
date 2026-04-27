from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Candidate, FinalDecision
from app.schemas import FinalDecisionOut, FinalDecisionUpdate

router = APIRouter(prefix="/ananya-aegis/final-decisions", tags=["Final Decisions"])


def _filter_decision(db: Session, decision_val: str) -> list[FinalDecision]:
    return (
        db.query(FinalDecision)
        .filter(FinalDecision.final_decision == decision_val)
        .all()
    )


@router.get("", response_model=list[FinalDecisionOut])
def list_decisions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(FinalDecision).offset(skip).limit(limit).all()


@router.get("/selected", response_model=list[FinalDecisionOut])
def get_selected(db: Session = Depends(get_db)):
    return _filter_decision(db, "Selected")


@router.get("/rejected", response_model=list[FinalDecisionOut])
def get_rejected(db: Session = Depends(get_db)):
    return _filter_decision(db, "Rejected")


@router.get("/hold", response_model=list[FinalDecisionOut])
def get_hold(db: Session = Depends(get_db)):
    return _filter_decision(db, "Hold")


@router.get("/escalated", response_model=list[FinalDecisionOut])
def get_escalated(db: Session = Depends(get_db)):
    return _filter_decision(db, "Escalated")


@router.put("/{candidate_id}", response_model=FinalDecisionOut)
def update_decision(
    candidate_id: int, payload: FinalDecisionUpdate, db: Session = Depends(get_db)
):
    candidate = db.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    decision = (
        db.query(FinalDecision)
        .filter(FinalDecision.candidate_id == candidate_id)
        .first()
    )
    if not decision:
        # Create a new record if it doesn't exist
        decision = FinalDecision(
            candidate_id=candidate_id,
            final_decision=payload.final_decision,
            decision_notes=payload.decision_notes,
            human_final_decision=True,
            decided_at=datetime.utcnow(),
        )
        db.add(decision)
    else:
        decision.final_decision = payload.final_decision
        decision.decision_notes = payload.decision_notes
        decision.human_final_decision = True
        decision.decided_at = datetime.utcnow()

    db.commit()
    db.refresh(decision)
    return decision
