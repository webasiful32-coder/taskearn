import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, User } from '../db/database.ts';
import { AuthRequest, requireAuth, generateToken } from '../middleware/auth.ts';
import {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  changePasswordSchema,
  formatZodError,
} from '../validators/schemas.ts';

const router = Router();

function sanitizeUser(user: User) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// POST /api/auth/register
router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: formatZodError(parseResult.error),
      });
      return;
    }

    const { name, email, password, role, referralCode } = parseResult.data;

    // Check if email already exists
    const existing = db.getUserByEmail(email);
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    // Check referrer if provided
    let referrerId: string | null = null;
    if (referralCode && referralCode.trim()) {
      const referrer = db.getUserByReferralCode(referralCode.trim());
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Generate unique user referral code
    const baseCode = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'USER';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newReferralCode = `${baseCode}${randomSuffix}`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email,
      passwordHash,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      bio: role === 'CREATOR' ? 'Task Creator & Employer on TaskEarn' : 'Micro-Task Earner on TaskEarn',
      role: role as 'USER' | 'CREATOR',
      status: 'ACTIVE',
      balance: role === 'CREATOR' ? 100.0 : 5.0, // $5 signup bonus for workers to explore, or initial test budget for creator
      pendingEarnings: 0.0,
      totalEarned: role === 'USER' ? 5.0 : 0.0,
      totalWithdrawn: 0.0,
      referralCode: newReferralCode,
      referredById: referrerId,
      referralEarnings: 0.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    // Initial transaction log for signup welcome bonus if worker
    if (role === 'USER') {
      db.createTransaction({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: newUser.id,
        userName: newUser.name,
        amount: 5.0,
        type: 'ADMIN_ADJUSTMENT',
        status: 'COMPLETED',
        description: 'TaskEarn Welcome Registration Bonus ($5.00)',
        createdAt: new Date().toISOString(),
      });
    }

    // If referred, notify referrer
    if (referrerId) {
      const referrer = db.getUserById(referrerId);
      if (referrer) {
        db.createNotification({
          id: `notif_${Date.now()}_ref`,
          userId: referrerId,
          title: 'New Referral Registered!',
          message: `${newUser.name} just signed up using your referral code. You will earn 8% commission on all their approved tasks!`,
          type: 'REFERRAL_NEW',
          link: '/referrals',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const token = generateToken(newUser);
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: formatZodError(parseResult.error),
      });
      return;
    }

    const { email, password } = parseResult.data;
    const user = db.getUserByEmail(email);

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      res.status(403).json({ success: false, message: `Account is ${user.status.toLowerCase()}. Please contact support.` });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  const notifications = db.getNotifications(req.user.id);
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  res.json({
    success: true,
    user: sanitizeUser(req.user),
    unreadNotifsCount,
  });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req: AuthRequest, res: Response): void => {
  if (!req.user) return;
  const parseResult = profileUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, message: formatZodError(parseResult.error) });
    return;
  }

  const updated = db.updateUser(req.user.id, parseResult.data);
  if (!updated) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({
    success: true,
    message: 'Profile updated successfully!',
    user: sanitizeUser(updated),
  });
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) return;
  const parseResult = changePasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, message: formatZodError(parseResult.error) });
    return;
  }

  const { currentPassword, newPassword } = parseResult.data;
  const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
  if (!isMatch) {
    res.status(400).json({ success: false, message: 'Current password does not match.' });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);
  db.updateUser(req.user.id, { passwordHash: newHash });

  res.json({ success: true, message: 'Password changed successfully!' });
});

export default router;
