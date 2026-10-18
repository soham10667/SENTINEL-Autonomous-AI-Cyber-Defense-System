import sys
import os

# Add backend directory to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

venv_site = os.path.join(backend_dir, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

from app.database.falkor import get_db_manager

def main():
    print("=" * 60)
    print("SENTINEL — FalkorDB Connectivity Verification")
    print("=" * 60)
    
    db = get_db_manager()
    print(f"Target Host: {db.host}")
    print(f"Target Port: {db.port}")
    print(f"Target Graph: '{db.graph_name}' (Live FalkorDB Graph)")
    print("-" * 60)
    
    health = db.check_health()
    if health.get("connected"):
        print(">>> STATUS: CONNECTED (SUCCESS)")
        print(f"Latency: {health.get('latency_ms')} ms")
        print(f"Total Nodes in '{db.graph_name}': {health.get('node_count')}")
        print(f"Total Relationships in '{db.graph_name}': {health.get('relationship_count')}")
    else:
        print(">>> STATUS: FAILED")
        print(f"Error: {health.get('error')}")
        print("\nPlease ensure your FalkorDB Docker container is running:")
        print("  docker ps")
        print("  docker run -p 6379:6379 -p 3000:3000 -it --rm falkordb/falkordb:latest")
    print("=" * 60)

if __name__ == "__main__":
    main()
