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
    try {
      const incidentId = 'INC-2026-0842';
      await api.startInvestigation(incidentId, event.id);
      router.push('/agent');
    } catch {
      router.push('/agent');
    }
  };

  return (
    <div className="space-y-3 sm:space-y-3.5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[#10b981] font-mono text-[11px] uppercase tracking-wider font-bold mb-0.5">
            <Radio className="w-3.5 h-3.5 text-[#10b981] animate-pulse shrink-0" />
            <span>Real-Time Ingestion Stream</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2c2825] tracking-tight leading-tight">
            Live Threat Monitor
          </h1>
          <p className="text-[#7a6f63] text-xs mt-0.5 truncate">
            Security telemetry ingested from identity providers, perimeter firewalls, and EDR agents into FalkorDB.
          </p>
        </div>

        {/* WebSocket Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-xs font-mono shadow-sm shrink-0">
          <span className="text-[#7a6f63]">FEED:</span>
          {wsConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-800 bg-[#d4ede3] px-2 py-0.5 rounded-full border border-[#10b981]/50 font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              WEBSOCKET ACTIVE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-full border border-amber-300 font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              POLLING SYNC
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Events List on Left, Event Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
        {/* Events Table List (7 columns on lg) */}
        <div className="lg:col-span-7 p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm flex flex-col justify-between min-w-0">
          <div>
            {/* Filter Buttons */}
            <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-2.5 mb-3">
              <div className="text-xs font-bold text-[#2c2825] flex items-center gap-1.5">
                <span>Security Telemetry Stream</span>
                <span className="px-2 py-0.5 rounded-full bg-[#e8e2d6] text-[#10b981] border border-[#d9d0c0] text-[10px] font-mono font-bold">
                  {filteredEvents.length} events
                </span>
              </div>
              <div className="flex items-center gap-1">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverity(sev)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-all ${
                      selectedSeverity === sev
                        ? 'bg-[#d4ede3] text-[#1a2e22] border border-[#10b981]/60 font-bold shadow-sm'
                        : 'bg-[#e8e2d6] text-[#7a6f63] hover:text-[#2c2825] border border-[#d9d0c0]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {filteredEvents.map((ev: SecurityEvent) => {
                const isSelected = selectedEvent?.id === ev.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#d4ede3]/40 border-[#10b981] shadow-sm'
                        : 'bg-[#e8e2d6]/60 border-[#d9d0c0] hover:border-[#b8ada0] hover:bg-[#e8e2d6]'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${getSeverityBadgeClass(ev.severity)}`}>
                          {ev.severity}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#2c2825] truncate">{ev.event_type}</span>
                      </div>
                      <p className="text-xs text-[#7a6f63] font-sans truncate">{ev.description}</p>
                      <div className="flex items-center gap-2.5 text-[10px] font-mono text-[#7a6f63]">
                        <span>Source: <strong className="text-[#2c2825]">{ev.raw_source}</strong></span>
                        <span>Confidence: <strong className="text-[#2c2825]">{Math.round(ev.confidence * 100)}%</strong></span>
                      </div>
                    </div>
                    <div className="text-right text-[10px] font-mono text-[#7a6f63] shrink-0 font-medium">
                      {formatTimestamp(ev.timestamp)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Event Details Inspector (5 columns on lg) */}
        <div className="lg:col-span-5 p-3.5 sm:p-4 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-2.5 mb-3">
              <span className="text-xs font-bold text-[#2c2825] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#10b981]" />
                Event Telemetry Inspector
              </span>
              <span className="text-[10px] font-mono text-[#7a6f63]">FalkorDB Provenance</span>
            </div>

            {selectedEvent ? (
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7a6f63] text-[10px]">EVENT ID</span>
                    <span className="font-bold text-[#2c2825]">{selectedEvent.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7a6f63] text-[10px]">TIMESTAMP</span>
                    <span className="text-[#7a6f63] text-[10px] truncate max-w-[200px]">{selectedEvent.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7a6f63] text-[10px]">OBSERVED STATUS</span>
                    <span className="text-emerald-800 font-bold text-[10px]">CONFIRMED LOG ENTRY</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#7a6f63] uppercase font-bold">Description</span>
                  <p className="text-xs text-[#2c2825] leading-relaxed p-2.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0]">
                    {selectedEvent.description}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#7a6f63] uppercase font-bold">Raw Telemetry JSON</span>
                  <pre className="p-2.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] text-[10px] font-mono text-[#2c2825] overflow-x-auto max-h-36 whitespace-pre-wrap">
                    {JSON.stringify(selectedEvent, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-[#7a6f63] font-mono text-xs">
                Select an event from the feed to view forensic telemetry details.
              </div>
            )}
          </div>

          {/* Trigger Investigation Button */}
          {selectedEvent && (
            <div className="pt-3 border-t border-[#d9d0c0] mt-3">
              <button
                onClick={() => handleInvestigate(selectedEvent)}
                className="w-full py-2 px-3.5 rounded-xl bg-[#10b981] text-white font-bold text-xs hover:bg-[#059669] transition-all flex items-center justify-center gap-2 shadow-sm"
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
