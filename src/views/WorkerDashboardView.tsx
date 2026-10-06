import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Clock,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Share2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Submission, Task } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface WorkerDashboardViewProps {
  onNavigate: (tab: string) => void;
  openWithdrawModal: () => void;
  onSelectTask: (task: Task) => void;
}

export const WorkerDashboardView: React.FC<WorkerDashboardViewProps> = ({
  onNavigate,
  openWithdrawModal,
  onSelectTask,
}) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subRes, taskRes] = await Promise.all([
          api.getMySubmissions(),
          api.getTasks(),
        ]);
        if (subRes.success && subRes.submissions) {
          setSubmissions(subRes.submissions);
        }
        if (taskRes.success && taskRes.tasks) {
          setTasks(taskRes.tasks.slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Bar with White & Pink Gradient Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-white via-pink-50/80 to-rose-50/80 border border-pink-200/90 shadow-lg shadow-pink-100/40">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            alt={user.name}
            className="w-14 h-14 rounded-2xl border-2 border-pink-300 bg-white object-cover shadow-md shadow-pink-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Hello, {user.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                Worker
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ready to claim tasks and earn instant payouts today?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openWithdrawModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white flex items-center gap-1.5 shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw Funds</span>
          </button>
          <button
            onClick={() => onNavigate('explore')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-pink-50 text-slate-700 border border-pink-200 hover:border-pink-300 transition-all cursor-pointer shadow-xs"
          >
            Find Work
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards with White & Pink Gradient Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-3xl bg-white border border-pink-200/90 shadow-md shadow-pink-100/40 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Available Balance</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-100 to-rose-100 text-pink-600 border border-pink-200 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
            ${user.balance.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">Ready for instant withdrawal</div>
        </div>

        {/* Pending Review */}
        <div className="p-5 rounded-3xl bg-white border border-pink-200/90 shadow-md shadow-pink-100/40 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            ${user.pendingEarnings.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">Released once employers approve</div>
        </div>

        {/* Lifetime Earned */}
        <div className="p-5 rounded-3xl bg-white border border-pink-200/90 shadow-md shadow-pink-100/40 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Lifetime Earned</span>
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 border border-pink-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ${user.totalEarned.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">Across all completed tasks</div>
        </div>

        {/* Lifetime Withdrawn */}
        <div className="p-5 rounded-3xl bg-white border border-pink-200/90 shadow-md shadow-pink-100/40 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Withdrawn</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">
            ${user.totalWithdrawn.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">Disbursed to PayPal/Crypto</div>
        </div>
      </div>

      {/* Recommended Tasks Carousel */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-pink-500" />
            <span>Recommended Tasks for You</span>
          </h3>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-semibold text-pink-600 hover:text-pink-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="p-5 rounded-3xl bg-white border border-pink-200/80 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100/50 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">
                    {task.category.replace('_', ' ')}
                  </span>
                  <span className="font-black text-pink-600 text-sm">
                    ${task.rewardAmount.toFixed(2)}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{task.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-pink-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>~{task.timeEstimateMins} mins</span>
                <span className="text-pink-600 font-bold flex items-center gap-1">
                  Start <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Submissions */}
      <section className="p-6 rounded-3xl bg-white border border-pink-200/90 space-y-4 shadow-md shadow-pink-100/40">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-pink-500" />
            <span>Recent Task Submissions</span>
          </h3>
          <button
            onClick={() => onNavigate('submissions')}
            className="text-xs font-semibold text-pink-600 hover:underline cursor-pointer"
          >
            View all submissions
          </button>
        </div>

        {submissions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            You haven't submitted any tasks yet. Browse tasks and submit your first proof to start earning!
          </div>
        ) : (
          <div className="space-y-2.5">
            {submissions.slice(0, 5).map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-pink-200 transition-colors"
              >
                <div>
                  <h4 className="font-bold text-slate-800">{sub.taskTitle}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                    {sub.proofText && ` • Proof: "${sub.proofText.slice(0, 45)}..."`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-pink-600 text-sm">
                    +${(sub.rewardPaid || sub.taskReward || 0).toFixed(2)}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
