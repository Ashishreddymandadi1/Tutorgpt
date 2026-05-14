from fastapi import APIRouter, HTTPException
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from config import settings
from models.schemas import QueryRequest, QueryResponse, Citation
from services.chroma_service import get_or_create_collection

router = APIRouter()

SYSTEM_PROMPT = """You are a helpful tutor assistant. Answer the student's question using ONLY the context provided below.
If the context does not contain enough information to answer, say so clearly.
Be concise, accurate, and educational. Format your response in plain text."""


@router.post("/query", response_model=QueryResponse)
async def query_course(request: QueryRequest) -> QueryResponse:
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if not settings.groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    # Retrieve relevant chunks from ChromaDB
    try:
        collection = get_or_create_collection(request.course_id)
        count = collection.count()
        if count == 0:
            raise HTTPException(status_code=404, detail="No documents indexed for this course yet")

        n_results = min(request.top_k, count)
        results = collection.query(
            query_texts=[request.question],
            n_results=n_results,
            include=["documents", "metadatas"],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ChromaDB query failed: {e}")

    docs = results["documents"][0] if results["documents"] else []
    metas = results["metadatas"][0] if results["metadatas"] else []

    if not docs:
        raise HTTPException(status_code=404, detail="No relevant content found")

    # Build context block
    context_parts = []
    for i, (chunk, meta) in enumerate(zip(docs, metas), 1):
        context_parts.append(f"[{i}] (Source: {meta.get('doc_name', '?')}, page {meta.get('page_num', '?')})\n{chunk}")
    context = "\n\n".join(context_parts)

    # Call Groq LLM
    llm = ChatGroq(
        api_key=settings.groq_api_key,
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        max_tokens=1024,
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Context:\n{context}\n\nQuestion: {request.question}"),
    ]

    try:
        response = llm.invoke(messages)
        answer = response.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {e}")

    # Build citations (deduplicated by doc+page)
    seen: set[tuple] = set()
    citations: list[Citation] = []
    for meta in metas:
        key = (meta.get("doc_name", ""), meta.get("page_num", 0))
        if key not in seen:
            seen.add(key)
            citations.append(Citation(
                doc_name=meta.get("doc_name", ""),
                page_num=meta.get("page_num", 0),
                chunk_index=meta.get("chunk_index", 0),
            ))

    return QueryResponse(answer=answer, citations=citations)
