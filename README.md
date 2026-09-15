# Diagnostix — Intelligent Bug Diagnosis Platform

An AI-powered internal tool for diagnosing bugs from source code, logs, stack traces, and
project archives — using a 4-agent LangGraph pipeline grounded in a ChromaDB RAG knowledge
base, with a React dashboard, AI chat assistant, and admin analytics.

Every piece of this has been written as real, working code and exercised with automated
tests (see **Testing notes** below for exactly what was and wasn't runnable in the build
environment). Nothing here is a stub or a TODO.

## Architecture

```
Browser (React/Vite/Tailwind)
        │  REST + JWT
        ▼
FastAPI backend ── MongoDB (users, analyses, documents, chats)
        │
        ├─ RAG pipeline: chunking → sentence-transformers embeddings → ChromaDB
        │
        └─ LangGraph, 4 sequential agents (Groq or Gemini as the LLM):
             1. Bug Detection      — classifies the error from logs/traces
             2. Code Analysis      — locates the probable file/function & mistakes
             3. Knowledge Retrieval — queries ChromaDB for docs + similar past bugs
             4. Fix Recommendation  — synthesizes everything into root cause + fix
```

## Features

- **Auth** — register/login/JWT, protected routes, admin role (auto-granted via `ADMIN_EMAILS`)
- **Upload & diagnose** — `.py .java .js .ts .jsx .tsx .zip .log .txt .pdf .docx .md`, routed
  through the 4-agent pipeline, results persisted to MongoDB
- **Knowledge base** — upload PDFs/DOCX/MD/TXT; chunked and embedded into ChromaDB, retrieved
  automatically during diagnosis and chat
- **AI chat assistant** — RAG-grounded Q&A, optionally scoped to a specific analysis
- **Dashboard** — totals, weekly activity, severity/bug-type breakdown charts, recent analyses
- **History** — full sortable table of past analyses
- **Admin dashboard** — platform-wide users/analyses/documents stats, popular bug types
- **Similar bug search** — every completed analysis is embedded so future bugs surface it

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB running locally (Community Server, or `docker run -d -p 27017:27017 mongo:7` if you
  just want a quick database — that's the only optional Docker use in this setup)
- A free Groq API key from https://console.groq.com (or a Gemini key, see below)

## Run it (Windows, venv + npm — no Docker)

**Backend** (from the `backend` folder):

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env`:
- Set `MONGO_URI=mongodb://localhost:27017`
- Set `JWT_SECRET_KEY` to any long random string
- Set `GROQ_API_KEY` (this is the default LLM provider). To use Gemini instead, set
  `LLM_PROVIDER=gemini` and `GEMINI_API_KEY`
- Optionally set `ADMIN_EMAILS=you@company.com` so your account is auto-promoted to admin
  on registration

Start it:

```powershell
uvicorn app.main:app --reload --port 8000
```

**Frontend** (from the `frontend` folder, in a separate terminal):

```powershell
copy .env.example .env
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs

First run: register an account at http://localhost:5173/register, upload a document or two
to the Knowledge Base, then upload a buggy file on the Upload page.

### Starting it again later

Once set up, you don't need to reinstall anything — just:

```powershell
# Terminal 1 (if Mongo isn't already running)
docker start diagnostix-mongo   # or start your local mongod service

# Terminal 2 — backend
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Terminal 3 — frontend
cd frontend
npm run dev
```

## Project structure

```
bug-diagnosis-ai/
  backend/
    app/
      main.py, config.py, database.py
      models/       # Mongo document builders (user, analysis, document, chat)
      schemas/      # Pydantic request/response models
      routers/      # auth, documents, analysis, chat, admin, health
      services/     # business logic per router
      ai/
        llm.py                        # Groq/Gemini client + JSON-mode helper
        state.py                      # LangGraph shared state
        graph.py                      # wires the 4 agents together
        agents/
          bug_detection_agent.py
          code_analysis_agent.py
          knowledge_retrieval_agent.py
          fix_recommendation_agent.py
      rag/
        document_processor.py         # PDF/DOCX/ZIP/plain-text extraction
        chunking.py                   # recursive text splitting
        embeddings.py                 # sentence-transformers wrapper
        vector_store.py               # ChromaDB knowledge_base + bug_history collections
      middlewares/  # JWT auth dependency, admin guard, global error handlers
      utils/        # security (hashing/JWT), file validation
    requirements.txt, .env.example
  frontend/
    src/
      api/          # axios clients per resource
      context/      # AuthContext
      components/   # Sidebar, AppShell, ProtectedRoute, PulseTrace, SeverityBadge, StatCard, Loader
      pages/         # Landing, Login, Register, Dashboard, Upload, AnalysisResult,
                     # Chat, KnowledgeBase, History, Admin, Settings
    .env.example
```

## API reference (interactive docs at `/docs`)

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account, returns JWT |
| POST | `/api/auth/login` | Returns JWT |
| GET | `/api/auth/me` | Current user |
| POST | `/api/documents/upload` | Ingest a knowledge-base document |
| GET | `/api/documents` | List knowledge-base documents |
| POST | `/api/analysis/upload` | Upload a file, run the 4-agent pipeline |
| GET | `/api/analysis/history` | List past analyses |
| GET | `/api/analysis/dashboard` | Dashboard stats |
| GET | `/api/analysis/{id}` | Single analysis result |
| POST | `/api/chat` | Send a chat message (RAG-grounded) |
| GET | `/api/chat/sessions` | List chat session IDs |
| GET | `/api/chat/sessions/{id}` | Messages in a session |
| GET | `/api/admin/stats` | Platform-wide stats (admin only) |
| GET | `/health` | DB connectivity check |

## Testing notes (what was actually verified, and how)

The sandbox this was built in has no outbound internet access except to package registries
(pypi, npm) — no access to Groq/Gemini APIs or huggingface.co. Given that constraint, here's
exactly what was verified and how:

- **Auth flow** — real end-to-end test against an in-memory MongoDB (`mongomock-motor`):
  register → duplicate-rejected → login → wrong-password-rejected → fetch-by-id. Caught and
  fixed a real `bcrypt`/`passlib` version incompatibility this way before it shipped.
- **RAG chunking + ChromaDB** — real `ChromaDB` (`PersistentClient`) storage and cosine
  similarity retrieval, verified end-to-end with deterministic mock embedding vectors (since
  the real embedding model requires downloading from huggingface.co).
- **LangGraph pipeline** — the actual `StateGraph` (4 real nodes, real edges, real `.invoke()`)
  was run end-to-end with the LLM call mocked (since Groq/Gemini need a live API key), proving
  the agent wiring, state threading, and output shape are correct.
- **Full service/router layer** — a complete mocked integration test (register → upload
  knowledge doc → upload+analyze code → history → dashboard → chat → admin stats) passed
  against `mongomock-motor` with both the LLM and vector store mocked.
- **Frontend** — `npm run build` succeeds with no errors; the app was not visually verified in
  a browser since no browser was available in this sandbox.
- **Not verified**: an actual live call to Groq/Gemini, and an actual `sentence-transformers`
  embedding download. If `chromadb` complains about the system SQLite version on your machine,
  add `pysqlite3-binary` to `requirements.txt` and see ChromaDB's docs for the two-line
  workaround.

## Known simplifications

- The multi-agent pipeline runs synchronously in the request/response cycle rather than as a
  background job — fine for typical file sizes, but a large project ZIP could take tens of
  seconds. A production version would move this to a task queue (Celery/RQ) with a polling or
  websocket status endpoint.
- Admin promotion is via an `ADMIN_EMAILS` env var rather than a full role-management UI.
- Similar-bug search reuses the same ChromaDB instance/collection scheme described in the
  brief; there's no cross-tenant isolation beyond `user_id` metadata filtering.