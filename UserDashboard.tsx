import React, { useState, useMemo } from 'react';
import { Expense, Budget, FinancialGoal, DateFilterOption } from '../../types';
import {
  TrendingUp,
  PiggyBank,
  Target,
  Percent,
  Calendar,
  Search,
  Filter,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Sparkles,
} from 'lucide-react';
import { formatINR, formatDate, getMonthRange } from '../../lib/currency';

interface UserDashboardProps {
  expenses: Expense[];
  budgets: Budget[];
  goals: FinancialGoal[];
  onOpenAddExpense: () => void;
  onOpenAddBudget: () => void;
  onOpenAddGoal: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  expenses,
  budgets,
  goals,
  onOpenAddExpense,
  onOpenAddBudget,
  onOpenAddGoal,
  onEditExpense,
  onDeleteExpense,
  onNavigateTab,
}) => {
  // Date filter state
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Table filter/sort/search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filtered expenses based on active date filter
  const currentMonthRange = useMemo(() => getMonthRange(), []);

  const filteredByDateExpenses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return expenses.filter(exp => {
      if (dateFilter === 'all') return true;

      if (dateFilter === 'today') {
        return exp.date === today;
      }

      if (dateFilter === 'week') {
        const expDate = new Date(exp.date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - expDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }

      if (dateFilter === 'month') {
        return exp.date >= currentMonthRange.start && exp.date <= currentMonthRange.end;
      }

      if (dateFilter === 'year') {
        const year = new Date().getFullYear();
        return exp.date.startsWith(String(year));
      }

      if (dateFilter === 'custom') {
        if (!customStart && !customEnd) return true;
        if (customStart && exp.date < customStart) return false;
        if (customEnd && exp.date > customEnd) return false;
        return true;
      }

      return true;
    });
  }, [expenses, dateFilter, customStart, customEnd, currentMonthRange]);

  // Overall monthly budget and calculations
  const overallBudget = useMemo(() => {
    const found = budgets.find(b => b.category === 'Overall');
    if (found) return found.amount;
    // Fallback: sum of all individual category budgets
    return budgets.reduce((acc, b) => acc + b.amount, 0) || 0;
  }, [budgets]);

  // Total expenses in the active filtered period
  const totalFilteredExpense = useMemo(() => {
    return filteredByDateExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredByDateExpenses]);

  // This month's expenses specifically for monthly budget comparison
  const thisMonthExpensesTotal = useMemo(() => {
    return expenses
      .filter(e => e.date >= currentMonthRange.start && e.date <= currentMonthRange.end)
      .reduce((sum, item) => sum + item.amount, 0);
  }, [expenses, currentMonthRange]);

  const remainingBudget = Math.max(0, overallBudget - thisMonthExpensesTotal);
  const budgetUtilization = overallBudget > 0
    ? Math.min(100, (thisMonthExpensesTotal / overallBudget) * 100)
    : 0;

  // Total savings toward financial goals
  const totalSavings = useMemo(() => {
    return goals.reduce((acc, g) => acc + g.currentAmount, 0);
  }, [goals]);

  const activeGoalsCount = useMemo(() => {
    return goals.filter(g => g.status === 'in_progress').length;
  }, [goals]);

  // Table filtering, sorting, pagination
  const processedTransactions = useMemo(() => {
    let result = [...filteredByDateExpenses];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.paymentMethod.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    result.sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return sortOrder === 'desc' ? diff : -diff;
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

    return result;
  }, [filteredByDateExpenses, searchQuery, selectedCategory, sortField, sortOrder]);

  const totalPages = Math.ceil(processedTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTransactions.slice(start, start + pageSize);
  }, [processedTransactions, currentPage]);

  const uniqueCategories = useMemo(() => {
    const set = new Set(expenses.map(e => e.category));
    return Array.from(set);
  }, [expenses]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time balance, budgets, and savings tracking in Indian Rupees (₹).
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 w-fit">
          {(['today', 'week', 'month', 'year', 'all', 'custom'] as DateFilterOption[]).map(opt => (
            <button
              key={opt}
              onClick={() => {
                setDateFilter(opt);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                dateFilter === opt
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt === 'all' ? 'All Time' : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range selector if custom filter active */}
      {dateFilter === 'custom' && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Custom Range:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>
      )}

      {/* 6 Summary Cards Grid (Mandatory Section 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Expenses This Month */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Expenses ({dateFilter === 'month' ? 'This Month' : dateFilter})
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatINR(totalFilteredExpense)}
            </span>
            <p className="mt-1 text-xs text-slate-500">
              {filteredByDateExpenses.length} transactions recorded
            </p>
          </div>
        </div>

        {/* Card 2: Total Monthly Budget */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Monthly Budget
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatINR(overallBudget)}
            </span>
            <p className="mt-1 text-xs text-slate-500">
              {budgets.length} budget limit plans configured
            </p>
          </div>
        </div>

        {/* Card 3: Remaining Budget */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Remaining Budget
            </span>
            <div
              className={`p-2 rounded-xl ${
                remainingBudget > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
              }`}
            >
              {remainingBudget > 0 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                remainingBudget > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatINR(remainingBudget)}
            </span>
            <p className="mt-1 text-xs text-slate-500">
              {remainingBudget > 0 ? 'Safe margin available' : 'Budget exceeded!'}
            </p>
          </div>
        </div>

        {/* Card 4: Total Savings toward Goals */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Goal Savings Accumulated
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">
              {formatINR(totalSavings)}
            </span>
            <p className="mt-1 text-xs text-slate-500">
              Across all financial targets
            </p>
          </div>
        </div>

        {/* Card 5: Number of Active Financial Goals */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Goals
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeGoalsCount}
            </span>
            <p className="mt-1 text-xs text-slate-500">
              {goals.length - activeGoalsCount} completed or archived
            </p>
          </div>
        </div>

        {/* Card 6: Budget Utilization Percentage */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Budget Utilization
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {budgetUtilization.toFixed(1)}%
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  budgetUtilization >= 100
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : budgetUtilization >= 80
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {budgetUtilization >= 100
                  ? 'Exceeded'
                  : budgetUtilization >= 80
                  ? 'Warning (>80%)'
                  : 'On Track'}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetUtilization >= 100
                    ? 'bg-rose-500'
                    : budgetUtilization >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetUtilization)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onOpenAddExpense}
          className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5" />
            <span>Add New Expense</span>
          </div>
          <ArrowUpRight className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenAddBudget}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <PiggyBank className="w-5 h-5 text-amber-500" />
            <span>Create Budget Limit</span>
          </div>
          <ArrowUpRight className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenAddGoal}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-teal-500" />
            <span>Set Financial Goal</span>
          </div>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Recent Transactions Section with Search, Sort, Filters & Pagination */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h2>
            <p className="text-xs text-slate-500">
              Showing {processedTransactions.length} transaction entries
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('expenses')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View Full Expenses Module</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, notes, or payment..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
              title="Toggle sort direction"
            >
              {sortOrder === 'desc' ? 'Desc ↓' : 'Asc ↑'}
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3">Transaction</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-3 text-right">Amount (₹)</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map(exp => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {exp.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 truncate max-w-[150px]">
                      {exp.notes || '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditExpense(exp)}
                          className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
