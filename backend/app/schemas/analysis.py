from datetime import datetime

from pydantic import BaseModel


class AnalysisOut(BaseModel):
    id: str
    user_id: str
    filename: str
    file_type: str
    status: str
    error_type: str | None = None
    root_cause: str | None = None
    severity: str | None = None
    confidence_score: float | None = None
    probable_file: str | None = None
    probable_function: str | None = None
    possible_reasons: list[str] = []
    explanation: str | None = None
    step_by_step_fix: list[str] = []
    best_practices: list[str] = []
    improved_code: str | None = None
    alternative_solutions: list[str] = []
    created_at: datetime
    updated_at: datetime


class AnalysisSummary(BaseModel):
    id: str
    filename: str
    file_type: str
    status: str
    error_type: str | None = None
    severity: str | None = None
    confidence_score: float | None = None
    created_at: datetime


class DashboardStats(BaseModel):
    total_analyses: int
    total_uploaded_files: int
    analyses_this_week: int
    bug_type_breakdown: dict[str, int]
    severity_breakdown: dict[str, int]
    recent_analyses: list[AnalysisSummary]
