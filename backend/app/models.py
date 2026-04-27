"""
app/models.py — SQLAlchemy ORM models (database tables).
Pydantic schemas live in app/schemas.py.
"""

from datetime import datetime, date, time

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Float, ForeignKey,
    Integer, String, Text, Time,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(25), nullable=True)
    role_applied = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    experience_years = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    assessments = relationship("Assessment", back_populates="candidate", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="candidate", cascade="all, delete-orphan")
    agent_outputs = relationship("AgentOutput", back_populates="candidate", cascade="all, delete-orphan")
    final_decisions = relationship("FinalDecision", back_populates="candidate", cascade="all, delete-orphan")
    hr_feedbacks = relationship("HRFeedback", back_populates="candidate", cascade="all, delete-orphan")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("ananya.candidates.id"), nullable=False, index=True)
    total_questions = Column(Integer, default=0)
    attempted_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    wrong_answers = Column(Integer, default=0)
    unanswered = Column(Integer, default=0)
    mcq_score_percent = Column(Float, nullable=True)
    coding_score_percent = Column(Float, nullable=True)
    logic_score_percent = Column(Float, nullable=True)
    resume_match_percent = Column(Float, nullable=True)
    jd_skill_match_percent = Column(Float, nullable=True)
    time_taken_seconds = Column(Integer, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="assessments")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("ananya.candidates.id"), nullable=False, index=True)
    round_no = Column(Integer, default=1)
    scheduled_date = Column(Date, nullable=True)
    scheduled_time = Column(Time, nullable=True)
    session_duration_minutes = Column(Integer, nullable=True)
    interview_mode = Column(String(50), nullable=True)
    status = Column(String(50), nullable=True)
    ai_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    response_confidence_score = Column(Float, nullable=True)
    questions_answered = Column(Integer, nullable=True)
    total_questions = Column(Integer, nullable=True)
    transcript_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="interviews")


class AgentOutput(Base):
    __tablename__ = "agent_outputs"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("ananya.candidates.id"), nullable=False, index=True)
    recommendation = Column(String(50), nullable=True)
    recommendation_confidence_score = Column(Float, nullable=True)
    strengths = Column(Text, nullable=True)
    concerns = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    next_step = Column(Text, nullable=True)          # ← fixed: String(100) → Text
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="agent_outputs")


class FinalDecision(Base):
    __tablename__ = "final_decisions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("ananya.candidates.id"), nullable=False, index=True)
    final_decision = Column(String(50), nullable=True)
    human_final_decision = Column(Boolean, default=True)
    decision_notes = Column(Text, nullable=True)
    decided_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="final_decisions")


class HRFeedback(Base):
    __tablename__ = "hr_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("ananya.candidates.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=True)
    decision_alignment = Column(Boolean, default=False)
    useful_output = Column(Boolean, default=False)
    bias_flagged = Column(Boolean, default=False)
    feedback_comment = Column(Text, nullable=True)
    corrected_recommendation = Column(String(50), nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="hr_feedbacks")