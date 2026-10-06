import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './server/routes/auth.routes.ts';
import taskRoutes from './server/routes/task.routes.ts';
import submissionRoutes from './server/routes/submission.routes.ts';
import walletRoutes from './server/routes/wallet.routes.ts';
import withdrawalRoutes from './server/routes/withdrawal.routes.ts';
import referralRoutes from './server/routes/referral.routes.ts';
import notificationRoutes from './server/routes/notification.routes.ts';
import adminRoutes from './server/routes/admin.routes.ts';
import statsRoutes from './server/routes/stats.routes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Security and utilities middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Required Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      message: 'API is running',
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/submissions', submissionRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/withdrawals', withdrawalRoutes);
  app.use('/api/referrals', referralRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/stats', statsRoutes);

  // Frontend integration
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

 app.listen(PORT, 'localhost', () => {
  console.log(`🚀 TaskEarn Server running at http://localhost:${PORT}`);
});

}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
