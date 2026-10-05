/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { AllowedNimRecord } from '../types/askep';

// Official Allowlist of 10 nursing students
export const INITIAL_OFFICIAL_NIMS: Array<{ nim: string; name: string }> = [
  { nim: '2511102412215', name: 'Muhammad Rodiansyah' },
  { nim: '2511102412211', name: 'Arinda Fadilla Rizky Aulia' },
  { nim: '2511102412253', name: 'Syarah Auliza Firdayanti Yunus' },
  { nim: '2511102412250', name: 'Sheila Amelia Kartika' },
  { nim: '2511102412233', name: 'Helda Nur Handayani' },
  { nim: '2511102412232', name: 'Selpina' },
  { nim: '2511102412263', name: 'Vika Yulianita' },
  { nim: '2511102412265', name: 'Adelia Rachmawati' },
  { nim: '2511102412185', name: 'Muhammad Dzaky Ramdani' },
  { nim: '2511102412234', name: 'Anggie Kharisma Dewi' }
];

export const ADMIN_NIM =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_ADMIN_NIM as string)) ||
  '2511102412185';

export const REQUIRE_PIN =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_REQUIRE_PIN as string) === 'true') ||
  false;

/**
 * Format sanitized NIM (only digits, trimmed)
 */
export function sanitizeNim(rawNim: string): string {
  return rawNim.replace(/\D/g, '').trim();
}

/**
 * Deterministic synthetic email for NIM
 * Ensures UID is 100% stable across all devices!
 */
export function getNimEmail(nim: string): string {
  const clean = sanitizeNim(nim);
  return `${clean}@askep.local`;
}

/**
 * Deterministic stable UID derived from NIM.
 * Guaranteed 100% identical on laptop, phone, or any device!
 */
export function getNimUid(nim: string): string {
  const clean = sanitizeNim(nim);
  return `askep_nim_${clean}`;
}

/**
 * Deterministic credentials derived from NIM (and optional PIN)
 */
export function getNimPassword(nim: string, pin?: string): string {
  const clean = sanitizeNim(nim);
  if (REQUIRE_PIN && pin) {
    return `Askep#${clean}_pin_${pin}_PPNI2026!`;
  }
  return `Askep#${clean}_Auth_PPNI2026!`;
}

/**
 * Seed initial official NIMs into Firestore `allowed_nims` if not already present
 */
export async function seedAllowedNimsIfEmpty(): Promise<void> {
  try {
    const colRef = collection(db, 'allowed_nims');
    const snapshot = await getDocs(colRef);
    const existingNims = new Set(snapshot.docs.map(d => d.id));

    const batch = writeBatch(db);
    let count = 0;

    for (const student of INITIAL_OFFICIAL_NIMS) {
      if (!existingNims.has(student.nim)) {
        const docRef = doc(db, 'allowed_nims', student.nim);
        const record: AllowedNimRecord = {
          nim: student.nim,
          name: student.name,
          registered: false,
          registeredAt: null,
          createdAt: new Date().toISOString()
        };
        batch.set(docRef, record);
        count++;
      }
    }

    if (count > 0) {
      await batch.commit();
      console.log(`Seeded ${count} official NIMs into allowed_nims.`);
    }
  } catch (err) {
    console.warn('Seeding allowed_nims note:', err);
  }
}

/**
 * Fetch all allowed NIMs from database (with fallback to official seed)
 */
export async function fetchAllowedNims(): Promise<AllowedNimRecord[]> {
  try {
    const colRef = collection(db, 'allowed_nims');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      return snapshot.docs.map(d => d.data() as AllowedNimRecord);
    }
  } catch (err) {
    console.warn('fetchAllowedNims Firestore error, using official fallback:', err);
  }

  // Fallback to initial list if Firestore not yet populated
  return INITIAL_OFFICIAL_NIMS.map(s => ({
    nim: s.nim,
    name: s.name,
    registered: false,
    registeredAt: null,
    createdAt: new Date().toISOString()
  }));
}

/**
 * Check if a NIM is in the allowlist
 */
export async function checkNimInAllowlist(rawNim: string): Promise<{
  isAllowed: boolean;
  record?: AllowedNimRecord;
  name?: string;
  isRegistered?: boolean;
}> {
  const clean = sanitizeNim(rawNim);
  if (!clean) return { isAllowed: false };

  // Helper to check local registration status if offline
  const getLocalRegistered = (n: string): boolean => {
    try {
      const regList: string[] = JSON.parse(localStorage.getItem('askep_registered_nims') || '[]');
      return regList.includes(n);
    } catch {
      return false;
    }
  };

  try {
    const docRef = doc(db, 'allowed_nims', clean);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as AllowedNimRecord;
      const isReg = data.registered || getLocalRegistered(clean);
      return {
        isAllowed: true,
        record: data,
        name: data.name,
        isRegistered: isReg
      };
    }
  } catch (err) {
    console.warn('Check NIM firestore read error, fallback to memory list:', err);
  }

  // Check fallback list
  const found = INITIAL_OFFICIAL_NIMS.find(s => s.nim === clean);
  if (found) {
    const isReg = getLocalRegistered(clean);
    return {
      isAllowed: true,
      record: {
        nim: found.nim,
        name: found.name,
        registered: isReg,
        createdAt: new Date().toISOString()
      },
      name: found.name,
      isRegistered: isReg
    };
  }

  return { isAllowed: false };
}

/**
 * Mark a NIM as registered in allowed_nims
 */
export async function markNimRegistered(nim: string): Promise<void> {
  const clean = sanitizeNim(nim);
  try {
    const regList: string[] = JSON.parse(localStorage.getItem('askep_registered_nims') || '[]');
    if (!regList.includes(clean)) {
      regList.push(clean);
      localStorage.setItem('askep_registered_nims', JSON.stringify(regList));
    }
  } catch (e) {
    // ignore
  }

  try {
    const docRef = doc(db, 'allowed_nims', clean);
    await updateDoc(docRef, {
      registered: true,
      registeredAt: new Date().toISOString()
    });
  } catch (err) {
    // If doc didn't exist in DB, create it with registered = true
    const found = INITIAL_OFFICIAL_NIMS.find(s => s.nim === clean);
    if (found) {
      try {
        await setDoc(doc(db, 'allowed_nims', clean), {
          nim: clean,
          name: found.name,
          registered: true,
          registeredAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('markNimRegistered setDoc error:', e);
      }
    }
  }
}

/**
 * Admin: Add new NIM to allowed_nims
 */
export async function addAllowedNim(nim: string, name: string): Promise<void> {
  const clean = sanitizeNim(nim);
  if (!clean || !name.trim()) throw new Error('NIM dan Nama tidak boleh kosong.');

  const docRef = doc(db, 'allowed_nims', clean);
  const newRecord: AllowedNimRecord = {
    nim: clean,
    name: name.trim(),
    registered: false,
    registeredAt: null,
    createdAt: new Date().toISOString()
  };
  await setDoc(docRef, newRecord);
}

/**
 * Admin: Delete NIM from allowed_nims
 */
export async function deleteAllowedNim(nim: string): Promise<void> {
  const clean = sanitizeNim(nim);
  if (!clean) return;
  const docRef = doc(db, 'allowed_nims', clean);
  await deleteDoc(docRef);
}

// -------------------------------------------------------------
// Rate Limiter for Login / Register attempts
// -------------------------------------------------------------
const RATE_LIMIT_KEY = 'askep_auth_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

interface RateLimitData {
  attempts: number;
  lockedUntil: number | null;
}

export function checkRateLimit(nim: string): { allowed: boolean; waitSeconds?: number } {
  const clean = sanitizeNim(nim);
  const storageKey = `${RATE_LIMIT_KEY}_${clean}`;
  const raw = sessionStorage.getItem(storageKey);
  if (!raw) return { allowed: true };

  try {
    const data: RateLimitData = JSON.parse(raw);
    const now = Date.now();

    if (data.lockedUntil && now < data.lockedUntil) {
      const waitSeconds = Math.ceil((data.lockedUntil - now) / 1000);
      return { allowed: false, waitSeconds };
    }

    if (data.lockedUntil && now >= data.lockedUntil) {
      sessionStorage.removeItem(storageKey);
      return { allowed: true };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export function recordFailedAttempt(nim: string): { locked: boolean; waitSeconds?: number } {
  const clean = sanitizeNim(nim);
  const storageKey = `${RATE_LIMIT_KEY}_${clean}`;
  const raw = sessionStorage.getItem(storageKey);
  const now = Date.now();

  let data: RateLimitData = { attempts: 0, lockedUntil: null };
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      // fallback
    }
  }

  data.attempts += 1;

  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockedUntil = now + LOCKOUT_SECONDS * 1000;
    sessionStorage.setItem(storageKey, JSON.stringify(data));
    return { locked: true, waitSeconds: LOCKOUT_SECONDS };
  }

  sessionStorage.setItem(storageKey, JSON.stringify(data));
  return { locked: false };
}

export function resetFailedAttempts(nim: string): void {
  const clean = sanitizeNim(nim);
  const storageKey = `${RATE_LIMIT_KEY}_${clean}`;
  sessionStorage.removeItem(storageKey);
}
