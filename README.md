# TaskEarn - Micro-Task Earning & Freelance Reward Platform

TaskEarn is a full-stack micro-task earning platform where digital workers complete verified micro-jobs (app reviews, surveys, social tasks, data labeling, website audits) to earn payouts in their digital wallet, request real disbursements, and receive 8% lifetime referral commissions. Employers and task creators fund escrow budgets and review submitted proofs, with administrator oversight and financial controls.

---

## 1. Project Overview

- **Target Users**:
  - **Workers / Earners**: Complete micro-tasks, submit proof answers/screenshots, earn balance, track pending approvals, and request withdrawals via PayPal, Crypto USDT, or Bank Transfer.
  - **Task Creators / Employers**: Post tasks, set reward budgets, specify proof criteria, inspect worker submissions, approve with instant payout, or reject with feedback.
  - **Super Administrators**: Monitor system-wide metrics, disburse pending withdrawals, audit transactions, and moderate user accounts.
- **Architecture**:
  - Frontend: React 19 + TypeScript + Tailwind CSS + Lucide Icons
  - Backend: Node.js + Express REST API (with Zod validation, JWT authentication, and bcrypt password hashing)
  - Database: Neon PostgreSQL & Prisma ORM Schema (`backend/prisma/schema.prisma`) with persistent JSON storage engine fallback for zero-downtime development.

---

## 2. Key Features

- **Micro-Task Discovery & Filtering**: Search and filter tasks by category (Surveys, App Testing, Social Media, Data Labeling, Video Review, Website Audit), difficulty, and reward amount.
- **Proof Submission Engine**: Workers submit verification proof (text answer, confirmation code, screenshot URLs, notes) with duplicate prevention.
- **Escrow & Immediate Rewards**: Tasks lock creator budget in escrow; on approval, reward transfers directly to worker's available balance.
- **Referral Royalty System**: Every user receives a unique referral code and link. When referred users complete approved tasks, referrers receive an automated 8% commission.
- **Wallet & Multi-Method Withdrawals**:
  - Methods: PayPal, Crypto USDT (TRC-20), Wise, Direct Bank ACH, Digital Gift Cards
  - Minimum payout threshold ($5.00) with automatic 2% platform processing fee calculation
  - Real-time transaction audit ledger
- **Creator Studio**: Track campaign slot progress, remaining escrow balance, review worker submissions, and cancel tasks with automatic refund of unspent budget.
- **Administrator Panel (`/admin`)**:
  - System metrics (total escrow, completed payouts, user count)
  - Withdrawal moderation (approve with transaction hash or reject with refund)
  - User management (change roles: USER / CREATOR / ADMIN, status: ACTIVE / SUSPENDED / BANNED, manual balance adjustments)
- **Role & Demo Switcher**: Instant one-click login for test roles:
  - **Worker**: `worker@taskearn.com` / `password123`
  - **Creator**: `creator@taskearn.com` / `password123`
  - **Admin**: `admin@taskearn.com` / `password123`

---

## 3. Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Express 4, Node.js, tsx, CORS, JSONWebToken, Bcryptjs, Zod
- **Database**: Neon PostgreSQL via Prisma ORM
- **Dev Server**: Vite unified development server on port 3000

---

## 4. Folder Structure

```
├── backend/
│   └── prisma/
│       ├── schema.prisma       # Prisma schema for Neon PostgreSQL
│       └── seed.ts             # Prisma seed script
├── server/
│   ├── db/
│   │   └── database.ts         # Persistent data store & seed models
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication & role-based authorization
│   ├── routes/
│   │   ├── admin.routes.ts     # Platform administration routes
│   │   ├── auth.routes.ts      # Authentication & profile routes
│   │   ├── notification.routes.ts # Notification system routes
│   │   ├── referral.routes.ts  # Referral & commission routes
│   │   ├── stats.routes.ts     # Platform public statistics
│   │   ├── submission.routes.ts# Task proof submission & review
│   │   ├── task.routes.ts      # Tasks CRUD & marketplace
│   │   ├── wallet.routes.ts    # Wallet & transactions
│   │   └── withdrawal.routes.ts# Withdrawal requests
│   └── validators/
│       └── schemas.ts          # Zod request validators
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── modals/
│   │       ├── AuthModal.tsx
│   │       ├── CreateTaskModal.tsx
│   │       ├── DepositModal.tsx
│   │       ├── NotificationsModal.tsx
│   │       ├── TaskDetailModal.tsx
│   │       └── WithdrawalModal.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── lib/
│   │   └── api.ts              # Reusable API client
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── views/
│   │   ├── AdminView.tsx
│   │   ├── CreatorStudioView.tsx
│   │   ├── ReferralView.tsx
│   │   ├── SubmissionsView.tsx
│   │   ├── TasksExploreView.tsx
│   │   ├── WalletView.tsx
│   │   └── WorkerDashboardView.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server.ts                   # Full-stack server entry point
├── package.json
└── README.md
```

---

## 5. Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=taskearn-production-jwt-secret-key-32-chars-long
DATABASE_URL=postgresql://neondb_owner:npg_password@ep-bold-glade-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
VITE_API_URL=/api
```

---

## 6. Neon PostgreSQL & Prisma Setup

### Install Dependencies
```bash
npm install
```

### Generate Prisma Client
```bash
npx prisma generate --schema=backend/prisma/schema.prisma
```

### Database Migration
```bash
npx prisma migrate dev --name init --schema=backend/prisma/schema.prisma
```

### Production Migration
```bash
npx prisma migrate deploy --schema=backend/prisma/schema.prisma
```

### Seed Database
```bash
npx tsx backend/prisma/seed.ts
```

---

## 7. Running the Application

### Start Development Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

### Build & Production Run
```bash
npm run build
npm start
```

---

## 8. REST API Endpoints

### Health Check
- `GET /api/health` &rarr; `{ success: true, message: "API is running" }`

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create earner or creator account
- `POST /api/auth/login` - Authenticate with email and password
- `GET /api/auth/me` - Current authenticated user & live balance
- `PUT /api/auth/profile` - Update profile bio and name
- `POST /api/auth/change-password` - Update password

### Tasks (`/api/tasks`)
- `GET /api/tasks` - Filter by category, difficulty, search
- `GET /api/tasks/:id` - Task details and instructions
- `POST /api/tasks` - Post task & lock escrow (Role: CREATOR or ADMIN)
- `PUT /api/tasks/:id` - Update task instructions
- `DELETE /api/tasks/:id` - Cancel task and refund unspent escrow

### Submissions (`/api/submissions`)
- `POST /api/submissions` - Worker submits verification proof
- `GET /api/submissions/my` - Worker's personal submission history
- `GET /api/submissions/task/:taskId` - Creator views submissions for their task
- `PUT /api/submissions/:id/review` - Creator approves/rejects proof (credits balance + 8% referral royalty)

### Wallet & Withdrawals (`/api/wallet` & `/api/withdrawals`)
- `GET /api/wallet/summary` - Balances and overview
- `GET /api/wallet/transactions` - Activity log
- `POST /api/wallet/deposit` - Add task budget funds
- `GET /api/withdrawals` - User withdrawal history
- `POST /api/withdrawals` - Request withdrawal (PayPal, USDT, Bank, Wise)

### Referrals (`/api/referrals`)
- `GET /api/referrals` - Referral link, earnings, invited list

### Administration (`/api/admin` - Role: ADMIN)
- `GET /api/admin/metrics` - Platform volume & escrow statistics
- `GET /api/admin/users` - View and search all accounts
- `PUT /api/admin/users/:id` - Update role, status, adjust balance
- `GET /api/admin/withdrawals` - View pending payout queue
- `PUT /api/admin/withdrawals/:id` - Approve with hash or reject with refund
