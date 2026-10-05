/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatients, CURRENT_DEVICE_ID } from '../context/PatientContext';
import {
  X,
  Cloud,
  CheckCircle2,
  Smartphone,
  Laptop,
  ArrowRight,
  User,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Database,
  Copy,
  Check
} from 'lucide-react';

interface AuthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthSyncModal: React.FC<AuthSyncModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const { syncStatus, lastSyncTime, lastSyncError, refreshFromCloud, savePatient, activePatient } = usePatients();

  const [copied, setCopied] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleForceSync = async () => {
    setIsSyncingNow(true);
    try {
      if (activePatient) {
        await savePatient(activePatient);
      }
      await refreshFromCloud();
      setSuccessMsg('Sinkronisasi cloud berhasil diperbarui!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.warn('Sync error:', err);
    } finally {
      setIsSyncingNow(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Cloud className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Sinkronisasi Multi-Perangkat (HP & Laptop)
              </h3>
              <p className="text-xs text-slate-400">
                Data pasien tersinkron real-time antar perangkat menggunakan akun NIM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Profile Card */}
          <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Akun Mahasiswa Aktif</span>
              </span>
              <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                UID Stabil
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {currentUser?.displayName?.charAt(0) || 'N'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-slate-900 text-sm truncate">
                  {currentUser?.displayName}
                </p>
                <p className="font-mono text-teal-700 font-bold text-xs">
                  NIM: {currentUser?.nim || '-'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  {currentUser?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Device & Sync Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="text-slate-500 text-[11px]">ID Sesi Perangkat Ini:</p>
              <p className="font-mono font-bold text-slate-800 text-xs mt-0.5 truncate">
                {CURRENT_DEVICE_ID}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="text-slate-500 text-[11px]">Status Sinkron Cloud:</p>
              <p className="font-bold text-emerald-700 text-xs mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersimpan ({lastSyncTime})</span>
              </p>
            </div>
          </div>

          {/* Multi-Device Guide */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-teal-600" />
              <span>Cara Membuka di 2 Perangkat Bersamaan:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
              <li>
                Buka link aplikasi ini di HP atau browser lain (misal: mode Incognito / Laptop).
              </li>
              <li>
                Masukkan <strong>NIM yang sama ({currentUser?.nim})</strong> pada tab Masuk.
              </li>
              <li>
                Perubahan pada TTV, Ruang Rawat, atau Intervensi akan langsung muncul secara <strong>real-time (&le; 3 detik)</strong> tanpa perlu refresh!
              </li>
            </ol>

            <button
              type="button"
              onClick={handleCopyUrl}
              className="mt-2 w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Aplikasi Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Salin Link URL Aplikasi Ini</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleForceSync}
              disabled={isSyncingNow}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNow ? 'animate-spin' : ''}`} />
              <span>{isSyncingNow ? 'Menyinkronkan...' : 'Paksa Sinkron Sekarang'}</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                onClose();
                await logout();
              }}
              className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Keluar dari akun NIM"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
