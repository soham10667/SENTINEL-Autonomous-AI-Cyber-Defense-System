import {
  DashboardSummary,
  GraphData,
  Incident,
  SecurityEvent,
  DefensiveAction,
  CounterfactualResult,
  IncidentReport
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }
  return res.json();
}

export const api = {
  getHealth: () => fetchJson<{ status: string; database: any }>('/api/health'),
  getGraphHealth: () => fetchJson<{ connected: boolean; host: string; port: number; graph: string; node_count: number; relationship_count: number; latency_ms: number; error?: string }>('/api/graph/health'),
  reconnectGraph: () => fetchJson<{ status: string; database: any }>('/api/graph/reconnect', { method: 'POST' }),
  getDashboardSummary: () => fetchJson<DashboardSummary>('/api/dashboard/summary'),
  getGraphOverview: () => fetchJson<GraphData>('/api/graph/overview'),
  getGraphVisualization: () => fetchJson<GraphData>('/api/graph/visualization'),
  getGraphNodes: (params?: { label?: string; search?: string; limit?: number; skip?: number }) => {
    const q = new URLSearchParams();
    if (params?.label) q.set('label', params.label);
    if (params?.search) q.set('search', params.search);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.skip) q.set('skip', String(params.skip));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return fetchJson<any[]>(`/api/graph/nodes${qs}`);
  },
  getGraphNode: (nodeId: string) => fetchJson<any>(`/api/graph/nodes/${nodeId}`),
  createNode: (label: string, properties: Record<string, any>) =>
    fetchJson<{ status: string; node: any }>('/api/graph/nodes', {
      method: 'POST',
      body: JSON.stringify({ label, properties })
    }),
  getGraphRelationships: (params?: { type?: string; source_id?: string; target_id?: string; limit?: number; skip?: number }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.source_id) q.set('source_id', params.source_id);
    if (params?.target_id) q.set('target_id', params.target_id);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.skip) q.set('skip', String(params.skip));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return fetchJson<any[]>(`/api/graph/relationships${qs}`);
  },
  createRelationship: (sourceId: string, targetId: string, type: string, properties?: Record<string, any>) =>
    fetchJson<{ status: string; relationship: any }>('/api/graph/relationships', {
      method: 'POST',
      body: JSON.stringify({ source_id: sourceId, target_id: targetId, type, properties })
    }),
  getGraphInsights: () => fetchJson<{ status: string; graph_name: string; total_nodes: number; total_relationships: number; latency_ms: number; top_hubs: any[]; isolated_nodes_count: number; label_distribution: Record<string, number>; relationship_types: Record<string, number> }>('/api/graph/insights'),
  getGraphTraversal: (startId: string, depth = 2, direction = 'BOTH') =>
    fetchJson<any[]>(`/api/graph/traversal?start_id=${encodeURIComponent(startId)}&depth=${depth}&direction=${direction}`),
  searchGraph: (q: string, limit = 30) =>
    fetchJson<{ query: string; count: number; nodes: any[] }>(`/api/graph/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  getNeighborhood: (nodeId: string, depth = 1) => fetchJson<GraphData>(`/api/graph/neighborhood/${nodeId}?depth=${depth}`),
  getAttackPaths: (sourceId: string) => fetchJson<{ source_id: string; count: number; paths: any[] }>(`/api/graph/attack-paths/${sourceId}`),
  
  getEvents: () => fetchJson<SecurityEvent[]>('/api/events'),
  getIncidents: () => fetchJson<Incident[]>('/api/incidents'),
  getIncident: (id: string) => fetchJson<Incident>(`/api/incidents/${id}`),
  
  startInvestigation: (incidentId: string, eventId: string) =>
    fetchJson<{
      investigation_id: string;
      status: string;
      summary: string;
      risk_score: number;
      action_taken: string | null;
      is_rule_based: boolean;
    }>('/api/investigations/start', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, event_id: eventId })
    }),
    
  getInvestigationTrace: (id: string) => fetchJson<any>(`/api/investigations/${id}/trace`),
  
  runCounterfactual: (sourceId: string, actionType: string, targetId: string, severity = 'HIGH') =>
    fetchJson<CounterfactualResult>('/api/investigations/counterfactual', {
      method: 'POST',
      body: JSON.stringify({
        source_id: sourceId,
        action_type: actionType,
        target_id: targetId,
        severity
      })
    }),
    
  getActions: () => fetchJson<DefensiveAction[]>('/api/actions'),
  rollbackAction: (actionId: string) =>
    fetchJson<{ status: string; message: string }>(`/api/actions/${actionId}/rollback`, {
      method: 'POST'
    }),
    
  getReport: (incidentId: string) => fetchJson<IncidentReport>(`/api/reports/${incidentId}`),
  
  startSimulation: (scenario: string = 'A') =>
    fetchJson<any>('/api/simulation/start', {
      method: 'POST',
      body: JSON.stringify({ scenario })
    }),
    
  resetSimulation: () =>
    fetchJson<any>('/api/simulation/reset', {
      method: 'POST'
    })
};
