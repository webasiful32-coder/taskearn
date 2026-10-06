import { Router, Response } from 'express';
import { db } from '../db/database.ts';
import { AuthRequest, requireAuth } from '../middleware/auth.ts';

const router = Router();

// GET /api/referrals
router.get('/', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;

    // Get all users who joined using this user's referral code
    const allUsers = db.getUsers();
    const referredUsers = allUsers
      .filter((u) => u.referredById === req.user?.id)
      .map((u) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        joinedAt: u.createdAt,
        status: u.status,
        totalEarned: u.totalEarned,
      }));

    // Referral transactions
    const transactions = db
      .getTransactions(req.user.id)
      .filter((t) => t.type === 'REFERRAL_COMMISSION');

    const commissionRate = 8; // 8%

    res.json({
      success: true,
      referralCode: req.user.referralCode,
      referralEarnings: req.user.referralEarnings,
      commissionRatePercent: commissionRate,
      totalReferrals: referredUsers.length,
      referredUsers,
      recentCommissions: transactions.slice(0, 10),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching referral data' });
  }
});

export default router;
