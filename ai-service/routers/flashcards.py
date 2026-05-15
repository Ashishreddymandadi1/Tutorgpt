import json
import random
from fastapi import APIRouter, HTTPException
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from config import settings
from models.schemas import GenerateFlashcardsRequest, GenerateFlashcardsResponse, FlashcardSchema
from services.chroma_service import get_or_create_collection

router = APIRouter()

FLASHCARD_SYSTEM_PROMPT = """You are a flashcard generator for students. Given study material, extract key terms, concepts, formulas, and definitions.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "title": "Deck title based on the content",
  "cards": [
    {
      "front": "Term or concept (keep it short, under 100 chars)",
      "back": "Definition or explanation (1-3 sentences, clear and precise)"
    }
  ]
}

Rules:
- Each card must cover a distinct concept — no duplicates
- Front: a term, question, or formula. Keep it concise.
- Back: a clear, complete explanation the student can learn from
- Focus on the most important concepts in the material"""


@router.post("/generate-flashcards", response_model=GenerateFlashcardsResponse)
async def generate_flashcards(request: GenerateFlashcardsRequest) -> GenerateFlashcardsResponse:
    if not settings.groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    num_cards = max(5, min(request.num_cards, 20))

    try:
        collection = get_or_create_collection(request.course_id)
        total = collection.count()
        if total == 0:
            raise HTTPException(status_code=404, detail="No documents indexed for this course")

        fetch_n = min(total, 40)
        all_results = collection.get(limit=fetch_n, include=["documents"])
        docs = all_results.get("documents", [])
        if not docs:
            raise HTTPException(status_code=404, detail="No content found")

        sample_size = min(len(docs), num_cards * 2)
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
        temperature=0.3,
        max_tokens=4096,
    )

    messages = [
        SystemMessage(content=FLASHCARD_SYSTEM_PROMPT),
        HumanMessage(
            content=f"Study material:\n{context}\n\n"
                    f"Generate exactly {num_cards} flashcards covering the most important concepts."
        ),
    ]

    try:
        response = llm.invoke(messages)
        raw = response.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"LLM returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM call failed: {e}")

    cards_raw = data.get("cards", [])
    if not cards_raw:
        raise HTTPException(status_code=502, detail="LLM returned no flashcards")

    cards = [
        FlashcardSchema(
            front=c.get("front", "").strip(),
            back=c.get("back", "").strip(),
        )
        for c in cards_raw[:num_cards]
        if c.get("front") and c.get("back")
    ]

    return GenerateFlashcardsResponse(
        title=data.get("title", "Flashcard Deck"),
        cards=cards,
    )
