'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Database,
  Cpu,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { api } from '../../lib/api';

export default function SettingsPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHealth = async () => {
    setIsLoading(true);
    try {
      const res = await api.getHealth();
      setHealthData(res);
    } catch (err: any) {
      setHealthData({
        status: 'degraded',
        database: { connected: false, error: err.message }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconnect = async () => {
    setIsLoading(true);
    try {
      const res = await api.reconnectGraph();
      setHealthData({
        status: res.status === 'connected' ? 'healthy' : 'degraded',
        database: res.database
      });
    } catch (err: any) {
      setHealthData({
        status: 'degraded',
        database: { connected: false, error: err.message }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const registeredMcpTools = [
    'get_security_event',
    'find_connected_assets',
    'trace_possible_attack_paths',
    'get_asset_permissions',
    'calculate_graph_risk',
    'get_incident_history',
    'simulate_block_ip',
    'simulate_disable_account',
    'simulate_isolate_device',
    'verify_containment'
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D9769B] font-mono text-xs uppercase tracking-wider font-bold mb-1">
            <Settings className="w-4 h-4 text-[#E88DAD]" />
            <span>Infrastructure & Engine Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-[#29252A] tracking-tight">
            Settings & System Status
          </h1>
          <p className="text-[#77717A] text-xs mt-0.5">
            Verified FalkorDB graph connectivity, MCP tool registry, and LLM orchestration settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReconnect}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E88DAD] hover:bg-[#D9769B] text-white text-xs font-mono font-bold transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reconnect FalkorDB</span>
          </button>
          <button
            onClick={loadHealth}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#F5E1E9] text-[#29252A] hover:text-[#D9769B] hover:border-[#FBCFE8] text-xs font-mono font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#E88DAD]' : ''}`} />
            <span>Ping Engine</span>
          </button>
        </div>
      </div>

      {/* Grid: FalkorDB Status & Agent Engine Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FalkorDB Connection Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#F5E1E9] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5E1E9] pb-3">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-[#E88DAD]" />
              <h3 className="font-bold text-sm text-[#29252A]">FalkorDB Instance</h3>
            </div>
            {healthData?.database?.connected ? (
              <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> CONNECTED
              </span>
            ) : (
              <span className="px-3 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-mono font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> OFFLINE
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
              <span className="text-[#77717A]">Host & Port:</span>
              <span className="text-[#29252A] font-bold">
                {healthData?.database?.host || '127.0.0.1'}:{healthData?.database?.port || 6379}
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
              <span className="text-[#77717A]">Target Graph:</span>
              <span className="text-[#D9769B] font-bold">{healthData?.database?.graph || 'sentinel'}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
              <span className="text-[#77717A]">Persistent Storage:</span>
              <span className="text-emerald-700 font-bold">PRESERVED (Protected)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
              <span className="text-[#77717A]">Graph Nodes:</span>
              <span className="text-[#29252A] font-bold">{healthData?.database?.node_count ?? '--'}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
              <span className="text-[#77717A]">Relationships:</span>
              <span className="text-[#29252A] font-bold">{healthData?.database?.relationship_count ?? '--'}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
              <span className="text-[#77717A]">Ping Latency:</span>
              <span className="text-[#D9769B] font-bold">{healthData?.database?.latency_ms ?? 0} ms</span>
            </div>
          </div>
        </div>

        {/* AI & Agent Orchestration Settings */}
        <div className="p-6 rounded-2xl bg-white border border-[#F5E1E9] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5E1E9] pb-3">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-[#E88DAD]" />
              <h3 className="font-bold text-sm text-[#29252A]">Agent & LLM Engine</h3>
            </div>
            <span className="px-3 py-0.5 rounded-full bg-[#FCE7F3] text-[#D9769B] border border-[#FBCFE8] text-[11px] font-mono font-bold">
              MULTI-MODE READY
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
              <span className="text-[#77717A]">Deterministic Fallback:</span>
              <span className="text-emerald-700 font-bold">ENABLED (Zero-fail)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
              <span className="text-[#77717A]">LangGraph Pipeline:</span>
              <span className="text-[#29252A] font-bold">ACTIVE</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
              <span className="text-[#77717A]">LLM Provider Format:</span>
              <span className="text-[#29252A]">OpenAI-Compatible</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
              <span className="text-[#77717A]">Model:</span>
              <span className="text-[#D9769B] font-bold">gpt-4o-mini (or custom)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
              <span className="text-[#77717A]">Grounding Policy:</span>
              <span className="text-[#29252A]">Strict FalkorDB Cypher Grounding</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
              <span className="text-[#77717A]">Containment Environment:</span>
              <span className="text-emerald-700 font-bold">Controlled Sandbox</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registered MCP Tools Registry */}
      <div className="p-6 rounded-2xl bg-white border border-[#F5E1E9] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#F5E1E9] pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#E88DAD]" />
            <h3 className="font-bold text-sm text-[#29252A]">Model Context Protocol (MCP) Tool Registry</h3>
          </div>
          <span className="text-xs font-mono text-[#77717A] font-semibold">
            {registeredMcpTools.length} Registered Tools
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
          {registeredMcpTools.map((tool) => (
            <div
              key={tool}
              className="p-3 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] flex items-center justify-between hover:border-[#F4A7C1] hover:bg-white transition-colors shadow-sm"
            >
              <span className="text-[#D9769B] font-bold">{tool}</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
