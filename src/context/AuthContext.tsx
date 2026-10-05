/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { UserProfile } from '../types/askep';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithDemoAccount: (email?: string, pass?: string) => Promise<void>;
  loginAsGuest: (nurseName?: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    // Check local guest session
    const savedGuest = localStorage.getItem('askep_guest_user');
    if (savedGuest) {
      try {
        const guestData = JSON.parse(savedGuest);
        setCurrentUser(guestData);
        setIsGuest(true);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('askep_guest_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        setCurrentUser({
          id: user.uid,
          email: user.email || 'perawat@rs.id',
          displayName: user.displayName || user.email?.split('@')[0] || 'Ners Mahasiswa'
        });
        setIsGuest(false);
      } else if (!savedGuest) {
        // Default to instant demo nurse profile so user is immediately productive in AI Studio!
        const defaultNurse: UserProfile = {
          id: 'nurse_default_uid',
          email: '2411102411163@umkt.ac.id',
          displayName: 'Ners. Rahmat Hidayat, S.Kep',
          nim: '2411102411163',
          institution: 'Universitas Muhammadiyah Kalimantan Timur'
        };
        setCurrentUser(defaultNurse);
        setIsGuest(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setCurrentUser({
        id: res.user.uid,
        email: res.user.email || '',
        displayName: res.user.displayName || 'Perawat'
      });
      setIsGuest(false);
      localStorage.removeItem('askep_guest_user');
    } catch (err) {
      console.error('Google Auth Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      setCurrentUser({
        id: res.user.uid,
        email: res.user.email || '',
        displayName: res.user.displayName || email.split('@')[0]
      });
      setIsGuest(false);
      localStorage.removeItem('askep_guest_user');
    } catch (err) {
      console.error('Email Login Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      setCurrentUser({
        id: res.user.uid,
        email: res.user.email || '',
        displayName: name || email.split('@')[0]
      });
      setIsGuest(false);
      localStorage.removeItem('askep_guest_user');
    } catch (err) {
      console.error('Register Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithDemoAccount = async (
    demoEmail = '2411102411163@umkt.ac.id',
    demoPass = 'NersKMB2026!'
  ) => {
    setLoading(true);
    try {
      try {
        const res = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
        setCurrentUser({
          id: res.user.uid,
          email: res.user.email || demoEmail,
          displayName: 'Ners. Rahmat Hidayat, S.Kep',
          nim: '2411102411163',
          institution: 'Universitas Muhammadiyah Kalimantan Timur'
        });
        setIsGuest(false);
        localStorage.removeItem('askep_guest_user');
      } catch (err: any) {
        // If account doesn't exist, create it once so both devices can share it
        if (
          err?.code === 'auth/user-not-found' ||
          err?.code === 'auth/invalid-credential' ||
          err?.code === 'auth/invalid-login-credentials'
        ) {
          const res = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          setCurrentUser({
            id: res.user.uid,
            email: res.user.email || demoEmail,
            displayName: 'Ners. Rahmat Hidayat, S.Kep',
            nim: '2411102411163',
            institution: 'Universitas Muhammadiyah Kalimantan Timur'
          });
          setIsGuest(false);
          localStorage.removeItem('askep_guest_user');
        } else {
          throw err;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = (nurseName: string = 'Ners. Rahmat Hidayat, S.Kep') => {
    const guest: UserProfile = {
      id: 'nurse_guest_' + Date.now(),
      email: 'tamu@askep3s.local',
      displayName: nurseName,
      institution: 'Profesi Ners - KMB'
    };
    setCurrentUser(guest);
    setIsGuest(true);
    localStorage.setItem('askep_guest_user', JSON.stringify(guest));
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    localStorage.removeItem('askep_guest_user');
    setIsGuest(true);
    loginAsGuest();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isGuest,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginWithDemoAccount,
        loginAsGuest,
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
