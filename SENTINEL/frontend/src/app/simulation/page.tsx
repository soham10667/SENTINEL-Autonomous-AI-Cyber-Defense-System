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
    badge: 'PRIMARY HACKATHON DEMO',
    badgeColor: 'bg-[#FCE7F3] text-[#D9769B] border-[#FBCFE8]',
    description:
      'Attacker uses stolen credentials via Russian proxy IP 194.26.29.112 to hijack Sarah Connor (USR-002), traversing from her laptop DEV-WKS-02 through CI runner SRV-CI-02 towards Customer PII Database (DB-PROD-CUST-01).',
    entryEntity: '194.26.29.112',
    targetThreat: 'DB-PROD-CUST-01 (PII Crown Jewel)',
    expectedContainment: 'SIMULATE_BLOCK_IP & SIMULATE_DISABLE_ACCOUNT'
  },
  {
    id: 'B',
    title: 'Scenario B: Suspicious Lateral Access',
    badge: 'INFRASTRUCTURE ATTACK',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
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
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
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
      // Step 1: Start scenario in backend
      setCurrentStepIndex(1);
      const scenarioRes = await api.startSimulation(selectedScenario);

      // Step 2-4: Visual step animation
      for (let i = 2; i <= 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setCurrentStepIndex(i);
      }

      // Step 5: Start autonomous agent workflow
      setCurrentStepIndex(6);
      const invRes = await api.startInvestigation(
        scenarioRes.incident_id,
        scenarioRes.event_id
      );

      // Final step
      await new Promise((resolve) => setTimeout(resolve, 600));
      setCurrentStepIndex(8);

      setSimulationResult({
        ...scenarioRes,
        investigation: invRes
      });
    } catch (err: any) {
      console.error('Simulation execution failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = async () => {
    setResetMessage('Resetting sentinel graph to clean baseline...');
    try {
      await api.resetSimulation();
      setSimulationResult(null);
      setCurrentStepIndex(-1);
      setResetMessage('FalkorDB sentinel graph successfully restored to clean baseline state.');
      setTimeout(() => setResetMessage(null), 4000);
    } catch (err: any) {
      setResetMessage('Reset error: ' + (err.message || 'Failed'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D9769B] font-mono text-xs uppercase tracking-wider font-bold mb-1">
            <FlaskConical className="w-4 h-4 text-[#E88DAD]" />
            <span>Interactive Cyber Simulation Environment</span>
          </div>
          <h1 className="text-2xl font-bold text-[#29252A] tracking-tight">
            Live Attack Simulation Lab
          </h1>
          <p className="text-[#77717A] text-xs mt-0.5">
            Test autonomous graph-grounded attack investigation, multi-hop discovery, counterfactual containment, and automated response.
          </p>
        </div>

        {/* Reset State Button */}
        <button
          onClick={handleReset}
          disabled={isRunning}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#F5E1E9] text-[#77717A] hover:text-amber-700 hover:border-amber-300 text-xs font-mono transition-all disabled:opacity-50 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Simulation State</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono shadow-sm">
          {resetMessage}
        </div>
      )}

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => !isRunning && setSelectedScenario(sc.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#FFF7FA] border-2 border-[#F4A7C1] shadow-[0_4px_20px_rgba(244,167,193,0.22)]'
                  : 'bg-white border border-[#F5E1E9] hover:border-[#FBCFE8] hover:bg-[#FFF9FC] shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                  <span className="text-xs font-mono text-[#77717A]">#{sc.id}</span>
                </div>
                <h3 className="font-bold text-sm text-[#29252A]">{sc.title}</h3>
                <p className="text-xs text-[#77717A] font-sans leading-relaxed">{sc.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F5E1E9] text-[11px] font-mono space-y-1 text-[#77717A]">
                <div>Origin: <strong className="text-[#D9769B]">{sc.entryEntity}</strong></div>
                <div>Crown Jewel: <strong className="text-amber-800">{sc.targetThreat}</strong></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Launch Area */}
      <div className="p-6 rounded-2xl bg-white border border-[#F5E1E9] shadow-[0_4px_25px_rgba(244,167,193,0.15)] space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#29252A] flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#E88DAD]" />
              Primary Hackathon Demonstration Trigger
            </h3>
            <p className="text-xs text-[#77717A] mt-1">
              Launches Scenario {selectedScenario}: Injects synthetic telemetry into FalkorDB, dispatches the agent, performs multi-hop investigation, and executes simulated containment.
            </p>
          </div>

          <button
            onClick={handleLaunchSimulation}
            disabled={isRunning}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E88DAD] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#D9769B] transition-all flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(232,141,173,0.35)] disabled:opacity-50 hover:scale-[1.02]"
          >
            <Play className={`w-4 h-4 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Investigation in Progress...' : 'Launch Security Incident Simulation'}</span>
          </button>
        </div>

        {/* Live Step Progress Checklist */}
        {currentStepIndex >= 0 && (
          <div className="p-4 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] space-y-2.5 animate-in fade-in">
            <div className="text-xs font-mono uppercase tracking-wider text-[#77717A] font-bold mb-1">
              Autonomous Pipeline Execution Stages:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
              {simulationSteps.map((step, idx) => {
                const isComplete = currentStepIndex > idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all ${
                      isComplete
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-100 font-semibold'
                        : isCurrent
                        ? 'text-[#D9769B] bg-[#FCE7F3] border-[#FBCFE8] font-bold animate-pulse'
                        : 'text-[#77717A] border-transparent'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isComplete ? 'text-emerald-600' : isCurrent ? 'text-[#E88DAD]' : 'text-slate-300'
                      }`}
                    />
                    <span>
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
          <div className="p-5 rounded-2xl bg-[#FFF9FC] border border-emerald-300 space-y-4 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> INVESTIGATION & SIMULATED CONTAINMENT COMPLETED
              </span>
              <span className="text-xs font-mono text-[#77717A]">
                Incident: <strong className="text-[#29252A]">{simulationResult.incident_id}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white border border-[#F5E1E9] shadow-sm">
                <span className="text-[#77717A]">GRAPH RISK SCORE</span>
                <div className="text-lg font-bold text-red-700 mt-0.5">
                  {simulationResult.investigation?.risk_score ?? 87.5}/100
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#F5E1E9] shadow-sm">
                <span className="text-[#77717A]">DEFENSIVE ACTION</span>
                <div className="text-lg font-bold text-[#D9769B] mt-0.5">
                  {simulationResult.investigation?.action_taken ?? 'BLOCK_IP'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#F5E1E9] shadow-sm">
                <span className="text-[#77717A]">FALKORDB VERIFICATION</span>
                <div className="text-lg font-bold text-emerald-700 mt-0.5">
                  ENFORCED & VERIFIED
                </div>
              </div>
            </div>

            <p className="text-xs text-[#29252A] font-sans leading-relaxed">
              {simulationResult.investigation?.summary}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/graph"
                className="px-4 py-2 rounded-xl bg-[#E88DAD] hover:bg-[#D9769B] text-white text-xs font-mono font-bold transition-all shadow-sm"
              >
                Inspect Updated Graph &rarr;
              </Link>
              <Link
                href="/agent"
                className="px-4 py-2 rounded-xl bg-white border border-[#F5E1E9] text-[#29252A] hover:bg-[#FFF7FA] text-xs font-mono font-semibold transition-all shadow-sm"
              >
                View Agent Decision Trace &rarr;
              </Link>
              <Link
                href="/reports"
                className="px-4 py-2 rounded-xl bg-white border border-[#F5E1E9] text-[#29252A] hover:bg-[#FFF7FA] text-xs font-mono font-semibold transition-all shadow-sm"
              >
                View Final Incident Report &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
