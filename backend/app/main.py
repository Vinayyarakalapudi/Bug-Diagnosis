import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import mongo_manager
from app.middlewares.error_handler import register_error_handlers
from app.routers import admin, analysis, auth, chat, documents, health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s (%s)", settings.APP_NAME, settings.ENVIRONMENT)
    await mongo_manager.connect()
    yield
    await mongo_manager.disconnect()


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered bug diagnosis, RAG knowledge base, and fix recommendation platform.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(analysis.router)
app.include_router(chat.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {
        "success": True,
        "message": f"{settings.APP_NAME} API is running.",
        "docs": "/docs",
    }
