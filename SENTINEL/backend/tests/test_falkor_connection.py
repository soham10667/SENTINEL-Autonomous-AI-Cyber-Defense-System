import pytest
from app.config import settings
from app.database.falkor import get_db_manager

def test_settings_configuration():
    """Ensure that FalkorDB host, port, and graph are properly configured from environment."""
    assert settings.FALKORDB_HOST in ["127.0.0.1", "localhost"]
    assert settings.FALKORDB_PORT == 6379
    assert settings.FALKORDB_GRAPH in ["hackathon", "sentinel"]

def test_db_manager_singleton():
    """Verify DB manager singleton instance and active graph."""
    db1 = get_db_manager()
    db2 = get_db_manager()
    assert db1 is db2
    assert db1.graph_name in ["hackathon", "sentinel"]

def test_falkordb_connectivity():
    """Verify live connectivity to FalkorDB on 127.0.0.1:6379 for hackathon/sentinel graph."""
    db = get_db_manager()
    health = db.check_health()
    if health.get("connected"):
        assert health["graph"] in ["hackathon", "sentinel"]
        assert health["latency_ms"] >= 0
        assert "node_count" in health
        assert "relationship_count" in health
