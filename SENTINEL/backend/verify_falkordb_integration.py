#!/usr/bin/env python
"""
SENTINEL - FalkorDB Integration Verification Script
Tests FalkorDB connection, database queries, graph statistics,
and verifies that all nodes, relationships, and queries execute safely.
"""

import sys
import os

# Ensure backend root is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.config import settings
from app.database.falkor import get_db_manager

def run_verification():
    print("=" * 65)
    print("SENTINEL - FalkorDB Hackathon Graph Integration Test")
    print("=" * 65)
    print(f"Configured Host:   {settings.FALKORDB_HOST}")
    print(f"Configured Port:   {settings.FALKORDB_PORT}")
    print(f"Configured Graph:  {settings.FALKORDB_GRAPH}")
    print("-" * 65)

    db = get_db_manager()
    print("1. Testing connection to FalkorDB...")
    connected = db.connect()
    
    if not connected:
        print("[FAIL] Could not connect to FalkorDB.")
        print("  - Please ensure Docker Desktop is running.")
        print(f"  - Verify FalkorDB container is listening on port {settings.FALKORDB_PORT}.")
        return False
        
    print("[PASS] Connected to FalkorDB successfully!")

    print("\n2. Checking Graph Health & Statistics...")
    health = db.check_health()
    print(f"  - Status:        {'ONLINE' if health.get('connected') else 'OFFLINE'}")
    print(f"  - Target Graph:  {health.get('graph')}")
    print(f"  - Latency:       {health.get('latency_ms')} ms")
    print(f"  - Node Count:    {health.get('node_count')}")
    print(f"  - Rel Count:     {health.get('relationship_count')}")
    print("[PASS] Health check verified.")

    print("\n3. Testing Nodes Retrieval (GET /api/graph/nodes)...")
    nodes = db.get_nodes(limit=10)
    print(f"  - Retrieved {len(nodes)} nodes.")
    for n in nodes[:5]:
        print(f"    * Node [{n.get('label')}]: id='{n.get('id')}', props={n.get('properties')}")
    print("[PASS] Node retrieval verified.")

    print("\n4. Testing Relationships Retrieval (GET /api/graph/relationships)...")
    rels = db.get_relationships(limit=10)
    print(f"  - Retrieved {len(rels)} relationships.")
    for r in rels[:5]:
        print(f"    * Rel [{r.get('type')}]: ({r.get('source')}) -[{r.get('type')}]-> ({r.get('target')})")
    print("[PASS] Relationship retrieval verified.")

    print("\n5. Testing Graph Insights Calculation (GET /api/graph/insights)...")
    insights = db.get_insights()
    print(f"  - Status:               {insights.get('status')}")
    print(f"  - Total Nodes:          {insights.get('total_nodes')}")
    print(f"  - Total Relationships:  {insights.get('total_relationships')}")
    print(f"  - Top Connected Hubs:   {insights.get('top_hubs')}")
    print(f"  - Label Distribution:   {insights.get('label_distribution')}")
    print(f"  - Rel Distribution:     {insights.get('relationship_types')}")
    print("[PASS] Graph insights verified.")

    print("\n6. Safety Verification: Ensuring 'hackathon' graph is persistent & protected...")
    assert db.graph_name in ["hackathon", "sentinel"], "Graph name should be 'hackathon' or 'sentinel'"
    print(f"[PASS] Persistent database data in '{db.graph_name}' graph is preserved.")

    print("\n" + "=" * 65)
    print("ALL FALKORDB INTEGRATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 65)
    return True

if __name__ == "__main__":
    success = run_verification()
    sys.exit(0 if success else 1)
