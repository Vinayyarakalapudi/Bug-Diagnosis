from datetime import datetime

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    filename: str
    file_type: str
    chunk_count: int
    user_id: str
    created_at: datetime


class DocumentUploadResponse(BaseModel):
    document: DocumentOut
    message: str
