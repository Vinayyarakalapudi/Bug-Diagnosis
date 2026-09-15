from fastapi import APIRouter, Depends, File, UploadFile, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.middlewares.auth_middleware import get_current_user
from app.schemas.document import DocumentOut, DocumentUploadResponse
from app.schemas.user import UserOut
from app.services.document_service import DocumentService

router = APIRouter(prefix="/api/documents", tags=["Knowledge Base"])


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: UserOut = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = DocumentService(db)
    document = await service.ingest_document(file, current_user.id)
    return DocumentUploadResponse(
        document=document,
        message=f"Document ingested successfully into the knowledge base ({document.chunk_count} chunks).",
    )


@router.get("", response_model=list[DocumentOut])
async def list_documents(
    current_user: UserOut = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = DocumentService(db)
    return await service.list_documents(current_user.id)
