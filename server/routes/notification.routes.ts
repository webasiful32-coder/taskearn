import { Router, Response } from 'express';
import { db } from '../db/database.ts';
import { AuthRequest, requireAuth } from '../middleware/auth.ts';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;
    const notifications = db.getNotifications(req.user.id);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching notifications' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;
    const success = db.markNotificationRead(req.params.id, req.user.id);
    if (!success) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }
    res.json({ success: true, message: 'Marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating notification' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;
    db.markAllNotificationsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating notifications' });
  }
});

export default router;
