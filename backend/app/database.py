import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings

logger = logging.getLogger(__name__)


class MongoManager:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        self.client = AsyncIOMotorClient(settings.MONGO_URI)
        self.db = self.client[settings.MONGO_DB_NAME]
        # Fail fast if Mongo is unreachable
        await self.client.admin.command("ping")
        await self._ensure_indexes()
        logger.info("Connected to MongoDB at %s", settings.MONGO_URI)

    async def disconnect(self) -> None:
        if self.client is not None:
            self.client.close()
            logger.info("Disconnected from MongoDB")

    async def _ensure_indexes(self) -> None:
        assert self.db is not None
        await self.db["users"].create_index("email", unique=True)
        await self.db["analyses"].create_index("user_id")
        await self.db["analyses"].create_index("created_at")
        await self.db["documents"].create_index("user_id")
        await self.db["chats"].create_index("user_id")
        await self.db["chats"].create_index("session_id")

    def get_db(self) -> AsyncIOMotorDatabase:
        if self.db is None:
            raise RuntimeError("Database is not connected yet. Did startup run?")
        return self.db


mongo_manager = MongoManager()


def get_database() -> AsyncIOMotorDatabase:
    """FastAPI dependency for retrieving the active database handle."""
    return mongo_manager.get_db()
