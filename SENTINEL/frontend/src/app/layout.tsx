'use client';

import React from 'react';
import './globals.css';
import Sidebar from '../components/Sidebar';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en">
      <head>
        <title>SENTINEL — Autonomous Cyber Defense System</title>
        <meta name="description" content="Track 1: Agents That Act on Connected Data | WeMakeDevs x FalkorDB Graph Hacks" />
      </head>
      <body className="bg-[#f5f0e8] text-[#2c2825] antialiased min-h-screen flex cyber-grid overflow-x-hidden">
        {!isAuthPage && <Sidebar />}
        <div className={`flex-1 flex flex-col min-h-screen min-w-0 ${isAuthPage ? 'w-full' : ''}`}>
          <main className={`flex-1 overflow-y-auto ${isAuthPage ? '' : 'p-6 md:p-8'}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
