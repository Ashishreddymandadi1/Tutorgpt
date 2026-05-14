from pydantic import BaseModel


class IngestRequest(BaseModel):
    course_id: int
    doc_id: int
    file_path: str


class IngestResponse(BaseModel):
    status: str
    page_count: int
    message: str = ""
