'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Home
} from 'lucide-react';
import { api, setStoredAuth } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (val: string) => {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid operator email address (e.g. analyst@sentinel.internal).');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.login(cleanEmail, password, rememberMe);
      setStoredAuth(res.access_token, res.user);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f0e8] text-[#2c2825] cyber-grid flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header Link */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between mb-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7a6f63] hover:text-[#10b981] transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#10b981] bg-[#ede8dc] px-2.5 py-1 rounded-full border border-[#d9d0c0]">
          <Shield className="w-3.5 h-3.5 text-[#10b981]" />
          <span>SENTINEL</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="bg-[#ede8dc] border border-[#d9d0c0] rounded-2xl p-7 sm:p-8 shadow-sm space-y-6">
          {/* Logo & Heading */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#d4ede3] border border-[#10b981] text-[#10b981] shadow-sm mb-1">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#2c2825]">
              Operator Authentication
            </h1>
            <p className="text-xs text-[#7a6f63]">
              Sign in to access your FalkorDB-grounded defense console.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-[#2c2825] mb-1.5">
                Operator Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@sentinel.internal"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] text-sm text-[#2c2825] placeholder-[#7a6f63] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#2c2825]">
                  Security Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] text-sm text-[#2c2825] placeholder-[#7a6f63] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a6f63] hover:text-[#2c2825] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#7a6f63] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#10b981] focus:ring-[#10b981] border-[#d9d0c0]"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#10b981] hover:bg-[#059669] hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Defense Grid</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center text-xs text-[#7a6f63] pt-2 border-t border-[#d9d0c0]">
            Don't have an operator account?{' '}
            <Link href="/register" className="font-bold text-[#10b981] hover:underline">
              Register New Operator &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center text-[11px] text-[#7a6f63] font-mono mt-6">
        SENTINEL &bull; FalkorDB Graph Grounded Defense &bull; Secure Session
      </footer>
    </div>
  );
}
