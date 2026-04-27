from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routes import (
    agent,
    analytics,
    assessments,
    candidates,
    decisions,
    feedback,
    interviews,
)

# ─────────────────────────────────────────────
# Auto-create tables
# ─────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─────────────────────────────────────────────
# App init
# ─────────────────────────────────────────────
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-powered recruiter evaluation dashboard API",
    docs_url="/ananya-aegis/docs",
    redoc_url="/ananya-aegis/redoc",
    openapi_url="/ananya-aegis/openapi.json",
)

# ─────────────────────────────────────────────
# CORS — allow all origins
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Routers
# ─────────────────────────────────────────────
app.include_router(candidates.router)
app.include_router(assessments.router)
app.include_router(interviews.router)
app.include_router(agent.router)
app.include_router(decisions.router)
app.include_router(feedback.router)
app.include_router(analytics.router)


# ─────────────────────────────────────────────
# Root & Health  (works with or without prefix stripping)
# ─────────────────────────────────────────────
@app.get("/", tags=["Root"])
@app.get("/ananya-aegis", tags=["Root"])
@app.get("/ananya-aegis/", tags=["Root"])
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/ananya-aegis/docs",
        "health": "/ananya-aegis/health",
    }


@app.get("/health", tags=["Root"])
@app.get("/ananya-aegis/health", tags=["Root"])
def health():
    return {
        "status": "ok",
        "version": settings.VERSION,
        "env": settings.ENV,
    }
