'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Cpu,
  CheckCircle,
  Terminal,
  Activity,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import AgentTraceTimeline from '../../components/AgentTraceTimeline';
import { api } from '../../lib/api';
import { TraceStep } from '../../types';

export default function AgentOperationsPage() {
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [investigationId, setInvestigationId] = useState<string>('INV-2026-01');
  const [isRuleBased, setIsRuleBased] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulatedTrace, setIsSimulatedTrace] = useState<boolean>(false);

  const loadTrace = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInvestigationTrace('INV-2026-01');
      if (res && res.steps && res.steps.length > 0) {
        setTraceSteps(res.steps);
        setInvestigationId(res.investigation_id);
        setIsSimulatedTrace(false);
        return;
      }
      throw new Error('No active trace found');
    } catch {
      setIsSimulatedTrace(true);
      setTraceSteps([
        {
          step_num: 1,
          phase: 'EVENT_VALIDATION',
          tool_name: 'get_security_event',
          tool_input: { event_id: 'EVT-AUTH-ANOMALY-01' },
          tool_output: {
            id: 'EVT-AUTH-ANOMALY-01',
            event_type: 'ANOMALOUS_EXTERNAL_LOGIN',
            severity: 'HIGH',
            confidence: 0.98,
            source_entity_id: '194.26.29.112'
          },
          rationale: 'Retrieved incoming security event. Validated origin 194.26.29.112 with 98% confidence.',
          timestamp: new Date().toISOString(),
          evidence_node_ids: ['EVT-AUTH-ANOMALY-01', '194.26.29.112']
        },
        {
          step_num: 2,
          phase: 'GRAPH_TOPOLOGY_EXPLORATION',
          tool_name: 'find_connected_assets',
          tool_input: { entity_id: '194.26.29.112', depth: 2 },
          tool_output: {
            connected_count: 3,
            sample: [
              { asset_id: 'USR-002', asset_type: 'User' },
              { asset_id: 'DEV-WKS-02', asset_type: 'Device' }
            ]
          },
          rationale: 'Discovered direct connection to compromised identity USR-002 (Sarah Connor) and workstation DEV-WKS-02.',
          timestamp: new Date().toISOString(),
          evidence_node_ids: ['USR-002', 'DEV-WKS-02']
        },
        {
          step_num: 3,
          phase: 'ATTACK_CHAIN_RECONSTRUCTION',
          tool_name: 'trace_possible_attack_paths',
          tool_input: { source_id: '194.26.29.112', max_depth: 4 },
          tool_output: {
            paths_discovered: 2,
            top_paths: ['194.26.29.112 -> USR-002 -> DEV-WKS-02 -> SRV-CI-02 -> DB-PROD-CUST-01']
          },
          rationale: 'Reconstructed multi-hop lateral path to customer PII database (DB-PROD-CUST-01).',
          timestamp: new Date().toISOString(),
          evidence_node_ids: ['SRV-CI-02', 'DB-PROD-CUST-01']
        },
        {
          step_num: 4,
          phase: 'RISK_EVALUATION',
          tool_name: 'calculate_graph_risk',
          tool_input: { source_id: '194.26.29.112', base_severity: 'HIGH' },
          tool_output: {
            total_risk_score: 87.5,
            severity_level: 'CRITICAL',
            reachable_crown_jewels: [{ id: 'DB-PROD-CUST-01', criticality: 'CRITICAL', hops: 4 }]
          },
          rationale: 'Calculated deterministic graph risk: 87.5/100 (CRITICAL). Crown jewel database exposed.',
          timestamp: new Date().toISOString(),
          evidence_node_ids: ['DB-PROD-CUST-01']
        },
        {
          step_num: 5,
          phase: 'COUNTERFACTUAL_ANALYSIS',
          tool_name: 'evaluate_counterfactual_containment',
          tool_input: { action_type: 'BLOCK_IP', target_id: '194.26.29.112' },
          tool_output: {
            risk_before: 87.5,
            risk_after: 12.0,
            risk_reduction: 75.5,
            severed_paths: 2
          },
          rationale: 'Pre-flight counterfactual simulation: Severing 194.26.29.112 cuts exposure by 75.5 pts with zero business disruption.',
          timestamp: new Date().toISOString(),
          evidence_node_ids: ['194.26.29.112']
        },
        {
          step_num: 6,
          phase: 'CONTAINMENT_EXECUTION',
          tool_name: 'simulate_block_ip',
          tool_input: { ip_address: '194.26.29.112', rationale: 'Sever confirmed breach entry' },
          tool_output: {
            action_id: 'ACT-BLK-99A1',
            status: 'EXECUTED',
            firewall_rule: 'DROP src=194.26.29.112/32'
          },
          rationale: 'Enforced simulated perimeter firewall block on threat actor proxy node.',
          timestamp: new Date().toISOString(),
          evidence_node_ids: ['194.26.29.112']
        },
        {
          step_num: 7,
          phase: 'OUTCOME_VERIFICATION',
          tool_name: 'verify_containment',
          tool_input: { action_id: 'ACT-BLK-99A1' },
          tool_output: {
            verified: true,
            containment_status: 'CONFIRMED_ENFORCED'
          },
          rationale: 'Verified in FalkorDB: IP status set to BLOCKED, preventing downstream traversal.',
          timestamp: new Date().toISOString(),
          evidence_node_ids: ['194.26.29.112']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrace();
  }, []);

  return (
    <div className="space-y-3 sm:space-y-3.5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <Bot className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
            <span>Autonomous Agent Cognitive Trace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2c2825] tracking-tight leading-tight">
            Agent Operations & Decision Timeline
          </h1>
          <p className="text-[#7a6f63] text-xs mt-0.5 truncate">
            Real-time step-by-step execution stream: tool calls, query summaries, evidence grounding, and verified defensive actions.
          </p>
        </div>

        {/* Reload button */}
        <button
          onClick={loadTrace}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-[#2c2825] hover:text-[#10b981] hover:border-[#10b981] text-xs font-mono font-semibold transition-all shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#10b981]' : ''}`} />
          <span>Refresh Trace</span>
        </button>
      </div>

      {/* Explicit Simulation Data Status Banner */}
      {isSimulatedTrace && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-900 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Simulated Reference Demonstration (Scenario A)</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Displaying the baseline agent cognition model. To observe real-time agent execution persisted directly into your FalkorDB knowledge graph, launch an incident in the Simulation Lab.
              </p>
            </div>
          </div>
          <Link
            href="/simulation"
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shrink-0 shadow-sm self-end sm:self-auto"
          >
            Launch Incident &rarr;
          </Link>
        </div>
      )}

      {/* Metrics Row: 4 equal cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] flex items-center justify-between shadow-sm min-w-0">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-[#7a6f63] uppercase font-bold truncate block">Agent Brain</span>
            <div className="text-xs sm:text-sm font-bold font-mono text-[#10b981] mt-0.5 truncate">
              LangGraph / FalkorDB
            </div>
          </div>
          <Cpu className="w-4 h-4 text-[#10b981] shrink-0 ml-1.5" />
        </div>

        <div className="p-3 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] flex items-center justify-between shadow-sm min-w-0">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-[#7a6f63] uppercase font-bold truncate block">Tools Invoked</span>
            <div className="text-xs sm:text-sm font-bold font-mono text-[#2c2825] mt-0.5 truncate">
              {traceSteps.length} MCP Tools
            </div>
          </div>
          <Terminal className="w-4 h-4 text-[#10b981] shrink-0 ml-1.5" />
        </div>

        <div className="p-3 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] flex items-center justify-between shadow-sm min-w-0">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-[#7a6f63] uppercase font-bold truncate block">Autonomy Mode</span>
            <div className="text-xs sm:text-sm font-bold font-mono text-emerald-800 mt-0.5 truncate">
              {isRuleBased ? 'Deterministic Rules' : 'LLM-Grounded'}
            </div>
          </div>
          <Activity className="w-4 h-4 text-emerald-600 shrink-0 ml-1.5" />
        </div>

        <div className="p-3 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] flex items-center justify-between shadow-sm min-w-0">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-[#7a6f63] uppercase font-bold truncate block">Containment Status</span>
            <div className="text-xs sm:text-sm font-bold font-mono text-emerald-800 mt-0.5 flex items-center gap-1 truncate">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Verified Enforced</span>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 ml-1.5" />
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-[#2c2825] flex items-center gap-2 border-b border-[#d9d0c0] pb-2.5">
          <Terminal className="w-4 h-4 text-[#10b981]" />
          Autonomous Tool Execution Trace
        </h3>
        <AgentTraceTimeline
          steps={traceSteps}
          investigationId={investigationId}
          isRuleBased={isRuleBased}
        />
      </div>
    </div>
  );
}
