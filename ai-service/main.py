from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ingest, query, quiz

app = FastAPI(title="TutorGPT AI Service", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router)
app.include_router(query.router)
app.include_router(quiz.router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ai-service",
        "version": "0.2.0",
    }
