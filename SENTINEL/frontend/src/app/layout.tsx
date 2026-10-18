'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import Sidebar from '../components/Sidebar';
import { usePathname } from 'next/navigation';
import { Menu, Shield } from 'lucide-react';
import { api } from '../lib/api';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDbOnline, setIsDbOnline] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isPublicPage) {
      api.getHealth()
        .then((res) => setIsDbOnline(res?.database?.connected ?? true))
        .catch(() => setIsDbOnline(false));
    }
  }, [pathname, isPublicPage]);

  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <title>SENTINEL — Autonomous AI Cyber Defense System | FalkorDB</title>
        <meta
          name="description"
          content="Detect smarter. Investigate faster. Understand threats through AI-powered intelligence and FalkorDB graph relationships."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={`antialiased min-h-full select-text bg-[#f5f0e8] text-[#2c2825] cyber-grid ${
          isPublicPage
            ? 'overflow-x-hidden'
            : 'h-full overflow-hidden flex flex-col md:flex-row'
        }`}
      >
        {!isPublicPage && (
          <Sidebar
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}

        <div
          className={`flex-1 flex flex-col min-w-0 ${
            isPublicPage
              ? 'w-full min-h-screen overflow-y-auto'
              : 'h-[100dvh] max-h-[100dvh] overflow-hidden'
          }`}
        >
          {/* Mobile Top Navigation Bar for Dashboard */}
          {!isPublicPage && (
            <header className="md:hidden h-12 bg-[#e4ddd0] border-b border-[#d9d0c0] px-3 flex items-center justify-between shrink-0 shadow-sm z-30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-1.5 rounded-lg text-[#2c2825] hover:bg-[#ede8dc] transition-colors"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-[#d4ede3] border border-[#10b981] flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-[#10b981]" />
                  </div>
                  <span className="font-bold text-xs tracking-wider text-[#2c2825]">SENTINEL</span>
                </div>
              </div>
              {isDbOnline === false ? (
                <div className="flex items-center gap-1 text-[10px] font-mono text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>OFFLINE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-[#d4ede3] border border-[#10b981]/50 px-2 py-0.5 rounded-md font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ONLINE</span>
                </div>
              )}
            </header>
          )}

          {/* Main Content Area */}
          <main className={`flex-1 ${isPublicPage ? 'w-full' : 'overflow-y-auto p-3 sm:p-4 lg:p-5'}`}>
            <div className={isPublicPage ? 'w-full' : 'w-full max-w-[1540px] mx-auto min-w-0'}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
