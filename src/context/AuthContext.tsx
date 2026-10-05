/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { UserProfile } from '../types/askep';
import {
  sanitizeNim,
  getNimEmail,
  getNimUid,
  getNimPassword,
  checkNimInAllowlist,
  markNimRegistered,
  seedAllowedNimsIfEmpty,
  checkRateLimit,
  recordFailedAttempt,
  resetFailedAttempts,
  ADMIN_NIM
} from '../services/nimAuth';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithNim: (nim: string, pin?: string) => Promise<UserProfile>;
  registerWithNim: (nim: string, pin?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isNetworkOrConfigError = (err: any): boolean => {
  const code = err?.code || '';
  const msg = err?.message || '';
  return (
    code === 'auth/network-request-failed' ||
    code === 'auth/operation-not-allowed' ||
    code === 'auth/internal-error' ||
    code === 'auth/configuration-not-found' ||
    msg.includes('network-request-failed') ||
    msg.includes('OPERATION_NOT_ALLOWED') ||
    msg.includes('PASSWORD_LOGIN_DISABLED')
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('askep_active_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and seed allowlist on boot
  useEffect(() => {
    seedAllowedNimsIfEmpty().catch(err => {
      console.warn('Allowlist initialization note:', err);
    });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        let nim = '';
        let displayName = user.displayName || 'Ners Mahasiswa';
        let institution = 'Universitas Muhammadiyah Kalimantan Timur';

        if (user.email && user.email.endsWith('@askep.local')) {
          nim = user.email.replace('@askep.local', '');
        }

        // Fetch name from allowed_nims or users collection
        if (nim) {
          try {
            const nimCheck = await checkNimInAllowlist(nim);
            if (nimCheck.name) {
              displayName = nimCheck.name;
            }
          } catch (e) {
            // fallback
          }
        }

        const profile: UserProfile = {
          id: user.uid,
          email: user.email || `${nim}@askep.local`,
          displayName,
          nim,
          institution,
          role: nim === ADMIN_NIM ? 'admin' : 'student'
        };

        localStorage.setItem('askep_active_session', JSON.stringify(profile));
        setCurrentUser(profile);
      } else {
        // If no Firebase Auth user, keep local saved session if present, otherwise null
        try {
          const saved = localStorage.getItem('askep_active_session');
          if (saved) {
            setCurrentUser(JSON.parse(saved));
          } else {
            setCurrentUser(null);
          }
        } catch {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithNim = async (rawNim: string, pin?: string): Promise<UserProfile> => {
    const nim = sanitizeNim(rawNim);
    if (!nim) throw new Error('Silakan masukkan NIM Anda.');

    // 1. Check Rate Limit
    const rate = checkRateLimit(nim);
    if (!rate.allowed) {
      throw new Error(`Terlalu banyak percobaan gagal. Silakan tunggu ${rate.waitSeconds} detik.`);
    }

    // 2. Check Allowlist
    const allowCheck = await checkNimInAllowlist(nim);
    if (!allowCheck.isAllowed) {
      recordFailedAttempt(nim);
      throw new Error('NIM belum terdaftar di daftar pengguna. Hubungi admin.');
    }

    const email = getNimEmail(nim);
    const password = getNimPassword(nim, pin);
    const studentName = allowCheck.name || 'Ners Mahasiswa';
    const stableUid = getNimUid(nim);

    try {
      let resolvedUid = stableUid;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        resolvedUid = userCredential.user.uid;
      } catch (authErr: any) {
        if (isNetworkOrConfigError(authErr)) {
          // Firebase Auth network request failed or password provider disabled on cloud
          console.warn('Firebase Auth network/config notice, applying deterministic NIM identity:', authErr.message);
          resolvedUid = stableUid;
        } else if (
          authErr.code === 'auth/user-not-found' ||
          authErr.code === 'auth/invalid-credential' ||
          authErr.code === 'auth/invalid-login-credentials'
        ) {
          if (allowCheck.isRegistered) {
            recordFailedAttempt(nim);
            throw new Error('NIM atau kredensial tidak sesuai. Pastikan format NIM benar.');
          }
          throw new Error('NIM belum diaktivasi. Silakan beralih ke tab "Daftar".');
        } else {
          throw authErr;
        }
      }

      resetFailedAttempts(nim);

      const profile: UserProfile = {
        id: resolvedUid,
        email,
        displayName: studentName,
        nim,
        institution: 'Universitas Muhammadiyah Kalimantan Timur',
        role: nim === ADMIN_NIM ? 'admin' : 'student'
      };

      localStorage.setItem('askep_active_session', JSON.stringify(profile));
      setCurrentUser(profile);
      return profile;
    } catch (err: any) {
      recordFailedAttempt(nim);
      throw err;
    }
  };

  const registerWithNim = async (rawNim: string, pin?: string): Promise<UserProfile> => {
    const nim = sanitizeNim(rawNim);
    if (!nim) throw new Error('Silakan masukkan NIM Anda.');

    // 1. Check Rate Limit
    const rate = checkRateLimit(nim);
    if (!rate.allowed) {
      throw new Error(`Terlalu banyak percobaan gagal. Silakan tunggu ${rate.waitSeconds} detik.`);
    }

    // 2. Check Allowlist
    const allowCheck = await checkNimInAllowlist(nim);
    if (!allowCheck.isAllowed) {
      recordFailedAttempt(nim);
      throw new Error('NIM belum terdaftar di daftar pengguna. Hubungi admin.');
    }

    if (allowCheck.isRegistered) {
      throw new Error('NIM sudah terdaftar, silakan Masuk.');
    }

    const email = getNimEmail(nim);
    const password = getNimPassword(nim, pin);
    const studentName = allowCheck.name || 'Ners Mahasiswa';
    const stableUid = getNimUid(nim);

    try {
      let resolvedUid = stableUid;

      try {
        let userCredential;
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
          } else {
            throw createErr;
          }
        }
        resolvedUid = userCredential.user.uid;
        await updateProfile(userCredential.user, { displayName: studentName }).catch(() => {});
      } catch (authErr: any) {
        if (isNetworkOrConfigError(authErr)) {
          console.warn('Firebase Auth network/config notice during register, applying deterministic NIM identity:', authErr.message);
          resolvedUid = stableUid;
        } else {
          throw authErr;
        }
      }

      // Mark in allowlist as registered (both DB and local fallback)
      await markNimRegistered(nim);

      const profileData: UserProfile = {
        id: resolvedUid,
        email,
        displayName: studentName,
        nim,
        institution: 'Universitas Muhammadiyah Kalimantan Timur',
        role: nim === ADMIN_NIM ? 'admin' : 'student'
      };

      // Try background sync to users doc in Firestore
      try {
        const userDocRef = doc(db, 'users', resolvedUid);
        await setDoc(userDocRef, {
          ...profileData,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Background user doc save notice:', e);
      }

      resetFailedAttempts(nim);
      localStorage.setItem('askep_active_session', JSON.stringify(profileData));
      setCurrentUser(profileData);
      return profileData;
    } catch (err: any) {
      recordFailedAttempt(nim);
      throw err;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('askep_active_session');
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.nim === ADMIN_NIM;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAdmin,
        loginWithNim,
        registerWithNim,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
