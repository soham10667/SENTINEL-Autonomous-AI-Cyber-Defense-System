'use client';

import React, { useEffect, useState } from 'react';
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
  Settings,
  X,
  LogOut,
  User,
  LogIn
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getStoredAuth, clearStoredAuth } from '../lib/api';

const navItems = [
  { name: 'Overview Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Knowledge Graph', href: '/graph', icon: Network },
  { name: 'Live Threat Monitor', href: '/monitor', icon: Radio },
  { name: 'Investigations', href: '/investigations', icon: Search },
  { name: 'Agent Operations', href: '/agent', icon: Bot },
  { name: 'Simulation Lab', href: '/simulation', icon: FlaskConical },
  { name: 'Response Center', href: '/response', icon: ShieldCheck },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [auth, setAuth] = useState<{ token: string | null; user: any | null }>({
    token: null,
    user: null
  });

  useEffect(() => {
    setAuth(getStoredAuth());
  }, [pathname]);

  const handleLogout = () => {
    clearStoredAuth();
    window.location.href = '/login';
  };

  const sidebarContent = (
    <aside className="w-[245px] shrink-0 h-[100dvh] max-h-[100dvh] bg-[#e4ddd0] border-r border-[#d9d0c0] flex flex-col justify-between shadow-[2px_0_12px_rgba(0,0,0,0.06)] select-none">
      {/* Top Brand Logo Section */}
      <div className="px-4 py-3.5 border-b border-[#d9d0c0] bg-[#e4ddd0] flex items-center justify-between">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5 group min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#d4ede3] border border-[#10b981] flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wider text-[#2c2825]">SENTINEL</span>
            </div>
            <p className="text-[10px] text-[#7a6f63] truncate font-medium">Autonomous Cyber Defense</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-[#7a6f63] hover:text-[#2c2825] hover:bg-[#ede8dc] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Middle Navigation Section */}
      <div className="px-2.5 py-2.5 flex-1 overflow-y-auto space-y-0.5">
        <div className="px-3 pb-1.5 text-[9px] font-mono uppercase tracking-wider text-[#7a6f63] font-bold">
          Defense Console
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative leading-none',
                  isActive
                    ? 'bg-[#d4ede3] text-[#1a2e22] font-bold border border-[#10b981]/60 shadow-sm'
                    : 'text-[#675c51] hover:text-[#2c2825] hover:bg-[#ede8dc] hover:border-[#d9d0c0] border border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-[#10b981]' : 'text-[#7a6f63] group-hover:text-[#10b981]'
                  )}
                />
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <span className="w-1 h-4 rounded-r bg-[#10b981] absolute left-0 top-1/2 -translate-y-1/2 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Operator Session Footer */}
      <div className="border-t border-[#d9d0c0] bg-[#e4ddd0] shrink-0 p-2.5">
        {auth.user ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono bg-[#d4ede3] text-emerald-800 border border-[#10b981]">
                {auth.user.full_name?.[0] || 'O'}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#2c2825] truncate">
                  {auth.user.full_name || 'Operator'}
                </p>
                <p className="text-[9px] font-mono text-[#7a6f63] truncate">
                  {auth.user.role || auth.user.email || 'OPERATOR'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#7a6f63] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign Out / Exit Session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            onClick={onClose}
            className="w-full flex items-center justify-between p-1 rounded-lg hover:bg-[#ede8dc] transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold bg-[#d4ede3] text-[#10b981] border border-[#10b981]/60">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[11px] font-bold text-[#2c2825] group-hover:text-[#10b981] transition-colors truncate">
                  Operator Access
                </p>
                <p className="text-[9px] font-mono text-[#7a6f63] truncate">
                  Sign in to console
                </p>
              </div>
            </div>
            <LogIn className="w-3.5 h-3.5 text-[#7a6f63] group-hover:text-[#10b981] transition-colors shrink-0" />
          </Link>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
