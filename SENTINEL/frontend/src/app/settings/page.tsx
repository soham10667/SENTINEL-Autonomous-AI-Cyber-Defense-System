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
  User,
  LogOut,
  ShieldCheck,
  Key
} from 'lucide-react';
import { api, getStoredAuth, clearStoredAuth } from '../../lib/api';

export default function SettingsPage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [auth, setAuth] = useState<{ token: string | null; user: any | null }>({
    token: null,
    user: null
  });

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

  const handleLogout = () => {
    clearStoredAuth();
    window.location.href = '/';
  };

  useEffect(() => {
    loadHealth();
    setAuth(getStoredAuth());
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
    <div className="space-y-3 sm:space-y-3.5 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <Settings className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
            <span>Infrastructure & Engine Configuration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2c2825] tracking-tight leading-tight">
            Settings & System Status
          </h1>
          <p className="text-[#7a6f63] text-xs mt-0.5 truncate">
            Verified FalkorDB graph connectivity, MCP tool registry, and LLM orchestration settings.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReconnect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-mono font-bold transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reconnect FalkorDB</span>
          </button>
          <button
            onClick={loadHealth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-[#2c2825] hover:text-[#10b981] hover:border-[#10b981] text-xs font-mono font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#10b981]' : ''}`} />
            <span>Ping Engine</span>
          </button>
        </div>
      </div>

      {/* Operator Session & Security Card */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm space-y-3 min-w-0">
        <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10b981]" />
            <h3 className="font-bold text-xs sm:text-sm text-[#2c2825]">Active Operator Session & Authentication</h3>
          </div>
          {auth.token ? (
            <span className="px-2.5 py-0.5 rounded-full bg-[#d4ede3] text-emerald-800 border border-[#10b981]/50 text-[10px] font-mono font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" /> AUTHENTICATED
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
              LOCAL / ANONYMOUS
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
            <span className="text-[#7a6f63] block text-[10px] uppercase">Operator Name</span>
            <span className="text-[#2c2825] font-bold truncate block">
              {auth.user?.full_name || 'Operator (Local)'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
            <span className="text-[#7a6f63] block text-[10px] uppercase">Work Email</span>
            <span className="text-[#10b981] font-bold truncate block">
              {auth.user?.email || 'operator@sentinel.internal'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
            <span className="text-[#7a6f63] block text-[10px] uppercase">Clearance & Role</span>
            <span className="text-emerald-800 font-bold truncate block">
              {auth.user?.role || 'OPERATOR'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-between">
            <div>
              <span className="text-[#7a6f63] block text-[10px] uppercase">Session Action</span>
              <span className="text-xs text-[#2c2825]">{auth.token ? 'Active JWT' : 'Local Console'}</span>
            </div>
            {auth.token ? (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 rounded-lg bg-[#e4ddd0] hover:bg-rose-100 text-rose-700 border border-[#d9d0c0] hover:border-rose-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <a
                href="/login"
                className="px-2.5 py-1 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-sm"
              >
                <span>Sign In</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Grid: FalkorDB Status & Agent Engine Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
        {/* FalkorDB Connection Card */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm space-y-3 min-w-0">
          <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-2.5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#10b981]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#2c2825]">FalkorDB Instance</h3>
            </div>
            {healthData?.database?.connected ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#d4ede3] text-emerald-800 border border-[#10b981]/50 text-[10px] font-mono font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> CONNECTED
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-mono font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-600" /> OFFLINE
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between p-2 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
              <span className="text-[#7a6f63]">Host & Port:</span>
              <span className="text-[#2c2825] font-bold">
                {healthData?.database?.host || '127.0.0.1'}:{healthData?.database?.port || 6379}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
              <span className="text-[#7a6f63]">Target Graph:</span>
              <span className="text-[#10b981] font-bold">{healthData?.database?.graph || 'sentinel'}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
              <span className="text-[#7a6f63]">Persistent Storage:</span>
              <span className="text-emerald-800 font-bold">PRESERVED (Protected)</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
              <span className="text-[#7a6f63]">Graph Nodes:</span>
              <span className="text-[#2c2825] font-bold">{healthData?.database?.node_count ?? '--'}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
              <span className="text-[#7a6f63]">Relationships:</span>
              <span className="text-[#2c2825] font-bold">{healthData?.database?.relationship_count ?? '--'}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
              <span className="text-[#7a6f63]">Ping Latency:</span>
              <span className="text-[#10b981] font-bold">{healthData?.database?.latency_ms ?? 0} ms</span>
            </div>
          </div>
        </div>

        {/* AI & Agent Orchestration Settings */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm space-y-3 min-w-0">
          <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#10b981]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#2c2825]">Agent & LLM Engine</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#d4ede3] text-emerald-800 border border-[#10b981]/50 text-[10px] font-mono font-bold">
              MULTI-MODE READY
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between p-2 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
              <span className="text-[#7a6f63]">Deterministic Fallback:</span>
              <span className="text-emerald-800 font-bold">ENABLED (Zero-fail)</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
              <span className="text-[#7a6f63]">LangGraph Pipeline:</span>
              <span className="text-[#2c2825] font-bold">ACTIVE</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
              <span className="text-[#7a6f63]">LLM Provider Format:</span>
              <span className="text-[#2c2825]">OpenAI-Compatible</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
              <span className="text-[#7a6f63]">Model:</span>
              <span className="text-[#10b981] font-bold">gpt-4o-mini (or custom)</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
              <span className="text-[#7a6f63]">Grounding Policy:</span>
              <span className="text-[#2c2825]">Strict FalkorDB Cypher Grounding</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0]">
              <span className="text-[#7a6f63]">Containment Environment:</span>
              <span className="text-emerald-800 font-bold">Controlled Sandbox</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registered MCP Tools Registry */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm space-y-3 min-w-0">
        <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#10b981]" />
            <h3 className="font-bold text-xs sm:text-sm text-[#2c2825]">Model Context Protocol (MCP) Tool Registry</h3>
          </div>
          <span className="text-[10px] font-mono text-[#7a6f63] font-semibold">
            {registeredMcpTools.length} Registered Tools
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
          {registeredMcpTools.map((tool) => (
            <div
              key={tool}
              className="p-2.5 rounded-lg bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-between hover:border-[#b8ada0] hover:bg-[#ede8dc] transition-colors shadow-sm"
            >
              <span className="text-[#10b981] font-bold text-[11px] truncate">{tool}</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
