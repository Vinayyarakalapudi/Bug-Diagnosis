import logging
import threading

from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)

_model: SentenceTransformer | None = None
_lock = threading.Lock()


def get_embedding_model() -> SentenceTransformer:
    """Lazily load and cache the sentence-transformers model (process-wide singleton)."""
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                logger.info("Loading embedding model: %s", settings.EMBEDDING_MODEL_NAME)
                _model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    model = get_embedding_model()
    embeddings = model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
    return embeddings.tolist()


def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]
