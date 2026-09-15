from datetime import datetime

from pydantic import BaseModel, Field


class ChatMessageIn(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    session_id: str | None = None
    analysis_id: str | None = None


class ChatMessageOut(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    sources: list[dict] = []
    created_at: datetime


class ChatResponse(BaseModel):
    session_id: str
    reply: ChatMessageOut
