import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  addDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, SystemSettings, AuditLog } from '../types';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  settingsId: 'global',
  appName: 'Personal Finance Manager',
  defaultCurrency: 'INR (₹)',
  budgetWarningThreshold: 80,
  allowUserRegistration: true,
  maintenanceMode: false,
  supportedCategories: [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Education',
    'Rent & Housing',
    'Bills & Utilities',
    'Healthcare',
    'Entertainment',
    'Travel',
    'Other',
  ],
  updatedBy: 'System Administrator',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_DEMO_USERS: UserProfile[] = [
  {
    uid: 'demo-admin-999',
    name: 'Pratham Admin',
    email: 'admin@financecorp.in',
    role: 'admin',
    status: 'active',
    currency: 'INR',
    createdAt: '2025-11-01T08:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
    lastLogin: '2026-03-09T08:30:00.000Z',
  },
  {
    uid: 'demo-user-101',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.in',
    role: 'user',
    status: 'active',
    currency: 'INR',
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-03-01T12:00:00.000Z',
    lastLogin: '2026-03-09T08:15:00.000Z',
  },
  {
    uid: 'demo-user-102',
    name: 'Priya Patel',
    email: 'priya.patel@techfin.in',
    role: 'user',
    status: 'active',
    currency: 'INR',
    createdAt: '2026-02-01T14:20:00.000Z',
    updatedAt: '2026-02-28T16:00:00.000Z',
    lastLogin: '2026-03-08T19:40:00.000Z',
  },
  {
    uid: 'demo-user-103',
    name: 'Amit Verma',
    email: 'amit.verma@consulting.org',
    role: 'user',
    status: 'disabled',
    currency: 'INR',
    createdAt: '2026-01-22T10:15:00.000Z',
    updatedAt: '2026-02-15T11:00:00.000Z',
    lastLogin: '2026-02-14T10:00:00.000Z',
  },
  {
    uid: 'demo-user-104',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@startup.io',
    role: 'user',
    status: 'active',
    currency: 'INR',
    createdAt: '2026-02-18T11:45:00.000Z',
    updatedAt: '2026-03-05T09:20:00.000Z',
    lastLogin: '2026-03-07T14:10:00.000Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    actorId: 'demo-admin-999',
    actorEmail: 'admin@financecorp.in',
    action: 'POLICY_AUDIT_CHECK',
    targetType: 'security',
    timestamp: '2026-03-09T07:00:00.000Z',
    metadata: { check: 'ABAC Rules & Encryption at Rest Verified' },
  },
  {
    id: 'log-2',
    actorId: 'demo-admin-999',
    actorEmail: 'admin@financecorp.in',
    action: 'USER_STATUS_DISABLED',
    targetType: 'user',
    targetId: 'demo-user-103',
    timestamp: '2026-02-15T11:00:00.000Z',
    metadata: { reason: 'Inactivity policy triggered' },
  },
  {
    id: 'log-3',
    actorId: 'system',
    actorEmail: 'system@internal',
    action: 'SETTINGS_INITIALIZED',
    targetType: 'system',
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: { threshold: 80, currency: 'INR' },
  },
];

export class AdminService {
  // Users
  static async getAllUsers(): Promise<UserProfile[]> {
    const path = 'users';
    try {
      const snapshot = await getDocs(collection(db, path));
      const users: UserProfile[] = [];
      snapshot.forEach(docSnap => {
        users.push({ uid: docSnap.id, ...(docSnap.data() as Omit<UserProfile, 'uid'>) });
      });
      return users;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  static async updateUserRole(uid: string, role: 'admin' | 'user'): Promise<void> {
    const path = `users/${uid}`;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        role,
        updatedAt: new Date().toISOString(),
      });

      // Update admin whitelist document accordingly
      const adminRef = doc(db, 'admins', uid);
      if (role === 'admin') {
        await setDoc(adminRef, {
          uid,
          role: 'admin',
          addedAt: new Date().toISOString(),
        }, { merge: true });
      } else {
        await deleteDoc(adminRef).catch(() => {});
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static async updateUserStatus(uid: string, status: 'active' | 'disabled'): Promise<void> {
    const path = `users/${uid}`;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  static async deleteUser(uid: string): Promise<void> {
    const path = `users/${uid}`;
    try {
      await deleteDoc(doc(db, 'users', uid));
      await deleteDoc(doc(db, 'admins', uid)).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  // System Settings
  static async getSystemSettings(): Promise<SystemSettings> {
    const path = 'systemSettings/global';
    try {
      const snapshot = await getDocs(collection(db, 'systemSettings'));
      let found: SystemSettings | null = null;
      snapshot.forEach(docSnap => {
        if (docSnap.id === 'global') {
          found = docSnap.data() as SystemSettings;
        }
      });
      return found || DEFAULT_SYSTEM_SETTINGS;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  static async updateSystemSettings(settings: Partial<SystemSettings>, actorEmail: string): Promise<void> {
    const path = 'systemSettings/global';
    try {
      const ref = doc(db, 'systemSettings', 'global');
      const payload = {
        ...DEFAULT_SYSTEM_SETTINGS,
        ...settings,
        updatedBy: actorEmail,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(ref, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  // Audit Logs
  static async getAuditLogs(): Promise<AuditLog[]> {
    const path = 'auditLogs';
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const logs: AuditLog[] = [];
      snapshot.forEach(docSnap => {
        logs.push({ id: docSnap.id, ...(docSnap.data() as Omit<AuditLog, 'id'>) });
      });
      return logs;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  static async recordAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const path = 'auditLogs';
    try {
      await addDoc(collection(db, path), {
        ...log,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Non-blocking log recording
      console.warn('Failed to persist audit log to Firestore:', error);
    }
  }
}
