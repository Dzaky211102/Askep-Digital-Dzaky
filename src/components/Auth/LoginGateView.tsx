/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  checkNimInAllowlist,
  REQUIRE_PIN,
  ADMIN_NIM,
  INITIAL_OFFICIAL_NIMS
} from '../../services/nimAuth';
import {
  Hospital,
  ShieldCheck,
  UserCheck,
  LogIn,
  UserPlus,
  AlertCircle,
  HelpCircle,
  Lock,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const LoginGateView: React.FC = () => {
  const { loginWithNim, registerWithNim } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [nimInput, setNimInput] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Registration confirmation modal state
  const [pendingConfirm, setPendingConfirm] = useState<{
    nim: string;
    name: string;
  } | null>(null);

  // Sanitize numeric input (only digits)
  const handleNimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').trim();
    setNimInput(raw);
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nimInput) {
      setErrorMsg('Silakan masukkan NIM Anda.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      await loginWithNim(nimInput, pinInput);
    } catch (err: any) {
      const msg = err?.message || 'Gagal masuk. Periksa NIM Anda.';
      setErrorMsg(msg);
      if (msg.includes('beralih ke tab "Daftar"')) {
        setInfoMsg('NIM Anda terdaftar di daftar mahasiswa resmi tetapi belum diaktivasi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nimInput) {
      setErrorMsg('Silakan masukkan NIM Anda.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      // First verify allowlist to get name for confirmation
      const allowCheck = await checkNimInAllowlist(nimInput);
      if (!allowCheck.isAllowed) {
        setErrorMsg('NIM belum terdaftar di daftar pengguna. Hubungi admin.');
        setLoading(false);
        return;
      }

      if (allowCheck.isRegistered) {
        setErrorMsg('NIM sudah terdaftar, silakan Masuk.');
        setInfoMsg('Akun dengan NIM ini sudah aktif. Silakan pilih tab "Masuk".');
        setLoading(false);
        return;
      }

      // Prompt confirmation
      setPendingConfirm({
        nim: nimInput,
        name: allowCheck.name || 'Mahasiswa Ners'
      });
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat memeriksa NIM.');
      setLoading(false);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!pendingConfirm) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      await registerWithNim(pendingConfirm.nim, pinInput);
      setPendingConfirm(null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Pendaftaran gagal. Hubungi admin.');
      setPendingConfirm(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-700 p-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-3 shadow-inner">
            <Hospital className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            AsKep <span className="text-teal-200">3S</span> Digital
          </h1>
          <p className="text-xs text-teal-100/90 font-medium mt-1">
            Sistem Dokumentasi Keperawatan 13 Domain Doenges • SDKI SLKI SIKI
          </p>
          <div className="inline-flex items-center gap-1.5 bg-teal-900/40 text-teal-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full mt-3 border border-teal-400/30">
            <ShieldCheck className="w-3 h-3 text-teal-300" />
            <span>Gerbang Autentikasi Mahasiswa Resmi</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-white text-teal-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-white text-teal-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMsg}</p>
                {infoMsg && <p className="text-[11px] text-rose-700 mt-1">{infoMsg}</p>}
                {errorMsg.includes('beralih ke tab "Daftar"') && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                    className="mt-2 text-xs font-bold text-teal-700 underline flex items-center gap-1"
                  >
                    <span>Beralih ke tab Daftar sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {errorMsg.includes('NIM sudah terdaftar, silakan Masuk') && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                    className="mt-2 text-xs font-bold text-teal-700 underline flex items-center gap-1"
                  >
                    <span>Beralih ke tab Masuk sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={activeTab === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
            <div>
              <label htmlFor="nim" className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Induk Mahasiswa (NIM)
              </label>
              <div className="relative">
                <input
                  id="nim"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={nimInput}
                  onChange={handleNimChange}
                  placeholder="Contoh: 2511102412185"
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  {nimInput.length > 0 ? `${nimInput.length} digit` : ''}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Masukkan hanya angka NIM Anda yang terdaftar pada program profesi ners.
              </p>
            </div>

            {/* Optional PIN if configured */}
            {REQUIRE_PIN && (
              <div>
                <label htmlFor="pin" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>PIN Keamanan (4-6 Digit)</span>
                </label>
                <input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !nimInput}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : activeTab === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke AsKep 3S</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Daftarkan Akun NIM</span>
                </>
              )}
            </button>
          </form>

          {/* Quick info / Allowlist Help */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-600">Daftar Pengguna Resmi:</span>
              <span className="text-[11px] text-teal-700 font-mono">10 Mahasiswa</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Akun STABIL antar perangkat: HP dan Laptop otomatis sinkron.</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>NIM tersimpan di database cloud (koleksi <code className="font-mono text-teal-800">allowed_nims</code>).</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Stase KMB Profesi Ners</span>
          <span>Zona Waktu WITA (Asia/Makassar)</span>
        </div>
      </div>

      {/* Confirmation Modal for Registration */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>

            <h3 className="text-center font-bold text-slate-900 text-base">
              Konfirmasi Pendaftaran
            </h3>
            <p className="text-center text-xs text-slate-600 mt-1">
              NIM Anda ditemukan di daftar mahasiswa resmi:
            </p>

            <div className="my-4 p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-center">
              <p className="text-xs text-teal-600 font-semibold">Anda mendaftar sebagai:</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {pendingConfirm.name}
              </p>
              <p className="text-xs font-mono text-teal-800 mt-1">
                NIM: {pendingConfirm.nim}
              </p>
            </div>

            <p className="text-[11px] text-slate-500 text-center mb-5">
              Setelah konfirmasi, akun akan dibuat secara otomatis dan langsung masuk.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPendingConfirm(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRegistration}
                disabled={loading}
                className="flex-1 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors shadow-xs"
              >
                {loading ? 'Mendaftarkan...' : 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
