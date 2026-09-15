from pydantic import BaseModel


class AdminStats(BaseModel):
    total_users: int
    total_analyses: int
    total_documents: int
    popular_bug_types: dict[str, int]
    analyses_by_status: dict[str, int]
