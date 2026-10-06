import React, { useState } from 'react';
import { X, ArrowUpRight, ShieldCheck, AlertCircle, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { api } from '../../lib/api.ts';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [amount, setAmount] = useState<number>(10);
  const [paymentMethod, setPaymentMethod] = useState<'PAYPAL' | 'USDT_TRC20' | 'BANK_TRANSFER' | 'WISE' | 'AMAZON_GIFT_CARD'>('PAYPAL');
  const [accountDetails, setAccountDetails] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const minWithdrawal = 5.0;
  const currentBalance = user?.balance || 0;
  const fee = Math.max(0.5, Number((amount * 0.02).toFixed(2)));
  const netAmount = Math.max(0, Number((amount - fee).toFixed(2)));
  const isValid = amount >= minWithdrawal && amount <= currentBalance && accountDetails.trim().length > 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      if (amount < minWithdrawal) error(`Minimum withdrawal is $${minWithdrawal.toFixed(2)}`);
      else if (amount > currentBalance) error('Requested amount exceeds available balance');
      else error('Please provide valid account or wallet details');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createWithdrawal({
        amount: Number(amount),
        paymentMethod,
        accountDetails: accountDetails.trim(),
      });

      if (res.success) {
        success('Withdrawal request submitted! It will be reviewed and disbursed shortly.');
        await refreshUser();
        onSuccess();
        onClose();
      } else {
        error(res.message || 'Failed to submit withdrawal');
      }
    } catch (err: any) {
      error(err.message || 'Error processing withdrawal');
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
              <ArrowUpRight className="w-5 h-5 text-pink-600" />
              <span>Request Payout</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Available: <strong className="text-pink-600">${currentBalance.toFixed(2)} USD</strong> (Min: $5.00)
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Withdrawal Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-pink-500 font-bold text-sm">$</span>
              <input
                type="number"
                step="0.5"
                min={minWithdrawal}
                max={currentBalance}
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-pink-200 rounded-2xl pl-8 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/15 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full bg-white border border-pink-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
            >
              <option value="PAYPAL">PayPal (Email address)</option>
              <option value="USDT_TRC20">USDT (TRC20 Wallet Address)</option>
              <option value="BANK_TRANSFER">Bank Transfer (IBAN / Account Number)</option>
              <option value="WISE">Wise (Email address)</option>
              <option value="AMAZON_GIFT_CARD">Amazon Gift Card (Email)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {paymentMethod === 'PAYPAL' || paymentMethod === 'WISE' || paymentMethod === 'AMAZON_GIFT_CARD'
                ? 'Recipient Email Address'
                : paymentMethod === 'USDT_TRC20'
                ? 'TRC20 Wallet Address (Starts with T)'
                : 'Bank Account & Routing / IBAN'}
            </label>
            <input
              type="text"
              required
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              placeholder={
                paymentMethod === 'USDT_TRC20'
                  ? 'e.g. TXyz1234567890...'
                  : 'e.g. your-email@gmail.com'
              }
              className="w-full bg-white border border-pink-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Breakdown Box with White & Pink Gradient Theme */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-white to-rose-50 border border-pink-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Gross Withdrawal:</span>
              <span className="font-semibold text-slate-800">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gateway / Processing Fee (2%):</span>
              <span className="font-semibold text-slate-700">${fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold pt-1.5 border-t border-pink-100">
              <span>Net Disbursement to You:</span>
              <span className="text-pink-600 text-sm font-black">${netAmount.toFixed(2)} USD</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 text-white shadow-md shadow-pink-500/25 hover:brightness-105 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{loading ? 'Submitting Request...' : `Request $${netAmount.toFixed(2)} Payout`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
