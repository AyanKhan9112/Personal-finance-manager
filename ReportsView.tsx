import React, { useState, useMemo } from 'react';
import { Expense, Budget, FinancialGoal } from '../../types';
import {
  Download,
  Calendar,
  FileSpreadsheet,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Award,
  ArrowUpRight,
  IndianRupee,
} from 'lucide-react';
import { formatINR, formatDate } from '../../lib/currency';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

interface ReportsViewProps {
  expenses: Expense[];
  budgets: Budget[];
  goals: FinancialGoal[];
}

const PALETTE = [
  '#10B981',
  '#3B82F6',
  '#F59E0B',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#F97316',
  '#6366F1',
  '#EF4444',
  '#64748B',
];

export const ReportsView: React.FC<ReportsViewProps> = ({ expenses, budgets, goals }) => {
  const [reportPeriod, setReportPeriod] = useState<'month' | 'year' | 'all'>('month');

  const selectedYear = new Date().getFullYear();

  // Filtered dataset
  const currentExpenses = useMemo(() => {
    if (reportPeriod === 'all') return expenses;
    if (reportPeriod === 'year') {
      return expenses.filter(e => e.date.startsWith(String(selectedYear)));
    }
    // 'month'
    const curMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
    return expenses.filter(e => e.date.startsWith(curMonthStr));
  }, [expenses, reportPeriod, selectedYear]);

  // Total expenses
  const totalSpend = useMemo(() => {
    return currentExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [currentExpenses]);

  // Category Distribution
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    currentExpenses.forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [currentExpenses]);

  // Month-over-month trend data for current year
  const monthlyTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const buckets = months.map(m => ({ month: m, amount: 0 }));

    expenses.forEach(e => {
      if (e.date.startsWith(String(selectedYear))) {
        const parts = e.date.split('-');
        if (parts.length >= 2) {
          const mIndex = parseInt(parts[1], 10) - 1;
          if (mIndex >= 0 && mIndex < 12) {
            buckets[mIndex].amount += e.amount;
          }
        }
      }
    });

    return buckets;
  }, [expenses, selectedYear]);

  // Budget vs Actual comparison
  const budgetVsActualData = useMemo(() => {
    return budgets.map(b => {
      const eligible = expenses.filter(
        e =>
          e.date >= b.startDate &&
          e.date <= b.endDate &&
          (b.category === 'Overall' || e.category === b.category)
      );
      const spent = eligible.reduce((acc, x) => acc + x.amount, 0);

      return {
        name: b.name.length > 14 ? b.name.substring(0, 14) + '...' : b.name,
        Budget: b.amount,
        Actual: spent,
      };
    });
  }, [budgets, expenses]);

  // CSV Report Generator
  const handleDownloadCSV = () => {
    const headers = ['ID', 'Date', 'Title', 'Category', 'Payment Method', 'Amount (INR)', 'Notes'];
    const rows = currentExpenses.map(e => [
      e.id,
      e.date,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.paymentMethod}"`,
      e.amount.toFixed(2),
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pfm_financial_report_${reportPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reports & Financial Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual breakdown of monthly trends, category shares, and budget variances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            {(['month', 'year', 'all'] as const).map(p => (
              <button
                key={p}
                onClick={() => setReportPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  reportPeriod === p
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {p === 'month' ? 'This Month' : p === 'year' ? 'This Year' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Download CSV button */}
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
            title="Download RFC4180 CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Analyzed Spend
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatINR(totalSpend)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{currentExpenses.length} records processed</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Primary Cost Driver
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 truncate">
            {categoryData[0]?.name || 'N/A'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {categoryData[0] ? `${formatINR(categoryData[0].value)} (${((categoryData[0].value / Math.max(1, totalSpend)) * 100).toFixed(1)}%)` : '₹0.00'}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Savings Goals Progress
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-2">
            {goals.filter(g => g.status === 'completed').length} / {goals.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Goals successfully achieved</p>
        </div>
      </div>

      {/* Row 1: Month-over-Month Expense Comparison & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Trend Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            Month-over-Month Spending Trend ({selectedYear})
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis tickFormatter={val => `₹${val / 1000}k`} fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), 'Spent']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="amount" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-teal-500" />
            Category-Wise Spending Analysis
          </h3>
          <div className="h-72 w-full">
            {categoryData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No expense data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Budget vs Actual Comparison */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          Budget vs. Actual Spending Comparison
        </h3>
        <div className="h-72 w-full">
          {budgetVsActualData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              No budgets configured yet to generate comparison
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis tickFormatter={val => `₹${val / 1000}k`} fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Budget" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Actual" fill="#EC4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 3: Highest-Spending Categories Leaderboard */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Top Spending Categories Leaderboard
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categoryData.slice(0, 4).map((c, idx) => (
            <div
              key={c.name}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Rank #{idx + 1}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {((c.value / Math.max(1, totalSpend)) * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                {c.name}
              </p>
              <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-2">
                {formatINR(c.value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
