export type UserRole = 'USER' | 'CREATOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  pendingEarnings: number;
  totalEarned: number;
  totalWithdrawn: number;
  referralCode: string;
  referredById?: string | null;
  referralEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskCategory =
  | 'SOCIAL_MEDIA'
  | 'APP_TESTING'
  | 'SURVEYS'
  | 'DATA_LABELING'
  | 'CONTENT_WRITING'
  | 'WEBSITE_AUDIT'
  | 'VIDEO_REVIEW'
  | 'RESEARCH'
  | 'OTHER';

export type TaskDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type TaskStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type ProofType = 'SCREENSHOT_URL' | 'TEXT_ANSWER' | 'LINK_URL' | 'SURVEY_CODE' | 'MULTI_STEP';

export interface Task {
  id: string;
  title: string;
  description: string;
  instructions: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  rewardAmount: number;
  totalSlots: number;
  completedSlots: number;
  totalBudget: number;
  remainingBudget: number;
  timeEstimateMins: number;
  proofType?: ProofType;
  proofInstructions?: string;
  proofRequirement?: string;
  targetCountry?: string;
  creatorId: string;
  creatorName?: string;
  createdAt: string;
  updatedAt: string;
  hasSubmitted?: boolean;
  mySubmissionStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  mySubmissionId?: string | null;
  creator?: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
}

export interface Submission {
  id: string;
  taskId: string;
  taskTitle?: string;
  taskReward?: number;
  workerId: string;
  userId?: string;
  workerName?: string;
  workerEmail?: string;
  user?: {
    id?: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  proofText?: string;
  proofUrls: string[];
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  rewardPaid: number;
  submittedAt: string;
  reviewedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  amount: number;
  type:
    | 'TASK_EARNING'
    | 'TASK_BUDGET_ESCROW'
    | 'TASK_BUDGET_REFUND'
    | 'REFERRAL_COMMISSION'
    | 'WITHDRAWAL_REQUEST'
    | 'WITHDRAWAL_REFUND'
    | 'ADMIN_ADJUSTMENT'
    | string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  description: string;
  referenceId?: string;
  balanceAfter?: number;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  user?: {
    id?: string;
    name: string;
    email?: string;
  };
  amount: number;
  fee: number;
  netAmount?: number;
  method?: string;
  paymentMethod?: string;
  accountDetails: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  transactionHash?: string;
  adminNotes?: string;
  requestedAt?: string;
  createdAt?: string;
  processedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PlatformOverview {
  totalUsers: number;
  totalUsersCount?: number;
  totalTasks: number;
  activeTasks: number;
  activeTasksCount?: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  totalPaidOut: number;
  totalEarnedOverall?: number;
  topEarners?: Array<{
    id: string;
    name: string;
    avatar?: string;
    totalEarned: number;
    completedTasks: number;
  }>;
}

export interface AdminMetrics {
  totalUsers: number;
  workersCount: number;
  creatorsCount: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
  pendingSubmissionsCount: number;
  totalTaskEscrow: number;
  totalPaidOut: number;
  totalEarned?: number;
  recentTransactions?: Transaction[];
  recentWithdrawals?: Withdrawal[];
}
