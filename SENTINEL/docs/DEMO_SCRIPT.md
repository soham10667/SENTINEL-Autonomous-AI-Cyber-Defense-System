# SENTINEL Hackathon Demo Script

This script provides step-by-step instructions for demonstrating **SENTINEL** during live judging or video recording.

---

## 1. Prerequisites Check

1. Verify FalkorDB container is running:
   ```powershell
   docker ps
   ```
2. Verify FalkorDB Browser is on `http://localhost:3000` (shows existing graph `hackathon` intact).
3. Start Backend:
   ```powershell
   cd "e:\falkor db hackathon\SENTINEL\backend"
   uvicorn app.main:app --reload --port 8000
   ```
4. Start Frontend:
   ```powershell
   cd "e:\falkor db hackathon\SENTINEL\frontend"
   npm run dev
   ```
5. Open browser at `http://localhost:3001`.

---

## 2. End-to-End Live Demo Walkthrough

### Act I: The Command Center & Connected Graph
1. **Show Navbar Status**:
   - Point out the `GRAPH: sentinel | LIVE (Xms)` status badge.
   - Mention that port 3001 was selected to avoid conflict with FalkorDB Browser on 3000.
2. **Navigate to Knowledge Graph (`/graph`)**:
   - Demonstrate the interactive React Flow graph showing synthetic corporate IT topology: Users (blue), Workstations (cyan), Staging/Prod Servers (purple), and Crown Jewel Databases (gold with `CROWN JEWEL` badge).
   - Click on `DB-PROD-CUST-01` to open the Node Inspection Drawer. Note that it stores customer PII with `CRITICAL` classification.

### Act II: Injecting an Incident in the Simulation Lab
1. **Navigate to Simulation Lab (`/simulation`)**:
   - Review Scenario A: Compromised Employee Account (`sarah.connor` / `USR-002` breached via Russian proxy `194.26.29.112`).
   - Click the prominent button: **"Launch Security Incident Simulation"**.
2. **Observe Real-Time Autonomous Pipeline**:
   - Watch the live checklist progress through all 9 stages:
     1. Ingesting event into FalkorDB
     2. Disagreeing with isolated alerts: agent searches connected topology
     3. Multi-hop Cypher traversal discovers path to `DB-PROD-CUST-01`
     4. Deterministic risk engine calculates score ($87.5 / 100$ - `CRITICAL`)
     5. Counterfactual analysis evaluates risk drop if `194.26.29.112` is blocked
     6. MCP tool `simulate_block_ip` executes
     7. Outcome verified in FalkorDB
3. **Inspect Results Banner**:
   - Note the residual risk drop: $-75.5\text{ pts}$ to safe baseline ($12.0$).

### Act III: Explaining the Graph-Grounded Autonomy
1. **Navigate to Agent Operations (`/agent`)**:
   - Walk through the Decision Timeline:
     - Step 1: `get_security_event`
     - Step 2: `find_connected_assets`
     - Step 3: `trace_possible_attack_paths`
     - Step 4: `calculate_graph_risk`
     - Step 5: `evaluate_counterfactual_containment`
     - Step 6: `simulate_block_ip`
     - Step 7: `verify_containment`
   - Expand Step 3 to show exact input/output JSON and Cypher evidence nodes.

### Act IV: Counterfactual Containment & Rollback
1. **Navigate to Response Center (`/response`)**:
   - Show the Containment Ledger recording `BLOCK_IP` on `194.26.29.112` with `Status: EXECUTED` and `Verified: YES`.
   - Demonstrate the **Rollback** button to show simulated state reversal in FalkorDB.
2. **Navigate to Reports (`/reports`)**:
   - Display the executive incident report with reconstructed attack paths and strategic recommendations.
   - Click **"Export JSON"** to download the machine-readable evidence artifact.

### Act V: Reset & Repeatability
1. Return to **Simulation Lab (`/simulation`)**.
2. Click **"Reset Simulation State"**.
3. Note that the sentinel graph resets cleanly to baseline without affecting the existing `hackathon` graph!
