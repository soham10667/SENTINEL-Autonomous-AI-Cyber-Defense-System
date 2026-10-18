import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

from app.database.falkor import get_db_manager
from app.simulation.seed_data import seed_enterprise_graph

def main():
    print("=" * 60)
    print("SENTINEL — Seeding Enterprise Knowledge Graph in FalkorDB")
    print("=" * 60)
    db = get_db_manager()
    if not db.connect():
        print("ERROR: Could not connect to FalkorDB. Aborting.")
        sys.exit(1)
        
    success = seed_enterprise_graph()
    if success:
        health = db.check_health()
        print(">>> SUCCESS: Baseline enterprise graph seeded!")
        print(f"Graph: {db.graph_name}")
        print(f"Nodes: {health.get('node_count')}")
        print(f"Relationships: {health.get('relationship_count')}")
    else:
        print("ERROR: Failed to seed graph.")
    print("=" * 60)

if __name__ == "__main__":
    main()
