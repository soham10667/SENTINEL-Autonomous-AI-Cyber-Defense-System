'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ShieldAlert,
  GitFork,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Incident } from '../../types';
import { getSeverityBadgeClass } from '../../lib/utils';

export default function InvestigationsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [attackPaths, setAttackPaths] = useState<any[]>([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(false);

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await api.getIncidents();
        setIncidents(data);
        if (data.length > 0) {
          setSelectedIncident(data[0]);
          loadPathsForIncident(data[0]);
        }
      } catch (err) {
        console.error('Error loading incidents:', err);
      }
    };
    loadIncidents();
  }, []);

  const loadPathsForIncident = async (inc: Incident) => {
    setIsLoadingPaths(true);
    try {
      // Trace attack paths from proxy IP or identity
      const res = await api.getAttackPaths('194.26.29.112');
      setAttackPaths(res.paths || []);
    } catch {
      setAttackPaths([]);
    } finally {
      setIsLoadingPaths(false);
    }
  };

  const handleSelectIncident = (inc: Incident) => {
    setSelectedIncident(inc);
    loadPathsForIncident(inc);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <div className="flex items-center gap-2 text-[#D9769B] font-mono text-xs uppercase tracking-wider font-bold mb-1">
          <Search className="w-4 h-4 text-[#E88DAD]" />
          <span>Multi-Hop Graph Forensics</span>
        </div>
        <h1 className="text-2xl font-bold text-[#29252A] tracking-tight">
          Attack Chain Reconstruction & Investigations
        </h1>
        <p className="text-[#77717A] text-xs mt-0.5">
          Traverse FalkorDB topology to discover blast radius, distinguish observed evidence from inferred paths, and identify crown jewels.
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Incidents List */}
        <div className="p-6 rounded-2xl bg-white border border-[#F5E1E9] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5E1E9] pb-3">
            <span className="text-xs font-bold text-[#29252A] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#E88DAD]" />
              Incidents Under Investigation
            </span>
            <span className="text-[10px] font-mono text-[#77717A] font-semibold">
              {incidents.length} Records
            </span>
          </div>

          <div className="space-y-2.5">
            {incidents.length > 0 ? (
              incidents.map((inc: Incident) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => handleSelectIncident(inc)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-[#FFF7FA] border-[#F4A7C1] shadow-[0_2px_12px_rgba(244,167,193,0.18)]'
                        : 'bg-[#FFF9FC]/50 border-[#F5E1E9] hover:border-[#FBCFE8] hover:bg-[#FFF9FC]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#29252A]">{inc.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getSeverityBadgeClass(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-[#29252A]">{inc.title}</div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#77717A] pt-1.5 border-t border-[#F5E1E9]">
                      <span>Status: <strong className="text-[#D9769B]">{inc.status}</strong></span>
                      <span>Risk: <strong className="text-red-700">{inc.risk_score}</strong>/100</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-[#77717A] font-mono text-xs rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
                No active incidents found. Launch a scenario from the Simulation Lab.
              </div>
            )}
          </div>
        </div>

        {/* Right: Multi-hop Attack Chain Analysis */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#F5E1E9] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#F5E1E9] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#29252A] flex items-center gap-2">
                <GitFork className="w-4 h-4 text-[#E88DAD]" />
                Multi-Hop Attack Path Reconstruction
              </h3>
              <p className="text-xs text-[#77717A] mt-0.5">
                Evaluated paths leading from breach entry origin towards critical assets.
              </p>
            </div>
            <Link
              href="/agent"
              className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-[#FCE7F3] border border-[#FBCFE8] text-[#D9769B] font-bold hover:bg-[#FBCFE8] transition-all shadow-sm"
            >
              View Agent Trace &rarr;
            </Link>
          </div>

          {/* Observed vs Inferred Concept Badge */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <strong className="text-emerald-800">Observed Evidence:</strong>
                <p className="text-[11px] text-emerald-700 font-sans mt-0.5">
                  Confirmed network authentication sessions and verified execution logs.
                </p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <div>
                <strong className="text-amber-800">Inferred Reachability:</strong>
                <p className="text-[11px] text-amber-700 font-sans mt-0.5">
                  Multi-hop access permissions and lateral pivoting routes at risk.
                </p>
              </div>
            </div>
          </div>

          {/* Paths Display */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#77717A] font-bold">
              Discovered Multi-Hop Access Paths ({attackPaths.length})
            </div>

            {attackPaths.length > 0 ? (
              attackPaths.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] hover:border-[#F4A7C1] transition-all space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[#77717A] font-bold">Path #{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded bg-white text-[#29252A] border border-[#F5E1E9] text-[10px] font-semibold">
                        {p.hop_count} Hops
                      </span>
                      {p.is_crown_jewel && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          CROWN JEWEL THREAT
                        </span>
                      )}
                    </div>
                    <span className="text-[#77717A]">
                      Target: <strong className="text-[#29252A]">{p.target_id}</strong>
                    </span>
                  </div>

                  {/* Visual Node Chain */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    {p.nodes &&
                      p.nodes.map((node: any, nIdx: number) => (
                        <React.Fragment key={nIdx}>
                          <div
                            className={`px-3 py-1.5 rounded-lg border flex flex-col items-center ${
                              node.criticality === 'CRITICAL'
                                ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm'
                                : 'bg-white border-[#F5E1E9] text-[#29252A] shadow-sm'
                            }`}
                          >
                            <span className="text-[9px] text-[#77717A] uppercase">{node.label}</span>
                            <span className="font-bold">{node.name || node.id}</span>
                          </div>
                          {nIdx < p.nodes.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-[#E88DAD] shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#77717A] font-mono text-xs rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
                {isLoadingPaths ? 'Analyzing FalkorDB graph traversals...' : 'No multi-hop attack routes currently active.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
