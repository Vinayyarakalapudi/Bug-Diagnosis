import logging
import uuid

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import settings
from app.rag.embeddings import embed_query, embed_texts

logger = logging.getLogger(__name__)

KNOWLEDGE_COLLECTION = "knowledge_base"
BUG_HISTORY_COLLECTION = "bug_history"

_client: chromadb.ClientAPI | None = None


def get_chroma_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _client


def _get_collection(name: str):
    client = get_chroma_client()
    return client.get_or_create_collection(name=name, metadata={"hnsw:space": "cosine"})


def add_knowledge_chunks(
    chunks: list[str],
    document_id: str,
    filename: str,
    user_id: str,
) -> int:
    """Embed and store knowledge-base document chunks. Returns number of chunks stored."""
    if not chunks:
        return 0

    collection = _get_collection(KNOWLEDGE_COLLECTION)
    embeddings = embed_texts(chunks)
    ids = [f"{document_id}-{i}-{uuid.uuid4().hex[:8]}" for i in range(len(chunks))]
    metadatas = [
        {"document_id": document_id, "filename": filename, "user_id": user_id, "chunk_index": i}
        for i in range(len(chunks))
    ]
    collection.add(ids=ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)
    return len(chunks)


def query_knowledge_base(query_text: str, top_k: int = 4, user_id: str | None = None) -> list[dict]:
    collection = _get_collection(KNOWLEDGE_COLLECTION)
    if collection.count() == 0:
        return []

    where = {"user_id": user_id} if user_id else None
    results = collection.query(
        query_embeddings=[embed_query(query_text)],
        n_results=min(top_k, max(collection.count(), 1)),
        where=where,
    )
    return _format_results(results)


def add_bug_record(
    analysis_id: str,
    summary_text: str,
    error_type: str | None,
    root_cause: str | None,
    user_id: str,
) -> None:
    """Store a completed analysis summary so future similar bugs can be retrieved."""
    collection = _get_collection(BUG_HISTORY_COLLECTION)
    embedding = embed_query(summary_text)
    collection.add(
        ids=[analysis_id],
        embeddings=[embedding],
        documents=[summary_text],
        metadatas=[{
            "analysis_id": analysis_id,
            "error_type": error_type or "unknown",
            "root_cause": (root_cause or "")[:500],
            "user_id": user_id,
        }],
    )


def query_similar_bugs(query_text: str, top_k: int = 3, exclude_id: str | None = None) -> list[dict]:
    collection = _get_collection(BUG_HISTORY_COLLECTION)
    if collection.count() == 0:
        return []

    results = collection.query(
        query_embeddings=[embed_query(query_text)],
        n_results=min(top_k + 1, collection.count()),
    )
    formatted = _format_results(results)
    if exclude_id:
        formatted = [r for r in formatted if r["metadata"].get("analysis_id") != exclude_id]
    return formatted[:top_k]


def _format_results(results: dict) -> list[dict]:
    formatted: list[dict] = []
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0] if results.get("distances") else [None] * len(documents)

    for doc, meta, dist in zip(documents, metadatas, distances):
        formatted.append({
            "content": doc,
            "metadata": meta,
            "similarity": round(1 - dist, 4) if dist is not None else None,
        })
    return formatted
