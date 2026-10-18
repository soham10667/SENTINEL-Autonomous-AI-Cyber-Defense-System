export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface GraphNodeData {
  id: string;
  label: string;
  properties: Record<string, any>;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: Severity;
  timestamp: string;
  description: string;
  raw_source: string;
  confidence: number;
  observed: boolean;
  source_entity_id?: string;
  target_entity_id?: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: string;
  created_at: string;
  root_cause: string;
  risk_score: number;
  source_event_id?: string;
  affected_assets: string[];
}

export interface TraceStep {
  step_num: number;
  phase: string;
  tool_name: string;
  tool_input: Record<string, any>;
  tool_output: Record<string, any>;
  rationale: string;
  timestamp: string;
  evidence_node_ids: string[];
}

export interface DefensiveAction {
  id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  status: string;
  reason: string;
  approval_status: string;
  executed_at?: string;
  verified: boolean;
  rollback_available: boolean;
  delta_risk?: number;
}

export interface RiskBreakdown {
  total_risk_score: number;
  severity_level: Severity;
  base_severity_score: number;
  asset_criticality_score: number;
  proximity_score: number;
  privilege_score: number;
  confidence_multiplier: number;
  reachable_crown_jewels: Array<{
    id: string;
    type: string;
    criticality: string;
    hops: number;
  }>;
  attack_path_summary: string;
  scoring_formula: string;
}

export interface CounterfactualResult {
  action_type: string;
  target_id: string;
  risk_before: number;
  risk_after: number;
  risk_reduction: number;
  paths_severed: number;
  remaining_paths: number;
  severed_node_ids: string[];
  explanation: string;
}

export interface DashboardSummary {
  total_assets: number;
  active_incidents: number;
  critical_alerts: number;
  suspicious_identities: number;
  compromised_devices: number;
  risk_distribution: Record<string, number>;
  investigations_in_progress: number;
  containment_actions_count: number;
  recent_events: SecurityEvent[];
}

export interface IncidentReport {
  incident_id: string;
  title: string;
  detection_time: string;
  severity: string;
  observed_events: any[];
  involved_identities: any[];
  involved_infrastructure: any[];
  attack_chain_hypotheses: any[];
  evidence_paths: string[][];
  actions_selected: string[];
  actions_executed: string[];
  verification_status: string;
  limitations: string;
  recommendations: string[];
}
