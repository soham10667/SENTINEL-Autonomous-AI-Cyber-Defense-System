import logging
import time
from typing import Dict, Any, List, Optional
import importlib

try:
    _falkordb_mod = importlib.import_module("falkordb")
    FalkorDB = getattr(_falkordb_mod, "FalkorDB", None)
except Exception:
    FalkorDB = None

from app.config import settings

logger = logging.getLogger("sentinel.database")

class FalkorDBManager:
    _instance: Optional["FalkorDBManager"] = None
    
    def __init__(self):
        self.host = settings.FALKORDB_HOST
        self.port = settings.FALKORDB_PORT
        self.graph_name = settings.FALKORDB_GRAPH
        self.client: Optional[FalkorDB] = None
        self.graph = None
        self._connected = False

    @classmethod
    def get_instance(cls) -> "FalkorDBManager":
        if cls._instance is None:
            cls._instance = FalkorDBManager()
        return cls._instance

    def reload_config(self):
        """Update host, port, and graph from active settings."""
        self.host = settings.FALKORDB_HOST
        self.port = settings.FALKORDB_PORT
        self.graph_name = settings.FALKORDB_GRAPH

    def connect(self) -> bool:
        """Establish connection to FalkorDB and select the target graph."""
        self.reload_config()
        if FalkorDB is None:
            logger.error("falkordb Python package is not installed. Run: pip install -r requirements.txt")
            return False
        try:
            logger.info(f"Connecting to FalkorDB at {self.host}:{self.port} (Graph: '{self.graph_name}')...")
            self.client = FalkorDB(host=self.host, port=self.port)
            self.graph = self.client.select_graph(self.graph_name)
            
            # Simple ping query to verify connectivity & measure latency
            start = time.time()
            self.graph.query("RETURN 1 AS ping")
            latency_ms = round((time.time() - start) * 1000, 2)
            
            self._connected = True
            logger.info(f"Successfully connected to FalkorDB graph '{self.graph_name}' ({latency_ms}ms)")
            return True
        except Exception as e:
            self._connected = False
            logger.warning(f"Could not connect to FalkorDB at {self.host}:{self.port}: {e}")
            return False

    def close(self):
        """Gracefully close the client connection."""
        self._connected = False
        self.graph = None
        self.client = None
        logger.info("FalkorDB connection closed.")

    def reconnect(self) -> bool:
        """Force close stale socket and reconnect fresh to FalkorDB."""
        self.close()
        return self.connect()

    def is_connected(self) -> bool:
        if not self._connected or not self.graph:
            return self.connect()
        try:
            self.graph.query("RETURN 1")
            return True
        except Exception:
            self._connected = False
            logger.info("FalkorDB connection dropped. Attempting automatic reconnection...")
            return self.reconnect()

    def select_graph(self, graph_name: str) -> bool:
        """Select a graph by name dynamically."""
        if not graph_name or not graph_name.strip():
            raise ValueError("Graph name cannot be empty")
        clean_name = graph_name.strip()
        self.graph_name = clean_name
        if self.client:
            self.graph = self.client.select_graph(self.graph_name)
            logger.info(f"Switched active FalkorDB graph to '{self.graph_name}'")
            return True
        return self.connect()

    def list_graphs(self) -> List[Dict[str, Any]]:
        """
        List all graphs present in FalkorDB with their node and relationship counts.
        """
        if not self.is_connected():
            return []
        
        graph_names = []
        try:
            if hasattr(self.client, "list_graphs") and callable(self.client.list_graphs):
                raw_list = self.client.list_graphs()
                graph_names = [g.decode("utf-8") if isinstance(g, bytes) else str(g) for g in raw_list]
            elif hasattr(self.client, "connection"):
                raw_list = self.client.connection.execute_command("GRAPH.LIST")
                graph_names = [g.decode("utf-8") if isinstance(g, bytes) else str(g) for g in raw_list]
        except Exception as e:
            logger.warning(f"Could not retrieve graph list via client command: {e}")
            graph_names = list(set([self.graph_name, "sentinel", "hackathon"]))

        if not graph_names:
            graph_names = [self.graph_name]

        # Ensure active graph is included
        if self.graph_name not in graph_names:
            graph_names.append(self.graph_name)

        results = []
        for g_name in sorted(graph_names):
            try:
                g_instance = self.client.select_graph(g_name)
                n_res = g_instance.query("MATCH (n) RETURN count(n) AS cnt")
                r_res = g_instance.query("MATCH ()-[r]->() RETURN count(r) AS cnt")
                n_count = n_res.result_set[0][0] if n_res and n_res.result_set else 0
                r_count = r_res.result_set[0][0] if r_res and r_res.result_set else 0
                results.append({
                    "name": g_name,
                    "node_count": n_count,
                    "relationship_count": r_count,
                    "is_active": (g_name == self.graph_name)
                })
            except Exception as ge:
                logger.debug(f"Error checking counts for graph '{g_name}': {ge}")
                results.append({
                    "name": g_name,
                    "node_count": 0,
                    "relationship_count": 0,
                    "is_active": (g_name == self.graph_name)
                })
        return results

    def check_health(self) -> Dict[str, Any]:
        """Verify real connection status, graph statistics, latency, and available graphs."""
        try:
            start = time.time()
            if not self.is_connected():
                return {
                    "connected": False,
                    "host": self.host,
                    "port": self.port,
                    "graph": self.graph_name,
                    "node_count": 0,
                    "relationship_count": 0,
                    "latency_ms": 0,
                    "available_graphs": [],
                    "error": f"Connection to FalkorDB failed at {self.host}:{self.port}. Ensure FalkorDB container is running."
                }
            
            node_res = self.graph.query("MATCH (n) RETURN count(n) AS node_count")
            rel_res = self.graph.query("MATCH ()-[r]->() RETURN count(r) AS rel_count")
            latency_ms = round((time.time() - start) * 1000, 2)
            
            node_count = node_res.result_set[0][0] if node_res and node_res.result_set else 0
            rel_count = rel_res.result_set[0][0] if rel_res and rel_res.result_set else 0
            available_graphs = self.list_graphs()

            return {
                "connected": True,
                "host": self.host,
                "port": self.port,
                "graph": self.graph_name,
                "node_count": node_count,
                "relationship_count": rel_count,
                "latency_ms": latency_ms,
                "available_graphs": available_graphs
            }
        except Exception as e:
            logger.error(f"Error checking FalkorDB health: {e}")
            return {
                "connected": False,
                "host": self.host,
                "port": self.port,
                "graph": self.graph_name,
                "node_count": 0,
                "relationship_count": 0,
                "latency_ms": 0,
                "available_graphs": [],
                "error": f"FalkorDB query error: {str(e)}"
            }

    def query(self, cypher: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Execute parameterized Cypher query with automatic error handling,
        returning a list of dictionaries with properly formatted keys.
        """
        if not self.is_connected():
            raise ConnectionError(f"Cannot execute query: FalkorDB is not connected at {self.host}:{self.port}")
        
        try:
            result = self.graph.query(cypher, params or {})
            if not result or not result.header:
                return []
            
            headers = [
                col[1].decode("utf-8") if isinstance(col[1], bytes) else str(col[1])
                for col in result.header
            ]
            records = []
            for row in result.result_set:
                record = {}
                for idx, col_name in enumerate(headers):
                    val = row[idx]
                    if isinstance(val, bytes):
                        val = val.decode("utf-8")
                    # Format node or edge objects if returned directly
                    if hasattr(val, "properties"):
                        record[col_name] = {
                            "id": getattr(val, "id", None),
                            "labels": getattr(val, "labels", []),
                            "properties": getattr(val, "properties", {})
                        }
                    else:
                        record[col_name] = val
                records.append(record)
            return records
        except Exception as e:
            logger.error(f"Cypher execution error: {e} | Query: {cypher} | Params: {params}")
            raise e

    # ----------------- GRAPH FEATURES (TASK 3) -----------------

    def get_nodes(self, label: Optional[str] = None, search: Optional[str] = None, limit: int = 100, skip: int = 0) -> List[Dict[str, Any]]:
        """Retrieve nodes with optional label filter and text search."""
        if not self.is_connected():
            return []
        
        cypher = "MATCH (n"
        if label:
            clean_label = "".join(c for c in label if c.isalnum() or c == "_")
            if clean_label:
                cypher += f":{clean_label}"
        cypher += ") "
        
        conditions = []
        params: Dict[str, Any] = {"limit": limit, "skip": skip}
        
        if search:
            conditions.append(
                "(toLower(coalesce(n.name, '')) CONTAINS toLower($search) OR "
                "toLower(coalesce(n.id, '')) CONTAINS toLower($search) OR "
                "toLower(coalesce(n.title, '')) CONTAINS toLower($search) OR "
                "toLower(coalesce(n.username, '')) CONTAINS toLower($search) OR "
                "toLower(coalesce(n.hostname, '')) CONTAINS toLower($search) OR "
                "toLower(coalesce(n.ip, '')) CONTAINS toLower($search))"
            )
            params["search"] = search
            
        if conditions:
            cypher += "WHERE " + " AND ".join(conditions) + " "
            
        cypher += """
        RETURN id(n) AS internal_id, 
               labels(n)[0] AS label, 
               coalesce(n.id, n.name, toString(id(n))) AS id, 
               properties(n) AS properties
        SKIP $skip LIMIT $limit
        """
        return self.query(cypher, params)

    def get_node_by_id(self, node_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a single node by its id or internal id."""
        if not self.is_connected():
            return None
        cypher = """
        MATCH (n)
        WHERE n.id = $node_id OR n.name = $node_id OR toString(id(n)) = $node_id
        RETURN id(n) AS internal_id, 
               labels(n)[0] AS label, 
               coalesce(n.id, n.name, toString(id(n))) AS id, 
               properties(n) AS properties
        LIMIT 1
        """
        res = self.query(cypher, {"node_id": node_id})
        return res[0] if res else None

    def create_node(self, label: str, properties: Dict[str, Any]) -> Dict[str, Any]:
        """Safely create or merge a node to prevent accidental duplicates."""
        if not self.is_connected():
            raise ConnectionError("FalkorDB is not connected")
        
        clean_label = "".join(c for c in label if c.isalnum() or c == "_") or "Entity"
        node_id = str(properties.get("id") or properties.get("name") or int(time.time() * 1000))
        properties["id"] = node_id
        
        cypher = f"""
        MERGE (n:{clean_label} {{id: $node_id}})
        SET n += $props
        RETURN id(n) AS internal_id, labels(n)[0] AS label, n.id AS id, properties(n) AS properties
        """
        res = self.query(cypher, {"node_id": node_id, "props": properties})
        return res[0] if res else {"id": node_id, "label": clean_label, "properties": properties}

    def get_relationships(
        self,
        rel_type: Optional[str] = None,
        source_id: Optional[str] = None,
        target_id: Optional[str] = None,
        limit: int = 100,
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        """Retrieve graph relationships with optional type and source/target filters."""
        if not self.is_connected():
            return []
        
        type_str = ""
        if rel_type:
            clean_type = "".join(c for c in rel_type if c.isalnum() or c == "_")
            if clean_type:
                type_str = f":{clean_type}"
                
        cypher = f"MATCH (a)-[r{type_str}]->(b) "
        conditions = []
        params: Dict[str, Any] = {"limit": limit, "skip": skip}
        
        if source_id:
            conditions.append("(a.id = $source_id OR a.name = $source_id OR toString(id(a)) = $source_id)")
            params["source_id"] = source_id
        if target_id:
            conditions.append("(b.id = $target_id OR b.name = $target_id OR toString(id(b)) = $target_id)")
            params["target_id"] = target_id
            
        if conditions:
            cypher += "WHERE " + " AND ".join(conditions) + " "
            
        cypher += """
        RETURN id(r) AS id,
               type(r) AS type,
               coalesce(a.id, a.name, toString(id(a))) AS source,
               coalesce(b.id, b.name, toString(id(b))) AS target,
               properties(r) AS properties
        SKIP $skip LIMIT $limit
        """
        return self.query(cypher, params)

    def create_relationship(self, source_id: str, target_id: str, rel_type: str, properties: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Safely create or merge a relationship between two nodes."""
        if not self.is_connected():
            raise ConnectionError("FalkorDB is not connected")
        
        clean_type = "".join(c for c in rel_type if c.isalnum() or c == "_") or "CONNECTED_TO"
        props = properties or {}
        
        cypher = f"""
        MATCH (a), (b)
        WHERE (a.id = $source_id OR a.name = $source_id OR toString(id(a)) = $source_id)
          AND (b.id = $target_id OR b.name = $target_id OR toString(id(b)) = $target_id)
        MERGE (a)-[r:{clean_type}]->(b)
        SET r += $props
        RETURN id(r) AS id, type(r) AS type, 
               coalesce(a.id, a.name, toString(id(a))) AS source,
               coalesce(b.id, b.name, toString(id(b))) AS target,
               properties(r) AS properties
        LIMIT 1
        """
        res = self.query(cypher, {"source_id": source_id, "target_id": target_id, "props": props})
        if not res:
            raise ValueError(f"Could not connect '{source_id}' to '{target_id}'. Verify that both nodes exist.")
        return res[0]

    def traverse(self, start_id: str, max_depth: int = 2, direction: str = "BOTH") -> List[Dict[str, Any]]:
        """Traverse graph from starting node up to max_depth."""
        if not self.is_connected():
            return []
        
        arrow_in = "<-" if direction.upper() in ["IN", "INCOMING"] else "-"
        arrow_out = "->" if direction.upper() in ["OUT", "OUTGOING"] else "-"
        
        cypher = f"""
        MATCH path = (start){arrow_in}[r*1..{max_depth}]{arrow_out}(target)
        WHERE (start.id = $start_id OR start.name = $start_id OR toString(id(start)) = $start_id)
          AND target <> start
        RETURN 
            coalesce(target.id, target.name, toString(id(target))) AS target_id,
            labels(target)[0] AS target_label,
            properties(target) AS target_properties,
            length(path) AS depth,
            [n IN nodes(path) | coalesce(n.id, n.name, toString(id(n)))] AS path_node_ids,
            [rel IN relationships(path) | type(rel)] AS path_rel_types
        ORDER BY depth ASC
        LIMIT 50
        """
        return self.query(cypher, {"start_id": start_id})

    def search(self, query_str: str, limit: int = 30) -> Dict[str, Any]:
        """Global search across node ids, labels, names, and properties."""
        if not self.is_connected():
            return {"nodes": [], "query": query_str}
            
        cypher = """
        MATCH (n)
        WHERE toLower(coalesce(n.name, '')) CONTAINS toLower($q)
           OR toLower(coalesce(n.id, '')) CONTAINS toLower($q)
           OR toLower(coalesce(n.title, '')) CONTAINS toLower($q)
           OR toLower(coalesce(n.username, '')) CONTAINS toLower($q)
           OR toLower(coalesce(n.hostname, '')) CONTAINS toLower($q)
           OR toLower(coalesce(n.ip, '')) CONTAINS toLower($q)
           OR toLower(labels(n)[0]) CONTAINS toLower($q)
        RETURN id(n) AS internal_id, 
               labels(n)[0] AS label, 
               coalesce(n.id, n.name, toString(id(n))) AS id, 
               properties(n) AS properties
        LIMIT $limit
        """
        nodes = self.query(cypher, {"q": query_str, "limit": limit})
        return {"query": query_str, "count": len(nodes), "nodes": nodes}

    def get_insights(self) -> Dict[str, Any]:
        """Compute relationship-based insights, hub nodes, degree metrics, and graph topology."""
        if not self.is_connected():
            return {
                "status": "offline",
                "total_nodes": 0,
                "total_relationships": 0,
                "top_hubs": [],
                "isolated_nodes_count": 0,
                "label_distribution": {},
                "relationship_types": {}
            }
            
        try:
            # 1. Total counts
            health = self.check_health()
            
            # 2. Top connected hubs (highest degree centrality)
            hub_cypher = """
            MATCH (n)-[r]-()
            RETURN coalesce(n.id, n.name, toString(id(n))) AS node_id,
                   labels(n)[0] AS label,
                   count(r) AS degree
            ORDER BY degree DESC
            LIMIT 5
            """
            top_hubs = self.query(hub_cypher)
            
            # 3. Isolated nodes (degree = 0)
            iso_cypher = """
            MATCH (n)
            WHERE NOT (n)--()
            RETURN count(n) AS count
            """
            iso_res = self.query(iso_cypher)
            isolated_count = iso_res[0]["count"] if iso_res else 0
            
            # 4. Label distribution
            label_cypher = """
            MATCH (n)
            RETURN labels(n)[0] AS label, count(n) AS count
            ORDER BY count DESC
            """
            labels_res = self.query(label_cypher)
            label_dist = {r["label"]: r["count"] for r in labels_res if r.get("label")}
            
            # 5. Relationship type distribution
            rel_type_cypher = """
            MATCH ()-[r]->()
            RETURN type(r) AS type, count(r) AS count
            ORDER BY count DESC
            """
            rels_res = self.query(rel_type_cypher)
            rel_dist = {r["type"]: r["count"] for r in rels_res if r.get("type")}
            
            return {
                "status": "online",
                "graph_name": self.graph_name,
                "total_nodes": health.get("node_count", 0),
                "total_relationships": health.get("relationship_count", 0),
                "latency_ms": health.get("latency_ms", 0),
                "top_hubs": top_hubs,
                "isolated_nodes_count": isolated_count,
                "label_distribution": label_dist,
                "relationship_types": rel_dist
            }
        except Exception as e:
            logger.error(f"Error computing graph insights: {e}")
            return {
                "status": "error",
                "error": str(e)
            }

def get_db_manager() -> FalkorDBManager:
    return FalkorDBManager.get_instance()
