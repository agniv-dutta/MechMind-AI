from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List

from app.schemas.knowledge_graph import (
    EntityListResponse, EntityDetailResponse, RelationshipResponse,
    PathResponse, VisualizationResponse, GraphStatistics
)
from app.services.knowledge_graph_service import KnowledgeGraphService

router = APIRouter()


@router.get("/entities", response_model=EntityListResponse)
async def list_entities(
    type: Optional[str] = Query(None, description="Filter by entity type"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List all entities in knowledge graph"""
    try:
        kg_service = KnowledgeGraphService()
        await kg_service.initialize()
        
        entities = kg_service.query_entities(entity_name=None, entity_type=type)
        
        # Convert to schema format
        from app.schemas.knowledge_graph import EntitySchema
        entity_schemas = []
        for entity in entities[offset:offset+limit]:
            entity_schemas.append(EntitySchema(
                id=entity.id,
                name=entity.name,
                type=entity.entity_type,
                description=entity.properties.get('description', ''),
                properties=entity.properties,
                frequency=kg_service.entity_document_map.get(entity.name, [{'document_id': entity.document_id}]).__len__(),
                document_count=len(set([doc['document_id'] for doc in kg_service.entity_document_map.get(entity.name, [])])),
                first_seen_at=entity.properties.get('first_seen_at', None),
                last_seen_at=entity.properties.get('last_seen_at', None)
            ))
        
        return EntityListResponse(
            entities=entity_schemas,
            total_count=len(entities),
            skip=offset,
            limit=limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing entities: {str(e)}")


@router.get("/entities/{entity_name}", response_model=EntityDetailResponse)
async def get_entity(entity_name: str):
    """Get detailed entity information"""
    try:
        kg_service = KnowledgeGraphService()
        await kg_service.initialize()
        
        entities = kg_service.query_entities(entity_name=entity_name)
        
        if not entities:
            raise HTTPException(status_code=404, detail="Entity not found")
        
        entity = entities[0]
        
        # Get relationships
        relationships = kg_service.find_relationships(entity_name)
        
        # Get documents
        documents = kg_service.entity_document_map.get(entity_name, [])
        
        return EntityDetailResponse(
            name=entity.name,
            type=entity.entity_type,
            properties=entity.properties,
            relationships=[
                {
                    'entity': rel.entity2,
                    'type': rel.relationship_type,
                    'confidence': rel.confidence
                }
                for rel in relationships
            ],
            documents=[
                {
                    'doc_id': doc['document_id'],
                    'pages': [doc['page']],
                    'mentions_count': 1
                }
                for doc in documents
            ]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving entity: {str(e)}")


@router.get("/relationships", response_model=RelationshipResponse)
async def get_relationships(
    entity1: Optional[str] = Query(None, description="First entity name"),
    entity2: Optional[str] = Query(None, description="Second entity name"),
    relationship_type: Optional[str] = Query(None, description="Relationship type")
):
    """Query relationships between entities"""
    try:
        kg_service = KnowledgeGraphService()
        await kg_service.initialize()
        
        relationships = kg_service.find_relationships(
            entity1=entity1,
            entity2=entity2,
            relationship_type=relationship_type
        )
        
        from app.schemas.knowledge_graph import RelationshipSchema
        relationship_schemas = []
        for rel in relationships:
            relationship_schemas.append(RelationshipSchema(
                id=rel.id,
                entity1=rel.entity1,
                entity2=rel.entity2,
                type=rel.relationship_type,
                confidence=rel.confidence,
                mention_count=1,
                source_documents=[rel.document_id],
                created_at=None
            ))
        
        return RelationshipResponse(
            relationships=relationship_schemas,
            total_count=len(relationship_schemas)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving relationships: {str(e)}")


@router.get("/paths", response_model=PathResponse)
async def find_paths(
    start_entity: str = Query(..., description="Start entity name"),
    end_entity: str = Query(..., description="End entity name"),
    max_depth: int = Query(3, ge=1, le=5, description="Maximum path depth")
):
    """Find troubleshooting paths between entities"""
    try:
        kg_service = KnowledgeGraphService()
        await kg_service.initialize()
        
        paths = kg_service.find_paths(start_entity, end_entity, max_depth)
        
        from app.schemas.knowledge_graph import GraphPath, PathNode, PathEdge
        graph_paths = []
        for path in paths:
            nodes = [
                PathNode(
                    name=entity.name,
                    type=entity.entity_type,
                    properties=entity.properties
                )
                for entity in path.entities
            ]
            
            edges = [
                PathEdge(
                    entity1=rel.entity1,
                    entity2=rel.entity2,
                    type=rel.relationship_type,
                    confidence=rel.confidence
                )
                for rel in path.relationships
            ]
            
            graph_paths.append(GraphPath(
                entities=nodes,
                relationships=edges,
                reasoning=path.reasoning
            ))
        
        return PathResponse(
            paths=graph_paths,
            path_count=len(graph_paths)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding paths: {str(e)}")


@router.get("/visualization", response_model=VisualizationResponse)
async def get_visualization(
    depth: int = Query(2, ge=1, le=3),
    entity_types: Optional[str] = Query(None, description="Comma-separated entity types"),
    relationship_types: Optional[str] = Query(None, description="Comma-separated relationship types")
):
    """Export graph for visualization on frontend"""
    try:
        kg_service = KnowledgeGraphService()
        await kg_service.initialize()
        
        # Parse filters
        entity_type_list = entity_types.split(',') if entity_types else None
        relationship_type_list = relationship_types.split(',') if relationship_types else None
        
        viz_data = kg_service.export_for_visualization(
            depth=depth,
            entity_types=entity_type_list,
            relationship_types=relationship_type_list
        )
        
        from app.schemas.knowledge_graph import VisualizationNode, VisualizationEdge, Cluster
        
        nodes = [
            VisualizationNode(**node)
            for node in viz_data['nodes']
        ]
        
        edges = [
            VisualizationEdge(**edge)
            for edge in viz_data['edges']
        ]
        
        clusters = [
            Cluster(**cluster)
            for cluster in viz_data['clusters']
        ]
        
        return VisualizationResponse(
            nodes=nodes,
            edges=edges,
            clusters=clusters,
            statistics=viz_data['statistics']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating visualization: {str(e)}")


@router.get("/statistics", response_model=GraphStatistics)
async def get_statistics():
    """Get knowledge graph statistics"""
    try:
        kg_service = KnowledgeGraphService()
        await kg_service.initialize()
        
        stats = kg_service.get_graph_statistics()
        
        return GraphStatistics(
            total_entities=stats.total_entities,
            total_relationships=stats.total_relationships,
            entity_types=stats.entity_types,
            relationship_types=stats.relationship_types,
            density=stats.density
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving statistics: {str(e)}")
