from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_text(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 150,
) -> list[str]:
    """Split raw text into overlapping chunks suitable for embedding."""
    if not text or not text.strip():
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_text(text)
    return [c.strip() for c in chunks if c.strip()]


def chunk_code(text: str, chunk_size: int = 1200, chunk_overlap: int = 100) -> list[str]:
    """Chunk source code, preferring to split on function/class boundaries first."""
    if not text or not text.strip():
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=[
            "\nclass ", "\ndef ", "\nfunction ", "\npublic ", "\nprivate ",
            "\n\n", "\n", " ", "",
        ],
    )
    chunks = splitter.split_text(text)
    return [c.strip() for c in chunks if c.strip()]
