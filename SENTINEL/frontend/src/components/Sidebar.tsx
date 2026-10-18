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
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-[#FFF7FA] border-r border-[#F5E1E9] flex flex-col justify-between shadow-[2px_0_12px_rgba(244,167,193,0.06)] z-40 select-none">
      {/* Top Brand Logo Section */}
      <div className="p-5 border-b border-[#F5E1E9] bg-[#FFF7FA]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center text-[#E88DAD] shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-[#E88DAD]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-wider text-[#29252A]">SENTINEL</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-white border border-[#FBCFE8] text-[#D9769B] font-bold">
                Track 1
              </span>
            </div>
            <p className="text-[10px] text-[#77717A] truncate mt-0.5 font-medium">Autonomous Cyber Defense</p>
          </div>
        </Link>
      </div>

      {/* Middle Navigation Section */}
      <div className="px-3.5 py-4 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#77717A] font-bold">
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
                    ? 'bg-[#FCE7F3] text-[#29252A] font-bold border border-[#FBCFE8] shadow-sm'
                    : 'text-[#77717A] hover:text-[#29252A] hover:bg-white hover:border-[#F5E1E9] border border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-[#E88DAD]' : 'text-[#77717A] group-hover:text-[#E88DAD]'
                  )}
                />
                <span className="truncate leading-none">{item.name}</span>
                {isActive && (
                  <span className="w-1 h-5 rounded-r bg-[#E88DAD] absolute left-0 top-1/2 -translate-y-1/2 shadow-[0_0_6px_rgba(232,141,173,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Info Box */}
      <div className="p-4 border-t border-[#F5E1E9] text-[11px] text-[#77717A] font-mono space-y-1.5 bg-[#FFF7FA]">
        <div className="flex justify-between items-center">
          <span>Target Track</span>
          <span className="text-[#D9769B] font-bold">Track 1</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Engine</span>
          <span className="text-[#29252A] font-semibold">FalkorDB Graph</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span>Allocation</span>
          <span>Web:3001 | API:8000</span>
        </div>
      </div>
    </aside>
  );
}
