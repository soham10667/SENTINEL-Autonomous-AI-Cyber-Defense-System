import pytest
from app.agents.risk_engine import calculate_graph_risk, evaluate_counterfactual_containment

def test_risk_calculation_formula():
    """Verify deterministic mathematical scoring under various input conditions."""
    # Test high risk scenario
    mock_paths = [
        {
            "hop_count": 2,
            "target_id": "DB-PROD-CUST-01",
            "target_type": "Database",
            "target_criticality": "CRITICAL",
            "is_crown_jewel": True,
            "nodes": [
                {"id": "USR-002", "name": "sarah.connor", "criticality": "MEDIUM"},
                {"id": "DEV-WKS-02", "name": "WKS-SARAH-WIN11", "criticality": "MEDIUM"},
                {"id": "DB-PROD-CUST-01", "name": "Customer PII", "criticality": "CRITICAL"}
            ]
        }
    ]
    risk = calculate_graph_risk("USR-002", base_severity="HIGH", confidence=0.95, paths=mock_paths)
    
    assert 60.0 <= risk.total_risk_score <= 100.0
    assert risk.severity_level in ["HIGH", "CRITICAL"]
    assert risk.base_severity_score == 75.0
    assert len(risk.reachable_crown_jewels) == 1
    assert "Score = " in risk.scoring_formula

def test_low_risk_scenario():
    """Verify low risk calculation when no crown jewels are reachable."""
    mock_paths = [
        {
            "hop_count": 4,
            "target_id": "SRV-WEB-01",
            "target_type": "Server",
            "target_criticality": "MEDIUM",
            "is_crown_jewel": False,
            "nodes": [
                {"id": "DEV-WKS-01", "name": "WKS-ALICE", "criticality": "MEDIUM"},
                {"id": "SRV-WEB-01", "name": "Web Proxy", "criticality": "MEDIUM"}
            ]
        }
    ]
    risk = calculate_graph_risk("DEV-WKS-01", base_severity="LOW", confidence=0.8, paths=mock_paths)
    assert risk.total_risk_score < 60.0
    assert len(risk.reachable_crown_jewels) == 0

def test_counterfactual_analysis_logic():
    """Verify counterfactual delta computation severing attack paths."""
    cf = evaluate_counterfactual_containment("194.26.29.112", "BLOCK_IP", "194.26.29.112", base_severity="HIGH")
    assert cf.risk_before >= cf.risk_after
    assert cf.risk_reduction >= 0.0
    assert "Simulated BLOCK_IP" in cf.explanation
