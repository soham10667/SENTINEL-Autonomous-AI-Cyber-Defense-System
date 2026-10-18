import React from 'react';
import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'SENTINEL — Autonomous Cyber Defense System',
  description: 'Track 1: Agents That Act on Connected Data | WeMakeDevs x FalkorDB Graph Hacks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-[#29252A] antialiased min-h-screen flex cyber-grid overflow-x-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <main className="flex-1 p-6 md:p-8 bg-[#FFF9FC]/30 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
