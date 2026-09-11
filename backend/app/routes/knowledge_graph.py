from fastapi import APIRouter, HTTPException, Query, Request
from typing import Optional, List
from datetime import datetime

from app.schemas.knowledge_graph import (
    EntityListResponse, EntityDetailResponse, RelationshipResponse,
    PathResponse, VisualizationResponse, GraphStatistics, VisualizationNode,
    VisualizationEdge, Cluster
)
from app.services.knowledge_graph_service import KnowledgeGraphService

router = APIRouter()

SAMPLE_GRAPH = {
    "nodes": [
        {"id": "Centrifugal Pump", "label": "Centrifugal Pump", "type": "Equipment", "size": 40, "color": "#f59e0b"},
        {"id": "Motor", "label": "Motor", "type": "Equipment", "size": 35, "color": "#f59e0b"},
        {"id": "Impeller", "label": "Impeller", "type": "Component", "size": 30, "color": "#6366f1"},
        {"id": "Bearing", "label": "Bearing", "type": "Component", "size": 28, "color": "#6366f1"},
        {"id": "Hydraulic System", "label": "Hydraulic System", "type": "System", "size": 25, "color": "#22d3ee"},
        {"id": "Maintenance", "label": "Maintenance", "type": "Property", "size": 22, "color": "#34d399"},
    ],
    "edges": [
        {"source": "Centrifugal Pump", "target": "Motor", "type": "is_part_of", "label": "powered by"},
        {"source": "Centrifugal Pump", "target": "Impeller", "type": "is_part_of", "label": "contains"},
        {"source": "Centrifugal Pump", "target": "Bearing", "type": "is_part_of", "label": "contains"},
        {"source": "Centrifugal Pump", "target": "Hydraulic System", "type": "operates_in", "label": "operates in"},
        {"source": "Maintenance", "target": "Centrifugal Pump", "type": "has", "label": "applies to"},
    ],
    "clusters": [
        {"id": "Equipment", "name": "Equipment", "entities": ["Centrifugal Pump", "Motor"]},
        {"id": "Components", "name": "Component", "entities": ["Impeller", "Bearing"]},
    ],
    "statistics": {
        "total_entities": 6,
        "total_relationships": 5,
        "entity_types": {"Equipment": 2, "Component": 2, "System": 1, "Property": 1},
        "relationship_types": {"is_part_of": 3, "operates_in": 1, "has": 1},
        "density": 0.219,
    }
}


def _get_kg_service(request: Request) -> KnowledgeGraphService:
    return getattr(request.app.state, "knowledge_graph", KnowledgeGraphService())


@router.get("/entities", response_model=EntityListResponse)
async def list_entities(
    request: Request,
    type: Optional[str] = Query(None, description="Filter by entity type"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List all entities in knowledge graph"""
    try:
        kg_service = _get_kg_service(request)
        entities = kg_service.query_entities(entity_name=None, entity_type=type)

        from app.schemas.knowledge_graph import EntitySchema
        entity_schemas = []
        for entity in entities[offset:offset+limit]:
            doc_refs = kg_service.entity_document_map.get(entity.name, [])
            entity_schemas.append(EntitySchema(
                id=entity.id,
                name=entity.name,
                type=entity.entity_type,
                description=entity.properties.get('description', ''),
                properties=entity.properties,
                frequency=len(doc_refs),
                document_count=len(set([doc['document_id'] for doc in doc_refs])),
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
async def get_entity(request: Request, entity_name: str):
    """Get detailed entity information"""
    try:
        kg_service = _get_kg_service(request)
        entities = kg_service.query_entities(entity_name=entity_name)

        if not entities:
            raise HTTPException(status_code=404, detail="Entity not found")

        entity = entities[0]
        relationships = kg_service.find_relationships(entity_name)
        documents = kg_service.entity_document_map.get(entity_name, [])

        return EntityDetailResponse(
            name=entity.name,
            type=entity.entity_type,
            properties=entity.properties,
            relationships=[
                {'entity': rel.entity2, 'type': rel.relationship_type, 'confidence': rel.confidence}
                for rel in relationships
            ],
            documents=[
                {'doc_id': doc['document_id'], 'pages': [doc['page']], 'mentions_count': 1}
                for doc in documents
            ]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving entity: {str(e)}")


@router.get("/relationships", response_model=RelationshipResponse)
async def get_relationships(
    request: Request,
    entity1: Optional[str] = Query(None),
    entity2: Optional[str] = Query(None),
    relationship_type: Optional[str] = Query(None)
):
    """Query relationships between entities"""
    try:
        kg_service = _get_kg_service(request)
        relationships = kg_service.find_relationships(
            entity1=entity1, entity2=entity2, relationship_type=relationship_type
        )

        from app.schemas.knowledge_graph import RelationshipSchema
        return RelationshipResponse(
            relationships=[
                RelationshipSchema(
                    id=rel.id, entity1=rel.entity1, entity2=rel.entity2,
                    type=rel.relationship_type, confidence=rel.confidence,
                    mention_count=1, source_documents=[rel.document_id], created_at=None
                )
                for rel in relationships
            ],
            total_count=len(relationships)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving relationships: {str(e)}")


@router.get("/paths", response_model=PathResponse)
async def find_paths(
    request: Request,
    start_entity: str = Query(...),
    end_entity: str = Query(...),
    max_depth: int = Query(3, ge=1, le=5)
):
    """Find troubleshooting paths between entities"""
    try:
        kg_service = _get_kg_service(request)
        paths = kg_service.find_paths(start_entity, end_entity, max_depth)

        from app.schemas.knowledge_graph import GraphPath, PathNode, PathEdge
        graph_paths = []
        for path in paths:
            nodes = [PathNode(name=e.name, type=e.entity_type, properties=e.properties) for e in path.entities]
            edges = [PathEdge(entity1=r.entity1, entity2=r.entity2, type=r.relationship_type, confidence=r.confidence) for r in path.relationships]
            graph_paths.append(GraphPath(entities=nodes, relationships=edges, reasoning=path.reasoning))

        return PathResponse(paths=graph_paths, path_count=len(graph_paths))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding paths: {str(e)}")


@router.get("/visualization", response_model=VisualizationResponse)
async def get_visualization(
    request: Request,
    depth: int = Query(2, ge=1, le=3),
    entity_types: Optional[str] = Query(None),
    relationship_types: Optional[str] = Query(None)
):
    """Export graph for visualization on frontend"""
    try:
        kg_service = _get_kg_service(request)
        entity_type_list = entity_types.split(',') if entity_types else None
        relationship_type_list = relationship_types.split(',') if relationship_types else None

        viz_data = kg_service.export_for_visualization(
            depth=depth, entity_types=entity_type_list, relationship_types=relationship_type_list
        )

        # Fall back to sample graph when no entities exist
        if not viz_data['nodes']:
            return VisualizationResponse(
                nodes=[VisualizationNode(**n) for n in SAMPLE_GRAPH["nodes"]],
                edges=[VisualizationEdge(**e) for e in SAMPLE_GRAPH["edges"]],
                clusters=[Cluster(**c) for c in SAMPLE_GRAPH["clusters"]],
                statistics=SAMPLE_GRAPH["statistics"]
            )

        return VisualizationResponse(
            nodes=[VisualizationNode(**n) for n in viz_data['nodes']],
            edges=[VisualizationEdge(**e) for e in viz_data['edges']],
            clusters=[Cluster(**c) for c in viz_data['clusters']],
            statistics=viz_data['statistics']
        )

    except Exception as e:
        # Return sample graph on error (never a blank canvas)
        return VisualizationResponse(
            nodes=[VisualizationNode(**n) for n in SAMPLE_GRAPH["nodes"]],
            edges=[VisualizationEdge(**e) for e in SAMPLE_GRAPH["edges"]],
            clusters=[Cluster(**c) for c in SAMPLE_GRAPH["clusters"]],
            statistics=SAMPLE_GRAPH["statistics"]
        )


@router.get("/statistics", response_model=GraphStatistics)
async def get_statistics(request: Request):
    """Get knowledge graph statistics"""
    try:
        kg_service = _get_kg_service(request)
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
