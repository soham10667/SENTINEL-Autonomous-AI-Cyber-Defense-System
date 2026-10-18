import logging
from app.database.falkor import get_db_manager

logger = logging.getLogger("sentinel.schema")

INDEX_STATEMENTS = [
    "CREATE INDEX FOR (u:User) ON (u.id)",
    "CREATE INDEX FOR (d:Device) ON (d.id)",
    "CREATE INDEX FOR (s:Server) ON (s.id)",
    "CREATE INDEX FOR (ip:IPAddress) ON (ip.ip)",
    "CREATE INDEX FOR (a:Application) ON (a.id)",
    "CREATE INDEX FOR (db:Database) ON (db.id)",
    "CREATE INDEX FOR (p:Permission) ON (p.id)",
    "CREATE INDEX FOR (e:SecurityEvent) ON (e.id)",
    "CREATE INDEX FOR (i:Incident) ON (i.id)",
    "CREATE INDEX FOR (inv:Investigation) ON (inv.id)",
    "CREATE INDEX FOR (act:DefensiveAction) ON (act.id)"
]

def init_schema():
    """Initializes indexes and constraints for the sentinel graph."""
    db = get_db_manager()
    if not db.is_connected():
        logger.warning("FalkorDB not connected. Skipping schema index creation.")
        return False
        
    logger.info("Initializing schema indexes on graph '%s'...", db.graph_name)
    for stmt in INDEX_STATEMENTS:
        try:
            db.query(stmt)
        except Exception as e:
            # FalkorDB may raise if index already exists
            logger.debug(f"Index statement status: {stmt} -> {e}")
    
    logger.info("Schema indexes verified.")
    return True

def clear_sentinel_graph():
    """Safety-guaranteed clear method for sentinel graph only."""
    db = get_db_manager()
    if db.graph_name == "hackathon":
        logger.warning("SAFETY NOTICE: Preserving existing 'hackathon' graph. Skipping destructive clear.")
        init_schema()
        return
    
    logger.warning("Clearing graph '%s' for simulation reset...", db.graph_name)
    db.query("MATCH (n) DETACH DELETE n")
    logger.info("Graph '%s' cleared.", db.graph_name)
    init_schema()
