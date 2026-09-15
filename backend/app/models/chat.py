from datetime import datetime, timezone
from typing import Any


def new_chat_message(
    user_id: str,
    session_id: str,
    role: str,
    content: str,
    sources: list[dict] | None = None,
    analysis_id: str | None = None,
) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "session_id": session_id,
        "role": role,  # "user" | "assistant"
        "content": content,
        "sources": sources or [],
        "analysis_id": analysis_id,
        "created_at": datetime.now(timezone.utc),
    }


def chat_doc_to_out(doc: dict[str, Any]) -> dict[str, Any]:
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    return out
