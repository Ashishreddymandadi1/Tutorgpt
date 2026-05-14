"""
ChromaDB client — embedded PersistentClient, no separate server needed.
"""
import chromadb
from chromadb.api.models.Collection import Collection
from services.embedding_service import get_embedding_function

_client = None


def get_client() -> chromadb.PersistentClient:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path="./chroma_data")
    return _client


def get_or_create_collection(course_id: int) -> Collection:
    return get_client().get_or_create_collection(
        name=f"course_{course_id}",
        embedding_function=get_embedding_function(),
        metadata={"hnsw:space": "cosine"},
    )


def delete_course_collection(course_id: int) -> None:
    client = get_client()
    try:
        client.delete_collection(name=f"course_{course_id}")
    except Exception:
        pass


def delete_doc_from_collection(course_id: int, doc_id: int) -> None:
    collection = get_or_create_collection(course_id)
    collection.delete(where={"doc_id": doc_id})
