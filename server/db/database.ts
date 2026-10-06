import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'USER' | 'CREATOR' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
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

export interface Task {
  id: string;
  title: string;
  description: string;
  instructions: string;
  category: 'SOCIAL_MEDIA' | 'APP_TESTING' | 'SURVEYS' | 'DATA_LABELING' | 'CONTENT_WRITING' | 'WEBSITE_AUDIT' | 'VIDEO_REVIEW' | 'RESEARCH' | 'OTHER';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  rewardAmount: number;
  totalSlots: number;
  completedSlots: number;
  totalBudget: number;
  remainingBudget: number;
  timeEstimateMins: number;
  proofType: 'SCREENSHOT_URL' | 'TEXT_ANSWER' | 'LINK_URL' | 'SURVEY_CODE' | 'MULTI_STEP';
  proofInstructions: string;
  targetCountry: string;
  creatorId: string;
  creatorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  taskId: string;
  taskTitle?: string;
  taskReward?: number;
  workerId: string;
  workerName?: string;
  workerEmail?: string;
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
  type: 'TASK_EARNING' | 'TASK_BUDGET_ESCROW' | 'TASK_BUDGET_REFUND' | 'REFERRAL_COMMISSION' | 'WITHDRAWAL_REQUEST' | 'WITHDRAWAL_REFUND' | 'ADMIN_ADJUSTMENT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: 'PAYPAL' | 'CRYPTO_USDT' | 'BANK_TRANSFER' | 'WISE' | 'GIFT_CARD';
  accountDetails: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  transactionHash?: string;
  adminNotes?: string;
  requestedAt: string;
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

interface DatabaseSchema {
  users: User[];
  tasks: Task[];
  submissions: Submission[];
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  notifications: Notification[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class DatabaseStore {
  private data: DatabaseSchema = {
    users: [],
    tasks: [],
    submissions: [],
    transactions: [],
    withdrawals: [],
    notifications: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      }
    } catch (e) {
      console.warn('Could not read existing database file, initializing seeds', e);
    }

    this.seedDefaultData();
    this.save();
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file', err);
    }
  }

  private seedDefaultData() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('password123', salt);

    const adminUser: User = {
      id: 'usr_admin_001',
      email: 'admin@taskearn.com',
      passwordHash: defaultPasswordHash,
      name: 'Elena Vance (Admin)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'Head of Quality Assurance & Platform Integrity at TaskEarn.',
      role: 'ADMIN',
      status: 'ACTIVE',
      balance: 1250.0,
      pendingEarnings: 0.0,
      totalEarned: 3450.0,
      totalWithdrawn: 2200.0,
      referralCode: 'ADMINVIP',
      referredById: null,
      referralEarnings: 280.0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const creatorUser: User = {
      id: 'usr_creator_001',
      email: 'creator@taskearn.com',
      passwordHash: defaultPasswordHash,
      name: 'Apex Growth Labs',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'Digital marketing agency funding user research, application testing, and outreach tasks.',
      role: 'CREATOR',
      status: 'ACTIVE',
      balance: 450.0,
      pendingEarnings: 0.0,
      totalEarned: 0.0,
      totalWithdrawn: 0.0,
      referralCode: 'APEXGROWTH',
      referredById: adminUser.id,
      referralEarnings: 45.0,
      createdAt: '2026-01-05T10:00:00.000Z',
      updatedAt: '2026-01-05T10:00:00.000Z',
    };

    const workerUser: User = {
      id: 'usr_worker_001',
      email: 'worker@taskearn.com',
      passwordHash: defaultPasswordHash,
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: 'Passionate micro-task earner & app QA tester from Austin, TX.',
      role: 'USER',
      status: 'ACTIVE',
      balance: 68.75,
      pendingEarnings: 9.50,
      totalEarned: 248.50,
      totalWithdrawn: 170.25,
      referralCode: 'ALEX99',
      referredById: adminUser.id,
      referralEarnings: 22.40,
      createdAt: '2026-01-10T12:00:00.000Z',
      updatedAt: '2026-01-10T12:00:00.000Z',
    };

    const workerUser2: User = {
      id: 'usr_worker_002',
      email: 'sarah.t@taskearn.com',
      passwordHash: defaultPasswordHash,
      name: 'Sarah Tanaka',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'Data labeler, survey analyst, and freelance researcher.',
      role: 'USER',
      status: 'ACTIVE',
      balance: 34.20,
      pendingEarnings: 3.50,
      totalEarned: 112.00,
      totalWithdrawn: 75.00,
      referralCode: 'SARAHT',
      referredById: workerUser.id,
      referralEarnings: 8.50,
      createdAt: '2026-01-15T09:30:00.000Z',
      updatedAt: '2026-01-15T09:30:00.000Z',
    };

    this.data.users = [adminUser, creatorUser, workerUser, workerUser2];

    const tasks: Task[] = [
      {
        id: 'tsk_001',
        title: 'Test & Review Fintech Mobile App (iOS / Android)',
        description: 'Download our budgeting companion app, complete onboarding, and write an honest 2-sentence feedback review on UX flow.',
        instructions: '1. Open the Play Store or App Store link provided.\n2. Install "Nova Budget" and create a free test account.\n3. Navigate to the Analytics tab and take a clear screenshot of your dashboard.\n4. Upload the screenshot image link and state whether transaction categorization felt smooth.',
        category: 'APP_TESTING',
        difficulty: 'MEDIUM',
        status: 'ACTIVE',
        rewardAmount: 3.50,
        totalSlots: 100,
        completedSlots: 42,
        totalBudget: 350.00,
        remainingBudget: 203.00,
        timeEstimateMins: 8,
        proofType: 'SCREENSHOT_URL',
        proofInstructions: 'Provide screenshot URL of the inside profile/dashboard screen showing your username and Nova Budget logo.',
        targetCountry: 'GLOBAL',
        creatorId: creatorUser.id,
        creatorName: creatorUser.name,
        createdAt: '2026-01-12T08:00:00.000Z',
        updatedAt: '2026-01-12T08:00:00.000Z',
      },
      {
        id: 'tsk_002',
        title: 'Consumer Habits & Online Subscriptions Survey 2026',
        description: 'Complete a brief 15-question academic survey exploring modern recurring subscription fatigue and payment preferences.',
        instructions: '1. Click on the survey link: https://forms.example.com/consumer-insights-2026\n2. Answer all 15 multiple-choice questions thoughtfully.\n3. Upon reaching the completion page, copy your unique 6-digit confirmation validation code.\n4. Paste the code into the verification input below.',
        category: 'SURVEYS',
        difficulty: 'EASY',
        status: 'ACTIVE',
        rewardAmount: 1.75,
        totalSlots: 250,
        completedSlots: 180,
        totalBudget: 437.50,
        remainingBudget: 122.50,
        timeEstimateMins: 4,
        proofType: 'SURVEY_CODE',
        proofInstructions: 'Enter the exact 6-character alphanumeric completion code displayed on the final survey page (e.g. SUB-8492).',
        targetCountry: 'GLOBAL',
        creatorId: creatorUser.id,
        creatorName: creatorUser.name,
        createdAt: '2026-01-14T11:00:00.000Z',
        updatedAt: '2026-01-14T11:00:00.000Z',
      },
      {
        id: 'tsk_003',
        title: 'Social Proof: Follow & Retweet Product Launch Announcement',
        description: 'Follow our official tech handle on X/Twitter and retweet the pinned 2026 roadmap announcement with a positive remark.',
        instructions: '1. Visit @ApexGrowthHQ on Twitter/X.\n2. Follow the account.\n3. Like and Quote Retweet the pinned launch post with tag #Apex2026.\n4. Submit your Twitter profile link or link to the quote retweet.',
        category: 'SOCIAL_MEDIA',
        difficulty: 'EASY',
        status: 'ACTIVE',
        rewardAmount: 0.85,
        totalSlots: 500,
        completedSlots: 320,
        totalBudget: 425.00,
        remainingBudget: 153.00,
        timeEstimateMins: 2,
        proofType: 'LINK_URL',
        proofInstructions: 'Direct link to your retweet/quote post on X/Twitter.',
        targetCountry: 'GLOBAL',
        creatorId: creatorUser.id,
        creatorName: creatorUser.name,
        createdAt: '2026-01-18T14:30:00.000Z',
        updatedAt: '2026-01-18T14:30:00.000Z',
      },
      {
        id: 'tsk_004',
        title: 'AI Data Labeling: Categorize E-commerce Fashion Images',
        description: 'Review 10 product apparel photographs and tag dominant fabric texture, collar type, and seasonal styling tags.',
        instructions: '1. Access our labeling web tool via the provided portal.\n2. Classify 10 images accurately according to the guidelines.\n3. Submit your completed batch ID.',
        category: 'DATA_LABELING',
        difficulty: 'MEDIUM',
        status: 'ACTIVE',
        rewardAmount: 2.25,
        totalSlots: 150,
        completedSlots: 67,
        totalBudget: 337.50,
        remainingBudget: 186.75,
        timeEstimateMins: 6,
        proofType: 'TEXT_ANSWER',
        proofInstructions: 'Batch Submission ID generated upon completing all 10 labels.',
        targetCountry: 'GLOBAL',
        creatorId: creatorUser.id,
        creatorName: creatorUser.name,
        createdAt: '2026-01-20T09:00:00.000Z',
        updatedAt: '2026-01-20T09:00:00.000Z',
      },
      {
        id: 'tsk_005',
        title: 'Website Performance & Broken Link Audit',
        description: 'Perform a desktop browser check on 5 landing page URLs, check for layout issues, and report any 404 links found.',
        instructions: '1. Open the audit target URL in Chrome or Safari.\n2. Click each footer navigation item.\n3. Note down any non-functional links or slow loading assets.\n4. Summarize your findings in the proof submission box.',
        category: 'WEBSITE_AUDIT',
        difficulty: 'HARD',
        status: 'ACTIVE',
        rewardAmount: 5.00,
        totalSlots: 40,
        completedSlots: 15,
        totalBudget: 200.00,
        remainingBudget: 125.00,
        timeEstimateMins: 15,
        proofType: 'TEXT_ANSWER',
        proofInstructions: 'Detail at least 3 inspected subpages with load speed observation and list any broken links or confirm none found.',
        targetCountry: 'GLOBAL',
        creatorId: creatorUser.id,
        creatorName: creatorUser.name,
        createdAt: '2026-01-22T16:00:00.000Z',
        updatedAt: '2026-01-22T16:00:00.000Z',
      },
      {
        id: 'tsk_006',
        title: 'Video Testing: Watch 3-Min Demo Video & Answer 3 Checkpoints',
        description: 'Watch an upcoming SaaS product introduction video and answer 3 short verification questions to confirm clarity.',
        instructions: '1. Watch the video at: https://stream.example.com/demo-v2\n2. Note the product price mentioned at minute 1:45.\n3. Note the primary integration highlighted at minute 2:30.\n4. Submit your concise answers.',
        category: 'VIDEO_REVIEW',
        difficulty: 'EASY',
        status: 'ACTIVE',
        rewardAmount: 1.20,
        totalSlots: 200,
        completedSlots: 88,
        totalBudget: 240.00,
        remainingBudget: 134.40,
        timeEstimateMins: 3,
        proofType: 'TEXT_ANSWER',
        proofInstructions: 'Answer: 1) Price mentioned, 2) Primary integration name, 3) One key benefit.',
        targetCountry: 'GLOBAL',
        creatorId: creatorUser.id,
        creatorName: creatorUser.name,
        createdAt: '2026-01-25T11:15:00.000Z',
        updatedAt: '2026-01-25T11:15:00.000Z',
      },
    ];

    this.data.tasks = tasks;

    const submissions: Submission[] = [
      {
        id: 'sub_001',
        taskId: 'tsk_001',
        taskTitle: tasks[0].title,
        taskReward: tasks[0].rewardAmount,
        workerId: workerUser.id,
        workerName: workerUser.name,
        workerEmail: workerUser.email,
        proofText: 'The app works fast on my Samsung Galaxy S23. Transaction categories synchronized in less than 2 seconds.',
        proofUrls: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'],
        notes: 'Great clean UI, enjoyed testing the analytics.',
        status: 'APPROVED',
        reviewNotes: 'Verified screenshot and constructive UX feedback. Approved with full reward.',
        rewardPaid: 3.50,
        submittedAt: '2026-01-13T10:15:00.000Z',
        reviewedAt: '2026-01-13T14:30:00.000Z',
      },
      {
        id: 'sub_002',
        taskId: 'tsk_002',
        taskTitle: tasks[1].title,
        taskReward: tasks[1].rewardAmount,
        workerId: workerUser.id,
        workerName: workerUser.name,
        workerEmail: workerUser.email,
        proofText: 'Completion code: SUB-918234',
        proofUrls: [],
        notes: 'Submitted all 15 survey questions.',
        status: 'APPROVED',
        reviewNotes: 'Code matches database records.',
        rewardPaid: 1.75,
        submittedAt: '2026-01-15T15:20:00.000Z',
        reviewedAt: '2026-01-15T16:00:00.000Z',
      },
      {
        id: 'sub_003',
        taskId: 'tsk_004',
        taskTitle: tasks[3].title,
        taskReward: tasks[3].rewardAmount,
        workerId: workerUser.id,
        workerName: workerUser.name,
        workerEmail: workerUser.email,
        proofText: 'Batch ID: FASHION-LBL-8841-BATCH',
        proofUrls: [],
        notes: 'Completed 10 labels adhering strictly to the guideline document.',
        status: 'PENDING',
        rewardPaid: 0.0,
        submittedAt: '2026-01-26T12:00:00.000Z',
      },
      {
        id: 'sub_004',
        taskId: 'tsk_002',
        taskTitle: tasks[1].title,
        taskReward: tasks[1].rewardAmount,
        workerId: workerUser2.id,
        workerName: workerUser2.name,
        workerEmail: workerUser2.email,
        proofText: 'Survey code: SUB-492817',
        proofUrls: [],
        notes: 'Answered accurately regarding streaming service subscriptions.',
        status: 'APPROVED',
        reviewNotes: 'Valid completion code verified.',
        rewardPaid: 1.75,
        submittedAt: '2026-01-16T18:00:00.000Z',
        reviewedAt: '2026-01-16T19:00:00.000Z',
      },
    ];

    this.data.submissions = submissions;

    const transactions: Transaction[] = [
      {
        id: 'tx_001',
        userId: workerUser.id,
        userName: workerUser.name,
        amount: 3.50,
        type: 'TASK_EARNING',
        status: 'COMPLETED',
        description: 'Reward for Task: Test & Review Fintech Mobile App',
        referenceId: 'sub_001',
        createdAt: '2026-01-13T14:30:00.000Z',
      },
      {
        id: 'tx_002',
        userId: adminUser.id,
        userName: adminUser.name,
        amount: 0.28,
        type: 'REFERRAL_COMMISSION',
        status: 'COMPLETED',
        description: '8% Referral commission from Alex Rivera (Task tsk_001)',
        referenceId: 'usr_worker_001',
        createdAt: '2026-01-13T14:30:00.000Z',
      },
      {
        id: 'tx_003',
        userId: workerUser.id,
        userName: workerUser.name,
        amount: 1.75,
        type: 'TASK_EARNING',
        status: 'COMPLETED',
        description: 'Reward for Task: Consumer Habits Survey 2026',
        referenceId: 'sub_002',
        createdAt: '2026-01-15T16:00:00.000Z',
      },
      {
        id: 'tx_004',
        userId: workerUser.id,
        userName: workerUser.name,
        amount: -50.00,
        type: 'WITHDRAWAL_REQUEST',
        status: 'COMPLETED',
        description: 'Withdrawal to PayPal (alex.rivera.pay@example.com)',
        referenceId: 'wd_001',
        createdAt: '2026-01-18T10:00:00.000Z',
      },
    ];

    this.data.transactions = transactions;

    const withdrawals: Withdrawal[] = [
      {
        id: 'wd_001',
        userId: workerUser.id,
        userName: workerUser.name,
        userEmail: workerUser.email,
        amount: 50.00,
        fee: 1.00,
        netAmount: 49.00,
        method: 'PAYPAL',
        accountDetails: 'alex.rivera.pay@example.com',
        status: 'COMPLETED',
        transactionHash: 'PP-99482716381',
        adminNotes: 'Processed via automated PayPal Payouts batch #401',
        requestedAt: '2026-01-18T10:00:00.000Z',
        processedAt: '2026-01-18T13:45:00.000Z',
      },
      {
        id: 'wd_002',
        userId: workerUser.id,
        userName: workerUser.name,
        userEmail: workerUser.email,
        amount: 25.00,
        fee: 0.50,
        netAmount: 24.50,
        method: 'CRYPTO_USDT',
        accountDetails: '0x71C...4e8B (TRC-20)',
        status: 'PENDING',
        adminNotes: 'Awaiting admin batch payout verification',
        requestedAt: '2026-01-26T14:10:00.000Z',
      },
      {
        id: 'wd_003',
        userId: workerUser2.id,
        userName: workerUser2.name,
        userEmail: workerUser2.email,
        amount: 20.00,
        fee: 0.40,
        netAmount: 19.60,
        method: 'WISE',
        accountDetails: 'sarah.tanaka.wise@example.com',
        status: 'PENDING',
        adminNotes: 'First withdrawal verification',
        requestedAt: '2026-01-27T08:30:00.000Z',
      },
    ];

    this.data.withdrawals = withdrawals;

    const notifications: Notification[] = [
      {
        id: 'notif_001',
        userId: workerUser.id,
        title: 'Task Approved! +$3.50',
        message: 'Your submission for "Test & Review Fintech Mobile App" was reviewed and approved.',
        type: 'TASK_APPROVED',
        link: '/submissions',
        isRead: false,
        createdAt: '2026-01-13T14:30:00.000Z',
      },
      {
        id: 'notif_002',
        userId: workerUser.id,
        title: 'Withdrawal Processed',
        message: '$49.00 USD was successfully sent to your PayPal account.',
        type: 'WITHDRAWAL_PAID',
        link: '/withdrawals',
        isRead: true,
        createdAt: '2026-01-18T13:45:00.000Z',
      },
      {
        id: 'notif_003',
        userId: adminUser.id,
        title: 'New Withdrawal Request',
        message: 'Alex Rivera requested a withdrawal of $25.00 via USDT.',
        type: 'ADMIN_ALERT',
        link: '/admin',
        isRead: false,
        createdAt: '2026-01-26T14:10:00.000Z',
      },
    ];

    this.data.notifications = notifications;
  }

  // User queries
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserByReferralCode(code: string): User | undefined {
    return this.data.users.find((u) => u.referralCode.toUpperCase() === code.toUpperCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.users[idx];
  }

  // Task queries
  public getTasks(filters?: {
    category?: string;
    difficulty?: string;
    status?: string;
    search?: string;
    creatorId?: string;
  }): Task[] {
    let result = [...this.data.tasks];

    if (filters?.status) {
      result = result.filter((t) => t.status === filters.status);
    } else {
      // By default show active tasks unless specified
      result = result.filter((t) => t.status === 'ACTIVE' || t.status === 'PAUSED');
    }

    if (filters?.creatorId) {
      result = result.filter((t) => t.creatorId === filters.creatorId);
    }

    if (filters?.category && filters.category !== 'ALL') {
      result = result.filter((t) => t.category === filters.category);
    }

    if (filters?.difficulty && filters.difficulty !== 'ALL') {
      result = result.filter((t) => t.difficulty === filters.difficulty);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAllTasksAdmin(): Task[] {
    return [...this.data.tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getTaskById(id: string): Task | undefined {
    return this.data.tasks.find((t) => t.id === id);
  }

  public createTask(task: Task): Task {
    this.data.tasks.unshift(task);
    this.save();
    return task;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.data.tasks[idx] = {
      ...this.data.tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.tasks[idx];
  }

  public deleteTask(id: string): boolean {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.data.tasks.splice(idx, 1);
    this.save();
    return true;
  }

  // Submission queries
  public getSubmissions(filters?: {
    taskId?: string;
    workerId?: string;
    status?: string;
  }): Submission[] {
    let result = [...this.data.submissions];
    if (filters?.taskId) result = result.filter((s) => s.taskId === filters.taskId);
    if (filters?.workerId) result = result.filter((s) => s.workerId === filters.workerId);
    if (filters?.status) result = result.filter((s) => s.status === filters.status);
    return result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public getSubmissionById(id: string): Submission | undefined {
    return this.data.submissions.find((s) => s.id === id);
  }

  public getSubmissionByTaskAndWorker(taskId: string, workerId: string): Submission | undefined {
    return this.data.submissions.find((s) => s.taskId === taskId && s.workerId === workerId);
  }

  public createSubmission(submission: Submission): Submission {
    this.data.submissions.unshift(submission);
    this.save();
    return submission;
  }

  public updateSubmission(id: string, updates: Partial<Submission>): Submission | undefined {
    const idx = this.data.submissions.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.data.submissions[idx] = {
      ...this.data.submissions[idx],
      ...updates,
    };
    this.save();
    return this.data.submissions[idx];
  }

  // Transaction queries
  public getTransactions(userId?: string): Transaction[] {
    let result = [...this.data.transactions];
    if (userId) result = result.filter((t) => t.userId === userId);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createTransaction(tx: Transaction): Transaction {
    this.data.transactions.unshift(tx);
    this.save();
    return tx;
  }

  // Withdrawal queries
  public getWithdrawals(filters?: { userId?: string; status?: string }): Withdrawal[] {
    let result = [...this.data.withdrawals];
    if (filters?.userId) result = result.filter((w) => w.userId === filters.userId);
    if (filters?.status) result = result.filter((w) => w.status === filters.status);
    return result.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  public getWithdrawalById(id: string): Withdrawal | undefined {
    return this.data.withdrawals.find((w) => w.id === id);
  }

  public createWithdrawal(wd: Withdrawal): Withdrawal {
    this.data.withdrawals.unshift(wd);
    this.save();
    return wd;
  }

  public updateWithdrawal(id: string, updates: Partial<Withdrawal>): Withdrawal | undefined {
    const idx = this.data.withdrawals.findIndex((w) => w.id === id);
    if (idx === -1) return undefined;
    this.data.withdrawals[idx] = {
      ...this.data.withdrawals[idx],
      ...updates,
    };
    this.save();
    return this.data.withdrawals[idx];
  }

  // Notifications
  public getNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(n: Notification): Notification {
    this.data.notifications.unshift(n);
    this.save();
    return n;
  }

  public markNotificationRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId: string): void {
    this.data.notifications
      .filter((n) => n.userId === userId)
      .forEach((n) => {
        n.isRead = true;
      });
    this.save();
  }

  // Metrics & Stats
  public getPlatformOverview() {
    const totalUsers = this.data.users.length;
    const totalTasks = this.data.tasks.length;
    const activeTasks = this.data.tasks.filter((t) => t.status === 'ACTIVE').length;
    const totalSubmissions = this.data.submissions.length;
    const approvedSubmissions = this.data.submissions.filter((s) => s.status === 'APPROVED').length;
    const totalPaidOut = this.data.users.reduce((acc, u) => acc + (u.totalWithdrawn || 0), 0);
    const totalEarnedOverall = this.data.users.reduce((acc, u) => acc + (u.totalEarned || 0), 0);
    
    // Top earners leaderboard
    const topEarners = [...this.data.users]
      .filter((u) => u.role === 'USER')
      .sort((a, b) => b.totalEarned - a.totalEarned)
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        totalEarned: u.totalEarned,
        completedTasks: this.data.submissions.filter((s) => s.workerId === u.id && s.status === 'APPROVED').length,
      }));

    return {
      totalUsers,
      totalTasks,
      activeTasks,
      totalSubmissions,
      approvedSubmissions,
      totalPaidOut: Number(totalPaidOut.toFixed(2)),
      totalEarnedOverall: Number(totalEarnedOverall.toFixed(2)),
      topEarners,
    };
  }

  public getAdminDashboardMetrics() {
    const totalUsers = this.data.users.length;
    const workersCount = this.data.users.filter((u) => u.role === 'USER').length;
    const creatorsCount = this.data.users.filter((u) => u.role === 'CREATOR').length;
    const pendingWithdrawals = this.data.withdrawals.filter((w) => w.status === 'PENDING');
    const pendingWithdrawalsAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const pendingSubmissionsCount = this.data.submissions.filter((s) => s.status === 'PENDING').length;
    const totalTaskEscrow = this.data.tasks.reduce((sum, t) => sum + (t.remainingBudget || 0), 0);
    const totalPaidOut = this.data.withdrawals
      .filter((w) => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0);

    return {
      totalUsers,
      workersCount,
      creatorsCount,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      pendingWithdrawalsAmount: Number(pendingWithdrawalsAmount.toFixed(2)),
      pendingSubmissionsCount,
      totalTaskEscrow: Number(totalTaskEscrow.toFixed(2)),
      totalPaidOut: Number(totalPaidOut.toFixed(2)),
      recentTransactions: this.data.transactions.slice(0, 10),
      recentWithdrawals: this.data.withdrawals.slice(0, 8),
    };
  }
}

export const db = new DatabaseStore();
