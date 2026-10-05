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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
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

        setCurrentUser(profile);
      } else {
        // Not authenticated -> null. Must go through Login Gate!
        setCurrentUser(null);
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

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (authErr: any) {
        // If user document existed in allowlist but Auth user not created yet, auto-register
        if (
          authErr.code === 'auth/user-not-found' ||
          authErr.code === 'auth/invalid-credential' ||
          authErr.code === 'auth/invalid-login-credentials'
        ) {
          // If already marked as registered in DB, it could be a wrong credential attempt
          if (allowCheck.isRegistered) {
            recordFailedAttempt(nim);
            throw new Error('NIM atau kredensial tidak sesuai. Pastikan format NIM benar.');
          }
          // If not registered in allowlist, instruct to switch to register tab
          throw new Error('NIM belum diaktivasi. Silakan beralih ke tab "Daftar".');
        }
        throw authErr;
      }

      resetFailedAttempts(nim);
      const user = userCredential.user;
      const studentName = allowCheck.name || user.displayName || 'Ners Mahasiswa';

      const profile: UserProfile = {
        id: user.uid,
        email: user.email || email,
        displayName: studentName,
        nim,
        institution: 'Universitas Muhammadiyah Kalimantan Timur',
        role: nim === ADMIN_NIM ? 'admin' : 'student'
      };

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

    try {
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-in-use') {
          // Account already exists in Auth, sign in instead
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
          throw createErr;
        }
      }

      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: studentName });

      // Mark in allowlist as registered
      await markNimRegistered(nim);

      // Create / update user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const profileData: UserProfile = {
        id: user.uid,
        email,
        displayName: studentName,
        nim,
        institution: 'Universitas Muhammadiyah Kalimantan Timur',
        role: nim === ADMIN_NIM ? 'admin' : 'student'
      };

      await setDoc(userDocRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      resetFailedAttempts(nim);
      setCurrentUser(profileData);
      return profileData;
    } catch (err: any) {
      recordFailedAttempt(nim);
      throw err;
    }
  };

  const logout = async () => {
    try {
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
