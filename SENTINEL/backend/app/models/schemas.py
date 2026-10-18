from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class GraphNode(BaseModel):
    id: str
    label: str
    properties: Dict[str, Any] = Field(default_factory=dict)

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str
    properties: Dict[str, Any] = Field(default_factory=dict)

class GraphData(BaseModel):
    nodes: List[GraphNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)

class SecurityEvent(BaseModel):
    id: str
    event_type: str
    severity: str
    timestamp: str
    description: str
    raw_source: str
    confidence: float = 1.0
    observed: bool = True
    source_entity_id: Optional[str] = None
    target_entity_id: Optional[str] = None

class Incident(BaseModel):
    id: str
    title: str
    severity: str
    status: str
    created_at: str
    root_cause: str = ""
    risk_score: float = 0.0
    source_event_id: Optional[str] = None
    affected_assets: List[str] = Field(default_factory=list)

class TraceStep(BaseModel):
    step_num: int
    phase: str
    tool_name: str
    tool_input: Dict[str, Any] = Field(default_factory=dict)
    tool_output: Dict[str, Any] = Field(default_factory=dict)
    rationale: str
    timestamp: str
    evidence_node_ids: List[str] = Field(default_factory=list)

class DefensiveAction(BaseModel):
    id: str
    action_type: str
    target_type: str
    target_id: str
    status: str
    reason: str
    approval_status: str
    executed_at: Optional[str] = None
    verified: bool = False
    rollback_available: bool = True
    delta_risk: Optional[float] = None
    previous_state: Dict[str, Any] = Field(default_factory=dict)

class RiskBreakdown(BaseModel):
    total_risk_score: float
    severity_level: str
    base_severity_score: float
    asset_criticality_score: float
    proximity_score: float
    privilege_score: float
    confidence_multiplier: float
    reachable_crown_jewels: List[Dict[str, Any]] = Field(default_factory=list)
    attack_path_summary: str
    scoring_formula: str

class CounterfactualResult(BaseModel):
    action_type: str
    target_id: str
    risk_before: float
    risk_after: float
    risk_reduction: float
    paths_severed: int
    remaining_paths: int
    severed_node_ids: List[str] = Field(default_factory=list)
    explanation: str

class InvestigationRecord(BaseModel):
    id: str
    incident_id: str
    status: str
    started_at: str
    completed_at: Optional[str] = None
    summary: str
    risk_score: float
    steps: List[TraceStep] = Field(default_factory=list)
    counterfactual: Optional[CounterfactualResult] = None
    actions: List[DefensiveAction] = Field(default_factory=list)

class IncidentReport(BaseModel):
    incident_id: str
    title: str
    detection_time: str
    severity: str
    observed_events: List[Dict[str, Any]]
    involved_identities: List[Dict[str, Any]]
    involved_infrastructure: List[Dict[str, Any]]
    attack_chain_hypotheses: List[Dict[str, Any]]
    evidence_paths: List[List[str]]
    actions_selected: List[str]
    actions_executed: List[str]
    verification_status: str
    limitations: str
    recommendations: List[str]

class DashboardSummary(BaseModel):
    total_assets: int
    active_incidents: int
    critical_alerts: int
    suspicious_identities: int
    compromised_devices: int
    risk_distribution: Dict[str, int]
    investigations_in_progress: int
    containment_actions_count: int
    recent_events: List[SecurityEvent] = Field(default_factory=list)
