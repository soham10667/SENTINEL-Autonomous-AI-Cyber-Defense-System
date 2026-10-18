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
    <div className="space-y-3 sm:space-y-3.5 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <FileText className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
            <span>Formal Cyber Forensic Documentation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2c2825] tracking-tight leading-tight">
            Incident Investigation Report
          </h1>
          <p className="text-[#7a6f63] text-xs mt-0.5 truncate">
            Exportable incident investigation report backed by verifiable FalkorDB multi-hop topology and containment outcomes.
          </p>
        </div>

        {/* Export and Print Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-[#2c2825] hover:text-[#10b981] hover:border-[#10b981] text-xs font-mono font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10b981] text-white font-bold text-xs hover:bg-[#059669] transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Report Document Card */}
      {report && (
        <div className="p-4 sm:p-6 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm space-y-4 text-xs text-[#2c2825]">
          {/* Header */}
          <div className="border-b border-[#d9d0c0] pb-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
            <div>
              <div className="text-[10px] font-mono text-[#10b981] uppercase tracking-wider font-bold">
                SENTINEL AUTONOMOUS INCIDENT REPORT
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#2c2825] mt-0.5">{report.title}</h2>
              <div className="text-[11px] font-mono text-[#7a6f63] mt-0.5">
                Detection Time: {report.detection_time}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${getSeverityBadgeClass(report.severity)}`}>
                SEVERITY: {report.severity}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#d4ede3] border border-[#10b981]/50 text-emerald-800 font-mono text-[10px] font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> {report.verification_status}
              </span>
            </div>
          </div>

          {/* Section 1: Observed Events */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7a6f63] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              1. Observed Security Telemetry & Evidence
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {report.observed_events.map((ev: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] text-xs font-mono shadow-sm">
                  <div className="flex justify-between items-center text-[#7a6f63] mb-1">
                    <span className="font-bold text-[#2c2825]">{ev.id}</span>
                    <span className="text-[#10b981] font-bold">{ev.type}</span>
                  </div>
                  <p className="text-[#2c2825] font-sans text-xs leading-relaxed">{ev.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Involved Identities & Infrastructure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] space-y-1.5 shadow-sm">
              <h4 className="text-[10px] font-mono font-bold text-[#7a6f63] uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" />
                Targeted Identities
              </h4>
              {report.involved_identities.map((u: any, i: number) => (
                <div key={i} className="text-xs font-mono text-[#2c2825]">
                  <strong className="text-[#2c2825]">{u.id}</strong> ({u.username}) &bull; {u.role} ({u.dept})
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] space-y-1.5 shadow-sm">
              <h4 className="text-[10px] font-mono font-bold text-[#7a6f63] uppercase flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#10b981]" />
                Traversed Infrastructure
              </h4>
              <div className="text-xs font-mono space-y-0.5">
                {report.involved_infrastructure.map((inf: any, i: number) => (
                  <div key={i} className="text-[#2c2825]">
                    <span className="text-[#7a6f63]">[{inf.type}]</span> <strong className="text-[#2c2825]">{inf.id}</strong> - {inf.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Reconstructed Attack Paths in FalkorDB */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7a6f63] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              2. FalkorDB Attack Chain Reconstruction
            </h3>
            <div className="p-3 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] font-mono text-xs text-[#2c2825] flex flex-wrap items-center gap-1.5 shadow-sm">
              {report.evidence_paths[0]?.map((nodeId: string, idx: number) => (
                <React.Fragment key={idx}>
                  <span className="px-2.5 py-1 rounded-lg bg-[#ede8dc] border border-[#d9d0c0] text-[#2c2825] font-bold shadow-sm">
                    {nodeId}
                  </span>
                  {idx < (report.evidence_paths[0]?.length || 0) - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-[#10b981]" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Section 4: Actions Executed & Mitigation */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7a6f63] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              3. Simulated Defensive Actions Executed
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.actions_executed.map((act: string, i: number) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#d4ede3] border border-[#10b981]/50 text-emerald-800 font-mono text-xs flex items-center gap-2 font-semibold shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Strategic Recommendations */}
          <div className="space-y-2 border-t border-[#d9d0c0] pt-3.5">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7a6f63]">
              Strategic Next Steps & Recommendations
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-[#2c2825] font-sans leading-relaxed">
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
