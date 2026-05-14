"""
Loads the sentence-transformers model once at startup and reuses it.
Uses ChromaDB's built-in SentenceTransformerEmbeddingFunction.
"""
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

_embedding_fn = None


def get_embedding_function() -> SentenceTransformerEmbeddingFunction:
    global _embedding_fn
    if _embedding_fn is None:
        _embedding_fn = SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
    return _embedding_fn
