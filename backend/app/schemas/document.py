from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class FileTypeEnum(str, Enum):
    """Supported file types"""
    PDF = "pdf"
    DOCX = "docx"
    PNG = "png"
    JPG = "jpg"
    JPEG = "jpeg"


class ProcessingStatusEnum(str, Enum):
    """Document processing status"""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETE = "complete"
    ERROR = "error"


class DocumentSchema(BaseModel):
    """Document schema for API responses"""
    id: str
    filename: str
    file_type: str
    file_size: Optional[int] = None
    uploaded_at: datetime
    status: ProcessingStatusEnum
    pages_count: int = 0
    equipment_type: Optional[str] = None
    category: Optional[str] = None
    version: Optional[str] = None
    tags: Optional[List[str]] = None
    processing_error: Optional[str] = None
    chunks_count: int = 0
    entities_found: int = 0
    
    class Config:
        from_attributes = True


class DocumentUploadSchema(BaseModel):
    """Schema for document upload request"""
    category: Optional[str] = Field(None, description="Document category (manual, procedure, drawing)")
    equipment_type: Optional[str] = Field(None, description="Equipment type (pump, motor, valve, etc.)")
    version: Optional[str] = Field(None, description="Document version")
    tags: Optional[List[str]] = Field(None, description="Document tags")


class DocumentUploadResponse(BaseModel):
    """Response schema for document upload"""
    document_id: str
    filename: str
    status: ProcessingStatusEnum
    pages: int = 0
    entities_found: int = 0
    processing_time: Optional[float] = None
    message: str


class DocumentListResponse(BaseModel):
    """Response schema for document list"""
    documents: List[DocumentSchema]
    total_count: int
    skip: int
    limit: int


class DocumentDetailResponse(BaseModel):
    """Response schema for document details"""
    id: str
    filename: str
    file_type: str
    content_preview: Optional[str] = None
    metadata: Dict[str, Any] = {}
    entities: List[Dict[str, Any]] = []
    relationships: List[Dict[str, Any]] = []
    uploaded_at: datetime
    processed_at: Optional[datetime] = None


class PageContentResponse(BaseModel):
    """Response schema for page content"""
    page_number: int
    text_content: str
    image_url: Optional[str] = None
    tables: List[Dict[str, Any]] = []
    diagrams: List[Dict[str, Any]] = []


class BatchUploadResponse(BaseModel):
    """Response schema for batch upload"""
    uploaded_count: int
    failed_count: int
    details: List[Dict[str, Any]]


class DocumentDeleteResponse(BaseModel):
    """Response schema for document deletion"""
    success: bool
    deleted_doc_id: str
    removed_chunks: int
