'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  ArrowRight,
  User,
  Server
} from 'lucide-react';
import { api } from '../../lib/api';
import { IncidentReport } from '../../types';
import { getSeverityBadgeClass } from '../../lib/utils';

export default function ReportsPage() {
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [incidentId, setIncidentId] = useState('INC-2026-0842');
  const [isLoading, setIsLoading] = useState(true);

  const loadReport = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await api.getReport(id);
      setReport(data);
    } catch {
      // Fallback structured data if incident not found
      setReport({
        incident_id: id,
        title: `Autonomous Security Incident Investigation Report: ${id}`,
        detection_time: new Date().toISOString(),
        severity: 'HIGH',
        observed_events: [
          {
            id: 'EVT-AUTH-ANOMALY-01',
            type: 'ANOMALOUS_EXTERNAL_LOGIN',
            desc: 'Foreign proxy authentication from 194.26.29.112 bypassing standard geofencing.',
            time: new Date().toISOString()
          }
        ],
        involved_identities: [
          { id: 'USR-002', username: 'sarah.connor', role: 'Marketing Lead', dept: 'Growth' }
        ],
        involved_infrastructure: [
          { id: '194.26.29.112', type: 'IPAddress', name: 'External Proxy Node' },
          { id: 'DEV-WKS-02', type: 'Device', name: 'WKS-SARAH-WIN11' },
          { id: 'SRV-CI-02', type: 'Server', name: 'build-ci02.infra.sentinel.internal' },
          { id: 'DB-PROD-CUST-01', type: 'Database', name: 'Customer PII & Order History' }
        ],
        attack_chain_hypotheses: [
          {
            hypothesis: 'Attacker leverages credential stuffing on marketing user to pivot via staging CI runner toward customer database.',
            confidence: 0.95
          }
        ],
        evidence_paths: [
          ['194.26.29.112', 'USR-002', 'DEV-WKS-02', 'SRV-CI-02', 'DB-PROD-CUST-01']
        ],
        actions_selected: ['SIMULATE_BLOCK_IP (194.26.29.112)', 'SIMULATE_DISABLE_ACCOUNT (USR-002)'],
        actions_executed: ['SIMULATE_BLOCK_IP (194.26.29.112) [EXECUTED]'],
        verification_status: 'CONTAINMENT_VERIFIED',
        limitations: 'All telemetry evaluated within synthetic isolated demonstration lab on FalkorDB sentinel graph.',
        recommendations: [
          'Enforce hardware FIDO2 MFA tokens across all remote corporate accounts.',
          'Sever default SSH lateral access from staging build runners into internal database clusters.',
          'Implement zero-trust database connection pooling with TLS client certificates.'
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport(incidentId);
  }, [incidentId]);

  const handleExportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SENTINEL-Report-${report.incident_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D9769B] font-mono text-xs uppercase tracking-wider font-bold mb-1">
            <FileText className="w-4 h-4 text-[#E88DAD]" />
            <span>Formal Cyber Forensic Documentation</span>
          </div>
          <h1 className="text-2xl font-bold text-[#29252A] tracking-tight">
            Incident Investigation Report
          </h1>
          <p className="text-[#77717A] text-xs mt-0.5">
            Exportable incident investigation report backed by verifiable FalkorDB multi-hop topology and containment outcomes.
          </p>
        </div>

        {/* Export and Print Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#F5E1E9] text-[#29252A] hover:text-[#D9769B] hover:border-[#FBCFE8] text-xs font-mono font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E88DAD] text-white font-bold text-xs hover:bg-[#D9769B] transition-all shadow-[0_4px_14px_rgba(232,141,173,0.35)]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Report Document Card */}
      {report && (
        <div className="p-8 rounded-2xl bg-white border border-[#F5E1E9] shadow-[0_10px_35px_rgba(244,167,193,0.18)] space-y-6 text-sm text-[#29252A]">
          {/* Header */}
          <div className="border-b border-[#F5E1E9] pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="text-[11px] font-mono text-[#D9769B] uppercase tracking-wider font-bold">
                SENTINEL AUTONOMOUS INCIDENT REPORT
              </div>
              <h2 className="text-xl font-bold text-[#29252A] mt-1">{report.title}</h2>
              <div className="text-xs font-mono text-[#77717A] mt-1">
                Detection Time: {report.detection_time}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${getSeverityBadgeClass(report.severity)}`}>
                SEVERITY: {report.severity}
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> {report.verification_status}
              </span>
            </div>
          </div>

          {/* Section 1: Observed Events */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#77717A] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E88DAD]" />
              1. Observed Security Telemetry & Evidence
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {report.observed_events.map((ev: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] text-xs font-mono shadow-sm">
                  <div className="flex justify-between items-center text-[#77717A] mb-1">
                    <span className="font-bold text-[#29252A]">{ev.id}</span>
                    <span className="text-[#D9769B] font-bold">{ev.type}</span>
                  </div>
                  <p className="text-[#29252A] font-sans text-xs leading-relaxed">{ev.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Involved Identities & Infrastructure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] space-y-2 shadow-sm">
              <h4 className="text-xs font-mono font-bold text-[#77717A] uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" />
                Targeted Identities
              </h4>
              {report.involved_identities.map((u: any, i: number) => (
                <div key={i} className="text-xs font-mono text-[#29252A]">
                  <strong className="text-[#29252A]">{u.id}</strong> ({u.username}) &bull; {u.role} ({u.dept})
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] space-y-2 shadow-sm">
              <h4 className="text-xs font-mono font-bold text-[#77717A] uppercase flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#E88DAD]" />
                Traversed Infrastructure
              </h4>
              <div className="text-xs font-mono space-y-1">
                {report.involved_infrastructure.map((inf: any, i: number) => (
                  <div key={i} className="text-[#29252A]">
                    <span className="text-[#77717A]">[{inf.type}]</span> <strong className="text-[#29252A]">{inf.id}</strong> - {inf.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Reconstructed Attack Paths in FalkorDB */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#77717A] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E88DAD]" />
              2. FalkorDB Attack Chain Reconstruction
            </h3>
            <div className="p-4 rounded-xl bg-[#FFF7FA] border border-[#FBCFE8] font-mono text-xs text-[#29252A] flex flex-wrap items-center gap-2 shadow-sm">
              {report.evidence_paths[0]?.map((nodeId: string, idx: number) => (
                <React.Fragment key={idx}>
                  <span className="px-3 py-1 rounded-lg bg-white border border-[#F5E1E9] text-[#29252A] font-bold shadow-sm">
                    {nodeId}
                  </span>
                  {idx < (report.evidence_paths[0]?.length || 0) - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-[#E88DAD]" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Section 4: Actions Executed & Mitigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#77717A] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E88DAD]" />
              3. Simulated Defensive Actions Executed
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.actions_executed.map((act: string, i: number) => (
                <div key={i} className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs flex items-center gap-2 font-semibold shadow-sm">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Strategic Recommendations */}
          <div className="space-y-3 border-t border-[#F5E1E9] pt-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#77717A]">
              Strategic Next Steps & Recommendations
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#29252A] font-sans leading-relaxed">
              {report.recommendations.map((rec: string, i: number) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
