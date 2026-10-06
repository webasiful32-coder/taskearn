import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(60),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['USER', 'CREATOR']).default('USER'),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  bio: z.string().max(300).optional(),
  avatar: z.string().url().or(z.string().length(0)).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export const createTaskSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  instructions: z.string().min(20, 'Instructions must be comprehensive and clear'),
  category: z.enum([
    'SOCIAL_MEDIA',
    'APP_TESTING',
    'SURVEYS',
    'DATA_LABELING',
    'CONTENT_WRITING',
    'WEBSITE_AUDIT',
    'VIDEO_REVIEW',
    'RESEARCH',
    'OTHER',
  ]),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
  rewardAmount: z.number().min(0.20, 'Minimum reward payout is $0.20').max(500.0),
  totalSlots: z.number().int().min(1, 'Must allow at least 1 submission slot').max(10000),
  timeEstimateMins: z.number().int().min(1).max(240).default(5),
  proofType: z.enum(['SCREENSHOT_URL', 'TEXT_ANSWER', 'LINK_URL', 'SURVEY_CODE', 'MULTI_STEP']),
  proofInstructions: z.string().min(5, 'Proof instructions are required'),
  targetCountry: z.string().default('GLOBAL'),
});

export const createSubmissionSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  proofText: z.string().optional(),
  proofUrls: z.array(z.string()).default([]),
  notes: z.string().max(500).optional(),
});

export const reviewSubmissionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNotes: z.string().min(3, 'Review feedback notes are required'),
});

export const createWithdrawalSchema = z.object({
  amount: z.number().min(5.0, 'Minimum withdrawal amount is $5.00').max(10000.0),
  method: z.enum(['PAYPAL', 'CRYPTO_USDT', 'BANK_TRANSFER', 'WISE', 'GIFT_CARD']),
  accountDetails: z.string().min(3, 'Valid account details or address required'),
});

export const adminProcessWithdrawalSchema = z.object({
  status: z.enum(['COMPLETED', 'REJECTED', 'PROCESSING']),
  transactionHash: z.string().optional(),
  adminNotes: z.string().optional(),
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(['USER', 'CREATOR', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']).optional(),
  balanceAdjustment: z.number().optional(),
  adjustmentReason: z.string().optional(),
});

export function formatZodError(error: any): string {
  const issues = error?.issues || error?.errors;
  if (Array.isArray(issues) && issues.length > 0) {
    return issues[0]?.message || 'Validation error';
  }
  return error?.message || 'Validation error';
}

