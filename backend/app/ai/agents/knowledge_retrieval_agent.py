import logging

from app.ai.state import DiagnosisState
from app.rag.vector_store import query_knowledge_base, query_similar_bugs

logger = logging.getLogger(__name__)


def run_knowledge_retrieval_agent(state: DiagnosisState) -> DiagnosisState:
    bug_category = state.get("bug_category", "")
    exception_message = state.get("exception_message", "")
    coding_mistakes = state.get("coding_mistakes", [])
    user_id = state.get("user_id")

    query_parts = [bug_category, exception_message] + coding_mistakes[:3]
    query_text = " ".join(p for p in query_parts if p and p != "N/A").strip()
    if not query_text:
        query_text = state.get("raw_content", "")[:300]

    try:
        knowledge_context = query_knowledge_base(query_text, top_k=4, user_id=user_id)
    except Exception:
        logger.exception("Knowledge base query failed")
        knowledge_context = []

    try:
        similar_bugs = query_similar_bugs(query_text, top_k=3)
    except Exception:
        logger.exception("Similar bug query failed")
        similar_bugs = []

    return {
        **state,
        "knowledge_context": knowledge_context,
        "similar_bugs": similar_bugs,
    }
