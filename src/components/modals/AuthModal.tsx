import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
}) => {
  const { login, register, quickLogin } = useAuth();
  const { success, error } = useToast();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'CREATOR'>('USER');
  const [referralCode, setReferralCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        success('Welcome back! Logged in successfully.');
        onClose();
      } else {
        error(res.message || 'Login failed');
      }
    } else {
      const res = await register({
        name,
        email,
        password,
        role,
        referralCode: referralCode.trim() || undefined,
      });
      setLoading(false);
      if (res.success) {
        success(`Welcome to TaskEarn, ${name}! Your account is ready.`);
        onClose();
      } else {
        error(res.message || 'Registration failed');
      }
    }
  };

  const handleDemoLogin = async (demoEmail: string, label: string) => {
    setLoading(true);
    const res = await quickLogin(demoEmail);
    setLoading(false);
    if (res.success) {
      success(`Switched to ${label}`);
      onClose();
    } else {
      error(res.message || 'Demo login failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pink-100 bg-pink-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {mode === 'login' ? 'Sign in to TaskEarn' : 'Create an Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'login'
                ? 'Access your micro-tasks, balance and withdrawals'
                : 'Start earning or post jobs to thousands of workers'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch with White & Pink gradient indicator */}
        <div className="flex border-b border-pink-100 bg-white p-1.5">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* One-click demo logins */}
        <div className="p-4 bg-pink-50/50 border-b border-pink-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
            <span>Instant Demo Accounts (Zero Setup):</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('worker@taskearn.com', 'Alex Rivera (Worker)')}
              className="px-2 py-1.5 rounded-xl bg-white hover:bg-pink-100/50 border border-pink-200 text-[11px] font-semibold text-pink-700 transition-colors flex flex-col items-center cursor-pointer shadow-xs"
            >
              <span>Worker</span>
              <span className="text-[9px] text-slate-400 font-normal">Alex Rivera</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('creator@taskearn.com', 'Apex Growth (Creator)')}
              className="px-2 py-1.5 rounded-xl bg-white hover:bg-pink-100/50 border border-pink-200 text-[11px] font-semibold text-rose-700 transition-colors flex flex-col items-center cursor-pointer shadow-xs"
            >
              <span>Creator</span>
              <span className="text-[9px] text-slate-400 font-normal">Apex Labs</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@taskearn.com', 'Elena Vance (Admin)')}
              className="px-2 py-1.5 rounded-xl bg-white hover:bg-pink-100/50 border border-pink-200 text-[11px] font-semibold text-purple-700 transition-colors flex flex-col items-center cursor-pointer shadow-xs"
            >
              <span>Admin</span>
              <span className="text-[9px] text-slate-400 font-normal">Elena Vance</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Smith"
                    className="w-full bg-white border border-pink-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`py-2 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      role === 'USER'
                        ? 'bg-pink-100 border-pink-300 text-pink-800 shadow-xs'
                        : 'bg-white border-pink-200 text-slate-600'
                    }`}
                  >
                    {role === 'USER' && <Check className="w-3.5 h-3.5" />}
                    Task Earner (Worker)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('CREATOR')}
                    className={`py-2 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      role === 'CREATOR'
                        ? 'bg-pink-100 border-pink-300 text-pink-800 shadow-xs'
                        : 'bg-white border-pink-200 text-slate-600'
                    }`}
                  >
                    {role === 'CREATOR' && <Check className="w-3.5 h-3.5" />}
                    Employer (Creator)
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-white border border-pink-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/15"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-pink-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/15"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="EARN2026"
                className="w-full bg-white border border-pink-200 rounded-2xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Processing...</span>
            ) : mode === 'login' ? (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Create Verified Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
