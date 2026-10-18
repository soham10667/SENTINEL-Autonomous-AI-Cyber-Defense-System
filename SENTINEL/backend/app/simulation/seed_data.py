import logging
from app.database.falkor import get_db_manager
from app.database.schema import clear_sentinel_graph, init_schema

logger = logging.getLogger("sentinel.seed_data")

def seed_enterprise_graph():
    """
    Seeds a rich, realistic, synthetic enterprise IT & cloud graph in FalkorDB.
    Strictly isolated inside the sentinel graph.
    """
    db = get_db_manager()
    if not db.is_connected():
        logger.error("Cannot seed database: FalkorDB is not connected.")
        return False

    logger.info("Seeding synthetic corporate IT infrastructure in 'sentinel' graph...")
    clear_sentinel_graph()

    # 1. Create Identities (Users)
    users_cypher = """
    CREATE 
      (u1:User {id: 'USR-001', username: 'alice.chen', email: 'alice.chen@sentinelcorp.internal', role: 'Cloud Architect', department: 'Infrastructure', status: 'ACTIVE', risk_score: 10.0, is_compromised: false}),
      (u2:User {id: 'USR-002', username: 'sarah.connor', email: 'sarah.connor@sentinelcorp.internal', role: 'Marketing Lead', department: 'Growth', status: 'ACTIVE', risk_score: 15.0, is_compromised: false}),
      (u3:User {id: 'USR-003', username: 'bob.martinez', email: 'bob.martinez@sentinelcorp.internal', role: 'Lead DBA', department: 'SecOps', status: 'ACTIVE', risk_score: 5.0, is_compromised: false}),
      (u4:User {id: 'USR-004', username: 'alex.rivera', email: 'alex.rivera@contractor.internal', role: 'DevOps Contractor', department: 'Engineering', status: 'ACTIVE', risk_score: 20.0, is_compromised: false})
    """
    db.query(users_cypher)

    # 2. Create Endpoints & Devices
    devices_cypher = """
    CREATE 
      (d1:Device {id: 'DEV-WKS-01', hostname: 'WKS-ALICE-MBP', ip: '10.0.1.50', os: 'macOS Sonoma', asset_type: 'WORKSTATION', status: 'HEALTHY', is_isolated: false, criticality: 'MEDIUM'}),
      (d2:Device {id: 'DEV-WKS-02', hostname: 'WKS-SARAH-WIN11', ip: '10.0.1.51', os: 'Windows 11 Enterprise', asset_type: 'WORKSTATION', status: 'HEALTHY', is_isolated: false, criticality: 'MEDIUM'}),
      (d3:Device {id: 'DEV-WKS-03', hostname: 'WKS-BOB-ARCH', ip: '10.0.1.52', os: 'Linux Fedora 40', asset_type: 'WORKSTATION', status: 'HEALTHY', is_isolated: false, criticality: 'HIGH'}),
      (d4:Device {id: 'DEV-WKS-04', hostname: 'WKS-ALEX-UBUNTU', ip: '10.0.1.53', os: 'Ubuntu 24.04 LTS', asset_type: 'WORKSTATION', status: 'HEALTHY', is_isolated: false, criticality: 'MEDIUM'})
    """
    db.query(devices_cypher)

    # 3. Create Network IP Addresses
    ips_cypher = """
    CREATE
      (ip_corp:IPAddress {id: 'IP-10-0-1-50', ip: '10.0.1.50', type: 'INTERNAL', reputation: 100, country: 'US', is_blocked: false}),
      (ip_dmz:IPAddress {id: 'IP-10-0-2-10', ip: '10.0.2.10', type: 'INTERNAL_DMZ', reputation: 95, country: 'US', is_blocked: false}),
      (ip_tor:IPAddress {id: '194.26.29.112', ip: '194.26.29.112', type: 'EXTERNAL_PROXY', reputation: 5, country: 'RU', is_blocked: false}),
      (ip_c2:IPAddress {id: '198.51.100.42', ip: '198.51.100.42', type: 'EXTERNAL_MALICIOUS', reputation: 2, country: 'CN', is_blocked: false})
    """
    db.query(ips_cypher)

    # 4. Create Servers & Infrastructure
    servers_cypher = """
    CREATE
      (s_dc:Server {id: 'SRV-DC-01', hostname: 'dc01.corp.sentinel.internal', ip: '10.0.0.5', role: 'Active Directory Domain Controller', environment: 'PRODUCTION', criticality: 'CRITICAL', os: 'Windows Server 2022', is_isolated: false}),
      (s_ci:Server {id: 'SRV-CI-02', hostname: 'build-ci02.infra.sentinel.internal', ip: '10.0.2.10', role: 'GitLab CI Runner & Bastion', environment: 'STAGING', criticality: 'HIGH', os: 'Ubuntu 22.04', is_isolated: false}),
      (s_pay:Server {id: 'SRV-PAY-API', hostname: 'pay-api.core.sentinel.internal', ip: '10.0.3.20', role: 'PCI-DSS Payment Gateway Engine', environment: 'PRODUCTION', criticality: 'CRITICAL', os: 'Alpine Linux Hardened', is_isolated: false}),
      (s_kms:Server {id: 'SRV-KMS-01', hostname: 'vault-kms01.sec.sentinel.internal', ip: '10.0.0.8', role: 'HashiCorp Vault / Cloud KMS', environment: 'PRODUCTION', criticality: 'CRITICAL', os: 'Linux Enterprise', is_isolated: false}),
      (s_web:Server {id: 'SRV-WEB-01', hostname: 'portal.sentinelcorp.com', ip: '10.0.4.15', role: 'Public Customer Portal Proxy', environment: 'PRODUCTION', criticality: 'MEDIUM', os: 'Nginx Enterprise', is_isolated: false})
    """
    db.query(servers_cypher)

    # 5. Create Databases (Crown Jewels)
    dbs_cypher = """
    CREATE
      (db_cust:Database {id: 'DB-PROD-CUST-01', name: 'Customer PII & Order History', db_type: 'PostgreSQL 16', contains_pii: true, contains_financial: false, criticality: 'CRITICAL', data_classification: 'RESTRICTED'}),
      (db_pay:Database {id: 'DB-PAYMENTS-01', name: 'PCI Tokenized Payment Cards', db_type: 'FalkorDB / Redis Cache', contains_pii: true, contains_financial: true, criticality: 'CRITICAL', data_classification: 'TOP_SECRET'}),
      (db_mkt:Database {id: 'DB-ANALYTICS-01', name: 'Marketing & Traffic Metrics', db_type: 'ClickHouse OLAP', contains_pii: false, contains_financial: false, criticality: 'LOW', data_classification: 'INTERNAL'})
    """
    db.query(dbs_cypher)

    # 6. Create Applications
    apps_cypher = """
    CREATE
      (app_erp:Application {id: 'APP-ERP-CORE', name: 'Sentinel ERP Master Suite', tier: 'BACKEND', service_type: 'MICROSERVICE', port: 8443, status: 'RUNNING', criticality: 'HIGH'}),
      (app_pay:Application {id: 'APP-BILLING-GATEWAY', name: 'Payment Processing Dispatcher', tier: 'CORE', service_type: 'API', port: 9000, status: 'RUNNING', criticality: 'CRITICAL'}),
      (app_crm:Application {id: 'APP-CRM-GROWTH', name: 'Customer Relations Management', tier: 'FRONTEND', service_type: 'WEB', port: 3000, status: 'RUNNING', criticality: 'MEDIUM'})
    """
    db.query(apps_cypher)

    # 7. Create Permissions
    perms_cypher = """
    CREATE
      (p_dom:Permission {id: 'PERM-DOMAIN-ADMIN', name: 'Active Directory Domain Admins', scope: 'GLOBAL', privilege_level: 'SUPERUSER', is_admin: true}),
      (p_dba:Permission {id: 'PERM-DBA-ROOT', name: 'Postgres & FalkorDB Superuser Access', scope: 'DATABASES', privilege_level: 'ADMIN', is_admin: true}),
      (p_aws:Permission {id: 'PERM-AWS-PROD-FULL', name: 'AWS Production AdministratorAccess', scope: 'CLOUD_INFRA', privilege_level: 'ADMIN', is_admin: true}),
      (p_mkt:Permission {id: 'PERM-MARKETING-READ', name: 'Marketing Read-Only Access', scope: 'ANALYTICS', privilege_level: 'USER', is_admin: false})
    """
    db.query(perms_cypher)

    # 8. Create Realistic Baseline Relationships
    relationships_cypher = """
    MATCH (u1:User {id: 'USR-001'}), (u2:User {id: 'USR-002'}), (u3:User {id: 'USR-003'}), (u4:User {id: 'USR-004'}),
          (d1:Device {id: 'DEV-WKS-01'}), (d2:Device {id: 'DEV-WKS-02'}), (d3:Device {id: 'DEV-WKS-03'}), (d4:Device {id: 'DEV-WKS-04'}),
          (s_dc:Server {id: 'SRV-DC-01'}), (s_ci:Server {id: 'SRV-CI-02'}), (s_pay:Server {id: 'SRV-PAY-API'}), (s_kms:Server {id: 'SRV-KMS-01'}), (s_web:Server {id: 'SRV-WEB-01'}),
          (db_cust:Database {id: 'DB-PROD-CUST-01'}), (db_pay:Database {id: 'DB-PAYMENTS-01'}), (db_mkt:Database {id: 'DB-ANALYTICS-01'}),
          (app_erp:Application {id: 'APP-ERP-CORE'}), (app_pay:Application {id: 'APP-BILLING-GATEWAY'}), (app_crm:Application {id: 'APP-CRM-GROWTH'}),
          (p_dom:Permission {id: 'PERM-DOMAIN-ADMIN'}), (p_dba:Permission {id: 'PERM-DBA-ROOT'}), (p_aws:Permission {id: 'PERM-AWS-PROD-FULL'}), (p_mkt:Permission {id: 'PERM-MARKETING-READ'})
    
    CREATE
      (u1)-[:LOGGED_IN_FROM {observed: true, session: 'sess-01'}]->(d1),
      (u2)-[:LOGGED_IN_FROM {observed: true, session: 'sess-02'}]->(d2),
      (u3)-[:LOGGED_IN_FROM {observed: true, session: 'sess-03'}]->(d3),
      (u4)-[:LOGGED_IN_FROM {observed: true, session: 'sess-04'}]->(d4),

      (d1)-[:CONNECTED_TO {observed: true, protocol: 'SSH', port: 22}]->(s_ci),
      (d2)-[:CONNECTED_TO {observed: true, protocol: 'HTTPS', port: 443}]->(s_ci),
      (d3)-[:CONNECTED_TO {observed: true, protocol: 'RDP', port: 3389}]->(s_dc),
      (d4)-[:CONNECTED_TO {observed: true, protocol: 'SSH', port: 22}]->(s_ci),

      (s_ci)-[:CONNECTED_TO {observed: true, protocol: 'HTTPS', port: 9000}]->(s_pay),
      (s_ci)-[:CONNECTED_TO {observed: true, protocol: 'SSH', port: 22}]->(s_web),
      (s_pay)-[:CONNECTED_TO {observed: true, protocol: 'TLS', port: 8200}]->(s_kms),

      (s_pay)-[:HOSTS {observed: true}]->(app_pay),
      (s_web)-[:HOSTS {observed: true}]->(app_crm),
      (s_dc)-[:HOSTS {observed: true}]->(app_erp),

      (app_pay)-[:DEPENDS_ON {observed: true}]->(db_pay),
      (app_crm)-[:DEPENDS_ON {observed: true}]->(db_cust),
      (app_erp)-[:DEPENDS_ON {observed: true}]->(db_cust),

      (u1)-[:HAS_ACCESS_TO {observed: true}]->(p_aws),
      (u2)-[:HAS_ACCESS_TO {observed: true}]->(p_mkt),
      (u2)-[:HAS_ACCESS_TO {observed: true}]->(app_crm),
      (u3)-[:HAS_ACCESS_TO {observed: true}]->(p_dba),
      (u3)-[:HAS_ACCESS_TO {observed: true}]->(p_dom),
      (u3)-[:HAS_ACCESS_TO {observed: true}]->(db_pay),
      (u3)-[:HAS_ACCESS_TO {observed: true}]->(db_cust),
      (u4)-[:HAS_ACCESS_TO {observed: true}]->(app_erp)
    """
    db.query(relationships_cypher)

    logger.info("Baseline synthetic enterprise topology seeded successfully.")
    return True
