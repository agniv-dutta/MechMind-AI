# Industrial Troubleshooting AI Assistant - Backend Setup Guide

## Project Architecture Overview

```
industrial-troubleshooting-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── document.py
│   │   │   ├── query.py
│   │   │   └── response.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── documents.py
│   │   │   ├── chat.py
│   │   │   ├── search.py
│   │   │   └── knowledge_graph.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── document_processor.py
│   │   │   ├── ocr_service.py
│   │   │   ├── rag_service.py
│   │   │   ├── vector_store.py
│   │   │   ├── knowledge_graph_service.py
│   │   │   └── ai_service.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── database.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── extractors.py
│   │       └── validators.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
└── docker-compose.yml
```

---

## PART 1: BACKEND SETUP PROMPTS FOR IDE

### Prompt 1: Initial FastAPI Project Structure & Configuration

**CONTEXT & GOALS:**
- Set up a production-ready FastAPI application
- Configure environment management, database connections, and logging
- Establish error handling and middleware
- Enable CORS for frontend communication
- Implement request/response schemas

**DETAILED INSTRUCTIONS:**

```
Create a complete FastAPI backend for an Industrial Troubleshooting AI Assistant 
with the following structure:

1. PROJECT INITIALIZATION
   - Generate requirements.txt with: fastapi, uvicorn, python-dotenv, 
     sqlalchemy, pydantic, python-multipart
   - Create .env.example with template variables
   - Create pyproject.toml with project metadata

2. MAIN APPLICATION FILE (app/main.py)
   - Initialize FastAPI app with title "Industrial Troubleshooting AI Assistant"
   - Configure CORS middleware for localhost:3000, localhost:5173, and 0.0.0.0:3000
   - Add custom exception handlers for validation and internal server errors
   - Implement request logging middleware
   - Add health check endpoint at GET /api/health
   - Include startup event for initializing vector store and knowledge graph
   - Add proper shutdown cleanup

3. CONFIGURATION MODULE (app/config.py)
   - Use BaseSettings from pydantic for environment management
   - Define settings for: API_KEY, DATABASE_URL, VECTOR_DB_PATH, 
     OLLAMA_MODEL, EMBEDDING_MODEL
   - Add logging configuration
   - Include validation for required environment variables

4. REQUEST/RESPONSE SCHEMAS (app/schemas/)
   - DocumentSchema: id, filename, file_type, uploaded_at, status, pages_count
   - QuerySchema: query_text, filters (document_ids, date_range), search_mode 
     (semantic/keyword/hybrid)
   - ResponseSchema: answer, citations (source_doc, page, excerpt, confidence), 
     reasoning, metadata
   - ChatMessageSchema: role, content, timestamp, source_documents
   - KnowledgeGraphSchema: entities, relationships, visualization_data

5. ERROR HANDLING
   - Custom exception classes: DocumentProcessingError, VectorStoreError, 
     AIServiceError, ValidationError
   - Global exception handlers with proper HTTP status codes and error messages
   - Structured error logging

6. DATABASE MODELS (app/models/database.py)
   - Document model: id, filename, file_type, content_hash, uploaded_at, 
     embedding_model, status
   - Metadata model: document_id, key, value
   - Citation model: document_id, page_number, text_excerpt, relevance_score
   - User model (optional): id, email, role, created_at

Ensure proper typing, docstrings, and separation of concerns.
```

---

### Prompt 2: Document Processing & OCR Integration

**CONTEXT & GOALS:**
- Handle multiple file formats (PDF, images, docx)
- Extract text from scanned documents using OCR
- Parse tables and diagrams
- Chunk documents for RAG
- Store document metadata

**DETAILED INSTRUCTIONS:**

```
Create comprehensive document processing services for the Industrial Troubleshooting AI:

1. DOCUMENT PROCESSOR SERVICE (app/services/document_processor.py)
   - Class DocumentProcessor with methods for:
     * process_document(file_path, file_type) -> ProcessedDocument
     * extract_pages(pdf_path) -> List[Page]
     * chunk_document(content, chunk_size=1024, overlap=256) -> List[Chunk]
     * extract_tables(page_content) -> List[Table]
     * extract_diagrams(page_image) -> List[Diagram]
   - Support for: PDF, PNG, JPG, DOCX
   - Implement document validation (size, format, corruption checks)
   - Return: structured content with metadata, page breaks, section headers
   - Error handling for corrupted or unsupported files

2. OCR SERVICE (app/services/ocr_service.py)
   - Class OCRService for scanned document processing
   - Use Tesseract for text extraction with language support
   - Methods:
     * extract_text_from_image(image_path, language='eng') -> Text
     * extract_text_from_pdf_scanned(pdf_path) -> Text
     * detect_text_regions(image) -> List[BoundingBox]
     * extract_handwritten_annotations(image) -> List[Annotation]
   - Preprocessing: image enhancement, denoising, rotation detection
   - Confidence scoring for extracted text
   - Return structured OCR data with bounding boxes and confidence levels

3. TABLE EXTRACTION (within DocumentProcessor)
   - Detect table structures using image processing
   - Extract cell content and relationships
   - Convert to structured format (JSON or CSV)
   - Return: Table(name, headers, rows, metadata)

4. DIAGRAM ANALYSIS (within DocumentProcessor)
   - Identify diagram types (wiring diagrams, flowcharts, technical drawings)
   - Extract labels, connections, and component information
   - Return: Diagram(type, components, connections, metadata)

5. DOCUMENT CHUNKING STRATEGY
   - Semantic chunking: break on section headers and logical boundaries
   - Sliding window chunking with overlap for context preservation
   - Preserve metadata: source document, page number, section title
   - Maximum chunk size: 1024 tokens, minimum: 256 tokens
   - Return: List[Chunk(content, metadata, embedding_metadata)]

6. FILE HANDLING & STORAGE
   - Create upload directory structure: uploads/{document_id}/
   - Implement file validation: size (max 100MB), format, MIME type
   - Store original files and processed outputs separately
   - Implement cleanup for failed uploads
   - Add file versioning for updated documents

7. METADATA EXTRACTION
   - Extract from document properties: title, author, creation date, version
   - Identify document type: manual, procedure, wiring diagram, parts list
   - Extract references to other documents (cross-references)
   - Generate document summary (first 200 words)
   - Tag with categories: engine, transmission, electrical, hydraulic, etc.

8. TESTING & VALIDATION
   - Test with sample PDF, scanned image, docx files
   - Validate OCR accuracy with known documents
   - Ensure chunk overlap works correctly
   - Test error handling for corrupted files

Install requirements: pypdf, pdf2image, pytesseract, python-docx, 
pillow, opencv-python, numpy
```

---

### Prompt 3: Vector Database Setup & RAG Service

**CONTEXT & GOALS:**
- Build embeddings pipeline for document chunks
- Implement hybrid semantic + keyword search
- Create RAG service for context retrieval
- Enable efficient similarity search
- Support multiple embedding models

**DETAILED INSTRUCTIONS:**

```
Create RAG and vector database infrastructure for the Industrial Troubleshooting AI:

1. VECTOR STORE SERVICE (app/services/vector_store.py)
   - Class VectorStore as abstraction layer
   - Methods:
     * initialize(embedding_model) -> VectorStore
     * add_documents(chunks: List[Chunk]) -> List[str] (doc_ids)
     * search_semantic(query_embedding, k=5, filters=None) -> List[Result]
     * search_keyword(query_text, k=5, filters=None) -> List[Result]
     * search_hybrid(query, k=5, semantic_weight=0.7, keyword_weight=0.3) -> List[Result]
     * update_document(doc_id, new_chunks) -> bool
     * delete_document(doc_id) -> bool
     * get_statistics() -> Stats
   - Support for: FAISS, Qdrant, or Chroma
   - Recommendation: Use FAISS for local dev, Qdrant for production

2. EMBEDDING SERVICE (within VectorStore)
   - Class EmbeddingService with methods:
     * embed_text(text) -> List[float]
     * embed_batch(texts: List[str]) -> List[List[float]]
   - Support multiple models:
     * all-MiniLM-L6-v2 (fast, lightweight)
     * all-mpnet-base-v2 (higher quality)
     * Ollama-based embeddings for local inference
   - Caching mechanism to avoid re-embedding identical text
   - Dimension handling: 384 or 768 depending on model

3. FAISS VECTOR STORE IMPLEMENTATION
   - Initialize: create index with dimension matching embedding model
   - Build: add document chunks with their embeddings
   - Metadata storage: SQLite for chunk_id -> metadata mapping
   - Search: implement k-nearest neighbor search with score normalization
   - Persistence: save/load index to disk
   - Recovery: rebuild from document database on startup if corrupted

4. HYBRID SEARCH IMPLEMENTATION
   - Semantic search: vector similarity (cosine distance)
   - Keyword search: BM25-like scoring using simple term frequency
   - Combination: weighted sum of normalized scores
   - Threshold filtering: only return results above confidence threshold
   - Re-ranking: reorder results by relevance combination
   - Return: List[SearchResult(content, source_doc, page, score, chunk_id)]

5. RAG SERVICE (app/services/rag_service.py)
   - Class RAGService with methods:
     * retrieve_context(query, k=5, search_mode='hybrid') -> List[Context]
     * rank_results(results, query) -> List[RankedResult]
     * generate_prompts(query, context) -> PromptWithContext
   - Context ranking by relevance and date
   - Deduplication of similar chunks
   - Source attribution preparation
   - Create structured context for LLM: [DOCUMENT: X, PAGE: Y] CONTENT
   - Return: RAGContext(retrieved_chunks, sources, confidence_scores)

6. QUERY EXPANSION
   - Implement query expansion for better retrieval:
     * Synonym expansion (related industrial terms)
     * Question reformulation (rephrase as statements)
     * Multi-hop queries for complex troubleshooting scenarios
   - Generate multiple query variants and aggregate results
   - Weight original query results higher

7. FILTERING & METADATA
   - Support document-level filters: document_id, document_type, category
   - Date range filtering: uploaded_after, uploaded_before
   - Confidence score filtering: min_score threshold
   - Return filter statistics with results

8. PERFORMANCE OPTIMIZATION
   - Implement caching for frequently queried terms
   - Batch processing for multiple queries
   - Async indexing for new documents
   - Index compression for large deployments
   - Memory-efficient data structures

9. TESTING & MONITORING
   - Track retrieval quality metrics: precision, recall
   - Monitor embedding quality and vector dimensions
   - Test with real industrial technical queries
   - Benchmark search speed for large document sets

Install requirements: faiss-cpu, sentence-transformers, rank-bm25, 
qdrant-client (for production), chroma
```

---

### Prompt 4: Knowledge Graph Generation & Storage

**CONTEXT & GOALS:**
- Extract entities and relationships from documents
- Build queryable knowledge graphs
- Enable multi-hop reasoning for troubleshooting
- Visualize equipment and system relationships
- Support complex queries across documents

**DETAILED INSTRUCTIONS:**

```
Create knowledge graph infrastructure for industrial troubleshooting:

1. KNOWLEDGE GRAPH SERVICE (app/services/knowledge_graph_service.py)
   - Class KnowledgeGraphService with methods:
     * build_graph_from_document(doc_id, content) -> Graph
     * add_entities(entities: List[Entity]) -> List[str]
     * add_relationships(relationships: List[Relationship]) -> List[str]
     * query_entities(entity_name, entity_type=None) -> List[Entity]
     * find_relationships(entity1, entity2) -> List[Relationship]
     * find_paths(start_entity, end_entity, max_depth=3) -> List[Path]
     * get_graph_statistics() -> Stats
     * export_for_visualization() -> VisualizationData
   - Support Neo4j backend for production
   - Use in-memory graph (networkx) for development

2. ENTITY EXTRACTION (using LLM)
   - Extract industrial entities from text:
     * Equipment: pump, motor, valve, sensor, PLC, drive
     * Components: bearing, seal, impeller, shaft, housing
     * Systems: hydraulic, electrical, cooling, lubrication
     * Processes: startup, shutdown, maintenance, troubleshooting
     * Properties: pressure, temperature, flow_rate, voltage, RPM
     * Materials: steel, rubber, aluminum, copper
   - Structure: Entity(name, type, document_id, page, confidence)
   - Implement entity disambiguation and normalization

3. RELATIONSHIP EXTRACTION
   - Extract relationships between entities:
     * is_part_of: component is part of equipment
     * operates_in: equipment operates in system
     * requires: maintenance task requires tool/part
     * produces: equipment produces output (pressure, flow, heat)
     * connects_to: equipment connects to other equipment
     * uses: procedure uses equipment
   - Structure: Relationship(entity1, relation_type, entity2, document_id, 
     confidence)
   - Support bidirectional relationships

4. NEO4J INTEGRATION (app/services/knowledge_graph_service.py)
   - Initialize Neo4j connection in development or cloud
   - Cypher queries for:
     * Creating nodes: CREATE (e:Equipment {name: '...', type: '...'}
     * Creating relationships: CREATE (e1)-[:PART_OF]->(e2)
     * Querying: MATCH (e:Equipment)-[:PART_OF]->(s:System) RETURN e, s
     * Path finding: MATCH p=shortestPath((n1)-[*]-(n2)) RETURN p
   - Index creation for performance: CREATE INDEX ON :Equipment(name)
   - Transaction handling for batch operations

5. IN-MEMORY GRAPH (networkx) FOR DEVELOPMENT
   - Use networkx.DiGraph() for directed relationships
   - Node attributes: name, type, source_doc, page, properties
   - Edge attributes: relationship_type, confidence, document_id
   - Implement DFS/BFS for path finding
   - Export to JSON for visualization
   - Save/load graph to disk

6. ENTITY-DOCUMENT MAPPING
   - Create index: entity -> list of (document_id, page, chunk_id, context)
   - Enable reverse lookup: find all documents mentioning specific equipment
   - Track entity co-occurrence: entities frequently mentioned together
   - Build entity frequency statistics per document

7. GRAPH QUERYING & REASONING
   - Implement multi-hop queries:
     * Find all components of equipment X
     * Find all procedures affecting equipment Y
     * Find all dependencies for equipment Z
   - Implement influence graphs: if this component fails, what breaks?
   - Implement constraint propagation: if temperature high, what procedures?
   - Return query results with source attribution

8. GRAPH VISUALIZATION DATA
   - Generate node data: id, label, type, size (frequency), color (type)
   - Generate edge data: source, target, relationship_type, label
   - Implement clustering: group related entities
   - Return format: {nodes: [...], edges: [...], clusters: [...]}
   - Include statistics: total entities, relationships, density

9. MAINTENANCE & UPDATES
   - Implement incremental graph updates (add new document without rebuild)
   - Graph versioning: track changes over time
   - Cleanup: remove orphaned entities/relationships
   - Merging: handle duplicate entities across documents
   - Validation: check graph consistency

10. TESTING
    - Test entity extraction accuracy with sample documents
    - Test relationship extraction with known equipment specifications
    - Test path finding with complex system hierarchies
    - Validate graph export for visualization

Install requirements: neo4j, networkx, pyvis
```

---

### Prompt 5: AI Service & LLM Integration

**CONTEXT & GOALS:**
- Integrate with local Ollama or cloud LLMs (OpenAI, Anthropic Claude)
- Build citation-backed answer generation
- Implement reasoning chains for troubleshooting
- Support multiple models with fallback
- Add response validation and fact-checking

**DETAILED INSTRUCTIONS:**

```
Create AI service for intelligent troubleshooting responses:

1. AI SERVICE (app/services/ai_service.py)
   - Class AIService with methods:
     * initialize(model_name, provider='ollama') -> AIService
     * generate_answer(query, context, model_params=None) -> Answer
     * generate_troubleshooting_chain(problem, context) -> TroubleshootingChain
     * generate_citations(answer_text, context) -> List[Citation]
     * validate_answer(answer, context) -> ValidationResult
     * stream_response(query, context) -> Iterator[StreamChunk]
   - Support multiple providers: Ollama (local), OpenAI, Anthropic Claude
   - Implement provider selection logic based on config
   - Add request timeout and retry logic
   - Include cost tracking for cloud APIs

2. OLLAMA INTEGRATION (LOCAL LLM)
   - Class OllamaProvider:
     * connect to http://localhost:11434
     * models: mistral (fast), neural-chat (good), llama2 (large)
     * Methods: generate(prompt, model), stream(prompt, model)
     * Configuration: temperature, top_p, max_tokens
     * Health check: verify Ollama running before requests
     * Model management: pull/load models programmatically
   - Prompts optimized for local execution:
     * Concise and clear instructions
     * Fewer few-shot examples to save tokens
     * Structured output with markdown formatting

3. OPENAI INTEGRATION (CLOUD LLM)
   - Class OpenAIProvider:
     * Use gpt-4 or gpt-3.5-turbo models
     * Methods: generate(prompt), stream(prompt)
     * Cost tracking: calculate tokens and estimate cost
     * Retry logic with exponential backoff
     * Rate limiting: handle rate limit errors gracefully
     * Configuration: temperature, max_tokens, top_p
     * Token counting using tiktoken

4. ANTHROPIC CLAUDE INTEGRATION
   - Class AnthropicProvider:
     * Use Claude 3 models (Sonnet, Opus)
     * Methods: generate(prompt), stream(prompt)
     * Extended context window utilization
     * Structured output support (JSON mode)
     * Vision capabilities for diagram analysis
     * Cost calculation per API calls

5. ANSWER GENERATION PROMPTS
   a) System Prompt Template:
   """
   You are an expert industrial equipment troubleshooting assistant. Your role is to:
   1. Analyze technical problems with industrial equipment
   2. Provide clear, step-by-step troubleshooting guidance
   3. Base all answers on the provided technical documentation
   4. Cite specific sections when providing guidance
   5. Be honest about limitations and when expert help is needed
   
   When providing answers:
   - Format responses clearly with sections and bullet points
   - Number troubleshooting steps sequentially
   - Include safety warnings if applicable
   - Reference specific page numbers and equipment names
   - Explain the reasoning behind each step
   """
   
   b) User Query with Context:
   """
   Technical Documentation:
   {context_chunks_with_source}
   
   User Question:
   {query}
   
   Provide a detailed, citation-backed answer referencing the documentation above.
   """

6. CITATION GENERATION
   - Extract citations from context used in answer generation
   - Map answer sentences to source chunks
   - Generate Citation objects: (source_doc, page, excerpt, confidence)
   - Implement confidence scoring based on:
     * Vector similarity score from retrieval
     * LLM confidence in the assertion
     * Multiple source corroboration
   - Format citations for display: "According to [Manual Name] page [X]"

7. TROUBLESHOOTING CHAIN GENERATION
   - Create multi-step troubleshooting logic:
     * Problem identification from error description
     * Symptom analysis and root cause hypothesis
     * Sequential diagnostic steps with expected results
     * Resolution procedures
     * Verification steps
   - Output structure:
     ```
     {
       "problem": "Motor not starting",
       "root_causes": ["No power", "Faulty starter", "Blown fuse"],
       "steps": [
         {"step": 1, "action": "Check power supply", "expected": "Voltage OK"},
         {"step": 2, "action": "Test starter motor", "expected": "Hear click"},
         ...
       ],
       "citations": [...]
     }
     ```

8. ANSWER VALIDATION
   - Check answer against retrieved context for factual consistency
   - Verify citations actually support the claims
   - Check for hallucinations (claims not in context)
   - Validate technical accuracy of procedures
   - Return: ValidationResult(is_valid, issues, confidence_score)

9. STREAMING RESPONSES
   - Implement server-sent events (SSE) for streaming
   - Stream answer generation token by token
   - Stream citations as they're identified
   - Stream confidence scores and sources
   - Enable real-time frontend updates

10. ERROR HANDLING & FALLBACKS
    - LLM down: provide formatted context directly to user
    - Rate limit: queue request or use cheaper model
    - Timeout: return partial answer with acknowledgment
    - Low confidence: flag answer with "Limited documentation"
    - Invalid query: return structured error with suggestions

11. TESTING
    - Test with known industrial troubleshooting scenarios
    - Verify citations are accurate and relevant
    - Check answer quality across different models
    - Test streaming responses
    - Validate cost calculations

Install requirements: openai, anthropic, ollama, tiktoken, requests
```

---

### Prompt 6: API Routes & Endpoints

**CONTEXT & GOALS:**
- Create RESTful endpoints for frontend
- Implement document upload and management
- Create query and chat endpoints
- Add search, knowledge graph, and analysis endpoints
- Enable real-time streaming responses

**DETAILED INSTRUCTIONS:**

```
Create complete API endpoints for the Industrial Troubleshooting Assistant:

1. DOCUMENT MANAGEMENT ROUTES (app/routes/documents.py)
   
   POST /api/documents/upload
   - Accept multipart/form-data with file and metadata
   - Metadata: category, equipment_type, version, tags
   - Process: validate, extract, chunk, embed, store
   - Response: {document_id, filename, status, pages, entities_found, processing_time}
   - Status tracking: queued -> processing -> complete/error
   - Implement background task processing
   
   GET /api/documents
   - List all uploaded documents with pagination
   - Query params: skip, limit, sort_by, category, equipment_type
   - Response: List[{id, filename, type, uploaded_at, page_count, status}]
   
   GET /api/documents/{document_id}
   - Retrieve document details and content
   - Response: {id, filename, type, content_preview, metadata, entities, relationships}
   
   DELETE /api/documents/{document_id}
   - Delete document and remove from all indices
   - Response: {success, deleted_doc_id, removed_chunks}
   
   GET /api/documents/{document_id}/pages/{page_num}
   - Get specific page content with OCR
   - Response: {page_number, text_content, image_url, tables, diagrams}
   
   POST /api/documents/batch-upload
   - Handle multiple file uploads
   - Response: {uploaded_count, failed_count, details}

2. CHAT & QUERY ROUTES (app/routes/chat.py)
   
   POST /api/chat
   - Main chat endpoint for troubleshooting queries
   - Request: {query, conversation_history, filters, search_mode, model}
   - Process: retrieve context -> generate answer -> create citations -> stream response
   - Response (streaming): answer chunks with citations and metadata
   - Implement conversation memory (optional): store chat history
   - Timeout: 30 seconds for response
   
   GET /api/chat/history/{session_id}
   - Retrieve past conversation
   - Response: List[{role, content, timestamp, sources, citations}]
   
   POST /api/chat/stream
   - WebSocket or SSE endpoint for real-time streaming
   - Send: query, filters
   - Receive: token-by-token answer stream with source updates

3. SEARCH ROUTES (app/routes/search.py)
   
   GET /api/search
   - Hybrid search across documents
   - Query params: q (required), search_mode (semantic/keyword/hybrid), 
     k=5, min_score=0.3, document_ids=[], date_range=[]
   - Response: List[{chunk_id, content, source_doc, page, score, section_title}]
   - Include result highlighting and context snippets
   
   GET /api/search/suggestions
   - Auto-complete search queries
   - Query params: partial_query, limit=10
   - Return relevant entity/equipment names and common searches
   - Response: List[{suggestion, type, relevance_score}]
   
   POST /api/search/advanced
   - Advanced search with multiple filters
   - Request: {
       "query": "pump cavitation",
       "filters": {
         "equipment_types": ["centrifugal_pump"],
         "document_ids": ["doc_123", "doc_456"],
         "date_range": {"start": "2024-01-01", "end": "2024-12-31"},
         "confidence_min": 0.5
       },
       "search_mode": "hybrid",
       "k": 10
     }
   - Response: {results: [...], total_count, query_expanded_terms}

4. KNOWLEDGE GRAPH ROUTES (app/routes/knowledge_graph.py)
   
   GET /api/knowledge-graph/entities
   - List all entities in knowledge graph
   - Query params: type (Equipment/Component/System), limit, offset
   - Response: List[{name, type, frequency, document_count, properties}]
   
   GET /api/knowledge-graph/entities/{entity_name}
   - Get detailed entity information
   - Response: {
       "name": "Centrifugal Pump",
       "type": "Equipment",
       "properties": {...},
       "relationships": [{entity, type, confidence}],
       "documents": [{doc_id, pages, mentions_count}]
     }
   
   GET /api/knowledge-graph/relationships
   - Query relationships between entities
   - Query params: entity1, entity2, relationship_type
   - Response: List[{entity1, entity2, type, confidence, sources}]
   
   GET /api/knowledge-graph/paths
   - Find troubleshooting paths between entities
   - Query params: start_entity, end_entity, max_depth=3
   - Response: {
       "paths": [
         {"entities": [...], "relationships": [...], "reasoning": "..."}
       ],
       "path_count": int
     }
   
   GET /api/knowledge-graph/visualization
   - Export graph for visualization on frontend
   - Query params: depth=2, entity_types=[], relationship_types=[]
   - Response: {
       "nodes": [{id, label, type, size, color}],
       "edges": [{source, target, type, label}],
       "clusters": [...]
     }

5. ANALYTICS & MONITORING ROUTES (app/routes/analytics.py - optional)
   
   GET /api/analytics/dashboard
   - Dashboard statistics
   - Response: {
       "total_documents": int,
       "total_chunks": int,
       "total_entities": int,
       "vector_db_stats": {...},
       "query_stats": {...},
       "popular_queries": [...]
     }
   
   GET /api/analytics/document-stats/{document_id}
   - Statistics for specific document
   - Response: {chunks_count, entities_found, relationships_found, 
       retrieval_frequency, avg_citation_rate}

6. FIELD ASSISTANCE ROUTES (app/routes/field.py - optional)
   
   POST /api/field/quick-fix
   - Simplified response for field technicians
   - Request: {symptom, equipment_type}
   - Response: {quick_steps: [], warning: "", contact_support: bool}
   
   GET /api/field/offline-pack
   - Download minimal documentation for offline access
   - Query params: document_ids, equipment_types
   - Response: ZIP file with compressed documents, knowledge base

7. ERROR HANDLING & STATUS CODES
   - 200 OK: Successful request
   - 201 Created: Document uploaded
   - 400 Bad Request: Invalid query/parameters
   - 404 Not Found: Document or resource not found
   - 408 Request Timeout: Query took too long
   - 413 Payload Too Large: File too large
   - 422 Unprocessable Entity: File format not supported
   - 500 Internal Server Error: Server error with traceback (log only)
   - 503 Service Unavailable: Vector DB or LLM down

8. REQUEST/RESPONSE EXAMPLES

   Example 1: Chat Query
   Request:
   ```
   POST /api/chat
   {
     "query": "How do I troubleshoot cavitation in our centrifugal pump?",
     "filters": {
       "equipment_types": ["centrifugal_pump"],
       "document_ids": ["manual_pump_2024.pdf"]
     },
     "search_mode": "hybrid",
     "model": "mistral"
   }
   ```
   Response:
   ```
   {
     "answer": "Cavitation in centrifugal pumps occurs when...",
     "citations": [
       {
         "source": "Pump Operations Manual 2024.pdf",
         "page": 42,
         "excerpt": "Cavitation occurs when inlet pressure drops below...",
         "confidence": 0.95
       }
     ],
     "reasoning": "The documentation specifically covers cavitation causes...",
     "sources_used": ["manual_pump_2024.pdf"],
     "response_time_ms": 2345
   }
   ```

9. IMPLEMENTATION REQUIREMENTS
   - All endpoints return structured JSON responses
   - Include request_id for tracking and debugging
   - Add pagination for list endpoints (skip, limit, total_count)
   - Implement proper input validation with detailed error messages
   - Log all requests (query, execution time, results count)
   - Support filtering and sorting where applicable
   - Add API versioning (/api/v1/ prefix)

10. TESTING
    - Test all endpoints with valid and invalid inputs
    - Test edge cases: empty results, very large documents, timeout
    - Test error handling and status codes
    - Test pagination and filtering
    - Load test for concurrent requests

Install requirements: Already in main requirements.txt (fastapi, uvicorn, etc.)
```

---

### Prompt 7: Database Models & SQLAlchemy Setup

**CONTEXT & GOALS:**
- Define all database models for documents, metadata, and citations
- Implement proper relationships and constraints
- Create database migrations
- Enable efficient queries
- Support indexing

**DETAILED INSTRUCTIONS:**

```
Create comprehensive SQLAlchemy database models:

1. DATABASE CONFIGURATION (app/models/database.py)
   - Import: SQLAlchemy create_engine, declarative_base, sessionmaker
   - Initialize: Base = declarative_base()
   - Create engine based on DATABASE_URL from config
   - Implement session factory for dependency injection
   - Add health check function to verify DB connectivity

2. DOCUMENT MODEL
   class Document(Base):
       __tablename__ = "documents"
       
       id: str = Column(String(36), primary_key=True)
       filename: str = Column(String(255), nullable=False)
       file_type: str = Column(String(20))  # pdf, docx, png, jpg
       file_size: int = Column(Integer)
       file_hash: str = Column(String(64), unique=True)  # SHA-256
       
       # Content metadata
       total_pages: int = Column(Integer, default=0)
       extracted_text_length: int = Column(Integer)
       has_tables: bool = Column(Boolean, default=False)
       has_diagrams: bool = Column(Boolean, default=False)
       
       # Categories and tags
       equipment_type: str = Column(String(100))  # pump, motor, valve, etc.
       category: str = Column(String(100))  # manual, procedure, drawing
       version: str = Column(String(50))
       tags: str = Column(Text)  # JSON string of tags
       
       # Processing metadata
       embedding_model: str = Column(String(100))
       processing_status: str = Column(String(20))  # queued, processing, complete, error
       processing_error: str = Column(Text, nullable=True)
       chunks_count: int = Column(Integer, default=0)
       entities_found: int = Column(Integer, default=0)
       
       # Timestamps
       uploaded_at: datetime = Column(DateTime, default=datetime.utcnow)
       processed_at: datetime = Column(DateTime, nullable=True)
       updated_at: datetime = Column(DateTime, default=datetime.utcnow, 
                                     onupdate=datetime.utcnow)
       
       # Relationships
       chunks = relationship("DocumentChunk", back_populates="document", 
                            cascade="all, delete-orphan")
       metadata_entries = relationship("DocumentMetadata", back_populates="document",
                                       cascade="all, delete-orphan")
       citations = relationship("Citation", back_populates="document",
                               cascade="all, delete-orphan")
       
       __table_args__ = (
           Index('idx_equipment_type', 'equipment_type'),
           Index('idx_category', 'category'),
           Index('idx_processing_status', 'processing_status'),
       )

3. DOCUMENT CHUNK MODEL
   class DocumentChunk(Base):
       __tablename__ = "document_chunks"
       
       id: str = Column(String(36), primary_key=True)
       document_id: str = Column(String(36), ForeignKey('documents.id'), 
                                nullable=False)
       
       chunk_number: int = Column(Integer)  # Order within document
       page_number: int = Column(Integer)  # Physical page number
       section_title: str = Column(String(255))  # Section heading
       
       # Content
       content: str = Column(Text, nullable=False)
       content_hash: str = Column(String(64))  # For deduplication
       token_count: int = Column(Integer)
       
       # Embedding
       embedding: Vector = Column(Vector(384))  # Using pgvector if PostgreSQL
       embedding_model: str = Column(String(100))
       
       # Metadata for search
       has_table: bool = Column(Boolean, default=False)
       has_diagram: bool = Column(Boolean, default=False)
       has_code: bool = Column(Boolean, default=False)
       
       # Relationships
       document = relationship("Document", back_populates="chunks")
       
       __table_args__ = (
           Index('idx_document_id', 'document_id'),
           Index('idx_page_number', 'page_number'),
           Index('idx_section_title', 'section_title'),
       )

4. DOCUMENT METADATA MODEL
   class DocumentMetadata(Base):
       __tablename__ = "document_metadata"
       
       id: str = Column(String(36), primary_key=True)
       document_id: str = Column(String(36), ForeignKey('documents.id'),
                                nullable=False)
       
       key: str = Column(String(255))
       value: str = Column(Text)
       data_type: str = Column(String(50))  # string, number, date, json
       
       # Metadata management
       source: str = Column(String(100))  # extracted, user_provided, computed
       
       # Relationships
       document = relationship("Document", back_populates="metadata_entries")
       
       __table_args__ = (
           Index('idx_document_metadata', 'document_id', 'key'),
       )

5. CITATION MODEL
   class Citation(Base):
       __tablename__ = "citations"
       
       id: str = Column(String(36), primary_key=True)
       document_id: str = Column(String(36), ForeignKey('documents.id'))
       chunk_id: str = Column(String(36), ForeignKey('document_chunks.id'))
       
       page_number: int = Column(Integer)
       text_excerpt: str = Column(Text)  # The actual text cited
       
       # Quality metrics
       relevance_score: float = Column(Float)  # 0-1 relevance to query
       confidence_score: float = Column(Float)  # LLM confidence
       used_count: int = Column(Integer, default=0)  # How often this citation is used
       
       created_at: datetime = Column(DateTime, default=datetime.utcnow)
       
       # Relationships
       document = relationship("Document", back_populates="citations")
       
       __table_args__ = (
           Index('idx_document_id_citations', 'document_id'),
       )

6. ENTITY MODEL (for Knowledge Graph)
   class Entity(Base):
       __tablename__ = "entities"
       
       id: str = Column(String(36), primary_key=True)
       name: str = Column(String(255), nullable=False, unique=True)
       entity_type: str = Column(String(100))  # Equipment, Component, System, etc.
       
       # Descriptive
       description: str = Column(Text, nullable=True)
       properties: str = Column(Text)  # JSON string of properties
       
       # Tracking
       frequency: int = Column(Integer, default=1)  # Mentions count
       document_count: int = Column(Integer)  # Across how many documents
       first_seen_at: datetime = Column(DateTime, default=datetime.utcnow)
       last_seen_at: datetime = Column(DateTime)
       
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

7. RELATIONSHIP MODEL (for Knowledge Graph)
   class Relationship(Base):
       __tablename__ = "relationships"
       
       id: str = Column(String(36), primary_key=True)
       entity1_id: str = Column(String(36), ForeignKey('entities.id'))
       entity2_id: str = Column(String(36), ForeignKey('entities.id'))
       
       relationship_type: str = Column(String(100))
       # Examples: is_part_of, operates_in, connects_to, produces, uses, etc.
       
       # Quality metrics
       confidence: float = Column(Float)  # 0-1
       mention_count: int = Column(Integer, default=1)
       
       # Source tracking
       source_documents: str = Column(Text)  # JSON list of doc_ids
       created_at: datetime = Column(DateTime, default=datetime.utcnow)
       
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

8. CONVERSATION/CHAT HISTORY MODEL (Optional)
   class ChatMessage(Base):
       __tablename__ = "chat_messages"
       
       id: str = Column(String(36), primary_key=True)
       session_id: str = Column(String(36), ForeignKey('chat_sessions.id'))
       
       role: str = Column(String(20))  # user, assistant
       content: str = Column(Text)
       
       # Sources and citations
       source_documents: str = Column(Text)  # JSON list of doc_ids
       citations: str = Column(Text)  # JSON list of citations
       
       timestamp: datetime = Column(DateTime, default=datetime.utcnow)
       response_time_ms: int = Column(Integer)  # How long to generate response
       
       session = relationship("ChatSession", back_populates="messages")

   class ChatSession(Base):
       __tablename__ = "chat_sessions"
       
       id: str = Column(String(36), primary_key=True)
       created_at: datetime = Column(DateTime, default=datetime.utcnow)
       updated_at: datetime = Column(DateTime, onupdate=datetime.utcnow)
       
       # User/context info (optional)
       equipment_type: str = Column(String(100))  # Context for the session
       category: str = Column(String(100))
       
       messages = relationship("ChatMessage", back_populates="session",
                              cascade="all, delete-orphan")

9. MIGRATION SETUP (using Alembic)
   - Initialize: alembic init alembic
   - Configure: alembic/env.py to use SQLAlchemy models
   - Create migration: alembic revision --autogenerate -m "Initial migration"
   - Apply migration: alembic upgrade head
   - Track: version table tracks applied migrations

10. DATABASE INITIALIZATION
    - Script to create all tables: 
      ```python
      from app.models.database import Base, engine
      Base.metadata.create_all(bind=engine)
      ```
    - Script to seed with sample data (optional)
    - Index creation for performance

11. TESTING
    - Test with SQLite for development
    - Test with PostgreSQL for production (supports Vector type)
    - Test migrations work correctly
    - Test relationships and cascade deletes
    - Performance test with large datasets

Install requirements: sqlalchemy, psycopg2-binary (for PostgreSQL),
sqlalchemy-pgvector (if using PostgreSQL), alembic
```

---

### Prompt 8: Environment Setup, Docker & Deployment

**CONTEXT & GOALS:**
- Create production-ready Docker setup
- Configure environment variables
- Enable easy local development
- Support scalable deployment

**DETAILED INSTRUCTIONS:**

```
Create Docker and deployment configuration:

1. .env.example
   # API Configuration
   API_ENV=development
   API_KEY=your-secret-key-here
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   
   # Database
   DATABASE_URL=sqlite:///./industrial_troubleshooting.db
   # Or for PostgreSQL: postgresql://user:password@localhost/industrial_ai
   
   # Vector Store
   VECTOR_DB_TYPE=faiss  # faiss, qdrant, chroma
   VECTOR_DB_PATH=./data/vector_store
   EMBEDDING_MODEL=all-MiniLM-L6-v2
   EMBEDDING_DIMENSION=384
   
   # LLM Configuration
   LLM_PROVIDER=ollama  # ollama, openai, anthropic
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=mistral
   
   # OpenAI (if using OpenAI)
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4
   
   # Anthropic (if using Claude)
   ANTHROPIC_API_KEY=sk-ant-...
   ANTHROPIC_MODEL=claude-3-sonnet
   
   # File Upload
   UPLOAD_DIRECTORY=./uploads
   MAX_FILE_SIZE_MB=100
   
   # Logging
   LOG_LEVEL=INFO
   LOG_FILE=./logs/app.log
   
   # Neo4j (if using knowledge graph)
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=password
   
   # Search Configuration
   MIN_CONFIDENCE_SCORE=0.3
   MAX_SEARCH_RESULTS=10
   HYBRID_SEARCH_SEMANTIC_WEIGHT=0.7

2. requirements.txt
   fastapi==0.104.1
   uvicorn[standard]==0.24.0
   python-dotenv==1.0.0
   pydantic==2.5.0
   pydantic-settings==2.1.0
   
   # Database
   sqlalchemy==2.0.23
   alembic==1.13.0
   psycopg2-binary==2.9.9
   
   # Vector Store & Search
   faiss-cpu==1.7.4
   sentence-transformers==2.2.2
   qdrant-client==2.7.0
   chroma==0.4.24
   rank-bm25==0.2.2
   
   # Document Processing
   pypdf==3.17.1
   pdf2image==1.16.3
   pytesseract==0.3.10
   python-docx==0.8.11
   pillow==10.1.0
   opencv-python==4.8.1.78
   
   # Knowledge Graph
   networkx==3.2.1
   neo4j==5.14.0
   pyvis==0.3.2
   
   # LLM Integrations
   openai==1.3.5
   anthropic==0.7.1
   ollama==0.1.0
   
   # Utilities
   requests==2.31.0
   httpx==0.25.0
   python-multipart==0.0.6
   aiofiles==23.2.1
   
   # Logging & Monitoring
   python-json-logger==2.0.7
   
   # Development
   pytest==7.4.3
   pytest-asyncio==0.21.1
   black==23.12.0
   flake8==6.1.0

3. Dockerfile
   FROM python:3.11-slim
   
   WORKDIR /app
   
   # Install system dependencies
   RUN apt-get update && apt-get install -y \
       tesseract-ocr \
       libopencv-dev \
       postgresql-client \
       && rm -rf /var/lib/apt/lists/*
   
   # Copy requirements and install Python dependencies
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   # Copy application
   COPY app/ app/
   
   # Create non-root user
   RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
   USER appuser
   
   # Expose port
   EXPOSE 8000
   
   # Health check
   HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
       CMD curl -f http://localhost:8000/api/health || exit 1
   
   # Run application
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

4. docker-compose.yml (Full Stack)
   version: '3.8'
   
   services:
     # Backend API
     api:
       build: ./backend
       container_name: industrial-ai-api
       ports:
         - "8000:8000"
       environment:
         DATABASE_URL: postgresql://aiuser:aipassword@postgres:5432/industrial_ai
         VECTOR_DB_PATH: /app/data/vector_store
         NEO4J_URI: bolt://neo4j:7687
         OLLAMA_BASE_URL: http://ollama:11434
       volumes:
         - ./backend/uploads:/app/uploads
         - ./backend/data:/app/data
         - ./backend/logs:/app/logs
       depends_on:
         - postgres
         - ollama
         - neo4j
       networks:
         - ai-network
       restart: unless-stopped
     
     # PostgreSQL Database
     postgres:
       image: pgvector/pgvector:pg16
       container_name: industrial-ai-postgres
       environment:
         POSTGRES_USER: aiuser
         POSTGRES_PASSWORD: aipassword
         POSTGRES_DB: industrial_ai
       volumes:
         - postgres_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"
       networks:
         - ai-network
       restart: unless-stopped
     
     # Neo4j Knowledge Graph
     neo4j:
       image: neo4j:5.14
       container_name: industrial-ai-neo4j
       environment:
         NEO4J_AUTH: neo4j/password
       ports:
         - "7687:7687"
         - "7474:7474"
       volumes:
         - neo4j_data:/data
       networks:
         - ai-network
       restart: unless-stopped
     
     # Ollama LLM Server
     ollama:
       image: ollama/ollama:latest
       container_name: industrial-ai-ollama
       ports:
         - "11434:11434"
       volumes:
         - ollama_data:/root/.ollama
       networks:
         - ai-network
       restart: unless-stopped
       # Pull model on startup
       entrypoint: /bin/sh -c 'ollama serve & sleep 5 && ollama pull mistral'
     
     # Frontend
     frontend:
       build: ./frontend
       container_name: industrial-ai-frontend
       ports:
         - "3000:3000"
       environment:
         REACT_APP_API_URL: http://api:8000
       depends_on:
         - api
       networks:
         - ai-network
       restart: unless-stopped
   
   volumes:
     postgres_data:
     neo4j_data:
     ollama_data:
   
   networks:
     ai-network:
       driver: bridge

5. Development Setup Script (setup_dev.sh)
   #!/bin/bash
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create necessary directories
   mkdir -p uploads data/vector_store logs
   
   # Copy environment file
   cp .env.example .env
   
   # Run migrations (if using database)
   # alembic upgrade head
   
   # Download embedding model
   python -c "from sentence_transformers import SentenceTransformer; 
              SentenceTransformer('all-MiniLM-L6-v2')"
   
   echo "Development environment setup complete!"
   echo "Update .env with your configuration"
   echo "Run: uvicorn app.main:app --reload"

6. Production Deployment (Docker)
   docker build -t industrial-troubleshooting-api:latest ./backend
   docker-compose -f docker-compose.yml up -d
   
   # Initialize database
   docker-compose exec api python -c "from app.models.database import Base, engine; 
                                       Base.metadata.create_all(bind=engine)"
   
   # Check logs
   docker-compose logs -f api

7. Makefile (for development convenience)
   .PHONY: install run test lint format clean
   
   install:
       pip install -r requirements.txt
   
   run:
       uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   test:
       pytest tests/ -v
   
   lint:
       flake8 app/
       black --check app/
   
   format:
       black app/
   
   docker-build:
       docker-compose -f docker-compose.yml build
   
   docker-up:
       docker-compose -f docker-compose.yml up -d
   
   docker-logs:
       docker-compose logs -f api
   
   docker-down:
       docker-compose -f docker-compose.yml down
   
   clean:
       find . -type f -name '*.pyc' -delete
       find . -type d -name '__pycache__' -delete
       rm -rf .pytest_cache/

8. DEPLOYMENT CHECKLIST
   - Set strong API_KEY in production
   - Use PostgreSQL instead of SQLite
   - Enable HTTPS/TLS for API endpoints
   - Configure proper CORS origins for frontend domain
   - Set up log aggregation (CloudWatch, ELK)
   - Configure auto-scaling for high load
   - Set up monitoring and alerting
   - Regular database backups
   - Vector DB persistence
   - Environment-specific configuration

Install requirements: docker, docker-compose
```

---

## Summary & Quick Start

### Local Development
```bash
# Clone and setup
git clone <repo>
cd industrial-troubleshooting-ai/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your API keys

# Run
uvicorn app.main:app --reload

# Frontend runs on separate process
cd ../frontend
npm install
npm start
```

### Docker Deployment
```bash
docker-compose -f docker-compose.yml up -d
# Services available:
# - API: http://localhost:8000
# - Frontend: http://localhost:3000
# - Neo4j: http://localhost:7474
# - PostgreSQL: localhost:5432
```

### API Testing
```bash
# Upload document
curl -X POST -F "file=@manual.pdf" http://localhost:8000/api/documents/upload

# Query
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "How do I troubleshoot pump cavitation?"}' \
  http://localhost:8000/api/chat

# Search
curl "http://localhost:8000/api/search?q=motor%20won't%20start"
```

---

## Next Steps

1. **Implement Backend Services** - Start with Prompt 1-8 sequentially
2. **Frontend Development** - Use the frontend prompts provided below
3. **Integration Testing** - Test end-to-end workflows
4. **Performance Tuning** - Optimize retrieval and inference
5. **Deployment** - Move to Docker-based production setup

