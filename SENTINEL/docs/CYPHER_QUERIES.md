# FalkorDB Cypher Queries Specification

This document details the actual parameterized Cypher queries executed by SENTINEL's autonomous agent and backend services.

---

## 1. Multi-Hop Attack Path Reconstruction (Agent Tool: `trace_possible_attack_paths`)

Discovers multi-hop access paths from an entry point (e.g. malicious IP or compromised employee) leading toward critical crown jewels (databases with PII/financial data or critical servers):

```cypher
MATCH (origin {id: $source_id})
MATCH path = (origin)-[r*1..4]->(target)
WHERE (target:Database OR target:Server OR target.criticality IN ['CRITICAL', 'HIGH'])
  AND target <> origin
RETURN 
    [n IN nodes(path) | {id: n.id, label: labels(n)[0], name: coalesce(n.name, n.id), criticality: coalesce(n.criticality, 'MEDIUM')}] AS path_nodes,
    [rel IN relationships(path) | {type: type(rel), observed: coalesce(rel.observed, false)}] AS path_rels,
    length(path) AS length,
    target.id AS target_id,
    labels(target)[0] AS target_type,
    coalesce(target.criticality, 'MEDIUM') AS target_criticality,
    coalesce(target.contains_pii, false) AS target_pii,
    coalesce(target.contains_financial, false) AS target_financial
ORDER BY length ASC
LIMIT 20
```

---

## 2. Connected Asset Discovery (Agent Tool: `find_connected_assets`)

Discovers all graph assets (users, devices, servers, databases) directly connected to an entity within $N$ hops:

```cypher
MATCH (start {id: $entity_id})
MATCH path = (start)-[r*1..$depth]-(target)
WHERE target <> start
RETURN DISTINCT 
    target.id AS asset_id, 
    labels(target)[0] AS asset_type,
    properties(target) AS properties,
    length(path) AS hops
ORDER BY hops ASC
```

---

## 3. Crown Jewel Identification (Risk Engine)

Retrieves high-value targets possessing restricted compliance classifications:

```cypher
MATCH (cj)
WHERE (cj:Database AND (cj.contains_pii = true OR cj.contains_financial = true))
   OR cj.criticality = 'CRITICAL'
RETURN cj.id AS id, labels(cj)[0] AS type, cj.name AS name, 
       coalesce(cj.criticality, 'HIGH') AS criticality,
       coalesce(cj.contains_pii, false) AS pii,
       coalesce(cj.contains_financial, false) AS financial
```

---

## 4. Simulated Containment Enforcement (MCP Tools)

### A. Perimeter Firewall IP Block:
```cypher
MATCH (ip:IPAddress)
WHERE ip.ip = $ip OR ip.id = $ip
SET ip.is_blocked = true, ip.status = 'BLOCKED', ip.blocked_at = $now
RETURN ip.ip AS ip, ip.id AS id
```

### B. Identity Directory Account Suspension:
```cypher
MATCH (u:User {id: $user_id})
SET u.status = 'SUSPENDED', u.is_compromised = true, u.suspended_at = $now
RETURN u.id AS id, u.username AS username
```

### C. EDR Network Endpoint Isolation:
```cypher
MATCH (d:Device)
WHERE d.id = $device_id OR d.hostname = $device_id
SET d.is_isolated = true, d.status = 'ISOLATED', d.isolated_at = $now
RETURN d.id AS id, d.hostname AS hostname
```

---

## 5. Containment Outcome Verification (Agent Tool: `verify_containment`)

Verifies that the target entity was successfully modified in the graph and that its lateral traversal edges are severed:

```cypher
MATCH (d:Device)
WHERE d.id = $tid OR d.hostname = $tid
RETURN (d.is_isolated = true) AS verified, d.status AS status
```

---

## 6. Investigation Record Graph Persistence

Links the autonomous agent's investigation and defensive action into the incident graph:

```cypher
CREATE (inv:Investigation {
    id: $inv_id,
    incident_id: $inc_id,
    status: 'COMPLETED',
    risk_score: $risk,
    summary: $summary,
    completed_at: $completed_at,
    is_rule_based: $is_rule_based
})

MATCH (i:Incident {id: $inc_id})
MATCH (inv:Investigation {id: $inv_id})
MERGE (i)-[:INVESTIGATED_BY]->(inv)
SET i.status = 'CONTAINED', i.risk_score = $residual_risk
```
