import logging
from typing import Dict, Any, List
from app.database.falkor import get_db_manager
from app.database.schema import clear_sentinel_graph, init_schema

logger = logging.getLogger("sentinel.seed_data")

def seed_enterprise_graph(force_reset: bool = False, target_graph: str = "sentinel") -> bool:
    """
    Seeds a rich, realistic synthetic enterprise IT & cloud graph in FalkorDB.
    Strictly isolated inside the specified target graph (defaults to 'sentinel').
    Guaranteed idempotent using MERGE - does NOT duplicate nodes or relationships.
    NEVER touches, overwrites, or clears the 'hackathon' graph or other graphs.
    """
    db = get_db_manager()
    if not db.is_connected():
        logger.error("Cannot seed database: FalkorDB is not connected.")
        return False

    # Safety assertion: never seed into hackathon graph
    if target_graph.lower() == "hackathon":
        logger.warning("SAFETY SHIELD: Refusing to seed or modify 'hackathon' graph. Preserving existing graph data.")
        return False

    # Ensure target graph is selected
    original_graph = db.graph_name
    db.select_graph(target_graph)

    try:
        # Check existing node count
        node_count_res = db.query("MATCH (n) RETURN count(n) AS cnt")
        current_node_count = node_count_res[0]["cnt"] if node_count_res else 0

        if force_reset:
            if target_graph == "sentinel":
                logger.warning("Explicit force_reset requested. Clearing 'sentinel' graph for fresh initialization...")
                clear_sentinel_graph()
            else:
                logger.warning(f"Refusing to clear non-sentinel graph '{target_graph}'.")
        elif current_node_count >= 27:
            logger.info(f"Graph '{target_graph}' already contains {current_node_count} nodes. Performing idempotent merge.")

        logger.info(f"Idempotently seeding synthetic corporate IT infrastructure into '{target_graph}' graph...")
        init_schema()

        # 1. Identities (Users) - MERGE
        users_cypher = """
        MERGE (u1:User {id: 'USR-001'})
          ON CREATE SET u1.username = 'alice.chen', u1.email = 'alice.chen@sentinelcorp.internal', u1.role = 'Cloud Architect', u1.department = 'Infrastructure', u1.status = 'ACTIVE', u1.risk_score = 10.0, u1.is_compromised = false
        MERGE (u2:User {id: 'USR-002'})
          ON CREATE SET u2.username = 'sarah.connor', u2.email = 'sarah.connor@sentinelcorp.internal', u2.role = 'Marketing Lead', u2.department = 'Growth', u2.status = 'ACTIVE', u2.risk_score = 15.0, u2.is_compromised = false
        MERGE (u3:User {id: 'USR-003'})
          ON CREATE SET u3.username = 'bob.martinez', u3.email = 'bob.martinez@sentinelcorp.internal', u3.role = 'Lead DBA', u3.department = 'SecOps', u3.status = 'ACTIVE', u3.risk_score = 5.0, u3.is_compromised = false
        MERGE (u4:User {id: 'USR-004'})
          ON CREATE SET u4.username = 'alex.rivera', u4.email = 'alex.rivera@contractor.internal', u4.role = 'DevOps Contractor', u4.department = 'Engineering', u4.status = 'ACTIVE', u4.risk_score = 20.0, u4.is_compromised = false
        """
        db.query(users_cypher)

        # 2. Endpoints & Devices - MERGE
        devices_cypher = """
        MERGE (d1:Device {id: 'DEV-WKS-01'})
          ON CREATE SET d1.hostname = 'WKS-ALICE-MBP', d1.ip = '10.0.1.50', d1.os = 'macOS Sonoma', d1.asset_type = 'WORKSTATION', d1.status = 'HEALTHY', d1.is_isolated = false, d1.criticality = 'MEDIUM'
        MERGE (d2:Device {id: 'DEV-WKS-02'})
          ON CREATE SET d2.hostname = 'WKS-SARAH-WIN11', d2.ip = '10.0.1.51', d2.os = 'Windows 11 Enterprise', d2.asset_type = 'WORKSTATION', d2.status = 'HEALTHY', d2.is_isolated = false, d2.criticality = 'MEDIUM'
        MERGE (d3:Device {id: 'DEV-WKS-03'})
          ON CREATE SET d3.hostname = 'WKS-BOB-ARCH', d3.ip = '10.0.1.52', d3.os = 'Linux Fedora 40', d3.asset_type = 'WORKSTATION', d3.status = 'HEALTHY', d3.is_isolated = false, d3.criticality = 'HIGH'
        MERGE (d4:Device {id: 'DEV-WKS-04'})
          ON CREATE SET d4.hostname = 'WKS-ALEX-UBUNTU', d4.ip = '10.0.1.53', d4.os = 'Ubuntu 24.04 LTS', d4.asset_type = 'WORKSTATION', d4.status = 'HEALTHY', d4.is_isolated = false, d4.criticality = 'MEDIUM'
        """
        db.query(devices_cypher)

        # 3. Network IP Addresses - MERGE
        ips_cypher = """
        MERGE (ip_corp:IPAddress {id: 'IP-10-0-1-50'})
          ON CREATE SET ip_corp.ip = '10.0.1.50', ip_corp.type = 'INTERNAL', ip_corp.reputation = 100, ip_corp.country = 'US', ip_corp.is_blocked = false
        MERGE (ip_dmz:IPAddress {id: 'IP-10-0-2-10'})
          ON CREATE SET ip_dmz.ip = '10.0.2.10', ip_dmz.type = 'INTERNAL_DMZ', ip_dmz.reputation = 95, ip_dmz.country = 'US', ip_dmz.is_blocked = false
        MERGE (ip_tor:IPAddress {id: '194.26.29.112'})
          ON CREATE SET ip_tor.ip = '194.26.29.112', ip_tor.type = 'EXTERNAL_PROXY', ip_tor.reputation = 5, ip_tor.country = 'RU', ip_tor.is_blocked = false
        MERGE (ip_c2:IPAddress {id: '198.51.100.42'})
          ON CREATE SET ip_c2.ip = '198.51.100.42', ip_c2.type = 'EXTERNAL_MALICIOUS', ip_c2.reputation = 2, ip_c2.country = 'CN', ip_c2.is_blocked = false
        """
        db.query(ips_cypher)

        # 4. Servers & Infrastructure - MERGE
        servers_cypher = """
        MERGE (s_dc:Server {id: 'SRV-DC-01'})
          ON CREATE SET s_dc.hostname = 'dc01.corp.sentinel.internal', s_dc.ip = '10.0.0.5', s_dc.role = 'Active Directory Domain Controller', s_dc.environment = 'PRODUCTION', s_dc.criticality = 'CRITICAL', s_dc.os = 'Windows Server 2022', s_dc.is_isolated = false
        MERGE (s_ci:Server {id: 'SRV-CI-02'})
          ON CREATE SET s_ci.hostname = 'build-ci02.infra.sentinel.internal', s_ci.ip = '10.0.2.10', s_ci.role = 'GitLab CI Runner & Bastion', s_ci.environment = 'STAGING', s_ci.criticality = 'HIGH', s_ci.os = 'Ubuntu 22.04', s_ci.is_isolated = false
        MERGE (s_pay:Server {id: 'SRV-PAY-API'})
          ON CREATE SET s_pay.hostname = 'pay-api.core.sentinel.internal', s_pay.ip = '10.0.3.20', s_pay.role = 'PCI-DSS Payment Gateway Engine', s_pay.environment = 'PRODUCTION', s_pay.criticality = 'CRITICAL', s_pay.os = 'Alpine Linux Hardened', s_pay.is_isolated = false
        MERGE (s_kms:Server {id: 'SRV-KMS-01'})
          ON CREATE SET s_kms.hostname = 'vault-kms01.sec.sentinel.internal', s_kms.ip = '10.0.0.8', s_kms.role = 'HashiCorp Vault / Cloud KMS', s_kms.environment = 'PRODUCTION', s_kms.criticality = 'CRITICAL', s_kms.os = 'Linux Enterprise', s_kms.is_isolated = false
        MERGE (s_web:Server {id: 'SRV-WEB-01'})
          ON CREATE SET s_web.hostname = 'portal.sentinelcorp.com', s_web.ip = '10.0.4.15', s_web.role = 'Public Customer Portal Proxy', s_web.environment = 'PRODUCTION', s_web.criticality = 'MEDIUM', s_web.os = 'Nginx Enterprise', s_web.is_isolated = false
        """
        db.query(servers_cypher)

        # 5. Databases (Crown Jewels) - MERGE
        dbs_cypher = """
        MERGE (db_cust:Database {id: 'DB-PROD-CUST-01'})
          ON CREATE SET db_cust.name = 'Customer PII & Order History', db_cust.db_type = 'PostgreSQL 16', db_cust.contains_pii = true, db_cust.contains_financial = false, db_cust.criticality = 'CRITICAL', db_cust.data_classification = 'RESTRICTED'
        MERGE (db_pay:Database {id: 'DB-PAYMENTS-01'})
          ON CREATE SET db_pay.name = 'PCI Tokenized Payment Cards', db_pay.db_type = 'FalkorDB / Redis Cache', db_pay.contains_pii = true, db_pay.contains_financial = true, db_pay.criticality = 'CRITICAL', db_pay.data_classification = 'TOP_SECRET'
        MERGE (db_mkt:Database {id: 'DB-ANALYTICS-01'})
          ON CREATE SET db_mkt.name = 'Marketing & Traffic Metrics', db_mkt.db_type = 'ClickHouse OLAP', db_mkt.contains_pii = false, db_mkt.contains_financial = false, db_mkt.criticality = 'LOW', db_mkt.data_classification = 'INTERNAL'
        """
        db.query(dbs_cypher)

        # 6. Applications - MERGE
        apps_cypher = """
        MERGE (app_erp:Application {id: 'APP-ERP-CORE'})
          ON CREATE SET app_erp.name = 'Sentinel ERP Master Suite', app_erp.tier = 'BACKEND', app_erp.service_type = 'MICROSERVICE', app_erp.port = 8443, app_erp.status = 'RUNNING', app_erp.criticality = 'HIGH'
        MERGE (app_pay:Application {id: 'APP-BILLING-GATEWAY'})
          ON CREATE SET app_pay.name = 'Payment Processing Dispatcher', app_pay.tier = 'CORE', app_pay.service_type = 'API', app_pay.port = 9000, app_pay.status = 'RUNNING', app_pay.criticality = 'CRITICAL'
        MERGE (app_crm:Application {id: 'APP-CRM-GROWTH'})
          ON CREATE SET app_crm.name = 'Customer Relations Management', app_crm.tier = 'FRONTEND', app_crm.service_type = 'WEB', app_crm.port = 3000, app_crm.status = 'RUNNING', app_crm.criticality = 'MEDIUM'
        """
        db.query(apps_cypher)

        # 7. Permissions - MERGE
        perms_cypher = """
        MERGE (p_dom:Permission {id: 'PERM-DOMAIN-ADMIN'})
          ON CREATE SET p_dom.name = 'Active Directory Domain Admins', p_dom.scope = 'GLOBAL', p_dom.privilege_level = 'SUPERUSER', p_dom.is_admin = true
        MERGE (p_dba:Permission {id: 'PERM-DBA-ROOT'})
          ON CREATE SET p_dba.name = 'Postgres & FalkorDB Superuser Access', p_dba.scope = 'DATABASES', p_dba.privilege_level = 'ADMIN', p_dba.is_admin = true
        MERGE (p_aws:Permission {id: 'PERM-AWS-PROD-FULL'})
          ON CREATE SET p_aws.name = 'AWS Production AdministratorAccess', p_aws.scope = 'CLOUD_INFRA', p_aws.privilege_level = 'ADMIN', p_aws.is_admin = true
        MERGE (p_mkt:Permission {id: 'PERM-MARKETING-READ'})
          ON CREATE SET p_mkt.name = 'Marketing Read-Only Access', p_mkt.scope = 'ANALYTICS', p_mkt.privilege_level = 'USER', p_mkt.is_admin = false
        """
        db.query(perms_cypher)

        # 8. Create Realistic Baseline Relationships (Idempotent MERGE by pairs)
        relationships = [
            ("USR-001", "DEV-WKS-01", "LOGGED_IN_FROM", {"observed": True, "session": "sess-01"}),
            ("USR-002", "DEV-WKS-02", "LOGGED_IN_FROM", {"observed": True, "session": "sess-02"}),
            ("USR-003", "DEV-WKS-03", "LOGGED_IN_FROM", {"observed": True, "session": "sess-03"}),
            ("USR-004", "DEV-WKS-04", "LOGGED_IN_FROM", {"observed": True, "session": "sess-04"}),

            ("DEV-WKS-01", "SRV-CI-02", "CONNECTED_TO", {"observed": True, "protocol": "SSH", "port": 22}),
            ("DEV-WKS-02", "SRV-CI-02", "CONNECTED_TO", {"observed": True, "protocol": "HTTPS", "port": 443}),
            ("DEV-WKS-03", "SRV-DC-01", "CONNECTED_TO", {"observed": True, "protocol": "RDP", "port": 3389}),
            ("DEV-WKS-04", "SRV-CI-02", "CONNECTED_TO", {"observed": True, "protocol": "SSH", "port": 22}),

            ("SRV-CI-02", "SRV-PAY-API", "CONNECTED_TO", {"observed": True, "protocol": "HTTPS", "port": 9000}),
            ("SRV-CI-02", "SRV-WEB-01", "CONNECTED_TO", {"observed": True, "protocol": "SSH", "port": 22}),
            ("SRV-PAY-API", "SRV-KMS-01", "CONNECTED_TO", {"observed": True, "protocol": "TLS", "port": 8200}),

            ("SRV-PAY-API", "APP-BILLING-GATEWAY", "HOSTS", {"observed": True}),
            ("SRV-WEB-01", "APP-CRM-GROWTH", "HOSTS", {"observed": True}),
            ("SRV-DC-01", "APP-ERP-CORE", "HOSTS", {"observed": True}),

            ("APP-BILLING-GATEWAY", "DB-PAYMENTS-01", "DEPENDS_ON", {"observed": True}),
            ("APP-CRM-GROWTH", "DB-PROD-CUST-01", "DEPENDS_ON", {"observed": True}),
            ("APP-ERP-CORE", "DB-PROD-CUST-01", "DEPENDS_ON", {"observed": True}),

            ("USR-001", "PERM-AWS-PROD-FULL", "HAS_ACCESS_TO", {"observed": True}),
            ("USR-002", "PERM-MARKETING-READ", "HAS_ACCESS_TO", {"observed": True}),
            ("USR-002", "APP-CRM-GROWTH", "HAS_ACCESS_TO", {"observed": True}),
            ("USR-003", "PERM-DBA-ROOT", "HAS_ACCESS_TO", {"observed": True}),
            ("USR-003", "PERM-DOMAIN-ADMIN", "HAS_ACCESS_TO", {"observed": True}),
            ("USR-003", "DB-PAYMENTS-01", "HAS_ACCESS_TO", {"observed": True}),
            ("USR-003", "DB-PROD-CUST-01", "HAS_ACCESS_TO", {"observed": True}),
            ("USR-004", "APP-ERP-CORE", "HAS_ACCESS_TO", {"observed": True})
        ]

        for src, tgt, rel_type, props in relationships:
            rel_cypher = f"""
            MATCH (a {{id: $src}}), (b {{id: $tgt}})
            MERGE (a)-[r:{rel_type}]->(b)
            SET r += $props
            """
            db.query(rel_cypher, {"src": src, "tgt": tgt, "props": props})

        # Verify final counts
        final_nodes = db.query("MATCH (n) RETURN count(n) AS cnt")[0]["cnt"]
        final_rels = db.query("MATCH ()-[r]->() RETURN count(r) AS cnt")[0]["cnt"]
        logger.info(f"Graph '{target_graph}' seeded successfully: {final_nodes} nodes, {final_rels} relationships.")
        return True
    finally:
        # Restore original graph if different
        if original_graph != target_graph:
            db.select_graph(original_graph)
