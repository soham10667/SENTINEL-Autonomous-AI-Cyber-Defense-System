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
      case 'User': return <User className="w-5 h-5 text-[#E88DAD]" />;
      case 'Device': return <Laptop className="w-5 h-5 text-[#E88DAD]" />;
      case 'Server': return <Server className="w-5 h-5 text-[#E88DAD]" />;
      case 'Database': return <Database className="w-5 h-5 text-amber-500" />;
      case 'IPAddress': return <Radio className="w-5 h-5 text-[#E88DAD]" />;
      case 'Permission': return <Key className="w-5 h-5 text-emerald-500" />;
      default: return <ShieldAlert className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white/95 backdrop-blur-lg border-l border-[#F5E1E9] shadow-2xl z-50 flex flex-col transition-all animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-[#F5E1E9] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center shadow-sm">
            {getIcon()}
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#77717A] font-semibold">
              {node.label} Asset
            </div>
            <div className="font-bold text-sm text-[#29252A] truncate max-w-[200px]">
              {node.properties?.name || node.properties?.username || node.properties?.hostname || node.id}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-[#FFF9FC] border border-[#F5E1E9] text-[#77717A] hover:text-[#29252A] transition-colors shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#FFF9FC] border border-[#F5E1E9] text-[#77717A]">
            Criticality: <strong className="text-[#29252A]">{criticality}</strong>
          </span>
          {isCompromised && (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-600" /> COMPROMISED
            </span>
          )}
          {isIsolated ? (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold">
              CONTAINED / ISOLATED
            </span>
          ) : (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" /> ACTIVE
            </span>
          )}
        </div>

        {/* Counterfactual Simulation Action */}
        {onRunCounterfactual && (
          <div className="p-4 rounded-2xl bg-[#FFF9FC] border border-[#FBCFE8] space-y-2 shadow-sm">
            <div className="text-xs font-bold text-[#D9769B] flex items-center gap-1.5">
              <span>Counterfactual Containment Analysis</span>
            </div>
            <p className="text-[11px] text-[#77717A] leading-relaxed">
              Simulate graph isolation on this asset to evaluate blast-radius risk reduction before taking action.
            </p>
            <button
              onClick={() => onRunCounterfactual(node.id, node.label)}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-[#E88DAD] hover:bg-[#D9769B] text-white text-xs font-mono font-bold transition-all shadow-[0_2px_10px_rgba(232,141,173,0.3)]"
            >
              Analyze Containment Impact &rarr;
            </button>
          </div>
        )}

        {/* Properties Table */}
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-[#77717A] font-bold">
            FalkorDB Node Attributes
          </div>
          <div className="rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] overflow-hidden text-xs">
            {Object.entries(node.properties || {}).map(([key, val]) => (
              <div
                key={key}
                className="flex justify-between items-center px-3.5 py-2.5 border-b border-[#F5E1E9] last:border-b-0 hover:bg-white transition-colors"
              >
                <span className="font-mono text-[#77717A]">{key}:</span>
                <span className="font-mono font-semibold text-[#29252A] truncate max-w-[180px]">
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
