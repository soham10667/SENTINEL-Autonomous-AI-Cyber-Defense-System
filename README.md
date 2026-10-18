
# SENTINEL: Autonomous Cyber Defense System

> **Track 1: Agents That Act on Connected Data**  
> WeMakeDevs &times; FalkorDB — Graph Hacks: Context for AI Agents

---

## 1. Project Overview

**SENTINEL** is an autonomous defensive cybersecurity agent powered by **FalkorDB**'s high-performance graph database. When simulated cyber threats emerge, SENTINEL investigates connected security telemetry, reconstructs multi-hop lateral movement chains, identifies reachable crown jewel databases, performs counterfactual containment analysis, executes simulated defensive actions via the Model Context Protocol (MCP), and verifies containment in the graph state.

---

## 2. Why FalkorDB is Essential

- **Context for Agent Autonomy:** AI agents operating without graph context hallucinate reachable systems and cause collateral damage. FalkorDB provides deterministic ground truth on what infrastructure is reachable from a compromised origin.
- **Ultra-Fast Multi-Hop Cypher:** Finding 4-hop lateral movement paths from an external proxy IP through intermediate workstations, bastion hosts, and IAM roles to sensitive databases takes single-digit milliseconds in FalkorDB.
- **Counterfactual Reasoning:** FalkorDB allows the agent to evaluate prospective graph mutations (e.g. severing network access or suspending identities) and calculate risk reduction ($\Delta\text{Risk}$) before committing containment.
- **Isolation Guarantee:** Operates on the isolated graph `sentinel`, strictly protecting the developer's existing `hackathon` graph.

---

## 3. Technology Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, React Flow, Recharts, Framer Motion, WebSockets. (Runs on port `3001` to avoid collision with FalkorDB Browser on 3000).
- **Backend:** Python 3.10+, FastAPI, Pydantic v2, Uvicorn, Official `falkordb` Python client, LangGraph workflow pattern. (Runs on port `8000`).
- **Database:** FalkorDB running in Docker on `localhost:6379`.
- **Protocol:** Model Context Protocol (MCP) tool integration.

---

## 4. Architecture

```text
SENTINEL/
├── frontend/             # Next.js 14 cybersecurity command center (Port 3001)
├── backend/              # FastAPI defensive agent service (Port 8000)
├── scripts/              # Standalone verification & simulation runners
├── docs/                 # Architecture, Schema, Cypher, Demo script
└── README.md
```

---

## 5. Quick Start (Windows PowerShell)

### Step 1: Verify FalkorDB Docker Container
Make sure FalkorDB is running:
```powershell
docker ps
```
FalkorDB should be listening on `localhost:6379`. FalkorDB Browser is available on `http://localhost:3000`.

### Step 2: Setup & Launch Backend (Port 8000)
```powershell
cd "e:\falkor db hackathon\SENTINEL\backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Verify backend health: `http://localhost:8000/api/health`

### Step 3: Setup & Launch Frontend (Port 3001)
Open a second PowerShell terminal:
```powershell
cd "e:\falkor db hackathon\SENTINEL\frontend"
npm install
npm run dev
```
Access the application: **`http://localhost:3001`**

---

## 6. Website Experience & Authentication Flow

SENTINEL features two streamlined pathways for evaluation and operational use:

1. **Standard Operator Pathway:**
   - **Landing Page (`http://localhost:3001/`):** Modern white & soft-pink cybersecurity presentation, interactive FalkorDB topology visualizer, capability breakdown, and repository links.
   - **Register (`/register`):** Full name, work email, password strength indicator, terms acceptance, and FalkorDB `OperatorAccount` persistence.
   - **Login (`/login`):** PBKDF2 salted hash verification, HMAC-SHA256 JWT session generation, and redirect to the defense dashboard.
   - **Operator Session Management:** Persistent sessions, clearance tracking, and secure logout.

2. **Hackathon Judge Pathway (Instant Live Demo):**
   - Click **"Try Live Demo"** from the landing page, login, or registration pages.
   - Instantly issues a pre-signed read-only evaluator session (`role: JUDGE`) and opens the live defense console (`/dashboard?demo=true`).
   - Judges can inspect live FalkorDB knowledge graph records, execute attack simulations, and audit agent counterfactual reasoning without creating an account or risking production mutations.

---

## 7. Primary Hackathon Demonstration

1. Open `http://localhost:3001/simulation` (or enter via **Try Live Demo** on the Landing Page).
2. Select **Scenario A: Compromised Employee Account** (Sarah Connor / Russian proxy).
3. Click **"Launch Security Incident Simulation"**.
4. Observe the live 9-stage autonomous pipeline:
   - Event injected into FalkorDB
   - Discovers multi-hop lateral route to customer PII database (`DB-PROD-CUST-01`)
   - Computes deterministic graph risk ($87.5 / 100$)
   - Evaluates counterfactual containment impact ($-75.5\text{ pts}$)
   - Executes simulated `simulate_block_ip`
   - Verifies containment status in FalkorDB
5. Click **"Inspect Updated Graph"** or **"View Agent Decision Trace"** to explore evidence nodes and tool outputs!

---

## 8. Running Backend Tests

```powershell
cd "e:\falkor db hackathon\SENTINEL\backend"
pytest -v
```

---

## 9. License

Developed for the WeMakeDevs &times; FalkorDB Graph Hacks Hackathon (Track 1).
GitHub Repository: [https://github.com/soham10667/SENTINEL-Autonomous-AI-Cyber-Defense-System](https://github.com/soham10667/SENTINEL-Autonomous-AI-Cyber-Defense-System)

