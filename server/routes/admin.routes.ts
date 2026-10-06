import { Router, Response } from 'express';
import { db } from '../db/database.ts';
import { AuthRequest, requireAuth, requireRole } from '../middleware/auth.ts';
import {
  adminProcessWithdrawalSchema,
  adminUpdateUserSchema,
  formatZodError,
} from '../validators/schemas.ts';

const router = Router();

// Protect all admin routes with ADMIN role
router.use(requireAuth, requireRole(['ADMIN']));

// GET /api/admin/metrics
router.get('/metrics', (_req: AuthRequest, res: Response): void => {
  try {
    const metrics = db.getAdminDashboardMetrics();
    res.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching admin metrics' });
  }
});

// GET /api/admin/users
router.get('/users', (req: AuthRequest, res: Response): void => {
  try {
    const { role, status, search } = req.query;
    let users = db.getUsers().map(({ passwordHash, ...u }) => u);

    if (role && role !== 'ALL') {
      users = users.filter((u) => u.role === role);
    }
    if (status && status !== 'ALL') {
      users = users.filter((u) => u.status === status);
    }
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching users' });
  }
});

// PUT /api/admin/users/:id - Update user status, role, or balance adjustment
router.put('/users/:id', (req: AuthRequest, res: Response): void => {
  try {
    const user = db.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const parseResult = adminUpdateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: formatZodError(parseResult.error),
      });
      return;
    }

    const { role, status, balanceAdjustment, adjustmentReason } = parseResult.data;
    const updates: any = {};

    if (role) updates.role = role;
    if (status) updates.status = status;

    if (balanceAdjustment !== undefined && balanceAdjustment !== 0) {
      const newBal = Number((user.balance + balanceAdjustment).toFixed(2));
      updates.balance = Math.max(0, newBal);

      db.createTransaction({
        id: `tx_${Date.now()}_adj`,
        userId: user.id,
        userName: user.name,
        amount: balanceAdjustment,
        type: 'ADMIN_ADJUSTMENT',
        status: 'COMPLETED',
        description: `Admin balance adjustment: ${adjustmentReason || 'Manual credit/debit'}`,
        createdAt: new Date().toISOString(),
      });

      db.createNotification({
        id: `notif_${Date.now()}_adj`,
        userId: user.id,
        title: `Account Balance Adjusted (${balanceAdjustment > 0 ? '+' : ''}$${balanceAdjustment.toFixed(2)})`,
        message: `Admin adjusted your balance. Note: ${adjustmentReason || 'System balance correction'}`,
        type: 'ADMIN_NOTIFICATION',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    const updated = db.updateUser(user.id, updates);
    if (!updated) {
      res.status(400).json({ success: false, message: 'Failed to update user' });
      return;
    }

    const { passwordHash, ...safeUser } = updated;
    res.json({
      success: true,
      message: 'User updated successfully',
      user: safeUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating user' });
  }
});

// GET /api/admin/withdrawals
router.get('/withdrawals', (req: AuthRequest, res: Response): void => {
  try {
    const { status } = req.query;
    const withdrawals = db.getWithdrawals(status ? { status: status as string } : undefined);
    res.json({
      success: true,
      withdrawals,
      total: withdrawals.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching withdrawals' });
  }
});

// PUT /api/admin/withdrawals/:id - Approve or Reject withdrawal
router.put('/withdrawals/:id', (req: AuthRequest, res: Response): void => {
  try {
    const withdrawal = db.getWithdrawalById(req.params.id);
    if (!withdrawal) {
      res.status(404).json({ success: false, message: 'Withdrawal not found' });
      return;
    }

    const parseResult = adminProcessWithdrawalSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: formatZodError(parseResult.error),
      });
      return;
    }

    const { status, transactionHash, adminNotes } = parseResult.data;
    const user = db.getUserById(withdrawal.userId);

    if (status === 'COMPLETED') {
      const updatedWd = db.updateWithdrawal(withdrawal.id, {
        status: 'COMPLETED',
        transactionHash: transactionHash || `TX-PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        adminNotes: adminNotes || 'Disbursed via automated payout gateway.',
        processedAt: new Date().toISOString(),
      });

      // Update user lifetime total withdrawn
      if (user) {
        const newTotalWithdrawn = Number((user.totalWithdrawn + withdrawal.amount).toFixed(2));
        db.updateUser(user.id, { totalWithdrawn: newTotalWithdrawn });

        // Update corresponding transaction record
        const txs = db.getTransactions(user.id);
        const relatedTx = txs.find((t) => t.referenceId === withdrawal.id);
        if (relatedTx) {
          relatedTx.status = 'COMPLETED';
          db.save();
        }

        db.createNotification({
          id: `notif_${Date.now()}_wdcomp`,
          userId: user.id,
          title: `Withdrawal Paid! $${withdrawal.netAmount.toFixed(2)}`,
          message: `Your withdrawal of $${withdrawal.amount.toFixed(2)} ($${withdrawal.netAmount.toFixed(2)} net after fee) has been sent to your ${withdrawal.method} account (${withdrawal.accountDetails}). Reference: ${transactionHash || 'TX-BATCH-OK'}.`,
          type: 'WITHDRAWAL_PAID',
          link: '/withdrawals',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        message: 'Withdrawal approved and marked completed!',
        withdrawal: updatedWd,
      });
    } else if (status === 'REJECTED') {
      // Refund money back to user balance!
      if (user) {
        const refundedBalance = Number((user.balance + withdrawal.amount).toFixed(2));
        db.updateUser(user.id, { balance: refundedBalance });

        db.createTransaction({
          id: `tx_${Date.now()}_wdref`,
          userId: user.id,
          userName: user.name,
          amount: withdrawal.amount,
          type: 'WITHDRAWAL_REFUND',
          status: 'REFUNDED',
          description: `Refund for rejected withdrawal request (#${withdrawal.id}) - Reason: ${adminNotes || 'Invalid account details'}`,
          referenceId: withdrawal.id,
          createdAt: new Date().toISOString(),
        });

        db.createNotification({
          id: `notif_${Date.now()}_wdrej`,
          userId: user.id,
          title: 'Withdrawal Request Rejected & Refunded',
          message: `Your withdrawal request of $${withdrawal.amount.toFixed(2)} was rejected. Full funds refunded to your balance. Reason: ${adminNotes || 'Please check your account details.'}`,
          type: 'WITHDRAWAL_REJECTED',
          link: '/withdrawals',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      const updatedWd = db.updateWithdrawal(withdrawal.id, {
        status: 'REJECTED',
        adminNotes: adminNotes || 'Rejected by administrator. Balance refunded.',
        processedAt: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: 'Withdrawal rejected and funds refunded to user balance.',
        withdrawal: updatedWd,
      });
    } else {
      const updatedWd = db.updateWithdrawal(withdrawal.id, {
        status: 'PROCESSING',
        adminNotes,
      });
      res.json({
        success: true,
        message: 'Withdrawal set to processing.',
        withdrawal: updatedWd,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error processing withdrawal' });
  }
});

// GET /api/admin/tasks - All tasks
router.get('/tasks', (_req: AuthRequest, res: Response): void => {
  try {
    const tasks = db.getAllTasksAdmin();
    res.json({
      success: true,
      tasks,
      total: tasks.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching tasks' });
  }
});

// GET /api/admin/submissions - All submissions
router.get('/submissions', (req: AuthRequest, res: Response): void => {
  try {
    const { status } = req.query;
    const submissions = db.getSubmissions(status ? { status: status as string } : undefined);
    res.json({
      success: true,
      submissions,
      total: submissions.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching submissions' });
  }
});

export default router;
