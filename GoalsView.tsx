import React, { useState, useMemo } from 'react';
import { FinancialGoal, GoalContribution } from '../../types';
import {
  PlusCircle,
  Target,
  Sparkles,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  History,
  TrendingUp,
  Clock,
  IndianRupee,
  Coins,
} from 'lucide-react';
import { formatINR, formatDate } from '../../lib/currency';

interface GoalsViewProps {
  goals: FinancialGoal[];
  contributions: GoalContribution[];
  onOpenAddGoal: () => void;
  onEditGoal: (goal: FinancialGoal) => void;
  onDeleteGoal: (id: string) => void;
  onOpenContribute: (goal: FinancialGoal) => void;
  onOpenHistory: (goal: FinancialGoal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  contributions,
  onOpenAddGoal,
  onEditGoal,
  onDeleteGoal,
  onOpenContribute,
  onOpenHistory,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed'>('all');

  const filteredGoals = useMemo(() => {
    if (filterStatus === 'all') return goals;
    return goals.filter(g => g.status === filterStatus);
  }, [goals, filterStatus]);

  // Overall goal stats
  const totalTargetAmount = useMemo(() => {
    return goals.reduce((acc, g) => acc + g.targetAmount, 0);
  }, [goals]);

  const totalSavedAmount = useMemo(() => {
    return goals.reduce((acc, g) => acc + g.currentAmount, 0);
  }, [goals]);

  const completedCount = useMemo(() => {
    return goals.filter(g => g.status === 'completed' || g.currentAmount >= g.targetAmount).length;
  }, [goals]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build wealth towards life milestones with disciplined monthly savings in INR (₹).
          </p>
        </div>

        <button
          onClick={onOpenAddGoal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Financial Goal</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Target Capital
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatINR(totalTargetAmount)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{goals.length} target goals planned</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Savings Accumulated
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-2">
            {formatINR(totalSavedAmount)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {totalTargetAmount > 0
              ? `${((totalSavedAmount / totalTargetAmount) * 100).toFixed(1)}% of total targets`
              : '0%'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Goals Achieved
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {completedCount} of {goals.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Milestones fully reached</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          {(['all', 'in_progress', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                filterStatus === tab
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab === 'all' ? 'All Goals' : tab === 'in_progress' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No goals found in this view
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Create goals like "Emergency Fund", "New Vehicle", or "Higher Education" to track your progress!
          </p>
          <button
            onClick={onOpenAddGoal}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs shadow-md"
          >
            Add Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map(goal => {
            const isCompleted = goal.status === 'completed' || goal.currentAmount >= goal.targetAmount;
            const progress = goal.targetAmount > 0
              ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
              : 0;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            // Calculate days remaining & estimated monthly savings needed
            const now = new Date();
            const targetDate = new Date(goal.deadline);
            const diffTime = targetDate.getTime() - now.getTime();
            const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
            const monthlySavingsNeeded = remaining > 0 ? remaining / monthsRemaining : 0;

            const goalContribsCount = contributions.filter(c => c.goalId === goal.id).length;

            return (
              <div
                key={goal.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-900/40">
                        {goal.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditGoal(goal)}
                        className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Edit goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Saved vs Target amount */}
                  <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Current Saved</span>
                      <strong className="text-base font-extrabold text-teal-600 dark:text-teal-400">
                        {formatINR(goal.currentAmount)}
                      </strong>
                    </div>
                    <div className="flex items-baseline justify-between mt-1 text-xs">
                      <span className="text-slate-400">Target Ceiling</span>
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">
                        {formatINR(goal.targetAmount)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-teal-600 dark:text-teal-400">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-teal-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculations breakdown */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Remaining Amount:
                      </span>
                      <strong className="text-slate-900 dark:text-white font-semibold">
                        {formatINR(remaining)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Target Deadline:
                      </span>
                      <span>
                        {formatDate(goal.deadline)} ({daysRemaining} days left)
                      </span>
                    </div>

                    {!isCompleted && remaining > 0 && (
                      <div className="flex items-center justify-between pt-1 text-[11px] text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 p-2 rounded-xl">
                        <span>Monthly savings needed:</span>
                        <strong className="font-bold">{formatINR(monthlySavingsNeeded, false)}/mo</strong>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Goal Achieved! Congratulations!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: Contribute & View History */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => onOpenContribute(goal)}
                    disabled={isCompleted}
                    className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Contribute</span>
                  </button>

                  <button
                    onClick={() => onOpenHistory(goal)}
                    className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    title="View contribution history"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{goalContribsCount} Deposits</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
