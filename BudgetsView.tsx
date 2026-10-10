import React, { useMemo } from 'react';
import { Budget, Expense } from '../../types';
import {
  PlusCircle,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Trash2,
  Edit2,
  Calendar,
  IndianRupee,
  ShieldAlert,
} from 'lucide-react';
import { formatINR, formatDate } from '../../lib/currency';

interface BudgetsViewProps {
  budgets: Budget[];
  expenses: Expense[];
  onOpenAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  budgetWarningThreshold?: number; // e.g. 80
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  expenses,
  onOpenAddBudget,
  onEditBudget,
  onDeleteBudget,
  budgetWarningThreshold = 80,
}) => {
  // Compute spent amount for each budget based on date range and category scope
  const budgetAnalytics = useMemo(() => {
    return budgets.map(budget => {
      // Find all expenses occurring within the budget's start and end date
      const eligibleExpenses = expenses.filter(exp => {
        const inDateRange = exp.date >= budget.startDate && exp.date <= budget.endDate;
        if (!inDateRange) return false;

        // If category is 'Overall', all expenses within dates apply
        if (budget.category === 'Overall') return true;

        // Otherwise only exact matching category
        return exp.category === budget.category;
      });

      const spent = eligibleExpenses.reduce((sum, e) => sum + e.amount, 0);
      const remaining = budget.amount - spent;
      const utilization = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const isExceeded = spent >= budget.amount;
      const isWarning = !isExceeded && utilization >= budgetWarningThreshold;

      return {
        ...budget,
        spent,
        remaining,
        utilization,
        isExceeded,
        isWarning,
        transactionsCount: eligibleExpenses.length,
      };
    });
  }, [budgets, expenses, budgetWarningThreshold]);

  // Total allocated vs total spent in overall scopes
  const totalBudgeted = useMemo(() => {
    const overall = budgets.find(b => b.category === 'Overall');
    if (overall) return overall.amount;
    return budgets.reduce((acc, b) => acc + b.amount, 0);
  }, [budgets]);

  const totalSpentOverall = useMemo(() => {
    const overall = budgetAnalytics.find(b => b.category === 'Overall');
    if (overall) return overall.spent;
    // Fallback: sum of category budgets spent without double counting
    return budgetAnalytics.reduce((acc, b) => acc + b.spent, 0);
  }, [budgetAnalytics]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Budget Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enforce spending limits and proactive threshold warnings ({budgetWarningThreshold}%).
          </p>
        </div>

        <button
          onClick={onOpenAddBudget}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Top Banner Alert if any budget is exceeded or in warning */}
      {budgetAnalytics.some(b => b.isExceeded) && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Budget Limit Exceeded!
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              One or more budgets have crossed 100% of their allocated allowance. Please inspect spending or adjust limit caps.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Budget Allocation
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatINR(totalBudgeted)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{budgets.length} active budget scopes</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Spent against Budgets
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatINR(totalSpentOverall)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Calculated from eligible transactions</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Remaining Available
          </span>
          <p
            className={`text-2xl sm:text-3xl font-extrabold mt-2 ${
              totalBudgeted - totalSpentOverall >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatINR(Math.max(0, totalBudgeted - totalSpentOverall))}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {totalBudgeted - totalSpentOverall >= 0 ? 'Surplus balance' : 'Deficit'}
          </p>
        </div>
      </div>

      {/* Budgets Grid Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Active Budget Plans & Category Caps
        </h2>

        {budgetAnalytics.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <PiggyBank className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No budgets defined yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Set an overall monthly cap or category-wise budget (like Food, Fuel, or Shopping) to stay on track.
            </p>
            <button
              onClick={onOpenAddBudget}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md"
            >
              Create Your First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetAnalytics.map(b => (
              <div
                key={b.id}
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-xs ${
                  b.isExceeded
                    ? 'border-rose-300 dark:border-rose-800/80 shadow-rose-500/5'
                    : b.isWarning
                    ? 'border-amber-300 dark:border-amber-800/80 shadow-amber-500/5'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {b.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {b.category}
                      </span>
                    </div>
                    {b.description && (
                      <p className="text-xs text-slate-500 mt-1">{b.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditBudget(b)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg"
                      title="Edit Budget"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteBudget(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Numerical stats */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Spent: </span>
                      <strong className="text-slate-900 dark:text-white font-bold text-sm">
                        {formatINR(b.spent)}
                      </strong>
                      <span className="text-slate-400"> of {formatINR(b.amount)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold">
                      <span
                        className={
                          b.isExceeded
                            ? 'text-rose-600 dark:text-rose-400'
                            : b.isWarning
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }
                      >
                        {b.utilization.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar container */}
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        b.isExceeded
                          ? 'bg-rose-500'
                          : b.isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.utilization)}%` }}
                    />
                  </div>

                  {/* Remaining & Warning Status Badge */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-slate-500">
                      Remaining:{' '}
                      <strong
                        className={
                          b.remaining >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {formatINR(b.remaining)}
                      </strong>
                    </span>

                    {b.isExceeded ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                        <AlertOctagon className="w-3.5 h-3.5" /> Exceeded!
                      </span>
                    ) : b.isWarning ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5" /> Warning ({`>${budgetWarningThreshold}%`})
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> On Track
                      </span>
                    )}
                  </div>
                </div>

                {/* Date range footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(b.startDate)} - {formatDate(b.endDate)}
                  </span>
                  <span>{b.transactionsCount} transactions counted</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
