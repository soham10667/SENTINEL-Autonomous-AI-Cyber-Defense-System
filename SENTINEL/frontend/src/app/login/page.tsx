'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, Activity } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to dashboard (replace with real auth logic)
      window.location.href = '/';
    }, 1800);
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f0e8] flex items-center justify-center relative overflow-hidden">

      {/* Animated Background Grid */}
      <div className="absolute inset-0 cyber-grid opacity-60" />

      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Animated Scanline */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent top-0 animate-[scanline_4s_linear_infinite]" />
      </div>

      <style jsx>{`
        @keyframes scanline {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease forwards;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md px-6">

        {/* Logo & Branding */}
        <div className="text-center mb-8 fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#d4ede3] border border-[#10b981] shadow-[0_0_30px_rgba(16,185,129,0.2)] mb-4">
            <Shield className="w-8 h-8 text-[#10b981]" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#2c2825] tracking-widest">SENTINEL</h1>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#ede8dc] border border-[#d9d0c0] text-[#10b981] font-bold">v2.0</span>
          </div>
          <p className="text-[#7a6f63] text-sm font-mono">Autonomous Cyber Defense System</p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Activity className="w-3 h-3 text-[#10b981] animate-pulse" />
            <span className="text-[10px] text-[#10b981] font-mono uppercase tracking-wider">Defense Grid Active</span>
          </div>
        </div>

        {/* Login Card */}
        <div
          className="fade-in-up bg-[#ede8dc]/90 backdrop-blur-xl border border-[#d9d0c0] rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5),0_0_30px_rgba(16,185,129,0.05)]"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#2c2825] mb-1">Operator Authentication</h2>
            <p className="text-[#7a6f63] text-xs font-mono">Enter credentials to access the defense console</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-red-900/20 border border-red-800/50 text-red-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7a6f63] mb-1.5">
                Operator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@sentinel.gov"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f5f0e8] border border-[#d9d0c0] text-[#2c2825] placeholder-[#a09080] text-sm font-mono focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7a6f63] mb-1.5">
                Access Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#f5f0e8] border border-[#d9d0c0] text-[#2c2825] placeholder-[#a09080] text-sm font-mono focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a6f63] hover:text-[#10b981] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="flex items-center gap-2 text-[#7a6f63] cursor-pointer group">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-3.5 h-3.5 accent-[#10b981] rounded"
                />
                <span className="group-hover:text-[#2c2825] transition-colors">Keep session active</span>
              </label>
              <a href="#" className="text-[#10b981] hover:text-[#34d399] transition-colors">Reset access code</a>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 rounded-xl bg-[#10b981] text-[#f5f0e8] font-bold text-sm tracking-wider font-mono hover:bg-[#059669] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.5)] hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#f5f0e8]/30 border-t-[#f5f0e8] rounded-full animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  ACCESS DEFENSE CONSOLE
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#d9d0c0]" />
            <span className="text-[10px] text-[#a09080] font-mono uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#d9d0c0]" />
          </div>

          {/* Register Link */}
          <p className="text-center text-xs font-mono text-[#7a6f63]">
            New operator?{' '}
            <Link href="/register" className="text-[#10b981] hover:text-[#34d399] font-bold transition-colors">
              Request access clearance →
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#a09080] font-mono mt-6">
          SENTINEL v2.0 · WeMakeDevs × FalkorDB · Track 1 · All sessions are monitored and logged
        </p>
      </div>
    </div>
  );
}
