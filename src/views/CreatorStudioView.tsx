import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Coins,
  Layers,
  Trash2,
  Eye,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { Task, Submission } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface CreatorStudioViewProps {
  openCreateTaskModal: () => void;
  openDepositModal: () => void;
}

export const CreatorStudioView: React.FC<CreatorStudioViewProps> = ({
  openCreateTaskModal,
  openDepositModal,
}) => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'submissions' | 'tasks'>('submissions');

  // Review modal state
  const [reviewingSub, setReviewingSub] = useState<Submission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('Proof verified successfully. Thank you!');
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchCreatorData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.getTasks({ creatorId: user.id });
      if (res.success && res.tasks) {
        setTasks(res.tasks);

        // Fetch submissions for all tasks created by this user
        const allSubs: Submission[] = [];
        for (const t of res.tasks) {
          const subRes = await api.getTaskSubmissions(t.id);
          if (subRes.success && subRes.submissions) {
            allSubs.push(...subRes.submissions);
          }
        }
        setSubmissions(allSubs);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorData();
  }, [user]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSub) return;

    setIsProcessing(true);
    try {
      const res = await api.reviewSubmission(reviewingSub.id, {
        status: reviewAction,
        reviewNotes: reviewNotes.trim(),
      });

      if (res.success) {
        success(`Submission marked as ${reviewAction}!`);
        setReviewingSub(null);
        await refreshUser();
        await fetchCreatorData();
      } else {
        error(res.message || 'Review failed');
      }
    } catch (err: any) {
      error(err.message || 'Error updating submission');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelTask = async (taskId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to cancel "${title}"? Any unspent escrow will be refunded to your balance.`)) {
      return;
    }

    try {
      const res = await api.cancelTask(taskId);
      if (res.success) {
        success(res.message || 'Task cancelled and remaining escrow refunded.');
        await refreshUser();
        await fetchCreatorData();
      } else {
        error(res.message || 'Failed to cancel task');
      }
    } catch (err: any) {
      error(err.message || 'Error cancelling task');
    }
  };

  const pendingSubmissions = submissions.filter((s) => s.status === 'PENDING');

  return (
    <div className="space-y-8 pb-16">
      {/* Creator Studio Banner with White & Pink Gradient */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-white via-pink-50/80 to-rose-50/80 border border-pink-200/90 shadow-md shadow-pink-100/40">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Creator Studio & Escrow Hub</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
              Employer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Post verified jobs, review proof submissions, and manage escrow funding
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right pr-2">
            <div className="text-[10px] uppercase font-bold text-slate-400">Escrow Capital</div>
            <div className="text-lg font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              ${user?.balance.toFixed(2) || '0.00'}
            </div>
          </div>
          <button
            onClick={openDepositModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 hover:border-pink-300 transition-all cursor-pointer shadow-xs"
          >
            Deposit Escrow
          </button>
          <button
            onClick={openCreateTaskModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white flex items-center gap-1.5 shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Task</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-3 border-b border-pink-100 pb-2">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Pending Proof Reviews</span>
          {pendingSubmissions.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-pink-600 font-black text-[10px] flex items-center justify-center shadow-xs">
              {pendingSubmissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>My Campaigns ({tasks.length})</span>
        </button>
      </div>

      {/* Review Tab Content */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-pink-600 text-sm">
              <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-rose-400 rounded-full animate-spin mb-3 shadow-md" />
              <p>Loading worker proofs...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white border border-pink-200 p-8 space-y-2 shadow-md shadow-pink-100/40">
              <CheckCircle2 className="w-10 h-10 text-pink-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No submissions to review</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When workers accept your tasks and submit screenshots or answers, they will appear here for one-click verification.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-3xl bg-white border border-pink-200/90 hover:border-pink-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md shadow-pink-100/30"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{sub.taskTitle}</h4>
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

                    <div className="text-xs text-slate-500">
                      <span>Worker: <strong className="text-slate-800">{sub.user?.name || sub.workerName || 'Worker'}</strong></span>
                      <span className="mx-2">•</span>
                      <span>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </div>

                    {sub.proofText && (
                      <div className="p-3 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs font-mono text-slate-800 mt-2">
                        {sub.proofText}
                      </div>
                    )}

                    {sub.proofUrls && sub.proofUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {sub.proofUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-pink-600 hover:text-pink-700 flex items-center gap-1 text-xs underline font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Attachment #{i + 1}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right pr-2">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Reward</div>
                      <div className="text-base font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                        ${(sub.taskReward || sub.rewardPaid || 0).toFixed(2)}
                      </div>
                    </div>

                    {sub.status === 'PENDING' ? (
                      <button
                        onClick={() => {
                          setReviewingSub(sub);
                          setReviewAction('APPROVED');
                          setReviewNotes('Proof verified successfully. Thank you!');
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer"
                      >
                        Review Proof
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Reviewed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab Content */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white border border-pink-200 p-8 space-y-2 shadow-md shadow-pink-100/40">
              <Layers className="w-10 h-10 text-pink-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No campaigns created yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Launch your first micro-task campaign to get testers, survey responses, or community growth.
              </p>
              <button
                onClick={openCreateTaskModal}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer"
              >
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => {
                const percentage = Math.round((task.completedSlots / task.totalSlots) * 100);
                return (
                  <div
                    key={task.id}
                    className="p-5 rounded-3xl bg-white border border-pink-200/90 hover:border-pink-300 transition-all space-y-3 shadow-md shadow-pink-100/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                          {task.category.replace('_', ' ')}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base mt-2 line-clamp-1">
                          {task.title}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          task.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">
                        Reward: <strong className="text-slate-800">${task.rewardAmount.toFixed(2)}</strong> per slot
                      </span>
                      <span className="text-slate-500">
                        {task.completedSlots} / {task.totalSlots} Slots Completed
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-pink-100/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-pink-100 text-xs">
                      <div className="text-slate-400">
                        Escrow: ${(task.rewardAmount * task.totalSlots).toFixed(2)}
                      </div>

                      {task.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancelTask(task.id, task.title)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancel & Refund Escrow</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review Modal with White & Pink Gradient Theme */}
      {reviewingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-pink-200 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-pink-600" />
                <span>Review Worker Proof</span>
              </h3>
              <button
                onClick={() => setReviewingSub(null)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-600">
                Task: <strong className="text-slate-900">{reviewingSub.taskTitle}</strong>
              </div>
              <div className="text-xs text-slate-600">
                Worker: <strong className="text-slate-900">{reviewingSub.user?.name || reviewingSub.workerName || 'Worker'}</strong>
              </div>

              {reviewingSub.proofText && (
                <div className="p-3 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs font-mono text-slate-800 max-h-40 overflow-y-auto">
                  {reviewingSub.proofText}
                </div>
              )}

              {reviewingSub.proofUrls && reviewingSub.proofUrls.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Attachments:</div>
                  {reviewingSub.proofUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-pink-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{url}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('APPROVED')}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reviewAction === 'APPROVED'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25'
                        : 'bg-white border border-pink-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Payout</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('REJECTED')}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reviewAction === 'REJECTED'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                        : 'bg-white border border-pink-200 text-slate-600'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Proof</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback to Worker</label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide comments or explanation..."
                  className="w-full bg-white border border-pink-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/15"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingSub(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
