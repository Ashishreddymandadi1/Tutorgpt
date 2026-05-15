from pydantic import BaseModel


class IngestRequest(BaseModel):
    course_id: int
    doc_id: int
    file_path: str


class IngestResponse(BaseModel):
    status: str
    page_count: int
    message: str = ""


class QuizQuestionSchema(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str  # "A", "B", "C", or "D"
    explanation: str = ""


class GenerateQuizRequest(BaseModel):
    course_id: int
    num_questions: int = 5
    difficulty: str = "medium"


class GenerateQuizResponse(BaseModel):
    title: str
    questions: list[QuizQuestionSchema]


class FlashcardSchema(BaseModel):
    front: str
    back: str


class GenerateFlashcardsRequest(BaseModel):
    course_id: int
    num_cards: int = 10


class GenerateFlashcardsResponse(BaseModel):
    title: str
    cards: list[FlashcardSchema]


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
