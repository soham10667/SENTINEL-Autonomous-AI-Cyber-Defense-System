'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Terminal,
  Clock,
} from 'lucide-react';
import { TraceStep } from '../types';
import { formatTimestamp } from '../lib/utils';

interface AgentTraceTimelineProps {
  steps: TraceStep[];
  investigationId?: string;
  isRuleBased?: boolean;
}

export default function AgentTraceTimeline({
  steps,
  investigationId,
  isRuleBased = true
}: AgentTraceTimelineProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  if (!steps || steps.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white border border-[#F5E1E9] text-[#77717A] font-mono text-xs shadow-sm">
        No active trace stream. Launch a scenario in the Simulation Lab to observe real-time agent execution.
      </div>
    );
  }

  const toggleStep = (stepNum: number) => {
    setExpandedStep(expandedStep === stepNum ? null : stepNum);
  };

  return (
    <div className="space-y-5">
      {/* Investigation Meta Banner */}
      <div className="p-4 rounded-2xl bg-[#FFF9FC] border border-[#F5E1E9] flex items-center justify-between text-xs font-mono shadow-sm">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[#E88DAD]" />
          <span className="text-[#77717A]">TRACE ID:</span>
          <span className="font-bold text-[#29252A]">{investigationId || 'ACTIVE-WORKFLOW'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#77717A]">DECISION MODE:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FCE7F3] text-[#D9769B] border border-[#FBCFE8] font-bold text-[11px]">
            {isRuleBased ? 'DETERMINISTIC GRAPH REASONING' : 'LLM-GROUNDED GRAPH REASONING'}
          </span>
        </div>
      </div>

      {/* Steps List */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#FCE7F3]">
        {steps.map((step) => {
          const isExpanded = expandedStep === step.step_num;
          return (
            <div key={step.step_num} className="relative group">
              {/* Timeline Indicator: Pale Pink Numbered Circle */}
              <div className="absolute -left-6 top-3 w-6 h-6 rounded-full bg-[#FCE7F3] border-2 border-[#F4A7C1] flex items-center justify-center text-[10px] font-bold text-[#D9769B] shadow-sm">
                {step.step_num}
              </div>

              {/* Step Card: Elegant White Dashboard Card with Subtle Pink Shadow */}
              <div className="rounded-2xl bg-white border border-[#F5E1E9] shadow-[0_2px_12px_rgba(244,167,193,0.1)] hover:shadow-[0_4px_20px_rgba(244,167,193,0.18)] hover:border-[#F4A7C1] transition-all p-4 space-y-2.5">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleStep(step.step_num)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#77717A] uppercase tracking-wide">
                      [{step.phase}]
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#FFF9FC] border border-[#F5E1E9] text-[#D9769B] font-semibold">
                      tool: {step.tool_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#77717A] font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#E88DAD]" />
                      {formatTimestamp(step.timestamp)}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#77717A]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#77717A]" />
                    )}
                  </div>
                </div>

                {/* Rationale Narrative */}
                <p className="text-xs text-[#29252A] leading-relaxed pl-1 font-sans">
                  {step.rationale}
                </p>

                {/* Evidence Nodes Badge List */}
                {step.evidence_node_ids && step.evidence_node_ids.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 pl-1">
                    <span className="text-[10px] font-mono uppercase text-[#77717A]">Evidence:</span>
                    {step.evidence_node_ids.map((nid, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FFF9FC] text-[#29252A] border border-[#F5E1E9]"
                      >
                        {nid}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expandable JSON Payload Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#F5E1E9] grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
                    <div className="p-3 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
                      <div className="text-[#77717A] font-bold mb-1">TOOL INPUT</div>
                      <pre className="text-[#29252A] bg-white p-2.5 rounded-lg border border-[#F5E1E9] overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(step.tool_input, null, 2)}
                      </pre>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
                      <div className="text-[#77717A] font-bold mb-1">TOOL OUTPUT</div>
                      <pre className="text-emerald-800 bg-white p-2.5 rounded-lg border border-[#F5E1E9] overflow-x-auto whitespace-pre-wrap font-semibold">
                        {JSON.stringify(step.tool_output, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
