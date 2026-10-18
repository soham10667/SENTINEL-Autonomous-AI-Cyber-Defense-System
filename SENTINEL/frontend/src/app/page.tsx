'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Server,
  AlertTriangle,
  UserX,
  Laptop,
  CheckCircle,
  PlayCircle,
  ArrowUpRight,
  Activity,
  Layers,
  Database
} from 'lucide-react';
import { api } from '../lib/api';
import { DashboardSummary, SecurityEvent } from '../types';
import { getSeverityBadgeClass, formatTimestamp } from '../lib/utils';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDashboardSummary();
      setSummary(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard summary');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: 'Monitored Graph Assets',
      value: summary?.total_assets ?? 0,
      sub: 'Servers, Devices, DBs & Apps',
      icon: Server,
      color: 'text-[#10b981]',
      border: 'border-[#d9d0c0]'
    },
    {
      title: 'Active Incidents',
      value: summary?.active_incidents ?? 0,
      sub: 'Under Autonomous Watch',
      icon: ShieldAlert,
      color: 'text-red-500',
      border: 'border-[#d9d0c0]'
    },
    {
      title: 'Critical Threat Alerts',
      value: summary?.critical_alerts ?? 0,
      sub: 'High-Risk Telemetry',
      icon: AlertTriangle,
      color: 'text-orange-500',
      border: 'border-[#d9d0c0]'
    },
    {
      title: 'Suspicious Identities',
      value: summary?.suspicious_identities ?? 0,
      sub: 'Compromised / Suspended',
      icon: UserX,
      color: 'text-purple-400',
      border: 'border-[#d9d0c0]'
    },
    {
      title: 'Isolated Endpoints',
      value: summary?.compromised_devices ?? 0,
      sub: 'Network Quarantined',
      icon: Laptop,
      color: 'text-blue-400',
      border: 'border-[#d9d0c0]'
    },
    {
      title: 'Containment Actions',
      value: summary?.containment_actions_count ?? 0,
      sub: 'Graph-Verified Enforced',
      icon: CheckCircle,
      color: 'text-emerald-400',
      border: 'border-[#d9d0c0]'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Clean Top Page Header & Quick Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 text-[#10b981] font-mono text-xs uppercase tracking-wider font-bold mb-1">
            <Activity className="w-3.5 h-3.5 text-[#10b981] animate-pulse" />
            <span>Real-Time Autonomous Security Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2c2825] tracking-tight">
            SENTINEL Command Center
          </h1>
          <p className="text-[#7a6f63] text-xs mt-0.5 max-w-2xl">
            Autonomous defensive agent continuously investigating security telemetry across interconnected infrastructure using FalkorDB graph intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/simulation"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10b981] text-[#f5f0e8] font-bold text-xs hover:bg-[#059669] transition-all shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:scale-[1.02]"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Launch Attack Simulation</span>
          </Link>
          <Link
            href="/graph"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-[#2c2825] font-semibold text-xs hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm"
          >
            <Database className="w-4 h-4 text-[#10b981]" />
            <span>Explore Graph</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-[#ede8dc] border ${s.border} flex flex-col justify-between shadow-[0_2px_12px_rgba(0,212,255,0.06)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.12)] transition-all`}
            >
              <div className="flex items-center justify-between text-[#7a6f63]">
                <span className="text-[11px] font-mono uppercase tracking-wide truncate">{s.title}</span>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="my-2">
                <div className={`text-2xl font-bold font-mono text-[#2c2825] ${isLoading ? 'animate-pulse' : ''}`}>
                  {s.value}
                </div>
              </div>
              <div className="text-[10px] text-[#7a6f63] font-mono truncate">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Middle Section: Threat Distribution & Graph Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Severity Distribution */}
        <div className="p-6 rounded-2xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#2c2825] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#10b981]" />
              Risk Severity Spectrum
            </h3>
            <span className="text-[10px] font-mono text-[#7a6f63] uppercase font-semibold">Live Distribution</span>
          </div>

          <div className="space-y-3.5 my-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-red-400 font-bold">CRITICAL EXPOSURE</span>
                <span className="text-[#2c2825] font-bold">2 Assets</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#ddd7ca] border border-[#d9d0c0] overflow-hidden">
                <div className="h-full bg-red-500 w-[25%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-orange-400 font-bold">HIGH SEVERITY</span>
                <span className="text-[#2c2825] font-bold">4 Assets</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#ddd7ca] border border-[#d9d0c0] overflow-hidden">
                <div className="h-full bg-orange-500 w-[45%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-amber-400 font-bold">MEDIUM RISK</span>
                <span className="text-[#2c2825] font-bold">8 Assets</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#ddd7ca] border border-[#d9d0c0] overflow-hidden">
                <div className="h-full bg-amber-500 w-[70%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-blue-400 font-bold">LOW / MONITORED</span>
                <span className="text-[#2c2825] font-bold">14 Assets</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#ddd7ca] border border-[#d9d0c0] overflow-hidden">
                <div className="h-full bg-blue-500 w-[95%]" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#d9d0c0] text-[11px] font-mono text-[#7a6f63] flex items-center justify-between">
            <span>Primary Crown Jewel:</span>
            <span className="text-amber-400 font-bold bg-amber-900/30 px-2 py-0.5 rounded border border-amber-800">DB-PROD-CUST-01</span>
          </div>
        </div>

        {/* FalkorDB Graph Intelligence Card */}
        <div className="p-6 rounded-2xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#2c2825] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#10b981]" />
                FalkorDB Graph-Grounded Investigation Engine
              </h3>
              <p className="text-xs text-[#7a6f63] mt-0.5">
                Multi-hop traversal identifies unreachable blast radius and prevents alert fatigue.
              </p>
            </div>
            <Link
              href="/agent"
              className="text-xs font-mono text-[#10b981] hover:text-[#34d399] font-bold flex items-center gap-1"
            >
              Agent Ops <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] space-y-1">
              <span className="text-[#7a6f63] text-[10px] uppercase font-bold">1. Telemetry Ingestion</span>
              <p className="text-[#2c2825] font-sans text-xs">
                Events linked to origin entities (IP, User, Device) with verified timestamps.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] space-y-1">
              <span className="text-[#10b981] text-[10px] uppercase font-bold">2. Multi-Hop Cypher</span>
              <p className="text-[#2c2825] font-sans text-xs">
                Traverses up to 4 hops separating observed breach activity from inferred risk.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] space-y-1">
              <span className="text-emerald-400 text-[10px] uppercase font-bold">3. Counterfactual Proof</span>
              <p className="text-[#2c2825] font-sans text-xs">
                Calculates before vs after risk reduction before applying simulated containment.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#e4ddd0] border border-[#d9d0c0] flex items-center justify-between text-xs font-mono">
            <span className="text-[#7a6f63]">CURRENT TARGET GRAPH:</span>
            <span className="text-[#10b981] font-bold">sentinel (Live FalkorDB Graph)</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Security Telemetry Stream */}
      <div className="p-6 rounded-2xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#10b981]" />
            <h3 className="text-sm font-bold text-[#2c2825]">Live Telemetry & Ingested Security Events</h3>
          </div>
          <Link
            href="/monitor"
            className="text-xs font-mono text-[#10b981] hover:text-[#34d399] font-bold flex items-center gap-1"
          >
            Open Live Monitor &rarr;
          </Link>
        </div>

        {summary?.recent_events && summary.recent_events.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[#d9d0c0]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#d9d0c0] text-[#7a6f63] bg-[#e8e2d6]">
                <tr>
                  <th className="py-2.5 px-3">EVENT ID</th>
                  <th className="py-2.5 px-3">SEVERITY</th>
                  <th className="py-2.5 px-3">TYPE</th>
                  <th className="py-2.5 px-3">DESCRIPTION</th>
                  <th className="py-2.5 px-3">SOURCE</th>
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9d0c0]">
                {summary.recent_events.map((ev: SecurityEvent) => (
                  <tr key={ev.id} className="hover:bg-[#e8e2d6] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#2c2825]">{ev.id}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadgeClass(ev.severity)}`}>
                        {ev.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#10b981] font-bold">{ev.event_type}</td>
                    <td className="py-3 px-3 text-[#2c2825] font-sans max-w-md truncate">{ev.description}</td>
                    <td className="py-3 px-3 text-[#7a6f63]">{ev.raw_source}</td>
                    <td className="py-3 px-3 text-[#7a6f63]">{formatTimestamp(ev.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-[#7a6f63] font-mono text-xs rounded-xl bg-[#e8e2d6] border border-[#d9d0c0]">
            No events ingested yet. Launch a simulation scenario in the Simulation Lab to generate events.
          </div>
        )}
      </div>
    </div>
  );
}

