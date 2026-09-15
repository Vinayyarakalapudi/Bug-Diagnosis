from pydantic import BaseModel


class TokenPayload(BaseModel):
    sub: str
    role: str | None = None
