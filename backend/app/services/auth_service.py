from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app.models.user import new_user_document, user_doc_to_out
from app.schemas.user import TokenResponse, UserLogin, UserOut, UserRegister
from app.utils.security import create_access_token, hash_password, verify_password


class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.users = db["users"]

    async def register(self, payload: UserRegister) -> TokenResponse:
        existing = await self.users.find_one({"email": payload.email.lower()})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        role = "admin" if payload.email.lower() in settings.admin_emails_list else "user"
        doc = new_user_document(
            full_name=payload.full_name,
            email=payload.email,
            hashed_password=hash_password(payload.password),
            role=role,
        )
        result = await self.users.insert_one(doc)
        doc["_id"] = result.inserted_id

        return self._issue_token(doc)

    async def login(self, payload: UserLogin) -> TokenResponse:
        doc = await self.users.find_one({"email": payload.email.lower()})
        if not doc or not verify_password(payload.password, doc["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )
        return self._issue_token(doc)

    async def get_user_by_id(self, user_id: str) -> UserOut | None:
        try:
            oid = ObjectId(user_id)
        except Exception:
            return None
        doc = await self.users.find_one({"_id": oid})
        if not doc:
            return None
        return UserOut(**user_doc_to_out(doc))

    def _issue_token(self, doc: dict) -> TokenResponse:
        user_out = UserOut(**user_doc_to_out(doc))
        token = create_access_token(subject=str(doc["_id"]), extra_claims={"role": doc.get("role", "user")})
        return TokenResponse(access_token=token, user=user_out)
