import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Coins,
  Receipt,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { AdminMetrics, User, Withdrawal, Task, Submission } from '../types/index.ts';
import { api } from '../lib/api.ts';

export const AdminView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [activeTab, setActiveTab] = useState<'withdrawals' | 'users' | 'tasks' | 'submissions'>('withdrawals');
  const [loading, setLoading] = useState(true);

  // User search/filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Withdrawal action modal
  const [processingWd, setProcessingWd] = useState<Withdrawal | null>(null);
  const [wdAction, setWdAction] = useState<'COMPLETED' | 'REJECTED'>('COMPLETED');
  const [wdTxHash, setWdTxHash] = useState('');
  const [wdAdminNotes, setWdAdminNotes] = useState('');
  const [isProcessingWd, setIsProcessingWd] = useState(false);

  // User edit modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'USER' | 'CREATOR' | 'ADMIN'>('USER');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'BANNED'>('ACTIVE');
  const [balanceAdjustment, setBalanceAdjustment] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [mRes, uRes, wRes, tRes, sRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(),
        api.getAdminWithdrawals(),
        api.getAdminTasks(),
        api.getAdminSubmissions(),
      ]);

      if (mRes.success) setMetrics(mRes.metrics);
      if (uRes.success) setUsers(uRes.users);
      if (wRes.success) setWithdrawals(wRes.withdrawals);
      if (tRes.success) setTasks(tRes.tasks);
      if (sRes.success) setSubmissions(sRes.submissions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="py-20 text-center space-y-3">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Access Denied</h3>
        <p className="text-xs text-slate-500">
          Administrator privileges are required to view this panel.
        </p>
      </div>
    );
  }

  const handleProcessWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingWd) return;

    setIsProcessingWd(true);
    try {
      const res = await api.processAdminWithdrawal(processingWd.id, {
        status: wdAction,
        transactionHash: wdTxHash.trim() || undefined,
        adminNotes: wdAdminNotes.trim() || undefined,
      });

      if (res.success) {
        success(`Withdrawal marked as ${wdAction}!`);
        setProcessingWd(null);
        await fetchAdminData();
      } else {
        error(res.message || 'Processing failed');
      }
    } catch (err: any) {
      error(err.message || 'Error updating withdrawal');
    } finally {
      setIsProcessingWd(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSavingUser(true);
    try {
      const res = await api.updateAdminUser(editingUser.id, {
        role: newRole,
        status: newStatus,
        balanceAdjustment: Number(balanceAdjustment) || 0,
        adjustmentReason: adjustmentReason.trim() || undefined,
      });

      if (res.success) {
        success('User settings updated successfully!');
        setEditingUser(null);
        await fetchAdminData();
      } else {
        error(res.message || 'Failed to update user');
      }
    } catch (err: any) {
      error(err.message || 'Error updating user');
    } finally {
      setIsSavingUser(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Header with White & Pink Gradient */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-white via-pink-50/80 to-rose-50/80 border border-pink-200/90 shadow-md shadow-pink-100/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/25">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">System Administrator Control Panel</h2>
            <p className="text-xs text-slate-500">
              Platform-wide moderation, withdrawal disbursements, and ledger oversight
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-pink-50 text-slate-700 border border-pink-200 hover:border-pink-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-pink-600" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Admin Metrics Cards with White & Pink Gradient Theme */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-pink-200/90 space-y-1 shadow-md shadow-pink-100/30">
            <div className="text-xs font-semibold text-slate-500">Total Platform Users</div>
            <div className="text-2xl font-black text-slate-900">{metrics.totalUsers}</div>
            <div className="text-[11px] text-slate-400">Registered workers & creators</div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-pink-200/90 space-y-1 shadow-md shadow-pink-100/30">
            <div className="text-xs font-semibold text-slate-500">Total Platform Earnings</div>
            <div className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              ${(metrics.totalEarned || metrics.totalPaidOut || 0).toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400">Paid out to verified earners</div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-pink-200/90 space-y-1 shadow-md shadow-pink-100/30">
            <div className="text-xs font-semibold text-slate-500">Pending Withdrawals</div>
            <div className="text-2xl font-black text-rose-600">
              {metrics.pendingWithdrawalsCount}
            </div>
            <div className="text-[11px] text-slate-400">Awaiting disbursement review</div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-pink-200/90 space-y-1 shadow-md shadow-pink-100/30">
            <div className="text-xs font-semibold text-slate-500">Pending Task Proofs</div>
            <div className="text-2xl font-black text-amber-600">
              {metrics.pendingSubmissionsCount}
            </div>
            <div className="text-[11px] text-slate-400">Across all active campaigns</div>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-pink-100 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'withdrawals'
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50'
          }`}
        >
          Withdrawal Requests ({withdrawals.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50'
          }`}
        >
          User Accounts ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50'
          }`}
        >
          All Tasks ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50'
          }`}
        >
          All Submissions ({submissions.length})
        </button>
      </div>

      {/* Tab 1: Withdrawals */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          {withdrawals.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white border border-pink-200 p-8 space-y-2 shadow-md shadow-pink-100/40">
              <CheckCircle2 className="w-10 h-10 text-pink-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No withdrawal requests found</h3>
              <p className="text-xs text-slate-500">All withdrawal requests have been processed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((wd) => (
                <div
                  key={wd.id}
                  className="p-5 rounded-3xl bg-white border border-pink-200/90 hover:border-pink-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md shadow-pink-100/30"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        ${wd.amount.toFixed(2)} USD
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          wd.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : wd.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {wd.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      <span>User: <strong className="text-slate-800">{wd.user?.name || wd.userName || wd.userId}</strong></span>
                      <span className="mx-2">•</span>
                      <span>Method: <strong className="text-pink-600">{wd.paymentMethod || wd.method}</strong></span>
                      <span className="mx-2">•</span>
                      <span>Destination: <code className="text-slate-800 font-semibold">{wd.accountDetails}</code></span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Requested {new Date(wd.createdAt || wd.requestedAt || Date.now()).toLocaleString()} • Payout net:{' '}
                      <strong className="text-slate-700">${(wd.amount - wd.fee).toFixed(2)}</strong> (Fee: ${wd.fee.toFixed(2)})
                    </div>

                    {wd.transactionHash && (
                      <div className="text-[11px] font-mono text-pink-700">
                        Tx Hash: {wd.transactionHash}
                      </div>
                    )}
                  </div>

                  {wd.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        setProcessingWd(wd);
                        setWdAction('COMPLETED');
                        setWdTxHash('');
                        setWdAdminNotes('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer"
                    >
                      Process Payout
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="w-4 h-4 text-pink-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full bg-white border border-pink-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/15"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-pink-200 text-xs shadow-xs">
              {['ALL', 'USER', 'CREATOR', 'ADMIN'].map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    userRoleFilter === r
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-3xl bg-white border border-pink-200/90 hover:border-pink-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-pink-100/30"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                    alt={u.name}
                    className="w-10 h-10 rounded-full border border-pink-300 bg-pink-50 object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                        {u.role}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          u.status === 'ACTIVE'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-rose-700 bg-rose-50 border border-rose-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{u.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Balance</div>
                    <div className="text-sm font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                      ${u.balance.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingUser(u);
                      setNewRole(u.role);
                      setNewStatus(u.status);
                      setBalanceAdjustment(0);
                      setAdjustmentReason('');
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 hover:border-pink-300 transition-colors cursor-pointer shadow-xs"
                  >
                    Edit / Adjust
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-3xl bg-white border border-pink-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-pink-100/30"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  Category: <strong className="text-slate-800">{task.category}</strong> • Reward: <strong className="text-pink-600">${task.rewardAmount.toFixed(2)}</strong> • Slots: {task.completedSlots}/{task.totalSlots}
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  task.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {task.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Submissions */}
      {activeTab === 'submissions' && (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 rounded-3xl bg-white border border-pink-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-pink-100/30"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{sub.taskTitle}</h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  Worker: <strong className="text-slate-800">{sub.user?.name || sub.workerName || sub.userId}</strong> • Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                </div>
                {sub.proofText && (
                  <div className="text-xs font-mono text-slate-800 mt-1 max-w-xl truncate">
                    {sub.proofText}
                  </div>
                )}
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  sub.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : sub.status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {sub.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Process Withdrawal */}
      {processingWd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Disburse Withdrawal</h3>
              <button
                onClick={() => setProcessingWd(null)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              <div>Amount: <strong className="text-slate-900">${processingWd.amount.toFixed(2)}</strong></div>
              <div>Net to send: <strong className="text-pink-600">${(processingWd.amount - processingWd.fee).toFixed(2)}</strong></div>
              <div>Destination: <code className="text-slate-800 font-semibold">{processingWd.accountDetails} ({processingWd.paymentMethod || processingWd.method})</code></div>
            </div>

            <form onSubmit={handleProcessWithdrawal} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWdAction('COMPLETED')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      wdAction === 'COMPLETED'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25'
                        : 'bg-white border border-pink-200 text-slate-600'
                    }`}
                  >
                    Mark Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => setWdAction('REJECTED')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      wdAction === 'REJECTED'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                        : 'bg-white border border-pink-200 text-slate-600'
                    }`}
                  >
                    Reject & Refund
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction Hash / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={wdTxHash}
                  onChange={(e) => setWdTxHash(e.target.value)}
                  placeholder="e.g. 0x8f... or PayPal TxID"
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Notes</label>
                <input
                  type="text"
                  value={wdAdminNotes}
                  onChange={(e) => setWdAdminNotes(e.target.value)}
                  placeholder="Optional internal remark"
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/15"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProcessingWd(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingWd}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer"
                >
                  {isProcessingWd ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Moderate User: {editingUser.name}</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">User Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
                >
                  <option value="USER">USER (Worker)</option>
                  <option value="CREATOR">CREATOR (Employer)</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="BANNED">BANNED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjust Balance (+ or - USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={balanceAdjustment}
                  onChange={(e) => setBalanceAdjustment(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5.00 or -5.00"
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500"
                />
              </div>

              {balanceAdjustment !== 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adjustment Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="e.g. Disputed task refund or promotional reward"
                    className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer"
                >
                  {isSavingUser ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
