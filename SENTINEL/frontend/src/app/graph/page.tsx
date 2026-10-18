'use client';

import React, { useEffect, useState } from 'react';
import {
  Network,
  RefreshCw,
  ShieldAlert,
  Database,
  Plus,
  Share2,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import GraphView from '../../components/GraphView';
import NodeDetailsDrawer from '../../components/NodeDetailsDrawer';
import CounterfactualModal from '../../components/CounterfactualModal';
import { api } from '../../lib/api';
import { GraphData, GraphNodeData, CounterfactualResult } from '../../types';

export default function SecurityGraphPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const [highlightPaths, setHighlightPaths] = useState<string[]>([]);
  const [isPathHighlightActive, setIsPathHighlightActive] = useState(false);
  const [severedNodeIds, setSeveredNodeIds] = useState<string[]>([]);
  const [counterfactualResult, setCounterfactualResult] = useState<CounterfactualResult | null>(null);
  const [isCounterfactualOpen, setIsCounterfactualOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FalkorDB Health & Graph Stats
  const [graphHealth, setGraphHealth] = useState<{
    connected: boolean;
    graph?: string;
    node_count?: number;
    relationship_count?: number;
    latency_ms?: number;
    host?: string;
    port?: number;
  } | null>(null);

  // Graph Insights (Task 3: Relationship-based insights)
  const [insights, setInsights] = useState<{
    top_hubs?: Array<{ node_id: string; label: string; degree: number }>;
    relationship_types?: Record<string, number>;
  } | null>(null);

  // Add Node Modal state (Task 3: Node creation)
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('Technology');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState('');
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadGraph = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [vData, healthData, insightsData] = await Promise.allSettled([
        api.getGraphVisualization(),
        api.getGraphHealth(),
        api.getGraphInsights()
      ]);

      if (vData.status === 'fulfilled') {
        setGraphData(vData.value);
      } else {
        // Fallback to overview
        const fallback = await api.getGraphOverview();
        setGraphData(fallback);
      }

      if (healthData.status === 'fulfilled') {
        setGraphHealth(healthData.value);
      }

      if (insightsData.status === 'fulfilled') {
        setInsights(insightsData.value);
      }
    } catch (err: any) {
      console.error('Error fetching graph overview:', err);
      setError(err?.message || 'Failed to connect to FalkorDB');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  // Handle adding a node to the graph
  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    try {
      setIsCreatingNode(true);
      await api.createNode(newNodeLabel, {
        id: newNodeName.trim(),
        name: newNodeName.trim(),
        type: newNodeType.trim() || undefined,
        created_at: new Date().toISOString()
      });
      setActionMessage(`Node "${newNodeName.trim()}" successfully created!`);
      setNewNodeName('');
      setNewNodeType('');
      setIsAddNodeOpen(false);
      // Reload graph to show the new node
      await loadGraph();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(`Error creating node: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsCreatingNode(false);
    }
  };

  // Toggle Attack Path Highlights
  const toggleAttackPathHighlight = async () => {
    if (isPathHighlightActive) {
      setHighlightPaths([]);
      setIsPathHighlightActive(false);
    } else {
      try {
        const startId = graphData.nodes[0]?.id || '194.26.29.112';
        const res = await api.getAttackPaths(startId);
        if (res.paths && res.paths.length > 0) {
          const nodeIds = new Set<string>();
          res.paths.forEach((p: any) => {
            p.nodes?.forEach((n: any) => nodeIds.add(n.id));
          });
          setHighlightPaths(Array.from(nodeIds));
        } else {
          setHighlightPaths(graphData.nodes.slice(0, 3).map((n) => n.id));
        }
        setIsPathHighlightActive(true);
      } catch {
        setHighlightPaths(graphData.nodes.slice(0, 3).map((n) => n.id));
        setIsPathHighlightActive(true);
      }
    }
  };

  // Run Counterfactual Simulation on a clicked node
  const handleRunCounterfactual = async (nodeId: string, nodeType: string) => {
    try {
      const actionType = nodeType === 'IPAddress' ? 'BLOCK_IP' : nodeType === 'User' ? 'DISABLE_ACCOUNT' : 'ISOLATE_DEVICE';
      const res = await api.runCounterfactual('194.26.29.112', actionType, nodeId, 'HIGH');
      setCounterfactualResult(res);
      setSeveredNodeIds([nodeId]);
      setIsCounterfactualOpen(true);
    } catch (err) {
      console.error('Counterfactual simulation failed:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D9769B] font-mono text-xs uppercase tracking-wider font-bold mb-1">
            <Network className="w-4 h-4 text-[#E88DAD]" />
            <span>FalkorDB Graph Grounded Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-[#29252A] tracking-tight">
            Security Knowledge Graph
          </h1>
          <p className="text-[#77717A] text-xs mt-0.5">
            Active FalkorDB Graph: <span className="font-mono font-bold text-[#D9769B]">{graphHealth?.graph || 'sentinel'}</span> &bull; Server: {graphHealth?.host || '127.0.0.1'}:{graphHealth?.port || 6379}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddNodeOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E88DAD] text-white hover:bg-[#D9769B] text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>

          <button
            onClick={toggleAttackPathHighlight}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-sm ${
              isPathHighlightActive
                ? 'bg-red-500 text-white shadow-[0_2px_12px_rgba(239,68,68,0.3)] border border-red-400'
                : 'bg-white border border-[#F5E1E9] text-[#29252A] hover:text-red-600 hover:border-red-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isPathHighlightActive ? 'Clear Highlight' : 'Trace Path'}</span>
          </button>

          <button
            onClick={loadGraph}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#F5E1E9] text-[#29252A] hover:text-[#D9769B] hover:border-[#FBCFE8] hover:bg-[#FFF9FC] text-xs font-mono font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#E88DAD]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadGraph}
            className="px-3 py-1 bg-white border border-red-200 rounded-lg font-bold text-red-700 hover:bg-red-100 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Graph Status & Metadata Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-white border border-[#F5E1E9] shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFF7FA] border border-[#F5E1E9] flex items-center justify-center text-[#E88DAD] shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#77717A] uppercase font-mono tracking-wider font-semibold">Graph Status</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${graphHealth?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs font-bold text-[#29252A]">
                {graphHealth?.connected ? 'ONLINE' : 'OFFLINE'}
              </span>
              {graphHealth?.latency_ms !== undefined && (
                <span className="text-[10px] font-mono text-[#77717A]">({graphHealth.latency_ms}ms)</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#F5E1E9] shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFF7FA] border border-[#F5E1E9] flex items-center justify-center text-[#E88DAD] shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#77717A] uppercase font-mono tracking-wider font-semibold">Total Nodes</p>
            <p className="text-sm font-bold text-[#29252A] mt-0.5">{graphData.nodes.length}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#F5E1E9] shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFF7FA] border border-[#F5E1E9] flex items-center justify-center text-[#E88DAD] shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#77717A] uppercase font-mono tracking-wider font-semibold">Relationships</p>
            <p className="text-sm font-bold text-[#29252A] mt-0.5">{graphData.edges.length}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#F5E1E9] shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFF7FA] border border-[#F5E1E9] flex items-center justify-center text-[#E88DAD] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 truncate">
            <p className="text-[10px] text-[#77717A] uppercase font-mono tracking-wider font-semibold">Top Hub</p>
            <p className="text-xs font-bold text-[#29252A] truncate mt-0.5">
              {insights?.top_hubs?.[0]?.node_id || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Flow Canvas */}
      <GraphView
        data={graphData}
        onSelectNode={setSelectedNode}
        highlightPathNodeIds={highlightPaths}
        severedNodeIds={severedNodeIds}
        isLoading={isLoading}
        onRefresh={loadGraph}
      />

      {/* Add Node Modal (Task 3: Node creation) */}
      {isAddNodeOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#F5E1E9] shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#F5E1E9] pb-3">
              <h3 className="font-bold text-sm text-[#29252A]">Add Node to FalkorDB Graph</h3>
              <button
                onClick={() => setIsAddNodeOpen(false)}
                className="text-xs text-[#77717A] hover:text-[#29252A]"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono font-medium text-[#77717A] mb-1">
                  Node Label
                </label>
                <select
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  className="w-full bg-[#FFF9FC] border border-[#F5E1E9] rounded-xl px-3 py-2 text-xs text-[#29252A] focus:outline-none focus:border-[#E88DAD]"
                >
                  <option value="Technology">Technology</option>
                  <option value="Developer">Developer</option>
                  <option value="Project">Project</option>
                  <option value="Server">Server</option>
                  <option value="Device">Device</option>
                  <option value="Database">Database</option>
                  <option value="User">User</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#77717A] mb-1">
                  Node Identifier / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js, API Gateway, Redis..."
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full bg-[#FFF9FC] border border-[#F5E1E9] rounded-xl px-3 py-2 text-xs text-[#29252A] focus:outline-none focus:border-[#E88DAD]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#77717A] mb-1">
                  Category / Property (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Graph Engine, Frontend Framework..."
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value)}
                  className="w-full bg-[#FFF9FC] border border-[#F5E1E9] rounded-xl px-3 py-2 text-xs text-[#29252A] focus:outline-none focus:border-[#E88DAD]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddNodeOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#F5E1E9] text-xs font-medium text-[#77717A] hover:bg-[#FFF7FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingNode}
                  className="px-4 py-2 rounded-xl bg-[#E88DAD] hover:bg-[#D9769B] text-white text-xs font-bold shadow-sm transition-colors"
                >
                  {isCreatingNode ? 'Creating...' : 'Create in FalkorDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node Detail Slide-over Drawer */}
      <NodeDetailsDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onRunCounterfactual={handleRunCounterfactual}
      />

      {/* Counterfactual Result Modal */}
      <CounterfactualModal
        isOpen={isCounterfactualOpen}
        onClose={() => setIsCounterfactualOpen(false)}
        result={counterfactualResult}
      />
    </div>
  );
}
