from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.routes import documents, chat, search, knowledge_graph, ai, field

# Configure logging
os.makedirs(os.path.dirname(settings.LOG_FILE) or '.', exist_ok=True)
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(settings.LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting Industrial Troubleshooting AI Assistant")
    
    # Initialize services on startup
    try:
        # Initialize vector store
        from app.services.vector_store import VectorStore
        app.state.vector_store = VectorStore()
        await app.state.vector_store.initialize(settings.EMBEDDING_MODEL)
        logger.info("Vector store initialized")
        
        # Initialize knowledge graph
        from app.services.knowledge_graph_service import KnowledgeGraphService
        app.state.knowledge_graph = KnowledgeGraphService()
        await app.state.knowledge_graph.initialize()
        logger.info("Knowledge graph initialized")
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        # Continue startup even if services fail
    
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


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    start_time = datetime.now()
    
    response = await call_next(request)
    
    duration = (datetime.now() - start_time).total_seconds() * 1000
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - Duration: {duration:.2f}ms"
    )
    
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
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
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
