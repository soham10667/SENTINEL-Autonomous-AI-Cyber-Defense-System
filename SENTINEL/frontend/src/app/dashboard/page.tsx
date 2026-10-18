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
  Database,
  Shield,
  Radio
} from 'lucide-react';
import { api, getStoredAuth } from '../../lib/api';
import { DashboardSummary, SecurityEvent } from '../../types';
import { getSeverityBadgeClass, formatTimestamp } from '../../lib/utils';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [graphHealth, setGraphHealth] = useState<{
    connected: boolean;
    graph?: string;
    node_count?: number;
    relationship_count?: number;
    latency_ms?: number;
    host?: string;
    port?: number;
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check operator authentication
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored.user) {
      setCurrentUser(stored.user);
    }
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, healthRes] = await Promise.allSettled([
        api.getDashboardSummary(),
        api.getGraphHealth()
      ]);

      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value);
        setError(null);
      } else {
        setError(sumRes.reason?.message || 'Failed to load dashboard summary');
      }

      if (healthRes.status === 'fulfilled') {
        setGraphHealth(healthRes.value);
        if (!healthRes.value.connected && healthRes.value.error) {
          setError(healthRes.value.error);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
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
      value: (graphHealth?.node_count !== undefined ? graphHealth.node_count : summary?.total_assets) ?? 0,
      sub: 'Servers, DBs & Apps',
      icon: Server,
      color: 'text-[#10b981]',
      border: 'border-[#d9d0c0]'
    },
    {
      title: 'Active Incidents',
      value: summary?.active_incidents ?? 0,
      sub: 'Autonomous Watch',
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
      sub: 'Compromised / Flagged',
      icon: UserX,
      color: 'text-purple-600',
      border: 'border-[#d9d0c0]'
    },
    {
      title: 'Isolated Endpoints',
      value: summary?.compromised_devices ?? 0,
      sub: 'Quarantined Nodes',
      icon: Laptop,
      color: 'text-blue-500',
      border: 'border-[#d9d0c0]'
    },
    {
      title: 'Containment Actions',
      value: summary?.containment_actions_count ?? 0,
      sub: 'Graph-Verified Enforced',
      icon: CheckCircle,
      color: 'text-emerald-600',
      border: 'border-[#d9d0c0]'
    }
  ];

  return (
    <div className="space-y-3.5 sm:space-y-4">

      {/* FalkorDB Connection Warning Banner if offline */}
      {graphHealth && !graphHealth.connected && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-red-900 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <div>
              <p className="font-bold">FalkorDB Database Disconnected</p>
              <p className="text-[11px] text-red-700 mt-0.5">
                {graphHealth.error || `Unable to reach FalkorDB on ${graphHealth.host || '127.0.0.1'}:${graphHealth.port || 6379}. Verify Docker container is running.`}
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-white border border-red-300 rounded-xl font-bold text-red-700 hover:bg-red-50 transition-colors shrink-0 shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Page Header & Quick Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <Activity className="w-3.5 h-3.5 text-[#10b981] animate-pulse shrink-0" />
            <span className="truncate">Real-Time Autonomous Security Operations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2c2825] tracking-tight leading-tight">
            SENTINEL Command Center
          </h1>
          <p className="text-[#7a6f63] text-xs mt-0.5 max-w-2xl line-clamp-1 sm:line-clamp-none">
            Autonomous defensive agent continuously investigating security telemetry across interconnected infrastructure using FalkorDB graph intelligence.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/simulation"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10b981] text-[#f5f0e8] font-bold text-xs hover:bg-[#059669] transition-all shadow-[0_2px_10px_rgba(16,185,129,0.3)] hover:scale-[1.01]"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Launch Simulation</span>
          </Link>
          <Link
            href="/graph"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-[#2c2825] font-semibold text-xs hover:text-[#10b981] hover:border-[#10b981] transition-all shadow-sm"
          >
            <Database className="w-4 h-4 text-[#10b981]" />
            <span>Explore Graph</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 lg:gap-3">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl bg-[#ede8dc] border ${s.border} flex flex-col justify-between h-full min-w-0 shadow-sm hover:shadow transition-all`}
            >
              <div className="flex items-center justify-between text-[#7a6f63] gap-1 mb-1">
                <span
                  className="text-[10px] sm:text-[11px] font-mono uppercase tracking-tight text-[#63584e] font-semibold truncate leading-tight"
                  title={s.title}
                >
                  {s.title}
                </span>
                <Icon className={`w-3.5 h-3.5 shrink-0 ${s.color}`} />
              </div>
              <div className="my-1">
                <div
                  className={`text-xl sm:text-2xl font-bold font-mono text-[#2c2825] leading-none ${
                    isLoading ? 'animate-pulse' : ''
                  }`}
                >
                  {s.value}
                </div>
              </div>
              <div className="text-[10px] text-[#7a6f63] font-mono truncate leading-normal" title={s.sub}>
                {s.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Section: Risk Severity Spectrum & FalkorDB Engine Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
        {/* Threat Severity Distribution */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm flex flex-col justify-between lg:col-span-5 xl:col-span-4 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-[#2c2825] flex items-center gap-1.5 truncate">
              <Layers className="w-4 h-4 text-[#10b981] shrink-0" />
              Risk Severity Spectrum
            </h3>
            <span className="text-[9px] font-mono text-[#7a6f63] uppercase font-bold tracking-wider shrink-0 bg-[#e4ddd0] px-1.5 py-0.5 rounded border border-[#d9d0c0]">
              LIVE STATUS
            </span>
          </div>

          <div className="space-y-2.5 my-1">
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-0.5">
                <span className="text-red-600 font-bold">CRITICAL EXPOSURE</span>
                <span className="text-[#2c2825] font-bold">
                  {summary?.risk_distribution?.CRITICAL ?? 0} Assets
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#ddd7ca] border border-[#d9d0c0] overflow-hidden">
                <div className="h-full bg-red-500 w-[25%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-0.5">
                <span className="text-orange-600 font-bold">HIGH SEVERITY</span>
                <span className="text-[#2c2825] font-bold">
                  {summary?.risk_distribution?.HIGH ?? 0} Assets
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#ddd7ca] border border-[#d9d0c0] overflow-hidden">
                <div className="h-full bg-orange-500 w-[45%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-0.5">
                <span className="text-amber-600 font-bold">MEDIUM RISK</span>
                <span className="text-[#2c2825] font-bold">
                  {summary?.risk_distribution?.MEDIUM ?? 0} Assets
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#ddd7ca] border border-[#d9d0c0] overflow-hidden">
                <div className="h-full bg-amber-500 w-[70%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-0.5">
                <span className="text-blue-600 font-bold">LOW / MONITORED</span>
                <span className="text-[#2c2825] font-bold">
                  {summary?.risk_distribution?.LOW ?? 0} Assets
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#ddd7ca] border border-[#d9d0c0] overflow-hidden">
                <div className="h-full bg-blue-500 w-[95%]" />
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#d9d0c0] text-[10px] font-mono text-[#7a6f63] flex items-center justify-between">
            <span className="truncate">Primary Crown Jewel:</span>
            <span className="text-amber-800 font-bold bg-amber-100/60 px-2 py-0.5 rounded border border-amber-300 shrink-0">
              DB-PROD-CUST-01 (PII)
            </span>
          </div>
        </div>

        {/* FalkorDB Graph Engine Status */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm flex flex-col justify-between lg:col-span-7 xl:col-span-8 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-[#2c2825] flex items-center gap-1.5 truncate">
              <Database className="w-4 h-4 text-[#10b981] shrink-0" />
              FalkorDB Graph Engine Grounding
            </h3>
            {graphHealth?.connected ? (
              <span className="text-[10px] font-mono text-emerald-800 bg-[#d4ede3] border border-[#10b981]/60 px-2 py-0.5 rounded-md font-bold shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CONNECTED :{graphHealth?.port || 6379}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md font-bold shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                OFFLINE :{graphHealth?.port || 6379}
              </span>
            )}
          </div>

          <p className="text-xs text-[#7a6f63] leading-relaxed my-1">
            SENTINEL continuously traverses identities, endpoint sessions, and sensitive databases using high-throughput Cypher. All defensive decisions are strictly grounded on live topological relationships.
          </p>

          <div className="grid grid-cols-3 gap-2 my-2">
            <div className="p-2.5 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0] text-center min-w-0">
              <span className="block text-[10px] font-mono text-[#7a6f63] uppercase truncate">Target Graph</span>
              <span className="text-xs sm:text-sm font-bold font-mono text-[#2c2825] truncate">
                {graphHealth?.graph || 'sentinel'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0] text-center min-w-0">
              <span className="block text-[10px] font-mono text-[#7a6f63] uppercase truncate">Cypher Latency</span>
              <span className="text-xs sm:text-sm font-bold font-mono text-[#10b981] truncate">
                {graphHealth?.latency_ms !== undefined ? `${graphHealth.latency_ms} ms` : '< 2ms'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0] text-center min-w-0">
              <span className="block text-[10px] font-mono text-[#7a6f63] uppercase truncate">Topology Verified</span>
              <span className="text-xs sm:text-sm font-bold font-mono text-[#2c2825] truncate">
                {graphHealth?.node_count !== undefined ? graphHealth.node_count : (summary?.total_assets ?? 0)}N / {graphHealth?.relationship_count !== undefined ? graphHealth.relationship_count : 0}R
              </span>
            </div>
          </div>

          <div className="mt-1 pt-2 border-t border-[#d9d0c0] flex items-center justify-between text-xs">
            <span className="text-[#7a6f63] font-mono text-[10px]">Graph Engine Grounded Operations</span>
            <Link
              href="/graph"
              className="text-[#10b981] font-bold text-xs flex items-center gap-1 hover:underline"
            >
              <span>View Security Knowledge Graph</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Security Telemetry Events Feed */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#10b981] animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold text-[#2c2825]">
              Real-Time Security Event Telemetry
            </h3>
          </div>
          <Link
            href="/monitor"
            className="text-xs text-[#10b981] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Live Monitor</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#d9d0c0] text-[#7a6f63] text-[10px] uppercase">
                <th className="pb-2 font-bold">Event ID</th>
                <th className="pb-2 font-bold">Severity</th>
                <th className="pb-2 font-bold">Event Type</th>
                <th className="pb-2 font-bold hidden sm:table-cell">Source / IP</th>
                <th className="pb-2 font-bold hidden md:table-cell">Description</th>
                <th className="pb-2 font-bold text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4ddd0]">
              {summary?.recent_events && summary.recent_events.length > 0 ? (
                summary.recent_events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#e8e2d6]/60 transition-colors">
                    <td className="py-2.5 font-bold text-[#2c2825]">{ev.id}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getSeverityBadgeClass(ev.severity)}`}>
                        {ev.severity}
                      </span>
                    </td>
                    <td className="py-2.5 font-semibold text-[#2c2825]">{ev.event_type}</td>
                    <td className="py-2.5 hidden sm:table-cell text-[#63584e]">{ev.raw_source}</td>
                    <td className="py-2.5 hidden md:table-cell text-[#63584e] truncate max-w-xs">{ev.description}</td>
                    <td className="py-2.5 text-right text-[#7a6f63] text-[10px]">
                      {formatTimestamp(ev.timestamp)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#7a6f63]">
                    No active threat events detected. Simulation or telemetry stream ready.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
