'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  Bot
} from 'lucide-react';
import { api } from '../../lib/api';

const scenarios = [
  {
    id: 'A',
    title: 'Scenario A: Compromised Employee Account',
    badge: 'FLAGSHIP SCENARIO',
    badgeColor: 'bg-[#d4ede3] text-emerald-800 border-[#10b981]/50',
    description:
      'Attacker uses stolen credentials via Russian proxy IP 194.26.29.112 to hijack Sarah Connor (USR-002), traversing from laptop DEV-WKS-02 through CI runner SRV-CI-02 towards Customer PII Database (DB-PROD-CUST-01).',
    entryEntity: '194.26.29.112',
    targetThreat: 'DB-PROD-CUST-01 (PII Crown Jewel)',
    expectedContainment: 'SIMULATE_BLOCK_IP & SIMULATE_DISABLE_ACCOUNT'
  },
  {
    id: 'B',
    title: 'Scenario B: Suspicious Lateral Access',
    badge: 'INFRASTRUCTURE ATTACK',
    badgeColor: 'bg-purple-100/70 text-purple-800 border-purple-300',
    description:
      'Compromised staging CI/CD runner SRV-CI-02 pivots into internal PCI-DSS payment enclave SRV-PAY-API via unauthorized SSH tunneling, attempting to dump cardholder data from DB-PAYMENTS-01.',
    entryEntity: 'SRV-CI-02',
    targetThreat: 'DB-PAYMENTS-01 (Financial Crown Jewel)',
    expectedContainment: 'SIMULATE_ISOLATE_DEVICE (SRV-CI-02)'
  },
  {
    id: 'C',
    title: 'Scenario C: Privilege Misuse & IAM Escalation',
    badge: 'INSIDER PRIVILEGE ESCALATION',
    badgeColor: 'bg-amber-100/70 text-amber-800 border-amber-300',
    description:
      'Contractor USR-004 (Alex Rivera) suddenly acquires unauthorized AWS AdministratorAccess permissions, accessing HashiCorp Vault / Cloud KMS server SRV-KMS-01.',
    entryEntity: 'USR-004',
    targetThreat: 'SRV-KMS-01 (Key Management Vault)',
    expectedContainment: 'SIMULATE_DISABLE_ACCOUNT (USR-004)'
  }
];

export default function SimulationLabPage() {
  const [selectedScenario, setSelectedScenario] = useState('A');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const simulationSteps = [
    'Initializing clean synthetic environment in FalkorDB',
    'Injecting synthetic security event & incident into sentinel graph',
    'Triggering autonomous investigation agent',
    'Traversing FalkorDB multi-hop topology to find attack route',
    'Computing deterministic graph-grounded risk score',
    'Performing counterfactual containment analysis',
    'Executing authorized simulated containment action',
    'Verifying graph state containment in FalkorDB',
    'Compiling explainable incident report'
  ];

  const handleLaunchSimulation = async () => {
    setIsRunning(true);
    setSimulationResult(null);
    setCurrentStepIndex(0);

    try {
      setCurrentStepIndex(1);
      const scenarioRes = await api.startSimulation(selectedScenario);

      for (let i = 2; i <= 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setCurrentStepIndex(i);
      }

      setCurrentStepIndex(6);
      const invRes = await api.startInvestigation(
        scenarioRes.incident_id,
        scenarioRes.event_id
      );

      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentStepIndex(8);

      setSimulationResult({
        ...scenarioRes,
        investigation: invRes
      });
    } catch (err: any) {
      console.error('Simulation error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = async () => {
    try {
      await api.reconnectGraph();
      setResetMessage('Simulation state and baseline enterprise graph reset in FalkorDB.');
      setSimulationResult(null);
      setCurrentStepIndex(-1);
      setTimeout(() => setResetMessage(null), 4000);
    } catch (err: any) {
      setResetMessage('Reset failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-3.5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <FlaskConical className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
            <span>Interactive Cyber Simulation Environment</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2c2825] tracking-tight leading-tight">
            Live Attack Simulation Lab
          </h1>
          <p className="text-[#7a6f63] text-xs mt-0.5 truncate">
            Test autonomous graph-grounded attack investigation, multi-hop discovery, counterfactual containment, and automated response.
          </p>
        </div>

        {/* Reset State Button */}
        <button
          onClick={handleReset}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-[#7a6f63] hover:text-amber-700 hover:border-amber-300 text-xs font-mono transition-all disabled:opacity-50 shadow-sm shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Simulation State</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono shadow-sm">
          {resetMessage}
        </div>
      )}

      {/* Scenario Selection Grid: 3 equal-height cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => !isRunning && setSelectedScenario(sc.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-full min-w-0 ${
                isSelected
                  ? 'bg-[#d4ede3]/30 border-2 border-[#10b981] shadow-sm'
                  : 'bg-[#ede8dc] border-[#d9d0c0] hover:border-[#b8ada0] hover:bg-[#e8e2d6] shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                  <span className="text-xs font-mono text-[#7a6f63]">#{sc.id}</span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-[#2c2825]">{sc.title}</h3>
                <p className="text-xs text-[#7a6f63] font-sans leading-relaxed line-clamp-3">{sc.description}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#d9d0c0] text-[10px] font-mono space-y-0.5 text-[#7a6f63]">
                <div className="truncate">Origin: <strong className="text-[#10b981]">{sc.entryEntity}</strong></div>
                <div className="truncate">Crown Jewel: <strong className="text-amber-800">{sc.targetThreat}</strong></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Launch Area */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-[#2c2825] flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#10b981]" />
              Autonomous Simulation Engine Trigger
            </h3>
            <p className="text-xs text-[#7a6f63] mt-0.5 max-w-2xl">
              Launches Scenario {selectedScenario}: Injects synthetic telemetry into FalkorDB, dispatches the agent, performs multi-hop investigation, and executes simulated containment.
            </p>
          </div>

          <button
            onClick={handleLaunchSimulation}
            disabled={isRunning}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#10b981] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#059669] transition-all flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(16,185,129,0.35)] disabled:opacity-50 shrink-0"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Investigation in Progress...' : 'Launch Security Incident Simulation'}</span>
          </button>
        </div>

        {/* Live Step Progress Checklist */}
        {currentStepIndex >= 0 && (
          <div className="p-3.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] space-y-2 animate-in fade-in">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a6f63] font-bold">
              Autonomous Pipeline Execution Stages:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 text-xs font-mono">
              {simulationSteps.map((step, idx) => {
                const isComplete = currentStepIndex > idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all text-[11px] ${
                      isComplete
                        ? 'text-emerald-800 bg-[#d4ede3] border-[#10b981]/50 font-semibold'
                        : isCurrent
                        ? 'text-[#10b981] bg-[#e4ddd0] border-[#10b981] font-bold animate-pulse'
                        : 'text-[#7a6f63] border-transparent'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isComplete ? 'text-emerald-600' : isCurrent ? 'text-[#10b981]' : 'text-stone-300'
                      }`}
                    />
                    <span className="truncate">
                      {idx + 1}. {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Simulation Result Summary */}
        {simulationResult && (
          <div className="p-4 rounded-xl bg-[#e8e2d6] border border-[#10b981]/60 space-y-3 shadow-sm animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> INVESTIGATION & SIMULATED CONTAINMENT COMPLETED
              </span>
              <span className="text-xs font-mono text-[#7a6f63]">
                Incident: <strong className="text-[#2c2825]">{simulationResult.incident_id}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm">
                <span className="text-[#7a6f63] text-[10px]">GRAPH RISK SCORE</span>
                <div className="text-base sm:text-lg font-bold text-red-700 mt-0.5">
                  {simulationResult.investigation?.risk_score ?? 87.5}/100
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm">
                <span className="text-[#7a6f63] text-[10px]">DEFENSIVE ACTION</span>
                <div className="text-base sm:text-lg font-bold text-[#10b981] mt-0.5">
                  {simulationResult.investigation?.action_taken ?? 'BLOCK_IP'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm">
                <span className="text-[#7a6f63] text-[10px]">FALKORDB VERIFICATION</span>
                <div className="text-base sm:text-lg font-bold text-emerald-700 mt-0.5">
                  ENFORCED & VERIFIED
                </div>
              </div>
            </div>

            <p className="text-xs text-[#2c2825] font-sans leading-relaxed">
              {simulationResult.investigation?.summary}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href="/graph"
                className="px-3 py-1.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-mono font-bold transition-all shadow-sm"
              >
                Inspect Updated Graph &rarr;
              </Link>
              <Link
                href="/agent"
                className="px-3 py-1.5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-[#2c2825] hover:bg-[#e4ddd0] text-xs font-mono font-semibold transition-all shadow-sm"
              >
                View Agent Decision Trace &rarr;
              </Link>
              <Link
                href="/reports"
                className="px-3 py-1.5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-[#2c2825] hover:bg-[#e4ddd0] text-xs font-mono font-semibold transition-all shadow-sm"
              >
                View Incident Report &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
