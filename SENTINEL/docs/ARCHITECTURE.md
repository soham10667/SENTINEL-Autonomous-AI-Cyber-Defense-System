# SENTINEL Architecture Specification

## 1. Executive Summary

**SENTINEL** is an autonomous defensive cybersecurity agent designed for **Track 1: Agents That Act on Connected Data** of the WeMakeDevs &times; FalkorDB Graph Hacks Hackathon.

Traditional security information and event management (SIEM) systems treat security telemetry as isolated tabular events, producing alert fatigue and missing complex multi-hop lateral movements. SENTINEL utilizes **FalkorDB** as its persistent, low-latency graph intelligence foundation, enabling an autonomous agent to:
1. Reconstruct multi-hop attack paths leading to sensitive "Crown Jewel" assets.
2. Separate confirmed observed activity from inferred exposure paths.
3. Compute evidence-grounded risk scores using deterministic graph mathematics.
4. Perform **Counterfactual Containment Analysis** (evaluating risk before vs after simulated mitigation).
5. Execute permitted simulated containment actions via the Model Context Protocol (MCP).
6. Verify the containment in the graph state and generate an explainable forensic incident report.

---

## 2. System Architecture Diagram

```mermaid
flowchart TD
    subgraph UI ["Frontend (Next.js 14 / TypeScript / Tailwind / React Flow) - Port 3001"]
        Dash[Overview Dashboard]
        GraphView[Knowledge Graph Visualizer]
        Trace[Agent Operations Timeline]
        SimLab[Live Simulation Lab]
        RespCtr[Response Center & Containment]
    end

    subgraph API ["FastAPI Defense Backend - Port 8000"]
        Routes[REST API Endpoints]
        WS[WebSocket Event Bus]
    end

    subgraph AgentEngine ["Autonomous Agent Orchestration (LangGraph)"]
        EventVal[1. Event Validation]
        TopoExp[2. Graph Exploration]
        PathRec[3. Attack Chain Reconstruction]
        RiskEng[4. Deterministic Risk Engine]
        Counterfact[5. Counterfactual Analysis]
        Decision[6. Defensive Action Selection]
        MCPExec[7. MCP Tool Execution]
        Verify[8. Outcome Verification]
        ReportGen[9. Report Generation]
    end

    subgraph MCPTools ["MCP Defensive Tool Registry"]
        T1[get_security_event]
        T2[find_connected_assets]
        T3[trace_possible_attack_paths]
        T4[calculate_graph_risk]
        T5[simulate_block_ip]
        T6[simulate_disable_account]
        T7[simulate_isolate_device]
        T8[verify_containment]
    end

    subgraph Falkor ["FalkorDB Graph Engine (Docker: localhost:6379)"]
        SentinelGraph[(Graph: sentinel)]
        ProtectedGraph[(Existing Graph: hackathon - PROTECTED)]
    end

    Dash <-->|REST / WS| Routes
    GraphView <-->|Cypher Data| Routes
    SimLab -->|Trigger Incident| Routes

    Routes --> AgentEngine
    AgentEngine --> EventVal --> TopoExp --> PathRec --> RiskEng --> Counterfact --> Decision --> MCPExec --> Verify --> ReportGen
    MCPExec --> MCPTools
    MCPTools <-->|Parameterized Cypher| SentinelGraph
    Routes <-->|Parameterized Cypher| SentinelGraph
    AgentEngine -->|Trace Updates| WS
```

---

## 3. Core Component Workflows

### 3.1. Telemetry Ingestion & Graph Mapping
When a security event occurs (e.g., Okta anomalous authentication, EDR lateral movement, CloudTrail IAM escalation), it is recorded as a `:SecurityEvent` node and linked to the originating entity (`:User`, `:Device`, or `:IPAddress`) via `[:GENERATED_EVENT]` and `[:LOGGED_IN_FROM]`.

### 3.2. Multi-Hop Graph Traversal
Instead of analyzing the event in isolation, the agent executes Cypher traversals up to 4 hops deep:
```cypher
MATCH (origin {id: $source_id})
MATCH path = (origin)-[:LOGGED_IN_FROM|CONNECTED_TO|HAS_ACCESS_TO|HOSTS|DEPENDS_ON*1..4]->(target)
WHERE target:Database OR target.criticality IN ['CRITICAL', 'HIGH']
RETURN path
```
This discovers whether an entry point has a viable lateral path into Crown Jewel assets (e.g., PostgreSQL databases storing customer PII or tokenized PCI payment card caches).

### 3.3. Deterministic Risk Engine
Risk is computed deterministically rather than fabricated by an LLM:
$$\text{Risk} = (S_{\text{base}} \times 0.25) + (C_{\text{assets}} \times 0.30) + (P_{\text{prox}} \times 0.15) + (E_{\text{priv}} \times 0.15) + (K_{\text{conf}} \times 0.15)$$
- **$S_{\text{base}}$**: Base severity of the initial alert.
- **$C_{\text{assets}}$**: Number and criticality of reachable crown jewels.
- **$P_{\text{prox}}$**: Minimum hop distance (proximity) to the crown jewels.
- **$E_{\text{priv}}$**: Privilege escalation level (e.g., Administrator / Root).
- **$K_{\text{conf}}$**: Confidence multiplier of the telemetry log.

### 3.4. Counterfactual Containment Analysis (Differentiator B)
Before executing a simulated containment action, SENTINEL simulates what the graph topology would look like if the candidate entity is blocked or isolated. It computes:
$$\Delta\text{Risk} = \text{Risk}_{\text{before}} - \text{Risk}_{\text{after}}$$
Showing the security team exactly how many attack paths will be severed.

### 3.5. Model Context Protocol (MCP) Execution
The agent invokes simulated containment tools:
- `simulate_block_ip`: Drops traffic from external attacker IPs in perimeter firewalls.
- `simulate_disable_account`: Suspends compromised synthetic identities and invalidates active sessions.
- `simulate_isolate_device`: Quarantines endpoint network interfaces via EDR.

All actions are persisted as `:DefensiveAction` nodes, linked to the `:Investigation` in FalkorDB, and provide full one-click rollback capabilities.
