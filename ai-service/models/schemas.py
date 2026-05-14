from pydantic import BaseModel


class IngestRequest(BaseModel):
    course_id: int
    doc_id: int
    file_path: str


class IngestResponse(BaseModel):
    status: str
    page_count: int
    message: str = ""


class QueryRequest(BaseModel):
    course_id: int
    question: str
    top_k: int = 5


class Citation(BaseModel):
    doc_name: str
    page_num: int
    chunk_index: int


class QueryResponse(BaseModel):
    answer: str
    citations: list[Citation] = []
