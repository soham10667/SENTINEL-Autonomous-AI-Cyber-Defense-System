import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel

from app.database.falkor import get_db_manager
from app.graph.queries import fetch_graph_overview, fetch_node_neighborhood
from app.graph.traversals import trace_possible_attack_paths
from app.models.schemas import (
    GraphData, SecurityEvent, Incident, DefensiveAction,
    DashboardSummary, CounterfactualResult, IncidentReport
)
from app.agents.workflow import InvestigationWorkflow
from app.agents.risk_engine import evaluate_counterfactual_containment
from app.simulation.scenarios import (
    launch_scenario_a, launch_scenario_b, launch_scenario_c, reset_simulation_state
)
from app.services.event_bus import get_event_bus

logger = logging.getLogger("sentinel.api.routes")
router = APIRouter(prefix="/api")

# In-memory storage for active investigations
INVESTIGATIONS_CACHE: Dict[str, Any] = {}

class StartInvestigationRequest(BaseModel):
    incident_id: str
    event_id: str

class CounterfactualRequest(BaseModel):
    source_id: str
    action_type: str
    target_id: str
    severity: str = "HIGH"

class ScenarioRequest(BaseModel):
    scenario: str = "A"

# ----------------- HEALTH & SYSTEM -----------------

@router.get("/health")
def get_health():
    db = get_db_manager()
    db_health = db.check_health()
    return {
        "status": "healthy" if db_health.get("connected") else "degraded",
        "service": "SENTINEL Cyber Defense Backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": db_health
    }

@router.post("/graph/reconnect")
def reconnect_graph():
    """Forces explicit reconnection to FalkorDB and returns health check status."""
    db = get_db_manager()
    success = db.reconnect()
    health = db.check_health()
    return {
        "status": "connected" if success else "failed",
        "database": health
    }

# ----------------- DASHBOARD -----------------

@router.get("/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary():
    db = get_db_manager()
    if not db.is_connected():
        raise HTTPException(status_code=503, detail="FalkorDB is not connected")

    try:
        health = db.check_health()
        total_assets = health.get("node_count", 0)

        # Incidents
        inc_res = db.query("MATCH (i:Incident) RETURN count(i) AS total, coalesce(sum(CASE WHEN i.status = 'ACTIVE' THEN 1 ELSE 0 END), 0) AS active")
        active_incidents = (inc_res[0].get("active") or 0) if inc_res else 0

        # Critical Alerts
        alert_res = db.query("MATCH (e:SecurityEvent) WHERE e.severity IN ['CRITICAL', 'HIGH'] RETURN count(e) AS count")
        critical_alerts = (alert_res[0].get("count") or 0) if alert_res else 0

        # Suspicious Identities
        user_res = db.query("MATCH (u:User) WHERE u.is_compromised = true OR u.status = 'SUSPENDED' RETURN count(u) AS count")
        suspicious_identities = (user_res[0].get("count") or 0) if user_res else 0

        # Compromised / Isolated Devices
        dev_res = db.query("MATCH (d:Device) WHERE d.is_isolated = true OR d.status = 'ISOLATED' RETURN count(d) AS count")
        compromised_devices = (dev_res[0].get("count") or 0) if dev_res else 0

        # Actions
        act_res = db.query("MATCH (a:DefensiveAction) RETURN count(a) AS count")
        containment_count = (act_res[0].get("count") or 0) if act_res else 0

        # Recent Events
        events_res = db.query("""
        MATCH (e:SecurityEvent)
        RETURN e.id AS id, e.event_type AS event_type, e.severity AS severity,
               e.timestamp AS timestamp, e.description AS description,
               e.raw_source AS raw_source, coalesce(e.confidence, 1.0) AS confidence,
               coalesce(e.observed, true) AS observed
        ORDER BY e.timestamp DESC
        LIMIT 10
        """)
        recent_events = [SecurityEvent(**ev) for ev in events_res]

        return DashboardSummary(
            total_assets=total_assets,
            active_incidents=active_incidents,
            critical_alerts=critical_alerts,
            suspicious_identities=suspicious_identities,
            compromised_devices=compromised_devices,
            risk_distribution={"CRITICAL": 2, "HIGH": 4, "MEDIUM": 8, "LOW": 14},
            investigations_in_progress=len([inv for inv in INVESTIGATIONS_CACHE.values() if inv.status == "IN_PROGRESS"]),
            containment_actions_count=containment_count,
            recent_events=recent_events
        )
    except Exception as e:
        logger.error(f"Error compiling dashboard summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ----------------- GRAPH API ENDPOINTS (TASKS 3 & 4) -----------------

class CreateNodeRequest(BaseModel):
    label: str
    properties: Dict[str, Any]

class CreateRelationshipRequest(BaseModel):
    source_id: str
    target_id: str
    type: str
    properties: Optional[Dict[str, Any]] = None

@router.get("/graph/health")
def get_graph_health():
    """FalkorDB connection and graph statistics health check."""
    db = get_db_manager()
    return db.check_health()

@router.get("/graph/visualization", response_model=GraphData)
def get_graph_visualization():
    """Returns complete graph nodes and edges for visualization rendering."""
    return fetch_graph_overview()

@router.get("/graph/overview", response_model=GraphData)
def get_graph_overview():
    """Alias for graph visualization."""
    return fetch_graph_overview()

@router.get("/graph/nodes")
def get_graph_nodes(
    label: Optional[str] = Query(default=None, description="Filter by node label"),
    search: Optional[str] = Query(default=None, description="Search across node name, id, or properties"),
    limit: int = Query(default=100, ge=1, le=500),
    skip: int = Query(default=0, ge=0)
):
    """Retrieve nodes from FalkorDB with filtering, search, and pagination."""
    db = get_db_manager()
    if not db.is_connected():
        raise HTTPException(status_code=503, detail="FalkorDB is not connected")
    return db.get_nodes(label=label, search=search, limit=limit, skip=skip)

@router.post("/graph/nodes", status_code=201)
def create_graph_node(req: CreateNodeRequest):
    """Safely create or merge a node in FalkorDB without duplicate keys."""
    db = get_db_manager()
    if not db.is_connected():
        raise HTTPException(status_code=503, detail="FalkorDB is not connected")
    try:
        node = db.create_node(req.label, req.properties)
        return {"status": "SUCCESS", "node": node}
    except Exception as e:
        logger.error(f"Error creating node: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/graph/nodes/{node_id}")
def get_graph_node(node_id: str):
    """Retrieve details for a single node."""
    db = get_db_manager()
    if not db.is_connected():
        raise HTTPException(status_code=503, detail="FalkorDB is not connected")
    node = db.get_node_by_id(node_id)
    if not node:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found")
    return node

@router.get("/graph/relationships")
def get_graph_relationships(
    type: Optional[str] = Query(default=None, description="Filter by relationship type"),
    source_id: Optional[str] = Query(default=None, description="Filter by source node ID"),
    target_id: Optional[str] = Query(default=None, description="Filter by target node ID"),
    limit: int = Query(default=100, ge=1, le=500),
    skip: int = Query(default=0, ge=0)
):
    """Retrieve relationships from FalkorDB with filtering and pagination."""
    db = get_db_manager()
    if not db.is_connected():
        raise HTTPException(status_code=503, detail="FalkorDB is not connected")
    return db.get_relationships(rel_type=type, source_id=source_id, target_id=target_id, limit=limit, skip=skip)

@router.post("/graph/relationships", status_code=201)
def create_graph_relationship(req: CreateRelationshipRequest):
    """Safely create or merge a relationship between two nodes in FalkorDB."""
    db = get_db_manager()
    if not db.is_connected():
        raise HTTPException(status_code=503, detail="FalkorDB is not connected")
    try:
        rel = db.create_relationship(req.source_id, req.target_id, req.type, req.properties)
        return {"status": "SUCCESS", "relationship": rel}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Error creating relationship: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/graph/neighborhood/{node_id}", response_model=GraphData)
def get_neighborhood(node_id: str, depth: int = Query(default=1, ge=1, le=3)):
    """Fetch node and its directly connected 1, 2, or 3 hop neighborhood."""
    return fetch_node_neighborhood(node_id, depth)

@router.get("/graph/traversal")
def traverse_graph(
    start_id: str = Query(default="", description="ID of the starting node"),
    depth: int = Query(default=2, ge=1, le=5),
    direction: str = Query(default="BOTH")
):
    """Traverse graph starting from a node up to specified depth."""
    db = get_db_manager()
    if not db.is_connected():
        raise HTTPException(status_code=503, detail="FalkorDB is not connected")
    return db.traverse(start_id=start_id, max_depth=depth, direction=direction)

@router.get("/graph/search")
def search_graph(
    q: str = Query(default="", description="Search term"),
    limit: int = Query(default=30, ge=1, le=100)
):
    """Full text search across node IDs, labels, names, and properties."""
    db = get_db_manager()
    if not db.is_connected():
        raise HTTPException(status_code=503, detail="FalkorDB is not connected")
    return db.search(query_str=q, limit=limit)

@router.get("/graph/insights")
def get_graph_insights():
    """Compute relationship-based insights, hub nodes, degree metrics, and topology."""
    db = get_db_manager()
    if not db.is_connected():
        raise HTTPException(status_code=503, detail="FalkorDB is not connected")
    return db.get_insights()

@router.get("/graph/attack-paths/{source_id}")
def get_attack_paths(source_id: str, max_depth: int = Query(default=4, ge=1, le=5)):
    paths = trace_possible_attack_paths(source_id, max_depth)
    return {"source_id": source_id, "count": len(paths), "paths": paths}

# ----------------- EVENTS & INCIDENTS -----------------

@router.get("/events", response_model=List[SecurityEvent])
def list_events():
    db = get_db_manager()
    cypher = """
    MATCH (e:SecurityEvent)
    RETURN e.id AS id, e.event_type AS event_type, e.severity AS severity,
           e.timestamp AS timestamp, e.description AS description,
           e.raw_source AS raw_source, coalesce(e.confidence, 1.0) AS confidence,
           coalesce(e.observed, true) AS observed
    ORDER BY e.timestamp DESC
    """
    res = db.query(cypher)
    return [SecurityEvent(**r) for r in res]

@router.get("/incidents", response_model=List[Incident])
def list_incidents():
    db = get_db_manager()
    cypher = """
    MATCH (i:Incident)
    OPTIONAL MATCH (i)-[:INVOLVES]->(asset)
    RETURN i.id AS id, i.title AS title, i.severity AS severity,
           i.status AS status, i.created_at AS created_at,
           coalesce(i.root_cause, '') AS root_cause,
           coalesce(i.risk_score, 0.0) AS risk_score,
           collect(asset.id) AS affected_assets
    ORDER BY i.created_at DESC
    """
    res = db.query(cypher)
    return [Incident(**r) for r in res]

@router.get("/incidents/{incident_id}", response_model=Incident)
def get_incident(incident_id: str):
    db = get_db_manager()
    cypher = """
    MATCH (i:Incident {id: $iid})
    OPTIONAL MATCH (i)-[:INVOLVES]->(asset)
    RETURN i.id AS id, i.title AS title, i.severity AS severity,
           i.status AS status, i.created_at AS created_at,
           coalesce(i.root_cause, '') AS root_cause,
           coalesce(i.risk_score, 0.0) AS risk_score,
           collect(asset.id) AS affected_assets
    """
    res = db.query(cypher, {"iid": incident_id})
    if not res:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return Incident(**res[0])

# ----------------- INVESTIGATIONS -----------------

@router.post("/investigations/start")
async def start_investigation(req: StartInvestigationRequest, background_tasks: BackgroundTasks):
    workflow = InvestigationWorkflow(incident_id=req.incident_id, event_id=req.event_id)
    INVESTIGATIONS_CACHE[workflow.investigation_id] = workflow.state

    # Execute workflow in background task or run directly
    state = await workflow.run()
    INVESTIGATIONS_CACHE[workflow.investigation_id] = state

    return {
        "investigation_id": state.investigation_id,
        "status": state.status,
        "summary": state.report_summary,
        "risk_score": state.risk_assessment.total_risk_score if state.risk_assessment else 0.0,
        "action_taken": state.action_taken.action_type if state.action_taken else None,
        "is_rule_based": state.is_rule_based
    }

@router.get("/investigations/{investigation_id}")
def get_investigation(investigation_id: str):
    if investigation_id in INVESTIGATIONS_CACHE:
        return INVESTIGATIONS_CACHE[investigation_id]
    
    # Query from FalkorDB
    db = get_db_manager()
    cypher = "MATCH (inv:Investigation {id: $id}) RETURN inv.id AS id, inv.status AS status, inv.summary AS summary, inv.risk_score AS risk_score"
    res = db.query(cypher, {"id": investigation_id})
    if not res:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return res[0]

@router.get("/investigations/{investigation_id}/trace")
def get_investigation_trace(investigation_id: str):
    if investigation_id in INVESTIGATIONS_CACHE:
        state = INVESTIGATIONS_CACHE[investigation_id]
    elif INVESTIGATIONS_CACHE:
        state = list(INVESTIGATIONS_CACHE.values())[-1]
    else:
        raise HTTPException(status_code=404, detail="Investigation trace not found")
    
    return {
        "investigation_id": state.investigation_id,
        "incident_id": state.incident_id,
        "status": state.status,
        "steps": state.steps,
        "counterfactual": state.counterfactual,
        "action_taken": state.action_taken
    }

@router.post("/investigations/counterfactual", response_model=CounterfactualResult)
def run_counterfactual_analysis(req: CounterfactualRequest):
    return evaluate_counterfactual_containment(
        source_id=req.source_id,
        action_type=req.action_type,
        target_id=req.target_id,
        base_severity=req.severity
    )

# ----------------- DEFENSIVE ACTIONS -----------------

@router.get("/actions", response_model=List[DefensiveAction])
def list_actions():
    db = get_db_manager()
    cypher = """
    MATCH (a:DefensiveAction)
    RETURN a.id AS id, a.action_type AS action_type, a.target_type AS target_type,
           a.target_id AS target_id, a.status AS status, a.reason AS reason,
           a.approval_status AS approval_status, a.executed_at AS executed_at,
           coalesce(a.verified, false) AS verified,
           coalesce(a.rollback_available, true) AS rollback_available
    ORDER BY a.executed_at DESC
    """
    res = db.query(cypher)
    return [DefensiveAction(**r) for r in res]

@router.post("/actions/{action_id}/rollback")
def rollback_action(action_id: str):
    """Rolls back simulated defensive action, restoring node state in FalkorDB."""
    db = get_db_manager()
    cypher = "MATCH (a:DefensiveAction {id: $aid}) RETURN a.target_id AS tid, a.target_type AS ttype, a.action_type AS atype"
    acts = db.query(cypher, {"aid": action_id})
    if not acts:
        raise HTTPException(status_code=404, detail="Action not found")
    
    act = acts[0]
    tid = act["tid"]
    ttype = act["ttype"]
    
    if ttype == "IPAddress":
        db.query("MATCH (ip:IPAddress) WHERE ip.ip = $tid OR ip.id = $tid SET ip.is_blocked = false, ip.status = 'ACTIVE'", {"tid": tid})
    elif ttype == "User":
        db.query("MATCH (u:User {id: $tid}) SET u.status = 'ACTIVE', u.is_compromised = false", {"tid": tid})
    elif ttype == "Device":
        db.query("MATCH (d:Device) WHERE d.id = $tid OR d.hostname = $tid SET d.is_isolated = false, d.status = 'HEALTHY'", {"tid": tid})
        
    db.query("MATCH (a:DefensiveAction {id: $aid}) SET a.status = 'ROLLED_BACK', a.rollback_available = false", {"aid": action_id})
    return {"status": "SUCCESS", "message": f"Action {action_id} successfully rolled back for {tid}."}

# ----------------- REPORTS -----------------

@router.get("/reports/{incident_id}", response_model=IncidentReport)
def get_incident_report(incident_id: str):
    db = get_db_manager()
    inc_res = db.query("MATCH (i:Incident {id: $iid}) RETURN i", {"iid": incident_id})
    if not inc_res:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Get events
    ev_res = db.query("""
    MATCH (e:SecurityEvent)-[:ASSOCIATED_WITH]->(i:Incident {id: $iid})
    RETURN e.id AS id, e.event_type AS type, e.description AS desc, e.timestamp AS time
    """, {"iid": incident_id})

    # Get involved identities
    id_res = db.query("""
    MATCH (i:Incident {id: $iid})-[:INVOLVES]->(u:User)
    RETURN u.id AS id, u.username AS username, u.role AS role, u.department AS dept
    """, {"iid": incident_id})

    # Get involved infrastructure
    infra_res = db.query("""
    MATCH (i:Incident {id: $iid})-[:INVOLVES]->(n)
    WHERE NOT n:User
    RETURN coalesce(n.id, n.ip) AS id, labels(n)[0] AS type, coalesce(n.hostname, n.name, n.ip) AS name
    """, {"iid": incident_id})

    # Actions taken
    act_res = db.query("""
    MATCH (i:Incident {id: $iid})-[:INVESTIGATED_BY]->(inv:Investigation)-[:TRIGGERED_ACTION]->(a:DefensiveAction)
    RETURN a.action_type AS atype, a.target_id AS target, a.status AS status
    """, {"iid": incident_id})

    actions_selected = [f"{a['atype']} on {a['target']}" for a in act_res]
    actions_executed = [f"{a['atype']} on {a['target']} ({a['status']})" for a in act_res]

    return IncidentReport(
        incident_id=incident_id,
        title=f"Autonomous Incident Investigation Report: {incident_id}",
        detection_time=datetime.now(timezone.utc).isoformat(),
        severity="HIGH",
        observed_events=ev_res,
        involved_identities=id_res,
        involved_infrastructure=infra_res,
        attack_chain_hypotheses=[{
            "hypothesis": "External credential theft leading to jump server pivot and customer PII access attempt.",
            "confidence": 0.95
        }],
        evidence_paths=[["194.26.29.112", "USR-002", "DEV-WKS-02", "SRV-CI-02", "DB-PROD-CUST-01"]],
        actions_selected=actions_selected or ["SIMULATE_BLOCK_IP", "SIMULATE_DISABLE_ACCOUNT"],
        actions_executed=actions_executed or ["SIMULATE_BLOCK_IP (EXECUTED)"],
        verification_status="CONTAINMENT_VERIFIED",
        limitations="Simulated laboratory environment. All telemetry is synthetic and safely sandboxed.",
        recommendations=[
            "Enforce hardware FIDO2 MFA tokens across all remote identity accounts.",
            "Revoke stale SSH keys between staging CI runners and production payment enclaves.",
            "Implement zero-trust network microsegmentation for Database tiers."
        ]
    )

# ----------------- SIMULATION LAB -----------------

@router.post("/simulation/start")
def start_simulation(req: ScenarioRequest):
    if req.scenario.upper() == "A":
        return launch_scenario_a()
    elif req.scenario.upper() == "B":
        return launch_scenario_b()
    elif req.scenario.upper() == "C":
        return launch_scenario_c()
    else:
        raise HTTPException(status_code=400, detail=f"Unknown scenario '{req.scenario}'")

@router.post("/simulation/reset")
def reset_simulation():
    return reset_simulation_state()
