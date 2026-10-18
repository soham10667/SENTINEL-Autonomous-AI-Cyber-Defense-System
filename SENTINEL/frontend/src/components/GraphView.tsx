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

  // Convert GraphData nodes into React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    const total = data.nodes.length || 1;
    const radius = Math.max(260, total * 20);

    return data.nodes.map((n, idx) => {
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
              <span className="text-[9px] font-mono tracking-wider text-[#7a6f63] uppercase font-bold">{n.label}</span>
              <span className="font-bold text-xs text-[#2c2825] truncate max-w-[130px]">
                {n.properties?.name || n.properties?.username || n.properties?.hostname || n.properties?.ip || n.id}
              </span>
              {isCrownJewel && (
                <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded mt-0.5 border border-amber-300 font-bold">
                  CROWN JEWEL
                </span>
              )}
            </div>
          ),
          rawNode: n
        },
        style: {
          background: isSevered ? '#e8e2d6' : isPath ? '#fef2f2' : '#ede8dc',
          color: '#2c2825',
          border: isSevered
            ? '2px dashed #94a3b8'
            : isPath
            ? '2px solid #ef4444'
            : `1.5px solid ${nodeColor}`,
          boxShadow: isPath
            ? '0 0 12px rgba(239, 68, 68, 0.35)'
            : '0 2px 8px rgba(0, 0, 0, 0.05)',
          borderRadius: '10px',
          padding: '6px 10px',
          minWidth: '120px',
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
          stroke: isSeveredEdge ? '#cbd5e1' : isPathEdge ? '#ef4444' : '#b8ada0',
          strokeWidth: isPathEdge ? 2.5 : 1.5,
          strokeDasharray: isSeveredEdge ? '5 5' : undefined,
          opacity: isSeveredEdge ? 0.35 : 1
        },
        labelStyle: {
          fill: isPathEdge ? '#dc2626' : '#7a6f63',
          fontSize: 9,
          fontFamily: 'monospace',
          fontWeight: 600
        },
        labelBgStyle: {
          fill: '#ede8dc',
          fillOpacity: 0.95
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isPathEdge ? '#ef4444' : '#a89d8f',
          width: 14,
          height: 14
        }
      };
    });
  }, [data.edges, highlightPathNodeIds, severedNodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onSelectNode && node.data?.rawNode) {
        onSelectNode(node.data.rawNode);
      }
    },
    [onSelectNode]
  );

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

  // Synchronize edges so only edges with both endpoints present in filteredNodes are rendered
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
    return edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
  }, [edges, filteredNodes]);

  const nodeLabels = useMemo(() => {
    const dynamic = Array.from(new Set(data.nodes.map((n) => n.label).filter(Boolean)));
    return ['ALL', ...(dynamic.length > 0 ? dynamic : ['User', 'Device', 'Server', 'Database'])];
  }, [data.nodes]);

  const hasActiveFilter = selectedFilter !== 'ALL' || searchTerm.trim() !== '';

  return (
    <div className="relative w-full h-[450px] sm:h-[500px] lg:h-[calc(100vh-270px)] min-h-[380px] max-h-[640px] rounded-xl border border-[#d9d0c0] bg-[#ede8dc] overflow-hidden shadow-sm flex flex-col">
      {/* Top HUD Controls bar */}
      <div className="h-12 px-3 bg-[#e8e2d6] border-b border-[#d9d0c0] flex items-center justify-between z-10 gap-2 sm:gap-4 overflow-x-auto shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-xs shrink-0">
          <Search className="w-3.5 h-3.5 text-[#7a6f63] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search node or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#ede8dc] border border-[#d9d0c0] rounded-lg pl-8 pr-2.5 py-1 text-xs text-[#2c2825] placeholder-[#7a6f63] focus:outline-none focus:border-[#10b981]"
          />
        </div>

        {/* Node Label Filters */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <Filter className="w-3.5 h-3.5 text-[#7a6f63] mr-0.5 shrink-0" />
          {nodeLabels.map((lbl) => (
            <button
              key={lbl}
              onClick={() => setSelectedFilter(lbl)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-all shrink-0 ${
                selectedFilter === lbl
                  ? 'bg-[#d4ede3] text-[#1a2e22] border border-[#10b981]/60 font-bold shadow-sm'
                  : 'bg-[#ede8dc] text-[#7a6f63] hover:text-[#2c2825] border border-[#d9d0c0]'
              }`}
            >
              {lbl}
            </button>
          ))}
          {hasActiveFilter && (
            <button
              onClick={() => {
                setSelectedFilter('ALL');
                setSearchTerm('');
              }}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 ml-1 shrink-0 font-bold"
              title="Reset Search and Filter"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Legend & Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          {highlightPathNodeIds.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-100 border border-red-300 text-red-700 text-[10px] font-mono font-bold animate-pulse">
              <ShieldAlert className="w-3 h-3" />
              <span>Attack Chain ({highlightPathNodeIds.length} nodes)</span>
            </div>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded-lg bg-[#ede8dc] border border-[#d9d0c0] text-[#7a6f63] hover:text-[#10b981] hover:border-[#10b981] transition-colors"
              title="Refresh Graph"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#10b981]' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Flow Canvas */}
      <div className="flex-1 w-full h-full relative bg-[#f5f0e8]">
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          minZoom={0.2}
          maxZoom={2.5}
        >
          <Background color="#d9d0c0" gap={22} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(n) => {
              const raw = n.data?.rawNode as GraphNodeData | undefined;
              return raw ? getNodeColor(raw.label) : '#10b981';
            }}
            maskColor="rgba(237, 232, 220, 0.4)"
            style={{
              backgroundColor: '#ede8dc',
              border: '1px solid #d9d0c0',
              borderRadius: '8px'
            }}
          />
        </ReactFlow>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#f5f0e8]/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 pointer-events-none">
            <RefreshCw className="w-7 h-7 text-[#10b981] animate-spin mb-2" />
            <span className="text-xs font-mono font-bold text-[#2c2825]">Querying FalkorDB Graph...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data.nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] flex items-center justify-center mb-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm font-bold text-[#2c2825]">No Graph Nodes Found</p>
            <p className="text-xs text-[#7a6f63] max-w-sm mt-0.5">
              Verify your FalkorDB container is running and the graph contains nodes.
            </p>
          </div>
        )}

        {/* Node stats watermark */}
        <div className="absolute bottom-3 left-3 bg-[#ede8dc]/95 border border-[#d9d0c0] px-2.5 py-1 rounded-lg text-[10px] font-mono text-[#7a6f63] pointer-events-none z-10 flex gap-3 shadow-sm">
          <span>
            NODES:{' '}
            <strong className="text-[#2c2825]">
              {filteredNodes.length !== data.nodes.length
                ? `${filteredNodes.length} / ${data.nodes.length}`
                : data.nodes.length}
            </strong>
          </span>
          <span>
            RELATIONSHIPS:{' '}
            <strong className="text-[#2c2825]">
              {filteredEdges.length !== data.edges.length
                ? `${filteredEdges.length} / ${data.edges.length}`
                : data.edges.length}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
