import os
import hashlib
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from pypdf import PdfReader
from docx import Document as DocxDocument
from PIL import Image
import numpy as np

from app.config import settings
from app.services.ocr_service import OCRService


class Page:
    """Represents a page from a document"""
    def __init__(self, page_number: int, content: str, image: Optional[bytes] = None):
        self.page_number = page_number
        self.content = content
        self.image = image
        self.tables: List[Dict[str, Any]] = []
        self.diagrams: List[Dict[str, Any]] = []


class Chunk:
    """Represents a text chunk from a document"""
    def __init__(self, content: str, metadata: Dict[str, Any]):
        self.content = content
        self.metadata = metadata


class Table:
    """Represents a table extracted from a document"""
    def __init__(self, name: str, headers: List[str], rows: List[List[str]], metadata: Dict[str, Any]):
        self.name = name
        self.headers = headers
        self.rows = rows
        self.metadata = metadata


class Diagram:
    """Represents a diagram extracted from a document"""
    def __init__(self, diagram_type: str, components: List[Dict[str, Any]], 
                 connections: List[Dict[str, Any]], metadata: Dict[str, Any]):
        self.diagram_type = diagram_type
        self.components = components
        self.connections = connections
        self.metadata = metadata


class ProcessedDocument:
    """Represents a processed document with all extracted information"""
    def __init__(self, document_id: str, filename: str, file_type: str):
        self.document_id = document_id
        self.filename = filename
        self.file_type = file_type
        self.pages: List[Page] = []
        self.chunks: List[Chunk] = []
        self.tables: List[Table] = []
        self.diagrams: List[Diagram] = []
        self.metadata: Dict[str, Any] = {}
        self.content_hash: str = ""
        self.total_pages: int = 0
        self.extracted_text_length: int = 0


class DocumentProcessor:
    """Service for processing various document types"""
    
    def __init__(self):
        self.ocr_service = OCRService()
        self.supported_types = ['pdf', 'docx', 'png', 'jpg', 'jpeg', 'md']
        self.max_file_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024  # Convert to bytes
    
    def validate_file(self, file_path: str, file_type: str) -> bool:
        """Validate file before processing"""
        if not os.path.exists(file_path):
            raise ValueError(f"File not found: {file_path}")
        
        if file_type not in self.supported_types:
            raise ValueError(f"Unsupported file type: {file_type}. Supported types: {self.supported_types}")
        
        file_size = os.path.getsize(file_path)
        if file_size > self.max_file_size:
            raise ValueError(f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB")
        
        return True
    
    def calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA-256 hash of file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    def process_document(self, file_path: str, file_type: str, 
                        metadata: Optional[Dict[str, Any]] = None) -> ProcessedDocument:
        """Process a document and extract all content"""
        self.validate_file(file_path, file_type)
        
        document_id = str(uuid.uuid4())
        filename = os.path.basename(file_path)
        processed_doc = ProcessedDocument(document_id, filename, file_type)
        
        # Calculate content hash
        processed_doc.content_hash = self.calculate_file_hash(file_path)
        
        # Add user-provided metadata
        if metadata:
            processed_doc.metadata.update(metadata)
        
        # Extract content based on file type
        if file_type == 'pdf':
            self._process_pdf(file_path, processed_doc)
        elif file_type == 'docx':
            self._process_docx(file_path, processed_doc)
        elif file_type == 'md':
            self._process_markdown(file_path, processed_doc)
        elif file_type in ['png', 'jpg', 'jpeg']:
            self._process_image(file_path, processed_doc)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
        
        # Extract document metadata
        self._extract_document_metadata(processed_doc)
        
        # Chunk the document
        processed_doc.chunks = self.chunk_document(processed_doc)
        
        # Calculate statistics
        processed_doc.total_pages = len(processed_doc.pages)
        processed_doc.extracted_text_length = sum(len(page.content) for page in processed_doc.pages)
        
        return processed_doc
    
    def _process_pdf(self, file_path: str, processed_doc: ProcessedDocument):
        """Process PDF document"""
        try:
            pdf_reader = PdfReader(file_path)
            
            for page_num, page in enumerate(pdf_reader.pages):
                # Extract text
                text = page.extract_text()
                
                # If text is empty or very short, try OCR
                if not text or len(text) < 50:
                    # Convert page to image and use OCR
                    try:
                        from pdf2image import convert_from_path
                        images = convert_from_path(file_path, first_page=page_num + 1, last_page=page_num + 1)
                        if images:
                            text = self.ocr_service.extract_text_from_image(images[0])
                    except ImportError:
                        # pdf2image not available, use basic text
                        pass
                
                page_obj = Page(page_num + 1, text)
                processed_doc.pages.append(page_obj)
                
                # Extract tables from page
                tables = self._extract_tables_from_text(text, page_num + 1)
                processed_doc.tables.extend(tables)
                
        except Exception as e:
            raise ValueError(f"Error processing PDF: {str(e)}")
    
    def _process_docx(self, file_path: str, processed_doc: ProcessedDocument):
        """Process DOCX document"""
        try:
            doc = DocxDocument(file_path)
            
            page_num = 1
            current_content = ""
            
            for para in doc.paragraphs:
                current_content += para.text + "\n"
                
                # Simple page break detection (heuristic)
                if len(current_content) > 3000:  # Approximate page size
                    page_obj = Page(page_num, current_content.strip())
                    processed_doc.pages.append(page_obj)
                    current_content = ""
                    page_num += 1
            
            # Add remaining content
            if current_content.strip():
                page_obj = Page(page_num, current_content.strip())
                processed_doc.pages.append(page_obj)
            
            # Extract tables from document
            for table in doc.tables:
                table_data = []
                for row in table.rows:
                    row_data = [cell.text for cell in row.cells]
                    table_data.append(row_data)
                
                if table_data:
                    table_obj = Table(
                        name=f"Table_{len(processed_doc.tables) + 1}",
                        headers=table_data[0] if table_data else [],
                        rows=table_data[1:] if len(table_data) > 1 else [],
                        metadata={"source": "docx"}
                    )
                    processed_doc.tables.append(table_obj)
                    
        except Exception as e:
            raise ValueError(f"Error processing DOCX: {str(e)}")

    def _process_markdown(self, file_path: str, processed_doc: ProcessedDocument):
        """Process Markdown document (plain text with headings and pipe tables)."""
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()

            page_num = 1
            current_content = ""

            for line in content.splitlines():
                current_content += line + "\n"

                # Simple page break detection (heuristic, mirrors DOCX handling)
                if len(current_content) > 3000:
                    page_text = current_content.strip()
                    page_obj = Page(page_num, page_text)
                    processed_doc.pages.append(page_obj)

                    # Extract pipe/tab tables from the page
                    tables = self._extract_tables_from_text(page_text, page_num)
                    processed_doc.tables.extend(tables)

                    current_content = ""
                    page_num += 1

            # Add remaining content
            if current_content.strip():
                page_obj = Page(page_num, current_content.strip())
                processed_doc.pages.append(page_obj)
                tables = self._extract_tables_from_text(page_obj.content, page_num)
                processed_doc.tables.extend(tables)

            # Fallback: if content was too short to form a page, emit one blank page
            if not processed_doc.pages:
                processed_doc.pages.append(Page(1, content.strip()))

        except Exception as e:
            raise ValueError(f"Error processing Markdown: {str(e)}")
    
    def _process_image(self, file_path: str, processed_doc: ProcessedDocument):
        """Process image document using OCR"""
        try:
            image = Image.open(file_path)
            text = self.ocr_service.extract_text_from_image(image)
            
            page_obj = Page(1, text)
            processed_doc.pages.append(page_obj)
            
        except Exception as e:
            raise ValueError(f"Error processing image: {str(e)}")
    
    def _extract_tables_from_text(self, text: str, page_number: int) -> List[Table]:
        """Extract tables from text content (simple heuristic-based approach)"""
        tables = []
        
        # Simple table detection: look for tab-separated or pipe-separated content
        lines = text.split('\n')
        potential_table_lines = []
        
        for line in lines:
            if '\t' in line or '|' in line:
                potential_table_lines.append(line)
        
        if len(potential_table_lines) >= 2:
            # Try to parse as table
            try:
                separator = '\t' if '\t' in potential_table_lines[0] else '|'
                rows = [line.split(separator) for line in potential_table_lines]
                
                if rows and all(len(row) == len(rows[0]) for row in rows):
                    table = Table(
                        name=f"Table_page_{page_number}",
                        headers=rows[0],
                        rows=rows[1:],
                        metadata={"page": page_number, "source": "extracted"}
                    )
                    tables.append(table)
            except:
                pass
        
        return tables
    
    def _extract_document_metadata(self, processed_doc: ProcessedDocument):
        """Extract metadata from document content"""
        # Extract first 200 words as summary
        all_text = " ".join(page.content for page in processed_doc.pages)
        words = all_text.split()
        summary = " ".join(words[:200])
        processed_doc.metadata["summary"] = summary
        
        # Detect document type based on content
        content_lower = all_text.lower()
        if any(keyword in content_lower for keyword in ['manual', 'guide', 'instruction']):
            processed_doc.metadata["document_type"] = "manual"
        elif any(keyword in content_lower for keyword in ['procedure', 'step', 'process']):
            processed_doc.metadata["document_type"] = "procedure"
        elif any(keyword in content_lower for keyword in ['wiring', 'circuit', 'schematic']):
            processed_doc.metadata["document_type"] = "wiring_diagram"
        elif any(keyword in content_lower for keyword in ['part', 'component', 'bill of material']):
            processed_doc.metadata["document_type"] = "parts_list"
        else:
            processed_doc.metadata["document_type"] = "other"
        
        # Detect equipment categories
        equipment_keywords = {
            'engine': ['engine', 'motor', 'turbine'],
            'transmission': ['transmission', 'gearbox', 'clutch'],
            'electrical': ['electrical', 'circuit', 'voltage', 'current'],
            'hydraulic': ['hydraulic', 'fluid', 'pressure', 'pump'],
            'pneumatic': ['pneumatic', 'air', 'compressor']
        }
        
        detected_categories = []
        for category, keywords in equipment_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                detected_categories.append(category)
        
        processed_doc.metadata["categories"] = detected_categories
    
    def chunk_document(self, processed_doc: ProcessedDocument,
                      chunk_size: int = None, overlap: int = None) -> List[Chunk]:
        """Chunk document content for RAG processing"""
        chunk_size = chunk_size or settings.CHUNK_SIZE
        overlap = overlap or settings.CHUNK_OVERLAP
        min_chunk_size = settings.MIN_CHUNK_SIZE
        
        chunks = []
        
        for page in processed_doc.pages:
            content = page.content
            if not content.strip():
                continue
            
            # Simple sliding window chunking
            words = content.split()
            
            for i in range(0, len(words), chunk_size - overlap):
                chunk_words = words[i:i + chunk_size]
                chunk_text = " ".join(chunk_words)
                
                # Skip chunks that are too small (except the last one)
                if len(chunk_words) < min_chunk_size and i + chunk_size < len(words):
                    continue
                
                metadata = {
                    "document_id": processed_doc.document_id,
                    "filename": processed_doc.filename,
                    "page_number": page.page_number,
                    "chunk_number": len(chunks) + 1,
                    "section_title": page.content.split('\n')[0][:100] if page.content else "",
                    "file_type": processed_doc.file_type
                }
                
                chunk = Chunk(chunk_text, metadata)
                chunks.append(chunk)
        
        return chunks
    
    def extract_tables(self, page_content: str, page_number: int) -> List[Table]:
        """Extract tables from page content"""
        return self._extract_tables_from_text(page_content, page_number)
    
    def extract_diagrams(self, page_image: bytes, page_number: int) -> List[Diagram]:
        """Extract diagrams from page image (placeholder for advanced image analysis)"""
        # This is a placeholder - actual diagram extraction would require
        # advanced image processing and ML models
        diagrams = []
        
        # Simple heuristic: detect if image might be a diagram
        try:
            image = Image.open(page_image)
            # Add basic diagram detection logic here
            pass
        except:
            pass
        
        return diagrams
