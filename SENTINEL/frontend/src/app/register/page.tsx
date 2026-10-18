'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle, Activity, BadgeCheck } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    clearanceLevel: 'analyst',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordStrength = (pw: string) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f0e8] flex items-center justify-center relative overflow-hidden py-10">

      {/* Animated Background */}
      <div className="absolute inset-0 cyber-grid opacity-60" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.6s ease forwards; }
        @keyframes scanline {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>

      {/* Scanline */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent top-0 animate-[scanline_5s_linear_infinite]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">

        {/* Success State */}
        {success ? (
          <div className="fade-in-up text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#d4ede3] border border-[#10b981] shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-6">
              <CheckCircle className="w-10 h-10 text-[#10b981]" />
            </div>
            <h2 className="text-2xl font-bold text-[#2c2825] mb-2">Access Request Submitted</h2>
            <p className="text-[#7a6f63] text-sm font-mono mb-2">Your operator credentials have been registered.</p>
            <p className="text-[#7a6f63] text-xs font-mono mb-8">Clearance verification will be processed by command.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10b981] text-[#f5f0e8] font-bold text-sm font-mono hover:bg-[#059669] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
            >
              <Shield className="w-4 h-4" />
              PROCEED TO LOGIN
            </Link>
          </div>
        ) : (
          <>
            {/* Logo */}
            <div className="text-center mb-7 fade-in-up">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#d4ede3] border border-[#10b981] shadow-[0_0_30px_rgba(16,185,129,0.2)] mb-3">
                <Shield className="w-7 h-7 text-[#10b981]" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-[#2c2825] tracking-widest">SENTINEL</h1>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#ede8dc] border border-[#d9d0c0] text-[#10b981] font-bold">v2.0</span>
              </div>
              <p className="text-[#7a6f63] text-xs font-mono">Operator Clearance Registration</p>
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <Activity className="w-3 h-3 text-[#10b981] animate-pulse" />
                <span className="text-[10px] text-[#10b981] font-mono uppercase tracking-wider">Secure Enrollment Portal</span>
              </div>
            </div>

            {/* Register Card */}
            <div
              className="fade-in-up bg-[#ede8dc]/90 backdrop-blur-xl border border-[#d9d0c0] rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5),0_0_30px_rgba(16,185,129,0.05)]"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#2c2825] mb-1">Create Operator Account</h2>
                <p className="text-[#7a6f63] text-xs font-mono">Register for access to the SENTINEL defense console</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-red-900/20 border border-red-800/50 text-red-400 text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7a6f63] mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                    <input
                      id="register-name"
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Sarah Connor"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f5f0e8] border border-[#d9d0c0] text-[#2c2825] placeholder-[#a09080] text-sm font-mono focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7a6f63] mb-1.5">Operator Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                    <input
                      id="register-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="operator@sentinel.gov"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f5f0e8] border border-[#d9d0c0] text-[#2c2825] placeholder-[#a09080] text-sm font-mono focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all"
                    />
                  </div>
                </div>

                {/* Clearance Level */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7a6f63] mb-1.5">Clearance Level</label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                    <select
                      id="register-clearance"
                      value={form.clearanceLevel}
                      onChange={(e) => setForm({ ...form, clearanceLevel: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f5f0e8] border border-[#d9d0c0] text-[#2c2825] text-sm font-mono focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all appearance-none cursor-pointer"
                    >
                      <option value="analyst">Analyst — Read Only</option>
                      <option value="operator">Operator — Standard Access</option>
                      <option value="admin">Admin — Full Command</option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7a6f63] mb-1.5">Access Code</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min. 8 characters"
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#f5f0e8] border border-[#d9d0c0] text-[#2c2825] placeholder-[#a09080] text-sm font-mono focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a6f63] hover:text-[#10b981] transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-[#d9d0c0]'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-[#7a6f63]">Strength: <span className={strength >= 3 ? 'text-emerald-400' : strength === 2 ? 'text-yellow-400' : 'text-red-400'}>{strengthLabel}</span></span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7a6f63] mb-1.5">Confirm Access Code</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                    <input
                      id="register-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repeat access code"
                      className={`w-full pl-10 pr-12 py-3 rounded-xl bg-[#f5f0e8] border text-[#2c2825] placeholder-[#a09080] text-sm font-mono focus:outline-none transition-all ${
                        form.confirmPassword
                          ? form.confirmPassword === form.password
                            ? 'border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]'
                            : 'border-red-500/60 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                          : 'border-[#d9d0c0] focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a6f63] hover:text-[#10b981] transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2.5 text-xs font-mono text-[#7a6f63] cursor-pointer group mt-1">
                  <input id="register-terms" type="checkbox" required className="mt-0.5 w-3.5 h-3.5 accent-[#10b981] rounded shrink-0" />
                  <span className="group-hover:text-[#2c2825] transition-colors leading-relaxed">
                    I agree to the SENTINEL{' '}
                    <a href="#" className="text-[#10b981] hover:text-[#34d399]">Operator Terms of Service</a>{' '}
                    and acknowledge all actions are logged.
                  </span>
                </label>

                {/* Submit */}
                <button
                  id="register-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 mt-1 rounded-xl bg-[#10b981] text-[#f5f0e8] font-bold text-sm tracking-wider font-mono hover:bg-[#059669] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.5)] hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#f5f0e8]/30 border-t-[#f5f0e8] rounded-full animate-spin" />
                      REGISTERING OPERATOR...
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-4 h-4" />
                      REQUEST ACCESS CLEARANCE
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#d9d0c0]" />
                <span className="text-[10px] text-[#a09080] font-mono uppercase tracking-wider">existing operator?</span>
                <div className="flex-1 h-px bg-[#d9d0c0]" />
              </div>

              <p className="text-center text-xs font-mono text-[#7a6f63]">
                Already have clearance?{' '}
                <Link href="/login" className="text-[#10b981] hover:text-[#34d399] font-bold transition-colors">
                  Sign in to console →
                </Link>
              </p>
            </div>

            {/* Footer */}
            <p className="text-center text-[10px] text-[#a09080] font-mono mt-5">
              SENTINEL v2.0 · WeMakeDevs × FalkorDB · Track 1 · All sessions are monitored and logged
            </p>
          </>
        )}
      </div>
    </div>
  );
}
