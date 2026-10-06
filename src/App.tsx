import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { TasksExploreView } from './views/TasksExploreView.tsx';
import { WorkerDashboardView } from './views/WorkerDashboardView.tsx';
import { SubmissionsView } from './views/SubmissionsView.tsx';
import { CreatorStudioView } from './views/CreatorStudioView.tsx';
import { WalletView } from './views/WalletView.tsx';
import { ReferralView } from './views/ReferralView.tsx';
import { AdminView } from './views/AdminView.tsx';

import { AuthModal } from './components/modals/AuthModal.tsx';
import { TaskDetailModal } from './components/modals/TaskDetailModal.tsx';
import { CreateTaskModal } from './components/modals/CreateTaskModal.tsx';
import { WithdrawalModal } from './components/modals/WithdrawalModal.tsx';
import { DepositModal } from './components/modals/DepositModal.tsx';
import { NotificationsModal } from './components/modals/NotificationsModal.tsx';
import { Task } from './types/index.ts';
import { ShieldCheck, Coins } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('explore');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Check URL params for referral code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode && !user) {
      setAuthMode('register');
      setIsAuthOpen(true);
    }
  }, [user]);

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff9fb] text-slate-800 antialiased font-sans selection:bg-pink-200 selection:text-pink-900 relative overflow-x-hidden">
      {/* Background ambient soft pink/rose radial orbs on white */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-rose-200/35 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-pink-100/60 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation */}
      <div className="relative z-40">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openAuthModal={openAuth}
          openCreateTaskModal={() => {
            if (!user) openAuth('login');
            else setIsCreateTaskOpen(true);
          }}
          openWithdrawModal={() => {
            if (!user) openAuth('login');
            else setIsWithdrawOpen(true);
          }}
          openDepositModal={() => {
            if (!user) openAuth('login');
            else setIsDepositOpen(true);
          }}
          openNotificationsModal={() => {
            if (!user) openAuth('login');
            else setIsNotificationsOpen(true);
          }}
        />
      </div>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="py-24 text-center text-pink-600">
            <div className="inline-block w-10 h-10 border-4 border-pink-500 border-t-rose-400 rounded-full animate-spin mb-3 shadow-md shadow-pink-200" />
            <p className="text-sm font-semibold text-slate-600">Initializing TaskEarn workspace...</p>
          </div>
        ) : (
          <>
            {activeTab === 'explore' && (
              <TasksExploreView
                onSelectTask={(task) => setSelectedTask(task)}
                openCreateTaskModal={() => {
                  if (!user) openAuth('login');
                  else setIsCreateTaskOpen(true);
                }}
                openAuthModal={() => openAuth('login')}
              />
            )}

            {activeTab === 'dashboard' && (
              <WorkerDashboardView
                onNavigate={(tab) => setActiveTab(tab)}
                openWithdrawModal={() => setIsWithdrawOpen(true)}
                onSelectTask={(task) => setSelectedTask(task)}
              />
            )}

            {activeTab === 'submissions' && <SubmissionsView />}

            {activeTab === 'creator' && (
              <CreatorStudioView
                openCreateTaskModal={() => setIsCreateTaskOpen(true)}
                openDepositModal={() => setIsDepositOpen(true)}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletView
                openWithdrawModal={() => setIsWithdrawOpen(true)}
                openDepositModal={() => setIsDepositOpen(true)}
              />
            )}

            {activeTab === 'referrals' && <ReferralView />}

            {activeTab === 'admin' && <AdminView />}
          </>
        )}
      </main>

      {/* Footer styled in White & Pink Gradient Theme */}
      <footer className="relative z-10 mt-auto border-t border-pink-100 bg-white/90 backdrop-blur-md py-8 text-xs text-slate-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-sm">
              <Coins className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-800">TaskEarn Platform</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1.5 text-pink-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              <span>Escrow Protected Payouts</span>
            </span>
            <span>•</span>
            <span className="text-slate-600 font-medium">REST API & PostgreSQL Ready</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-pink-600 hover:text-pink-700 font-medium hover:underline transition-colors cursor-pointer"
            >
              Browse Tasks
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSubmittedSuccess={() => {
          setSelectedTask(null);
          setActiveTab('submissions');
        }}
        openAuthModal={() => openAuth('login')}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreatedSuccess={() => {
          setIsCreateTaskOpen(false);
          setActiveTab('creator');
        }}
      />

      <WithdrawalModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSuccess={() => {
          setIsWithdrawOpen(false);
          setActiveTab('wallet');
        }}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={() => {
          setIsDepositOpen(false);
        }}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
