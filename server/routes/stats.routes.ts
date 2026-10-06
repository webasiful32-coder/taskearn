import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';

const router = Router();

// GET /api/stats/overview - Public statistics
router.get('/overview', (_req: Request, res: Response): void => {
  try {
    const stats = db.getPlatformOverview();
    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching platform statistics' });
  }
});

export default router;
