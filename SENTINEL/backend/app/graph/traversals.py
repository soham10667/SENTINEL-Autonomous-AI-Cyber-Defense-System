import logging
from typing import Dict, Any, List, Tuple
from app.database.falkor import get_db_manager

logger = logging.getLogger("sentinel.graph.traversals")

def find_connected_assets(entity_id: str, depth: int = 2) -> List[Dict[str, Any]]:
    """Traverse and find all connected assets (User, Device, Server, Database) up to given depth."""
    db = get_db_manager()
    cypher = f"""
    MATCH (start {{id: $entity_id}})
    MATCH path = (start)-[r*1..{depth}]-(target)
    WHERE target <> start
    RETURN DISTINCT 
        target.id AS asset_id, 
        labels(target)[0] AS asset_type,
        properties(target) AS properties,
        length(path) AS hops
    ORDER BY hops ASC
    """
    try:
        results = db.query(cypher, {"entity_id": entity_id})
        return results
    except Exception as e:
        logger.error(f"Error in find_connected_assets: {e}")
        return []

def trace_possible_attack_paths(source_id: str, max_depth: int = 4) -> List[Dict[str, Any]]:
    """
    Multi-hop Cypher traversal from an origin (e.g. suspicious IP, User, Device)
    towards high-value critical assets (Databases with PII/Financial data, Critical Servers).
    Distinguishes observed connections vs inferred lateral reach.
    """
    db = get_db_manager()
    
    # Check if origin exists
    cypher = f"""
    MATCH (origin {{id: $source_id}})
    MATCH path = (origin)-[r*1..{max_depth}]->(target)
    WHERE (target:Database OR target:Server OR target.criticality IN ['CRITICAL', 'HIGH'])
      AND target <> origin
    RETURN 
        [n IN nodes(path) | {{id: n.id, label: labels(n)[0], name: coalesce(n.name, n.id), criticality: coalesce(n.criticality, 'MEDIUM')}}] AS path_nodes,
        [rel IN relationships(path) | {{type: type(rel), observed: coalesce(rel.observed, false)}}] AS path_rels,
        length(path) AS length,
        target.id AS target_id,
        labels(target)[0] AS target_type,
        coalesce(target.criticality, 'MEDIUM') AS target_criticality,
        coalesce(target.contains_pii, false) AS target_pii,
        coalesce(target.contains_financial, false) AS target_financial
    ORDER BY length ASC
    LIMIT 20
    """
    try:
        results = db.query(cypher, {"source_id": source_id})
        formatted_paths = []
        for row in results:
            nodes = row.get("path_nodes", [])
            rels = row.get("path_rels", [])
            
            # Check if all relationships in path were actively observed
            all_observed = all(rel.get("observed", False) for rel in rels) if rels else False
            
            formatted_paths.append({
                "nodes": nodes,
                "relationships": rels,
                "hop_count": row.get("length", 0),
                "target_id": row.get("target_id"),
                "target_type": row.get("target_type"),
                "target_criticality": row.get("target_criticality"),
                "is_observed_path": all_observed,
                "is_crown_jewel": row.get("target_pii", False) or row.get("target_financial", False) or row.get("target_criticality") == "CRITICAL",
                "path_summary": " -> ".join([n.get("name", n.get("id")) for n in nodes])
            })
        return formatted_paths
    except Exception as e:
        logger.error(f"Error in trace_possible_attack_paths: {e}")
        return []

def get_asset_permissions(asset_id: str) -> List[Dict[str, Any]]:
    """Get permissions and users who have access to this asset."""
    db = get_db_manager()
    cypher = """
    MATCH (u:User)-[r:HAS_ACCESS_TO]->(target {id: $asset_id})
    RETURN u.id AS user_id, u.username AS username, u.role AS role, properties(r) AS access_props
    """
    try:
        return db.query(cypher, {"asset_id": asset_id})
    except Exception as e:
        logger.error(f"Error in get_asset_permissions: {e}")
        return []

def get_crown_jewels() -> List[Dict[str, Any]]:
    """Retrieve all high-value databases and critical infrastructure."""
    db = get_db_manager()
    cypher = """
    MATCH (cj)
    WHERE (cj:Database AND (cj.contains_pii = true OR cj.contains_financial = true))
       OR cj.criticality = 'CRITICAL'
    RETURN cj.id AS id, labels(cj)[0] AS type, cj.name AS name, 
           coalesce(cj.criticality, 'HIGH') AS criticality,
           coalesce(cj.contains_pii, false) AS pii,
           coalesce(cj.contains_financial, false) AS financial
    """
    try:
        return db.query(cypher)
    except Exception as e:
        logger.error(f"Error in get_crown_jewels: {e}")
        return []
