'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  Network,
  Activity,
  Zap,
  Radio,
  FileCheck,
  Server,
  Eye,
  GitFork,
  Github,
  Menu,
  X,
  ChevronRight,
  LogIn
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#2c2825] cyber-grid font-sans selection:bg-[#d4ede3] selection:text-[#1a2e22]">
      {/* Sticky Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#e4ddd0]/90 border-b border-[#d9d0c0] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#d4ede3] border border-[#10b981] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-[#10b981]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[#2c2825]">SENTINEL</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#7a6f63]">
            <a href="#" className="hover:text-[#10b981] transition-colors">
              Home
            </a>
            <a href="#features" className="hover:text-[#10b981] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#10b981] transition-colors">
              How It Works
            </a>
            <a href="#falkordb" className="hover:text-[#10b981] transition-colors">
              FalkorDB
            </a>
            <a href="#technology" className="hover:text-[#10b981] transition-colors">
              Technology
            </a>
            <a href="#about" className="hover:text-[#10b981] transition-colors">
              About
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#2c2825] hover:text-[#10b981] px-3.5 py-2 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#10b981] hover:bg-[#059669] transition-all shadow-sm hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#7a6f63] hover:text-[#2c2825] hover:bg-[#ede8dc]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#d9d0c0] bg-[#e4ddd0] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            <a
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#7a6f63] hover:text-[#10b981] py-1"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#7a6f63] hover:text-[#10b981] py-1"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#7a6f63] hover:text-[#10b981] py-1"
            >
              How It Works
            </a>
            <a
              href="#falkordb"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#7a6f63] hover:text-[#10b981] py-1"
            >
              FalkorDB
            </a>
            <a
              href="#technology"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#7a6f63] hover:text-[#10b981] py-1"
            >
              Technology
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#7a6f63] hover:text-[#10b981] py-1"
            >
              About
            </a>
            <div className="pt-3 border-t border-[#d9d0c0] grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-xs font-semibold text-[#2c2825] bg-[#ede8dc] border border-[#d9d0c0]"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-[#10b981] hover:bg-[#059669]"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ede8dc] border border-[#d9d0c0] text-xs font-mono font-bold text-[#10b981] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span>WeMakeDevs x FalkorDB Graph Hacks</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2c2825] leading-[1.12]">
                Autonomous Cyber Defense.{' '}
                <span className="text-[#10b981]">
                  Powered by Connected Graph AI.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#7a6f63] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Detect smarter. Investigate faster. Understand adversary traversal and execute verified containment through FalkorDB graph relationships.
              </p>

              {/* Call-to-Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#10b981] hover:bg-[#059669] transition-all shadow-sm hover:scale-[1.01]"
                >
                  <span>Register Operator</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-[#2c2825] bg-[#ede8dc] hover:bg-[#e8e2d6] border border-[#d9d0c0] hover:border-[#10b981] transition-all shadow-sm"
                >
                  <LogIn className="w-4 h-4 text-[#10b981]" />
                  <span>Sign In to Console</span>
                </Link>
              </div>

              {/* Value Metrics / Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#d9d0c0] max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-extrabold font-mono text-[#10b981]">&lt; 2ms</div>
                  <div className="text-xs text-[#7a6f63] font-medium">Cypher Query Speed</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-mono text-[#10b981]">100%</div>
                  <div className="text-xs text-[#7a6f63] font-medium">Graph Grounded</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-mono text-[#10b981]">0 Sec</div>
                  <div className="text-xs text-[#7a6f63] font-medium">Automated Triage</div>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Topology Visualizer */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md bg-[#ede8dc] rounded-2xl border border-[#d9d0c0] shadow-sm p-6 space-y-4">
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-[#2c2825]">FalkorDB Graph Grounded Agent</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#d4ede3] text-emerald-800 border border-[#10b981]/50 font-bold">
                    ACTIVE
                  </span>
                </div>

                {/* Topology Graph Card */}
                <div className="h-64 rounded-xl bg-[#f8f5ef] border border-[#d9d0c0] relative overflow-hidden flex items-center justify-center p-4">
                  {/* Visual Node Connections */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="80" y1="60" x2="210" y2="120" stroke="#d9d0c0" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="210" y1="120" x2="340" y2="70" stroke="#10b981" strokeWidth="2.5" />
                    <line x1="210" y1="120" x2="260" y2="200" stroke="#10b981" strokeWidth="2.5" />
                    <line x1="80" y1="190" x2="210" y2="120" stroke="#d9d0c0" strokeWidth="2" />
                  </svg>

                  {/* Node: External Threat IP */}
                  <div className="absolute top-8 left-6 p-2 rounded-xl bg-[#ede8dc] border border-rose-300 shadow-sm flex items-center gap-1.5 animate-bounce">
                    <Radio className="w-3.5 h-3.5 text-rose-500" />
                    <div className="text-[10px] font-mono">
                      <span className="font-bold text-rose-700">194.26.29.112</span>
                    </div>
                  </div>

                  {/* Node: Compromised User */}
                  <div className="absolute top-10 right-6 p-2 rounded-xl bg-[#ede8dc] border border-amber-300 shadow-sm flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <div className="text-[10px] font-mono">
                      <span className="font-bold text-amber-800">USR-002</span>
                    </div>
                  </div>

                  {/* Central Node: FalkorDB Reasoning Agent */}
                  <div className="z-10 p-3 rounded-xl bg-[#10b981] text-white shadow-md flex flex-col items-center justify-center text-center">
                    <Shield className="w-6 h-6 mb-1 text-white" />
                    <span className="text-[11px] font-bold font-mono">SENTINEL AGENT</span>
                    <span className="text-[8px] font-mono opacity-90">Evaluating Blast Radius</span>
                  </div>

                  {/* Node: Crown Jewel Database */}
                  <div className="absolute bottom-6 right-10 p-2 rounded-xl bg-[#ede8dc] border border-emerald-400 shadow-sm flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <div className="text-[10px] font-mono">
                      <span className="font-bold text-emerald-800">DB-PROD-CUST</span>
                    </div>
                  </div>

                  {/* Node: Isolated Workstation */}
                  <div className="absolute bottom-6 left-8 p-2 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] shadow-sm flex items-center gap-1.5 opacity-80">
                    <Server className="w-3.5 h-3.5 text-[#7a6f63]" />
                    <div className="text-[10px] font-mono">
                      <span className="font-bold text-[#2c2825]">DEV-WKS-02</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Status Feed */}
                <div className="p-3 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#10b981]" />
                    <span className="text-[11px] font-mono font-medium text-[#2c2825]">Autonomous containment verified</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-[#d4ede3] px-2 py-0.5 rounded border border-[#10b981]/50">
                    100% CONTAINED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: About SENTINEL */}
      <section id="about" className="py-20 border-t border-[#d9d0c0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#10b981] px-3 py-1 rounded-full bg-[#ede8dc] border border-[#d9d0c0]">
              About SENTINEL
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2c2825] tracking-tight">
              Moving Beyond Siloed Telemetry to Connected Graph Defense
            </h2>
            <p className="text-[#7a6f63] text-base leading-relaxed">
              Traditional SIEMs and alert aggregators overwhelm security teams with disconnected log entries. SENTINEL continuously unifies identities, credentials, network flows, and databases into a single, high-speed knowledge graph powered by FalkorDB.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-[#ede8dc] border border-[#d9d0c0] hover:border-[#10b981] transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981] mb-5 shadow-sm">
                <Network className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2c2825] mb-2">Connected Topology</h3>
              <p className="text-sm text-[#7a6f63] leading-relaxed">
                Maps lateral movement paths, SSH bastion hops, and identity permissions. Threats are analyzed in full topological context rather than isolated alerts.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#ede8dc] border border-[#d9d0c0] hover:border-[#10b981] transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981] mb-5 shadow-sm">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2c2825] mb-2">Autonomous Agent Triaging</h3>
              <p className="text-sm text-[#7a6f63] leading-relaxed">
                LangGraph-orchestrated agents investigate suspicious behaviors, correlate evidence, and formulate hypotheses without requiring human analyst burnout.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#ede8dc] border border-[#d9d0c0] hover:border-[#10b981] transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981] mb-5 shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2c2825] mb-2">Counterfactual Containment</h3>
              <p className="text-sm text-[#7a6f63] leading-relaxed">
                Before severing a connection or revoking a token, SENTINEL simulates the blast radius in FalkorDB to guarantee crown jewel assets are safeguarded without service outages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Main Cybersecurity Features */}
      <section id="features" className="py-20 border-t border-[#d9d0c0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#10b981] px-3 py-1 rounded-full bg-[#ede8dc] border border-[#d9d0c0]">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2c2825] tracking-tight">
              Enterprise-Grade Autonomous AI Security
            </h2>
            <p className="text-[#7a6f63] text-base leading-relaxed">
              Autonomous AI Agents Operating on Connected Graph Data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-[#ede8dc] rounded-2xl border border-[#d9d0c0] hover:border-[#10b981] shadow-sm transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981]">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#2c2825]">Real-Time Graph Grounding</h3>
              <p className="text-xs text-[#7a6f63] leading-relaxed">
                Every AI prompt and conclusion is grounded in live FalkorDB Cypher queries, preventing hallucinations and ensuring auditable defense decisions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-[#ede8dc] rounded-2xl border border-[#d9d0c0] hover:border-[#10b981] shadow-sm transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#2c2825]">Blast Radius Simulation</h3>
              <p className="text-xs text-[#7a6f63] leading-relaxed">
                Performs what-if analysis on proposed firewall rules, isolated hosts, and suspended accounts to observe threat path termination before execution.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-[#ede8dc] rounded-2xl border border-[#d9d0c0] hover:border-[#10b981] shadow-sm transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981]">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#2c2825]">Crown Jewel Protection</h3>
              <p className="text-xs text-[#7a6f63] leading-relaxed">
                Explicit classification for databases holding PII, tokenized cards, and KMS enclaves, triggering immediate high-priority containment when approached.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-[#ede8dc] rounded-2xl border border-[#d9d0c0] hover:border-[#10b981] shadow-sm transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981]">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#2c2825]">Live Telemetry Stream</h3>
              <p className="text-xs text-[#7a6f63] leading-relaxed">
                WebSocket event streaming correlates brute-force logins, credential exfiltration, and C2 proxies into the active threat topology in real time.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-[#ede8dc] rounded-2xl border border-[#d9d0c0] hover:border-[#10b981] shadow-sm transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981]">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#2c2825]">Verifiable Incident Reports</h3>
              <p className="text-xs text-[#7a6f63] leading-relaxed">
                Generates executive-ready incident summaries with full graph evidence paths, root cause attribution, and step-by-step mitigation chronologies.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-[#ede8dc] rounded-2xl border border-[#d9d0c0] hover:border-[#10b981] shadow-sm transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981]">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#2c2825]">Interactive ReactFlow Graph</h3>
              <p className="text-xs text-[#7a6f63] leading-relaxed">
                Explore the topology with dynamic filtering, node search, attack chain highlighting, and live synchronization with FalkorDB Browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: How It Works */}
      <section id="how-it-works" className="py-20 border-t border-[#d9d0c0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#10b981] px-3 py-1 rounded-full bg-[#ede8dc] border border-[#d9d0c0]">
              Autonomous Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2c2825] tracking-tight">
              From Raw Security Signals to Verified Containment
            </h2>
            <p className="text-[#7a6f63] text-base leading-relaxed">
              How SENTINEL acts autonomously in milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#ede8dc] border border-[#d9d0c0] hover:border-[#10b981] transition-all relative">
              <span className="text-3xl font-extrabold font-mono text-[#10b981]/25 absolute top-4 right-5">01</span>
              <div className="w-10 h-10 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981] mb-4 shadow-sm">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2c2825] mb-1.5">Signal Ingestion</h3>
              <p className="text-xs text-[#7a6f63] leading-relaxed">
                Raw events (SSH anomalies, Tor proxies, brute force attempts) stream into SENTINEL's event dispatcher.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#ede8dc] border border-[#d9d0c0] hover:border-[#10b981] transition-all relative">
              <span className="text-3xl font-extrabold font-mono text-[#10b981]/25 absolute top-4 right-5">02</span>
              <div className="w-10 h-10 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981] mb-4 shadow-sm">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2c2825] mb-1.5">Graph Correlation</h3>
              <p className="text-xs text-[#7a6f63] leading-relaxed">
                FalkorDB resolves IP to Device, User to Session, and Host to Database with sub-millisecond Cypher queries.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#ede8dc] border border-[#d9d0c0] hover:border-[#10b981] transition-all relative">
              <span className="text-3xl font-extrabold font-mono text-[#10b981]/25 absolute top-4 right-5">03</span>
              <div className="w-10 h-10 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981] mb-4 shadow-sm">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2c2825] mb-1.5">AI Agent Reasoning</h3>
              <p className="text-xs text-[#7a6f63] leading-relaxed">
                Autonomous agent investigates the lateral path, validates MITRE tactics, and designs counterfactual mitigations.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-[#ede8dc] border border-[#d9d0c0] hover:border-[#10b981] transition-all relative">
              <span className="text-3xl font-extrabold font-mono text-[#10b981]/25 absolute top-4 right-5">04</span>
              <div className="w-10 h-10 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] flex items-center justify-center text-[#10b981] mb-4 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2c2825] mb-1.5">Containment & Verification</h3>
              <p className="text-xs text-[#7a6f63] leading-relaxed">
                Action is executed and immediately re-verified in the graph to prove threat paths to crown jewels are severed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Why FalkorDB? */}
      <section id="falkordb" className="py-20 border-t border-[#d9d0c0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#10b981] px-3 py-1 rounded-full bg-[#ede8dc] border border-[#d9d0c0]">
                Core Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2c2825] tracking-tight">
                Why We Chose FalkorDB as the Grounding Foundation
              </h2>
              <p className="text-[#7a6f63] text-base leading-relaxed">
                Cyber defense cannot tolerate slow relational joins or high-latency cloud queries when adversaries move laterally in seconds. FalkorDB delivers the raw performance and expressive Cypher syntax necessary for real-time defense.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#d4ede3] text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2c2825]">Ultra Low-Latency Cypher Traversals</h4>
                    <p className="text-xs text-[#7a6f63]">
                      Traverse 5-hop attack chains in under 2ms directly in-memory using Redis protocol performance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#d4ede3] text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2c2825]">OpenCypher Standard Compliance</h4>
                    <p className="text-xs text-[#7a6f63]">
                      Clean, standardized Cypher queries for pattern matching, variable-length paths, and property graphs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#d4ede3] text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2c2825]">Isolated Graph Keyspaces</h4>
                    <p className="text-xs text-[#7a6f63]">
                      Multi-tenant graph sandboxing (e.g., preserving 'hackathon' and 'sentinel' side by side on port 6379).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 bg-[#ede8dc] rounded-2xl border border-[#d9d0c0] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#d9d0c0] pb-3">
                  <span className="text-xs font-mono font-bold text-[#10b981]">SENTINEL Cypher Grounding</span>
                  <span className="text-[10px] font-mono text-[#7a6f63]">Port 6379</span>
                </div>
                <pre className="p-4 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] text-xs font-mono text-[#2c2825] overflow-x-auto leading-relaxed">
{`// Trace Lateral Attack Chain to Crown Jewels
MATCH path = (attacker:IPAddress {ip: $source_ip})
  -[r1:CONNECTED_TO*1..3]->(host:Server)
  -[r2:DEPENDS_ON|HOSTS*1..2]->(db:Database {criticality: 'CRITICAL'})
RETURN path, length(path) AS hops,
       [n IN nodes(path) | n.id] AS compromised_chain
ORDER BY hops ASC LIMIT 1;`}
                </pre>
                <div className="flex items-center justify-between text-xs font-mono text-[#7a6f63] pt-1">
                  <span>Execution Time: <strong className="text-[#2c2825]">1.42 ms</strong></span>
                  <span className="text-emerald-700 font-bold">&bull; Real-Time Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Technology Stack */}
      <section id="technology" className="py-20 border-t border-[#d9d0c0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#10b981] px-3 py-1 rounded-full bg-[#ede8dc] border border-[#d9d0c0]">
              Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2c2825] tracking-tight">
              Production Technologies Powering SENTINEL
            </h2>
            <p className="text-[#7a6f63] text-base leading-relaxed">
              Every technology below is actively integrated into the codebase.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-center space-y-2">
              <div className="font-extrabold text-sm text-[#2c2825]">FalkorDB</div>
              <p className="text-xs text-[#7a6f63]">Graph Database Engine</p>
            </div>
            <div className="p-5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-center space-y-2">
              <div className="font-extrabold text-sm text-[#2c2825]">FastAPI</div>
              <p className="text-xs text-[#7a6f63]">Python 3.12 Backend</p>
            </div>
            <div className="p-5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-center space-y-2">
              <div className="font-extrabold text-sm text-[#2c2825]">Next.js 14</div>
              <p className="text-xs text-[#7a6f63]">React App Router</p>
            </div>
            <div className="p-5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-center space-y-2">
              <div className="font-extrabold text-sm text-[#2c2825]">Tailwind CSS</div>
              <p className="text-xs text-[#7a6f63]">Modern UI Styling</p>
            </div>
            <div className="p-5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-center space-y-2">
              <div className="font-extrabold text-sm text-[#2c2825]">ReactFlow</div>
              <p className="text-xs text-[#7a6f63]">Interactive Topology</p>
            </div>
            <div className="p-5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-center space-y-2">
              <div className="font-extrabold text-sm text-[#2c2825]">WebSockets</div>
              <p className="text-xs text-[#7a6f63]">Real-Time Streaming</p>
            </div>
            <div className="p-5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-center space-y-2">
              <div className="font-extrabold text-sm text-[#2c2825]">Docker</div>
              <p className="text-xs text-[#7a6f63]">Container Isolation</p>
            </div>
            <div className="p-5 rounded-xl bg-[#ede8dc] border border-[#d9d0c0] text-center space-y-2">
              <div className="font-extrabold text-sm text-[#2c2825]">Pydantic v2</div>
              <p className="text-xs text-[#7a6f63]">Schema Validation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 border-t border-[#d9d0c0] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#10b981] px-3 py-1 rounded-full bg-[#ede8dc] border border-[#d9d0c0]">
            Defense Console
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#2c2825] tracking-tight">
            Experience Autonomous Cyber Defense Today
          </h2>
          <p className="text-[#7a6f63] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Access the live FalkorDB graph reasoning engine, simulate attack blast radius, and explore autonomous agent workflows.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-[#10b981] hover:bg-[#059669] transition-all shadow-sm"
            >
              <span>Create Operator Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-[#2c2825] bg-[#ede8dc] hover:bg-[#e8e2d6] border border-[#d9d0c0] hover:border-[#10b981] transition-all shadow-sm"
            >
              <LogIn className="w-4 h-4 text-[#10b981]" />
              <span>Sign In to Console</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d9d0c0] bg-[#e4ddd0] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d4ede3] border border-[#10b981] flex items-center justify-center text-[#10b981]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#2c2825]">SENTINEL</div>
              <p className="text-[10px] text-[#7a6f63]">Autonomous AI Cyber Defense System</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#7a6f63]">
            <a href="#about" className="hover:text-[#10b981] transition-colors">
              About
            </a>
            <a href="#features" className="hover:text-[#10b981] transition-colors">
              Features
            </a>
            <a href="#falkordb" className="hover:text-[#10b981] transition-colors">
              FalkorDB
            </a>
            <a
              href="https://github.com/soham10667/SENTINEL-Autonomous-AI-Cyber-Defense-System"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#2c2825] hover:text-[#10b981] font-semibold transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Repo</span>
            </a>
          </div>

          <div className="text-[11px] text-[#7a6f63] font-mono text-center sm:text-right">
            WeMakeDevs &times; FalkorDB
          </div>
        </div>
      </footer>
    </div>
  );
}
