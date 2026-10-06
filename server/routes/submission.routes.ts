import { Router, Response } from 'express';
import { db, Submission } from '../db/database.ts';
import { AuthRequest, requireAuth } from '../middleware/auth.ts';
import { createSubmissionSchema, reviewSubmissionSchema, formatZodError } from '../validators/schemas.ts';

const router = Router();

// POST /api/submissions - Worker submits task proof
router.post('/', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;

    const parseResult = createSubmissionSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: formatZodError(parseResult.error),
      });
      return;
    }

    const { taskId, proofText, proofUrls, notes } = parseResult.data;

    const task = db.getTaskById(taskId);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    if (task.status !== 'ACTIVE') {
      res.status(400).json({ success: false, message: `This task is currently ${task.status.toLowerCase()} and cannot accept new submissions.` });
      return;
    }

    if (task.completedSlots >= task.totalSlots) {
      res.status(400).json({ success: false, message: 'All slots for this task have already been filled!' });
      return;
    }

    if (task.creatorId === req.user.id) {
      res.status(400).json({ success: false, message: 'You cannot submit work for your own created task!' });
      return;
    }

    const existingSubmission = db.getSubmissionByTaskAndWorker(taskId, req.user.id);
    if (existingSubmission) {
      res.status(400).json({
        success: false,
        message: `You have already submitted for this task. Current status: ${existingSubmission.status}.`,
      });
      return;
    }

    if (!proofText && (!proofUrls || proofUrls.length === 0)) {
      res.status(400).json({ success: false, message: 'You must provide proof (either proof text, answer, or proof URLs).' });
      return;
    }

    const newSubmission: Submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      taskId: task.id,
      taskTitle: task.title,
      taskReward: task.rewardAmount,
      workerId: req.user.id,
      workerName: req.user.name,
      workerEmail: req.user.email,
      proofText: proofText || '',
      proofUrls: proofUrls || [],
      notes: notes || '',
      status: 'PENDING',
      rewardPaid: 0.0,
      submittedAt: new Date().toISOString(),
    };

    db.createSubmission(newSubmission);

    // Update worker's pending earnings
    const updatedPending = Number((req.user.pendingEarnings + task.rewardAmount).toFixed(2));
    db.updateUser(req.user.id, { pendingEarnings: updatedPending });

    // Notify task creator
    db.createNotification({
      id: `notif_${Date.now()}_sub`,
      userId: task.creatorId,
      title: 'New Task Submission Received',
      message: `${req.user.name} submitted proof for "${task.title}". Review and approve to release reward.`,
      type: 'TASK_SUBMITTED',
      link: '/creator',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Proof submitted successfully! It is now pending review.',
      submission: newSubmission,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error submitting task proof' });
  }
});

// GET /api/submissions/my - Worker's own submissions
router.get('/my', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;
    const submissions = db.getSubmissions({ workerId: req.user.id });
    res.json({
      success: true,
      submissions,
      total: submissions.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching submissions' });
  }
});

// GET /api/submissions/task/:taskId - Submissions for a creator's task
router.get('/task/:taskId', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;
    const task = db.getTaskById(req.params.taskId);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    if (task.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized to view submissions for this task' });
      return;
    }

    const submissions = db.getSubmissions({ taskId: task.id });
    res.json({
      success: true,
      submissions,
      total: submissions.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching submissions' });
  }
});

// PUT /api/submissions/:id/review - Review submission (Creator or Admin)
router.put('/:id/review', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;

    const parseResult = reviewSubmissionSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: formatZodError(parseResult.error),
      });
      return;
    }

    const { status, reviewNotes } = parseResult.data;

    const submission = db.getSubmissionById(req.params.id);
    if (!submission) {
      res.status(404).json({ success: false, message: 'Submission not found' });
      return;
    }

    if (submission.status !== 'PENDING') {
      res.status(400).json({ success: false, message: `Submission has already been ${submission.status.toLowerCase()}.` });
      return;
    }

    const task = db.getTaskById(submission.taskId);
    if (!task) {
      res.status(404).json({ success: false, message: 'Associated task not found' });
      return;
    }

    if (task.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized to review this submission' });
      return;
    }

    const worker = db.getUserById(submission.workerId);
    if (!worker) {
      res.status(404).json({ success: false, message: 'Worker account no longer exists' });
      return;
    }

    if (status === 'APPROVED') {
      const reward = task.rewardAmount;

      // 1. Credit worker
      const newWorkerBalance = Number((worker.balance + reward).toFixed(2));
      const newTotalEarned = Number((worker.totalEarned + reward).toFixed(2));
      const newPending = Math.max(0, Number((worker.pendingEarnings - reward).toFixed(2)));

      db.updateUser(worker.id, {
        balance: newWorkerBalance,
        totalEarned: newTotalEarned,
        pendingEarnings: newPending,
      });

      // 2. Worker transaction record
      db.createTransaction({
        id: `tx_${Date.now()}_earn`,
        userId: worker.id,
        userName: worker.name,
        amount: reward,
        type: 'TASK_EARNING',
        status: 'COMPLETED',
        description: `Reward approved for task "${task.title}"`,
        referenceId: submission.id,
        createdAt: new Date().toISOString(),
      });

      // 3. Worker notification
      db.createNotification({
        id: `notif_${Date.now()}_appr`,
        userId: worker.id,
        title: `Task Approved! +$${reward.toFixed(2)}`,
        message: `Your submission for "${task.title}" was approved by ${req.user.name}. Reward added to your balance.`,
        type: 'TASK_APPROVED',
        link: '/submissions',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // 4. Update task completed slots & remaining budget
      const newCompletedSlots = task.completedSlots + 1;
      const newRemainingBudget = Math.max(0, Number((task.remainingBudget - reward).toFixed(2)));
      const isComplete = newCompletedSlots >= task.totalSlots;

      db.updateTask(task.id, {
        completedSlots: newCompletedSlots,
        remainingBudget: newRemainingBudget,
        status: isComplete ? 'COMPLETED' : task.status,
      });

      // 5. Update submission
      db.updateSubmission(submission.id, {
        status: 'APPROVED',
        reviewNotes,
        rewardPaid: reward,
        reviewedAt: new Date().toISOString(),
      });

      // 6. Referral Commission System: 8% to referrer if worker was referred
      if (worker.referredById) {
        const referrer = db.getUserById(worker.referredById);
        if (referrer && referrer.status === 'ACTIVE') {
          const commissionRate = 0.08; // 8% commission
          const commissionAmount = Number((reward * commissionRate).toFixed(2));

          if (commissionAmount > 0.01) {
            const newReferrerBalance = Number((referrer.balance + commissionAmount).toFixed(2));
            const newReferralEarnings = Number((referrer.referralEarnings + commissionAmount).toFixed(2));
            const newReferrerTotal = Number((referrer.totalEarned + commissionAmount).toFixed(2));

            db.updateUser(referrer.id, {
              balance: newReferrerBalance,
              referralEarnings: newReferralEarnings,
              totalEarned: newReferrerTotal,
            });

            db.createTransaction({
              id: `tx_${Date.now()}_refcomm`,
              userId: referrer.id,
              userName: referrer.name,
              amount: commissionAmount,
              type: 'REFERRAL_COMMISSION',
              status: 'COMPLETED',
              description: `8% Referral commission from ${worker.name} on "${task.title}"`,
              referenceId: submission.id,
              createdAt: new Date().toISOString(),
            });

            db.createNotification({
              id: `notif_${Date.now()}_refbonus`,
              userId: referrer.id,
              title: `Referral Bonus Earned! +$${commissionAmount.toFixed(2)}`,
              message: `You earned an 8% commission bonus from ${worker.name}'s completed task!`,
              type: 'REFERRAL_COMMISSION',
              link: '/referrals',
              isRead: false,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      res.json({
        success: true,
        message: `Submission approved! $${reward.toFixed(2)} credited to ${worker.name}.`,
      });
    } else {
      // REJECTED
      const newPending = Math.max(0, Number((worker.pendingEarnings - task.rewardAmount).toFixed(2)));
      db.updateUser(worker.id, { pendingEarnings: newPending });

      db.updateSubmission(submission.id, {
        status: 'REJECTED',
        reviewNotes,
        rewardPaid: 0.0,
        reviewedAt: new Date().toISOString(),
      });

      db.createNotification({
        id: `notif_${Date.now()}_rej`,
        userId: worker.id,
        title: 'Task Submission Rejected',
        message: `Your submission for "${task.title}" was not approved. Feedback: "${reviewNotes}"`,
        type: 'TASK_REJECTED',
        link: '/submissions',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: 'Submission marked as rejected with feedback.',
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error reviewing submission' });
  }
});

export default router;
