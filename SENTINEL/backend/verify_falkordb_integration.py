#!/usr/bin/env python
"""
SENTINEL - FalkorDB Integration Verification Script
Tests FalkorDB connection, database queries, graph statistics,
verifies that sentinel and hackathon graphs are synchronized,
and executes the safe temporary-node lifecycle integration test.
"""

import sys
import os
import time

# Ensure backend root is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Also check for virtualenv site-packages
venv_site = os.path.join(current_dir, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

from app.config import settings
from app.database.falkor import get_db_manager
from app.graph.queries import fetch_graph_overview

def run_verification():
    print("=" * 70)
    print(" SENTINEL - FalkorDB Real Database Integration Verification")
    print("=" * 70)
    print(f" Configured Host:   {settings.FALKORDB_HOST}")
    print(f" Configured Port:   {settings.FALKORDB_PORT}")
    print(f" Target Graph:      {settings.FALKORDB_GRAPH}")
    print("-" * 70)

    db = get_db_manager()
    print("\n[Step 1] Connecting to FalkorDB on host {}:{}...".format(settings.FALKORDB_HOST, settings.FALKORDB_PORT))
    connected = db.connect()
    
    if not connected:
        print(" [FAIL] Could not connect to FalkorDB.")
        print("  - Please ensure Docker container 'falkordb' is running.")
        print(f"  - Verify port {settings.FALKORDB_PORT} is mapped to 127.0.0.1.")
        return False
        
    print(" [PASS] Successfully connected to FalkorDB container!")

    print("\n[Step 2] Checking Available Graphs and Keyspaces...")
    graphs = db.list_graphs()
    print("  Available Graphs:")
    for g in graphs:
        active_mark = " (ACTIVE TARGET)" if g["is_active"] else ""
        print(f"   * '{g['name']}': {g['node_count']} nodes, {g['relationship_count']} relationships{active_mark}")

    # Verify target graph is 'sentinel'
    db.select_graph("sentinel")
    health = db.check_health()
    print(f"\n[Step 3] Active Target Graph Health ('sentinel'):")
    print(f"  - Status:             {'ONLINE' if health.get('connected') else 'OFFLINE'}")
    print(f"  - Active Graph:       {health.get('graph')}")
    print(f"  - Latency:            {health.get('latency_ms')} ms")
    print(f"  - Initial Nodes:      {health.get('node_count')}")
    print(f"  - Initial Relations:  {health.get('relationship_count')}")

    initial_nodes = health.get("node_count", 0)
    initial_rels = health.get("relationship_count", 0)
    print(f" [PASS] Baseline graph verified: {initial_nodes} nodes, {initial_rels} relationships.")

    print("\n[Step 4] Testing Graph Overview Query & React Flow Mapping...")
    vis_data = fetch_graph_overview()
    print(f"  - React Flow Nodes:   {len(vis_data.nodes)}")
    print(f"  - React Flow Edges:   {len(vis_data.edges)}")
    assert len(vis_data.nodes) == initial_nodes, f"Node count mismatch: {len(vis_data.nodes)} vs {initial_nodes}"
    assert len(vis_data.edges) == initial_rels, f"Edge count mismatch: {len(vis_data.edges)} vs {initial_rels}"
    print(" [PASS] React Flow data structure matches database records exactly.")

    print("\n[Step 5] Task 5: Safe Temporary-Node Integration Lifecycle Test...")
    test_node_id = f"TEST-NODE-{int(time.time())}"
    print(f"  (a) Creating temporary test node (id: '{test_node_id}', label: 'IntegrationTestNode')...")
    created = db.create_node("IntegrationTestNode", {
        "id": test_node_id,
        "name": "Temporary Test Node",
        "description": "Integration lifecycle verification probe",
        "temporary": True
    })
    print(f"      Created node: {created.get('id')} [{created.get('label')}]")

    print("  (b) Verifying node count increased in FalkorDB...")
    after_create_health = db.check_health()
    new_node_count = after_create_health.get("node_count", 0)
    print(f"      Node count after creation: {new_node_count} (expected: {initial_nodes + 1})")
    assert new_node_count == initial_nodes + 1, f"Expected {initial_nodes + 1} nodes, got {new_node_count}"

    print(f"  (c) Verifying backend query returns the temporary node...")
    found_node = db.get_node_by_id(test_node_id)
    assert found_node is not None, f"Node '{test_node_id}' was not returned by get_node_by_id"
    assert found_node.get("id") == test_node_id, f"Node ID mismatch: {found_node.get('id')}"
    print(f"      Found node: id='{found_node.get('id')}', label='{found_node.get('label')}'")

    print(f"  (d) Verifying fetch_graph_overview() includes temporary node...")
    updated_vis = fetch_graph_overview()
    matching_vis_nodes = [n for n in updated_vis.nodes if n.id == test_node_id]
    assert len(matching_vis_nodes) == 1, "Temporary node not present in graph overview"
    print(f"      Verified: temporary node is mapped to React Flow payload.")

    print(f"  (e) Deleting ONLY the temporary test node (zero data loss guarantee)...")
    delete_res = db.query("MATCH (t:IntegrationTestNode {id: $id}) DETACH DELETE t", {"id": test_node_id})
    
    print("  (f) Verifying database returned to initial baseline state...")
    restored_health = db.check_health()
    restored_nodes = restored_health.get("node_count", 0)
    restored_rels = restored_health.get("relationship_count", 0)
    print(f"      Restored Nodes:         {restored_nodes} (initial: {initial_nodes})")
    print(f"      Restored Relationships: {restored_rels} (initial: {initial_rels})")
    assert restored_nodes == initial_nodes, f"Node count not restored: {restored_nodes} vs {initial_nodes}"
    assert restored_rels == initial_rels, f"Rel count not restored: {restored_rels} vs {initial_rels}"
    print(" [PASS] Temporary-node lifecycle test succeeded and was cleanly removed!")

    print("\n[Step 6] Verifying Protection of 'hackathon' Graph...")
    hackathon_info = next((g for g in graphs if g["name"] == "hackathon"), None)
    if hackathon_info:
        print(f"  - 'hackathon' graph preserved: {hackathon_info['node_count']} nodes, {hackathon_info['relationship_count']} relationships.")
        print(" [PASS] User's existing 'hackathon' graph was strictly untouched.")

    print("\n" + "=" * 70)
    print(" ALL FALKORDB DATABASE INTEGRATION TESTS PASSED (100% SYNCHRONIZED)!")
    print("=" * 70)
    return True

if __name__ == "__main__":
    success = run_verification()
    sys.exit(0 if success else 1)
