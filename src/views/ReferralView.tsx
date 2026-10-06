import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, Users, Gift, TrendingUp, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../lib/api.ts';

export const ReferralView: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchRef = async () => {
      try {
        setLoading(true);
        const res = await api.getReferrals();
        if (res.success) {
          setReferralData(res);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRef();
  }, []);

  const referralCode = user?.referralCode || 'EARN2026';
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Referral Hero with White & Pink Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-pink-50/90 to-rose-100/60 border border-pink-200/90 p-8 sm:p-12 shadow-xl shadow-pink-100/50">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-pink-200 text-pink-700 text-xs font-bold shadow-xs">
            <Gift className="w-3.5 h-3.5 text-pink-500" />
            <span>TaskEarn Affiliate & Referral Program</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Earn <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">8% Lifetime Commission</span> <br />
            on Every Task Your Friends Complete
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Invite workers, creators, or freelancers. Whenever your referrals complete an approved task, 8% of the payout is credited instantly to your account with zero caps!
          </p>

          {/* Referral link box with Pink gradient copy button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex-1 bg-white border border-pink-200 rounded-2xl px-4 py-3 text-xs text-slate-800 font-mono flex items-center justify-between shadow-xs">
              <span className="truncate">{referralLink}</span>
            </div>
            <button
              onClick={() => copyToClipboard(referralLink)}
              className="px-6 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white flex items-center justify-center gap-2 shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Link!' : 'Copy Referral Link'}</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow orb */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-rose-300/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Referral Stats Cards with White & Pink Gradient Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-pink-200/90 space-y-1 shadow-md shadow-pink-100/30">
          <div className="text-xs font-semibold text-slate-500">Total Referrals Joined</div>
          <div className="text-2xl font-black text-slate-900">
            {referralData ? referralData.totalReferrals : 0} Friends
          </div>
          <div className="text-[11px] text-slate-400">Registered using your code</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-pink-200/90 space-y-1 shadow-md shadow-pink-100/30">
          <div className="text-xs font-semibold text-slate-500">Total Referral Earnings</div>
          <div className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
            ${user?.referralEarnings ? user.referralEarnings.toFixed(2) : '0.00'} USD
          </div>
          <div className="text-[11px] text-slate-400">Lifetime passive commission earned</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-pink-200/90 space-y-1 shadow-md shadow-pink-100/30">
          <div className="text-xs font-semibold text-slate-500">Commission Tier</div>
          <div className="text-2xl font-black text-pink-600">8% Level 1</div>
          <div className="text-[11px] text-slate-400">Instant payout on task approvals</div>
        </div>
      </div>

      {/* How Referrals Work */}
      <div className="p-6 rounded-3xl bg-white border border-pink-200/90 space-y-4 shadow-md shadow-pink-100/30">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span>How You Earn With Our Affiliate System</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold flex items-center justify-center text-[11px] shadow-xs">
              1
            </div>
            <div className="font-bold text-slate-800">Share Your Link</div>
            <p className="text-slate-500">
              Post on Twitter, Discord, Telegram, or WhatsApp with your personalized invite code.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold flex items-center justify-center text-[11px] shadow-xs">
              2
            </div>
            <div className="font-bold text-slate-800">Friends Complete Tasks</div>
            <p className="text-slate-500">
              When someone signs up using your link and submits task proofs, employers review them.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold flex items-center justify-center text-[11px] shadow-xs">
              3
            </div>
            <div className="font-bold text-slate-800">Earn 8% Commission</div>
            <p className="text-slate-500">
              Upon approval, 8% of the task reward is instantly credited to your wallet balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
