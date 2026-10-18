'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Radio, Eye, Play } from 'lucide-react';
import { api } from '../../lib/api';
import { SecurityEvent } from '../../types';
import { getSeverityBadgeClass, formatTimestamp } from '../../lib/utils';

export default function ThreatMonitorPage() {
  const router = useRouter();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
      if (data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0]);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    loadEvents();

    // Connect to WebSocket
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/events';
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data);
          if (parsed.type === 'NEW_EVENT' && parsed.data) {
            setEvents((prev: SecurityEvent[]) => [parsed.data, ...prev]);
          }
        } catch {}
      };
    } catch {
      setWsConnected(false);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const filteredEvents = events.filter((e: SecurityEvent) => {
    if (selectedSeverity === 'ALL') return true;
    return e.severity.toUpperCase() === selectedSeverity;
  });

  const handleInvestigate = async (event: SecurityEvent) => {
    // Start investigation and jump to agent ops page
    try {
      const incidentId = 'INC-2026-0842';
      await api.startInvestigation(incidentId, event.id);
      router.push('/agent');
    } catch {
      router.push('/agent');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D9769B] font-mono text-xs uppercase tracking-wider font-bold mb-1">
            <Radio className="w-4 h-4 text-[#E88DAD] animate-pulse" />
            <span>Real-Time Ingestion Stream</span>
          </div>
          <h1 className="text-2xl font-bold text-[#29252A] tracking-tight">
            Live Threat Monitor
          </h1>
          <p className="text-[#77717A] text-xs mt-0.5">
            Security telemetry ingested from identity providers, perimeter firewalls, and EDR agents into FalkorDB.
          </p>
        </div>

        {/* WebSocket Status */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#F5E1E9] text-xs font-mono shadow-sm">
          <span className="text-[#77717A]">TELEMETRY FEED:</span>
          {wsConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              WEBSOCKET ACTIVE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              POLLING SYNC
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Events List on Left, Event Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Table List */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#F5E1E9] shadow-sm flex flex-col justify-between">
          <div>
            {/* Filter Buttons */}
            <div className="flex items-center justify-between border-b border-[#F5E1E9] pb-3 mb-4">
              <div className="text-xs font-bold text-[#29252A] flex items-center gap-2">
                <span>Security Telemetry Stream</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF9FC] text-[#D9769B] border border-[#F5E1E9] text-[10px] font-mono font-bold">
                  {filteredEvents.length} events
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverity(sev)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg transition-all ${
                      selectedSeverity === sev
                        ? 'bg-[#FCE7F3] text-[#D9769B] border border-[#F4A7C1] font-bold shadow-sm'
                        : 'bg-[#FFF9FC] text-[#77717A] hover:text-[#29252A] hover:bg-[#FFF7FA] border border-[#F5E1E9]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {filteredEvents.map((ev: SecurityEvent) => {
                const isSelected = selectedEvent?.id === ev.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FFF7FA] border-[#F4A7C1] shadow-[0_2px_12px_rgba(244,167,193,0.18)]'
                        : 'bg-[#FFF9FC]/50 border-[#F5E1E9] hover:border-[#FBCFE8] hover:bg-[#FFF9FC]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getSeverityBadgeClass(ev.severity)}`}>
                          {ev.severity}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#29252A]">{ev.event_type}</span>
                      </div>
                      <p className="text-xs text-[#77717A] font-sans line-clamp-1">{ev.description}</p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-[#77717A]">
                        <span>Source: <strong className="text-[#29252A]">{ev.raw_source}</strong></span>
                        <span>Confidence: <strong className="text-[#29252A]">{Math.round(ev.confidence * 100)}%</strong></span>
                      </div>
                    </div>
                    <div className="text-right text-[11px] font-mono text-[#77717A] shrink-0 ml-4 font-medium">
                      {formatTimestamp(ev.timestamp)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Event Details Inspector */}
        <div className="p-6 rounded-2xl bg-white border border-[#F5E1E9] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F5E1E9] pb-3 mb-4">
              <span className="text-xs font-bold text-[#29252A] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#E88DAD]" />
                Event Telemetry Inspector
              </span>
              <span className="text-[10px] font-mono text-[#77717A]">FalkorDB Provenance</span>
            </div>

            {selectedEvent ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#77717A]">EVENT ID</span>
                    <span className="text-xs font-mono font-bold text-[#29252A]">{selectedEvent.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#77717A]">TIMESTAMP</span>
                    <span className="text-xs font-mono text-[#77717A]">{selectedEvent.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#77717A]">OBSERVED STATUS</span>
                    <span className="text-xs font-mono text-emerald-700 font-bold">CONFIRMED LOG ENTRY</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-[#77717A] uppercase font-bold">Description</span>
                  <p className="text-xs text-[#29252A] leading-relaxed p-3.5 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9]">
                    {selectedEvent.description}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-[#77717A] uppercase font-bold">Raw Telemetry JSON</span>
                  <pre className="p-3 rounded-xl bg-[#FFF9FC] border border-[#F5E1E9] text-[11px] font-mono text-[#29252A] overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {JSON.stringify(selectedEvent, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-[#77717A] font-mono text-xs">
                Select an event from the feed to view forensic telemetry details.
              </div>
            )}
          </div>

          {/* Trigger Investigation Button */}
          {selectedEvent && (
            <div className="pt-4 border-t border-[#F5E1E9] mt-4">
              <button
                onClick={() => handleInvestigate(selectedEvent)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E88DAD] text-white font-bold text-xs hover:bg-[#D9769B] transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(232,141,173,0.35)]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Trigger Autonomous Agent Investigation &rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
