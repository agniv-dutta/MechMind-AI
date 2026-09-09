from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from datetime import datetime
import time
from uuid import uuid4
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.routes import documents, chat, search, knowledge_graph, ai, field
from app.utils.logger import setup_logging

# ── Structured JSON logging ──────────────────────────────────────────
setup_logging(log_level=settings.LOG_LEVEL, log_file=settings.LOG_FILE)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting Industrial Troubleshooting AI Assistant")

    # 1. Initialize database tables
    try:
        from app.models.database import init_db, validate_db
        init_db()
        validate_db()
        logger.info("Database tables verified / created")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

    # 2. Initialize services
    try:
        from app.services.vector_store import VectorStore
        app.state.vector_store = VectorStore()
        await app.state.vector_store.initialize(settings.EMBEDDING_MODEL)
        logger.info("Vector store initialized")
    except Exception as e:
        logger.error(f"Vector store init failed (non-fatal): {e}")

    try:
        from app.services.knowledge_graph_service import KnowledgeGraphService
        app.state.knowledge_graph = KnowledgeGraphService()
        await app.state.knowledge_graph.initialize()
        logger.info("Knowledge graph initialized")
    except Exception as e:
        logger.error(f"Knowledge graph init failed (non-fatal): {e}")

    logger.info("Startup complete")
    yield

    # Cleanup on shutdown
    logger.info("Shutting down Industrial Troubleshooting AI Assistant")
    try:
        if hasattr(app.state, 'vector_store'):
            await app.state.vector_store.close()
        if hasattr(app.state, 'knowledge_graph'):
            await app.state.knowledge_graph.close()
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


# Initialize FastAPI app
app = FastAPI(
    title="Industrial Troubleshooting AI Assistant",
    description="AI-powered troubleshooting assistant for industrial equipment",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
cors_origins = settings.ALLOWED_ORIGINS
if isinstance(cors_origins, str):
    cors_origins = [origin.strip() for origin in cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware with request IDs
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests with timing and request IDs"""
    request_id = str(uuid4())[:8]
    request.state.request_id = request_id
    start = time.time()

    response = await call_next(request)

    elapsed_ms = (time.time() - start) * 1000
    logger.info(
        f"{request.method} {request.url.path} {response.status_code} {elapsed_ms:.1f}ms",
        extra={"extra_fields": {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "elapsed_ms": round(elapsed_ms, 1),
            "client": request.client.host if request.client else None,
        }},
    )
    response.headers["X-Request-ID"] = request_id
    return response


# Custom exception handlers
class DocumentProcessingError(Exception):
    """Custom exception for document processing errors"""
    pass


class VectorStoreError(Exception):
    """Custom exception for vector store errors"""
    pass


class AIServiceError(Exception):
    """Custom exception for AI service errors"""
    pass


class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass


@app.exception_handler(DocumentProcessingError)
async def document_processing_exception_handler(request: Request, exc: DocumentProcessingError):
    logger.error(f"Document processing error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": f"Document processing failed: {str(exc)}"}
    )


@app.exception_handler(VectorStoreError)
async def vector_store_exception_handler(request: Request, exc: VectorStoreError):
    logger.error(f"Vector store error: {exc}")
    return JSONResponse(
        status_code=503,
        content={"detail": f"Vector store error: {str(exc)}"}
    )


@app.exception_handler(AIServiceError)
async def ai_service_exception_handler(request: Request, exc: AIServiceError):
    logger.error(f"AI service error: {exc}")
    return JSONResponse(
        status_code=503,
        content={"detail": f"AI service error: {str(exc)}"}
    )


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": f"Validation error: {str(exc)}"}
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTP error: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", None)
    logger.error(f"Unhandled exception: {exc}", exc_info=True,
                 extra={"extra_fields": {"request_id": request_id}})
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# Register structured API exception handlers
from app.exceptions.handlers import APIException, api_exception_handler  # noqa: E402
app.add_exception_handler(APIException, api_exception_handler)


# ── Health check endpoints ────────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
    }


@app.get("/api/health/detailed")
async def detailed_health():
    """Detailed health check with service statuses"""
    checks = {"api": "ok", "database": "unknown", "vector_store": "unknown", "knowledge_graph": "unknown", "llm": "unknown"}

    # Database
    try:
        from app.models.database import engine
        with engine.connect() as conn:
            conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"

    # Vector store
    try:
        if hasattr(app.state, "vector_store") and app.state.vector_store:
            checks["vector_store"] = "ok"
        else:
            checks["vector_store"] = "not_initialized"
    except Exception as e:
        checks["vector_store"] = f"error: {e}"

    # Knowledge graph
    try:
        if hasattr(app.state, "knowledge_graph") and app.state.knowledge_graph:
            checks["knowledge_graph"] = "ok"
        else:
            checks["knowledge_graph"] = "not_initialized"
    except Exception as e:
        checks["knowledge_graph"] = f"error: {e}"

    # LLM
    try:
        if settings.GROQ_API_KEY:
            checks["llm"] = "configured"
        else:
            checks["llm"] = "no_api_key"
    except Exception as e:
        checks["llm"] = f"error: {e}"

    overall = "healthy" if checks["database"] == "ok" else "degraded"

    return {
        "status": overall,
        "checks": checks,
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
    }


# Include routers
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(knowledge_graph.router, prefix="/api/knowledge-graph", tags=["knowledge-graph"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(field.router, prefix="/api/field", tags=["field"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Industrial Troubleshooting AI Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
