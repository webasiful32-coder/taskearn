import React, { useState } from 'react';
import { X, PlusCircle, Coins, Calculator, Layers, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { api } from '../../lib/api.ts';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatedSuccess: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreatedSuccess,
}) => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [proofRequirement, setProofRequirement] = useState('');
  const [category, setCategory] = useState('APP_TESTING');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [rewardAmount, setRewardAmount] = useState<number>(0.5);
  const [totalSlots, setTotalSlots] = useState<number>(10);
  const [timeEstimateMins, setTimeEstimateMins] = useState<number>(5);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const totalCost = Number((rewardAmount * totalSlots).toFixed(2));
  const hasEnoughBalance = user ? user.balance >= totalCost : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEnoughBalance) {
      error(`Insufficient escrow balance. Need $${totalCost.toFixed(2)}, you have $${user?.balance.toFixed(2)}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.createTask({
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        proofRequirement: proofRequirement.trim(),
        category,
        difficulty,
        rewardAmount: Number(rewardAmount),
        totalSlots: Number(totalSlots),
        timeEstimateMins: Number(timeEstimateMins),
      });

      if (res.success) {
        success('Task campaign created and escrow funds locked successfully!');
        await refreshUser();
        onCreatedSuccess();
        onClose();
      } else {
        error(res.message || 'Failed to create task');
      }
    } catch (err: any) {
      error(err.message || 'Error creating task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-pink-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pink-100 bg-pink-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-pink-600" />
              <span>Create New Micro-Task Campaign</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Escrow funds are safely locked until you approve worker proofs
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Campaign Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Download our iOS beta & submit referral code"
              className="w-full bg-white border border-pink-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/15"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-pink-200 rounded-2xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
              >
                <option value="APP_TESTING">App Testing</option>
                <option value="SURVEYS">Surveys</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="DATA_LABELING">Data Labeling</option>
                <option value="WEBSITE_AUDIT">Website Audit</option>
                <option value="VIDEO_REVIEW">Video Review</option>
                <option value="CONTENT_WRITING">Content Writing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-white border border-pink-200 rounded-2xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
              >
                <option value="EASY">EASY (1-3 mins)</option>
                <option value="MEDIUM">MEDIUM (5-10 mins)</option>
                <option value="HARD">HARD (15+ mins)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reward / Slot ($)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.10"
                required
                value={rewardAmount}
                onChange={(e) => setRewardAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-pink-200 rounded-2xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Slots</label>
              <input
                type="number"
                min="1"
                required
                value={totalSlots}
                onChange={(e) => setTotalSlots(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-pink-200 rounded-2xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time (mins)</label>
              <input
                type="number"
                min="1"
                value={timeEstimateMins}
                onChange={(e) => setTimeEstimateMins(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-pink-200 rounded-2xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Real-time Escrow Budget Calculator with White & Pink Gradient Theme */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-white to-rose-50 border border-pink-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-pink-600" />
              <div>
                <span className="font-bold text-slate-900">Required Escrow Lock: </span>
                <span className="text-slate-600">${rewardAmount.toFixed(2)} × {totalSlots} slots = </span>
                <strong className="text-pink-600 text-sm font-black">${totalCost.toFixed(2)} USD</strong>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500">Available: ${user?.balance.toFixed(2)}</div>
              {!hasEnoughBalance && (
                <div className="text-[10px] text-rose-600 font-bold">Needs ${(totalCost - (user?.balance || 0)).toFixed(2)} more</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Description / Summary
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quick 1-2 sentence overview of what workers need to do..."
              className="w-full bg-white border border-pink-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Step-by-Step Instructions
            </label>
            <textarea
              rows={3}
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="1. Visit the app store link...&#10;2. Create an account...&#10;3. Complete level 3..."
              className="w-full bg-white border border-pink-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Proof From Worker
            </label>
            <input
              type="text"
              required
              value={proofRequirement}
              onChange={(e) => setProofRequirement(e.target.value)}
              placeholder="e.g. Screenshot of the final level screen or registration email"
              className="w-full bg-white border border-pink-200 rounded-2xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !hasEnoughBalance}
            className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Creating Task...' : `Lock $${totalCost.toFixed(2)} Escrow & Publish Task`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
