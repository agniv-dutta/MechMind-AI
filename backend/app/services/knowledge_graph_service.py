import os
import json
import pickle
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

try:
    import networkx as nx
    NETWORKX_AVAILABLE = True
except ImportError:
    NETWORKX_AVAILABLE = False

try:
    from neo4j import GraphDatabase
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False

from app.config import settings


class Entity:
    """Represents an entity in the knowledge graph"""
    def __init__(self, name: str, entity_type: str, document_id: str, page: int, 
                 confidence: float = 1.0, properties: Dict[str, Any] = None):
        self.id = str(uuid.uuid4())
        self.name = name
        self.entity_type = entity_type
        self.document_id = document_id
        self.page = page
        self.confidence = confidence
        self.properties = properties or {}


class Relationship:
    """Represents a relationship between entities"""
    def __init__(self, entity1: str, entity2: str, relationship_type: str, 
                 document_id: str, confidence: float = 1.0):
        self.id = str(uuid.uuid4())
        self.entity1 = entity1
        self.entity2 = entity2
        self.relationship_type = relationship_type
        self.document_id = document_id
        self.confidence = confidence


class Path:
    """Represents a path between entities in the graph"""
    def __init__(self, entities: List[Entity], relationships: List[Relationship], 
                 reasoning: str = ""):
        self.entities = entities
        self.relationships = relationships
        self.reasoning = reasoning


class GraphStats:
    """Statistics about the knowledge graph"""
    def __init__(self, total_entities: int, total_relationships: int, 
                 entity_types: Dict[str, int], relationship_types: Dict[str, int], 
                 density: float):
        self.total_entities = total_entities
        self.total_relationships = total_relationships
        self.entity_types = entity_types
        self.relationship_types = relationship_types
        self.density = density


class KnowledgeGraphService:
    """Service for building and querying knowledge graphs"""
    
    def __init__(self, persist_path: str = None):
        self.use_neo4j = settings.USE_NEO4J and NEO4J_AVAILABLE
        self.persist_path = persist_path or settings.KNOWLEDGE_GRAPH_PATH
        self.graph = None
        self.neo4j_driver = None
        self.entities: Dict[str, Entity] = {}  # name -> Entity
        self.relationships: List[Relationship] = []
        self.entity_document_map: Dict[str, List[Dict[str, Any]]] = {}  # entity -> documents
        
        if not NETWORKX_AVAILABLE:
            print("Warning: networkx not available. Knowledge graph will be limited.")
        
        if self.use_neo4j:
            self._init_neo4j()
        else:
            self._init_networkx()
            self._load_from_disk()
    
    def _persist_to_disk(self):
        """Save entities/relationships to disk so data survives restarts"""
        if self.use_neo4j:
            return
        try:
            data = {
                'entities': [
                    {'id': e.id, 'name': e.name, 'entity_type': e.entity_type,
                     'document_id': e.document_id, 'page': e.page,
                     'confidence': e.confidence, 'properties': e.properties}
                    for e in self.entities.values()
                ],
                'relationships': [
                    {'id': r.id, 'entity1': r.entity1, 'entity2': r.entity2,
                     'relationship_type': r.relationship_type,
                     'document_id': r.document_id, 'confidence': r.confidence}
                    for r in self.relationships
                ]
            }
            os.makedirs(os.path.dirname(self.persist_path), exist_ok=True)
            with open(self.persist_path, 'wb') as f:
                pickle.dump(data, f)
        except Exception as e:
            print(f"Error persisting knowledge graph: {e}")
    
    def _load_from_disk(self):
        """Load entities/relationships from disk and rebuild graph"""
        if not os.path.exists(self.persist_path):
            return
        try:
            with open(self.persist_path, 'rb') as f:
                data = pickle.load(f)
            for ed in data.get('entities', []):
                entity = Entity(
                    name=ed['name'],
                    entity_type=ed['entity_type'],
                    document_id=ed.get('document_id', ''),
                    page=ed.get('page', 1),
                    confidence=ed.get('confidence', 1.0),
                    properties=ed.get('properties', {})
                )
                entity.id = ed.get('id', entity.id)
                self.entities[entity.name] = entity
                self.entity_document_map.setdefault(entity.name, []).append({
                    'document_id': entity.document_id,
                    'page': entity.page,
                    'confidence': entity.confidence
                })
                if self.graph is not None:
                    self.graph.add_node(entity.name, type=entity.entity_type,
                                        document_id=entity.document_id,
                                        page=entity.page, confidence=entity.confidence,
                                        properties=json.dumps(entity.properties))
            for rd in data.get('relationships', []):
                rel = Relationship(
                    entity1=rd['entity1'],
                    entity2=rd['entity2'],
                    relationship_type=rd['relationship_type'],
                    document_id=rd.get('document_id', ''),
                    confidence=rd.get('confidence', 1.0)
                )
                rel.id = rd.get('id', rel.id)
                self.relationships.append(rel)
                if self.graph is not None:
                    self.graph.add_edge(rel.entity1, rel.entity2,
                                        relationship_type=rel.relationship_type,
                                        document_id=rel.document_id, confidence=rel.confidence)
            print(f"Loaded knowledge graph: {len(self.entities)} entities, {len(self.relationships)} relationships")
        except Exception as e:
            print(f"Error loading knowledge graph from disk: {e}")
            self.entities = {}
            self.relationships = []
            self.entity_document_map = {}
    
    def _init_networkx(self):
        """Initialize in-memory graph using networkx"""
        if NETWORKX_AVAILABLE:
            self.graph = nx.DiGraph()
            print("Initialized in-memory knowledge graph using networkx")
    
    def _init_neo4j(self):
        """Initialize Neo4j connection"""
        try:
            self.neo4j_driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
            )
            # Test connection
            with self.neo4j_driver.session() as session:
                session.run("RETURN 1")
            print("Connected to Neo4j knowledge graph")
        except Exception as e:
            print(f"Failed to connect to Neo4j: {e}. Falling back to in-memory graph.")
            self.use_neo4j = False
            self._init_networkx()
    
    async def initialize(self):
        """Initialize the knowledge graph service"""
        if self.use_neo4j:
            self._create_neo4j_indexes()
    
    def _create_neo4j_indexes(self):
        """Create indexes in Neo4j for performance"""
        if not self.use_neo4j:
            return
        
        try:
            with self.neo4j_driver.session() as session:
                # Create entity name index
                session.run("CREATE INDEX entity_name IF NOT EXISTS FOR (e:Entity) ON (e.name)")
                # Create entity type index
                session.run("CREATE INDEX entity_type IF NOT EXISTS FOR (e:Entity) ON (e.type)")
        except Exception as e:
            print(f"Error creating Neo4j indexes: {e}")
    
    def build_graph_from_document(self, doc_id: str, content: str) -> bool:
        """Build knowledge graph from document content"""
        # This is a simplified implementation
        # In production, you would use an LLM to extract entities and relationships
        
        # Extract entities using simple keyword matching
        entities = self._extract_entities_simple(doc_id, content)
        
        # Add entities to graph
        for entity in entities:
            self.add_entity(entity)
        
        # Extract relationships (simplified)
        relationships = self._extract_relationships_simple(doc_id, entities)
        
        # Add relationships to graph
        for rel in relationships:
            self.add_relationship(rel)
        
        return True
    
    def _extract_entities_simple(self, doc_id: str, content: str) -> List[Entity]:
        """Simple entity extraction using keyword matching"""
        entities = []
        
        # Define industrial entity patterns
        entity_patterns = {
            'Equipment': ['pump', 'motor', 'valve', 'compressor', 'turbine', 'generator', 
                         'transformer', 'switchgear', 'actuator', 'sensor'],
            'Component': ['bearing', 'seal', 'gasket', 'impeller', 'shaft', 'housing', 
                         'rotor', 'stator', 'coil', 'circuit'],
            'System': ['hydraulic', 'electrical', 'cooling', 'lubrication', 'pneumatic', 
                      'control', 'safety', 'ventilation'],
            'Property': ['pressure', 'temperature', 'flow_rate', 'voltage', 'current', 
                        'rpm', 'torque', 'power'],
            'Material': ['steel', 'aluminum', 'copper', 'rubber', 'plastic', 'ceramic']
        }
        
        content_lower = content.lower()
        
        for entity_type, keywords in entity_patterns.items():
            for keyword in keywords:
                if keyword in content_lower:
                    entity = Entity(
                        name=keyword.capitalize(),
                        entity_type=entity_type,
                        document_id=doc_id,
                        page=1,  # Simplified - would need actual page tracking
                        confidence=0.8
                    )
                    entities.append(entity)
        
        return entities
    
    def _extract_relationships_simple(self, doc_id: str, entities: List[Entity]) -> List[Relationship]:
        """Simple relationship extraction"""
        relationships = []
        
        # Define common relationship patterns
        relationship_patterns = [
            ('Equipment', 'Component', 'is_part_of'),
            ('Equipment', 'System', 'operates_in'),
            ('Component', 'Property', 'has'),
            ('System', 'Equipment', 'contains')
        ]
        
        # Create relationships based on entity types
        for i, entity1 in enumerate(entities):
            for entity2 in entities[i+1:]:
                for type1, type2, rel_type in relationship_patterns:
                    if entity1.entity_type == type1 and entity2.entity_type == type2:
                        relationship = Relationship(
                            entity1=entity1.name,
                            entity2=entity2.name,
                            relationship_type=rel_type,
                            document_id=doc_id,
                            confidence=0.7
                        )
                        relationships.append(relationship)
        
        return relationships
    
    def add_entity(self, entity: Entity) -> str:
        """Add an entity to the knowledge graph"""
        self.entities[entity.name] = entity
        
        # Update document map
        if entity.name not in self.entity_document_map:
            self.entity_document_map[entity.name] = []
        
        self.entity_document_map[entity.name].append({
            'document_id': entity.document_id,
            'page': entity.page,
            'confidence': entity.confidence
        })
        
        if self.use_neo4j:
            self._add_entity_neo4j(entity)
        elif self.graph is not None:
            self.graph.add_node(
                entity.name,
                type=entity.entity_type,
                document_id=entity.document_id,
                page=entity.page,
                confidence=entity.confidence,
                properties=json.dumps(entity.properties)
            )
        
        self._persist_to_disk()
        return entity.id
    
    def _add_entity_neo4j(self, entity: Entity):
        """Add entity to Neo4j"""
        try:
            with self.neo4j_driver.session() as session:
                session.run(
                    """
                    MERGE (e:Entity {name: $name})
                    SET e.type = $type, e.document_id = $document_id, 
                        e.page = $page, e.confidence = $confidence,
                        e.properties = $properties
                    """,
                    name=entity.name,
                    type=entity.entity_type,
                    document_id=entity.document_id,
                    page=entity.page,
                    confidence=entity.confidence,
                    properties=json.dumps(entity.properties)
                )
        except Exception as e:
            print(f"Error adding entity to Neo4j: {e}")
    
    def add_relationship(self, relationship: Relationship) -> str:
        """Add a relationship to the knowledge graph"""
        self.relationships.append(relationship)
        
        if self.use_neo4j:
            self._add_relationship_neo4j(relationship)
        elif self.graph is not None:
            self.graph.add_edge(
                relationship.entity1,
                relationship.entity2,
                relationship_type=relationship.relationship_type,
                document_id=relationship.document_id,
                confidence=relationship.confidence
            )
        
        self._persist_to_disk()
        return relationship.id
    
    def _add_relationship_neo4j(self, relationship: Relationship):
        """Add relationship to Neo4j"""
        try:
            with self.neo4j_driver.session() as session:
                session.run(
                    """
                    MATCH (e1:Entity {name: $entity1})
                    MATCH (e2:Entity {name: $entity2})
                    MERGE (e1)-[r:RELATIONSHIP]->(e2)
                    SET r.type = $type, r.document_id = $document_id, r.confidence = $confidence
                    """,
                    entity1=relationship.entity1,
                    entity2=relationship.entity2,
                    type=relationship.relationship_type,
                    document_id=relationship.document_id,
                    confidence=relationship.confidence
                )
        except Exception as e:
            print(f"Error adding relationship to Neo4j: {e}")
    
    def query_entities(self, entity_name: str, entity_type: str = None) -> List[Entity]:
        """Query entities by name and/or type
        
        With no filters, returns all entities. Filters are applied when provided.
        """
        results = []
        
        for entity in self.entities.values():
            if entity_name and entity_name.lower() not in entity.name.lower():
                continue
            if entity_type and entity.entity_type != entity_type:
                continue
            results.append(entity)
        
        return results
    
    def get_entities_for_document(self, doc_id: str) -> List[Entity]:
        """Return all entities that were extracted from a given document"""
        return [e for e in self.entities.values() if e.document_id == doc_id]
    
    def find_relationships(self, entity1: str, entity2: str = None, 
                          relationship_type: str = None) -> List[Relationship]:
        """Find relationships between entities"""
        results = []
        
        for rel in self.relationships:
            if entity1 and rel.entity1 == entity1:
                if entity2 is None or rel.entity2 == entity2:
                    if relationship_type is None or rel.relationship_type == relationship_type:
                        results.append(rel)
        
        return results
    
    def find_paths(self, start_entity: str, end_entity: str, max_depth: int = 3) -> List[Path]:
        """Find paths between entities in the graph"""
        if self.graph is None:
            return []
        
        try:
            # Find shortest paths using networkx
            paths = []
            
            if start_entity in self.graph and end_entity in self.graph:
                try:
                    try:
                        path_nodes = nx.shortest_path(
                            self.graph,
                            source=start_entity,
                            target=end_entity,
                            cutoff=max_depth
                        )
                    except TypeError:
                        # Some networkx versions dropped `cutoff` on shortest_path;
                        # use single-source BFS with an explicit cutoff instead.
                        by_source = nx.single_source_shortest_path(
                            self.graph, start_entity, cutoff=max_depth
                        )
                        if end_entity not in by_source:
                            raise nx.NetworkXNoPath
                        path_nodes = by_source[end_entity]
                    
                    if len(path_nodes) > 1:
                        # Convert to Path object
                        entities = []
                        relationships = []
                        
                        for i, node in enumerate(path_nodes):
                            if node in self.entities:
                                entities.append(self.entities[node])
                            
                            if i < len(path_nodes) - 1:
                                edge_data = self.graph.get_edge_data(path_nodes[i], path_nodes[i+1])
                                if edge_data:
                                    rel = Relationship(
                                        entity1=path_nodes[i],
                                        entity2=path_nodes[i+1],
                                        relationship_type=edge_data.get('relationship_type', 'related_to'),
                                        document_id=edge_data.get('document_id', ''),
                                        confidence=edge_data.get('confidence', 1.0)
                                    )
                                    relationships.append(rel)
                        
                        path = Path(entities, relationships)
                        paths.append(path)
                
                except nx.NetworkXNoPath:
                    pass
            
            return paths
            
        except Exception as e:
            print(f"Error finding paths: {e}")
            return []
    
    def get_graph_statistics(self) -> GraphStats:
        """Get statistics about the knowledge graph"""
        total_entities = len(self.entities)
        total_relationships = len(self.relationships)
        
        # Count entity types
        entity_types = {}
        for entity in self.entities.values():
            entity_types[entity.entity_type] = entity_types.get(entity.entity_type, 0) + 1
        
        # Count relationship types
        relationship_types = {}
        for rel in self.relationships:
            relationship_types[rel.relationship_type] = relationship_types.get(rel.relationship_type, 0) + 1
        
        # Calculate density
        density = 0.0
        if total_entities > 1:
            max_possible_edges = total_entities * (total_entities - 1)
            density = total_relationships / max_possible_edges if max_possible_edges > 0 else 0
        
        return GraphStats(
            total_entities=total_entities,
            total_relationships=total_relationships,
            entity_types=entity_types,
            relationship_types=relationship_types,
            density=density
        )
    
    def export_for_visualization(self, depth: int = 2, entity_types: List[str] = None,
                                relationship_types: List[str] = None) -> Dict[str, Any]:
        """Export graph data for visualization"""
        nodes = []
        edges = []
        
        # Filter entities by type if specified
        filtered_entities = self.entities.values()
        if entity_types:
            filtered_entities = [e for e in filtered_entities if e.entity_type in entity_types]
        
        # Create nodes
        for entity in filtered_entities:
            nodes.append({
                'id': entity.name,
                'label': entity.name,
                'type': entity.entity_type,
                'size': len(self.entity_document_map.get(entity.name, [])),
                'color': self._get_color_for_type(entity.entity_type)
            })
        
        # Filter relationships by type if specified
        filtered_relationships = self.relationships
        if relationship_types:
            filtered_relationships = [r for r in self.relationships if r.relationship_type in relationship_types]
        
        # Create edges
        for rel in filtered_relationships:
            if rel.entity1 in [n['id'] for n in nodes] and rel.entity2 in [n['id'] for n in nodes]:
                edges.append({
                    'source': rel.entity1,
                    'target': rel.entity2,
                    'type': rel.relationship_type,
                    'label': rel.relationship_type
                })
        
        # Simple clustering by entity type
        clusters = []
        entity_type_groups = {}
        for node in nodes:
            node_type = node['type']
            if node_type not in entity_type_groups:
                entity_type_groups[node_type] = []
            entity_type_groups[node_type].append(node['id'])
        
        for i, (entity_type, entity_ids) in enumerate(entity_type_groups.items()):
            clusters.append({
                'id': f'cluster_{i}',
                'name': entity_type,
                'entities': entity_ids
            })
        
        stats = self.get_graph_statistics()
        
        return {
            'nodes': nodes,
            'edges': edges,
            'clusters': clusters,
            'statistics': {
                'total_entities': stats.total_entities,
                'total_relationships': stats.total_relationships,
                'entity_types': stats.entity_types,
                'relationship_types': stats.relationship_types,
                'density': stats.density
            }
        }
    
    def _get_color_for_type(self, entity_type: str) -> str:
        """Get color for entity type for visualization"""
        color_map = {
            'Equipment': '#1f77b4',
            'Component': '#ff7f0e',
            'System': '#2ca02c',
            'Property': '#d62728',
            'Material': '#9467bd'
        }
        return color_map.get(entity_type, '#7f7f7f')
    
    async def close(self):
        """Cleanup and close connections"""
        self._persist_to_disk()
        if self.neo4j_driver:
            self.neo4j_driver.close()
    
    def delete_document(self, doc_id: str) -> int:
        """Remove all entities/relationships belonging to a document"""
        removed_entities = []
        for name, entity in list(self.entities.items()):
            if entity.document_id == doc_id:
                removed_entities.append(name)
                del self.entities[name]
                self.entity_document_map.pop(name, None)
                if self.graph is not None and self.graph.has_node(name):
                    self.graph.remove_node(name)
        
        before = len(self.relationships)
        self.relationships = [
            r for r in self.relationships if r.document_id != doc_id
        ]
        removed_rels = before - len(self.relationships)
        
        if removed_entities or removed_rels:
            self._persist_to_disk()
        return removed_rels
