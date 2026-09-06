import os
import json
import pickle
import hashlib
import math
from typing import List, Dict, Any, Optional
import numpy as np
from datetime import datetime

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

from app.config import settings


class HashEmbedder:
    """Deterministic, dependency-free fallback embedding model.

    Produces a normalized pseudo-embedding of `settings.EMBEDDING_DIMENSION`
    dimensions from token hashes. This keeps the vector store fully functional
    when sentence-transformers/torch are not installed. Semantic quality is
    lower than a real model, but hybrid + keyword search still work well.
    Caches embeddings so repeated texts are cheap.
    """

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.cache = {}

    def _features(self, text: str) -> np.ndarray:
        tokens = text.lower().split()
        vec = np.zeros(self.dimension, dtype=np.float32)
        for tok in tokens[:1024]:
            h = int(hashlib.md5(tok.encode("utf-8")).hexdigest()[:8], 16)
            idx = h % self.dimension
            sign = 1.0 if (h >> 16) % 2 == 0 else -1.0
            vec[idx] += sign
        n = np.linalg.norm(vec)
        return vec / n if n > 0 else vec

    def encode(self, text, convert_to_numpy=False):
        if isinstance(text, str):
            key = hash(text)
            if key not in self.cache:
                self.cache[key] = self._features(text)
            return self.cache[key]
        # batch
        return np.stack([self._features(t) for t in text])


def get_embedding_model(model_name: str, dimension: int):
    """Return a real sentence-transformer or a safe fallback embedder."""
    if SENTENCE_TRANSFORMERS_AVAILABLE:
        try:
            return _STModel(model_name)
        except Exception as e:
            print(f"Warning: could not load '{model_name}' ({e}). Using hash fallback embedder.")
    else:
        print("Note: sentence-transformers not installed. Using hash fallback embedder "
              f"({dimension}d). Install 'sentence-transformers' for higher quality embeddings.")
    return HashEmbedder(dimension)


class _STModel:
    """Thin wrapper around a loaded SentenceTransformer."""

    def __init__(self, model_name: str):
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()

    def encode(self, texts, convert_to_numpy=False):
        return self.model.encode(texts, convert_to_numpy=convert_to_numpy)


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
        """Load the embedding model (real model or fallback)"""
        if self.model is None:
            self.model = get_embedding_model(self.model_name, self.dimension)
            if isinstance(self.model, _STModel):
                self.dimension = self.model.dimension
    
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
            if isinstance(embedding, np.ndarray):
                embedding_list = embedding.tolist()
            else:
                embedding_list = list(embedding)
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
            if isinstance(embeddings, np.ndarray):
                return embeddings.tolist()
            return [list(e) for e in embeddings]
        except Exception as e:
            print(f"Error generating batch embeddings: {e}")
            return [[0.0] * self.dimension for _ in texts]


class NumpyIndex:
    """Dependency-free brute-force index that mimics the FAISS API subset used here.

    Provides add/search/ntotal and pickling so the whole vector pipeline works
    without the faiss native package. Good for local development and CI.
    """

    def __init__(self, dimension: int):
        self.dimension = dimension
        self.vectors = np.zeros((0, dimension), dtype=np.float32)

    @property
    def ntotal(self) -> int:
        return self.vectors.shape[0]

    def add(self, embeddings):
        arr = np.asarray(embeddings, dtype=np.float32)
        if arr.ndim == 1:
            arr = arr.reshape(1, -1)
        self.vectors = np.vstack([self.vectors, arr])

    def search(self, query, k: int):
        arr = np.asarray(query, dtype=np.float32)
        k = min(k, self.ntotal)
        if k == 0:
            return np.zeros((arr.shape[0], 0), dtype=np.float32), np.full((arr.shape[0], 0), -1, dtype=np.int64)
        # Cosine-based distance for normalized vectors
        q_norm = arr / (np.linalg.norm(arr, axis=1, keepdims=True) + 1e-12)
        v_norm = self.vectors / (np.linalg.norm(self.vectors, axis=1, keepdims=True) + 1e-12)
        sims = q_norm @ v_norm.T
        # Convert similarity (range ~ -1..1) to a FAISS-like L2 distance for the callsite
        distances = np.sqrt(np.maximum(2.0 - 2.0 * sims, 0.0))
        indices = np.full((arr.shape[0], k), -1, dtype=np.int64)
        for row_i in range(sims.shape[0]):
            top = np.argpartition(sims[row_i], -k)[-k:]
            top = top[np.argsort(-sims[row_i][top])]
            indices[row_i] = top
            distances[row_i] = distances[row_i][top]
        return distances, indices


class VectorStore:
    """Vector store service for semantic search using FAISS"""
    
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.index = None
        self.index_type = "numpy"
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
        
        # Try to load existing index
        self._load_index()
        
        if self.index is None:
            # Create new index
            self._create_index()
        
        self.initialized = True
    
    def _create_index(self):
        """Create a new index (FAISS or numpy fallback)"""
        if FAISS_AVAILABLE:
            try:
                self.index = faiss.IndexFlatL2(self.dimension)
                self.index_type = "faiss"
                print(f"Created new FAISS index with dimension {self.dimension}")
                return
            except Exception as e:
                print(f"Error creating FAISS index: {e}, falling back to numpy index")
        
        self.index = NumpyIndex(self.dimension)
        self.index_type = "numpy"
        print(f"Created numpy fallback index with dimension {self.dimension}")
    
    def _load_index(self):
        """Load existing index from disk"""
        try:
            index_path = os.path.join(self.vector_db_path, "faiss.index")
            numpy_path = os.path.join(self.vector_db_path, "numpy.index.pkl")
            metadata_path = os.path.join(self.vector_db_path, "metadata.pkl")
            
            if os.path.exists(metadata_path):
                with open(metadata_path, 'rb') as f:
                    self.metadata = pickle.load(f)
            
            if FAISS_AVAILABLE and os.path.exists(index_path):
                self.index = faiss.read_index(index_path)
                self.index_type = "faiss"
                print(f"Loaded existing FAISS index with {self.index.ntotal} vectors")
            elif os.path.exists(numpy_path):
                with open(numpy_path, 'rb') as f:
                    self.index = pickle.load(f)
                self.index_type = "numpy"
                print(f"Loaded existing numpy index with {self.index.ntotal} vectors")
        except Exception as e:
            print(f"Error loading index: {e}")
            self.index = None
            self.metadata = {}
    
    def _save_index(self):
        """Save index to disk"""
        if self.index is None or self.index.ntotal == 0:
            return
        
        try:
            metadata_path = os.path.join(self.vector_db_path, "metadata.pkl")
            with open(metadata_path, 'wb') as f:
                pickle.dump(self.metadata, f)
            
            if self.index_type == "faiss" and FAISS_AVAILABLE:
                faiss.write_index(self.index, os.path.join(self.vector_db_path, "faiss.index"))
            else:
                with open(os.path.join(self.vector_db_path, "numpy.index.pkl"), 'wb') as f:
                    pickle.dump(self.index, f)
            
            print(f"Saved index with {self.index.ntotal} vectors (type={self.index_type})")
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
        """Perform keyword-based search using multi-term token matching"""
        import re
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with',
            'is', 'are', 'was', 'were', 'be', 'been', 'how', 'why', 'what', 'which',
            'do', 'does', 'did', 'can', 'could', 'my', 'your', 'i', 'it', 'at', 'by',
            'from', 'as', 'that', 'this', 'these', 'those', 'when', 'where', 'should'
        }
        terms = [
            t for t in re.findall(r"[A-Za-z0-9]+", query_text.lower())
            if len(t) > 2 and t not in stop_words
        ]
        if not terms:
            return []
        
        results = []
        query_lower = query_text.lower()
        
        for chunk_id, metadata in self.metadata.items():
            content_lower = metadata['content'].lower()
            
            if not any(term in content_lower for term in terms):
                continue
            
            # Score = fraction of query terms found in the chunk
            hits = sum(1 for term in terms if term in content_lower)
            score = hits / len(terms)
            
            # Boost exact-phrase matches
            if query_lower in content_lower:
                score = min(1.0, score + 0.3)
            
            # Apply filters
            if filters:
                if 'document_ids' in filters and metadata.get('document_id') not in filters['document_ids']:
                    continue
            
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
        index_type = "FAISS" if self.index_type == "faiss" else "Numpy (fallback)"
        
        return VectorStoreStats(
            total_chunks=total_chunks,
            dimension=self.dimension,
            index_type=index_type
        )
    
    async def close(self):
        """Cleanup and save index"""
        self._save_index()
