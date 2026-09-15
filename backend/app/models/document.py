from datetime import datetime, timezone
from typing import Any


def new_document_document(user_id: str, filename: str, file_type: str, chunk_count: int) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    return {
        "user_id": user_id,
        "filename": filename,
        "file_type": file_type,
        "chunk_count": chunk_count,
        "created_at": now,
    }


def document_doc_to_out(doc: dict[str, Any]) -> dict[str, Any]:
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    return out
