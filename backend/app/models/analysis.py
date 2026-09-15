from datetime import datetime, timezone
from typing import Any


def new_analysis_document(
    user_id: str,
    filename: str,
    file_type: str,
    status: str = "pending",
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    return {
        "user_id": user_id,
        "filename": filename,
        "file_type": file_type,
        "status": status,  # pending | processing | completed | failed
        "error_type": None,
        "root_cause": None,
        "severity": None,
        "confidence_score": None,
        "probable_file": None,
        "probable_function": None,
        "possible_reasons": [],
        "explanation": None,
        "step_by_step_fix": [],
        "best_practices": [],
        "improved_code": None,
        "alternative_solutions": [],
        "retrieved_context": [],
        "created_at": now,
        "updated_at": now,
    }


def analysis_doc_to_out(doc: dict[str, Any]) -> dict[str, Any]:
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    return out
