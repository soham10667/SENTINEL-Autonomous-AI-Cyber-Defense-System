'use client';

import React from 'react';
import { X, ArrowDownRight, Scissors, GitFork } from 'lucide-react';
import { CounterfactualResult } from '../types';

interface CounterfactualModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CounterfactualResult | null;
}

export default function CounterfactualModal({
  isOpen,
  onClose,
  result
}: CounterfactualModalProps) {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#ede8dc] border border-[#d9d0c0] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d4ede3] border border-[#10b981] flex items-center justify-center text-[#10b981] shadow-sm shrink-0">
              <Scissors className="w-4 h-4 text-[#10b981]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2c2825] tracking-wide">
                Counterfactual Containment Analysis
              </h3>
              <p className="text-[10px] text-[#7a6f63] font-mono">
                Mathematical Risk Simulation before Action Enforcement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0] text-[#7a6f63] hover:text-[#2c2825] transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Target Banner */}
        <div className="p-2.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-between text-xs font-mono shadow-sm">
          <div>
            <span className="text-[#7a6f63]">SIMULATED ACTION: </span>
            <strong className="text-[#10b981] font-bold">{result.action_type}</strong>
          </div>
          <div>
            <span className="text-[#7a6f63]">TARGET: </span>
            <strong className="text-[#2c2825] font-bold">{result.target_id}</strong>
          </div>
        </div>

        {/* Risk Comparison Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Before */}
          <div className="p-3 rounded-xl bg-red-100/70 border border-red-300 shadow-sm">
            <div className="text-[9px] font-mono uppercase text-red-800 font-bold mb-0.5">
              CURRENT RISK
            </div>
            <div className="text-xl font-bold font-mono text-red-800">
              {result.risk_before}
            </div>
            <div className="text-[9px] text-red-700/80 mt-0.5">Unmitigated</div>
          </div>

          {/* Delta */}
          <div className="p-3 rounded-xl bg-[#d4ede3] border border-[#10b981]/50 flex flex-col justify-center items-center shadow-sm">
            <div className="text-[9px] font-mono uppercase text-emerald-800 font-bold mb-0.5 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-emerald-700" />
              REDUCTION
            </div>
            <div className="text-xl font-bold font-mono text-emerald-800">
              -{result.risk_reduction}
            </div>
            <div className="text-[9px] text-emerald-700/80 mt-0.5">Pts Dropped</div>
          </div>

          {/* After */}
          <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 shadow-sm">
            <div className="text-[9px] font-mono uppercase text-emerald-800 font-bold mb-0.5">
              RESIDUAL RISK
            </div>
            <div className="text-xl font-bold font-mono text-emerald-800">
              {result.risk_after}
            </div>
            <div className="text-[9px] text-emerald-700/80 mt-0.5">Safe Baseline</div>
          </div>
        </div>

        {/* Topology Impact Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-between shadow-sm">
            <span className="text-[#7a6f63] flex items-center gap-1.5 text-[11px]">
              <Scissors className="w-3.5 h-3.5 text-red-600 shrink-0" /> Severed:
            </span>
            <strong className="text-[#2c2825] font-bold">{result.paths_severed} paths</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-between shadow-sm">
            <span className="text-[#7a6f63] flex items-center gap-1.5 text-[11px]">
              <GitFork className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Remaining:
            </span>
            <strong className="text-[#2c2825] font-bold">{result.remaining_paths} paths</strong>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-3 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] text-xs text-[#2c2825] leading-relaxed font-sans shadow-sm">
          {result.explanation}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#10b981] text-white font-bold text-xs hover:bg-[#059669] transition-all shadow-sm"
          >
            Acknowledge Counterfactual
          </button>
        </div>
      </div>
    </div>
  );
}
