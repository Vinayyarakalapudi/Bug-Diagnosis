from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.middlewares.auth_middleware import require_admin
from app.schemas.admin import AdminStats
from app.schemas.user import UserOut
from app.services.admin_service import AdminService

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    current_user: UserOut = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = AdminService(db)
    return await service.get_stats()
