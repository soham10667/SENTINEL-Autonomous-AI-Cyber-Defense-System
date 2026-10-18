from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from app.models.schemas import TraceStep, RiskBreakdown, CounterfactualResult, DefensiveAction

class InvestigationState(BaseModel):
    investigation_id: str
    incident_id: str
    event_id: str
    status: str = "IN_PROGRESS"
    current_step: int = 0
    
    # Context collected from graph
    source_entity_id: str = ""
    source_entity_type: str = ""
    event_data: Dict[str, Any] = Field(default_factory=dict)
    connected_assets: List[Dict[str, Any]] = Field(default_factory=list)
    attack_paths: List[Dict[str, Any]] = Field(default_factory=list)
    crown_jewels_at_risk: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Intelligence & Risk Assessment
    risk_assessment: Optional[RiskBreakdown] = None
    counterfactual: Optional[CounterfactualResult] = None
    
    # Action & Execution
    proposed_action: Optional[Dict[str, Any]] = None
    action_taken: Optional[DefensiveAction] = None
    verification_result: Optional[Dict[str, Any]] = None
    
    # Execution Trace & Report
    steps: List[TraceStep] = Field(default_factory=list)
    report_summary: str = ""
    is_rule_based: bool = True
    error: Optional[str] = None
    finished: bool = False
