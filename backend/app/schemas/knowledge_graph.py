from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class EntitySchema(BaseModel):
    """Entity schema for knowledge graph"""
    id: str
    name: str
    type: str
    description: Optional[str] = None
    properties: Dict[str, Any] = {}
    frequency: int = 1
    document_count: int = 0
    first_seen_at: datetime
    last_seen_at: Optional[datetime] = None


class EntityListResponse(BaseModel):
    """Response schema for entity list"""
    entities: List[EntitySchema]
    total_count: int
    skip: int
    limit: int


class EntityDetailResponse(BaseModel):
    """Response schema for entity details"""
    name: str
    type: str
    properties: Dict[str, Any] = {}
    relationships: List[Dict[str, Any]] = []
    documents: List[Dict[str, Any]] = []


class RelationshipSchema(BaseModel):
    """Relationship schema for knowledge graph"""
    id: str
    entity1: str
    entity2: str
    type: str
    confidence: float = Field(ge=0, le=1)
    mention_count: int = 1
    source_documents: List[str] = []
    created_at: datetime


class RelationshipResponse(BaseModel):
    """Response schema for relationships"""
    relationships: List[RelationshipSchema]
    total_count: int


class PathNode(BaseModel):
    """Node in a path"""
    name: str
    type: str
    properties: Dict[str, Any] = {}


class PathEdge(BaseModel):
    """Edge in a path"""
    entity1: str
    entity2: str
    type: str
    confidence: float


class GraphPath(BaseModel):
    """Path in knowledge graph"""
    entities: List[PathNode]
    relationships: List[PathEdge]
    reasoning: Optional[str] = None


class PathResponse(BaseModel):
    """Response schema for path queries"""
    paths: List[GraphPath]
    path_count: int


class VisualizationNode(BaseModel):
    """Node for graph visualization"""
    id: str
    label: str
    type: str
    size: int = 1
    color: str = "#1f77b4"


class VisualizationEdge(BaseModel):
    """Edge for graph visualization"""
    source: str
    target: str
    type: str
    label: Optional[str] = None


class Cluster(BaseModel):
    """Cluster of related entities"""
    id: str
    name: str
    entities: List[str]


class VisualizationResponse(BaseModel):
    """Response schema for graph visualization"""
    nodes: List[VisualizationNode]
    edges: List[VisualizationEdge]
    clusters: List[Cluster] = []
    statistics: Dict[str, Any] = {}


class GraphStatistics(BaseModel):
    """Knowledge graph statistics"""
    total_entities: int
    total_relationships: int
    entity_types: Dict[str, int]
    relationship_types: Dict[str, int]
    density: float
