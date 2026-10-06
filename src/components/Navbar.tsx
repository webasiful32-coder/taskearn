import React, { useState } from 'react';
import {
  Coins,
  Bell,
  User as UserIcon,
  LogOut,
  PlusCircle,
  Shield,
  Layers,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  openCreateTaskModal: () => void;
  openWithdrawModal: () => void;
  openDepositModal: () => void;
  openNotificationsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  openCreateTaskModal,
  openWithdrawModal,
  openDepositModal,
  openNotificationsModal,
}) => {
  const { user, logout, quickLogin, unreadCount } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickSwitch, setShowQuickSwitch] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 text-slate-800 shadow-sm shadow-pink-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-400 flex items-center justify-center shadow-md shadow-pink-500/25 group-hover:scale-105 transition-transform">
                <Coins className="w-6 h-6 text-white font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900">
                    Task<span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">Earn</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                    Pro
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">Micro-Jobs & Instant Payouts</p>
              </div>
            </button>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4">
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'explore'
                    ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 border border-pink-200 shadow-sm'
                    : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/60'
                }`}
              >
                Browse Tasks
              </button>

              {user && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 border border-pink-200 shadow-sm'
                        : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/60'
                    }`}
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={() => setActiveTab('submissions')}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === 'submissions'
                        ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 border border-pink-200 shadow-sm'
                        : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/60'
                    }`}
                  >
                    My Submissions
                  </button>

                  {(user.role === 'CREATOR' || user.role === 'ADMIN') && (
                    <button
                      onClick={() => setActiveTab('creator')}
                      className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === 'creator'
                          ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 border border-pink-200 shadow-sm'
                          : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/60'
                      }`}
                    >
                      Creator Studio
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('wallet')}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === 'wallet'
                        ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 border border-pink-200 shadow-sm'
                        : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/60'
                    }`}
                  >
                    Wallet
                  </button>

                  <button
                    onClick={() => setActiveTab('referrals')}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === 'referrals'
                        ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 border border-pink-200 shadow-sm'
                        : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/60'
                    }`}
                  >
                    Referrals (8%)
                  </button>

                  {user.role === 'ADMIN' && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'admin'
                          ? 'bg-pink-100 text-pink-800 border border-pink-300'
                          : 'text-pink-700 hover:bg-pink-50'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-pink-600" />
                      Admin Control
                    </button>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher helper pill */}
            <div className="relative">
              <button
                onClick={() => setShowQuickSwitch(!showQuickSwitch)}
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-pink-50/80 border border-pink-200 text-slate-700 hover:text-pink-700 hover:border-pink-300 transition-all cursor-pointer shadow-sm"
                title="Quickly test with demo accounts"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showQuickSwitch && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-pink-100 shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-pink-50">
                    One-Click Demo Roles
                  </div>
                  <button
                    onClick={async () => {
                      await quickLogin('worker@taskearn.com');
                      setShowQuickSwitch(false);
                      setActiveTab('dashboard');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-pink-50 text-slate-700 flex flex-col cursor-pointer transition-colors"
                  >
                    <span className="font-semibold text-pink-600">Alex Rivera (Earner / Worker)</span>
                    <span className="text-[10px] text-slate-400">Submits tasks & withdraws rewards</span>
                  </button>
                  <button
                    onClick={async () => {
                      await quickLogin('creator@taskearn.com');
                      setShowQuickSwitch(false);
                      setActiveTab('creator');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-pink-50 text-slate-700 flex flex-col cursor-pointer transition-colors"
                  >
                    <span className="font-semibold text-rose-600">Apex Growth (Task Creator)</span>
                    <span className="text-[10px] text-slate-400">Posts tasks & reviews submissions</span>
                  </button>
                  <button
                    onClick={async () => {
                      await quickLogin('admin@taskearn.com');
                      setShowQuickSwitch(false);
                      setActiveTab('admin');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-pink-50 text-slate-700 flex flex-col cursor-pointer transition-colors"
                  >
                    <span className="font-semibold text-purple-600">Elena Vance (System Admin)</span>
                    <span className="text-[10px] text-slate-400">Full finance & user moderation</span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <>
                {/* Balance Pill with White & Pink Gradient */}
                <div className="flex items-center gap-2.5 bg-gradient-to-r from-pink-50/90 via-white to-rose-50/90 border border-pink-200/90 rounded-2xl px-3.5 py-1.5 shadow-sm">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {user.role === 'CREATOR' ? 'Escrow Balance' : 'Available'}
                    </div>
                    <div className="text-sm font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                      ${user.balance.toFixed(2)}
                    </div>
                  </div>
                  {user.role === 'USER' ? (
                    <button
                      onClick={openWithdrawModal}
                      className="p-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:brightness-105 shadow-sm shadow-pink-500/20 transition-all cursor-pointer"
                      title="Request Withdrawal"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={openDepositModal}
                      className="p-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:brightness-105 shadow-sm shadow-pink-500/20 transition-all cursor-pointer"
                      title="Add Funds"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Post Task Button for Creators */}
                {(user.role === 'CREATOR' || user.role === 'ADMIN') && (
                  <button
                    onClick={openCreateTaskModal}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white font-bold text-sm shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post Task</span>
                  </button>
                )}

                {/* Notifications Bell */}
                <button
                  onClick={openNotificationsModal}
                  className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-pink-50 transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center animate-pulse shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* User Avatar & Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-pink-50 transition-colors cursor-pointer"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-pink-300 bg-pink-50 object-cover shadow-sm"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-pink-100 shadow-2xl py-2 z-50 text-sm">
                      <div className="px-4 py-2.5 border-b border-pink-50">
                        <p className="font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                          Role: {user.role}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-pink-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Layers className="w-4 h-4 text-pink-500" />
                        Dashboard
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('wallet');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-pink-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Coins className="w-4 h-4 text-pink-500" />
                        Wallet & Earnings
                      </button>

                      {user.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            setActiveTab('admin');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-pink-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-pink-600" />
                          Admin Panel
                        </button>
                      )}

                      <div className="border-t border-pink-50 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-pink-50 transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
