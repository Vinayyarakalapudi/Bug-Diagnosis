import uuid

from fastapi import HTTPException, UploadFile, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.document import document_doc_to_out, new_document_document
from app.rag.chunking import chunk_text
from app.rag.document_processor import extract_text
from app.rag.vector_store import add_knowledge_chunks
from app.schemas.document import DocumentOut
from app.utils.file_utils import validate_file_size, validate_upload_file


class DocumentService:
    KNOWLEDGE_EXTENSIONS = [".pdf", ".docx", ".md", ".txt"]

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.documents = db["documents"]

    async def ingest_document(self, file: UploadFile, user_id: str) -> DocumentOut:
        validate_upload_file(file, allowed_extensions=self.KNOWLEDGE_EXTENSIONS)
        file_bytes = await file.read()
        validate_file_size(len(file_bytes))

        text = extract_text(file.filename, file_bytes)
        if not text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract any readable text from this document.",
            )

        chunks = chunk_text(text)
        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Document produced no usable text chunks.",
            )

        document_id = str(uuid.uuid4())
        stored_count = add_knowledge_chunks(chunks, document_id=document_id, filename=file.filename, user_id=user_id)

        doc = new_document_document(
            user_id=user_id,
            filename=file.filename,
            file_type=file.filename.rsplit(".", 1)[-1].lower(),
            chunk_count=stored_count,
        )
        doc["_id"] = document_id
        await self.documents.insert_one(doc)

        return DocumentOut(**document_doc_to_out(doc))

    async def list_documents(self, user_id: str) -> list[DocumentOut]:
        cursor = self.documents.find({"user_id": user_id}).sort("created_at", -1)
        docs = await cursor.to_list(length=200)
        return [DocumentOut(**document_doc_to_out(d)) for d in docs]
