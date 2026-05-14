import os
from fastapi import APIRouter, HTTPException
from langchain_text_splitters import RecursiveCharacterTextSplitter

from models.schemas import IngestRequest, IngestResponse
from services.document_parser import parse_document
from services.chroma_service import get_or_create_collection, delete_doc_from_collection

router = APIRouter()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100,
    length_function=len,
)


@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(request: IngestRequest) -> IngestResponse:
    if not os.path.exists(request.file_path):
        raise HTTPException(status_code=404, detail=f"File not found: {request.file_path}")

    # Parse document into (page_num, text) pages
    pages = parse_document(request.file_path)
    if not pages:
        raise HTTPException(status_code=422, detail="Document contains no extractable text")

    page_count = len(pages)
    doc_name = os.path.basename(request.file_path)

    # Build chunks with page metadata
    chunks: list[str] = []
    metadatas: list[dict] = []
    ids: list[str] = []

    chunk_index = 0
    for page_num, page_text in pages:
        page_chunks = splitter.split_text(page_text)
        for chunk_text in page_chunks:
            chunks.append(chunk_text)
            metadatas.append({
                "doc_id": request.doc_id,
                "doc_name": doc_name,
                "page_num": page_num,
                "chunk_index": chunk_index,
                "course_id": request.course_id,
            })
            ids.append(f"{request.doc_id}_{chunk_index}")
            chunk_index += 1

    if not chunks:
        raise HTTPException(status_code=422, detail="No text chunks produced")

    # Remove any existing chunks for this doc (handles re-ingestion)
    delete_doc_from_collection(request.course_id, request.doc_id)

    # Upsert into ChromaDB (embedding happens here via embedding function)
    collection = get_or_create_collection(request.course_id)
    collection.add(documents=chunks, metadatas=metadatas, ids=ids)

    return IngestResponse(
        status="ok",
        page_count=page_count,
        message=f"Indexed {chunk_index} chunks from {page_count} pages",
    )


@router.delete("/course/{course_id}")
async def delete_course_data(course_id: int):
    from services.chroma_service import delete_course_collection
    delete_course_collection(course_id)
    return {"status": "ok"}
