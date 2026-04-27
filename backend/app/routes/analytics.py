from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models import AgentOutput, Assessment, Candidate, FinalDecision, Interview
from app.schemas import (
    ChartItem,
    DashboardSummary,
    ScoreDistributionItem,
    WeeklyTrendItem,
)

router = APIRouter(tags=["Analytics"])


# ─────────────────────────────────────────────
# Dashboard Summary
# ─────────────────────────────────────────────

@router.get("/ananya-ageis/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    total_candidates = db.query(func.count(Candidate.id)).scalar() or 0

    def count_decision(val: str) -> int:
        return (
            db.query(func.count(FinalDecision.id))
            .filter(FinalDecision.final_decision == val)
            .scalar()
            or 0
        )

    def count_interview_status(val: str) -> int:
        return (
            db.query(func.count(Interview.id))
            .filter(Interview.status == val)
            .scalar()
            or 0
        )

    avg_mcq = (
        db.query(func.avg(Assessment.mcq_score_percent)).scalar() or 0.0
    )

    return DashboardSummary(
        total_candidates=total_candidates,
        total_selected=count_decision("Selected"),
        total_rejected=count_decision("Rejected"),
        total_hold=count_decision("Hold"),
        interviews_scheduled=count_interview_status("Scheduled"),
        interviews_completed=count_interview_status("Completed"),
        avg_mcq_score=round(float(avg_mcq), 2),
    )


# ─────────────────────────────────────────────
# Chart: Decision Pie
# ─────────────────────────────────────────────

@router.get("/ananya-ageis/charts/decision-pie", response_model=list[ChartItem])
def chart_decision_pie(db: Session = Depends(get_db)):
    rows = (
        db.query(FinalDecision.final_decision, func.count(FinalDecision.id))
        .group_by(FinalDecision.final_decision)
        .all()
    )
    return [
        ChartItem(label=label or "Unknown", value=float(count))
        for label, count in rows
    ]


# ─────────────────────────────────────────────
# Chart: Interview Status
# ─────────────────────────────────────────────

@router.get("/ananya-ageis/charts/interview-status", response_model=list[ChartItem])
def chart_interview_status(db: Session = Depends(get_db)):
    rows = (
        db.query(Interview.status, func.count(Interview.id))
        .group_by(Interview.status)
        .all()
    )
    return [
        ChartItem(label=label or "Unknown", value=float(count))
        for label, count in rows
    ]


# ─────────────────────────────────────────────
# Chart: Department Bar
# ─────────────────────────────────────────────

@router.get("/ananya-ageis/charts/department-bar", response_model=list[ChartItem])
def chart_department_bar(db: Session = Depends(get_db)):
    rows = (
        db.query(Candidate.department, func.count(Candidate.id))
        .group_by(Candidate.department)
        .order_by(func.count(Candidate.id).desc())
        .all()
    )
    return [
        ChartItem(label=dept or "Unknown", value=float(count))
        for dept, count in rows
    ]


# ─────────────────────────────────────────────
# Chart: Weekly Trend
# ─────────────────────────────────────────────

@router.get("/ananya-ageis/charts/weekly-trend", response_model=list[WeeklyTrendItem])
def chart_weekly_trend(db: Session = Depends(get_db)):
    if settings.sqlalchemy_database_url.startswith("sqlite"):
        rows = db.query(Candidate.created_at).order_by(Candidate.created_at).all()
        weekly_counts = defaultdict(int)
        for (created_at,) in rows:
            if not created_at:
                weekly_counts["Unknown"] += 1
                continue
            week_start = (created_at - timedelta(days=created_at.weekday())).date()
            weekly_counts[week_start.strftime("%Y-%m-%d")] += 1
        return [
            WeeklyTrendItem(week=week, candidates=count)
            for week, count in list(weekly_counts.items())[-12:]
        ]

    rows = (
        db.query(
            func.date_trunc("week", Candidate.created_at).label("week"),
            func.count(Candidate.id).label("candidates"),
        )
        .group_by(func.date_trunc("week", Candidate.created_at))
        .order_by(func.date_trunc("week", Candidate.created_at))
        .limit(12)
        .all()
    )
    return [
        WeeklyTrendItem(
            week=row.week.strftime("%Y-%m-%d") if row.week else "Unknown",
            candidates=row.candidates,
        )
        for row in rows
    ]


# ─────────────────────────────────────────────
# Chart: Score Distribution
# ─────────────────────────────────────────────

@router.get("/ananya-ageis/charts/score-distribution", response_model=list[ScoreDistributionItem])
def chart_score_distribution(db: Session = Depends(get_db)):
    assessments = db.query(Assessment.mcq_score_percent).all()

    buckets: dict[str, int] = {
        "0-20": 0,
        "21-40": 0,
        "41-60": 0,
        "61-80": 0,
        "81-100": 0,
    }

    for (score,) in assessments:
        if score is None:
            continue
        s = float(score)
        if s <= 20:
            buckets["0-20"] += 1
        elif s <= 40:
            buckets["21-40"] += 1
        elif s <= 60:
            buckets["41-60"] += 1
        elif s <= 80:
            buckets["61-80"] += 1
        else:
            buckets["81-100"] += 1

    return [
        ScoreDistributionItem(range=k, count=v) for k, v in buckets.items()
    ]


# ─────────────────────────────────────────────
# Chart: AI Recommendations
# ─────────────────────────────────────────────

@router.get("/ananya-ageis/charts/ai-recommendations", response_model=list[ChartItem])
def chart_ai_recommendations(db: Session = Depends(get_db)):
    rows = (
        db.query(AgentOutput.recommendation, func.count(AgentOutput.id))
        .group_by(AgentOutput.recommendation)
        .all()
    )
    return [
        ChartItem(label=label or "Unknown", value=float(count))
        for label, count in rows
    ]
