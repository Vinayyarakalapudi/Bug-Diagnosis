from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check(db: AsyncIOMotorDatabase = Depends(get_database)):
    await db.command("ping")
    return {"success": True, "status": "ok", "database": "connected"}
