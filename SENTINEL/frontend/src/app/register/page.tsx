'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Home
} from 'lucide-react';
import { api, setStoredAuth } from '../../lib/api';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (val: string) => {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(val);
  };

  const calculatePasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-[#10b981]'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setError('Please complete all required fields.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms of service and operator guidelines.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.register(cleanName, cleanEmail, password, 'operator');
      setStoredAuth(res.access_token, res.user);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f0e8] text-[#2c2825] cyber-grid flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header Link */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between mb-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7a6f63] hover:text-[#10b981] transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#10b981] bg-[#ede8dc] px-2.5 py-1 rounded-full border border-[#d9d0c0]">
          <Shield className="w-3.5 h-3.5 text-[#10b981]" />
          <span>SENTINEL</span>
        </div>
      </div>

      {/* Main Register Card */}
      <div className="w-full max-w-lg mx-auto my-auto">
        <div className="bg-[#ede8dc] border border-[#d9d0c0] rounded-2xl p-7 sm:p-9 shadow-sm space-y-6">
          {success ? (
            /* Registration Success View */
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d4ede3] border border-[#10b981] text-[#10b981] mb-2 shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#2c2825]">Operator Registered</h2>
              <p className="text-xs text-[#7a6f63] max-w-sm mx-auto leading-relaxed">
                Your account for <strong>{email}</strong> has been created in FalkorDB. Your operator session is ready.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#10b981] hover:bg-[#059669] transition-all shadow-sm"
                >
                  <span>Enter SENTINEL Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form View */
            <>
              {/* Heading */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#d4ede3] border border-[#10b981] text-[#10b981] shadow-sm mb-1">
                  <Shield className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#2c2825]">
                  Create Operator Account
                </h1>
                <p className="text-xs text-[#7a6f63]">
                  Join the SENTINEL autonomous cyber defense grid.
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
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#2c2825] mb-1.5">
                    Operator Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                    <input
                      id="register-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Sarah Connor"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] text-sm text-[#2c2825] placeholder-[#7a6f63] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#2c2825] mb-1.5">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                    <input
                      id="register-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sarah.connor@sentinel.internal"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#e8e2d6] border border-[#d9d0c0] text-sm text-[#2c2825] placeholder-[#7a6f63] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#2c2825] mb-1.5">
                    Password (Min. 8 characters)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                    <input
                      id="register-password"
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

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`flex-1 rounded-full transition-all ${
                              step <= strength ? strengthColors[strength] : 'bg-[#d9d0c0]'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-[#7a6f63] font-mono flex justify-between">
                        <span>Strength: {strengthLabels[strength]}</span>
                        <span>{password.length >= 8 ? 'Length OK' : 'Min 8 chars'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#2c2825] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6f63]" />
                    <input
                      id="register-confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#e8e2d6] border text-sm text-[#2c2825] placeholder-[#7a6f63] focus:outline-none transition-all ${
                        confirmPassword
                          ? confirmPassword === password
                            ? 'border-[#10b981] focus:ring-1 focus:ring-[#10b981]'
                            : 'border-red-400 focus:ring-1 focus:ring-red-400'
                          : 'border-[#d9d0c0] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a6f63] hover:text-[#2c2825] transition-colors"
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms Acceptance */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-[#7a6f63] cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-[#10b981] focus:ring-[#10b981] border-[#d9d0c0]"
                    />
                    <span className="leading-relaxed">
                      I agree to the{' '}
                      <span className="text-[#10b981] font-semibold hover:underline">
                        Operator Terms of Defense
                      </span>{' '}
                      and accept that all simulated mitigation actions are logged in FalkorDB.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  id="register-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#10b981] hover:bg-[#059669] hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Creating Account in FalkorDB...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Operator Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center text-xs text-[#7a6f63] pt-2 border-t border-[#d9d0c0]">
                Already registered?{' '}
                <Link href="/login" className="font-bold text-[#10b981] hover:underline">
                  Sign in here &rarr;
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-lg mx-auto text-center text-[11px] text-[#7a6f63] font-mono mt-6">
        SENTINEL &bull; Autonomous AI Cyber Defense System
      </footer>
    </div>
  );
}
