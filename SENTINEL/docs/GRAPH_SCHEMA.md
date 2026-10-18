# FalkorDB Graph Schema Specification

## 1. Graph Isolation Guarantee

SENTINEL operates exclusively on the dedicated graph:
```text
FALKORDB_GRAPH = "sentinel"
```
The existing `hackathon` graph and any other graphs in the user's FalkorDB Docker container are strictly protected and never modified or deleted.

---

## 2. Node Labels & Properties

| Label | Primary ID Key | Key Properties | Description |
| :--- | :--- | :--- | :--- |
| **`User`** | `id` | `username`, `email`, `role`, `department`, `status`, `risk_score`, `is_compromised` | Corporate employees and contractor identities |
| **`Device`** | `id` | `hostname`, `ip`, `os`, `asset_type`, `status`, `is_isolated`, `criticality` | Employee workstations, laptops, and endpoints |
| **`IPAddress`** | `id` / `ip` | `ip`, `type`, `reputation`, `country`, `is_blocked` | Internal subnet addresses and external IPs |
| **`Server`** | `id` | `hostname`, `ip`, `role`, `environment`, `criticality`, `os`, `is_isolated` | Domain controllers, staging CI runners, production APIs |
| **`Database`** | `id` | `name`, `db_type`, `contains_pii`, `contains_financial`, `criticality` | Crown jewel databases storing sensitive records |
| **`Application`** | `id` | `name`, `tier`, `service_type`, `port`, `status`, `criticality` | Core business services and microservices |
| **`Permission`** | `id` | `name`, `scope`, `privilege_level`, `is_admin` | IAM roles, Active Directory groups, DB permissions |
| **`SecurityEvent`** | `id` | `event_type`, `severity`, `timestamp`, `description`, `raw_source`, `confidence`, `observed` | Raw security telemetry events from identity providers, EDR, firewalls |
| **`Incident`** | `id` | `title`, `severity`, `status`, `created_at`, `root_cause`, `risk_score` | High-level security incidents bundling related events |
| **`Investigation`** | `id` | `incident_id`, `status`, `started_at`, `completed_at`, `summary`, `risk_score` | Autonomous agent investigation record |
| **`DefensiveAction`**| `id` | `action_type`, `target_type`, `target_id`, `status`, `reason`, `approval_status`, `verified` | Executed or proposed simulated defensive containment actions |

---

## 3. Relationship Types

| Relationship | Source Label | Target Label | Properties | Semantics |
| :--- | :--- | :--- | :--- | :--- |
| **`LOGGED_IN_FROM`** | `User` / `IPAddress` | `Device` / `User` | `observed`, `session`, `timestamp` | Identity authentication session |
| **`CONNECTED_TO`** | `Device` / `Server` | `Server` / `IPAddress` | `observed`, `protocol`, `port` | Network connection (SSH, HTTPS, RDP, TLS) |
| **`HAS_ACCESS_TO`** | `User` | `Application` / `Database` / `Permission` | `observed`, `assigned_at` | Granted access privileges |
| **`HOSTS`** | `Server` | `Application` / `Database` | `observed` | Infrastructure hosting workloads |
| **`DEPENDS_ON`** | `Application` | `Database` / `Server` | `observed` | Architectural service dependencies |
| **`GENERATED_EVENT`** | `IPAddress` / `Device` / `User` | `SecurityEvent` | `observed`, `timestamp` | Entity that produced an alert |
| **`ASSOCIATED_WITH`** | `SecurityEvent` | `Incident` | `timestamp` | Links telemetry event to an Incident |
| **`INVOLVES`** | `Incident` | `User` / `Device` / `Server` / `Database` | None | Entities impacted by an incident |
| **`INVESTIGATED_BY`** | `Incident` | `Investigation` | `timestamp` | Links incident to autonomous agent record |
| **`TRIGGERED_ACTION`**| `Investigation` | `DefensiveAction` | `timestamp` | Links agent decision to defensive action |

---

## 4. FalkorDB Cypher Indexes

For ultra-fast multi-hop traversals, the following indexes are initialized at startup:

```cypher
CREATE INDEX FOR (u:User) ON (u.id)
CREATE INDEX FOR (d:Device) ON (d.id)
CREATE INDEX FOR (s:Server) ON (s.id)
CREATE INDEX FOR (ip:IPAddress) ON (ip.ip)
CREATE INDEX FOR (a:Application) ON (a.id)
CREATE INDEX FOR (db:Database) ON (db.id)
CREATE INDEX FOR (p:Permission) ON (p.id)
CREATE INDEX FOR (e:SecurityEvent) ON (e.id)
CREATE INDEX FOR (i:Incident) ON (i.id)
CREATE INDEX FOR (inv:Investigation) ON (inv.id)
CREATE INDEX FOR (act:DefensiveAction) ON (act.id)
```
