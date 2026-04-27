# Recruiter-AI Backend

Production-grade FastAPI backend for the AI-powered recruiter evaluation dashboard.

---

## Tech Stack

| Layer       | Tech                          |
|-------------|-------------------------------|
| Framework   | FastAPI                       |
| Database    | PostgreSQL (Aiven Cloud)      |
| ORM         | SQLAlchemy 2.x                |
| Validation  | Pydantic v2                   |
| Server      | Uvicorn                       |
| Env Config  | python-dotenv / pydantic-settings |

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           ← FastAPI app, CORS, router registration
│   ├── config.py         ← Settings from .env
│   ├── database.py       ← SQLAlchemy engine + session
│   ├── models.py         ← ORM table definitions
│   ├── schemas.py        ← Pydantic request/response models
│   ├── seed_data.py      ← 500 candidate seed script
│   └── routes/
│       ├── candidates.py
│       ├── assessments.py
│       ├── interviews.py
│       ├── agent.py
│       ├── decisions.py
│       ├── feedback.py
│       └── analytics.py
├── requirements.txt
├── .env
├── .env.example
└── README.md
```

---

## Installation

### 1. Clone / navigate to the backend directory

```bash
cd backend
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Linux / macOS
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Setup

Copy the example env file and configure it:

```bash
cp .env.example .env
```

Your `.env` must contain:

```
DB_CON_STR=dbname=defaultdb user=avnadmin password=PASSWORD host=HOST port=PORT sslmode=require
PROJECT_NAME=Recruiter-AI Backend
VERSION=1.0.0
ENV=production
PORT=5000
```

> `DB_CON_STR` should be your Aiven PostgreSQL connection string. The backend accepts Aiven's standard **libpq connection string** format and converts it to a SQLAlchemy URL. It also accepts `postgres://...`, `postgresql://...`, or `postgresql+psycopg://...` URLs.

---

## Connecting to Aiven PostgreSQL

Aiven provides a SSL-required PostgreSQL connection. The connection string above handles this via `sslmode=require`.

No additional SSL certificate download is needed when using `psycopg` (v3) — it uses the system certificate store.

If you encounter SSL errors, download the CA cert from Aiven dashboard and add:

```
?sslmode=verify-full&sslrootcert=/path/to/ca.pem
```

---

## Database Initialization

Tables are **auto-created in Aiven PostgreSQL** when the app starts via:

```python
Base.metadata.create_all(bind=engine)
```

No local SQLite fallback is used. If `DB_CON_STR` is missing, the backend stops with a clear error.

---

## Seeding Data (500 Candidates)

```bash
cd backend
python -m app.seed_data
```

If Aiven already has recruiter data, the command stops without overwriting it. To intentionally drop and reload the recruiter tables from CSV:

```bash
python -m app.seed_data --reset
```

This inserts:
- 500 candidates with realistic names, emails, roles
- 500 assessments (linked)
- ~425 interview records (1–3 rounds per candidate)
- ~450 agent outputs
- ~440 final decisions
- ~350 HR feedback entries

---

## Running the Server

```bash
uvicorn app.main:app --host 127.0.0.1 --port 5000
```

For development with auto-reload:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 5000 --reload
```

---

## API Documentation

Once running, open in your browser:

| Interface   | URL                            |
|-------------|-------------------------------|
| Swagger UI  | http://127.0.0.1:5000/docs    |
| ReDoc       | http://127.0.0.1:5000/redoc   |
| Health      | http://127.0.0.1:5000/health  |

---

## API Endpoints Reference

### Root

| Method | Path      | Description        |
|--------|-----------|--------------------|
| GET    | `/`       | Project info       |
| GET    | `/health` | Health check       |

### Candidates

| Method | Path                    | Description           |
|--------|-------------------------|-----------------------|
| GET    | `/api/candidates`       | List all candidates   |
| GET    | `/api/candidates/{id}`  | Get candidate by ID   |
| POST   | `/api/candidates`       | Create candidate      |
| PUT    | `/api/candidates/{id}`  | Update candidate      |
| DELETE | `/api/candidates/{id}`  | Delete candidate      |

### Assessments

| Method | Path                              | Description                     |
|--------|-----------------------------------|---------------------------------|
| GET    | `/api/assessments`                | List all assessments            |
| GET    | `/api/assessments/{candidate_id}` | Get assessment by candidate ID  |

### Interviews

| Method | Path                           | Description               |
|--------|--------------------------------|---------------------------|
| GET    | `/api/interviews`              | List all interviews       |
| GET    | `/api/interviews/scheduled`    | Scheduled interviews      |
| GET    | `/api/interviews/completed`    | Completed interviews      |
| GET    | `/api/interviews/in-progress`  | In-progress interviews    |
| GET    | `/api/interviews/escalated`    | Escalated interviews      |

### Agent Output

| Method | Path                            | Description                      |
|--------|---------------------------------|----------------------------------|
| GET    | `/api/agent-output`             | List all agent outputs           |
| GET    | `/api/agent-output/{candidate_id}` | Get agent output by candidate |

### Final Decisions

| Method | Path                               | Description                    |
|--------|------------------------------------|--------------------------------|
| GET    | `/api/final-decisions`             | List all decisions             |
| GET    | `/api/final-decisions/selected`    | Selected candidates            |
| GET    | `/api/final-decisions/rejected`    | Rejected candidates            |
| GET    | `/api/final-decisions/hold`        | On-hold candidates             |
| GET    | `/api/final-decisions/escalated`   | Escalated candidates           |
| PUT    | `/api/final-decisions/{candidate_id}` | Update/set final decision   |

### HR Feedback

| Method | Path               | Description          |
|--------|--------------------|----------------------|
| GET    | `/api/hr-feedback` | List all feedback    |
| POST   | `/api/hr-feedback` | Submit HR feedback   |

### Analytics & Charts

| Method | Path                           | Description              |
|--------|--------------------------------|--------------------------|
| GET    | `/api/dashboard/summary`       | KPI summary              |
| GET    | `/api/charts/decision-pie`     | Decision distribution    |
| GET    | `/api/charts/interview-status` | Interview status counts  |
| GET    | `/api/charts/department-bar`   | Candidates per dept      |
| GET    | `/api/charts/weekly-trend`     | Weekly candidate inflow  |
| GET    | `/api/charts/score-distribution` | MCQ score buckets      |
| GET    | `/api/charts/ai-recommendations` | AI recommendation split |

---

## CORS

All origins are allowed globally:

```python
allow_origins=["*"]
allow_methods=["*"]
allow_headers=["*"]
```

---

## Notes

- No authentication required — recruiter-only dashboard
- All timestamps stored in UTC
- Backend examples use port **5000**; set `VITE_API_BASE_URL` in the frontend if you deploy FastAPI on another port
