'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  RotateCcw,
  Sliders,
  Radio,
  User,
  Laptop
} from 'lucide-react';
import { api } from '../../lib/api';
import { DefensiveAction } from '../../types';
import { formatTimestamp } from '../../lib/utils';

export default function ResponseCenterPage() {
  const [actions, setActions] = useState<DefensiveAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadActions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getActions();
      setActions(data);
    } catch (err) {
      console.error('Error loading actions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  const handleRollback = async (actionId: string) => {
    try {
      const res = await api.rollbackAction(actionId);
      setActionMessage(res.message);
      loadActions();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage('Rollback failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D9769B] font-mono text-xs uppercase tracking-wider font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-[#E88DAD]" />
            <span>Autonomous & Verified Mitigation</span>
          </div>
          <h1 className="text-2xl font-bold text-[#29252A] tracking-tight">
            Response Center & Containment Ledger
          </h1>
          <p className="text-[#77717A] text-xs mt-0.5">
            Audit history of autonomous simulated containment actions with state rollback and FalkorDB policy enforcement.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-[#FCE7F3] border border-[#FBCFE8] text-[#D9769B] text-xs font-mono font-bold shadow-sm">
          {actionMessage}
        </div>
      )}

      {/* Policy Engine Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#F5E1E9] space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#77717A] uppercase font-bold">Perimeter Firewall Policy</span>
            <Radio className="w-4 h-4 text-[#E88DAD]" />
          </div>
          <p className="text-xs text-[#29252A] font-sans leading-relaxed">
            Auto-blocks external proxy/C2 IP addresses with reputation &lt; 20 when active lateral path is detected.
          </p>
          <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> AUTO-APPROVED ENFORCED
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#F5E1E9] space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#77717A] uppercase font-bold">Identity Protection Policy</span>
            <User className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xs text-[#29252A] font-sans leading-relaxed">
            Suspends compromised synthetic user accounts and invalidates active session tokens upon confirmed breach path.
          </p>
          <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> AUTO-APPROVED ENFORCED
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#F5E1E9] space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#77717A] uppercase font-bold">EDR Host Containment Policy</span>
            <Laptop className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs text-[#29252A] font-sans leading-relaxed">
            Isolates network interfaces of infected endpoints or pivot servers from traversing to database tiers.
          </p>
          <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> AUTO-APPROVED ENFORCED
          </div>
        </div>
      </div>

      {/* Containment Ledger Table */}
      <div className="p-6 rounded-2xl bg-white border border-[#F5E1E9] space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F5E1E9] pb-3">
          <h3 className="text-sm font-bold text-[#29252A] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#E88DAD]" />
            Defensive Containment Ledger
          </h3>
          <span className="text-xs font-mono text-[#77717A] font-semibold">
            {actions.length} Historical Records
          </span>
        </div>

        {actions.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[#F5E1E9]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#F5E1E9] text-[#77717A] bg-[#FFF9FC]">
                <tr>
                  <th className="py-2.5 px-3">ACTION ID</th>
                  <th className="py-2.5 px-3">ACTION TYPE</th>
                  <th className="py-2.5 px-3">TARGET</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">REASON</th>
                  <th className="py-2.5 px-3">VERIFIED</th>
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3 text-right">CONTROLS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5E1E9]">
                {actions.map((act: DefensiveAction) => (
                  <tr key={act.id} className="hover:bg-[#FFF9FC] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#29252A]">{act.id}</td>
                    <td className="py-3 px-3 text-[#D9769B] font-bold">{act.action_type}</td>
                    <td className="py-3 px-3 text-[#29252A] font-mono">{act.target_id}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        act.status === 'EXECUTED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#29252A] font-sans max-w-xs truncate">{act.reason}</td>
                    <td className="py-3 px-3">
                      {act.verified ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> YES
                        </span>
                      ) : (
                        <span className="text-[#77717A]">PENDING</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#77717A]">{formatTimestamp(act.executed_at)}</td>
                    <td className="py-3 px-3 text-right">
                      {act.rollback_available && act.status !== 'ROLLED_BACK' ? (
                        <button
                          onClick={() => handleRollback(act.id)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#F5E1E9] text-[#77717A] hover:text-amber-700 hover:border-amber-300 text-[10px] font-mono font-semibold transition-all flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <RotateCcw className="w-3 h-3" /> Rollback
                        </button>
                      ) : (
                        <span className="text-[#77717A] text-[10px]">ROLLED BACK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-[#77717A] font-mono text-xs rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
            No containment actions executed yet. Launch a simulation to observe autonomous mitigation.
          </div>
        )}
      </div>
    </div>
  );
}
