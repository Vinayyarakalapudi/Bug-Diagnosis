from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.admin import AdminStats


class AdminService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_stats(self) -> AdminStats:
        total_users = await self.db["users"].count_documents({})
        total_analyses = await self.db["analyses"].count_documents({})
        total_documents = await self.db["documents"].count_documents({})

        popular_bug_types: dict[str, int] = {}
        analyses_by_status: dict[str, int] = {}

        async for d in self.db["analyses"].find({}, {"error_type": 1, "status": 1}):
            status_val = d.get("status", "unknown")
            analyses_by_status[status_val] = analyses_by_status.get(status_val, 0) + 1
            if status_val == "completed":
                et = d.get("error_type") or "Unknown"
                popular_bug_types[et] = popular_bug_types.get(et, 0) + 1

        return AdminStats(
            total_users=total_users,
            total_analyses=total_analyses,
            total_documents=total_documents,
            popular_bug_types=popular_bug_types,
            analyses_by_status=analyses_by_status,
        )
