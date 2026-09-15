from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.middlewares.auth_middleware import get_current_user
from app.schemas.chat import ChatMessageIn, ChatMessageOut, ChatResponse
from app.schemas.user import UserOut
from app.services.chat_service import ChatService

router = APIRouter(prefix="/api/chat", tags=["AI Chat Assistant"])


@router.post("", response_model=ChatResponse)
async def send_message(
    payload: ChatMessageIn,
    current_user: UserOut = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ChatService(db)
    reply = await service.send_message(
        user_id=current_user.id,
        message=payload.message,
        session_id=payload.session_id,
        analysis_id=payload.analysis_id,
    )
    return ChatResponse(session_id=reply.session_id, reply=reply)


@router.get("/sessions/{session_id}", response_model=list[ChatMessageOut])
async def get_session_history(
    session_id: str,
    current_user: UserOut = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ChatService(db)
    return await service.get_session_history(current_user.id, session_id)


@router.get("/sessions", response_model=list[str])
async def list_sessions(
    current_user: UserOut = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = ChatService(db)
    return await service.list_sessions(current_user.id)
