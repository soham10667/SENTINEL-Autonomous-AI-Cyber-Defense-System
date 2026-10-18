'use client';

import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Search, Filter, ShieldAlert, RefreshCw } from 'lucide-react';
import { GraphData, GraphNodeData } from '../types';
import { getNodeColor } from '../lib/utils';

interface GraphViewProps {
  data: GraphData;
  onSelectNode?: (node: GraphNodeData) => void;
  highlightPathNodeIds?: string[];
  severedNodeIds?: string[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function GraphView({
  data,
  onSelectNode,
  highlightPathNodeIds = [],
  severedNodeIds = [],
  isLoading = false,
  onRefresh
}: GraphViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Convert GraphData nodes into React Flow nodes with organic circular/grid positioning
  const initialNodes: Node[] = useMemo(() => {
    const total = data.nodes.length || 1;
    const radius = Math.max(280, total * 22);

    return data.nodes.map((n, idx) => {
      // Angle-based layout for circular radial graph structure
      const angle = (idx / total) * 2 * Math.PI;
      const x = Math.round(450 + radius * Math.cos(angle));
      const y = Math.round(300 + radius * Math.sin(angle));

      const isPath = highlightPathNodeIds.includes(n.id);
      const isSevered = severedNodeIds.includes(n.id);
      const isCrownJewel = n.properties?.contains_pii || n.properties?.contains_financial || n.properties?.criticality === 'CRITICAL';
      const nodeColor = getNodeColor(n.label);

      return {
        id: n.id,
        position: { x, y },
        data: {
          label: (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono tracking-wider text-[#77717A] uppercase">{n.label}</span>
              <span className="font-bold text-xs text-[#29252A] truncate max-w-[130px]">
                {n.properties?.name || n.properties?.username || n.properties?.hostname || n.properties?.ip || n.id}
              </span>
              {isCrownJewel && (
                <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded mt-0.5 border border-amber-300 font-bold">
                  CROWN JEWEL
                </span>
              )}
            </div>
          ),
          rawNode: n
        },
        style: {
          background: isSevered ? '#F1F5F9' : isPath ? '#FEF2F2' : '#FFFFFF',
          color: '#29252A',
          border: isSevered
            ? '2px dashed #94a3b8'
            : isPath
            ? '2px solid #ef4444'
            : `1.5px solid ${nodeColor}`,
          boxShadow: isPath
            ? '0 0 15px rgba(239, 68, 68, 0.3)'
            : '0 2px 10px rgba(244, 167, 193, 0.2)',
          borderRadius: '10px',
          padding: '8px 12px',
          minWidth: '130px',
          opacity: isSevered ? 0.45 : 1,
          cursor: 'pointer'
        }
      };
    });
  }, [data.nodes, highlightPathNodeIds, severedNodeIds]);

  // Convert GraphData edges into React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    return data.edges.map((e) => {
      const isPathEdge =
        highlightPathNodeIds.includes(e.source) && highlightPathNodeIds.includes(e.target);
      const isSeveredEdge =
        severedNodeIds.includes(e.source) || severedNodeIds.includes(e.target);

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.type,
        animated: isPathEdge,
        style: {
          stroke: isSeveredEdge ? '#CBD5E1' : isPathEdge ? '#ef4444' : '#F4A7C1',
          strokeWidth: isPathEdge ? 2.5 : 1.5,
          strokeDasharray: isSeveredEdge ? '5 5' : undefined,
          opacity: isSeveredEdge ? 0.35 : 1
        },
        labelStyle: {
          fill: isPathEdge ? '#dc2626' : '#77717A',
          fontSize: 9,
          fontFamily: 'monospace',
          fontWeight: 600
        },
        labelBgStyle: {
          fill: '#FFFFFF',
          fillOpacity: 0.95
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isPathEdge ? '#ef4444' : '#F4A7C1',
          width: 14,
          height: 14
        }
      };
    });
  }, [data.edges, highlightPathNodeIds, severedNodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when data props change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle node selection
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onSelectNode && node.data?.rawNode) {
        onSelectNode(node.data.rawNode);
      }
    },
    [onSelectNode]
  );

  // Filter nodes based on search & label filter
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const raw = n.data?.rawNode as GraphNodeData | undefined;
      if (!raw) return true;
      const matchFilter = selectedFilter === 'ALL' || raw.label === selectedFilter;
      const matchSearch =
        searchTerm === '' ||
        raw.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(raw.properties).toLowerCase().includes(searchTerm.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [nodes, searchTerm, selectedFilter]);

  const nodeLabels = useMemo(() => {
    const dynamic = Array.from(new Set(data.nodes.map((n) => n.label).filter(Boolean)));
    return ['ALL', ...(dynamic.length > 0 ? dynamic : ['User', 'Device', 'Server', 'Database'])];
  }, [data.nodes]);

  return (
    <div className="relative w-full h-[620px] rounded-2xl border border-[#F5E1E9] bg-white overflow-hidden shadow-[0_4px_25px_rgba(244,167,193,0.15)] flex flex-col">
      {/* Top HUD Controls bar */}
      <div className="h-14 px-4 bg-[#FFF9FC] border-b border-[#F5E1E9] flex items-center justify-between z-10 gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#77717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search graph node or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#F5E1E9] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#29252A] placeholder-[#77717A] focus:outline-none focus:border-[#E88DAD] focus:ring-1 focus:ring-[#E88DAD]"
          />
        </div>

        {/* Node Label Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <Filter className="w-3.5 h-3.5 text-[#77717A] mr-1 shrink-0" />
          {nodeLabels.map((lbl) => (
            <button
              key={lbl}
              onClick={() => setSelectedFilter(lbl)}
              className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                selectedFilter === lbl
                  ? 'bg-[#FCE7F3] text-[#D9769B] border border-[#F4A7C1] font-bold shadow-sm'
                  : 'bg-white text-[#77717A] hover:text-[#29252A] hover:bg-[#FFF7FA] border border-[#F5E1E9]'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Legend & Refresh */}
        <div className="flex items-center gap-3">
          {highlightPathNodeIds.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-mono font-bold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Attack Chain ({highlightPathNodeIds.length} nodes)</span>
            </div>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-xl bg-white border border-[#F5E1E9] text-[#77717A] hover:text-[#E88DAD] hover:border-[#F4A7C1] transition-colors shadow-sm"
              title="Refresh Graph"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#E88DAD]' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Flow Canvas - White Background with Soft Pink Grid Dots */}
      <div className="flex-1 w-full h-full relative bg-white">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          minZoom={0.2}
          maxZoom={2.5}
        >
          <Background color="#F5E1E9" gap={24} size={1.5} />
          <Controls />
          <MiniMap
            nodeColor={(n) => {
              const raw = n.data?.rawNode as GraphNodeData | undefined;
              return raw ? getNodeColor(raw.label) : '#F4A7C1';
            }}
            maskColor="rgba(252, 231, 243, 0.4)"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #F5E1E9',
              borderRadius: '10px'
            }}
          />
        </ReactFlow>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 pointer-events-none">
            <RefreshCw className="w-8 h-8 text-[#E88DAD] animate-spin mb-2" />
            <span className="text-xs font-mono font-bold text-[#D9769B]">Querying FalkorDB Graph...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data.nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF7FA] border border-[#F5E1E9] flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6 text-[#E88DAD]" />
            </div>
            <p className="text-sm font-bold text-[#29252A]">No Graph Nodes Found</p>
            <p className="text-xs text-[#77717A] max-w-sm mt-1">
              Verify your FalkorDB container is running and the graph contains nodes.
            </p>
          </div>
        )}

        {/* Node stats watermark */}
        <div className="absolute bottom-4 left-4 bg-white/95 border border-[#F5E1E9] px-3.5 py-1.5 rounded-xl text-[11px] font-mono text-[#77717A] pointer-events-none z-10 flex gap-4 shadow-sm">
          <span>NODES: <strong className="text-[#29252A]">{data.nodes.length}</strong></span>
          <span>RELATIONSHIPS: <strong className="text-[#29252A]">{data.edges.length}</strong></span>
        </div>
      </div>
    </div>
  );
}
