import { Router, Response } from 'express';
import { db, Withdrawal } from '../db/database.ts';
import { AuthRequest, requireAuth } from '../middleware/auth.ts';
import { createWithdrawalSchema, formatZodError } from '../validators/schemas.ts';

const router = Router();

// GET /api/withdrawals - Get user's withdrawals
router.get('/', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;
    const withdrawals = db.getWithdrawals({ userId: req.user.id });
    res.json({
      success: true,
      withdrawals,
      total: withdrawals.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching withdrawals' });
  }
});

// POST /api/withdrawals - Request new payout
router.post('/', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;

    const parseResult = createWithdrawalSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: formatZodError(parseResult.error),
      });
      return;
    }

    const { amount, method, accountDetails } = parseResult.data;

    // Check balance
    if (req.user.balance < amount) {
      res.status(400).json({
        success: false,
        message: `Insufficient balance. You requested $${amount.toFixed(2)}, but your available balance is $${req.user.balance.toFixed(2)}.`,
      });
      return;
    }

    // 2% platform fee or flat $0.50
    const fee = Number(Math.max(0.50, amount * 0.02).toFixed(2));
    const netAmount = Number((amount - fee).toFixed(2));

    // Deduct from user balance immediately (escrow until processed)
    const newBalance = Number((req.user.balance - amount).toFixed(2));
    db.updateUser(req.user.id, { balance: newBalance });

    const newWithdrawal: Withdrawal = {
      id: `wd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      amount,
      fee,
      netAmount,
      method,
      accountDetails,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };

    db.createWithdrawal(newWithdrawal);

    // Record pending transaction
    db.createTransaction({
      id: `tx_${Date.now()}_wd`,
      userId: req.user.id,
      userName: req.user.name,
      amount: -amount,
      type: 'WITHDRAWAL_REQUEST',
      status: 'PENDING',
      description: `Withdrawal request to ${method} (${accountDetails})`,
      referenceId: newWithdrawal.id,
      createdAt: new Date().toISOString(),
    });

    // Notify user
    db.createNotification({
      id: `notif_${Date.now()}_wdreq`,
      userId: req.user.id,
      title: 'Withdrawal Submitted',
      message: `Your withdrawal of $${amount.toFixed(2)} via ${method} has been placed. Admin review is pending.`,
      type: 'WITHDRAWAL_REQUEST',
      link: '/withdrawals',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully! Funds will be reviewed and disbursed promptly.',
      withdrawal: newWithdrawal,
      newBalance,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating withdrawal' });
  }
});

export default router;
