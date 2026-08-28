import os
import json
import pickle
from typing import List, Dict, Any, Optional
import numpy as np
from datetime import datetime

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False

from sentence_transformers import SentenceTransformer

from app.config import settings


class SearchResult:
    """Represents a search result from vector store"""
    def __init__(self, chunk_id: str, content: str, source_doc: str, page: int, 
                 score: float, section_title: str = None, document_id: str = None):
        self.chunk_id = chunk_id
        self.content = content
        self.source_doc = source_doc
        self.page = page
        self.score = score
        self.section_title = section_title
        self.document_id = document_id


class VectorStoreStats:
    """Statistics about the vector store"""
    def __init__(self, total_chunks: int, dimension: int, index_type: str):
        self.total_chunks = total_chunks
        self.dimension = dimension
        self.index_type = index_type


class EmbeddingService:
    """Service for generating text embeddings"""
    
    def __init__(self, model_name: str = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL
        self.dimension = settings.EMBEDDING_DIMENSION
        self.model = None
        self.cache = {}  # Simple cache for embeddings
        
    def load_model(self):
        """Load the embedding model"""
        if self.model is None:
            try:
                self.model = SentenceTransformer(self.model_name)
                # Update dimension based on actual model
                self.dimension = self.model.get_sentence_embedding_dimension()
            except Exception as e:
                print(f"Error loading embedding model: {e}")
                raise
    
    def embed_text(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        if self.model is None:
            self.load_model()
        
        # Check cache
        cache_key = hash(text)
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            embedding_list = embedding.tolist()
            
            # Cache the result
            self.cache[cache_key] = embedding_list
            
            return embedding_list
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return [0.0] * self.dimension
    
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        if self.model is None:
            self.load_model()
        
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings.tolist()
        except Exception as e:
            print(f"Error generating batch embeddings: {e}")
            return [[0.0] * self.dimension for _ in texts]


class VectorStore:
    """Vector store service for semantic search using FAISS"""
    
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.index = None
        self.metadata = {}  # chunk_id -> metadata mapping
        self.dimension = settings.EMBEDDING_DIMENSION
        self.vector_db_path = settings.VECTOR_DB_PATH
        self.initialized = False
        
        # Ensure directory exists
        os.makedirs(self.vector_db_path, exist_ok=True)
    
    async def initialize(self, embedding_model: str = None):
        """Initialize the vector store"""
        if embedding_model:
            self.embedding_service = EmbeddingService(embedding_model)
            self.embedding_service.load_model()
            self.dimension = self.embedding_service.dimension
        else:
            self.embedding_service.load_model()
            self.dimension = self.embedding_service.dimension
        
        # Try to load existing index
        self._load_index()
        
        if self.index is None:
            # Create new index
            self._create_index()
        
        self.initialized = True
    
    def _create_index(self):
        """Create a new FAISS index"""
        if not FAISS_AVAILABLE:
            print("FAISS not available. Vector store will not function properly.")
            return
        
        try:
            # Create IndexFlatL2 for L2 distance (Euclidean)
            self.index = faiss.IndexFlatL2(self.dimension)
            print(f"Created new FAISS index with dimension {self.dimension}")
        except Exception as e:
            print(f"Error creating FAISS index: {e}")
    
    def _load_index(self):
        """Load existing index from disk"""
        if not FAISS_AVAILABLE:
            return
        
        try:
            index_path = os.path.join(self.vector_db_path, "faiss.index")
            metadata_path = os.path.join(self.vector_db_path, "metadata.pkl")
            
            if os.path.exists(index_path) and os.path.exists(metadata_path):
                # Load index
                self.index = faiss.read_index(index_path)
                
                # Load metadata
                with open(metadata_path, 'rb') as f:
                    self.metadata = pickle.load(f)
                
                print(f"Loaded existing FAISS index with {self.index.ntotal} vectors")
        except Exception as e:
            print(f"Error loading index: {e}")
            self.index = None
            self.metadata = {}
    
    def _save_index(self):
        """Save index to disk"""
        if not FAISS_AVAILABLE or self.index is None:
            return
        
        try:
            index_path = os.path.join(self.vector_db_path, "faiss.index")
            metadata_path = os.path.join(self.vector_db_path, "metadata.pkl")
            
            # Save index
            faiss.write_index(self.index, index_path)
            
            # Save metadata
            with open(metadata_path, 'wb') as f:
                pickle.dump(self.metadata, f)
            
            print(f"Saved FAISS index with {self.index.ntotal} vectors")
        except Exception as e:
            print(f"Error saving index: {e}")
    
    def add_documents(self, chunks: List[Dict[str, Any]]) -> List[str]:
        """Add document chunks to the vector store"""
        if not self.initialized:
            raise RuntimeError("Vector store not initialized")
        
        chunk_ids = []
        
        try:
            # Extract texts and generate embeddings
            texts = [chunk['content'] for chunk in chunks]
            embeddings = self.embedding_service.embed_batch(texts)
            
            # Convert to numpy array
            embedding_array = np.array(embeddings, dtype=np.float32)
            
            # Add to index
            if not FAISS_AVAILABLE:
                return chunk_ids
            
            start_idx = self.index.ntotal
            self.index.add(embedding_array)
            
            # Store metadata
            for i, chunk in enumerate(chunks):
                chunk_id = chunk.get('chunk_id') or f"chunk_{start_idx + i}"
                chunk_ids.append(chunk_id)
                
                self.metadata[chunk_id] = {
                    'content': chunk['content'],
                    'document_id': chunk.get('document_id'),
                    'filename': chunk.get('filename'),
                    'page_number': chunk.get('page_number'),
                    'section_title': chunk.get('section_title'),
                    'chunk_number': chunk.get('chunk_number'),
                    'file_type': chunk.get('file_type')
                }
            
            # Save to disk
            self._save_index()
            
            return chunk_ids
            
        except Exception as e:
            print(f"Error adding documents: {e}")
            raise
    
    def search_semantic(self, query_embedding: List[float], k: int = 5, 
                       filters: Optional[Dict[str, Any]] = None) -> List[SearchResult]:
        """Perform semantic search using vector similarity"""
        if not self.initialized or self.index is None:
            return []
        
        try:
            query_array = np.array([query_embedding], dtype=np.float32)
            
            # Search
            distances, indices = self.index.search(query_array, k)
            
            results = []
            for i, (idx, distance) in enumerate(zip(indices[0], distances[0])):
                if idx == -1:  # FAISS returns -1 for invalid results
                    continue
                
                # Get chunk ID from index
                chunk_id = f"chunk_{idx}"
                if chunk_id not in self.metadata:
                    continue
                
                metadata = self.metadata[chunk_id]
                
                # Apply filters if provided
                if filters:
                    if 'document_ids' in filters and metadata.get('document_id') not in filters['document_ids']:
                        continue
                    if 'equipment_types' in filters:
                        # This would require additional metadata storage
                        pass
                
                # Convert distance to similarity score (0-1)
                score = 1.0 / (1.0 + distance)
                
                result = SearchResult(
                    chunk_id=chunk_id,
                    content=metadata['content'],
                    source_doc=metadata.get('filename', 'Unknown'),
                    page=metadata.get('page_number', 0),
                    score=score,
                    section_title=metadata.get('section_title'),
                    document_id=metadata.get('document_id')
                )
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"Error in semantic search: {e}")
            return []
    
    def search_keyword(self, query_text: str, k: int = 5, 
                      filters: Optional[Dict[str, Any]] = None) -> List[SearchResult]:
        """Perform keyword-based search"""
        results = []
        query_lower = query_text.lower()
        
        for chunk_id, metadata in self.metadata.items():
            content_lower = metadata['content'].lower()
            
            # Simple keyword matching
            if query_lower in content_lower:
                # Calculate a simple relevance score based on term frequency
                score = content_lower.count(query_lower) / len(content_lower.split())
                
                # Apply filters
                if filters:
                    if 'document_ids' in filters and metadata.get('document_id') not in filters['document_ids']:
                        continue
                
                result = SearchResult(
                    chunk_id=chunk_id,
                    content=metadata['content'],
                    source_doc=metadata.get('filename', 'Unknown'),
                    page=metadata.get('page_number', 0),
                    score=min(score, 1.0),
                    section_title=metadata.get('section_title'),
                    document_id=metadata.get('document_id')
                )
                results.append(result)
        
        # Sort by score and return top k
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:k]
    
    def search_hybrid(self, query: str, k: int = 5, 
                     semantic_weight: float = 0.7, keyword_weight: float = 0.3,
                     filters: Optional[Dict[str, Any]] = None) -> List[SearchResult]:
        """Perform hybrid search combining semantic and keyword search"""
        # Get semantic results
        query_embedding = self.embedding_service.embed_text(query)
        semantic_results = self.search_semantic(query_embedding, k * 2, filters)
        
        # Get keyword results
        keyword_results = self.search_keyword(query, k * 2, filters)
        
        # Combine and deduplicate results
        combined_scores = {}
        
        # Normalize and weight semantic scores
        max_semantic = max([r.score for r in semantic_results]) if semantic_results else 1.0
        for result in semantic_results:
            normalized_score = result.score / max_semantic if max_semantic > 0 else 0
            if result.chunk_id not in combined_scores:
                combined_scores[result.chunk_id] = {
                    'result': result,
                    'score': 0.0
                }
            combined_scores[result.chunk_id]['score'] += normalized_score * semantic_weight
        
        # Normalize and weight keyword scores
        max_keyword = max([r.score for r in keyword_results]) if keyword_results else 1.0
        for result in keyword_results:
            normalized_score = result.score / max_keyword if max_keyword > 0 else 0
            if result.chunk_id not in combined_scores:
                combined_scores[result.chunk_id] = {
                    'result': result,
                    'score': 0.0
                }
            combined_scores[result.chunk_id]['score'] += normalized_score * keyword_weight
        
        # Sort by combined score
        sorted_results = sorted(
            combined_scores.values(),
            key=lambda x: x['score'],
            reverse=True
        )
        
        # Update scores and return top k
        final_results = []
        for item in sorted_results[:k]:
            result = item['result']
            result.score = item['score']
            final_results.append(result)
        
        return final_results
    
    def update_document(self, doc_id: str, new_chunks: List[Dict[str, Any]]) -> bool:
        """Update a document in the vector store"""
        # For simplicity, we'll just add new chunks
        # In a production system, you'd want to delete old chunks first
        try:
            self.add_documents(new_chunks)
            return True
        except Exception as e:
            print(f"Error updating document: {e}")
            return False
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document from the vector store"""
        # This is complex with FAISS as it doesn't support deletion
        # For production, consider using a different vector store or rebuilding the index
        try:
            # Remove from metadata
            to_remove = [chunk_id for chunk_id, meta in self.metadata.items() 
                        if meta.get('document_id') == doc_id]
            
            for chunk_id in to_remove:
                del self.metadata[chunk_id]
            
            # Note: We can't easily remove from FAISS index without rebuilding
            # This is a limitation of FAISS
            print(f"Removed {len(to_remove)} chunks from metadata. Index rebuild required for complete deletion.")
            
            return True
        except Exception as e:
            print(f"Error deleting document: {e}")
            return False
    
    def get_statistics(self) -> VectorStoreStats:
        """Get statistics about the vector store"""
        total_chunks = len(self.metadata)
        index_type = "FAISS" if FAISS_AVAILABLE else "None"
        
        return VectorStoreStats(
            total_chunks=total_chunks,
            dimension=self.dimension,
            index_type=index_type
        )
    
    async def close(self):
        """Cleanup and save index"""
        self._save_index()
