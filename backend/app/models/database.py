from sqlalchemy import create_engine, Column, String, Integer, Text, Boolean, Float, DateTime, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import uuid

from app.config import settings

# Create base class for models
Base = declarative_base()

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.API_ENV == "development",
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency for database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Document(Base):
    """Document model for storing uploaded documents"""
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20))  # pdf, docx, png, jpg
    file_size = Column(Integer)
    file_hash = Column(String(64), unique=True)  # SHA-256
    
    # Content metadata
    total_pages = Column(Integer, default=0)
    extracted_text_length = Column(Integer)
    has_tables = Column(Boolean, default=False)
    has_diagrams = Column(Boolean, default=False)
    
    # Categories and tags
    equipment_type = Column(String(100))  # pump, motor, valve, etc.
    category = Column(String(100))  # manual, procedure, drawing
    version = Column(String(50))
    tags = Column(Text)  # JSON string of tags
    
    # Processing metadata
    embedding_model = Column(String(100))
    processing_status = Column(String(20), default="queued")  # queued, processing, complete, error
    processing_error = Column(Text, nullable=True)
    chunks_count = Column(Integer, default=0)
    entities_found = Column(Integer, default=0)
    
    # Timestamps
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    metadata_entries = relationship("DocumentMetadata", back_populates="document", cascade="all, delete-orphan")
    citations = relationship("Citation", back_populates="document", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_equipment_type', 'equipment_type'),
        Index('idx_category', 'category'),
        Index('idx_processing_status', 'processing_status'),
        Index('idx_uploaded_at', 'uploaded_at'),
    )


class DocumentChunk(Base):
    """Document chunk model for storing text chunks"""
    __tablename__ = "document_chunks"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey('documents.id'), nullable=False)
    
    chunk_number = Column(Integer)  # Order within document
    page_number = Column(Integer)  # Physical page number
    section_title = Column(String(255))  # Section heading
    
    # Content
    content = Column(Text, nullable=False)
    content_hash = Column(String(64))  # For deduplication
    token_count = Column(Integer)
    
    # Embedding (stored as JSON string for SQLite compatibility)
    embedding = Column(Text)  # JSON string of embedding vector
    embedding_model = Column(String(100))
    
    # Metadata for search
    has_table = Column(Boolean, default=False)
    has_diagram = Column(Boolean, default=False)
    has_code = Column(Boolean, default=False)
    
    # Relationships
    document = relationship("Document", back_populates="chunks")
    
    __table_args__ = (
        Index('idx_document_id', 'document_id'),
        Index('idx_page_number', 'page_number'),
        Index('idx_section_title', 'section_title'),
    )


class DocumentMetadata(Base):
    """Document metadata model for storing key-value metadata"""
    __tablename__ = "document_metadata"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey('documents.id'), nullable=False)
    
    key = Column(String(255))
    value = Column(Text)
    data_type = Column(String(50))  # string, number, date, json
    
    # Metadata management
    source = Column(String(100))  # extracted, user_provided, computed
    
    # Relationships
    document = relationship("Document", back_populates="metadata_entries")
    
    __table_args__ = (
        Index('idx_document_metadata', 'document_id', 'key'),
    )


class Citation(Base):
    """Citation model for storing answer citations"""
    __tablename__ = "citations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey('documents.id'))
    chunk_id = Column(String(36), ForeignKey('document_chunks.id'))
    
    page_number = Column(Integer)
    text_excerpt = Column(Text)  # The actual text cited
    
    # Quality metrics
    relevance_score = Column(Float)  # 0-1 relevance to query
    confidence_score = Column(Float)  # LLM confidence
    used_count = Column(Integer, default=0)  # How often this citation is used
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="citations")
    
    __table_args__ = (
        Index('idx_document_id_citations', 'document_id'),
    )


class Entity(Base):
    """Entity model for knowledge graph"""
    __tablename__ = "entities"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, unique=True)
    entity_type = Column(String(100))  # Equipment, Component, System, etc.
    
    # Descriptive
    description = Column(Text, nullable=True)
    properties = Column(Text)  # JSON string of properties
    
    # Tracking
    frequency = Column(Integer, default=1)  # Mentions count
    document_count = Column(Integer)  # Across how many documents
    first_seen_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime)
    
    # Relationships
    relationships = relationship("Relationship", foreign_keys="Relationship.entity1_id",
                                back_populates="entity1", cascade="all, delete-orphan")
    reverse_relationships = relationship("Relationship",
                                        foreign_keys="Relationship.entity2_id",
                                        back_populates="entity2",
                                        cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_entity_name', 'name'),
        Index('idx_entity_type', 'entity_type'),
    )


class Relationship(Base):
    """Relationship model for knowledge graph"""
    __tablename__ = "relationships"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity1_id = Column(String(36), ForeignKey('entities.id'))
    entity2_id = Column(String(36), ForeignKey('entities.id'))
    
    relationship_type = Column(String(100))
    # Examples: is_part_of, operates_in, connects_to, produces, uses, etc.
    
    # Quality metrics
    confidence = Column(Float)  # 0-1
    mention_count = Column(Integer, default=1)
    
    # Source tracking
    source_documents = Column(Text)  # JSON list of doc_ids
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    entity1 = relationship("Entity", foreign_keys=[entity1_id],
                          back_populates="relationships")
    entity2 = relationship("Entity", foreign_keys=[entity2_id],
                          back_populates="reverse_relationships")
    
    __table_args__ = (
        Index('idx_entity1_id', 'entity1_id'),
        Index('idx_entity2_id', 'entity2_id'),
        Index('idx_relationship_type', 'relationship_type'),
    )


class ChatMessage(Base):
    """Chat message model for conversation history"""
    __tablename__ = "chat_messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey('chat_sessions.id'))
    
    role = Column(String(20))  # user, assistant
    content = Column(Text)
    
    # Sources and citations
    source_documents = Column(Text)  # JSON list of doc_ids
    citations = Column(Text)  # JSON list of citations
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    response_time_ms = Column(Integer)  # How long to generate response
    
    session = relationship("ChatSession", back_populates="messages")


class ChatSession(Base):
    """Chat session model for conversation tracking"""
    __tablename__ = "chat_sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # User/context info (optional)
    equipment_type = Column(String(100))  # Context for the session
    category = Column(String(100))
    
    messages = relationship("ChatMessage", back_populates="session",
                           cascade="all, delete-orphan")


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def drop_db():
    """Drop all database tables (use with caution)"""
    Base.metadata.drop_all(bind=engine)
