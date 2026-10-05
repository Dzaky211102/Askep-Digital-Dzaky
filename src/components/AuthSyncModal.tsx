/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatients } from '../context/PatientContext';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Laptop,
  ArrowRight,
  Zap,
  Mail,
  Lock,
  User,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Check
} from 'lucide-react';

interface AuthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthSyncModal: React.FC<AuthSyncModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, isGuest, loginWithGoogle, loginWithEmail, registerWithEmail, loginWithDemoAccount, logout, loading } = useAuth();
  const { syncStatus, savePatient, activePatient } = usePatients();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('2411102411163@umkt.ac.id');
  const [password, setPassword] = useState('NersKMB2026!');
  const [displayName, setDisplayName] = useState('Ners. Rahmat Hidayat, S.Kep');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  if (!isOpen) return null;

  const handleDemoLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await loginWithDemoAccount();
      setSuccessMsg('Berhasil masuk dengan Akun Ners UMKT! Sinkronisasi cloud aktif.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal masuk akun demo.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await loginWithGoogle();
      setSuccessMsg('Berhasil masuk dengan akun Google!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal login dengan Google.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        setSuccessMsg('Berhasil masuk!');
      } else {
        await registerWithEmail(email, password, displayName);
        setSuccessMsg('Akun berhasil didaftarkan dan login!');
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal autentikasi.');
    }
  };

  const handleForceSync = async () => {
    if (!activePatient) return;
    setIsSyncingNow(true);
    try {
      await savePatient(activePatient);
      setSuccessMsg('Data pasien berhasil dipaksa sinkronkan ke Firebase Cloud!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg('Gagal menyinkronkan data.');
    } finally {
      setIsSyncingNow(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Cloud className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Sinkronisasi Multi-Device</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-900 text-teal-300 border border-teal-700">
                  Firebase Real-Time
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Akses & ubah data pasien secara sinkron dari HP, Tablet, dan Laptop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
          {/* Status Sinkronisasi Saat Ini */}
          <div className={`p-4 rounded-xl border ${
            !isGuest && currentUser
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start gap-3">
              {!isGuest && currentUser ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-sm">
                  {!isGuest && currentUser ? 'Cloud Sync Aktif (Real-Time)' : 'Mode Tamu / Offline Lokal'}
                </p>
                <p className="text-xs mt-0.5 text-slate-600">
                  {!isGuest && currentUser ? (
                    <>
                      Terhubung sebagai <span className="font-semibold text-slate-900">{currentUser.email}</span>. Setiap perubahan otomatis tersimpan ke cloud dan sinkron ke perangkat lain yang login dengan akun ini.
                    </>
                  ) : (
                    <>
                      Data saat ini hanya tersimpan di browser perangkat ini. Untuk melihat & mengubah data pasien yang sama di perangkat lain (HP / Laptop), <strong>masuk dengan akun yang sama di kedua perangkat</strong>.
                    </>
                  )}
                </p>

                {!isGuest && currentUser && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={handleForceSync}
                      disabled={isSyncingNow}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNow ? 'animate-spin' : ''}`} />
                      <span>{isSyncingNow ? 'Menyinkronkan...' : 'Paksa Sinkronkan Sekarang'}</span>
                    </button>
                    <button
                      onClick={logout}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* PANDUAN CEPAT SYNC 2 DEVICE */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Cara Sinkronisasi 2 Perangkat (HP + Laptop)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
              <div className="p-2 bg-white rounded-lg border border-slate-200 flex flex-col items-center text-center">
                <Laptop className="w-4 h-4 text-sky-600 mb-1" />
                <span className="font-semibold text-slate-800">1. Buka di Laptop</span>
                <span>Buka URL AsKep 3S di laptop & klik "Masuk Cepat"</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 flex flex-col items-center text-center">
                <Smartphone className="w-4 h-4 text-teal-600 mb-1" />
                <span className="font-semibold text-slate-800">2. Buka di HP</span>
                <span>Buka URL di HP & klik "Masuk Cepat" yang sama</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 flex flex-col items-center text-center">
                <RefreshCw className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-semibold text-slate-800">3. Otomatis Sinkron</span>
                <span>Ubah data di HP, detik itu juga berubah di Laptop!</span>
              </div>
            </div>
          </div>

          {/* TOMBOL UTAMA: 1-KLIK LOGIN DEMO / UNIVERSITAS */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Login 1-Klik Akun Ners UMKT (Rekomendasi untuk Sinkronisasi)</span>
            </button>
            <p className="text-[11px] text-center text-slate-500">
              Cukup klik tombol di atas pada HP & Laptop Anda, keduanya akan langsung terhubung ke database yang sama!
            </p>
          </div>

          <div className="flex items-center gap-2 my-2 text-slate-400">
            <hr className="flex-1 border-slate-200" />
            <span className="text-[10px] uppercase font-semibold">Atau Masuk dengan Akun Sendiri</span>
            <hr className="flex-1 border-slate-200" />
          </div>

          {/* GOOGLE SIGN-IN */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 font-semibold text-slate-700 rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Masuk dengan Akun Google</span>
          </button>

          {/* EMAIL & PASSWORD FORM */}
          <form onSubmit={handleEmailAuth} className="space-y-3 pt-2">
            <div className="flex border-b border-slate-200 mb-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 pb-2 font-semibold text-center ${
                  mode === 'login'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Masuk Email
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 pb-2 font-semibold text-center ${
                  mode === 'register'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nama Lengkap & Gelar</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Ners. Rahmat Hidayat, S.Kep"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  required
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Alamat Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="2411102411163@umkt.ac.id"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk dengan Email' : 'Daftar & Aktifkan Cloud'}
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Database: <strong className="text-slate-700">Firebase Firestore</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
