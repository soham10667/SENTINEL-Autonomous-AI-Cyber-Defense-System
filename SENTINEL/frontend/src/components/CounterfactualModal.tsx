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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white border border-[#F5E1E9] rounded-2xl p-6 shadow-[0_10px_40px_rgba(244,167,193,0.25)] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F5E1E9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center text-[#E88DAD] shadow-sm">
              <Scissors className="w-5 h-5 text-[#E88DAD]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#29252A] tracking-wide">
                Counterfactual Containment Analysis
              </h3>
              <p className="text-xs text-[#77717A] font-mono">
                Mathematical Risk Simulation before Action Enforcement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#FFF9FC] border border-[#F5E1E9] text-[#77717A] hover:text-[#29252A] transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Target Banner */}
        <div className="p-3.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] flex items-center justify-between text-xs font-mono shadow-sm">
          <div>
            <span className="text-[#77717A]">SIMULATED ACTION: </span>
            <strong className="text-[#D9769B] font-bold">{result.action_type}</strong>
          </div>
          <div>
            <span className="text-[#77717A]">TARGET: </span>
            <strong className="text-[#29252A] font-bold">{result.target_id}</strong>
          </div>
        </div>

        {/* Risk Comparison Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Before */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center shadow-sm">
            <div className="text-[10px] font-mono uppercase text-red-700 font-bold mb-1">
              CURRENT RISK
            </div>
            <div className="text-2xl font-bold font-mono text-red-700">
              {result.risk_before}
            </div>
            <div className="text-[10px] text-red-600/80 mt-1">Unmitigated Exposure</div>
          </div>

          {/* Delta */}
          <div className="p-4 rounded-xl bg-[#FCE7F3] border border-[#FBCFE8] text-center flex flex-col justify-center items-center shadow-sm">
            <div className="text-[10px] font-mono uppercase text-[#D9769B] font-bold mb-1 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-[#D9769B]" />
              REDUCTION
            </div>
            <div className="text-2xl font-bold font-mono text-[#D9769B]">
              -{result.risk_reduction}
            </div>
            <div className="text-[10px] text-[#77717A] mt-1">Pts Dropped</div>
          </div>

          {/* After */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center shadow-sm">
            <div className="text-[10px] font-mono uppercase text-emerald-700 font-bold mb-1">
              RESIDUAL RISK
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700">
              {result.risk_after}
            </div>
            <div className="text-[10px] text-emerald-600/80 mt-1">Safe Baseline</div>
          </div>
        </div>

        {/* Topology Impact Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] flex items-center justify-between shadow-sm">
            <span className="text-[#77717A] flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-red-600" /> Attack Paths Severed:
            </span>
            <strong className="text-[#29252A] font-bold">{result.paths_severed}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] flex items-center justify-between shadow-sm">
            <span className="text-[#77717A] flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-emerald-600" /> Remaining Paths:
            </span>
            <strong className="text-[#29252A] font-bold">{result.remaining_paths}</strong>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-4 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] text-xs text-[#29252A] leading-relaxed font-sans shadow-sm">
          {result.explanation}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#E88DAD] text-white font-bold text-xs hover:bg-[#D9769B] transition-all shadow-[0_4px_14px_rgba(232,141,173,0.35)]"
          >
            Acknowledge Counterfactual
          </button>
        </div>
      </div>
    </div>
  );
}
