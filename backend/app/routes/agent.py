from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AgentOutput
from app.schemas import AgentOutputOut

router = APIRouter(prefix="/ananya-aegis/agent-output", tags=["Agent Output"])


@router.get("", response_model=list[AgentOutputOut])
def list_agent_outputs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(AgentOutput).offset(skip).limit(limit).all()


@router.get("/{candidate_id}", response_model=AgentOutputOut)
def get_agent_output_by_candidate(candidate_id: int, db: Session = Depends(get_db)):
    output = (
        db.query(AgentOutput).filter(AgentOutput.candidate_id == candidate_id).first()
    )
    if not output:
        raise HTTPException(status_code=404, detail="Agent output not found for this candidate")
    return output