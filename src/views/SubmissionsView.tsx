import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, XCircle, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { Submission } from '../types/index.ts';
import { api } from '../lib/api.ts';

export const SubmissionsView: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.getMySubmissions();
      if (res.success && res.submissions) {
        setSubmissions(res.submissions);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter((s) => {
    if (filter === 'ALL') return true;
    return s.status === filter;
  });

  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;
  const approvedCount = submissions.filter((s) => s.status === 'APPROVED').length;
  const rejectedCount = submissions.filter((s) => s.status === 'REJECTED').length;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Task Submissions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track proof verification status and rewards credited to your balance
          </p>
        </div>

        <button
          onClick={fetchSubmissions}
          className="px-4 py-2 rounded-xl bg-white border border-pink-200 text-xs font-semibold text-slate-700 hover:text-pink-600 hover:bg-pink-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-pink-500" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Filter Tabs & Counters with White & Pink Gradient Theme */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'ALL'
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25'
              : 'bg-white border border-pink-200 text-slate-600 hover:text-slate-900 shadow-xs'
          }`}
        >
          All ({submissions.length})
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            filter === 'PENDING'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white border border-pink-200 text-slate-600 hover:text-slate-900 shadow-xs'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Pending Review ({pendingCount})</span>
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            filter === 'APPROVED'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white border border-pink-200 text-slate-600 hover:text-slate-900 shadow-xs'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Approved ({approvedCount})</span>
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            filter === 'REJECTED'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'bg-white border border-pink-200 text-slate-600 hover:text-slate-900 shadow-xs'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Rejected ({rejectedCount})</span>
        </button>
      </div>

      {/* Submissions list */}
      {loading ? (
        <div className="py-20 text-center text-pink-600 text-sm">
          <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-rose-400 rounded-full animate-spin mb-3 shadow-md" />
          <p>Loading submission history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-pink-200 p-8 space-y-2 shadow-md shadow-pink-100/40">
          <Layers className="w-10 h-10 text-pink-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No submissions found</h3>
          <p className="text-xs text-slate-500">
            {filter === 'ALL'
              ? 'You have not submitted work for any tasks yet.'
              : `You have zero submissions in ${filter.toLowerCase()} status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-3xl bg-white border border-pink-200/90 hover:border-pink-300 transition-all space-y-3 shadow-md shadow-pink-100/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{sub.taskTitle}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>Submitted {new Date(sub.submittedAt).toLocaleString()}</span>
                    {sub.reviewedAt && (
                      <>
                        <span>•</span>
                        <span>Reviewed {new Date(sub.reviewedAt).toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                      +${(sub.rewardPaid || sub.taskReward || 0).toFixed(2)}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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

              {/* Proof content */}
              <div className="p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  Your Submitted Proof:
                </div>
                {sub.proofText && (
                  <p className="text-slate-800 font-mono text-xs whitespace-pre-wrap">
                    {sub.proofText}
                  </p>
                )}
                {sub.proofUrls && sub.proofUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {sub.proofUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-pink-600 hover:text-pink-700 flex items-center gap-1 font-semibold text-xs underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Attachment #{i + 1}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Review notes if present */}
              {sub.reviewNotes && (
                <div
                  className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
                    sub.status === 'APPROVED'
                      ? 'bg-pink-50 border border-pink-200 text-pink-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-900'
                  }`}
                >
                  {sub.status === 'APPROVED' ? (
                    <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">Employer Feedback: </span>
                    <span>{sub.reviewNotes}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
