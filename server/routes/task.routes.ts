import { Router, Response } from 'express';
import { db, Task } from '../db/database.ts';
import { AuthRequest, requireAuth, optionalAuth, requireRole } from '../middleware/auth.ts';
import { createTaskSchema, formatZodError } from '../validators/schemas.ts';

const router = Router();

// GET /api/tasks - public or user filtered
router.get('/', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { category, difficulty, status, search, creatorId } = req.query;
    const tasks = db.getTasks({
      category: category as string,
      difficulty: difficulty as string,
      status: status as string,
      search: search as string,
      creatorId: creatorId as string,
    });

    // If user is authenticated, attach their submission status for each task
    const userId = req.user?.id;
    const enhancedTasks = tasks.map((t) => {
      let mySubmission = null;
      if (userId) {
        mySubmission = db.getSubmissionByTaskAndWorker(t.id, userId);
      }
      return {
        ...t,
        hasSubmitted: !!mySubmission,
        mySubmissionStatus: mySubmission ? mySubmission.status : null,
        mySubmissionId: mySubmission ? mySubmission.id : null,
      };
    });

    res.json({
      success: true,
      tasks: enhancedTasks,
      total: enhancedTasks.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching tasks' });
  }
});

// GET /api/tasks/:id
router.get('/:id', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const task = db.getTaskById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const creator = db.getUserById(task.creatorId);
    let mySubmission = null;
    if (req.user) {
      mySubmission = db.getSubmissionByTaskAndWorker(task.id, req.user.id);
    }

    res.json({
      success: true,
      task: {
        ...task,
        creator: creator
          ? {
              id: creator.id,
              name: creator.name,
              avatar: creator.avatar,
              bio: creator.bio,
            }
          : null,
        mySubmission,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching task details' });
  }
});

// POST /api/tasks - Create task (CREATOR or ADMIN)
router.post(
  '/',
  requireAuth,
  requireRole(['CREATOR', 'ADMIN']),
  (req: AuthRequest, res: Response): void => {
    try {
      if (!req.user) return;

      const parseResult = createTaskSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          message: formatZodError(parseResult.error),
        });
        return;
      }

      const data = parseResult.data;
      const totalBudget = Number((data.rewardAmount * data.totalSlots).toFixed(2));

      // Check creator balance
      if (req.user.role === 'CREATOR' && req.user.balance < totalBudget) {
        res.status(400).json({
          success: false,
          message: `Insufficient balance. Required budget is $${totalBudget.toFixed(2)}, but your current balance is $${req.user.balance.toFixed(2)}. Please add funds.`,
        });
        return;
      }

      // Deduct budget if creator
      if (req.user.role === 'CREATOR') {
        const newBalance = Number((req.user.balance - totalBudget).toFixed(2));
        db.updateUser(req.user.id, { balance: newBalance });

        db.createTransaction({
          id: `tx_${Date.now()}_escrow`,
          userId: req.user.id,
          userName: req.user.name,
          amount: -totalBudget,
          type: 'TASK_BUDGET_ESCROW',
          status: 'COMPLETED',
          description: `Task budget escrow for "${data.title}"`,
          createdAt: new Date().toISOString(),
        });
      }

      const newTask: Task = {
        id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        category: data.category,
        difficulty: data.difficulty,
        status: 'ACTIVE',
        rewardAmount: data.rewardAmount,
        totalSlots: data.totalSlots,
        completedSlots: 0,
        totalBudget,
        remainingBudget: totalBudget,
        timeEstimateMins: data.timeEstimateMins,
        proofType: data.proofType,
        proofInstructions: data.proofInstructions,
        targetCountry: data.targetCountry || 'GLOBAL',
        creatorId: req.user.id,
        creatorName: req.user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.createTask(newTask);

      res.status(201).json({
        success: true,
        message: 'Task published successfully!',
        task: newTask,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error creating task' });
    }
  }
);

// PUT /api/tasks/:id - Update task
router.put('/:id', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;
    const task = db.getTaskById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    if (task.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You are not authorized to update this task' });
      return;
    }

    const { title, description, instructions, status, proofInstructions } = req.body;
    const updated = db.updateTask(task.id, {
      title: title || task.title,
      description: description || task.description,
      instructions: instructions || task.instructions,
      status: status || task.status,
      proofInstructions: proofInstructions || task.proofInstructions,
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating task' });
  }
});

// DELETE /api/tasks/:id - Cancel task & refund remaining budget
router.delete('/:id', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) return;
    const task = db.getTaskById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    if (task.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized to cancel this task' });
      return;
    }

    // Refund remaining budget if any
    if (task.remainingBudget > 0) {
      const creator = db.getUserById(task.creatorId);
      if (creator) {
        db.updateUser(creator.id, {
          balance: Number((creator.balance + task.remainingBudget).toFixed(2)),
        });

        db.createTransaction({
          id: `tx_${Date.now()}_refund`,
          userId: creator.id,
          userName: creator.name,
          amount: task.remainingBudget,
          type: 'TASK_BUDGET_REFUND',
          status: 'COMPLETED',
          description: `Refund of unspent budget for canceled task "${task.title}"`,
          createdAt: new Date().toISOString(),
        });
      }
    }

    db.updateTask(task.id, { status: 'CANCELLED', remainingBudget: 0 });

    res.json({
      success: true,
      message: `Task cancelled. Unspent budget ($${task.remainingBudget.toFixed(2)}) has been refunded to creator balance.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error canceling task' });
  }
});

export default router;
