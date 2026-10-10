/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { ExpensesView } from './components/expenses/ExpensesView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { GoalsView } from './components/goals/GoalsView';
import { ReportsView } from './components/reports/ReportsView';
import { ProfileView } from './components/profile/ProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { RubricEvaluatorView } from './components/evaluator/RubricEvaluatorView';
import { ExpenseModal } from './components/expenses/ExpenseModal';
import { BudgetModal } from './components/budgets/BudgetModal';
import { GoalModal } from './components/goals/GoalModal';
import { ContributeModal } from './components/goals/ContributeModal';
import { GoalHistoryModal } from './components/goals/GoalHistoryModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { ToastContainer } from './components/common/Toast';
import {
  FinanceService,
  INITIAL_DEMO_EXPENSES,
  INITIAL_DEMO_BUDGETS,
  INITIAL_DEMO_GOALS,
  INITIAL_DEMO_CONTRIBUTIONS,
} from './services/financeService';
import {
  AdminService,
  DEFAULT_SYSTEM_SETTINGS,
  INITIAL_DEMO_USERS,
  INITIAL_AUDIT_LOGS,
} from './services/adminService';
import {
  Expense,
  Budget,
  FinancialGoal,
  GoalContribution,
  UserProfile,
  SystemSettings,
  AuditLog,
} from './types';
import { formatINR } from './lib/currency';

function MainApp() {
  const { userProfile, loading: authLoading, isAdmin, isDemoMode } = useAuth();
  const { showToast, addNotification } = useNotifications();

  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Core data states
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [contributions, setContributions] = useState<GoalContribution[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<FinancialGoal | null>(null);

  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [goalToContribute, setGoalToContribute] = useState<FinancialGoal | null>(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [goalForHistory, setGoalForHistory] = useState<FinancialGoal | null>(null);

  // Destructive delete modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Load data based on auth / demo state
  useEffect(() => {
    if (!userProfile) return;

    if (isDemoMode) {
      setExpenses(INITIAL_DEMO_EXPENSES);
      setBudgets(INITIAL_DEMO_BUDGETS);
      setGoals(INITIAL_DEMO_GOALS);
      setContributions(INITIAL_DEMO_CONTRIBUTIONS);
      setAdminUsers(INITIAL_DEMO_USERS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setSystemSettings(DEFAULT_SYSTEM_SETTINGS);
      setDataLoading(false);
      return;
    }

    // Real Firebase Firestore mode
    setDataLoading(true);
    const loadUserData = async () => {
      try {
        const [userExpenses, userBudgets, userGoals, userContribs, settings] =
          await Promise.all([
            FinanceService.getExpenses(userProfile.uid).catch(() => []),
            FinanceService.getBudgets(userProfile.uid).catch(() => []),
            FinanceService.getGoals(userProfile.uid).catch(() => []),
            FinanceService.getContributions(userProfile.uid).catch(() => []),
            AdminService.getSystemSettings().catch(() => DEFAULT_SYSTEM_SETTINGS),
          ]);

        setExpenses(userExpenses || []);
        setBudgets(userBudgets || []);
        setGoals(userGoals || []);
        setContributions(userContribs || []);
        setSystemSettings(settings);

        if (userProfile.role === 'admin') {
          const [allUsers, logs] = await Promise.all([
            AdminService.getAllUsers().catch(() => [userProfile]),
            AdminService.getAuditLogs().catch(() => []),
          ]);
          setAdminUsers(allUsers || [userProfile]);
          setAuditLogs(logs || []);
        }
      } catch (err) {
        console.error('Failed to load Firestore data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    loadUserData();
  }, [userProfile, isDemoMode]);

  // Proactive budget warnings & alerts checker
  const checkBudgetThresholds = (
    updatedExpenses: Expense[],
    currentBudgets: Budget[],
    threshold: number
  ) => {
    currentBudgets.forEach(b => {
      const eligible = updatedExpenses.filter(e => {
        const inDate = e.date >= b.startDate && e.date <= b.endDate;
        if (!inDate) return false;
        return b.category === 'Overall' || e.category === b.category;
      });
      const spent = eligible.reduce((acc, x) => acc + x.amount, 0);
      const ratio = b.amount > 0 ? (spent / b.amount) * 100 : 0;

      if (spent >= b.amount) {
        addNotification({
          title: `Budget Exceeded: ${b.name}`,
          message: `Spending reached ${formatINR(spent)}, exceeding the limit of ${formatINR(b.amount)}!`,
          type: 'alert',
        });
      } else if (ratio >= threshold) {
        addNotification({
          title: `Budget Warning (${ratio.toFixed(0)}%): ${b.name}`,
          message: `You have utilized ${formatINR(spent)} of your ${formatINR(b.amount)} budget allowance.`,
          type: 'warning',
        });
      }
    });
  };

  // Expense Handlers
  const handleSaveExpense = async (data: {
    title: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod: string;
    notes?: string;
  }) => {
    if (!userProfile) return;

    if (isDemoMode) {
      if (expenseToEdit) {
        const updated = expenses.map(e =>
          e.id === expenseToEdit.id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
        );
        setExpenses(updated);
        checkBudgetThresholds(updated, budgets, systemSettings.budgetWarningThreshold);
      } else {
        const newExp: Expense = {
          id: 'exp-' + Date.now(),
          userId: userProfile.uid,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [newExp, ...expenses];
        setExpenses(updated);
        checkBudgetThresholds(updated, budgets, systemSettings.budgetWarningThreshold);
      }
      showToast('Expense saved successfully.', 'success');
      return;
    }

    // Firestore mutation
    if (expenseToEdit) {
      await FinanceService.updateExpense(expenseToEdit.id, data);
      const updated = expenses.map(e =>
        e.id === expenseToEdit.id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
      );
      setExpenses(updated);
      checkBudgetThresholds(updated, budgets, systemSettings.budgetWarningThreshold);
    } else {
      const created = await FinanceService.addExpense({
        userId: userProfile.uid,
        ...data,
      });
      const updated = [created, ...expenses];
      setExpenses(updated);
      checkBudgetThresholds(updated, budgets, systemSettings.budgetWarningThreshold);
    }
    showToast('Expense recorded successfully.', 'success');
  };

  const handleDeleteExpense = (id: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense record?',
      onConfirm: async () => {
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
        if (isDemoMode) {
          setExpenses(prev => prev.filter(e => e.id !== id));
          showToast('Expense deleted.', 'success');
          return;
        }
        await FinanceService.deleteExpense(id);
        setExpenses(prev => prev.filter(e => e.id !== id));
        showToast('Expense removed from database.', 'success');
      },
    });
  };

  // Budget Handlers
  const handleSaveBudget = async (data: {
    name: string;
    category: string;
    amount: number;
    startDate: string;
    endDate: string;
    description?: string;
  }) => {
    if (!userProfile) return;

    if (isDemoMode) {
      if (budgetToEdit) {
        setBudgets(prev =>
          prev.map(b => (b.id === budgetToEdit.id ? { ...b, ...data } : b))
        );
      } else {
        const newBudget: Budget = {
          id: 'bud-' + Date.now(),
          userId: userProfile.uid,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setBudgets(prev => [newBudget, ...prev]);
      }
      showToast('Budget configured.', 'success');
      return;
    }

    if (budgetToEdit) {
      await FinanceService.updateBudget(budgetToEdit.id, data);
      setBudgets(prev =>
        prev.map(b => (b.id === budgetToEdit.id ? { ...b, ...data } : b))
      );
    } else {
      const created = await FinanceService.addBudget({
        userId: userProfile.uid,
        ...data,
      });
      setBudgets(prev => [created, ...prev]);
    }
    showToast('Budget saved successfully.', 'success');
  };

  const handleDeleteBudget = (id: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Budget',
      message: 'Are you sure you want to delete this budget limit plan?',
      onConfirm: async () => {
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
        if (isDemoMode) {
          setBudgets(prev => prev.filter(b => b.id !== id));
          showToast('Budget removed.', 'success');
          return;
        }
        await FinanceService.deleteBudget(id);
        setBudgets(prev => prev.filter(b => b.id !== id));
        showToast('Budget plan removed from database.', 'success');
      },
    });
  };

  // Goal Handlers
  const handleSaveGoal = async (data: any) => {
    if (!userProfile) return;

    if (isDemoMode) {
      if (goalToEdit) {
        setGoals(prev => prev.map(g => (g.id === goalToEdit.id ? { ...g, ...data } : g)));
      } else {
        const newGoal: FinancialGoal = {
          id: 'goal-' + Date.now(),
          userId: userProfile.uid,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setGoals(prev => [newGoal, ...prev]);
      }
      showToast('Financial goal saved.', 'success');
      return;
    }

    if (goalToEdit) {
      await FinanceService.updateGoal(goalToEdit.id, data);
      setGoals(prev => prev.map(g => (g.id === goalToEdit.id ? { ...g, ...data } : g)));
    } else {
      const created = await FinanceService.addGoal({
        userId: userProfile.uid,
        ...data,
      });
      setGoals(prev => [created, ...prev]);
    }
    showToast('Goal saved successfully.', 'success');
  };

  const handleDeleteGoal = (id: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Financial Goal',
      message: 'Are you sure you want to remove this financial goal?',
      onConfirm: async () => {
        setDeleteModal(prev => ({ ...prev, isOpen: false }));
        if (isDemoMode) {
          setGoals(prev => prev.filter(g => g.id !== id));
          showToast('Goal deleted.', 'success');
          return;
        }
        await FinanceService.deleteGoal(id);
        setGoals(prev => prev.filter(g => g.id !== id));
        showToast('Goal deleted from database.', 'success');
      },
    });
  };

  // Goal Contribution Handler
  const handleRecordContribution = async (
    goalId: string,
    amount: number,
    date: string,
    notes?: string
  ) => {
    if (!userProfile) return;

    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;

    if (isDemoMode) {
      const newContrib: GoalContribution = {
        id: 'cont-' + Date.now(),
        userId: userProfile.uid,
        goalId,
        amount,
        date,
        notes,
        createdAt: new Date().toISOString(),
      };
      setContributions(prev => [newContrib, ...prev]);

      const updatedSaved = targetGoal.currentAmount + amount;
      const reached = updatedSaved >= targetGoal.targetAmount;
      setGoals(prev =>
        prev.map(g =>
          g.id === goalId
            ? {
                ...g,
                currentAmount: updatedSaved,
                status: reached ? 'completed' : g.status,
              }
            : g
        )
      );

      showToast(`Contributed ${formatINR(amount)} to ${targetGoal.title}!`, 'success');
      if (reached) {
        addNotification({
          title: `Goal Achieved: ${targetGoal.title}`,
          message: `Congratulations! You have reached your target savings goal of ${formatINR(targetGoal.targetAmount)}!`,
          type: 'success',
        });
      }
      return;
    }

    const created = await FinanceService.addContribution(
      {
        userId: userProfile.uid,
        goalId,
        amount,
        date,
        notes,
      },
      targetGoal.currentAmount,
      targetGoal.targetAmount
    );

    setContributions(prev => [created, ...prev]);
    const updatedTotal = targetGoal.currentAmount + amount;
    const isCompleted = updatedTotal >= targetGoal.targetAmount;

    setGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? {
              ...g,
              currentAmount: updatedTotal,
              status: isCompleted ? 'completed' : g.status,
            }
          : g
      )
    );

    showToast(`Contributed ${formatINR(amount)} to ${targetGoal.title}!`, 'success');
    if (isCompleted) {
      addNotification({
        title: `Goal Achieved: ${targetGoal.title}`,
        message: `Congratulations! You have reached your target savings goal of ${formatINR(targetGoal.targetAmount)}!`,
        type: 'success',
      });
    }
  };

  // Admin Handlers
  const handleUpdateUserRole = async (uid: string, role: 'admin' | 'user') => {
    if (isDemoMode) {
      setAdminUsers(prev => prev.map(u => (u.uid === uid ? { ...u, role } : u)));
      showToast(`User role updated to ${role}.`, 'success');
      return;
    }
    await AdminService.updateUserRole(uid, role);
    setAdminUsers(prev => prev.map(u => (u.uid === uid ? { ...u, role } : u)));
    showToast(`User role updated to ${role}.`, 'success');
    await AdminService.recordAuditLog({
      actorId: userProfile?.uid || 'admin',
      actorEmail: userProfile?.email || 'admin',
      action: 'USER_ROLE_UPDATED',
      targetType: 'user',
      targetId: uid,
      metadata: { newRole: role },
    });
  };

  const handleUpdateUserStatus = async (uid: string, status: 'active' | 'disabled') => {
    if (isDemoMode) {
      setAdminUsers(prev => prev.map(u => (u.uid === uid ? { ...u, status } : u)));
      showToast(`User account status set to ${status}.`, 'success');
      return;
    }
    await AdminService.updateUserStatus(uid, status);
    setAdminUsers(prev => prev.map(u => (u.uid === uid ? { ...u, status } : u)));
    showToast(`User account status set to ${status}.`, 'success');
    await AdminService.recordAuditLog({
      actorId: userProfile?.uid || 'admin',
      actorEmail: userProfile?.email || 'admin',
      action: 'USER_STATUS_UPDATED',
      targetType: 'user',
      targetId: uid,
      metadata: { newStatus: status },
    });
  };

  const handleDeleteUser = async (uid: string) => {
    if (isDemoMode) {
      setAdminUsers(prev => prev.filter(u => u.uid !== uid));
      return;
    }
    await AdminService.deleteUser(uid);
    setAdminUsers(prev => prev.filter(u => u.uid !== uid));
    await AdminService.recordAuditLog({
      actorId: userProfile?.uid || 'admin',
      actorEmail: userProfile?.email || 'admin',
      action: 'USER_ACCOUNT_DELETED',
      targetType: 'user',
      targetId: uid,
    });
  };

  const handleSaveSystemSettings = async (newSettings: Partial<SystemSettings>) => {
    if (isDemoMode) {
      setSystemSettings(prev => ({ ...prev, ...newSettings }));
      return;
    }
    await AdminService.updateSystemSettings(newSettings, userProfile?.email || 'admin');
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
    await AdminService.recordAuditLog({
      actorId: userProfile?.uid || 'admin',
      actorEmail: userProfile?.email || 'admin',
      action: 'SYSTEM_SETTINGS_MODIFIED',
      targetType: 'system',
      metadata: newSettings,
    });
  };

  // If loading authentication initial state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500">
            Initializing Personal Finance Manager...
          </span>
        </div>
      </div>
    );
  }

  // If not logged in -> render Landing Page
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
        <LandingPage
          onOpenAuth={mode => {
            setAuthModalMode(mode);
            setAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
        />
        <ToastContainer />
      </div>
    );
  }

  // Active authenticated layout
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onOpenProfile={() => setCurrentTab('profile')}
        currentTab={currentTab}
        onNavigate={tab => setCurrentTab(tab)}
      />

      <div className="flex-1 flex w-full">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => setCurrentTab(tab)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenAddExpense={() => {
            setExpenseToEdit(null);
            setExpenseModalOpen(true);
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {dataLoading && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <div className="h-3.5 w-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>Synchronizing latest financial records with Firestore...</span>
            </div>
          )}

          {currentTab === 'overview' && (
            <UserDashboard
              expenses={expenses}
              budgets={budgets}
              goals={goals}
              onOpenAddExpense={() => {
                setExpenseToEdit(null);
                setExpenseModalOpen(true);
              }}
              onOpenAddBudget={() => {
                setBudgetToEdit(null);
                setBudgetModalOpen(true);
              }}
              onOpenAddGoal={() => {
                setGoalToEdit(null);
                setGoalModalOpen(true);
              }}
              onEditExpense={exp => {
                setExpenseToEdit(exp);
                setExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
              onNavigateTab={tab => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              categories={systemSettings.supportedCategories}
              onOpenAddExpense={() => {
                setExpenseToEdit(null);
                setExpenseModalOpen(true);
              }}
              onEditExpense={exp => {
                setExpenseToEdit(exp);
                setExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {currentTab === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              expenses={expenses}
              budgetWarningThreshold={systemSettings.budgetWarningThreshold}
              onOpenAddBudget={() => {
                setBudgetToEdit(null);
                setBudgetModalOpen(true);
              }}
              onEditBudget={b => {
                setBudgetToEdit(b);
                setBudgetModalOpen(true);
              }}
              onDeleteBudget={handleDeleteBudget}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsView
              goals={goals}
              contributions={contributions}
              onOpenAddGoal={() => {
                setGoalToEdit(null);
                setGoalModalOpen(true);
              }}
              onEditGoal={g => {
                setGoalToEdit(g);
                setGoalModalOpen(true);
              }}
              onDeleteGoal={handleDeleteGoal}
              onOpenContribute={g => {
                setGoalToContribute(g);
                setContributeModalOpen(true);
              }}
              onOpenHistory={g => {
                setGoalForHistory(g);
                setHistoryModalOpen(true);
              }}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView expenses={expenses} budgets={budgets} goals={goals} />
          )}

          {currentTab === 'rubric' && <RubricEvaluatorView />}

          {currentTab === 'profile' && <ProfileView />}

          {currentTab === 'admin' && isAdmin && (
            <AdminDashboard
              users={adminUsers}
              settings={systemSettings}
              auditLogs={auditLogs}
              onUpdateUserRole={handleUpdateUserRole}
              onUpdateUserStatus={handleUpdateUserStatus}
              onDeleteUser={handleDeleteUser}
              onSaveSettings={handleSaveSystemSettings}
              currentAdminEmail={userProfile.email}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ExpenseModal
        isOpen={expenseModalOpen}
        expenseToEdit={expenseToEdit}
        categories={systemSettings.supportedCategories}
        onClose={() => setExpenseModalOpen(false)}
        onSave={handleSaveExpense}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        budgetToEdit={budgetToEdit}
        categories={systemSettings.supportedCategories}
        onClose={() => setBudgetModalOpen(false)}
        onSave={handleSaveBudget}
      />

      <GoalModal
        isOpen={goalModalOpen}
        goalToEdit={goalToEdit}
        categories={systemSettings.supportedCategories}
        onClose={() => setGoalModalOpen(false)}
        onSave={handleSaveGoal}
      />

      <ContributeModal
        isOpen={contributeModalOpen}
        goal={goalToContribute}
        onClose={() => setContributeModalOpen(false)}
        onContribute={handleRecordContribution}
      />

      <GoalHistoryModal
        isOpen={historyModalOpen}
        goal={goalForHistory}
        contributions={
          goalForHistory ? contributions.filter(c => c.goalId === goalForHistory.id) : []
        }
        onClose={() => setHistoryModalOpen(false)}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        isDanger={true}
        onConfirm={deleteModal.onConfirm}
        onCancel={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
