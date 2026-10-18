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
  const token = typeof window !== 'undefined' ? localStorage.getItem('sentinel_token') : null;
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options?.headers || {})
    }
  });
  if (!res.ok) {
    const errorText = await res.text();
    let parsedMessage = errorText;
    try {
      const errObj = JSON.parse(errorText);
      parsedMessage = errObj.detail || errObj.message || errorText;
    } catch {}
    throw new Error(parsedMessage);
  }
  return res.json();
}

export function getStoredAuth(): { token: string | null; user: any | null } {
  if (typeof window === 'undefined') return { token: null, user: null };
  const token = localStorage.getItem('sentinel_token');
  const userJson = localStorage.getItem('sentinel_user');
  let user = null;
  if (userJson) {
    try { user = JSON.parse(userJson); } catch {}
  }
  return { token, user };
}

export function setStoredAuth(token: string, user: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sentinel_token', token);
  localStorage.setItem('sentinel_user', JSON.stringify(user));
  localStorage.removeItem('sentinel_is_demo');
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sentinel_token');
  localStorage.removeItem('sentinel_user');
  localStorage.removeItem('sentinel_is_demo');
}

export const api = {
  login: (email: string, password: string, remember_me = false) =>
    fetchJson<{ access_token: string; token_type: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember_me })
    }),
  register: (fullName: string, email: string, password: string, clearanceLevel = 'operator') =>
    fetchJson<{ access_token: string; token_type: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password, clearance_level: clearanceLevel })
    }),
  getMe: () => fetchJson<{ status: string; user: any }>('/api/auth/me'),
  getHealth: () => fetchJson<{ status: string; database: any }>('/api/health'),
  getGraphHealth: () => fetchJson<{
    connected: boolean;
    host: string;
    port: number;
    graph: string;
    node_count: number;
    relationship_count: number;
    latency_ms: number;
    available_graphs?: Array<{ name: string; node_count: number; relationship_count: number; is_active: boolean }>;
    error?: string;
  }>('/api/graph/health'),
  getGraphList: () => fetchJson<{
    active_graph: string;
    graphs: Array<{ name: string; node_count: number; relationship_count: number; is_active: boolean }>;
  }>('/api/graph/list'),
  switchGraph: (graphName: string) => fetchJson<{
    status: string;
    active_graph: string;
    database: any;
  }>('/api/graph/switch', {
    method: 'POST',
    body: JSON.stringify({ graph_name: graphName })
  }),
  seedGraph: (options?: { force_reset?: boolean; target_graph?: string }) => fetchJson<{
    status: string;
    graph: string;
    database: any;
  }>('/api/graph/seed', {
    method: 'POST',
    body: JSON.stringify(options || {})
  }),
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
  createNode: (param1: string | Record<string, any>, param2?: Record<string, any>) => {
    let label = 'Entity';
    let properties: Record<string, any> = {};
    if (typeof param1 === 'string') {
      label = param1;
      properties = param2 || {};
    } else if (param1 && typeof param1 === 'object') {
      label = param1.label || 'Entity';
      const { label: _l, ...rest } = param1;
      properties = rest;
    }
    return fetchJson<{ status: string; node: any }>('/api/graph/nodes', {
      method: 'POST',
      body: JSON.stringify({ label, properties })
    });
  },
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
