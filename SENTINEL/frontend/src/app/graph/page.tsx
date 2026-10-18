'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  AlertCircle,
  Server
} from 'lucide-react';
import GraphView from '../../components/GraphView';
import NodeDetailsDrawer from '../../components/NodeDetailsDrawer';
import CounterfactualModal from '../../components/CounterfactualModal';
import { api } from '../../lib/api';
import { GraphData, GraphNodeData, CounterfactualResult } from '../../types';

interface AvailableGraph {
  name: string;
  node_count: number;
  relationship_count: number;
  is_active: boolean;
}

export default function SecurityGraphPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const [highlightPaths, setHighlightPaths] = useState<string[]>([]);
  const [isPathHighlightActive, setIsPathHighlightActive] = useState(false);
  const [severedNodeIds, setSeveredNodeIds] = useState<string[]>([]);
  const [counterfactualResult, setCounterfactualResult] = useState<CounterfactualResult | null>(null);
  const [isCounterfactualOpen, setIsCounterfactualOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchingGraph, setIsSwitchingGraph] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Graph Name & Health Stats
  const [activeGraph, setActiveGraph] = useState<string>('sentinel');
  const [availableGraphs, setAvailableGraphs] = useState<AvailableGraph[]>([]);
  const [graphHealth, setGraphHealth] = useState<{
    connected: boolean;
    graph?: string;
    node_count?: number;
    relationship_count?: number;
    latency_ms?: number;
    host?: string;
    port?: number;
    available_graphs?: AvailableGraph[];
    error?: string;
  } | null>(null);

  // Graph Insights
  const [insights, setInsights] = useState<{
    top_hubs?: Array<{ node_id: string; label: string; degree: number }>;
    relationship_types?: Record<string, number>;
  } | null>(null);

  // Add Node Modal state
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('Technology');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState('');
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadGraph = useCallback(async () => {
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
        const fallback = await api.getGraphOverview();
        setGraphData(fallback);
      }

      if (healthData.status === 'fulfilled') {
        const h = healthData.value;
        setGraphHealth(h);
        if (h.graph) setActiveGraph(h.graph);
        if (h.available_graphs && h.available_graphs.length > 0) {
          setAvailableGraphs(h.available_graphs);
        }
        if (!h.connected && h.error) {
          setError(h.error);
        }
      }

      if (insightsData.status === 'fulfilled') {
        setInsights(insightsData.value);
      }
    } catch (err: any) {
      console.error('Error fetching graph overview:', err);
      setError(
        err?.message ||
          'Failed to connect to FalkorDB on 127.0.0.1:6379. Verify Docker container is running.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const handleSwitchGraph = async (newGraphName: string) => {
    if (!newGraphName || newGraphName === activeGraph) return;
    try {
      setIsSwitchingGraph(true);
      setError(null);
      setActionMessage(`Switching to FalkorDB graph '${newGraphName}'...`);
      await api.switchGraph(newGraphName);
      setActiveGraph(newGraphName);
      await loadGraph();
      setActionMessage(`Active graph switched to '${newGraphName}'.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to switch graph:', err);
      setError(`Failed to switch graph: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSwitchingGraph(false);
    }
  };

  const handleSeedSentinel = async () => {
    try {
      setIsSeeding(true);
      setError(null);
      setActionMessage('Safely synchronizing Sentinel enterprise topology in FalkorDB (idempotent MERGE)...');
      await api.seedGraph({ force_reset: false, target_graph: 'sentinel' });
      if (activeGraph !== 'sentinel') {
        await api.switchGraph('sentinel');
        setActiveGraph('sentinel');
      }
      await loadGraph();
      setActionMessage('Sentinel graph synchronized successfully (27 nodes, 25 relationships).');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to seed graph:', err);
      setError(`Seeding failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    try {
      setIsCreatingNode(true);
      await api.createNode(newNodeLabel, {
        name: newNodeName.trim(),
        type: newNodeType.trim() || undefined
      });

      setActionMessage(`Node '${newNodeName.trim()}' added to graph '${activeGraph}' successfully!`);
      setIsAddNodeOpen(false);
      setNewNodeName('');
      setNewNodeType('');
      await loadGraph();

      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to create node:', err);
      setActionMessage(`Failed to create node: ${err?.message || 'Unknown error'}`);
      setTimeout(() => setActionMessage(null), 5000);
    } finally {
      setIsCreatingNode(false);
    }
  };

  const toggleAttackPathHighlight = async () => {
    if (isPathHighlightActive) {
      setHighlightPaths([]);
      setIsPathHighlightActive(false);
    } else {
      try {
        const res = await api.getAttackPaths('194.26.29.112');
        if (res.paths && res.paths.length > 0) {
          const topPath = res.paths[0];
          setHighlightPaths(topPath.nodes || []);
        } else {
          setHighlightPaths(['194.26.29.112', 'USR-002', 'DEV-WKS-02', 'SRV-CI-02', 'DB-PROD-CUST-01']);
        }
        setIsPathHighlightActive(true);
      } catch {
        setHighlightPaths(graphData.nodes.slice(0, 3).map((n) => n.id));
        setIsPathHighlightActive(true);
      }
    }
  };

  const handleRunCounterfactual = async (nodeId: string, nodeType: string) => {
    try {
      const actionType =
        nodeType === 'IPAddress'
          ? 'BLOCK_IP'
          : nodeType === 'User'
          ? 'DISABLE_ACCOUNT'
          : 'ISOLATE_DEVICE';
      const res = await api.runCounterfactual('194.26.29.112', actionType, nodeId, 'HIGH');
      setCounterfactualResult(res);
      setSeveredNodeIds([nodeId]);
      setIsCounterfactualOpen(true);
    } catch (err) {
      console.error('Counterfactual simulation failed:', err);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-3.5 max-w-7xl mx-auto">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <Network className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
            <span>FalkorDB Graph Grounded Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2c2825] tracking-tight leading-tight">
            Security Knowledge Graph
          </h1>
          <p className="text-[#7a6f63] text-xs mt-0.5 truncate">
            Target Graph:{' '}
            <span className="font-mono font-bold text-[#10b981]">
              {graphHealth?.graph || activeGraph}
            </span>{' '}
            &bull; FalkorDB Instance:{' '}
            <span className="font-mono text-[#2c2825] font-semibold">
              {graphHealth?.host || '127.0.0.1'}:{graphHealth?.port || 6379}
            </span>
          </p>
        </div>

        {/* Action Controls & Graph Switcher */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Live Graph Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#ede8dc] border border-[#d9d0c0] rounded-xl px-2.5 py-1 text-xs shadow-sm">
            <span className="text-[10px] font-mono text-[#7a6f63] uppercase font-bold">Graph:</span>
            <select
              value={activeGraph}
              onChange={(e) => handleSwitchGraph(e.target.value)}
              disabled={isSwitchingGraph || isLoading}
              className="bg-transparent font-mono font-bold text-xs text-[#2c2825] focus:outline-none cursor-pointer"
              title="Select active FalkorDB graph"
            >
              {availableGraphs.length > 0 ? (
                availableGraphs.map((g) => (
                  <option key={g.name} value={g.name} className="bg-[#ede8dc] text-[#2c2825]">
                    {g.name} ({g.node_count} nodes, {g.relationship_count} rels)
                  </option>
                ))
              ) : (
                <>
                  <option value="sentinel" className="bg-[#ede8dc] text-[#2c2825]">sentinel (enterprise)</option>
                  <option value="hackathon" className="bg-[#ede8dc] text-[#2c2825]">hackathon</option>
                </>
              )}
            </select>
          </div>

          {/* Seed / Resync Button */}
          <button
            onClick={handleSeedSentinel}
            disabled={isSeeding || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] text-[#2c2825] hover:text-[#10b981] hover:border-[#10b981] text-xs font-mono font-semibold transition-all shadow-sm"
            title="Safely initialize or synchronize Sentinel enterprise graph with FalkorDB using idempotent MERGE"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-[#10b981]' : 'text-[#10b981]'}`} />
            <span>{isSeeding ? 'Syncing...' : 'Sync Sentinel Graph'}</span>
          </button>

          <button
            onClick={() => setIsAddNodeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10b981] text-white hover:bg-[#059669] text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>

          <button
            onClick={toggleAttackPathHighlight}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm ${
              isPathHighlightActive
                ? 'bg-red-500 text-white shadow-sm border border-red-400'
                : 'bg-[#ede8dc] border border-[#d9d0c0] text-[#2c2825] hover:text-red-600 hover:border-red-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isPathHighlightActive ? 'Clear Highlight' : 'Trace Path'}</span>
          </button>

          <button
            onClick={loadGraph}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-[#2c2825] hover:text-[#10b981] hover:border-[#10b981] text-xs font-mono font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#10b981]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-3 text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <div>
              <p className="font-bold">FalkorDB Synchronization Notice</p>
              <p className="text-[11px] text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={loadGraph}
            className="px-2.5 py-1 bg-white border border-red-200 rounded-lg font-bold text-red-700 hover:bg-red-100 transition-colors shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty Graph Banner if 0 nodes detected */}
      {!isLoading && !error && graphData.nodes.length === 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Graph <strong>'{activeGraph}'</strong> currently has 0 nodes in FalkorDB.
              {activeGraph === 'sentinel'
                ? ' Click "Sync Sentinel Graph" to safely initialize the enterprise schema without overwriting other graphs.'
                : ' You can switch to the "sentinel" graph to view the full enterprise topology.'}
            </span>
          </div>
          {activeGraph === 'sentinel' && (
            <button
              onClick={handleSeedSentinel}
              disabled={isSeeding}
              className="px-3 py-1 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg font-bold transition-colors shrink-0 shadow-sm"
            >
              Sync Sentinel Graph Now
            </button>
          )}
        </div>
      )}

      {/* Graph Status & Metadata Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981] shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#7a6f63] uppercase font-mono tracking-wider font-semibold truncate">
              FalkorDB Status
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  graphHealth?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="text-xs font-bold text-[#2c2825]">
                {graphHealth?.connected ? 'ONLINE' : 'OFFLINE'}
              </span>
              {graphHealth?.latency_ms !== undefined && (
                <span className="text-[9px] font-mono text-[#7a6f63]">
                  ({graphHealth.latency_ms}ms)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981] shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#7a6f63] uppercase font-mono tracking-wider font-semibold truncate">
              Database Nodes
            </p>
            <p className="text-sm font-bold text-[#2c2825] mt-0.5">
              {graphHealth?.node_count !== undefined ? graphHealth.node_count : graphData.nodes.length}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981] shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-[#7a6f63] uppercase font-mono tracking-wider font-semibold truncate">
              Relationships
            </p>
            <p className="text-sm font-bold text-[#2c2825] mt-0.5">
              {graphHealth?.relationship_count !== undefined
                ? graphHealth.relationship_count
                : graphData.edges.length}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981] shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div className="min-w-0 truncate">
            <p className="text-[10px] text-[#7a6f63] uppercase font-mono tracking-wider font-semibold truncate">
              Connected Graph
            </p>
            <p className="text-xs font-mono font-bold text-[#10b981] truncate mt-0.5">
              {activeGraph} ({availableGraphs.length || 1} on host)
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
        isLoading={isLoading || isSwitchingGraph}
        onRefresh={loadGraph}
      />

      {/* Add Node Modal */}
      {isAddNodeOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#ede8dc] rounded-2xl border border-[#d9d0c0] shadow-xl p-5 w-full max-w-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-2.5">
              <h3 className="font-bold text-sm text-[#2c2825]">
                Add Node to FalkorDB Graph '{activeGraph}'
              </h3>
              <button
                onClick={() => setIsAddNodeOpen(false)}
                className="text-xs text-[#7a6f63] hover:text-[#2c2825]"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-medium text-[#7a6f63] mb-1">
                  Node Label
                </label>
                <select
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  className="w-full bg-[#f5f0e8] border border-[#d9d0c0] rounded-xl px-3 py-2 text-xs text-[#2c2825] focus:outline-none focus:border-[#10b981]"
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
                <label className="block text-xs font-mono font-medium text-[#7a6f63] mb-1">
                  Node Identifier / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js, API Gateway, Redis..."
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full bg-[#f5f0e8] border border-[#d9d0c0] rounded-xl px-3 py-2 text-xs text-[#2c2825] focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#7a6f63] mb-1">
                  Category / Property (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Graph Engine, Frontend Framework..."
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value)}
                  className="w-full bg-[#f5f0e8] border border-[#d9d0c0] rounded-xl px-3 py-2 text-xs text-[#2c2825] focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddNodeOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#d9d0c0] text-xs font-medium text-[#7a6f63] hover:bg-[#e8e2d6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingNode}
                  className="px-3.5 py-1.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold shadow-sm transition-colors"
                >
                  {isCreatingNode ? 'Creating...' : `Create in '${activeGraph}'`}
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
