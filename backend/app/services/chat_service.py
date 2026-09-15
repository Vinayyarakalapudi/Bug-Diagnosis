import logging
import uuid
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.ai.llm import chat as llm_chat
from app.models.chat import chat_doc_to_out, new_chat_message
from app.rag.vector_store import query_knowledge_base, query_similar_bugs
from app.schemas.chat import ChatMessageOut
from app.services.analysis_service import AnalysisService

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the AI assistant for an internal software bug-diagnosis platform. \
You help developers understand errors, tracebacks, and how to optimize their code. Answer \
using the provided context (retrieved documentation and related past bugs) when relevant. \
If the context doesn't cover the question, answer from general software engineering \
knowledge, but say so. Be concise, technical, and precise - written for a professional \
developer audience."""


class ChatService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.chats = db["chats"]
        self.analysis_service = AnalysisService(db)

    async def send_message(
        self,
        user_id: str,
        message: str,
        session_id: str | None,
        analysis_id: str | None,
    ) -> ChatMessageOut:
        session_id = session_id or str(uuid.uuid4())

        analysis_context = ""
        if analysis_id:
            try:
                analysis = await self.analysis_service.get_analysis(analysis_id, user_id)
                analysis_context = (
                    f"\n\nThe user is asking about a specific analyzed bug:\n"
                    f"- File: {analysis.filename}\n"
                    f"- Error type: {analysis.error_type}\n"
                    f"- Root cause: {analysis.root_cause}\n"
                    f"- Explanation: {analysis.explanation}\n"
                )
            except Exception:
                logger.warning("Could not load analysis %s for chat context", analysis_id)

        knowledge_results = query_knowledge_base(message, top_k=3, user_id=user_id)
        similar_bugs = query_similar_bugs(message, top_k=2)

        context_text = "\n---\n".join(r["content"][:500] for r in knowledge_results)
        similar_text = "\n---\n".join(b["content"][:300] for b in similar_bugs)

        user_prompt = f"""User question: {message}
{analysis_context}
Relevant knowledge base context:
{context_text or "None found."}

Related past bugs:
{similar_text or "None found."}
"""

        reply_text = llm_chat(SYSTEM_PROMPT, user_prompt)

        await self.chats.insert_one(
            new_chat_message(user_id, session_id, "user", message, analysis_id=analysis_id)
        )

        sources = [
            {"filename": r["metadata"].get("filename"), "similarity": r["similarity"]}
            for r in knowledge_results
        ]
        assistant_doc = new_chat_message(
            user_id, session_id, "assistant", reply_text, sources=sources, analysis_id=analysis_id
        )
        result = await self.chats.insert_one(assistant_doc)
        assistant_doc["_id"] = result.inserted_id

        return ChatMessageOut(**chat_doc_to_out(assistant_doc))

    async def get_session_history(self, user_id: str, session_id: str) -> list[ChatMessageOut]:
        cursor = self.chats.find({"user_id": user_id, "session_id": session_id}).sort("created_at", 1)
        docs = await cursor.to_list(length=500)
        return [ChatMessageOut(**chat_doc_to_out(d)) for d in docs]

    async def list_sessions(self, user_id: str) -> list[str]:
        session_ids = await self.chats.distinct("session_id", {"user_id": user_id})
        return session_ids
