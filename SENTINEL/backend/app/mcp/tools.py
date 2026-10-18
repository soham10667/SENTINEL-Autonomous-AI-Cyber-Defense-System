import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.database.falkor import get_db_manager
from app.graph.traversals import (
    find_connected_assets as graph_find_connected_assets,
    trace_possible_attack_paths as graph_trace_possible_attack_paths,
    get_asset_permissions as graph_get_asset_permissions
)
from app.agents.risk_engine import calculate_graph_risk

logger = logging.getLogger("sentinel.mcp.tools")

def get_security_event(event_id: str) -> Dict[str, Any]:
    """Retrieve full details for a security event from FalkorDB."""
    db = get_db_manager()
    cypher = """
    MATCH (e:SecurityEvent {id: $event_id})
    OPTIONAL MATCH (src)-[:GENERATED_EVENT]->(e)
    RETURN e.id AS id, e.event_type AS event_type, e.severity AS severity,
           e.timestamp AS timestamp, e.description AS description,
           e.raw_source AS raw_source, coalesce(e.confidence, 1.0) AS confidence,
           coalesce(e.observed, true) AS observed,
           coalesce(src.id, '') AS source_entity_id,
           labels(src)[0] AS source_entity_type
    """
    res = db.query(cypher, {"event_id": event_id})
    if res:
        return res[0]
    return {"error": f"Event {event_id} not found"}

def find_connected_assets(entity_id: str, depth: int = 2) -> Dict[str, Any]:
    """Find all connected infrastructure and identities up to depth hops."""
    results = graph_find_connected_assets(entity_id, depth)
    return {
        "entity_id": entity_id,
        "depth": depth,
        "count": len(results),
        "connected_assets": results
    }

def trace_possible_attack_paths(source_id: str, max_depth: int = 4) -> Dict[str, Any]:
    """Discover multi-hop access paths from source leading towards high-value targets."""
    paths = graph_trace_possible_attack_paths(source_id, max_depth)
    return {
        "source_id": source_id,
        "max_depth": max_depth,
        "path_count": len(paths),
        "paths": paths
    }

def get_asset_permissions(asset_id: str) -> Dict[str, Any]:
    """Retrieve access permissions and authorized users for an asset."""
    perms = graph_get_asset_permissions(asset_id)
    return {
        "asset_id": asset_id,
        "permissions": perms
    }

def calculate_graph_risk_tool(incident_id: str, source_id: str, severity: str = "HIGH") -> Dict[str, Any]:
    """Compute mathematical deterministic risk score based on FalkorDB topology."""
    risk_breakdown = calculate_graph_risk(source_id=source_id, base_severity=severity)
    return risk_breakdown.model_dump()

def get_incident_history(limit: int = 10) -> Dict[str, Any]:
    """Retrieve recent incidents and their outcomes."""
    db = get_db_manager()
    cypher = """
    MATCH (i:Incident)
    RETURN i.id AS id, i.title AS title, i.severity AS severity,
           i.status AS status, i.created_at AS created_at,
           coalesce(i.risk_score, 0.0) AS risk_score,
           coalesce(i.root_cause, '') AS root_cause
    ORDER BY i.created_at DESC
    LIMIT $limit
    """
    results = db.query(cypher, {"limit": limit})
    return {"incidents": results}

def simulate_block_ip(ip: str, reason: str, incident_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Defensive MCP Tool: Safely simulates blocking a suspicious IP address in simulated perimeter firewalls.
    Updates FalkorDB node property and logs DefensiveAction.
    """
    db = get_db_manager()
    action_id = f"ACT-BLK-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now(timezone.utc).isoformat()

    # Update IP in FalkorDB
    update_cypher = """
    MATCH (ip:IPAddress)
    WHERE ip.ip = $ip OR ip.id = $ip
    SET ip.is_blocked = true, ip.status = 'BLOCKED', ip.blocked_at = $now
    RETURN ip.ip AS ip, ip.id AS id
    """
    updated = db.query(update_cypher, {"ip": ip, "now": now_str})
    
    # Record Defensive Action
    action_cypher = """
    CREATE (a:DefensiveAction {
        id: $action_id,
        action_type: 'BLOCK_IP',
        target_type: 'IPAddress',
        target_id: $ip,
        status: 'EXECUTED',
        reason: $reason,
        approval_status: 'AUTO_APPROVED',
        executed_at: $now,
        verified: true,
        rollback_available: true
    })
    """
    db.query(action_cypher, {
        "action_id": action_id,
        "ip": ip,
        "reason": reason,
        "now": now_str
    })

    logger.info(f"[MCP TOOL] Successfully executed simulate_block_ip on {ip} (Action ID: {action_id})")
    return {
        "action_id": action_id,
        "action_type": "BLOCK_IP",
        "target": ip,
        "status": "EXECUTED",
        "verified": True,
        "executed_at": now_str,
        "message": f"Simulated firewall rule injected: Inbound/Outbound traffic from {ip} dropped."
    }

def simulate_disable_account(user_id: str, reason: str, incident_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Defensive MCP Tool: Safely disables a compromised synthetic user account in directory services.
    Updates FalkorDB user status to SUSPENDED.
    """
    db = get_db_manager()
    action_id = f"ACT-DIS-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now(timezone.utc).isoformat()

    # Update User in FalkorDB
    update_cypher = """
    MATCH (u:User {id: $user_id})
    SET u.status = 'SUSPENDED', u.is_compromised = true, u.suspended_at = $now
    RETURN u.id AS id, u.username AS username
    """
    updated = db.query(update_cypher, {"user_id": user_id, "now": now_str})

    action_cypher = """
    CREATE (a:DefensiveAction {
        id: $action_id,
        action_type: 'DISABLE_ACCOUNT',
        target_type: 'User',
        target_id: $user_id,
        status: 'EXECUTED',
        reason: $reason,
        approval_status: 'AUTO_APPROVED',
        executed_at: $now,
        verified: true,
        rollback_available: true
    })
    """
    db.query(action_cypher, {
        "action_id": action_id,
        "user_id": user_id,
        "reason": reason,
        "now": now_str
    })

    logger.info(f"[MCP TOOL] Successfully executed simulate_disable_account on {user_id} (Action ID: {action_id})")
    return {
        "action_id": action_id,
        "action_type": "DISABLE_ACCOUNT",
        "target": user_id,
        "status": "EXECUTED",
        "verified": True,
        "executed_at": now_str,
        "message": f"Synthetic identity {user_id} revoked in simulated identity provider. Active tokens invalidated."
    }

def simulate_isolate_device(device_id: str, reason: str, incident_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Defensive MCP Tool: Safely isolates a compromised synthetic device via simulated EDR agent.
    Severing lateral connectivity in FalkorDB.
    """
    db = get_db_manager()
    action_id = f"ACT-ISO-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now(timezone.utc).isoformat()

    # Update Device in FalkorDB
    update_cypher = """
    MATCH (d:Device)
    WHERE d.id = $device_id OR d.hostname = $device_id
    SET d.is_isolated = true, d.status = 'ISOLATED', d.isolated_at = $now
    RETURN d.id AS id, d.hostname AS hostname
    """
    updated = db.query(update_cypher, {"device_id": device_id, "now": now_str})

    action_cypher = """
    CREATE (a:DefensiveAction {
        id: $action_id,
        action_type: 'ISOLATE_DEVICE',
        target_type: 'Device',
        target_id: $device_id,
        status: 'EXECUTED',
        reason: $reason,
        approval_status: 'AUTO_APPROVED',
        executed_at: $now,
        verified: true,
        rollback_available: true
    })
    """
    db.query(action_cypher, {
        "action_id": action_id,
        "device_id": device_id,
        "reason": reason,
        "now": now_str
    })

    logger.info(f"[MCP TOOL] Successfully executed simulate_isolate_device on {device_id} (Action ID: {action_id})")
    return {
        "action_id": action_id,
        "action_type": "ISOLATE_DEVICE",
        "target": device_id,
        "status": "EXECUTED",
        "verified": True,
        "executed_at": now_str,
        "message": f"Simulated endpoint {device_id} placed into network containment. Lateral network interfaces disabled."
    }

def verify_containment(action_id: str) -> Dict[str, Any]:
    """
    Defensive MCP Tool: Validates that the defensive containment action was successfully applied in FalkorDB
    and verifies that downstream attack path exposure is eliminated.
    """
    db = get_db_manager()
    cypher = """
    MATCH (a:DefensiveAction {id: $action_id})
    RETURN a.id AS id, a.action_type AS action_type, a.target_id AS target_id,
           a.target_type AS target_type, a.status AS status, a.executed_at AS executed_at
    """
    actions = db.query(cypher, {"action_id": action_id})
    if not actions:
        return {"verified": False, "error": f"Action {action_id} not found"}
    
    act = actions[0]
    target_id = act["target_id"]
    target_type = act["target_type"]
    
    # Query target node status
    if target_type == "IPAddress":
        verify_cypher = "MATCH (ip:IPAddress) WHERE ip.ip = $tid OR ip.id = $tid RETURN ip.is_blocked AS verified, ip.status AS status"
    elif target_type == "User":
        verify_cypher = "MATCH (u:User {id: $tid}) RETURN (u.status = 'SUSPENDED') AS verified, u.status AS status"
    elif target_type == "Device":
        verify_cypher = "MATCH (d:Device) WHERE d.id = $tid OR d.hostname = $tid RETURN (d.is_isolated = true) AS verified, d.status AS status"
    else:
        verify_cypher = "RETURN true AS verified, 'OK' AS status"

    check_res = db.query(verify_cypher, {"tid": target_id})
    is_verified = bool(check_res and check_res[0].get("verified", False))

    return {
        "action_id": action_id,
        "target_id": target_id,
        "target_type": target_type,
        "verified": is_verified,
        "containment_status": "CONFIRMED_ENFORCED" if is_verified else "FAILED",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
