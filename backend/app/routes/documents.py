from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Optional, List
from datetime import datetime
import os
import shutil
import uuid

from app.schemas.document import (
    DocumentSchema, DocumentUploadSchema, DocumentUploadResponse,
    DocumentListResponse, DocumentDetailResponse, PageContentResponse,
    BatchUploadResponse, DocumentDeleteResponse
)
from app.services.document_processor import DocumentProcessor
from app.services.vector_store import VectorStore
from app.services.knowledge_graph_service import KnowledgeGraphService
from app.models.database import Document, get_db
from sqlalchemy.orm import Session

router = APIRouter()
document_processor = DocumentProcessor()


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    category: Optional[str] = Form(None),
    equipment_type: Optional[str] = Form(None),
    version: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload and process a document"""
    start_time = datetime.now()
    
    try:
        # Validate file type
        file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
        if file_extension not in ['pdf', 'docx', 'png', 'jpg', 'jpeg']:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_extension}")
        
        # Create upload directory if it doesn't exist
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        document_id = str(uuid.uuid4())
        file_path = os.path.join(upload_dir, f"{document_id}_{file.filename}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process document
        processed_doc = document_processor.process_document(
            file_path, 
            file_extension,
            metadata={
                'category': category,
                'equipment_type': equipment_type,
                'version': version,
                'tags': tags.split(',') if tags else []
            }
        )
        
        # Create database entry
        db_document = Document(
            id=document_id,
            filename=file.filename,
            file_type=file_extension,
            file_size=os.path.getsize(file_path),
            file_hash=processed_doc.content_hash,
            total_pages=processed_doc.total_pages,
            extracted_text_length=processed_doc.extracted_text_length,
            equipment_type=equipment_type,
            category=category,
            version=version,
            tags=tags,
            processing_status="complete",
            chunks_count=len(processed_doc.chunks),
            embedding_model="all-MiniLM-L6-v2"
        )
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        # Add to vector store
        vector_store = VectorStore()
        await vector_store.initialize()
        
        chunks_data = []
        for chunk in processed_doc.chunks:
            chunks_data.append({
                'chunk_id': f"{document_id}_{chunk.metadata['chunk_number']}",
                'content': chunk.content,
                'document_id': document_id,
                'filename': file.filename,
                'page_number': chunk.metadata.get('page_number'),
                'section_title': chunk.metadata.get('section_title'),
                'chunk_number': chunk.metadata.get('chunk_number'),
                'file_type': file_extension
            })
        
        if chunks_data:
            vector_store.add_documents(chunks_data)
        
        # Build knowledge graph
        kg_service = KnowledgeGraphService()
        await kg_service.initialize()
        
        all_text = " ".join(page.content for page in processed_doc.pages)
        kg_service.build_graph_from_document(document_id, all_text)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return DocumentUploadResponse(
            document_id=document_id,
            filename=file.filename,
            status="complete",
            pages=processed_doc.total_pages,
            entities_found=processed_doc.metadata.get('categories', []),
            processing_time=processing_time,
            message="Document processed successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    skip: int = 0,
    limit: int = 10,
    sort_by: str = "uploaded_at",
    category: Optional[str] = None,
    equipment_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all uploaded documents with pagination"""
    try:
        query = db.query(Document)
        
        # Apply filters
        if category:
            query = query.filter(Document.category == category)
        if equipment_type:
            query = query.filter(Document.equipment_type == equipment_type)
        
        # Sort
        if hasattr(Document, sort_by):
            query = query.order_by(getattr(Document, sort_by).desc())
        
        # Paginate
        total_count = query.count()
        documents = query.offset(skip).limit(limit).all()
        
        return DocumentListResponse(
            documents=documents,
            total_count=total_count,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")


@router.get("/{document_id}", response_model=DocumentDetailResponse)
async def get_document(document_id: str, db: Session = Depends(get_db)):
    """Retrieve document details and content"""
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return DocumentDetailResponse(
            id=document.id,
            filename=document.filename,
            file_type=document.file_type,
            content_preview=f"Document with {document.total_pages} pages",
            metadata={
                'file_size': document.file_size,
                'equipment_type': document.equipment_type,
                'category': document.category,
                'version': document.version,
                'tags': document.tags.split(',') if document.tags else []
            },
            entities=[],
            relationships=[],
            uploaded_at=document.uploaded_at,
            processed_at=document.processed_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving document: {str(e)}")


@router.delete("/{document_id}", response_model=DocumentDeleteResponse)
async def delete_document(document_id: str, db: Session = Depends(get_db)):
    """Delete a document and remove from all indices"""
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get chunks count before deletion
        chunks_count = document.chunks_count
        
        # Delete from database
        db.delete(document)
        db.commit()
        
        # Delete from vector store
        vector_store = VectorStore()
        await vector_store.initialize()
        vector_store.delete_document(document_id)
        
        # Delete file from disk
        upload_dir = "uploads"
        for filename in os.listdir(upload_dir):
            if filename.startswith(document_id):
                file_path = os.path.join(upload_dir, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
        
        return DocumentDeleteResponse(
            success=True,
            deleted_doc_id=document_id,
            removed_chunks=chunks_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")


@router.get("/{document_id}/pages/{page_num}", response_model=PageContentResponse)
async def get_page_content(document_id: str, page_num: int, db: Session = Depends(get_db)):
    """Get specific page content with OCR"""
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if page_num < 1 or page_num > document.total_pages:
            raise HTTPException(status_code=400, detail="Invalid page number")
        
        # This is a simplified implementation
        # In production, you would retrieve actual page content from storage
        return PageContentResponse(
            page_number=page_num,
            text_content=f"Content for page {page_num} of {document.filename}",
            image_url=None,
            tables=[],
            diagrams=[]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving page content: {str(e)}")


@router.post("/batch-upload", response_model=BatchUploadResponse)
async def batch_upload(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    """Handle multiple file uploads"""
    uploaded_count = 0
    failed_count = 0
    details = []
    
    for file in files:
        try:
            # Process each file
            result = await upload_document(file, db=db)
            uploaded_count += 1
            details.append({
                'filename': file.filename,
                'status': 'success',
                'document_id': result.document_id
            })
        except Exception as e:
            failed_count += 1
            details.append({
                'filename': file.filename,
                'status': 'failed',
                'error': str(e)
            })
    
    return BatchUploadResponse(
        uploaded_count=uploaded_count,
        failed_count=failed_count,
        details=details
    )
