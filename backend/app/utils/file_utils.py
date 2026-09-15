from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config import settings


def validate_upload_file(file: UploadFile, allowed_extensions: list[str] | None = None) -> str:
    """Validate filename/extension and return the lowercase extension."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File has no filename.")

    ext = Path(file.filename).suffix.lower()
    allowed = allowed_extensions or settings.allowed_extensions_list
    if ext not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' is not allowed. Allowed types: {', '.join(allowed)}",
        )
    return ext


def validate_file_size(size_bytes: int) -> None:
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds the {settings.MAX_UPLOAD_SIZE_MB}MB upload limit.",
        )


def classify_file_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    code_exts = {".py", ".java", ".js", ".ts", ".jsx", ".tsx"}
    if ext in code_exts:
        return "code"
    if ext == ".log":
        return "log"
    if ext == ".zip":
        return "project"
    if ext in {".pdf", ".docx", ".md"}:
        return "documentation"
    if ext == ".txt":
        return "stacktrace"
    return "unknown"
