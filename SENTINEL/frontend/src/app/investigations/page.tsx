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
    <div className="space-y-3 sm:space-y-3.5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <Search className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
            <span>Multi-Hop Graph Forensics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2c2825] tracking-tight leading-tight">
            Attack Chain Reconstruction & Investigations
          </h1>
          <p className="text-[#7a6f63] text-xs mt-0.5 truncate">
            Traverse FalkorDB topology to discover blast radius, distinguish observed evidence from inferred paths, and identify crown jewels.
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
        {/* Left: Active Incidents List (4 columns on lg) */}
        <div className="lg:col-span-4 p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm space-y-3 min-w-0">
          <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-2.5">
            <span className="text-xs font-bold text-[#2c2825] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#10b981]" />
              Active Incidents
            </span>
            <span className="text-[10px] font-mono text-[#7a6f63] font-semibold">
              {incidents.length} Records
            </span>
          </div>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {incidents.length > 0 ? (
              incidents.map((inc: Incident) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => handleSelectIncident(inc)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-[#d4ede3]/40 border-[#10b981] shadow-sm'
                        : 'bg-[#e8e2d6]/60 border-[#d9d0c0] hover:border-[#b8ada0] hover:bg-[#e8e2d6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#2c2825]">{inc.id}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${getSeverityBadgeClass(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-[#2c2825] truncate">{inc.title}</div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#7a6f63] pt-1 border-t border-[#d9d0c0]">
                      <span>Status: <strong className="text-[#10b981]">{inc.status}</strong></span>
                      <span>Risk: <strong className="text-red-700">{inc.risk_score}</strong>/100</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-[#7a6f63] font-mono text-xs rounded-xl bg-[#e8e2d6] border border-[#d9d0c0]">
                No active incidents found. Launch a scenario from the Simulation Lab.
              </div>
            )}
          </div>
        </div>

        {/* Right: Multi-hop Attack Chain Analysis (8 columns on lg) */}
        <div className="lg:col-span-8 p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm space-y-3 min-w-0">
          <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-2.5">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#2c2825] flex items-center gap-1.5">
                <GitFork className="w-4 h-4 text-[#10b981]" />
                Multi-Hop Attack Path Reconstruction
              </h3>
              <p className="text-[11px] text-[#7a6f63] mt-0.5 truncate">
                Evaluated paths leading from breach entry origin towards critical assets.
              </p>
            </div>
            <Link
              href="/agent"
              className="text-xs font-mono px-3 py-1 rounded-xl bg-[#d4ede3] border border-[#10b981]/50 text-emerald-800 font-bold hover:bg-[#bbf0db] transition-all shadow-sm shrink-0"
            >
              Agent Trace &rarr;
            </Link>
          </div>

          {/* Observed vs Inferred Concept Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#d4ede3]/50 border border-[#10b981]/40 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <strong className="text-emerald-800 text-[11px]">Observed Evidence:</strong>
                <p className="text-[10px] text-emerald-700 font-sans truncate">
                  Confirmed network authentication sessions and logs.
                </p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100/60 border border-amber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <div className="min-w-0">
                <strong className="text-amber-800 text-[11px]">Inferred Reachability:</strong>
                <p className="text-[10px] text-amber-700 font-sans truncate">
                  Multi-hop access permissions and lateral pivoting routes.
                </p>
              </div>
            </div>
          </div>

          {/* Paths Display */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a6f63] font-bold">
              Discovered Multi-Hop Access Paths ({attackPaths.length})
            </div>

            {attackPaths.length > 0 ? (
              attackPaths.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] hover:border-[#b8ada0] transition-all space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#7a6f63] font-bold">Path #{idx + 1}</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#ede8dc] text-[#2c2825] border border-[#d9d0c0] text-[10px] font-semibold">
                        {p.hop_count} Hops
                      </span>
                      {p.is_crown_jewel && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                          CROWN JEWEL THREAT
                        </span>
                      )}
                    </div>
                    <span className="text-[#7a6f63] text-[11px]">
                      Target: <strong className="text-[#2c2825]">{p.target_id}</strong>
                    </span>
                  </div>

                  {/* Visual Node Chain */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                    {p.nodes &&
                      p.nodes.map((node: any, nIdx: number) => (
                        <React.Fragment key={nIdx}>
                          <div
                            className={`px-2.5 py-1 rounded-lg border flex flex-col items-center ${
                              node.criticality === 'CRITICAL'
                                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm'
                                : 'bg-[#ede8dc] border-[#d9d0c0] text-[#2c2825] shadow-sm'
                            }`}
                          >
                            <span className="text-[8px] text-[#7a6f63] uppercase font-bold">{node.label}</span>
                            <span className="font-bold text-[11px] truncate max-w-[120px]">{node.name || node.id}</span>
                          </div>
                          {nIdx < p.nodes.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[#7a6f63] font-mono text-xs rounded-xl bg-[#e8e2d6] border border-[#d9d0c0]">
                {isLoadingPaths ? 'Analyzing FalkorDB graph traversals...' : 'No multi-hop attack routes currently active.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
