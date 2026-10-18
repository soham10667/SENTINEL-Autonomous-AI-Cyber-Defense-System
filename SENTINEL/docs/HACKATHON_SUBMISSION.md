# Hackathon Submission: SENTINEL

**Hackathon:** WeMakeDevs &times; FalkorDB — Graph Hacks: Context for AI Agents  
**Target Track:** Track 1 — Agents That Act on Connected Data  
**Project Name:** SENTINEL: Autonomous Cyber Defense System  

---

## 1. Submission Metadata

- **GitHub Repository URL:** `[https://github.com/placeholder/sentinel-cyber-defense]`
- **Live Demo Video URL:** `[https://youtube.com/watch?v=placeholder]`
- **Live Deployment URL (Optional):** `[http://localhost:3001]`

---

## 2. Problem Statement

Modern enterprise Security Operations Centers (SOCs) face an overwhelming volume of disconnected security alerts:
- **Alert Fatigue:** SOC analysts triage thousands of alerts daily in isolation, without knowing whether an anomalous login has a reachable network path to high-value assets.
- **Unseen Lateral Chains:** Attackers do not attack single servers; they pivot across identities, staging environments, CI runners, and permission policies to reach sensitive databases.
- **Hallucinating AI Agents:** Generic AI security assistants generate plausible-sounding recommendations that are disconnected from actual network topology, leading to dangerous or ineffective response actions.

---

## 3. Our Solution: SENTINEL

SENTINEL is an autonomous defensive cybersecurity agent grounded in FalkorDB's low-latency graph database. Instead of treating telemetry as flat tables, SENTINEL links events directly to enterprise topology. 

When suspicious activity is detected, the agent:
1. Traverses multi-hop relationships using Cypher to find reachable Crown Jewels.
2. Distinguishes observed breach telemetry from unverified inferential risk.
3. Computes deterministic, mathematically grounded risk scores.
4. Executes **Counterfactual Containment Analysis** to simulate blast-radius reduction before containment.
5. Invokes Model Context Protocol (MCP) defensive tools to apply simulated containment (firewall IP blocking, account suspension, host network isolation).
6. Verifies containment in the graph state and compiles explainable forensic reports.

---

## 4. Why FalkorDB is Essential

FalkorDB is not merely a cache or log store in SENTINEL; it is the **computational substrate of the agent's intelligence**:
1. **Multi-Hop Traversal at Scale:** Standard relational or document databases require expensive recursive joins to discover 3-to-5-hop lateral movement chains. FalkorDB's Cypher engine executes these multi-hop traversals in single-digit milliseconds.
2. **Context for Grounded Autonomy:** The agent never hallucinates reachable systems because every path is strictly bounded by active FalkorDB graph edges.
3. **Counterfactual Simulation:** By evaluating prospective topology modifications in FalkorDB, the agent can deterministically test defensive hypotheses before committing changes.
4. **Graph Isolation:** SENTINEL operates on the isolated graph `sentinel`, preserving all existing graphs (`hackathon`) in the developer's FalkorDB instance.

---

## 5. Key Differentiators

### A. Explainable Graph-Grounded Autonomy
Every agent decision is backed by:
- Concrete Cypher queries
- Explicit evidence nodes
- Tool invocation inputs and outputs
- Concise human-readable rationale

### B. Counterfactual Containment Analysis
Before executing an action, SENTINEL simulates what happens if an IP is blocked or a device is isolated, computing the exact mathematical risk delta ($\Delta\text{Risk}$).

### C. Continuous Investigation Graph & Rollback
Defensive actions update the graph properties in real time, and all simulated containment actions can be rolled back with one click.

---

## 6. AI Coding-Assistant Disclosure

In compliance with the hackathon rules and integrity standards:
- **Tools Used:** Antigravity AI assistant was used for scaffolding frontend UI components, drafting Pydantic schemas, and designing the CSS visual styling.
- **Human Authorship:** The cybersecurity architecture, FalkorDB Cypher traversals, deterministic mathematical risk formula, counterfactual containment algorithm, and MCP tool specifications were conceived and directed specifically for this competition track.
