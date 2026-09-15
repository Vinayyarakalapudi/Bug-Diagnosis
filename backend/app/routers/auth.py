from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.middlewares.auth_middleware import get_current_user
from app.schemas.user import TokenResponse, UserLogin, UserOut, UserRegister
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = AuthService(db)
    return await service.register(payload)


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncIOMotorDatabase = Depends(get_database)):
    service = AuthService(db)
    return await service.login(payload)


@router.get("/me", response_model=UserOut)
async def get_me(current_user: UserOut = Depends(get_current_user)):
    return current_user
