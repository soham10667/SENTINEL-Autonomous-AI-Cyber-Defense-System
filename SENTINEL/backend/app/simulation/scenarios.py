import logging
from datetime import datetime, timezone
from typing import Dict, Any
from app.database.falkor import get_db_manager
from app.simulation.seed_data import seed_enterprise_graph

logger = logging.getLogger("sentinel.scenarios")

def launch_scenario_a() -> Dict[str, Any]:
    """
    Scenario A: Compromised Employee Account (Primary Hackathon Demo Scenario)
    Anomalous external login from proxy IP 194.26.29.112 hijacking USR-002 (Sarah Connor).
    Lateral traversal threatens Customer PII Database (DB-PROD-CUST-01) and PCI Store (DB-PAYMENTS-01).
    """
    db = get_db_manager()
    now_str = datetime.now(timezone.utc).isoformat()
    incident_id = "INC-2026-0842"
    event_id = "EVT-AUTH-ANOMALY-01"

    # Ensure baseline graph exists
    seed_enterprise_graph()

    logger.info("Injecting Scenario A synthetic attack vectors...")
    cypher = """
    MATCH (ip:IPAddress {ip: '194.26.29.112'}), (u:User {id: 'USR-002'})
    
    CREATE (evt:SecurityEvent {
        id: $event_id,
        event_type: 'ANOMALOUS_EXTERNAL_LOGIN',
        severity: 'HIGH',
        timestamp: $now,
        description: 'Anomalous foreign authentication from known high-risk proxy node bypassing MFA policy.',
        raw_source: 'Okta Enterprise Identity Protection',
        confidence: 0.98,
        observed: true
    })
    
    CREATE (inc:Incident {
        id: $incident_id,
        title: 'Credential Hijack & Anomalous Access: USR-002 via Proxy IP',
        severity: 'HIGH',
        status: 'ACTIVE',
        created_at: $now,
        root_cause: 'Compromised marketing user credentials leveraged for initial perimeter access.',
        risk_score: 87.5
    })

    CREATE (ip)-[:LOGGED_IN_FROM {observed: true, session: 'malicious-sess-99', timestamp: $now}]->(u)
    CREATE (ip)-[:GENERATED_EVENT]->(evt)
    CREATE (evt)-[:ASSOCIATED_WITH]->(inc)
    CREATE (inc)-[:INVOLVES]->(u)
    CREATE (inc)-[:INVOLVES]->(ip)
    """
    db.query(cypher, {
        "event_id": event_id,
        "incident_id": incident_id,
        "now": now_str
    })

    return {
        "scenario": "A",
        "name": "Compromised Employee Account",
        "incident_id": incident_id,
        "event_id": event_id,
        "source_entity": "194.26.29.112",
        "compromised_identity": "USR-002",
        "threat_description": "External attacker using compromised credentials to traverse from Sarah Connor's identity towards DB-PROD-CUST-01 and DB-PAYMENTS-01."
    }

def launch_scenario_b() -> Dict[str, Any]:
    """
    Scenario B: Suspicious Lateral Access
    Compromised CI/CD server SRV-CI-02 pivoting into Payment Gateway SRV-PAY-API.
    """
    db = get_db_manager()
    now_str = datetime.now(timezone.utc).isoformat()
    incident_id = "INC-2026-0915"
    event_id = "EVT-LATERAL-SSH-02"

    seed_enterprise_graph()
    logger.info("Injecting Scenario B synthetic lateral movement...")

    cypher = """
    MATCH (s_ci:Server {id: 'SRV-CI-02'}), (s_pay:Server {id: 'SRV-PAY-API'})
    
    CREATE (evt:SecurityEvent {
        id: $event_id,
        event_type: 'UNAUTHORIZED_LATERAL_TUNNEL',
        severity: 'CRITICAL',
        timestamp: $now,
        description: 'Unauthorized encrypted SSH tunnel detected from build runner staging host into PCI payment enclave.',
        raw_source: 'CrowdStrike Falcon Network Containment',
        confidence: 0.99,
        observed: true
    })

    CREATE (inc:Incident {
        id: $incident_id,
        title: 'Lateral Movement: Staging Build Runner -> PCI Production Enclave',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        created_at: $now,
        root_cause: 'Malicious supply-chain dependency running arbitrary commands on CI runner.',
        risk_score: 94.0
    })

    CREATE (s_ci)-[:GENERATED_EVENT]->(evt)
    CREATE (evt)-[:ASSOCIATED_WITH]->(inc)
    CREATE (inc)-[:INVOLVES]->(s_ci)
    CREATE (inc)-[:INVOLVES]->(s_pay)
    """
    db.query(cypher, {
        "event_id": event_id,
        "incident_id": incident_id,
        "now": now_str
    })

    return {
        "scenario": "B",
        "name": "Suspicious Lateral Access",
        "incident_id": incident_id,
        "event_id": event_id,
        "source_entity": "SRV-CI-02",
        "compromised_identity": "SRV-CI-02",
        "threat_description": "Staging server pivoting directly to PCI DSS production payment backend."
    }

def launch_scenario_c() -> Dict[str, Any]:
    """
    Scenario C: Privilege Misuse
    Contractor USR-004 granted unexpected root permission accessing Key Management Vault SRV-KMS-01.
    """
    db = get_db_manager()
    now_str = datetime.now(timezone.utc).isoformat()
    incident_id = "INC-2026-1033"
    event_id = "EVT-PRIV-ESCALATE-03"

    seed_enterprise_graph()
    logger.info("Injecting Scenario C synthetic privilege escalation...")

    cypher = """
    MATCH (u:User {id: 'USR-004'}), (p:Permission {id: 'PERM-AWS-PROD-FULL'}), (s_kms:Server {id: 'SRV-KMS-01'})
    
    CREATE (evt:SecurityEvent {
        id: $event_id,
        event_type: 'UNAUTHORIZED_PRIVILEGE_ELEVATION',
        severity: 'HIGH',
        timestamp: $now,
        description: 'Contractor account granted AWS AdministratorAccess without ticket approval, accessing production Vault.',
        raw_source: 'AWS CloudTrail Event Bridge',
        confidence: 0.96,
        observed: true
    })

    CREATE (inc:Incident {
        id: $incident_id,
        title: 'Unauthorized IAM Escalation: USR-004 -> Cloud Vault KMS',
        severity: 'HIGH',
        status: 'ACTIVE',
        created_at: $now,
        root_cause: 'Rogue IAM permission assignment detected without peer approval.',
        risk_score: 82.0
    })

    CREATE (u)-[:HAS_ACCESS_TO {observed: true, assigned_at: $now}]->(p)
    CREATE (u)-[:GENERATED_EVENT]->(evt)
    CREATE (evt)-[:ASSOCIATED_WITH]->(inc)
    CREATE (inc)-[:INVOLVES]->(u)
    CREATE (inc)-[:INVOLVES]->(s_kms)
    """
    db.query(cypher, {
        "event_id": event_id,
        "incident_id": incident_id,
        "now": now_str
    })

    return {
        "scenario": "C",
        "name": "Privilege Misuse",
        "incident_id": incident_id,
        "event_id": event_id,
        "source_entity": "USR-004",
        "compromised_identity": "USR-004",
        "threat_description": "Contractor account elevated to AdministratorAccess attempting to access KMS vault."
    }

def reset_simulation_state() -> Dict[str, Any]:
    """Resets sentinel graph to clean baseline without affecting existing hackathon graph."""
    success = seed_enterprise_graph()
    return {
        "status": "RESET_SUCCESSFUL",
        "graph": "sentinel",
        "baseline_seeded": success,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
