import { Router, Response } from 'express';
import { db } from '../db/database.ts';
import { AuthRequest, requireAuth } from '../middleware/auth.ts';

const router = Router();

// GET /api/wallet/summary
router.get('/summary', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;
    const transactions = db.getTransactions(req.user.id);
    const withdrawals = db.getWithdrawals({ userId: req.user.id });

    res.json({
      success: true,
      balance: req.user.balance,
      pendingEarnings: req.user.pendingEarnings,
      totalEarned: req.user.totalEarned,
      totalWithdrawn: req.user.totalWithdrawn,
      referralEarnings: req.user.referralEarnings,
      recentTransactions: transactions.slice(0, 5),
      recentWithdrawals: withdrawals.slice(0, 3),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching wallet summary' });
  }
});

// GET /api/wallet/transactions
router.get('/transactions', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;
    const transactions = db.getTransactions(req.user.id);
    res.json({
      success: true,
      transactions,
      total: transactions.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching transactions' });
  }
});

// POST /api/wallet/deposit (Creator or user adding funds to create tasks)
router.post('/deposit', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;
    const { amount, method } = req.body;

    const depositAmount = Number(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid deposit amount' });
      return;
    }

    const newBalance = Number((req.user.balance + depositAmount).toFixed(2));
    db.updateUser(req.user.id, { balance: newBalance });

    db.createTransaction({
      id: `tx_${Date.now()}_dep`,
      userId: req.user.id,
      userName: req.user.name,
      amount: depositAmount,
      type: 'ADMIN_ADJUSTMENT',
      status: 'COMPLETED',
      description: `Funds deposit via ${method || 'Instant Payment Gateway'} ($${depositAmount.toFixed(2)})`,
      createdAt: new Date().toISOString(),
    });

    db.createNotification({
      id: `notif_${Date.now()}_dep`,
      userId: req.user.id,
      title: 'Funds Added Successfully',
      message: `$${depositAmount.toFixed(2)} has been added to your wallet balance.`,
      type: 'WALLET_DEPOSIT',
      link: '/wallet',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Successfully deposited $${depositAmount.toFixed(2)}!`,
      newBalance,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error processing deposit' });
  }
});

export default router;
