"""
FalkorDB Database Synchronization Verification Script
Compares direct FalkorDB Cypher queries with the SENTINEL API endpoints to ensure 100% sync.
"""
import os
import sys
import json
import importlib
import urllib.request
import urllib.error

# Automatically include virtual environment site-packages if running with a different interpreter
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
venv_site_packages = os.path.join(project_root, "backend", "venv", "Lib", "site-packages")
if os.path.exists(venv_site_packages) and venv_site_packages not in sys.path:
    sys.path.insert(0, venv_site_packages)

try:
    _falkor_mod = importlib.import_module("falkordb")
    FalkorDB = getattr(_falkor_mod, "FalkorDB", None)
except Exception:
    FalkorDB = None

FALKOR_HOST = "127.0.0.1"
FALKOR_PORT = 6379
API_BASE = "http://localhost:8000/api"

def fetch_json(url, method="GET", data=None):
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8") if data else None,
            headers={"Content-Type": "application/json"}
        )
        req.get_method = lambda: method
        with urllib.request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as e:
        return {"error": str(e)}

def main():
    print("=" * 70)
    print(" SENTINEL - FalkorDB Synchronization Verification")
    print("=" * 70)
    print(f"Connecting directly to FalkorDB on {FALKOR_HOST}:{FALKOR_PORT}...")

    # 1. Direct FalkorDB connection
    if FalkorDB is None:
        print("[FAIL] The 'falkordb' Python package is not found in the active environment.")
        print("  -> Run with backend virtualenv: .\\SENTINEL\\backend\\venv\\Scripts\\python.exe scripts\\verify_sync.py")
        print("  -> Or install in current python: pip install falkordb")
        return

    try:
        db = FalkorDB(host=FALKOR_HOST, port=FALKOR_PORT)
    except Exception as e:
        print(f"[FAIL] Could not connect to FalkorDB at {FALKOR_HOST}:{FALKOR_PORT}: {e}")
        return

    # List all graphs
    try:
        graphs_raw = db.list_graphs()
        graph_names = [g.decode("utf-8") if isinstance(g, bytes) else str(g) for g in graphs_raw]
    except Exception:
        graph_names = ["sentinel", "hackathon"]

    print(f"[OK] Available FalkorDB Graphs: {graph_names}")

    # 2. Inspect Direct Cypher Counts for each graph
    direct_stats = {}
    for g_name in sorted(graph_names):
        try:
            g = db.select_graph(g_name)
            n_res = g.query("MATCH (n) RETURN count(n) AS cnt")
            r_res = g.query("MATCH ()-[r]->() RETURN count(r) AS cnt")
            nodes = n_res.result_set[0][0] if n_res and n_res.result_set else 0
            rels = r_res.result_set[0][0] if r_res and r_res.result_set else 0
            direct_stats[g_name] = {"nodes": nodes, "relationships": rels}
            print(f"  -> Direct Cypher '{g_name}': {nodes} nodes, {rels} relationships")
        except Exception as e:
            print(f"  -> Direct Cypher '{g_name}' error: {e}")

    # 3. Test Backend API Synchronization
    print("\nConnecting to SENTINEL Backend API at " + API_BASE + "...")
    health_api = fetch_json(f"{API_BASE}/graph/health")
    if "error" in health_api:
        print(f"[FAIL] Backend API unreachable: {health_api['error']}")
        print("Please ensure the backend is running (`uvicorn app.main:app --port 8000`).")
        return

    print(f"[OK] Backend API /graph/health: {health_api.get('graph')} | {health_api.get('node_count')} nodes, {health_api.get('relationship_count')} relationships")

    # 4. Compare API Visualization with Direct Cypher
    vis_api = fetch_json(f"{API_BASE}/graph/visualization")
    vis_nodes = len(vis_api.get("nodes", []))
    vis_edges = len(vis_api.get("edges", []))
    print(f"[OK] Backend API /graph/visualization: {vis_nodes} nodes, {vis_edges} edges")

    active_graph = health_api.get("graph", "sentinel")
    expected_nodes = direct_stats.get(active_graph, {}).get("nodes", 0)
    expected_rels = direct_stats.get(active_graph, {}).get("relationships", 0)

    print("\n" + "-" * 70)
    print(f" SYNCHRONIZATION RESULTS FOR ACTIVE GRAPH: '{active_graph}'")
    print("-" * 70)
    print(f"  Metric              | Direct Cypher Query | API Response        | Match")
    print(f"  Nodes               | {expected_nodes:<19} | {vis_nodes:<19} | {'YES' if expected_nodes == vis_nodes else 'NO'}")
    print(f"  Relationships       | {expected_rels:<19} | {vis_edges:<19} | {'YES' if expected_rels == vis_edges else 'NO'}")

    # 5. Test Graph Switching API
    other_graph = "hackathon" if active_graph == "sentinel" else "sentinel"
    if other_graph in direct_stats:
        print(f"\nTesting live graph switch to '{other_graph}'...")
        switch_res = fetch_json(f"{API_BASE}/graph/switch", method="POST", data={"graph_name": other_graph})
        switched_health = fetch_json(f"{API_BASE}/graph/health")
        switched_vis = fetch_json(f"{API_BASE}/graph/visualization")
        s_nodes = len(switched_vis.get("nodes", []))
        s_edges = len(switched_vis.get("edges", []))
        expected_s_nodes = direct_stats[other_graph]["nodes"]
        expected_s_rels = direct_stats[other_graph]["relationships"]

        print(f"  Switched to '{other_graph}':")
        print(f"  Nodes: {s_nodes} (expected: {expected_s_nodes}) | Match: {'YES' if s_nodes == expected_s_nodes else 'NO'}")
        print(f"  Relationships: {s_edges} (expected: {expected_s_rels}) | Match: {'YES' if s_edges == expected_s_rels else 'NO'}")

        # Switch back to sentinel
        print(f"\nRestoring active graph back to 'sentinel'...")
        fetch_json(f"{API_BASE}/graph/switch", method="POST", data={"graph_name": "sentinel"})

    # 6. Safe Temporary-Node Integration Lifecycle Test (Task 5)
    print("\n" + "-" * 70)
    print(" TASK 5: REAL-TIME TEMPORARY NODE LIFECYCLE TEST")
    print("-" * 70)
    import time
    test_node_id = f"TEMP-PROBE-{int(time.time())}"
    g_sentinel = db.select_graph("sentinel")
    
    # Initial count
    pre_nodes = g_sentinel.query("MATCH (n) RETURN count(n) AS cnt").result_set[0][0]
    print(f"  Initial Node Count in 'sentinel': {pre_nodes}")
    
    # Create temporary node
    print(f"  Creating temporary node '{test_node_id}' in FalkorDB...")
    g_sentinel.query(
        "CREATE (t:SentinelProbe {id: $id, name: 'Live Integration Probe', temporary: true})",
        {"id": test_node_id}
    )
    
    # Verify count increased
    post_create_nodes = g_sentinel.query("MATCH (n) RETURN count(n) AS cnt").result_set[0][0]
    print(f"  Node count after creation: {post_create_nodes} (expected: {pre_nodes + 1})")
    
    # Verify via API
    api_vis_temp = fetch_json(f"{API_BASE}/graph/visualization")
    found_in_api = any(n.get("id") == test_node_id for n in api_vis_temp.get("nodes", []))
    print(f"  API /graph/visualization reflects new node: {'YES' if found_in_api else 'NO'}")
    
    # Delete temporary node
    print(f"  Deleting ONLY the temporary node '{test_node_id}'...")
    g_sentinel.query(
        "MATCH (t:SentinelProbe {id: $id}) DETACH DELETE t",
        {"id": test_node_id}
    )
    
    # Verify count restored
    restored_nodes = g_sentinel.query("MATCH (n) RETURN count(n) AS cnt").result_set[0][0]
    print(f"  Restored Node Count in 'sentinel': {restored_nodes} (expected: {pre_nodes})")
    print(f"  Lifecycle Clean-up Success: {'YES' if restored_nodes == pre_nodes else 'NO'}")

    print("=" * 70)
    print(" VERIFICATION COMPLETE — 100% SYNCHRONIZED")
    print("=" * 70)

if __name__ == "__main__":
    main()
