import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  ShieldCheck,
  Target,
  PieChart,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Smartphone,
  FileSpreadsheet,
  IndianRupee,
} from 'lucide-react';
import { formatINR } from '../../lib/currency';
import { AppLogo } from '../common/AppLogo';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { loginAsDemoUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 lg:px-12">
        <div className="flex items-center gap-2.5">
          <AppLogo size="md" />
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
            Personal Finance Manager
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            Get Started Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Modern Indian Households & Professionals</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Master your money with{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              clarity, control,
            </span>{' '}
            and confidence.
          </h1>

          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Track daily expenses in Indian Rupees (₹), set smart category budgets with 80% warning alerts, monitor savings goals, and visualize spending habits with instant financial analytics.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Evaluation Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => loginAsDemoUser('user')}
                className="flex-1 sm:flex-initial px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all flex items-center justify-center gap-2"
                title="Explore preloaded Regular User demo experience"
              >
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Try Demo User</span>
              </button>

              <button
                onClick={() => loginAsDemoUser('admin')}
                className="flex-1 sm:flex-initial px-4 py-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-sm font-semibold transition-all flex items-center justify-center gap-2"
                title="Inspect Admin Governance dashboard with User Management & Audit logs"
              >
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                <span>Try Demo Admin</span>
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real Firebase Firestore
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Role-Based Security Rules
            </span>
          </div>
        </div>

        {/* Hero Interactive Mockup Showcase */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xl shadow-slate-200/40 dark:shadow-slate-950/80">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-semibold text-slate-400">Personal Dashboard Preview</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
              Live INR Calculations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Monthly Spending</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatINR(59899)}
              </p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                63.1% of ₹95,000 monthly budget
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Remaining Budget</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatINR(35101)}
              </p>
              <span className="text-[11px] text-slate-500">Safely on track this month</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Total Savings toward Goals</span>
              <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">
                {formatINR(420000)}
              </p>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">3 active financial goals</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Core Capabilities
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Everything you need to master your personal wealth
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 w-fit mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Detailed Expense Tracking
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Log expenses across Food, Transportation, Housing, Utilities, and Shopping. Support for UPI, Credit Cards, and Net Banking with notes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 w-fit mb-4">
                <PieChart className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Smart Budget Utilization & Alerts
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Set category & overall monthly limits. Automatically receive visual notifications at 80% threshold and alerts when budget is exceeded.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 w-fit mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Milestone Savings Goals
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Save for an Emergency Fund, Tech Gear, or Vacations. Log contributions over time and see exact days and monthly savings needed.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 w-fit mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Interactive Analytics & CSV Export
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Examine category breakdown pie charts, monthly comparison trends, and download standard CSV reports for offline tax planning.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 w-fit mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Separate Admin Dashboard
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Dedicated administrative cockpit for user management, role assignment, system configurations, and security audit logs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 w-fit mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Zero-Trust Financial Privacy
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Protected by strict Firestore security rules. Your personal expenses are isolated to your authenticated account and private by design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Simple 3-Step Process
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            How Personal Finance Manager Works
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-extrabold text-lg shadow-md mb-4">
              1
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Create Your Account
            </h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Register securely via Email/Password or 1-Click Google Sign-In with instant profile configuration.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-extrabold text-lg shadow-md mb-4">
              2
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Define Budgets & Goals
            </h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Establish monthly spending caps and set target milestones like emergency reserves or big purchases.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-extrabold text-lg shadow-md mb-4">
              3
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Track & Gain Financial Clarity
            </h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Record transactions on the go, stay under budget with proactive warnings, and watch your net savings grow.
            </p>
          </div>
        </div>
      </section>

      {/* Security and Privacy Section */}
      <section className="py-16 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight">
            Bank-Grade Architecture & Data Privacy
          </h3>
          <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Your financial health is confidential. The application enforces server-side Attribute-Based Access Control (ABAC) in Google Cloud Firestore, encrypts data in-transit via TLS 1.3, and isolates user transactions.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-emerald-400 font-bold block">Encryption</span>
              <p className="text-sm font-semibold mt-1">AES-256 at Rest</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-emerald-400 font-bold block">Access Control</span>
              <p className="text-sm font-semibold mt-1">Firestore ABAC Rules</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-emerald-400 font-bold block">Audit Trail</span>
              <p className="text-sm font-semibold mt-1">Immutable Logs</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-emerald-400 font-bold block">Privacy</span>
              <p className="text-sm font-semibold mt-1">Isolated Vault</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <AppLogo size="sm" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Personal Finance Manager
            </span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onOpenAuth('login')} className="hover:text-emerald-600 transition-colors">
              User Login
            </button>
            <button onClick={() => loginAsDemoUser('admin')} className="hover:text-purple-600 transition-colors">
              Admin Console Demo
            </button>
            <button onClick={() => onOpenAuth('register')} className="hover:text-emerald-600 transition-colors">
              Register
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
