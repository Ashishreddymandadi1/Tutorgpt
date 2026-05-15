from fastapi import APIRouter, HTTPException
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from config import settings
from models.schemas import SummarizeRequest, SummarizeResponse
from services.chroma_service import get_or_create_collection

router = APIRouter()

SUMMARY_SYSTEM_PROMPT = """You are an expert academic summarizer. Given chunks from a study document, write a clear and concise summary.

Structure your summary as:
1. A 2-3 sentence overview of what the document covers
2. Key topics and concepts (as a short bullet list, max 6 bullets)
3. One sentence on why this material matters or how it connects to the subject

Keep the total summary under 250 words. Use plain text only — no markdown headers, no bold."""


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_document(request: SummarizeRequest) -> SummarizeResponse:
    if not settings.groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    try:
        collection = get_or_create_collection(request.course_id)
        total = collection.count()
        if total == 0:
            raise HTTPException(status_code=404, detail="No documents indexed for this course")

        # Fetch chunks belonging to this specific document
        results = collection.get(
            where={"doc_id": request.doc_id},
            include=["documents"],
        )
        docs = results.get("documents", [])

        # Fallback: if no doc-specific chunks, sample broadly
        if not docs:
            all_results = collection.get(limit=20, include=["documents"])
            docs = all_results.get("documents", [])

        if not docs:
            raise HTTPException(status_code=404, detail="No content found for this document")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ChromaDB error: {e}")

    # Use up to 25 chunks evenly spaced for good coverage
    step = max(1, len(docs) // 25)
    sampled = docs[::step][:25]
    context = "\n\n".join(f"[{i+1}] {chunk}" for i, chunk in enumerate(sampled))

    llm = ChatGroq(
        api_key=settings.groq_api_key,
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        max_tokens=512,
    )

    messages = [
        SystemMessage(content=SUMMARY_SYSTEM_PROMPT),
        HumanMessage(content=f"Document content:\n{context}\n\nWrite a summary of this document."),
    ]

    try:
        response = llm.invoke(messages)
        return SummarizeResponse(summary=response.content.strip())
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {e}")
