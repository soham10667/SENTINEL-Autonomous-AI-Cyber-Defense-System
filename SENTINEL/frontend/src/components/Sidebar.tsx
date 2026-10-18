'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Network,
  Radio,
  Search,
  Bot,
  FlaskConical,
  ShieldCheck,
  FileText,
  Settings
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Overview Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Knowledge Graph', href: '/graph', icon: Network },
  { name: 'Live Threat Monitor', href: '/monitor', icon: Radio },
  { name: 'Investigations', href: '/investigations', icon: Search },
  { name: 'Agent Operations', href: '/agent', icon: Bot },
  { name: 'Simulation Lab', href: '/simulation', icon: FlaskConical },
  { name: 'Response Center', href: '/response', icon: ShieldCheck },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-[#e4ddd0] border-r border-[#d9d0c0] flex flex-col justify-between shadow-[2px_0_12px_rgba(0,0,0,0.06)] z-40 select-none">
      {/* Top Brand Logo Section */}
      <div className="p-5 border-b border-[#d9d0c0] bg-[#e4ddd0]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#d4ede3] border border-[#10b981] flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-[#10b981]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-wider text-[#2c2825]">SENTINEL</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-[#ede8dc] border border-[#d9d0c0] text-[#10b981] font-bold">
                Track 1
              </span>
            </div>
            <p className="text-[10px] text-[#7a6f63] truncate mt-0.5 font-medium">Autonomous Cyber Defense</p>
          </div>
        </Link>
      </div>

      {/* Middle Navigation Section */}
      <div className="px-3.5 py-4 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#7a6f63] font-bold">
          Defense Console
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group relative',
                  isActive
                    ? 'bg-[#d4ede3] text-[#2c2825] font-bold border border-[#10b981] shadow-sm'
                    : 'text-[#7a6f63] hover:text-[#2c2825] hover:bg-[#ede8dc] hover:border-[#d9d0c0] border border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-[#10b981]' : 'text-[#7a6f63] group-hover:text-[#10b981]'
                  )}
                />
                <span className="truncate leading-none">{item.name}</span>
                {isActive && (
                  <span className="w-1 h-5 rounded-r bg-[#10b981] absolute left-0 top-1/2 -translate-y-1/2 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Info Box */}
      <div className="p-4 border-t border-[#d9d0c0] text-[11px] text-[#7a6f63] font-mono space-y-1.5 bg-[#e4ddd0]">
        <div className="flex justify-between items-center">
          <span>Target Track</span>
          <span className="text-[#10b981] font-bold">Track 1</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Engine</span>
          <span className="text-[#2c2825] font-semibold">FalkorDB Graph</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span>Allocation</span>
          <span>Web:3001 | API:8000</span>
        </div>
      </div>
    </aside>
  );
}
