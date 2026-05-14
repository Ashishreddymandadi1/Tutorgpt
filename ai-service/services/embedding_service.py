"""
Uses ChromaDB's built-in DefaultEmbeddingFunction (all-MiniLM-L6-v2 via ONNX).
No torch required — works on Python 3.14+.
"""
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

_embedding_fn = None


def get_embedding_function() -> DefaultEmbeddingFunction:
    global _embedding_fn
    if _embedding_fn is None:
        _embedding_fn = DefaultEmbeddingFunction()
    return _embedding_fn
