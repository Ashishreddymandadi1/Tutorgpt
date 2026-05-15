# TutorGPT — AI-Powered Personalized Tutoring Platform

> Upload your study material. Chat with it. Get quizzed on it. Master it.

TutorGPT is a full-stack AI tutoring web application that lets students upload course documents and interact with an intelligent tutor that answers questions **exclusively from their own content** using Retrieval-Augmented Generation (RAG). No hallucinations — every answer is grounded in what you uploaded.

---

## Features

| Feature | Description |
|---|---|
| **RAG Chat** | Ask questions about your documents and get cited answers sourced from your content |
| **AI Quizzes** | Auto-generate multiple-choice quizzes from any document with explanations |
| **AI Flashcards** | Generate term/definition flashcard decks with flip animation and progress tracking |
| **Document Summaries** | One-click AI summary of any uploaded document, shown inline |
| **Dashboard** | Overview of courses, documents, and quizzes taken |
| **Settings** | Update display name and change password |
| **Space UI** | Live animated neural network canvas background across all pages |

---

## Tech Stack

### Frontend
| Technology | Role |
|---|---|
| React 18 + Vite + TypeScript | UI framework and build tool |
| TailwindCSS v4 | Utility-first styling with `@theme` token remapping |
| shadcn/ui | Accessible component primitives |
| React Router v6 | Client-side routing with protected routes |
| TanStack Query (React Query) | Server state, caching, mutations |
| Zustand | Auth state + localStorage persistence |
| Axios | HTTP client with JWT interceptor |
| HTML5 Canvas | Live neural network space animation |

### Backend
| Technology | Role |
|---|---|
| Spring Boot 3.2 + Java 17 | REST API gateway |
| Spring Security + JWT (jjwt 0.12.6) | Stateless authentication |
| H2 File-based Database | Embedded SQL database (no install needed) |
| Flyway | Database schema migrations (V1–V6) |
| Spring `@Async` | Non-blocking document ingest pipeline |
| WebClient | Internal calls to the AI service |

### AI Service
| Technology | Role |
|---|---|
| Python FastAPI | AI microservice API |
| ChromaDB (embedded) | Vector store for document embeddings |
| ONNX all-MiniLM-L6-v2 | Local sentence embeddings (no API key needed) |
| LangChain `RecursiveCharacterTextSplitter` | Document chunking |
| Groq API — Llama 3.3 70B | LLM inference (free tier) |
| PyMuPDF / python-docx | PDF and DOCX parsing |

---

## Architecture & Workflow

```
Browser (React)
      │
      │  REST + JWT
      ▼
Spring Boot (port 8080)
      │                    ┌──────────────────────────┐
      │  WebClient         │   Python FastAPI          │
      ├──────────────────► │   (port 8000)             │
      │                    │                           │
      │                    │  ┌─────────┐  ┌────────┐  │
      │                    │  │ChromaDB │  │ Groq   │  │
      │                    │  │(vectors)│  │  LLM   │  │
      │                    │  └─────────┘  └────────┘  │
      │                    └──────────────────────────┘
      │
      ▼
   H2 Database (file-based)
```

### How a user session works

1. **Sign up / Log in** — Spring Boot issues a JWT stored in `localStorage`
2. **Create a course** — logical container for documents and study tools
3. **Upload a document** — PDF or DOCX is saved to disk, then asynchronously chunked and embedded into ChromaDB by the AI service
4. **Chat** — user asks a question → Spring Boot forwards to FastAPI → ChromaDB retrieves the top-k relevant chunks → Groq LLM generates a grounded answer with source citations → displayed in the chat panel
5. **Generate a quiz** — the document's chunks are sent to Groq with a structured prompt → 10 MCQ questions with options and explanations are returned and stored in H2
6. **Generate flashcards** — same flow produces term/definition pairs stored as a deck in H2
7. **Summarize** — document chunks sent to Groq for a structured summary, stored per-document and shown inline

### Document ingest pipeline

```
Upload (multipart)
   │
   ▼
Spring Boot saves file to disk
   │
   ▼  (@Async — non-blocking)
POST /ingest → FastAPI
   │
   ├─ Parse (PDF → PyMuPDF, DOCX → python-docx)
   ├─ Chunk (RecursiveCharacterTextSplitter, 800 chars / 150 overlap)
   ├─ Embed (ONNX all-MiniLM-L6-v2, runs locally)
   └─ Store in ChromaDB (collection per document)
   
Document status: PROCESSING → READY
```

---

## Project Structure

```
tutorgpt/
├── frontend/
│   ├── src/
│   │   ├── components/       Navbar, NeuralBackground, TutorGPTLogo, UploadZone, ui/
│   │   ├── pages/            Dashboard, Courses, Course, Quiz, Flashcards, Settings, Login, Signup
│   │   ├── services/         Axios API client with JWT interceptor
│   │   └── store/            Zustand auth store
│   └── vite.config.ts        Proxy: /api → :8080
│
├── backend/
│   └── src/main/
│       ├── java/com/tutorgpt/
│       │   ├── controller/   Auth, Course, Document, Quiz, Deck, Profile, Stats
│       │   ├── service/      Ingest, Quiz, Flashcard, Summary, AI gateway
│       │   ├── entity/       JPA entities
│       │   └── security/     JWT filter + config
│       └── resources/
│           └── db/migration/ Flyway V1–V6 SQL scripts
│
└── ai-service/
    ├── main.py               FastAPI app with all routers
    └── routers/
        ├── ingest.py         POST /ingest
        ├── query.py          POST /query
        ├── quiz.py           POST /generate-quiz
        ├── flashcards.py     POST /generate-flashcards
        └── summarize.py      POST /summarize
```

---

## Getting Started

> No Docker required. Run three services in separate terminals.

### Prerequisites
- Node.js 18+
- Java 17+
- Python 3.11 (not 3.12+ — required for ONNX/numpy compatibility)
- A free [Groq API key](https://console.groq.com)

### 1. AI Service
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

Create `ai-service/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

```bash
uvicorn main:app --reload --port 8000
```

### 2. Backend
```bash
cd backend
./mvnw spring-boot:run         # Linux/macOS
mvnw.cmd spring-boot:run       # Windows
```

Starts on `http://localhost:8080`. H2 database auto-created at `backend/data/tutorgpt.mv.db`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

> Start order: AI Service → Backend → Frontend

---

## API Overview

### Spring Boot (port 8080)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET/POST | `/api/courses` | List / create courses |
| DELETE | `/api/courses/:id` | Delete course |
| POST | `/api/courses/:id/documents` | Upload document |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/courses/:id/chat` | RAG chat |
| POST | `/api/courses/:id/quiz` | Generate quiz |
| GET | `/api/quizzes/:id` | Get quiz with questions |
| POST | `/api/courses/:id/deck` | Generate flashcard deck |
| GET | `/api/decks/:id` | Get deck with cards |
| GET | `/api/stats` | Dashboard stats |
| PUT | `/api/profile` | Update display name |
| PUT | `/api/profile/password` | Change password |

### AI Service (port 8000)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/ingest` | Parse, chunk, embed document |
| POST | `/query` | RAG query with citations |
| POST | `/generate-quiz` | Generate MCQ quiz |
| POST | `/generate-flashcards` | Generate flashcard deck |
| POST | `/summarize` | Summarize document |

---

## Database Schema

```
users           id, name, email, password_hash, created_at
courses         id, user_id, name, description, created_at
documents       id, course_id, name, file_path, status, summary, created_at
quizzes         id, course_id, document_id, title, created_at
quiz_questions  id, quiz_id, position, question_text, option_a/b/c/d, correct_option, explanation
flashcard_decks id, course_id, document_id, title, created_at
flashcards      id, deck_id, position, front, back
```

---

## Environment Variables

### `ai-service/.env`
```
GROQ_API_KEY=your_key_here
```

### `backend/src/main/resources/application.properties`
All defaults work out of the box for local development. H2 console available at `http://localhost:8080/h2-console`.

---

## Screenshots

| Login | Dashboard | Course Chat |
|---|---|---|
| Space neural network background with logo | Stats, feature cards, account info | Two-column: doc sidebar + RAG chat |

---

## Built With

- [Groq](https://groq.com) — Ultra-fast LLM inference (free tier, no credit card)
- [ChromaDB](https://www.trychroma.com) — Embedded vector database
- [Spring Boot](https://spring.io/projects/spring-boot) — Java backend framework
- [Vite](https://vitejs.dev) — Frontend build tool

---

## License

MIT
