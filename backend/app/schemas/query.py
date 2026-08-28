from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class SearchModeEnum(str, Enum):
    """Search mode options"""
    SEMANTIC = "semantic"
    KEYWORD = "keyword"
    HYBRID = "hybrid"


class SearchFilters(BaseModel):
    """Filters for search queries"""
    document_ids: Optional[List[str]] = Field(None, description="Filter by document IDs")
    equipment_types: Optional[List[str]] = Field(None, description="Filter by equipment types")
    categories: Optional[List[str]] = Field(None, description="Filter by categories")
    date_range: Optional[Dict[str, str]] = Field(None, description="Date range filter (start, end)")
    confidence_min: Optional[float] = Field(None, ge=0, le=1, description="Minimum confidence score")


class QuerySchema(BaseModel):
    """Schema for query requests"""
    query_text: str = Field(..., min_length=1, description="Query text")
    filters: Optional[SearchFilters] = Field(None, description="Search filters")
    search_mode: SearchModeEnum = Field(default=SearchModeEnum.HYBRID, description="Search mode")
    k: int = Field(default=5, ge=1, le=20, description="Number of results to retrieve")
    model: Optional[str] = Field(None, description="LLM model to use")


class SearchResult(BaseModel):
    """Single search result"""
    chunk_id: str
    content: str
    source_doc: str
    page: int
    score: float
    section_title: Optional[str] = None
    document_id: str


class SearchResponse(BaseModel):
    """Response schema for search queries"""
    results: List[SearchResult]
    total_count: int
    query: str
    search_mode: SearchModeEnum
    query_expanded_terms: Optional[List[str]] = None


class SearchSuggestion(BaseModel):
    """Search suggestion for autocomplete"""
    suggestion: str
    type: str
    relevance_score: float


class SearchSuggestionsResponse(BaseModel):
    """Response schema for search suggestions"""
    suggestions: List[SearchSuggestion]


class AdvancedSearchRequest(BaseModel):
    """Schema for advanced search"""
    query: str
    filters: SearchFilters
    search_mode: SearchModeEnum = SearchModeEnum.HYBRID
    k: int = Field(default=10, ge=1, le=20)
