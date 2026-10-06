import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Receipt,
  Share2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Withdrawal, Transaction } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface WalletViewProps {
  openWithdrawModal: () => void;
  openDepositModal: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  openWithdrawModal,
  openDepositModal,
}) => {
  const { user, refreshUser } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [wdRes, txRes] = await Promise.all([
        api.getWithdrawals(),
        api.getTransactions(),
      ]);

      if (wdRes.success && wdRes.withdrawals) {
        setWithdrawals(wdRes.withdrawals);
      }
      if (txRes.success && txRes.transactions) {
        setTransactions(txRes.transactions);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-8 pb-16">
      {/* Wallet Banner with White & Pink Gradient */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-white via-pink-50/80 to-rose-50/80 border border-pink-200/90 shadow-md shadow-pink-100/40">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-pink-600" />
            <span>Wallet & Financial Overview</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track your earnings, review pending payouts, and request instant disbursements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWalletData}
            className="p-2.5 rounded-xl bg-white border border-pink-200 text-slate-700 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer shadow-xs"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openDepositModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 hover:border-pink-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-pink-600" />
            <span>Add Escrow</span>
          </button>
          <button
            onClick={openWithdrawModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white flex items-center gap-1.5 shadow-md shadow-pink-500/25 hover:brightness-105 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Request Payout</span>
          </button>
        </div>
      </div>

      {/* Financial Metric Cards with White & Pink Gradient Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-pink-200/90 space-y-1 shadow-md shadow-pink-100/30">
          <div className="text-xs font-semibold text-slate-500">Available Balance</div>
          <div className="text-2xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
            ${user.balance.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">Ready for immediate withdrawal</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-pink-200/90 space-y-1 shadow-md shadow-pink-100/30">
          <div className="text-xs font-semibold text-slate-500">Lifetime Earned</div>
          <div className="text-2xl font-black text-slate-900">
            ${user.totalEarned.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">Approved micro-tasks + bonuses</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-pink-200/90 space-y-1 shadow-md shadow-pink-100/30">
          <div className="text-xs font-semibold text-slate-500">Total Withdrawn</div>
          <div className="text-2xl font-black text-slate-800">
            ${user.totalWithdrawn.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">Disbursed to external accounts</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-pink-200/90 space-y-1 shadow-md shadow-pink-100/30">
          <div className="text-xs font-semibold text-slate-500">Pending Review</div>
          <div className="text-2xl font-black text-amber-600">
            ${user.pendingEarnings.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">Submissions under review</div>
        </div>
      </div>

      {/* Main Ledger Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Requests History */}
        <section className="p-6 rounded-3xl bg-white border border-pink-200/90 space-y-4 shadow-md shadow-pink-100/30">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-pink-600" />
              <span>Withdrawal Requests ({withdrawals.length})</span>
            </h3>
            <button
              onClick={openWithdrawModal}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 hover:underline cursor-pointer"
            >
              + New Request
            </button>
          </div>

          {withdrawals.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No withdrawal requests recorded yet. When you request a payout, status and tracking details appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((wd) => (
                <div
                  key={wd.id}
                  className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-2 hover:border-pink-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        ${wd.amount.toFixed(2)} USD
                      </div>
                      <div className="text-[11px] text-slate-500">
                        via <span className="text-slate-800 font-semibold">{wd.paymentMethod || wd.method}</span> ({wd.accountDetails})
                      </div>
                    </div>

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

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-pink-100">
                    <span>Requested: {new Date(wd.createdAt || wd.requestedAt || Date.now()).toLocaleDateString()}</span>
                    <span>Fee: ${wd.fee.toFixed(2)}</span>
                  </div>

                  {wd.transactionHash && (
                    <div className="text-[10px] text-pink-700 font-mono bg-white p-1.5 rounded-xl border border-pink-100 truncate">
                      Tx: {wd.transactionHash}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ledger Transactions */}
        <section className="p-6 rounded-3xl bg-white border border-pink-200/90 space-y-4 shadow-md shadow-pink-100/30">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-pink-600" />
              <span>Financial Ledger ({transactions.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Real-time ledger events</span>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No transactions logged yet. All deposits, task earnings, commissions, and withdrawals are tracked here.
            </div>
          ) : (
            <div className="space-y-2.5">
              {transactions.slice(0, 10).map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100 flex items-center justify-between gap-3 text-xs hover:border-pink-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{tx.description}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString()} • Type:{' '}
                        <span className="uppercase text-slate-600 font-bold">{tx.type}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-sm font-black ${
                          isPositive
                            ? 'text-pink-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                      </div>
                      {tx.balanceAfter !== undefined && (
                        <div className="text-[10px] text-slate-400">
                          Bal: ${tx.balanceAfter.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
