import React, { useState } from 'react';
import { X, PlusCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { api } from '../../lib/api.ts';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [amount, setAmount] = useState<number>(25);
  const [method, setMethod] = useState<'STRIPE_CARD' | 'CRYPTO_USDT' | 'PAYPAL'>('STRIPE_CARD');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 5) {
      error('Minimum deposit is $5.00');
      return;
    }

    setLoading(true);
    try {
      const res = await api.depositWallet({
        amount: Number(amount),
        method,
      });

      if (res.success) {
        success(`Successfully deposited $${amount.toFixed(2)} to your escrow balance!`);
        await refreshUser();
        onSuccess();
        onClose();
      } else {
        error(res.message || 'Deposit failed');
      }
    } catch (err: any) {
      error(err.message || 'Error processing deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pink-100 bg-pink-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-pink-600" />
              <span>Add Escrow Balance</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current balance: <strong className="text-pink-600">${user?.balance.toFixed(2) || '0.00'} USD</strong>
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
        <form onSubmit={handleDeposit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deposit Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-pink-500 font-bold text-sm">$</span>
              <input
                type="number"
                step="5"
                min="5"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-pink-200 rounded-2xl pl-8 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/15 font-bold"
              />
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex gap-2">
            {[10, 25, 50, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  amount === preset
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                    : 'bg-white border border-pink-200 text-slate-600 hover:bg-pink-50'
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full bg-white border border-pink-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
            >
              <option value="STRIPE_CARD">Credit / Debit Card (Instant)</option>
              <option value="CRYPTO_USDT">USDT / USDC Crypto (Zero Fee)</option>
              <option value="PAYPAL">PayPal Checkout</option>
            </select>
          </div>

          <div className="p-3.5 rounded-2xl bg-pink-50/60 border border-pink-200 text-xs text-slate-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-pink-600 shrink-0" />
            <span>Escrow guarantee: Funds are only debited when you approve a worker's completed task.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Processing Escrow Deposit...' : `Deposit $${amount.toFixed(2)} USD`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
