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
      <div className="p-6 text-center rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-[#7a6f63] font-mono text-xs shadow-sm">
        No active trace stream. Launch a scenario in the Simulation Lab to observe real-time agent execution.
      </div>
    );
  }

  const toggleStep = (stepNum: number) => {
    setExpandedStep(expandedStep === stepNum ? null : stepNum);
  };

  return (
    <div className="space-y-3.5">
      {/* Investigation Meta Banner */}
      <div className="p-3 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex flex-wrap items-center justify-between gap-2 text-xs font-mono shadow-sm">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#10b981]" />
          <span className="text-[#7a6f63]">TRACE ID:</span>
          <span className="font-bold text-[#2c2825]">{investigationId || 'ACTIVE-WORKFLOW'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#7a6f63]">DECISION MODE:</span>
          <span className="px-2 py-0.5 rounded-full bg-[#d4ede3] text-emerald-800 border border-[#10b981]/50 font-bold text-[10px]">
            {isRuleBased ? 'DETERMINISTIC GRAPH REASONING' : 'LLM-GROUNDED GRAPH REASONING'}
          </span>
        </div>
      </div>

      {/* Steps List */}
      <div className="relative pl-5 sm:pl-6 space-y-3 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#d9d0c0]">
        {steps.map((step) => {
          const isExpanded = expandedStep === step.step_num;
          return (
            <div key={step.step_num} className="relative group">
              {/* Timeline Indicator Circle */}
              <div className="absolute -left-5 sm:-left-6 top-3 w-5 h-5 rounded-full bg-[#d4ede3] border-2 border-[#10b981] flex items-center justify-center text-[9px] font-bold text-[#10b981] shadow-sm">
                {step.step_num}
              </div>

              {/* Step Card */}
              <div className="rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm hover:border-[#b8ada0] transition-all p-3 sm:p-3.5 space-y-2">
                <div
                  className="flex items-center justify-between cursor-pointer gap-2"
                  onClick={() => toggleStep(step.step_num)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-mono font-bold text-[#7a6f63] uppercase tracking-wide shrink-0">
                      [{step.phase}]
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#e8e2d6] border border-[#d9d0c0] text-[#10b981] font-semibold truncate">
                      tool: {step.tool_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#7a6f63] font-mono shrink-0">
                    <span className="hidden sm:flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#10b981]" />
                      {formatTimestamp(step.timestamp)}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#7a6f63]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#7a6f63]" />
                    )}
                  </div>
                </div>

                {/* Rationale Narrative */}
                <p className="text-xs text-[#2c2825] leading-relaxed font-sans">
                  {step.rationale}
                </p>

                {/* Evidence Nodes Badge List */}
                {step.evidence_node_ids && step.evidence_node_ids.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="text-[9px] font-mono uppercase text-[#7a6f63] font-bold">Evidence:</span>
                    {step.evidence_node_ids.map((nid, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#e8e2d6] text-[#2c2825] border border-[#d9d0c0]"
                      >
                        {nid}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expandable JSON Payload Details */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#d9d0c0] grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2.5 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
                      <div className="text-[#7a6f63] font-bold mb-1">TOOL INPUT</div>
                      <pre className="text-[#2c2825] bg-[#ede8dc] p-2 rounded border border-[#d9d0c0] overflow-x-auto whitespace-pre-wrap max-h-40">
                        {JSON.stringify(step.tool_input, null, 2)}
                      </pre>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
                      <div className="text-[#7a6f63] font-bold mb-1">TOOL OUTPUT</div>
                      <pre className="text-emerald-800 bg-[#ede8dc] p-2 rounded border border-[#d9d0c0] overflow-x-auto whitespace-pre-wrap max-h-40 font-semibold">
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
