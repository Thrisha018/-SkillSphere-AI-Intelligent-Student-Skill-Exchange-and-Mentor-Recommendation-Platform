import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Database
from app.routes import (
    auth_routes,
    user_routes,
    skill_routes,
    recommendation_routes,
    session_routes,
    feedback_routes,
    progress_routes
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skillsphere.main")

def auto_seed_if_empty():
    db = Database.get_db()
    if db.users.count_documents({}) == 0:
        logger.info("Database is empty. Auto-seeding initial student & mentor profiles...")
        try:
            from seed_data import seed_database
            seed_database()
        except Exception as e:
            logger.error(f"Auto-seeding failed: {str(e)}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect DB & Seed if empty
    logger.info("Initializing SkillSphere AI Database Connection...")
    Database.connect()
    auto_seed_if_empty()
    yield
    logger.info("SkillSphere AI Application shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="SkillSphere AI – Intelligent Student Skill Exchange & Mentor Recommendation Platform API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1
app.include_router(auth_routes.router, prefix=settings.API_V1_STR)
app.include_router(user_routes.router, prefix=settings.API_V1_STR)
app.include_router(skill_routes.router, prefix=settings.API_V1_STR)
app.include_router(recommendation_routes.router, prefix=settings.API_V1_STR)
app.include_router(session_routes.router, prefix=settings.API_V1_STR)
app.include_router(feedback_routes.router, prefix=settings.API_V1_STR)
app.include_router(progress_routes.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
def health_check():
    db = Database.get_db()
    user_count = db.users.count_documents({}) if db is not None else 0
    return {
        "status": "healthy",
        "database": "connected" if db is not None else "error",
        "is_mock_db": Database.is_mock,
        "total_users": user_count
    }
