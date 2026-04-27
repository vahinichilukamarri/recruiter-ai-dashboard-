from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ─────────────────────────────────────────────
# Candidate
# ─────────────────────────────────────────────

class CandidateCreate(BaseModel):
    full_name: str = Field(..., max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=25)
    role_applied: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    experience_years: Optional[float] = 0


class CandidateUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=120)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=25)
    role_applied: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    experience_years: Optional[float] = None


class CandidateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone: Optional[str]
    role_applied: Optional[str]
    department: Optional[str]
    experience_years: Optional[float]
    created_at: datetime


# ─────────────────────────────────────────────
# Assessment
# ─────────────────────────────────────────────

class AssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_id: int
    total_questions: int
    attempted_questions: int
    correct_answers: int
    wrong_answers: int
    unanswered: int
    mcq_score_percent: Optional[float]
    coding_score_percent: Optional[float]
    logic_score_percent: Optional[float]
    resume_match_percent: Optional[float]
    jd_skill_match_percent: Optional[float]
    time_taken_seconds: Optional[int]
    submitted_at: datetime


# ─────────────────────────────────────────────
# Interview
# ─────────────────────────────────────────────

class InterviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_id: int
    round_no: int
    scheduled_date: Optional[date]
    scheduled_time: Optional[time]
    session_duration_minutes: Optional[int]
    interview_mode: Optional[str]
    status: Optional[str]
    ai_score: Optional[float]
    communication_score: Optional[float]
    response_confidence_score: Optional[float]
    questions_answered: Optional[int]
    total_questions: Optional[int]
    transcript_summary: Optional[str]
    created_at: datetime


# ─────────────────────────────────────────────
# Agent Output
# ─────────────────────────────────────────────

class AgentOutputOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_id: int
    recommendation: Optional[str]
    recommendation_confidence_score: Optional[float]
    strengths: Optional[str]
    concerns: Optional[str]
    summary: Optional[str]
    next_step: Optional[str]
    created_at: datetime


# ─────────────────────────────────────────────
# Final Decision
# ─────────────────────────────────────────────

class FinalDecisionUpdate(BaseModel):
    final_decision: str = Field(..., pattern="^(Selected|Rejected|Hold|Escalated)$")
    decision_notes: Optional[str] = None


class FinalDecisionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_id: int
    final_decision: Optional[str]
    human_final_decision: bool
    decision_notes: Optional[str]
    decided_at: datetime


# ─────────────────────────────────────────────
# HR Feedback
# ─────────────────────────────────────────────

class HRFeedbackCreate(BaseModel):
    candidate_id: int
    rating: Optional[int] = Field(None, ge=1, le=5)
    decision_alignment: bool = False
    useful_output: bool = False
    bias_flagged: bool = False
    feedback_comment: Optional[str] = None
    corrected_recommendation: Optional[str] = Field(
        None, pattern="^(Proceed|Hold|Reject)$"
    )


class HRFeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_id: int
    rating: Optional[int]
    decision_alignment: bool
    useful_output: bool
    bias_flagged: bool
    feedback_comment: Optional[str]
    corrected_recommendation: Optional[str]
    reviewed_at: datetime


# ─────────────────────────────────────────────
# Analytics
# ─────────────────────────────────────────────

class DashboardSummary(BaseModel):
    total_candidates: int
    total_selected: int
    total_rejected: int
    total_hold: int
    interviews_scheduled: int
    interviews_completed: int
    avg_mcq_score: float


class ChartItem(BaseModel):
    label: str
    value: float


class WeeklyTrendItem(BaseModel):
    week: str
    candidates: int


class ScoreDistributionItem(BaseModel):
    range: str
    count: int


class HiringFunnelItem(BaseModel):
    stage: str
    count: int
    percentage: float


# ─────────────────────────────────────────────
# Generic
# ─────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str
    version: str
    env: str