# Industrial Troubleshooting AI Assistant

An AI-powered troubleshooting workspace for industrial equipment. The app combines a React/Vite frontend with a FastAPI backend to support document upload, hybrid search, RAG-based chat, and knowledge-graph exploration.

## What The App Does

- Upload and process technical documents such as PDFs, DOCX files, and images.
- Extract text and page-level content for search and downstream AI use.
- Run hybrid search across semantic vector results and keyword matches.
- Chat with an LLM over your uploaded knowledge base for troubleshooting help.
- Explore extracted entities and relationships in a knowledge graph.
- Configure search behavior, AI providers, and privacy-related settings from the UI.

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS, Recharts, Lucide icons
- Backend: FastAPI, Uvicorn, SQLAlchemy, Pydantic Settings
- Retrieval: FAISS, sentence-transformers, rank-bm25
- Document handling: PDF, DOCX, OCR via Tesseract, OpenCV, Pillow
- Knowledge graph: NetworkX, optional Neo4j
- LLM providers: Groq by default, with OpenAI and Ollama compatibility hooks

## Repository Layout

```text
.
├── frontend/              # React app and UI components
├── backend/               # FastAPI app, services, routes, and persistence
├── README.md              # This guide
└── .gitignore             # Shared ignore rules for generated files
```

### Frontend

- `frontend/src/App.jsx` wires the main workspace together.
- The UI includes:
  - Chat workspace
  - Inspector panel for context and sources
  - Upload modal
  - Troubleshooting wizard
  - Document library and document details
  - Advanced search
  - Knowledge graph view
  - Settings, AI configuration, search settings, and privacy pages

### Backend

- `backend/app/main.py` creates the FastAPI app, configures CORS, logging, and startup/shutdown initialization.
- `backend/app/config.py` centralizes environment-driven settings.
- The backend exposes routes for:
  - Documents
  - Chat
  - Search
  - Knowledge graph
  - AI
  - Field support

## Key Features

- Document upload and processing
- OCR-enabled extraction for scanned content
- Vector-store initialization and semantic retrieval
- Hybrid search with semantic and keyword weighting
- RAG-style chat responses
- In-memory or Neo4j-backed knowledge graph support
- Request logging and structured error handling
- CORS configuration for local frontend development

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- Python 3.11+
- `pip`
- Optional: Tesseract OCR
- Optional: Neo4j

### Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set at least your Groq API key in `backend/.env`:

```env
GROQ_API_KEY=your-groq-api-key-here
```

If you are using a different provider or database, adjust the remaining settings in `backend/.env`.

### Optional Backend Services

- Tesseract OCR for scanned documents
- Neo4j if you want persistent graph storage instead of the in-memory graph
- Docker Compose if you prefer containerized local startup

### Frontend Setup

```bash
cd frontend
npm install
```

If you are working on macOS or Linux, use `source .venv/bin/activate` and `cp .env.example .env` instead of the PowerShell commands above.

## Running The App

### Backend

From `backend/`:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API root: `http://localhost:8000`
- Health check: `http://localhost:8000/api/health`
- OpenAPI docs: `http://localhost:8000/docs`

### Frontend

From `frontend/`:

```bash
npm run dev
```

- Vite dev server: typically `http://localhost:5173`

## Available Frontend Scripts

From `frontend/package.json`:

- `npm run dev` - start Vite in development mode
- `npm run build` - create a production build
- `npm run lint` - run Oxlint
- `npm run preview` - preview the production build

### Backend Development Commands

From `backend/`:

```bash
pytest tests/
black app/
flake8 app/
```

## Backend API Surface

### Health

- `GET /api/health`

### Documents

- `POST /api/documents/upload`
- `GET /api/documents`
- `GET /api/documents/{document_id}`
- `DELETE /api/documents/{document_id}`
- `GET /api/documents/{document_id}/pages/{page_num}`
- `POST /api/documents/batch-upload`

### Chat

- `POST /api/chat`
- `GET /api/chat/history/{session_id}`
- `POST /api/chat/stream`

### Search

- `GET /api/search`
- `GET /api/search/suggestions`
- `POST /api/search/advanced`

### Knowledge Graph

- `GET /api/knowledge-graph/entities`
- `GET /api/knowledge-graph/entities/{entity_name}`
- `GET /api/knowledge-graph/relationships`
- `GET /api/knowledge-graph/paths`
- `GET /api/knowledge-graph/visualization`
- `GET /api/knowledge-graph/statistics`

### AI And Field

- AI routes are mounted under `/api/ai`
- Field routes are mounted under `/api/field`

## Important Environment Variables

The backend reads configuration from `backend/.env`.

- `GROQ_API_KEY` - required for Groq-backed chat
- `GROQ_MODEL` - model name used by the backend
- `LLM_PROVIDER` - `groq`, `openai`, or `ollama`
- `DATABASE_URL` - database connection string
- `VECTOR_DB_TYPE` - `faiss`, `qdrant`, or `chroma`
- `VECTOR_DB_PATH` - vector store directory
- `EMBEDDING_MODEL` - sentence-transformer model
- `UPLOAD_DIRECTORY` - upload destination
- `LOG_FILE` - log file location
- `USE_NEO4J` - enable Neo4j-backed graph storage
- `ALLOWED_ORIGINS` - CORS allowlist for the frontend

## Notes On Local Data

The backend writes runtime artifacts under directories such as:

- `backend/uploads/`
- `backend/logs/`
- `backend/data/`
- `backend/industrial_troubleshooting.db`

These are local/generated files and should not be committed.

## Docker

The backend includes `backend/Dockerfile` and `backend/docker-compose.yml` for containerized runs.

- `docker-compose up -d` from `backend/` starts the service stack defined there.

## Troubleshooting

- If chat requests fail, confirm `GROQ_API_KEY` is set in `backend/.env`.
- If OCR is unavailable, install Tesseract on your machine.
- If the knowledge graph is empty, confirm documents have been processed and that the service started successfully.
- If the frontend cannot reach the API, confirm the backend is running on port `8000` and the CORS origin matches your Vite URL.

## License

MIT
