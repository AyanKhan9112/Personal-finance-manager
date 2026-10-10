export type UserRole = 'admin' | 'user';
export type AccountStatus = 'active' | 'disabled';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  currency?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Transportation'
  | 'Shopping'
  | 'Education'
  | 'Rent & Housing'
  | 'Bills & Utilities'
  | 'Healthcare'
  | 'Entertainment'
  | 'Travel'
  | 'Other';

export type PaymentMethod =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Net Banking'
  | 'Cash'
  | 'Other';

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: ExpenseCategory | string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod | string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  category: string; // 'Overall' or specific category
  amount: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type GoalStatus = 'in_progress' | 'completed' | 'cancelled';

export interface FinancialGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GoalContribution {
  id: string;
  userId: string;
  goalId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface SystemSettings {
  settingsId: string;
  appName: string;
  defaultCurrency: string;
  budgetWarningThreshold: number; // e.g. 80
  allowUserRegistration: boolean;
  maintenanceMode: boolean;
  supportedCategories: string[];
  updatedBy: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: 'user' | 'system' | 'security' | 'expense' | 'budget' | 'goal';
  targetId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
  link?: string;
}

export type DateFilterOption = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all';
