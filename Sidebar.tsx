import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  BarChart3,
  User,
  Shield,
  PlusCircle,
  X,
  CreditCard,
  IndianRupee,
  Award,
} from 'lucide-react';
import { AppLogo } from '../common/AppLogo';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenAddExpense: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  onOpenAddExpense,
}) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'rubric', label: 'Rubric Evaluator', icon: Award },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-40 flex h-full md:h-[calc(100vh-4rem)] w-64 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-5 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Mobile top close bar */}
          <div className="flex items-center justify-between md:hidden pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AppLogo size="sm" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Personal Finance
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => {
              onOpenAddExpense();
              onClose();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          {/* Main navigation list */}
          <nav className="flex flex-col space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1">
              Personal Finance
            </span>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin section */}
            {isAdmin && (
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 px-3 mb-1 block">
                  Admin System
                </span>
                <button
                  onClick={() => {
                    onSelectTab('admin');
                    onClose();
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium w-full transition-colors ${
                    currentTab === 'admin'
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 hover:text-purple-700 dark:hover:text-purple-300'
                  }`}
                >
                  <Shield
                    className={`w-4 h-4 ${
                      currentTab === 'admin'
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-purple-400'
                    }`}
                  />
                  <span>Admin Dashboard</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom card: Indian Rupee Currency status */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                INR Currency
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Amounts formatted in standard Indian Lakhs & Crores (₹).
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
