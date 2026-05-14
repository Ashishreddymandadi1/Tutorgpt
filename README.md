# TutorGPT — Personalized AI Tutoring Platform

An AI tutoring web app where students upload course material and interact with an AI tutor that answers questions **only** from their uploaded content using RAG (Retrieval-Augmented Generation).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + TailwindCSS |
| Backend | Spring Boot 3.2 + Java 17 + JWT |
| AI Service | Python FastAPI + LangChain + ChromaDB |
| LLM | Groq API (Llama 3.3 70B) — free tier |
| Embeddings | sentence-transformers (local) |
| Databases | MySQL + MongoDB |

## Quick Start (local, no Docker)

### 1. AI Service
```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Project Structure

```
tutorgpt/
├── frontend/        React + Vite + TypeScript
├── backend/         Spring Boot API gateway
├── ai-service/      Python FastAPI + RAG
├── k8s/             Kubernetes manifests
└── .github/         CI/CD workflows
```

## Environment

Copy `.env.example` to `.env` and fill in your values. Never commit `.env`.
