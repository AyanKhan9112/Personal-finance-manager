import React from 'react';
import { FinancialGoal, GoalContribution } from '../../types';
import { X, History, IndianRupee, Calendar } from 'lucide-react';
import { formatINR, formatDate } from '../../lib/currency';

interface GoalHistoryModalProps {
  isOpen: boolean;
  goal: FinancialGoal | null;
  contributions: GoalContribution[];
  onClose: () => void;
}

export const GoalHistoryModal: React.FC<GoalHistoryModalProps> = ({
  isOpen,
  goal,
  contributions,
  onClose,
}) => {
  if (!isOpen || !goal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Contribution History
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">{goal.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {contributions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No contributions recorded yet. Use the "Contribute" button to deposit savings!
            </div>
          ) : (
            contributions.map(c => (
              <div
                key={c.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {c.notes || 'Savings Deposit'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(c.date)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatINR(c.amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Total Saved: <strong className="text-slate-900 dark:text-white">{formatINR(goal.currentAmount)}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
