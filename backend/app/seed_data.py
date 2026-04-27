"""
seed_data.py — Creates the 'ananya' schema, drops all existing tables,
recreates them fresh from models, then loads data from CSV files in backend/csv/.

CSV files expected (inside backend/csv/):
    candidates.csv
    assessments.csv
    interviews.csv
    agent_outputs.csv
    final_decisions.csv

Usage:
    cd backend
    python -m app.seed_data
"""

import csv
from datetime import date, datetime, time
from pathlib import Path

from sqlalchemy import text

from app.database import Base, SessionLocal, engine
from app.models import (
    AgentOutput,
    Assessment,
    Candidate,
    FinalDecision,
    HRFeedback,
    Interview,
)

# ─────────────────────────────────────────────
# CSV folder: backend/csv/  (one level above app/)
# ─────────────────────────────────────────────
CSV_DIR = Path(__file__).resolve().parent.parent / "csv"


# ─────────────────────────────────────────────
# Type-conversion helpers
# ─────────────────────────────────────────────

def _str(val: str) -> str | None:
    v = val.strip()
    return v if v else None


def _int(val: str) -> int | None:
    v = val.strip()
    if not v:
        return None
    return int(float(v))


def _float(val: str) -> float | None:
    v = val.strip()
    if not v:
        return None
    return float(v)


def _bool(val: str) -> bool:
    return val.strip().lower() in ("true", "1", "yes")


def _date(val: str) -> date | None:
    v = val.strip()
    if not v:
        return None
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(v, fmt).date()
        except ValueError:
            continue
    return None


def _time(val: str) -> time | None:
    v = val.strip()
    if not v:
        return None
    for fmt in ("%H:%M:%S", "%H:%M"):
        try:
            return datetime.strptime(v, fmt).time()
        except ValueError:
            continue
    return None


def _datetime(val: str) -> datetime | None:
    v = val.strip()
    if not v:
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(v, fmt)
        except ValueError:
            continue
    return None


def _read_csv(filename: str) -> list[dict]:
    path = CSV_DIR / filename
    if not path.exists():
        raise FileNotFoundError(
            f"\n  CSV file not found: {path}"
            f"\n  Make sure '{filename}' is inside the backend/csv/ folder."
        )
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [row for row in reader]


# ─────────────────────────────────────────────
# Main seed function
# ─────────────────────────────────────────────

def seed():
    # ── STEP 1: Create schema + drop/recreate tables ────────────────────────
    print("=" * 55)
    print("STEP 1: Preparing 'ananya' schema and tables...")
    print("=" * 55)

    with engine.begin() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS ananya"))
        print("   Schema 'ananya' ensured.\n")

    Base.metadata.drop_all(bind=engine)
    print("   All existing tables dropped.\n")

    # ── STEP 2: Recreate tables under ananya schema ─────────────────────────
    print("STEP 2: Creating tables from models...")
    Base.metadata.create_all(bind=engine)
    print("   Tables created:")
    for table_name in Base.metadata.tables.keys():
        print(f"     - {table_name}")
    print()

    # ── STEP 3: Load CSV data ───────────────────────────────────────────────
    print("=" * 55)
    print("STEP 3: Loading CSV data into tables...")
    print("=" * 55 + "\n")

    db = SessionLocal()

    try:

        # ── 1. candidates.csv ───────────────────────────────────────────────
        print("Loading candidates.csv ...")
        cand_rows = _read_csv("candidates.csv")
        csv_id_to_db_id: dict[int, int] = {}

        for row in cand_rows:
            created_at = _datetime(row.get("created_at", ""))
            candidate = Candidate(
                full_name=row["full_name"].strip(),
                email=row["email"].strip(),
                phone=_str(row.get("phone", "")),
                role_applied=_str(row.get("role_applied", "")),
                department=_str(row.get("department", "")),
                experience_years=_float(row.get("experience_years", "0")) or 0,
            )
            if created_at:
                candidate.created_at = created_at
            db.add(candidate)

        db.flush()

        # Map CSV id -> actual inserted DB id (order preserved by flush)
        all_candidates = db.query(Candidate).order_by(Candidate.id).all()
        for csv_row, db_candidate in zip(cand_rows, all_candidates):
            csv_id_to_db_id[int(csv_row["id"])] = db_candidate.id

        db.commit()
        print(f"   {len(cand_rows)} candidates inserted.\n")

        # ── 2. assessments.csv ──────────────────────────────────────────────
        print("Loading assessments.csv ...")
        rows = _read_csv("assessments.csv")
        skipped = 0
        for row in rows:
            csv_cid = int(row["candidate_id"])
            db_cid = csv_id_to_db_id.get(csv_cid)
            if db_cid is None:
                skipped += 1
                continue
            submitted_at = _datetime(row.get("submitted_at", ""))
            obj = Assessment(
                candidate_id=db_cid,
                total_questions=_int(row.get("total_questions", "0")) or 0,
                attempted_questions=_int(row.get("attempted_questions", "0")) or 0,
                correct_answers=_int(row.get("correct_answers", "0")) or 0,
                wrong_answers=_int(row.get("wrong_answers", "0")) or 0,
                unanswered=_int(row.get("unanswered", "0")) or 0,
                mcq_score_percent=_float(row.get("mcq_score_percent", "")),
                coding_score_percent=_float(row.get("coding_score_percent", "")),
                logic_score_percent=_float(row.get("logic_score_percent", "")),
                resume_match_percent=_float(row.get("resume_match_percent", "")),
                jd_skill_match_percent=_float(row.get("jd_skill_match_percent", "")),
                time_taken_seconds=_int(row.get("time_taken_seconds", "")),
            )
            if submitted_at:
                obj.submitted_at = submitted_at
            db.add(obj)
        db.commit()
        print(f"   {len(rows) - skipped} assessments inserted. (skipped: {skipped})\n")

        # ── 3. interviews.csv ───────────────────────────────────────────────
        print("Loading interviews.csv ...")
        rows = _read_csv("interviews.csv")
        skipped = 0
        for row in rows:
            csv_cid = int(row["candidate_id"])
            db_cid = csv_id_to_db_id.get(csv_cid)
            if db_cid is None:
                skipped += 1
                continue
            created_at = _datetime(row.get("created_at", ""))
            obj = Interview(
                candidate_id=db_cid,
                round_no=_int(row.get("round_no", "1")) or 1,
                scheduled_date=_date(row.get("scheduled_date", "")),
                scheduled_time=_time(row.get("scheduled_time", "")),
                session_duration_minutes=_int(row.get("session_duration_minutes", "")),
                interview_mode=_str(row.get("interview_mode", "")),
                status=_str(row.get("status", "")),
                ai_score=_float(row.get("ai_score", "")),
                communication_score=_float(row.get("communication_score", "")),
                response_confidence_score=_float(row.get("response_confidence_score", "")),
                questions_answered=_int(row.get("questions_answered", "")),
                total_questions=_int(row.get("total_questions", "")),
                transcript_summary=_str(row.get("transcript_summary", "")),
            )
            if created_at:
                obj.created_at = created_at
            db.add(obj)
        db.commit()
        print(f"   {len(rows) - skipped} interviews inserted. (skipped: {skipped})\n")

        # ── 4. agent_outputs.csv ────────────────────────────────────────────
        print("Loading agent_outputs.csv ...")
        rows = _read_csv("agent_outputs.csv")
        skipped = 0
        for row in rows:
            csv_cid = int(row["candidate_id"])
            db_cid = csv_id_to_db_id.get(csv_cid)
            if db_cid is None:
                skipped += 1
                continue
            created_at = _datetime(row.get("created_at", ""))
            obj = AgentOutput(
                candidate_id=db_cid,
                recommendation=_str(row.get("recommendation", "")),
                recommendation_confidence_score=_float(
                    row.get("recommendation_confidence_score", "")
                ),
                strengths=_str(row.get("strengths", "")),
                concerns=_str(row.get("concerns", "")),
                summary=_str(row.get("summary", "")),
                next_step=_str(row.get("next_step", "")),
            )
            if created_at:
                obj.created_at = created_at
            db.add(obj)
        db.commit()
        print(f"   {len(rows) - skipped} agent outputs inserted. (skipped: {skipped})\n")

        # ── 5. final_decisions.csv ──────────────────────────────────────────
        print("Loading final_decisions.csv ...")
        rows = _read_csv("final_decisions.csv")
        skipped = 0
        for row in rows:
            csv_cid = int(row["candidate_id"])
            db_cid = csv_id_to_db_id.get(csv_cid)
            if db_cid is None:
                skipped += 1
                continue
            decided_at = _datetime(row.get("decided_at", ""))
            obj = FinalDecision(
                candidate_id=db_cid,
                final_decision=_str(row.get("final_decision", "")),
                human_final_decision=_bool(row.get("human_final_decision", "True")),
                decision_notes=_str(row.get("decision_notes", "")),
            )
            if decided_at:
                obj.decided_at = decided_at
            db.add(obj)
        db.commit()
        print(f"   {len(rows) - skipped} final decisions inserted. (skipped: {skipped})\n")

        print("=" * 55)
        print("Seed complete! All CSV data loaded into the database.")
        print("=" * 55)

    except FileNotFoundError as e:
        print(e)
        db.rollback()
    except Exception as exc:
        db.rollback()
        print(f"\nSeed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
