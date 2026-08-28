from typing import List, Dict, Any, Optional
from datetime import datetime

from app.config import settings
from app.services.vector_store import VectorStore, SearchResult


class Context:
    """Represents retrieved context for RAG"""
    def __init__(self, content: str, source_doc: str, page: int, chunk_id: str, score: float):
        self.content = content
        self.source_doc = source_doc
        self.page = page
        self.chunk_id = chunk_id
        self.score = score


class RAGContext:
    """Complete RAG context with all retrieved information"""
    def __init__(self, retrieved_chunks: List[Context], sources: List[str], 
                 confidence_scores: List[float]):
        self.retrieved_chunks = retrieved_chunks
        self.sources = sources
        self.confidence_scores = confidence_scores


class RankedResult:
    """A ranked search result"""
    def __init__(self, chunk_id: str, content: str, source_doc: str, page: int, 
                 score: float, rank: int):
        self.chunk_id = chunk_id
        self.content = content
        self.source_doc = source_doc
        self.page = page
        self.score = score
        self.rank = rank


class PromptWithContext:
    """Prompt with context for LLM"""
    def __init__(self, system_prompt: str, user_prompt: str, context_chunks: List[str]):
        self.system_prompt = system_prompt
        self.user_prompt = user_prompt
        self.context_chunks = context_chunks


class RAGService:
    """Retrieval-Augmented Generation service for context retrieval and prompt generation"""
    
    def __init__(self, vector_store: VectorStore = None):
        self.vector_store = vector_store or VectorStore()
        self.min_confidence = settings.MIN_CONFIDENCE_SCORE
        self.max_results = settings.MAX_SEARCH_RESULTS
        self.semantic_weight = settings.HYBRID_SEARCH_SEMANTIC_WEIGHT
        self.keyword_weight = settings.HYBRID_SEARCH_KEYWORD_WEIGHT
    
    def retrieve_context(self, query: str, k: int = None, 
                        search_mode: str = 'hybrid', 
                        filters: Optional[Dict[str, Any]] = None) -> RAGContext:
        """Retrieve relevant context for a query"""
        k = k or self.max_results
        
        if search_mode == 'semantic':
            search_results = self._semantic_search(query, k, filters)
        elif search_mode == 'keyword':
            search_results = self._keyword_search(query, k, filters)
        else:  # hybrid
            search_results = self._hybrid_search(query, k, filters)
        
        # Filter by confidence threshold
        filtered_results = [
            r for r in search_results 
            if r.score >= self.min_confidence
        ]
        
        # Convert to Context objects
        contexts = [
            Context(
                content=r.content,
                source_doc=r.source_doc,
                page=r.page,
                chunk_id=r.chunk_id,
                score=r.score
            )
            for r in filtered_results
        ]
        
        # Extract sources and confidence scores
        sources = list(set([c.source_doc for c in contexts]))
        confidence_scores = [c.score for c in contexts]
        
        return RAGContext(contexts, sources, confidence_scores)
    
    def _semantic_search(self, query: str, k: int, 
                        filters: Optional[Dict[str, Any]] = None) -> List[SearchResult]:
        """Perform semantic search"""
        query_embedding = self.vector_store.embedding_service.embed_text(query)
        return self.vector_store.search_semantic(query_embedding, k, filters)
    
    def _keyword_search(self, query: str, k: int, 
                       filters: Optional[Dict[str, Any]] = None) -> List[SearchResult]:
        """Perform keyword search"""
        return self.vector_store.search_keyword(query, k, filters)
    
    def _hybrid_search(self, query: str, k: int, 
                       filters: Optional[Dict[str, Any]] = None) -> List[SearchResult]:
        """Perform hybrid search"""
        return self.vector_store.search_hybrid(
            query, k, self.semantic_weight, self.keyword_weight, filters
        )
    
    def rank_results(self, results: List[SearchResult], query: str) -> List[RankedResult]:
        """Rank search results by relevance"""
        # Simple ranking by score (could be enhanced with more sophisticated algorithms)
        sorted_results = sorted(results, key=lambda x: x.score, reverse=True)
        
        ranked = [
            RankedResult(
                chunk_id=r.chunk_id,
                content=r.content,
                source_doc=r.source_doc,
                page=r.page,
                score=r.score,
                rank=i + 1
            )
            for i, r in enumerate(sorted_results)
        ]
        
        return ranked
    
    def deduplicate_results(self, results: List[SearchResult]) -> List[SearchResult]:
        """Remove duplicate or very similar results"""
        seen = set()
        unique_results = []
        
        for result in results:
            # Use content hash to detect duplicates
            content_hash = hash(result.content)
            if content_hash not in seen:
                seen.add(content_hash)
                unique_results.append(result)
        
        return unique_results
    
    def generate_prompts(self, query: str, rag_context: RAGContext) -> PromptWithContext:
        """Generate prompts for LLM with context"""
        # System prompt
        system_prompt = """You are an expert industrial equipment troubleshooting assistant. Your role is to:
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
- Explain the reasoning behind each step"""
        
        # Format context chunks with source attribution
        context_chunks = []
        for i, context in enumerate(rag_context.retrieved_chunks, 1):
            chunk_text = f"""[DOCUMENT: {context.source_doc}, PAGE: {context.page}]
{context.content}"""
            context_chunks.append(chunk_text)
        
        # Combine all context
        combined_context = "\n\n".join(context_chunks)
        
        # User prompt with context
        user_prompt = f"""Technical Documentation:
{combined_context}

User Question:
{query}

Provide a detailed, citation-backed answer referencing the documentation above."""
        
        return PromptWithContext(system_prompt, user_prompt, context_chunks)
    
    def expand_query(self, query: str) -> List[str]:
        """Expand query with related terms for better retrieval"""
        expanded_queries = [query]
        
        # Industrial-specific query expansion
        query_lower = query.lower()
        
        # Synonym expansion for common industrial terms
        synonyms = {
            'pump': ['pumping', 'impeller', 'centrifugal pump'],
            'motor': ['engine', 'drive', 'electric motor'],
            'valve': ['control valve', 'solenoid valve', 'check valve'],
            'sensor': ['detector', 'transducer', 'switch'],
            'pressure': ['psi', 'bar', 'force'],
            'temperature': ['heat', 'thermal', 'temp'],
            'leak': ['seal', 'gasket', 'drip'],
            'vibration': ['shake', 'oscillation', 'noise']
        }
        
        for term, related_terms in synonyms.items():
            if term in query_lower:
                for related in related_terms:
                    expanded_query = query_lower.replace(term, related)
                    if expanded_query not in [q.lower() for q in expanded_queries]:
                        expanded_queries.append(expanded_query.capitalize())
        
        # Question reformulation
        if '?' in query:
            # Remove question mark and add statement form
            statement_form = query.replace('?', '').strip()
            if statement_form not in expanded_queries:
                expanded_queries.append(statement_form)
        
        return expanded_queries
    
    def retrieve_with_expansion(self, query: str, k: int = 5, 
                               search_mode: str = 'hybrid') -> RAGContext:
        """Retrieve context with query expansion"""
        # Get expanded queries
        expanded_queries = self.expand_query(query)
        
        all_results = []
        
        # Retrieve for each query variant
        for expanded_query in expanded_queries:
            context = self.retrieve_context(expanded_query, k * 2, search_mode)
            all_results.extend(context.retrieved_chunks)
        
        # Deduplicate and rank
        unique_results = self.deduplicate_results(all_results)
        
        # Convert back to SearchResult for ranking
        search_results = [
            SearchResult(
                chunk_id=c.chunk_id,
                content=c.content,
                source_doc=c.source_doc,
                page=c.page,
                score=c.score,
                document_id=c.chunk_id.split('_')[0] if '_' in c.chunk_id else None
            )
            for c in unique_results
        ]
        
        # Rank results
        ranked = self.rank_results(search_results, query)
        
        # Take top k
        top_results = ranked[:k]
        
        # Convert back to Context objects
        contexts = [
            Context(
                content=r.content,
                source_doc=r.source_doc,
                page=r.page,
                chunk_id=r.chunk_id,
                score=r.score
            )
            for r in top_results
        ]
        
        sources = list(set([c.source_doc for c in contexts]))
        confidence_scores = [c.score for c in contexts]
        
        return RAGContext(contexts, sources, confidence_scores)
    
    def format_context_for_llm(self, rag_context: RAGContext) -> str:
        """Format context for LLM consumption"""
        formatted_chunks = []
        
        for i, context in enumerate(rag_context.retrieved_chunks, 1):
            formatted = f"""Source {i}: {context.source_doc} (Page {context.page})
Relevance: {context.score:.2f}
Content: {context.content}"""
            formatted_chunks.append(formatted)
        
        return "\n\n---\n\n".join(formatted_chunks)
