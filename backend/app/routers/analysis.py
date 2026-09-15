from fastapi import APIRouter, Depends, File, UploadFile, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.middlewares.auth_middleware import get_current_user
from app.schemas.analysis import AnalysisOut, AnalysisSummary, DashboardStats
from app.schemas.user import UserOut
from app.services.analysis_service import AnalysisService

router = APIRouter(prefix="/api/analysis", tags=["Bug Diagnosis"])


@router.post("/upload", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
async def upload_and_analyze(
    file: UploadFile = File(...),
    current_user: UserOut = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Upload source code, a project zip, logs, a stack trace, or documentation and run the
    full 4-agent AI diagnosis pipeline against it."""
    service = AnalysisService(db)
    return await service.analyze_upload(file, current_user.id)


@router.get("/history", response_model=list[AnalysisSummary])
async def get_history(
    current_user: UserOut = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = AnalysisService(db)
    return await service.list_history(current_user.id)


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    current_user: UserOut = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = AnalysisService(db)
    return await service.get_dashboard_stats(current_user.id)


@router.get("/{analysis_id}", response_model=AnalysisOut)
async def get_analysis(
    analysis_id: str,
    current_user: UserOut = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = AnalysisService(db)
    return await service.get_analysis(analysis_id, current_user.id)
