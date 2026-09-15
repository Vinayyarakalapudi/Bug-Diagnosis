from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Intelligent Bug Diagnosis Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Mongo
    MONGO_URI: str = "mongodb://mongo:27017"
    MONGO_DB_NAME: str = "bug_diagnosis_ai"

    # Admin bootstrap: comma-separated emails that are auto-promoted to admin on registration
    ADMIN_EMAILS: str = ""

    # JWT
    JWT_SECRET_KEY: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # File uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_UPLOAD_EXTENSIONS: str = (
        ".py,.java,.js,.ts,.jsx,.tsx,.zip,.log,.txt,.pdf,.docx,.md"
    )

    # RAG / Vector store
    CHROMA_PERSIST_DIR: str = "chroma_db"
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    KNOWLEDGE_BASE_DIR: str = "knowledge_base"

    # LLM providers
    LLM_PROVIDER: str = "groq"  # "groq" or "gemini"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def admin_emails_list(self) -> list[str]:
        return [e.strip().lower() for e in self.ADMIN_EMAILS.split(",") if e.strip()]

    @property
    def allowed_extensions_list(self) -> list[str]:
        return [ext.strip().lower() for ext in self.ALLOWED_UPLOAD_EXTENSIONS.split(",") if ext.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
