# Industrial Troubleshooting AI Assistant - Backend

FastAPI-based backend for an industrial equipment troubleshooting AI assistant with RAG capabilities, knowledge graph integration, and Groq API for LLM inference.

## Features

- **Document Processing**: Support for PDF, DOCX, and image files with OCR capabilities
- **Vector Search**: FAISS-based semantic search with hybrid keyword + semantic search
- **Knowledge Graph**: Entity and relationship extraction with NetworkX (in-memory) or Neo4j
- **AI Integration**: Groq API for fast LLM inference (Llama3 models)
- **RAG Pipeline**: Retrieval-augmented generation for context-aware responses
- **RESTful API**: Complete API for document management, chat, search, and knowledge graph queries

## Installation

### Prerequisites

- Python 3.11+
- pip
- (Optional) Tesseract OCR for document processing
- (Optional) Neo4j for knowledge graph persistence

### Setup

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:
```
GROQ_API_KEY=your-groq-api-key-here
```

5. Initialize the database:
```bash
python -c "from app.models.database import init_db; init_db()"
```

## Running the Application

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Docker

Build and run with Docker Compose:
```bash
docker-compose up -d
```

## API Endpoints

### Health Check
- `GET /api/health` - Health check endpoint

### Documents
- `POST /api/documents/upload` - Upload and process a document
- `GET /api/documents` - List all documents
- `GET /api/documents/{document_id}` - Get document details
- `DELETE /api/documents/{document_id}` - Delete a document
- `GET /api/documents/{document_id}/pages/{page_num}` - Get page content
- `POST /api/documents/batch-upload` - Batch upload documents

### Chat
- `POST /api/chat` - Main chat endpoint for troubleshooting queries
- `GET /api/chat/history/{session_id}` - Get chat history
- `POST /api/chat/stream` - Stream chat responses

### Search
- `GET /api/search` - Hybrid search across documents
- `GET /api/search/suggestions` - Auto-complete search queries
- `POST /api/search/advanced` - Advanced search with filters

### Knowledge Graph
- `GET /api/knowledge-graph/entities` - List all entities
- `GET /api/knowledge-graph/entities/{entity_name}` - Get entity details
- `GET /api/knowledge-graph/relationships` - Query relationships
- `GET /api/knowledge-graph/paths` - Find paths between entities
- `GET /api/knowledge-graph/visualization` - Export graph for visualization
- `GET /api/knowledge-graph/statistics` - Get graph statistics

## Configuration

Key environment variables in `.env`:

- `GROQ_API_KEY` - Your Groq API key (required)
- `GROQ_MODEL` - Groq model to use (default: llama3-70b-8192)
- `DATABASE_URL` - Database connection string
- `VECTOR_DB_TYPE` - Vector database type (faiss, qdrant, chroma)
- `EMBEDDING_MODEL` - Sentence transformer model for embeddings
- `USE_NEO4J` - Whether to use Neo4j for knowledge graph

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── schemas/             # Pydantic schemas for request/response
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic services
│   ├── models/              # Database models
│   └── utils/               # Utility functions
├── uploads/                 # Uploaded document storage
├── data/                    # Vector store and data
├── logs/                    # Application logs
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker configuration
└── docker-compose.yml      # Docker Compose configuration
```

## Groq API Integration

This backend uses the Groq API for fast LLM inference with Llama3 models. To use:

1. Get a Groq API key from [console.groq.com](https://console.groq.com)
2. Set `GROQ_API_KEY` in your `.env` file
3. The default model is `llama3-70b-8192` but can be changed via `GROQ_MODEL`

Available Groq models include:
- `llama3-70b-8192` (default, high quality)
- `llama3-8b-8192` (faster, lower quality)
- `mixtral-8x7b-32768` (alternative model)

## Development

### Running Tests

```bash
pytest tests/
```

### Code Formatting

```bash
black app/
```

### Linting

```bash
flake8 app/
```

## Troubleshooting

### OCR Not Working
Ensure Tesseract OCR is installed on your system:
- Ubuntu/Debian: `sudo apt-get install tesseract-ocr`
- macOS: `brew install tesseract`
- Windows: Download from [UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)

### Vector Store Issues
If FAISS is not available, the vector store will fall back to basic functionality. For production, consider using Qdrant or Chroma.

### Database Issues
For SQLite, ensure the application has write permissions to the database file. For production, consider using PostgreSQL.

## License

MIT License
