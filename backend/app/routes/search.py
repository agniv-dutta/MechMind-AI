from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List

from app.schemas.query import (
    QuerySchema, SearchResponse, SearchSuggestion, SearchSuggestionsResponse,
    AdvancedSearchRequest, SearchModeEnum
)
from app.schemas.response import Citation
from app.services.rag_service import RAGService
from app.services.vector_store import VectorStore

router = APIRouter()


@router.get("/", response_model=SearchResponse)
async def search(
    q: str = Query(..., description="Search query"),
    search_mode: SearchModeEnum = Query(SearchModeEnum.HYBRID, description="Search mode"),
    k: int = Query(5, ge=1, le=20, description="Number of results"),
    min_score: float = Query(0.3, ge=0, le=1, description="Minimum confidence score"),
    document_ids: Optional[str] = Query(None, description="Comma-separated document IDs"),
    date_range: Optional[str] = Query(None, description="Date range filter")
):
    """Hybrid search across documents"""
    try:
        vector_store = VectorStore()
        await vector_store.initialize()
        
        rag_service = RAGService(vector_store)
        
        # Parse filters
        filters = {}
        if document_ids:
            filters['document_ids'] = document_ids.split(',')
        if min_score:
            filters['min_score'] = min_score
        
        # Retrieve context
        rag_context = rag_service.retrieve_context(
            query=q,
            k=k,
            search_mode=search_mode.value,
            filters=filters if filters else None
        )
        
        # Convert to search results
        from app.schemas.query import SearchResult
        results = []
        for context in rag_context.retrieved_chunks:
            results.append(SearchResult(
                chunk_id=context.chunk_id,
                content=context.content,
                source_doc=context.source_doc,
                page=context.page,
                score=context.score,
                document_id=context.chunk_id.split('_')[0] if '_' in context.chunk_id else None
            ))
        
        return SearchResponse(
            results=results,
            total_count=len(results),
            query=q,
            search_mode=search_mode,
            query_expanded_terms=None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing search: {str(e)}")


@router.get("/suggestions", response_model=SearchSuggestionsResponse)
async def search_suggestions(
    partial_query: str = Query(..., description="Partial query for autocomplete"),
    limit: int = Query(10, ge=1, le=20, description="Number of suggestions")
):
    """Auto-complete search queries"""
    try:
        # Generate suggestions based on common industrial terms
        suggestions = []
        
        # Common industrial troubleshooting terms
        common_terms = [
            "pump cavitation",
            "motor overheating",
            "valve leakage",
            "bearing failure",
            "pressure drop",
            "vibration analysis",
            "electrical fault",
            "hydraulic system",
            "sensor calibration",
            "seal replacement"
        ]
        
        # Filter matching terms
        partial_lower = partial_query.lower()
        for term in common_terms:
            if partial_lower in term.lower():
                suggestions.append(SearchSuggestion(
                    suggestion=term,
                    type="common_search",
                    relevance_score=0.9
                ))
        
        # Add the partial query itself as a suggestion
        if partial_query.strip():
            suggestions.append(SearchSuggestion(
                suggestion=partial_query,
                type="user_query",
                relevance_score=1.0
            ))
        
        # Limit results
        suggestions = suggestions[:limit]
        
        return SearchSuggestionsResponse(suggestions=suggestions)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating suggestions: {str(e)}")


@router.post("/advanced", response_model=SearchResponse)
async def advanced_search(request: AdvancedSearchRequest):
    """Advanced search with multiple filters"""
    try:
        vector_store = VectorStore()
        await vector_store.initialize()
        
        rag_service = RAGService(vector_store)
        
        # Convert filters
        filters = {}
        if request.filters.document_ids:
            filters['document_ids'] = request.filters.document_ids
        if request.filters.equipment_types:
            filters['equipment_types'] = request.filters.equipment_types
        if request.filters.categories:
            filters['categories'] = request.filters.categories
        if request.filters.confidence_min:
            filters['min_score'] = request.filters.confidence_min
        
        # Retrieve context
        rag_context = rag_service.retrieve_context(
            query=request.query,
            k=request.k,
            search_mode=request.search_mode.value,
            filters=filters if filters else None
        )
        
        # Convert to search results
        from app.schemas.query import SearchResult
        results = []
        for context in rag_context.retrieved_chunks:
            results.append(SearchResult(
                chunk_id=context.chunk_id,
                content=context.content,
                source_doc=context.source_doc,
                page=context.page,
                score=context.score,
                document_id=context.chunk_id.split('_')[0] if '_' in context.chunk_id else None
            ))
        
        # Get expanded terms
        expanded_terms = rag_service.expand_query(request.query)
        
        return SearchResponse(
            results=results,
            total_count=len(results),
            query=request.query,
            search_mode=request.search_mode,
            query_expanded_terms=expanded_terms
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing advanced search: {str(e)}")
