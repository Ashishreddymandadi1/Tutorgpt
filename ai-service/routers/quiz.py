import json
import random
from fastapi import APIRouter, HTTPException
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from config import settings
from models.schemas import GenerateQuizRequest, GenerateQuizResponse, QuizQuestionSchema
from services.chroma_service import get_or_create_collection

router = APIRouter()

QUIZ_SYSTEM_PROMPT = """You are a quiz generator. Given study material, create multiple-choice questions.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "title": "Quiz title based on the content",
  "questions": [
    {
      "question_text": "Question here?",
      "option_a": "First option",
      "option_b": "Second option",
      "option_c": "Third option",
      "option_d": "Fourth option",
      "correct_option": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Rules:
- correct_option must be exactly "A", "B", "C", or "D"
- Make distractors plausible but clearly wrong
- Questions must be answerable from the provided context only
- Difficulty: {difficulty}"""


@router.post("/generate-quiz", response_model=GenerateQuizResponse)
async def generate_quiz(request: GenerateQuizRequest) -> GenerateQuizResponse:
    if not settings.groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    num_q = max(1, min(request.num_questions, 15))

    # Sample a diverse set of chunks from ChromaDB
    try:
        collection = get_or_create_collection(request.course_id)
        total = collection.count()
        if total == 0:
            raise HTTPException(status_code=404, detail="No documents indexed for this course")

        # Fetch up to 30 chunks and randomly sample to get diverse coverage
        fetch_n = min(total, 30)
        all_results = collection.get(
            limit=fetch_n,
            include=["documents"],
        )
        docs = all_results.get("documents", [])
        if not docs:
            raise HTTPException(status_code=404, detail="No content found")

        # Pick a diverse subset for context (spread evenly)
        sample_size = min(len(docs), num_q * 3)
        step = max(1, len(docs) // sample_size)
        sampled = docs[::step][:sample_size]
        random.shuffle(sampled)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ChromaDB error: {e}")

    context = "\n\n".join(f"[{i+1}] {chunk}" for i, chunk in enumerate(sampled))

    llm = ChatGroq(
        api_key=settings.groq_api_key,
        model="llama-3.3-70b-versatile",
        temperature=0.4,
        max_tokens=4096,
    )

    system_content = QUIZ_SYSTEM_PROMPT.replace("{difficulty}", request.difficulty)
    messages = [
        SystemMessage(content=system_content),
        HumanMessage(
            content=f"Study material:\n{context}\n\n"
                    f"Generate exactly {num_q} multiple-choice questions based on this material."
        ),
    ]

    try:
        response = llm.invoke(messages)
        raw = response.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"LLM returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {e}")

    questions_raw = data.get("questions", [])
    if not questions_raw:
        raise HTTPException(status_code=502, detail="LLM returned no questions")

    questions = []
    for q in questions_raw[:num_q]:
        correct = str(q.get("correct_option", "A")).upper().strip()
        if correct not in ("A", "B", "C", "D"):
            correct = "A"
        questions.append(QuizQuestionSchema(
            question_text=q.get("question_text", ""),
            option_a=q.get("option_a", ""),
            option_b=q.get("option_b", ""),
            option_c=q.get("option_c", ""),
            option_d=q.get("option_d", ""),
            correct_option=correct,
            explanation=q.get("explanation", ""),
        ))

    return GenerateQuizResponse(
        title=data.get("title", "Course Quiz"),
        questions=questions,
    )
