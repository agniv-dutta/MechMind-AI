from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class Citation(BaseModel):
    """Citation for answer sources"""
    source_doc: str
    page: int
    excerpt: str
    confidence: float = Field(ge=0, le=1)
    chunk_id: Optional[str] = None


class ResponseSchema(BaseModel):
    """Schema for AI response"""
    answer: str
    citations: List[Citation] = []
    reasoning: Optional[str] = None
    metadata: Dict[str, Any] = {}
    sources_used: List[str] = []
    response_time_ms: Optional[float] = None
    confidence_score: Optional[float] = Field(None, ge=0, le=1)


class ChatMessageSchema(BaseModel):
    """Schema for chat messages"""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)
    source_documents: Optional[List[str]] = []
    citations: Optional[List[Citation]] = []


class ChatRequest(BaseModel):
    """Schema for chat requests"""
    query: str
    conversation_history: Optional[List[ChatMessageSchema]] = []
    filters: Optional[Dict[str, Any]] = None
    search_mode: str = "hybrid"
    model: Optional[str] = None
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Schema for chat responses"""
    answer: str
    citations: List[Citation] = []
    reasoning: Optional[str] = None
    sources_used: List[str] = []
    response_time_ms: float
    session_id: Optional[str] = None


class ChatHistoryResponse(BaseModel):
    """Schema for chat history"""
    session_id: str
    messages: List[ChatMessageSchema]
    created_at: datetime
    updated_at: datetime


class TroubleshootingStep(BaseModel):
    """Single troubleshooting step"""
    step: int
    action: str
    expected: str


class TroubleshootingChain(BaseModel):
    """Troubleshooting chain response"""
    problem: str
    root_causes: List[str]
    steps: List[TroubleshootingStep]
    citations: List[Citation] = []


class ValidationResult(BaseModel):
    """Validation result for AI answers"""
    is_valid: bool
    issues: List[str] = []
    confidence_score: float = Field(ge=0, le=1)


class StreamChunk(BaseModel):
    """Chunk for streaming responses"""
    content: str
    type: str = Field(..., pattern="^(token|citation|metadata|done)$")
    citation: Optional[Citation] = None
    metadata: Optional[Dict[str, Any]] = None
