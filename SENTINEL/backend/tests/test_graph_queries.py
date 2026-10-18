import pytest
from app.database.falkor import get_db_manager
from app.graph.queries import fetch_graph_overview, fetch_node_neighborhood
from app.graph.traversals import find_connected_assets, trace_possible_attack_paths, get_crown_jewels
from app.simulation.seed_data import seed_enterprise_graph

def test_graph_seed_and_overview():
    """Verify that seeding creates the expected enterprise nodes and relationships."""
    db = get_db_manager()
    if not db.is_connected():
        pytest.skip("FalkorDB is not connected. Skipping test.")
        
    seed_enterprise_graph()
    overview = fetch_graph_overview()
    
    assert len(overview.nodes) >= 15
    assert len(overview.edges) >= 15
    
    # Check specific node labels exist
    labels = {n.label for n in overview.nodes}
    assert "User" in labels
    assert "Device" in labels
    assert "Server" in labels
    assert "Database" in labels

def test_crown_jewel_identification():
    """Verify that databases containing PII/Financial data are identified."""
    db = get_db_manager()
    if not db.is_connected():
        pytest.skip("FalkorDB is not connected. Skipping test.")
        
    crown_jewels = get_crown_jewels()
    assert len(crown_jewels) >= 2
    cj_ids = [c["id"] for c in crown_jewels]
    assert "DB-PROD-CUST-01" in cj_ids
    assert "DB-PAYMENTS-01" in cj_ids

def test_neighborhood_query():
    """Verify 1-hop neighborhood query on a known identity."""
    db = get_db_manager()
    if not db.is_connected():
        pytest.skip("FalkorDB is not connected. Skipping test.")
        
    nh = fetch_node_neighborhood("USR-002", depth=1)
    assert len(nh.nodes) >= 1
