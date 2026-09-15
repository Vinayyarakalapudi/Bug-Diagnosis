from datetime import datetime, timezone
from typing import Any


def new_user_document(full_name: str, email: str, hashed_password: str, role: str = "user") -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    return {
        "full_name": full_name,
        "email": email.lower(),
        "hashed_password": hashed_password,
        "role": role,
        "created_at": now,
        "updated_at": now,
    }


def user_doc_to_out(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "full_name": doc["full_name"],
        "email": doc["email"],
        "role": doc.get("role", "user"),
        "created_at": doc["created_at"],
    }
