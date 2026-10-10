import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
  updatePassword as updateFirebasePassword,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, validateFirestoreConnection, OperationType, handleFirestoreError } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isDemoMode: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoUser: (role?: UserRole) => void;
  logout: () => Promise<void>;
  updateUserProfile: (name: string, currency?: string) => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Bootstrapped admin email matching runtime environment
const BOOTSTRAP_ADMIN_EMAIL = 'prathambighnesh91@gmail.com';

const DEMO_USER_PROFILE: UserProfile = {
  uid: 'demo-user-101',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.in',
  role: 'user',
  status: 'active',
  currency: 'INR',
  createdAt: '2026-01-15T09:00:00.000Z',
  updatedAt: '2026-03-01T12:00:00.000Z',
  lastLogin: new Date().toISOString(),
};

const DEMO_ADMIN_PROFILE: UserProfile = {
  uid: 'demo-admin-999',
  name: 'Pratham Admin',
  email: 'admin@financecorp.in',
  role: 'admin',
  status: 'active',
  currency: 'INR',
  createdAt: '2025-11-01T08:00:00.000Z',
  updatedAt: '2026-03-01T10:00:00.000Z',
  lastLogin: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('pfm_is_demo') === 'true';
  });

  // Verify connection to Firestore on initial boot
  useEffect(() => {
    validateFirestoreConnection().catch(err => {
      console.warn('Initial Firestore validation:', err);
    });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (isDemoMode) {
      const savedRole = localStorage.getItem('pfm_demo_role') as UserRole || 'user';
      setUserProfile(savedRole === 'admin' ? DEMO_ADMIN_PROFILE : DEMO_USER_PROFILE);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);

          const isBootstrapAdmin = user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            const finalRole: UserRole = isBootstrapAdmin ? 'admin' : (data.role || 'user');

            const profile: UserProfile = {
              uid: user.uid,
              name: data.name || user.displayName || 'User',
              email: user.email || '',
              role: finalRole,
              status: data.status || 'active',
              currency: data.currency || 'INR',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };

            setUserProfile(profile);

            // Update lastLogin
            await updateDoc(userDocRef, {
              lastLogin: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...(isBootstrapAdmin ? { role: 'admin' } : {}),
            }).catch(() => {});

            // Also maintain in admins collection if bootstrap admin
            if (isBootstrapAdmin) {
              await setDoc(doc(db, 'admins', user.uid), {
                uid: user.uid,
                email: user.email,
                role: 'admin',
                addedAt: new Date().toISOString(),
              }, { merge: true }).catch(() => {});
            }
          } else {
            // New user registration profile creation
            const newRole: UserRole = isBootstrapAdmin ? 'admin' : 'user';
            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              role: newRole,
              status: 'active',
              currency: 'INR',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };

            await setDoc(userDocRef, newProfile);

            if (isBootstrapAdmin) {
              await setDoc(doc(db, 'admins', user.uid), {
                uid: user.uid,
                email: user.email,
                role: 'admin',
                addedAt: new Date().toISOString(),
              }, { merge: true }).catch(() => {});
            }

            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback minimal profile
          setUserProfile({
            uid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
            status: 'active',
            currency: 'INR',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsDemoMode(false);
    localStorage.removeItem('pfm_is_demo');
    localStorage.removeItem('pfm_demo_role');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    setIsDemoMode(false);
    localStorage.removeItem('pfm_is_demo');
    localStorage.removeItem('pfm_demo_role');
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateFirebaseProfile(cred.user, { displayName: name });
      const isBootstrapAdmin = email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
      const profile: UserProfile = {
        uid: cred.user.uid,
        name,
        email,
        role: isBootstrapAdmin ? 'admin' : 'user',
        status: 'active',
        currency: 'INR',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      if (isBootstrapAdmin) {
        await setDoc(doc(db, 'admins', cred.user.uid), {
          uid: cred.user.uid,
          email,
          role: 'admin',
          addedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => {});
      }
      setUserProfile(profile);
    }
  };

  const loginWithGoogle = async () => {
    setIsDemoMode(false);
    localStorage.removeItem('pfm_is_demo');
    localStorage.removeItem('pfm_demo_role');
    await signInWithPopup(auth, googleProvider);
  };

  const loginAsDemoUser = (role: UserRole = 'user') => {
    setIsDemoMode(true);
    localStorage.setItem('pfm_is_demo', 'true');
    localStorage.setItem('pfm_demo_role', role);
    setUserProfile(role === 'admin' ? DEMO_ADMIN_PROFILE : DEMO_USER_PROFILE);
    setCurrentUser(null);
  };

  const logout = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      localStorage.removeItem('pfm_is_demo');
      localStorage.removeItem('pfm_demo_role');
      setUserProfile(null);
    } else {
      await signOut(auth);
      setUserProfile(null);
    }
  };

  const updateUserProfile = async (name: string, currency: string = 'INR') => {
    if (isDemoMode) {
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          name,
          currency,
          updatedAt: new Date().toISOString(),
        });
      }
      return;
    }

    if (currentUser) {
      await updateFirebaseProfile(currentUser, { displayName: name });
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name,
        currency,
        updatedAt: new Date().toISOString(),
      });
      setUserProfile(prev => prev ? { ...prev, name, currency, updatedAt: new Date().toISOString() } : null);
    }
  };

  const changePassword = async (newPass: string) => {
    if (isDemoMode) {
      // Demo password change simulated
      return;
    }
    if (currentUser) {
      await updateFirebasePassword(currentUser, newPass);
    }
  };

  const isAdmin = userProfile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isDemoMode,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAsDemoUser,
        logout,
        updateUserProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
