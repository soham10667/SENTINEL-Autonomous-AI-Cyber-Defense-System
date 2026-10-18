import logging
from typing import Dict, Any, List, Optional
from app.database.falkor import get_db_manager
from app.models.schemas import GraphNode, GraphEdge, GraphData

logger = logging.getLogger("sentinel.graph.queries")

def fetch_graph_overview() -> GraphData:
    """Fetch complete graph nodes and edges for visualization."""
    db = get_db_manager()
    if not db.is_connected():
        return GraphData(nodes=[], edges=[])

    try:
        # Fetch nodes
        node_query = """
        MATCH (n)
        RETURN id(n) AS internal_id, 
               labels(n)[0] AS label, 
               coalesce(n.id, n.name, n.title, toString(id(n))) AS id, 
               properties(n) AS props
        """
        nodes_res = db.query(node_query)
        
        nodes: List[GraphNode] = []
        id_map = {}
        for r in nodes_res:
            props = r.get("props") or {}
            node_id = str(r.get("id") or props.get("id") or props.get("name") or r.get("internal_id"))
            label = r.get("label") or "Entity"
            id_map[str(r.get("internal_id"))] = node_id
            nodes.append(GraphNode(
                id=node_id,
                label=label,
                properties=props
            ))

        # Fetch relationships
        rel_query = """
        MATCH (a)-[r]->(b)
        RETURN id(r) AS rel_id, 
               type(r) AS rel_type, 
               id(a) AS a_int,
               coalesce(a.id, a.name, a.title, toString(id(a))) AS source_id, 
               id(b) AS b_int,
               coalesce(b.id, b.name, b.title, toString(id(b))) AS target_id, 
               properties(r) AS props
        """
        rels_res = db.query(rel_query)
        edges: List[GraphEdge] = []
        for r in rels_res:
            props = r.get("props") or {}
            rel_id = str(r.get("rel_id"))
            source_id = str(r.get("source_id") or id_map.get(str(r.get("a_int")), ""))
            target_id = str(r.get("target_id") or id_map.get(str(r.get("b_int")), ""))
            edges.append(GraphEdge(
                id=rel_id,
                source=source_id,
                target=target_id,
                type=r.get("rel_type") or "RELATED_TO",
                properties=props
            ))

        return GraphData(nodes=nodes, edges=edges)
    except Exception as e:
        logger.error(f"Error fetching graph overview: {e}")
        return GraphData(nodes=[], edges=[])

def fetch_node_neighborhood(node_id: str, depth: int = 1) -> GraphData:
    """Fetch node and its directly connected 1 or 2 hop neighborhood."""
    db = get_db_manager()
    if not db.is_connected():
        return GraphData(nodes=[], edges=[])

    try:
        cypher = f"""
        MATCH path = (start)-[r*1..{depth}]-(neighbor)
        WHERE start.id = $node_id OR start.name = $node_id OR toString(id(start)) = $node_id
        UNWIND nodes(path) AS n
        UNWIND relationships(path) AS rel
        RETURN DISTINCT 
            labels(n)[0] AS label, 
            coalesce(n.id, n.name, toString(id(n))) AS nid, 
            properties(n) AS nprops,
            id(rel) AS rel_id,
            type(rel) AS rel_type,
            coalesce(startNode(rel).id, startNode(rel).name, toString(id(startNode(rel)))) AS r_source,
            coalesce(endNode(rel).id, endNode(rel).name, toString(id(endNode(rel)))) AS r_target,
            properties(rel) AS rel_props
        """
        results = db.query(cypher, {"node_id": node_id})
        nodes_dict = {}
        edges_dict = {}
        
        for r in results:
            nid = str(r["nid"])
            if nid not in nodes_dict:
                nodes_dict[nid] = GraphNode(
                    id=nid,
                    label=r.get("label") or "Entity",
                    properties=r.get("nprops") or {}
                )
            
            rel_id = str(r["rel_id"])
            if rel_id not in edges_dict:
                edges_dict[rel_id] = GraphEdge(
                    id=rel_id,
                    source=str(r["r_source"]),
                    target=str(r["r_target"]),
                    type=str(r["rel_type"]),
                    properties=r.get("rel_props") or {}
                )
                
        return GraphData(nodes=list(nodes_dict.values()), edges=list(edges_dict.values()))
    except Exception as e:
        logger.error(f"Error fetching neighborhood for {node_id}: {e}")
        return GraphData(nodes=[], edges=[])
