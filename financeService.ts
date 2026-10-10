import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Expense, Budget, FinancialGoal, GoalContribution } from '../types';

// Fallback / initial sample data when user is in Demo Mode
export const INITIAL_DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    userId: 'demo-user-101',
    title: 'Monthly Apartment Rent',
    amount: 32000,
    category: 'Rent & Housing',
    date: '2026-03-01',
    paymentMethod: 'Net Banking',
    notes: '2BHK apartment rent transfer',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'exp-2',
    userId: 'demo-user-101',
    title: 'Grocery Supermart & Organic Milk',
    amount: 6450,
    category: 'Food & Dining',
    date: '2026-03-03',
    paymentMethod: 'UPI',
    notes: 'Weekly pantry replenishment',
    createdAt: '2026-03-03T11:20:00.000Z',
    updatedAt: '2026-03-03T11:20:00.000Z',
  },
  {
    id: 'exp-3',
    userId: 'demo-user-101',
    title: 'Broadband Fiber & Mobile Postpaid',
    amount: 2199,
    category: 'Bills & Utilities',
    date: '2026-03-04',
    paymentMethod: 'Credit Card',
    notes: 'JioFiber 300Mbps + Airtel family plan',
    createdAt: '2026-03-04T08:15:00.000Z',
    updatedAt: '2026-03-04T08:15:00.000Z',
  },
  {
    id: 'exp-4',
    userId: 'demo-user-101',
    title: 'Fuel Petrol Tank Fill',
    amount: 4200,
    category: 'Transportation',
    date: '2026-03-05',
    paymentMethod: 'Credit Card',
    notes: 'Indian Oil premium fuel',
    createdAt: '2026-03-05T14:30:00.000Z',
    updatedAt: '2026-03-05T14:30:00.000Z',
  },
  {
    id: 'exp-5',
    userId: 'demo-user-101',
    title: 'Fine Dining Weekend Dinner',
    amount: 3850,
    category: 'Food & Dining',
    date: '2026-03-06',
    paymentMethod: 'UPI',
    notes: 'Dinner with family at Punjab Grill',
    createdAt: '2026-03-06T20:45:00.000Z',
    updatedAt: '2026-03-06T20:45:00.000Z',
  },
  {
    id: 'exp-6',
    userId: 'demo-user-101',
    title: 'Online Cloud Computing Course',
    amount: 8999,
    category: 'Education',
    date: '2026-03-07',
    paymentMethod: 'Credit Card',
    notes: 'System design certification',
    createdAt: '2026-03-07T16:00:00.000Z',
    updatedAt: '2026-03-07T16:00:00.000Z',
  },
  {
    id: 'exp-7',
    userId: 'demo-user-101',
    title: 'Pharmacy & Health Checkup Medicines',
    amount: 1850,
    category: 'Healthcare',
    date: '2026-03-08',
    paymentMethod: 'UPI',
    notes: 'Monthly vitamins & routine meds',
    createdAt: '2026-03-08T09:30:00.000Z',
    updatedAt: '2026-03-08T09:30:00.000Z',
  },
  {
    id: 'exp-8',
    userId: 'demo-user-101',
    title: 'IMAX Movie Tickets & Snacks',
    amount: 1450,
    category: 'Entertainment',
    date: '2026-03-08',
    paymentMethod: 'UPI',
    notes: 'Weekend evening movie outing',
    createdAt: '2026-03-08T18:00:00.000Z',
    updatedAt: '2026-03-08T18:00:00.000Z',
  },
];

export const INITIAL_DEMO_BUDGETS: Budget[] = [
  {
    id: 'bud-1',
    userId: 'demo-user-101',
    name: 'Total Monthly Budget',
    category: 'Overall',
    amount: 95000,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    description: 'Comprehensive monthly household expense ceiling',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'bud-2',
    userId: 'demo-user-101',
    name: 'Food & Dining Out Limit',
    category: 'Food & Dining',
    amount: 15000,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    description: 'Groceries, cafes, food deliveries, and restaurants',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'bud-3',
    userId: 'demo-user-101',
    name: 'Fuel & Commute Budget',
    category: 'Transportation',
    amount: 8000,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    description: 'Petrol, metro passes, cab rides, and toll charges',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'bud-4',
    userId: 'demo-user-101',
    name: 'Shopping & Apparel',
    category: 'Shopping',
    amount: 10000,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    description: 'Clothes, electronics, and lifestyle purchases',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
];

export const INITIAL_DEMO_GOALS: FinancialGoal[] = [
  {
    id: 'goal-1',
    userId: 'demo-user-101',
    title: 'Emergency Rainy Day Fund',
    description: '6 months of living expenses safely deposited in high-yield liquid funds',
    targetAmount: 300000,
    currentAmount: 210000,
    deadline: '2026-08-31',
    category: 'Emergency Fund',
    status: 'in_progress',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'goal-2',
    userId: 'demo-user-101',
    title: 'MacBook Pro M3 Max',
    description: 'Upgrading work machine for full-stack software development',
    targetAmount: 199900,
    currentAmount: 145000,
    deadline: '2026-05-15',
    category: 'Electronics',
    status: 'in_progress',
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-03-02T00:00:00.000Z',
  },
  {
    id: 'goal-3',
    userId: 'demo-user-101',
    title: 'Himachal Monsoon Trek Vacation',
    description: 'Scenic travel across Spiti Valley and Manali with friends',
    targetAmount: 65000,
    currentAmount: 65000,
    deadline: '2026-07-20',
    category: 'Travel',
    status: 'completed',
    createdAt: '2025-12-01T00:00:00.000Z',
    updatedAt: '2026-02-28T00:00:00.000Z',
  },
];

export const INITIAL_DEMO_CONTRIBUTIONS: GoalContribution[] = [
  {
    id: 'cont-1',
    userId: 'demo-user-101',
    goalId: 'goal-1',
    amount: 50000,
    date: '2026-01-15',
    notes: 'Initial seed deposit',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'cont-2',
    userId: 'demo-user-101',
    goalId: 'goal-1',
    amount: 80000,
    date: '2026-02-01',
    notes: 'Annual performance bonus allocation',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'cont-3',
    userId: 'demo-user-101',
    goalId: 'goal-1',
    amount: 80000,
    date: '2026-03-01',
    notes: 'Monthly SIP transfer',
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'cont-4',
    userId: 'demo-user-101',
    goalId: 'goal-2',
    amount: 75000,
    date: '2026-01-20',
    notes: 'Tech upgrade fund allocation',
    createdAt: '2026-01-20T10:00:00.000Z',
  },
  {
    id: 'cont-5',
    userId: 'demo-user-101',
    goalId: 'goal-2',
    amount: 70000,
    date: '2026-02-25',
    notes: 'Freelance gig payout',
    createdAt: '2026-02-25T10:00:00.000Z',
  },
];

// Helper to seed demo data into local state or initial firestore records
export class FinanceService {
  // Expenses
  static async getExpenses(userId: string): Promise<Expense[]> {
    const path = 'expenses';
    try {
      const q = query(collection(db, path), where('userId', '==', userId), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const items: Expense[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<Expense, 'id'>) });
      });
      return items;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  static async addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const path = 'expenses';
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, path), {
        ...expense,
        createdAt: now,
        updatedAt: now,
      });
      return {
        id: docRef.id,
        ...expense,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  static async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    const path = `expenses/${id}`;
    try {
      const docRef = doc(db, 'expenses', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static async deleteExpense(id: string): Promise<void> {
    const path = `expenses/${id}`;
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  // Budgets
  static async getBudgets(userId: string): Promise<Budget[]> {
    const path = 'budgets';
    try {
      const q = query(collection(db, path), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const items: Budget[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<Budget, 'id'>) });
      });
      return items;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  static async addBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    const path = 'budgets';
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, path), {
        ...budget,
        createdAt: now,
        updatedAt: now,
      });
      return {
        id: docRef.id,
        ...budget,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  static async updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
    const path = `budgets/${id}`;
    try {
      const docRef = doc(db, 'budgets', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static async deleteBudget(id: string): Promise<void> {
    const path = `budgets/${id}`;
    try {
      await deleteDoc(doc(db, 'budgets', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  // Financial Goals
  static async getGoals(userId: string): Promise<FinancialGoal[]> {
    const path = 'financialGoals';
    try {
      const q = query(collection(db, path), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const items: FinancialGoal[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<FinancialGoal, 'id'>) });
      });
      return items;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  static async addGoal(goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialGoal> {
    const path = 'financialGoals';
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, path), {
        ...goal,
        createdAt: now,
        updatedAt: now,
      });
      return {
        id: docRef.id,
        ...goal,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  static async updateGoal(id: string, updates: Partial<FinancialGoal>): Promise<void> {
    const path = `financialGoals/${id}`;
    try {
      const docRef = doc(db, 'financialGoals', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static async deleteGoal(id: string): Promise<void> {
    const path = `financialGoals/${id}`;
    try {
      await deleteDoc(doc(db, 'financialGoals', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  // Goal Contributions
  static async getContributions(userId: string, goalId?: string): Promise<GoalContribution[]> {
    const path = 'goalContributions';
    try {
      let q = query(collection(db, path), where('userId', '==', userId));
      if (goalId) {
        q = query(collection(db, path), where('userId', '==', userId), where('goalId', '==', goalId));
      }
      const snapshot = await getDocs(q);
      const items: GoalContribution[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<GoalContribution, 'id'>) });
      });
      return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  static async addContribution(
    contribution: Omit<GoalContribution, 'id' | 'createdAt'>,
    currentGoalAmount: number,
    targetAmount: number
  ): Promise<GoalContribution> {
    const path = 'goalContributions';
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, path), {
        ...contribution,
        createdAt: now,
      });

      // Also update goal's currentAmount
      const updatedTotal = currentGoalAmount + contribution.amount;
      const newStatus = updatedTotal >= targetAmount ? 'completed' : 'in_progress';

      const goalRef = doc(db, 'financialGoals', contribution.goalId);
      await updateDoc(goalRef, {
        currentAmount: updatedTotal,
        status: newStatus,
        updatedAt: now,
      });

      return {
        id: docRef.id,
        ...contribution,
        createdAt: now,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}
