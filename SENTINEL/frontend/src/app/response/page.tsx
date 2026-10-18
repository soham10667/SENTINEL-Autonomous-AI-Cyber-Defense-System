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
    <div className="space-y-3 sm:space-y-3.5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
            <span>Autonomous & Verified Mitigation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2c2825] tracking-tight leading-tight">
            Response Center & Containment Ledger
          </h1>
          <p className="text-[#7a6f63] text-xs mt-0.5 truncate">
            Audit history of autonomous simulated containment actions with state rollback and FalkorDB policy enforcement.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-2.5 rounded-xl bg-[#d4ede3] border border-[#10b981]/50 text-emerald-800 text-xs font-mono font-bold shadow-sm">
          {actionMessage}
        </div>
      )}

      {/* Policy Engine Status Cards: 3 equal cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] space-y-2 shadow-sm min-w-0 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#7a6f63] uppercase font-bold truncate">Perimeter Firewall Policy</span>
              <Radio className="w-4 h-4 text-[#10b981] shrink-0 ml-1" />
            </div>
            <p className="text-xs text-[#2c2825] font-sans leading-relaxed">
              Auto-blocks external proxy/C2 IP addresses with reputation &lt; 20 when active lateral path is detected.
            </p>
          </div>
          <div className="text-[10px] font-mono text-emerald-800 bg-[#d4ede3] border border-[#10b981]/50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 w-fit mt-2">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> AUTO-APPROVED ENFORCED
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] space-y-2 shadow-sm min-w-0 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#7a6f63] uppercase font-bold truncate">Identity Protection Policy</span>
              <User className="w-4 h-4 text-purple-600 shrink-0 ml-1" />
            </div>
            <p className="text-xs text-[#2c2825] font-sans leading-relaxed">
              Suspends compromised synthetic user accounts and invalidates active session tokens upon confirmed breach path.
            </p>
          </div>
          <div className="text-[10px] font-mono text-emerald-800 bg-[#d4ede3] border border-[#10b981]/50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 w-fit mt-2">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> AUTO-APPROVED ENFORCED
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] space-y-2 shadow-sm min-w-0 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#7a6f63] uppercase font-bold truncate">EDR Host Containment Policy</span>
              <Laptop className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
            </div>
            <p className="text-xs text-[#2c2825] font-sans leading-relaxed">
              Isolates network interfaces of infected endpoints or pivot servers from traversing to database tiers.
            </p>
          </div>
          <div className="text-[10px] font-mono text-emerald-800 bg-[#d4ede3] border border-[#10b981]/50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 w-fit mt-2">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> AUTO-APPROVED ENFORCED
          </div>
        </div>
      </div>

      {/* Containment Ledger Table */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] space-y-3 shadow-sm min-w-0">
        <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-2.5">
          <h3 className="text-xs sm:text-sm font-bold text-[#2c2825] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#10b981]" />
            Defensive Containment Ledger
          </h3>
          <span className="text-[10px] font-mono text-[#7a6f63] font-semibold">
            {actions.length} Historical Records
          </span>
        </div>

        {actions.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[#d9d0c0] max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-xs font-mono min-w-[700px]">
              <thead className="border-b border-[#d9d0c0] text-[#7a6f63] bg-[#e8e2d6] sticky top-0 z-10 text-[10px]">
                <tr>
                  <th className="py-2 px-2.5">ACTION ID</th>
                  <th className="py-2 px-2.5">ACTION TYPE</th>
                  <th className="py-2 px-2.5">TARGET</th>
                  <th className="py-2 px-2.5">STATUS</th>
                  <th className="py-2 px-2.5">REASON</th>
                  <th className="py-2 px-2.5">VERIFIED</th>
                  <th className="py-2 px-2.5">TIMESTAMP</th>
                  <th className="py-2 px-2.5 text-right">CONTROLS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9d0c0] text-[11px]">
                {actions.map((act: DefensiveAction) => (
                  <tr key={act.id} className="hover:bg-[#e8e2d6] transition-colors">
                    <td className="py-2 px-2.5 font-semibold text-[#2c2825]">{act.id}</td>
                    <td className="py-2 px-2.5 text-[#10b981] font-bold">{act.action_type}</td>
                    <td className="py-2 px-2.5 text-[#2c2825] font-mono">{act.target_id}</td>
                    <td className="py-2 px-2.5">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        act.status === 'EXECUTED'
                          ? 'bg-[#d4ede3] text-emerald-800 border border-[#10b981]/50'
                          : 'bg-[#e4ddd0] text-stone-600 border border-[#d9d0c0]'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-[#2c2825] font-sans max-w-xs truncate">{act.reason}</td>
                    <td className="py-2 px-2.5">
                      {act.verified ? (
                        <span className="text-emerald-800 flex items-center gap-1 font-bold text-[10px]">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> YES
                        </span>
                      ) : (
                        <span className="text-[#7a6f63] text-[10px]">PENDING</span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-[#7a6f63]">{formatTimestamp(act.executed_at)}</td>
                    <td className="py-2 px-2.5 text-right">
                      {act.rollback_available && act.status !== 'ROLLED_BACK' ? (
                        <button
                          onClick={() => handleRollback(act.id)}
                          className="px-2 py-0.5 rounded-lg bg-[#ede8dc] border border-[#d9d0c0] text-[#7a6f63] hover:text-amber-700 hover:border-amber-300 text-[10px] font-mono font-semibold transition-all flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <RotateCcw className="w-3 h-3" /> Rollback
                        </button>
                      ) : (
                        <span className="text-[#7a6f63] text-[10px]">ROLLED BACK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-[#7a6f63] font-mono text-xs rounded-xl bg-[#e8e2d6] border border-[#d9d0c0]">
            No containment actions executed yet. Launch a simulation to observe autonomous mitigation.
          </div>
        )}
      </div>
    </div>
  );
}
