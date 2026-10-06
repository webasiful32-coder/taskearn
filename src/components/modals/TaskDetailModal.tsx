import React, { useState } from 'react';
import {
  X,
  Clock,
  Users,
  Coins,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Send,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { Task } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { api } from '../../lib/api.ts';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onSubmittedSuccess: () => void;
  openAuthModal: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onSubmittedSuccess,
  openAuthModal,
}) => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [proofText, setProofText] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!task) return null;

  const isFull = task.completedSlots >= task.totalSlots;
  const isCreator = user && user.id === task.creatorId;
  const hasSubmitted = task.hasSubmitted;
  const percentage = Math.round((task.completedSlots / task.totalSlots) * 100);

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    if (!proofText.trim() && !proofUrl.trim()) {
      error('Please provide proof (answer, code, or image link)');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitTaskProof({
        taskId: task.id,
        proofText: proofText.trim() || undefined,
        proofUrls: proofUrl.trim() ? [proofUrl.trim()] : [],
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        success('Task proof submitted! Reward will be credited once verified by creator.');
        await refreshUser();
        onSubmittedSuccess();
        onClose();
      } else {
        error(res.message || 'Failed to submit proof');
      }
    } catch (err: any) {
      error(err.message || 'Error submitting task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-pink-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-pink-100 bg-pink-50/50">
          <div className="space-y-1.5 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                {task.category.replace('_', ' ')}
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  task.difficulty === 'EASY'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : task.difficulty === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {task.difficulty}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-1 leading-snug">
              {task.title}
            </h2>

            <p className="text-xs text-slate-500">
              Posted by <strong className="text-slate-700">{task.creator?.name || 'Verified Creator'}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Metrics row */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-pink-50/50 border border-pink-100 text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Reward Payout</div>
              <div className="text-xl font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                ${task.rewardAmount.toFixed(2)}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Est. Time</div>
              <div className="text-base font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-4 h-4 text-pink-500" />
                <span>{task.timeEstimateMins} mins</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Slots Available</div>
              <div className="text-base font-bold text-slate-800 mt-0.5">
                {task.totalSlots - task.completedSlots} left
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Task Overview
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-pink-50/30 p-4 rounded-2xl border border-pink-100">
              {task.description}
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          {task.instructions && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Step-by-Step Instructions
              </h4>
              <div className="p-4 rounded-2xl bg-pink-50/30 border border-pink-100 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {task.instructions}
              </div>
            </div>
          )}

          {/* Proof Required */}
          {(task.proofRequirement || task.proofInstructions) && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/80 to-rose-50/80 border border-pink-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-700">
                <FileCheck2 className="w-4 h-4 text-pink-600" />
                <span>Required Proof from Worker:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {task.proofRequirement || task.proofInstructions}
              </p>
            </div>
          )}

          {/* Submission Form for Workers */}
          {hasSubmitted ? (
            <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 flex items-center gap-2 text-xs text-pink-700">
              <CheckCircle className="w-5 h-5 text-pink-600 shrink-0" />
              <span>You have already submitted proof for this task. Check the Submissions tab for updates.</span>
            </div>
          ) : isFull ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>All worker slots for this task have been filled. Please check out other open tasks!</span>
            </div>
          ) : isCreator ? (
            <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 text-xs text-slate-500">
              You are the creator of this task. Visit Creator Studio to review incoming proofs.
            </div>
          ) : (
            <form onSubmit={handleSubmitProof} className="space-y-4 pt-2 border-t border-pink-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-pink-600" />
                <span>Submit Your Work</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Text Answer / Confirmation Code / Username
                </label>
                <textarea
                  rows={3}
                  required
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Enter the required response, completion code, transaction hash, or username..."
                  className="w-full bg-white border border-pink-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Screenshot or Proof URL (Optional)
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://imgur.com/your-screenshot or Google Drive link"
                  className="w-full bg-white border border-pink-200 rounded-2xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Proof...' : `Submit Proof & Claim $${task.rewardAmount.toFixed(2)}`}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
