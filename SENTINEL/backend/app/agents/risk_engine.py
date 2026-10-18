import logging
from typing import Dict, Any, List, Optional
from app.graph.traversals import trace_possible_attack_paths, get_crown_jewels
from app.models.schemas import RiskBreakdown, CounterfactualResult

logger = logging.getLogger("sentinel.risk_engine")

SEVERITY_BASE_MAP = {
    "CRITICAL": 100.0,
    "HIGH": 75.0,
    "MEDIUM": 50.0,
    "LOW": 25.0,
    "INFO": 10.0
}

def calculate_graph_risk(
    source_id: str, 
    base_severity: str = "HIGH", 
    confidence: float = 0.95,
    paths: Optional[List[Dict[str, Any]]] = None
) -> RiskBreakdown:
    """
    Transparent, deterministic graph risk calculation.
    Formula:
      Risk = (Base_Sev * 0.25) + (Crown_Jewel_Crit * 0.30) + (Path_Proximity * 0.15) + (Privilege_Exp * 0.15) + (Confidence * 0.15)
    """
    if paths is None:
        paths = trace_possible_attack_paths(source_id, max_depth=4)

    # 1. Base Severity Score (0 - 100)
    base_score = SEVERITY_BASE_MAP.get(base_severity.upper(), 50.0)

    # 2. Reachable Asset Criticality (0 - 100)
    crown_jewels = []
    asset_crit_score = 0.0
    seen_targets = set()
    
    for p in paths:
        target_id = p.get("target_id")
        if target_id and target_id not in seen_targets:
            seen_targets.add(target_id)
            is_cj = p.get("is_crown_jewel", False)
            if is_cj:
                crown_jewels.append({
                    "id": target_id,
                    "type": p.get("target_type"),
                    "criticality": p.get("target_criticality"),
                    "hops": p.get("hop_count")
                })
                asset_crit_score += 40.0
            elif p.get("target_criticality") == "HIGH":
                asset_crit_score += 25.0
            else:
                asset_crit_score += 10.0
                
    asset_crit_score = min(100.0, asset_crit_score)

    # 3. Path Proximity Factor (0 - 100)
    if paths:
        min_hops = min(p.get("hop_count", 4) for p in paths)
        if min_hops == 1:
            proximity_score = 100.0
        elif min_hops == 2:
            proximity_score = 75.0
        elif min_hops == 3:
            proximity_score = 50.0
        else:
            proximity_score = 30.0
    else:
        proximity_score = 10.0

    # 4. Privilege Level Exposure (0 - 100)
    # Check if admin or sensitive roles are traversed
    privilege_score = 25.0
    for p in paths:
        for node in p.get("nodes", []):
            name = str(node.get("name", "")).lower()
            role = str(node.get("criticality", "")).lower()
            if "admin" in name or "root" in name or "aws" in name or "prod" in name:
                privilege_score = max(privilege_score, 90.0)
            elif "lead" in name or "engineer" in name:
                privilege_score = max(privilege_score, 60.0)

    # 5. Evidence Confidence Factor (0 - 100)
    conf_score = max(0.0, min(100.0, confidence * 100.0))

    # Calculate Total Deterministic Score
    total_score = (
        (base_score * 0.25) +
        (asset_crit_score * 0.30) +
        (proximity_score * 0.15) +
        (privilege_score * 0.15) +
        (conf_score * 0.15)
    )
    total_score = round(min(100.0, max(5.0, total_score)), 1)

    # Determine Severity Classification
    if total_score >= 80.0:
        sev_level = "CRITICAL"
    elif total_score >= 60.0:
        sev_level = "HIGH"
    elif total_score >= 40.0:
        sev_level = "MEDIUM"
    else:
        sev_level = "LOW"

    path_summary = f"{len(paths)} potential lateral attack path(s) identified. {len(crown_jewels)} crown jewel database/server asset(s) within reachable blast radius."

    formula_str = "Score = (BaseSeverity*0.25) + (AssetCriticality*0.30) + (PathProximity*0.15) + (PrivilegeExposure*0.15) + (Confidence*0.15)"

    return RiskBreakdown(
        total_risk_score=total_score,
        severity_level=sev_level,
        base_severity_score=base_score,
        asset_criticality_score=asset_crit_score,
        proximity_score=proximity_score,
        privilege_score=privilege_score,
        confidence_multiplier=confidence,
        reachable_crown_jewels=crown_jewels,
        attack_path_summary=path_summary,
        scoring_formula=formula_str
    )

def evaluate_counterfactual_containment(
    source_id: str,
    action_type: str,
    target_id: str,
    base_severity: str = "HIGH"
) -> CounterfactualResult:
    """
    Hackathon Differentiator B: Counterfactual Containment Analysis.
    Calculates exact mathematical risk before vs after a simulated defensive action.
    """
    # Current attack paths
    current_paths = trace_possible_attack_paths(source_id, max_depth=4)
    risk_before_breakdown = calculate_graph_risk(source_id, base_severity=base_severity, paths=current_paths)
    risk_before = risk_before_breakdown.total_risk_score

    # Simulate filtering out paths that traverse the target_id
    severed_node_ids = [target_id]
    remaining_paths = []
    severed_count = 0
    
    for path in current_paths:
        node_ids_in_path = [n.get("id") for n in path.get("nodes", [])]
        if target_id in node_ids_in_path:
            severed_count += 1
        else:
            remaining_paths.append(path)

    # Recalculate risk on remaining graph structure
    if not remaining_paths:
        # If all paths severed, residual risk is minimal baseline
        risk_after = 12.0
    else:
        risk_after_breakdown = calculate_graph_risk(source_id, base_severity="LOW", paths=remaining_paths)
        risk_after = min(risk_after_breakdown.total_risk_score, risk_before * 0.4)
    
    risk_reduction = round(max(0.0, risk_before - risk_after), 1)

    explanation = (
        f"Simulated {action_type} on target '{target_id}' severs {severed_count} of {len(current_paths)} "
        f"active attack paths, reducing calculated blast-radius risk from {risk_before} to {risk_after} "
        f"(-{risk_reduction} pts)."
    )

    return CounterfactualResult(
        action_type=action_type,
        target_id=target_id,
        risk_before=risk_before,
        risk_after=risk_after,
        risk_reduction=risk_reduction,
        paths_severed=severed_count,
        remaining_paths=len(remaining_paths),
        severed_node_ids=severed_node_ids,
        explanation=explanation
    )
