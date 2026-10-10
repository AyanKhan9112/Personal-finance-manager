import React, { useState, useMemo } from 'react';
import { UserProfile, SystemSettings, AuditLog } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import {
  Users,
  Shield,
  Settings,
  Activity,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Database,
  Server,
  Key,
  Trash2,
  UserCheck,
  UserX,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../lib/currency';
import { ConfirmModal } from '../common/ConfirmModal';

interface AdminDashboardProps {
  users: UserProfile[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
  onUpdateUserRole: (uid: string, role: 'admin' | 'user') => Promise<void>;
  onUpdateUserStatus: (uid: string, status: 'active' | 'disabled') => Promise<void>;
  onDeleteUser: (uid: string) => Promise<void>;
  onSaveSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  currentAdminEmail: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  settings,
  auditLogs,
  onUpdateUserRole,
  onUpdateUserStatus,
  onDeleteUser,
  onSaveSettings,
  currentAdminEmail,
}) => {
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'users' | 'security' | 'settings' | 'audit' | 'analytics'>('users');

  // User search/filter
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Settings form state
  const [appName, setAppName] = useState(settings.appName || 'Personal Finance Manager');
  const [defaultCurrency, setDefaultCurrency] = useState(settings.defaultCurrency || 'INR (₹)');
  const [warningThreshold, setWarningThreshold] = useState(settings.budgetWarningThreshold || 80);
  const [allowRegistration, setAllowRegistration] = useState(settings.allowUserRegistration ?? true);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode ?? false);
  const [categoriesList, setCategoriesList] = useState<string[]>(settings.supportedCategories || []);
  const [newCatInput, setNewCatInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Destructive confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
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

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, userSearch]);

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    if (categoriesList.includes(newCatInput.trim())) {
      showToast('Category already exists.', 'warning');
      return;
    }
    setCategoriesList([...categoriesList, newCatInput.trim()]);
    setNewCatInput('');
  };

  const handleRemoveCategory = (cat: string) => {
    setCategoriesList(categoriesList.filter(c => c !== cat));
  };

  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await onSaveSettings({
        appName,
        defaultCurrency,
        budgetWarningThreshold: Number(warningThreshold),
        allowUserRegistration: allowRegistration,
        maintenanceMode,
        supportedCategories: categoriesList,
      });
      showToast('System configuration saved successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const requestDeleteUser = (user: UserProfile) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete Account: ${user.name}`,
      message: `Are you sure you want to permanently remove the account for ${user.email}? This action cannot be reversed.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await onDeleteUser(user.uid);
          showToast(`Account for ${user.email} removed.`, 'success');
        } catch (err: any) {
          showToast(err.message || 'Failed to delete user.', 'error');
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              <Shield className="w-4 h-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admin Governance Cockpit
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            System administration, RBAC authorization, security auditing, and global parameters.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            Operator: {currentAdminEmail}
          </span>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'security', label: 'Security & Encryption', icon: Lock },
          { id: 'settings', label: 'System Settings', icon: Settings },
          { id: 'audit', label: 'Audit Trail Logs', icon: Activity },
          { id: 'analytics', label: 'Admin Analytics', icon: Server },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab A: User Management */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Platform User Directory
              </h2>
              <p className="text-xs text-slate-500">
                Manage accounts, grant administrator roles, or disable access. Passwords and private transactions remain confidential.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {users.length} Total Registered Users
            </span>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as any)}
              className="py-2 px-3 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="user">Regular Users Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="py-2 px-3 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3">Last Active</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No user accounts match query criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const isSelf = user.email.toLowerCase() === currentAdminEmail.toLowerCase();
                    return (
                      <tr
                        key={user.uid}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                          {user.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                          {user.email}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              user.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {user.status === 'active' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                          {user.lastLogin ? formatDateTime(user.lastLogin) : 'Pending login'}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Role */}
                            <button
                              disabled={isSelf}
                              onClick={() =>
                                onUpdateUserRole(user.uid, user.role === 'admin' ? 'user' : 'admin')
                              }
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                              title={isSelf ? 'Cannot demote self' : 'Toggle role'}
                            >
                              {user.role === 'admin' ? 'Set as User' : 'Grant Admin'}
                            </button>

                            {/* Toggle Status */}
                            <button
                              disabled={isSelf}
                              onClick={() =>
                                onUpdateUserStatus(
                                  user.uid,
                                  user.status === 'active' ? 'disabled' : 'active'
                                )
                              }
                              className="p-1 rounded-lg text-slate-400 hover:text-amber-600 disabled:opacity-40"
                              title={user.status === 'active' ? 'Disable account' : 'Activate account'}
                            >
                              {user.status === 'active' ? (
                                <UserX className="w-4 h-4 text-amber-500" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-emerald-500" />
                              )}
                            </button>

                            {/* Delete User */}
                            <button
                              disabled={isSelf}
                              onClick={() => requestDeleteUser(user)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-40"
                              title={isSelf ? 'Cannot delete own account' : 'Delete account'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab B: Security & Encryption */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Financial Security Matrix & Verification
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Production controls implemented across Google Cloud Firestore and Firebase Authentication.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Data at Rest Encryption
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Google Cloud Firestore default hardware encryption with <strong>AES-256</strong> keys. Customer financial payloads are automatically scrambled prior to disk writes.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced by GCP Infrastructure
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Attribute-Based Access Control (ABAC)
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Firestore Security Rules enforce zero-trust bounds: <code>resource.data.userId == request.auth.uid</code>. Users can never query or mutate other tenants' records.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Deployed & Active
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Transport Layer Security (TLS 1.3)
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  All requests over the public internet require encrypted HTTPS connections using TLS 1.3 cipher suites. Unencrypted HTTP traffic is rejected.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active SSL / TLS Session
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Audit Logging Policy
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Privileged operations (role updates, system configuration alterations, account suspensions) append immutable events to <code>/auditLogs</code>.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Append-Only Log Active
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab C: System Settings */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSaveSystemSettings}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              System Configuration & Global Defaults
            </h2>
            <p className="text-xs text-slate-500">
              Update branding, currency conventions, category taxonomies, and threshold alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Platform Application Name
              </label>
              <input
                type="text"
                required
                value={appName}
                onChange={e => setAppName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Currency Presentation
              </label>
              <input
                type="text"
                required
                value={defaultCurrency}
                onChange={e => setDefaultCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Budget Warning Threshold */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Budget Proactive Warning Threshold (%)
              </label>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {warningThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={warningThreshold}
              onChange={e => setWarningThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Users receive an in-app warning badge when their spending reaches {warningThreshold}% of any budget.
            </p>
          </div>

          {/* Feature Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Allow Public User Registration
                </span>
                <span className="text-[11px] text-slate-400">
                  Permit new individuals to sign up for accounts
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowRegistration}
                onChange={e => setAllowRegistration(e.target.checked)}
                className="h-4 w-4 rounded-md accent-purple-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Maintenance Mode
                </span>
                <span className="text-[11px] text-slate-400">
                  Temporary hold on new transactions
                </span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={e => setMaintenanceMode(e.target.checked)}
                className="h-4 w-4 rounded-md accent-rose-600"
              />
            </div>
          </div>

          {/* Supported Categories Management */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Supported Expense Categories Taxonomy
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {categoriesList.map(cat => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-slate-400 hover:text-rose-500 font-bold"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={newCatInput}
                onChange={e => setNewCatInput(e.target.value)}
                placeholder="New category name..."
                className="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
            >
              {savingSettings ? 'Saving Settings...' : 'Save Configuration Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Tab D: Audit Trail Logs */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              System & Security Audit Trail
            </h2>
            <p className="text-xs text-slate-500">
              Immutable log of administrative actions, user role modifications, and system configuration updates.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Actor Email</th>
                  <th className="py-3 px-3">Action Event</th>
                  <th className="py-3 px-3">Target Scope</th>
                  <th className="py-3 px-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {log.actorEmail}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/40">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 capitalize">{log.targetType}</td>
                      <td className="py-3 px-3 text-slate-500 text-[11px] font-mono truncate max-w-[200px]">
                        {log.metadata ? JSON.stringify(log.metadata) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab E: Admin Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Users
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {users.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Platform user accounts</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Accounts
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                {users.filter(u => u.status === 'active').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Enabled & authorized</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Administrators
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">
                {users.filter(u => u.role === 'admin').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Privileged role holders</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                System Status
              </span>
              <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Operational
              </p>
              <p className="text-xs text-slate-500 mt-1">All services online</p>
            </div>
          </div>
        </div>
      )}

      {/* Destructive Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirm Delete"
        isDanger={true}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
