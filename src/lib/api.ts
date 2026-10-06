// Centralized API client for TaskEarn
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('taskearn_token') : null;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('taskearn_token', token);
      } else {
        localStorage.removeItem('taskearn_token');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error occurred. Please try again.',
      };
    }
  }

  // Auth endpoints
  public register(data: any) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  }

  public login(data: any) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  }

  public getMe() {
    return this.request('/auth/me');
  }

  public updateProfile(data: any) {
    return this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
  }

  public changePassword(data: any) {
    return this.request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) });
  }

  // Tasks endpoints
  public getTasks(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/tasks${query}`);
  }

  public getTaskById(id: string) {
    return this.request(`/tasks/${id}`);
  }

  public createTask(data: any) {
    return this.request('/tasks', { method: 'POST', body: JSON.stringify(data) });
  }

  public updateTask(id: string, data: any) {
    return this.request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  public cancelTask(id: string) {
    return this.request(`/tasks/${id}`, { method: 'DELETE' });
  }

  // Submissions endpoints
  public submitTaskProof(data: any) {
    return this.request('/submissions', { method: 'POST', body: JSON.stringify(data) });
  }

  public getMySubmissions() {
    return this.request('/submissions/my');
  }

  public getTaskSubmissions(taskId: string) {
    return this.request(`/submissions/task/${taskId}`);
  }

  public reviewSubmission(id: string, data: { status: 'APPROVED' | 'REJECTED'; reviewNotes: string }) {
    return this.request(`/submissions/${id}/review`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Wallet & Withdrawals
  public getWalletSummary() {
    return this.request('/wallet/summary');
  }

  public getTransactions() {
    return this.request('/wallet/transactions');
  }

  public depositFunds(amount: number, method: string) {
    return this.request('/wallet/deposit', { method: 'POST', body: JSON.stringify({ amount, method }) });
  }

  public depositWallet(data: { amount: number; method?: string }) {
    return this.depositFunds(data.amount, data.method || 'STRIPE_CARD');
  }

  public getWithdrawals() {
    return this.request('/withdrawals');
  }

  public requestWithdrawal(data: { amount: number; method?: string; paymentMethod?: string; accountDetails: string }) {
    const payload = {
      amount: data.amount,
      method: data.method || data.paymentMethod || 'PAYPAL',
      accountDetails: data.accountDetails,
    };
    return this.request('/withdrawals', { method: 'POST', body: JSON.stringify(payload) });
  }

  public createWithdrawal(data: any) {
    return this.requestWithdrawal(data);
  }

  // Referrals
  public getReferrals() {
    return this.request('/referrals');
  }

  // Notifications
  public getNotifications() {
    return this.request('/notifications');
  }

  public markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  public markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  // Platform Stats
  public getPlatformStats() {
    return this.request('/stats/overview');
  }

  // Admin endpoints
  public getAdminMetrics() {
    return this.request('/admin/metrics');
  }

  public getAdminUsers(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/admin/users${query}`);
  }

  public updateAdminUser(id: string, data: any) {
    return this.request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  public getAdminWithdrawals(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/admin/withdrawals${query}`);
  }

  public processAdminWithdrawal(id: string, data: { status: string; transactionHash?: string; adminNotes?: string }) {
    return this.request(`/admin/withdrawals/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  public getAdminTasks() {
    return this.request('/admin/tasks');
  }

  public getAdminSubmissions(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/admin/submissions${query}`);
  }
}

export const api = new ApiClient();
