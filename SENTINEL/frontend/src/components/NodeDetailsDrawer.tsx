'use client';

import React from 'react';
import { X, ShieldAlert, CheckCircle, Database, Server, User, Laptop, Radio, Key } from 'lucide-react';
import { GraphNodeData } from '../types';

interface NodeDetailsDrawerProps {
  node: GraphNodeData | null;
  onClose: () => void;
  onRunCounterfactual?: (nodeId: string, nodeType: string) => void;
}

export default function NodeDetailsDrawer({
  node,
  onClose,
  onRunCounterfactual
}: NodeDetailsDrawerProps) {
  if (!node) return null;

  const isCompromised = node.properties?.is_compromised;
  const isIsolated = node.properties?.is_isolated || node.properties?.is_blocked;
  const criticality = node.properties?.criticality || 'MEDIUM';

  const getIcon = () => {
    switch (node.label) {
      case 'User': return <User className="w-4 h-4 text-purple-600" />;
      case 'Device': return <Laptop className="w-4 h-4 text-blue-600" />;
      case 'Server': return <Server className="w-4 h-4 text-[#10b981]" />;
      case 'Database': return <Database className="w-4 h-4 text-amber-600" />;
      case 'IPAddress': return <Radio className="w-4 h-4 text-[#10b981]" />;
      case 'Permission': return <Key className="w-4 h-4 text-emerald-600" />;
      default: return <ShieldAlert className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 max-w-full bg-[#ede8dc] border-l border-[#d9d0c0] shadow-2xl z-50 flex flex-col transition-all animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-[#d9d0c0] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center shadow-sm shrink-0">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a6f63] font-semibold">
              {node.label} Asset
            </div>
            <div className="font-bold text-xs sm:text-sm text-[#2c2825] truncate">
              {node.properties?.name || node.properties?.username || node.properties?.hostname || node.id}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0] text-[#7a6f63] hover:text-[#2c2825] transition-colors shadow-sm shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        {/* Status badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#e8e2d6] border border-[#d9d0c0] text-[#7a6f63]">
            Criticality: <strong className="text-[#2c2825]">{criticality}</strong>
          </span>
          {isCompromised && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-100 border border-red-300 text-red-800 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-600" /> COMPROMISED
            </span>
          )}
          {isIsolated ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-800 font-bold">
              CONTAINED / ISOLATED
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#d4ede3] border border-[#10b981]/50 text-emerald-800 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" /> ACTIVE
            </span>
          )}
        </div>

        {/* Counterfactual Simulation Action */}
        {onRunCounterfactual && (
          <div className="p-3 rounded-xl bg-[#e8e2d6] border border-[#10b981]/50 space-y-1.5 shadow-sm">
            <div className="text-xs font-bold text-[#10b981] flex items-center gap-1">
              <span>Counterfactual Containment Analysis</span>
            </div>
            <p className="text-[11px] text-[#7a6f63] leading-relaxed">
              Simulate graph isolation on this asset to evaluate blast-radius risk reduction before taking action.
            </p>
            <button
              onClick={() => onRunCounterfactual(node.id, node.label)}
              className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-mono font-bold transition-all shadow-sm"
            >
              Analyze Containment Impact &rarr;
            </button>
          </div>
        )}

        {/* Properties Table */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a6f63] font-bold">
            FalkorDB Node Attributes
          </div>
          <div className="rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] overflow-hidden text-xs">
            {Object.entries(node.properties || {}).map(([key, val]) => (
              <div
                key={key}
                className="flex justify-between items-center px-3 py-1.5 border-b border-[#d9d0c0] last:border-b-0 hover:bg-[#ede8dc] transition-colors"
              >
                <span className="font-mono text-[#7a6f63] text-[11px]">{key}:</span>
                <span className="font-mono font-semibold text-[#2c2825] text-[11px] truncate max-w-[170px]">
                  {typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
