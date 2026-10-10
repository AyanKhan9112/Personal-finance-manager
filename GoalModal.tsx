import React, { useState, useEffect } from 'react';
import { FinancialGoal, GoalStatus } from '../../types';
import { X, Target, Calendar, Tag, IndianRupee } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  goalToEdit?: FinancialGoal | null;
  categories: string[];
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    category: string;
    status: GoalStatus;
  }) => Promise<void>;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  goalToEdit,
  categories,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Savings');
  const [status, setStatus] = useState<GoalStatus>('in_progress');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setTargetAmount(String(goalToEdit.targetAmount));
      setCurrentAmount(String(goalToEdit.currentAmount));
      setDeadline(goalToEdit.deadline);
      setCategory(goalToEdit.category);
      setStatus(goalToEdit.status);
    } else {
      setTitle('');
      setDescription('');
      setTargetAmount('');
      setCurrentAmount('0');
      // Default deadline: 6 months in future
      const sixMonths = new Date();
      sixMonths.setMonth(sixMonths.getMonth() + 6);
      setDeadline(sixMonths.toISOString().split('T')[0]);
      setCategory('Emergency Fund');
      setStatus('in_progress');
    }
    setError(null);
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedTarget = parseFloat(targetAmount);
    const parsedCurrent = parseFloat(currentAmount) || 0;

    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Target amount must be greater than zero.');
      return;
    }
    if (parsedCurrent < 0) {
      setError('Initial saved amount cannot be negative.');
      return;
    }
    if (!title.trim()) {
      setError('Goal name is required.');
      return;
    }
    if (!deadline) {
      setError('Target deadline date is required.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        deadline,
        category,
        status: parsedCurrent >= parsedTarget ? 'completed' : status,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save financial goal.');
    } finally {
      setLoading(false);
    }
  };

  const goalCategoryPresets = [
    'Emergency Fund',
    'Electronics & Gadgets',
    'Travel & Vacation',
    'Vehicle / Car / Bike',
    'Higher Education',
    'Home Renovation',
    'Investments & Retirement',
    'Other',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {goalToEdit ? 'Edit Financial Goal' : 'Create Financial Goal'}
              </h3>
              <p className="text-xs text-slate-500">Plan and conquer major life milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Goal Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Emergency Fund, Buy MacBook Pro, Europe Vacation"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Amount (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  placeholder="200000"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {goalToEdit ? 'Current Amount (₹)' : 'Initial Saved Amount (₹)'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={currentAmount}
                  onChange={e => setCurrentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Deadline *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Goal Category *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {goalCategoryPresets.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {goalToEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Goal Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as GoalStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed / Achieved</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description or Purpose (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Why this goal matters, specific model/destination details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Saving...' : goalToEdit ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
