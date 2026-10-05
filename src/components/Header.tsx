/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { formatWitaClock, getCurrentShift, getShiftLabel } from '../utils/witaTime';
import { usePatients } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  RefreshCw,
  WifiOff,
  FileSpreadsheet,
  BookOpen,
  Calendar,
  HelpCircle,
  LogOut,
  Hospital,
  AlertTriangle,
  Cloud,
  CheckCircle2,
  Shield,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  onOpenCatalog: () => void;
  onOpenCalendar: () => void;
  onOpenHelp: () => void;
  onOpenPrint: () => void;
  onOpenSyncModal: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCatalog,
  onOpenCalendar,
  onOpenHelp,
  onOpenPrint,
  onOpenSyncModal,
  onOpenAdmin
}) => {
  const {
    syncStatus,
    lastSyncTime,
    lastSyncError,
    refreshFromCloud,
    exportSelectedToExcel,
    remoteUpdateToast,
    dismissRemoteUpdateToast
  } = usePatients();

  const { currentUser, isAdmin, logout } = useAuth();
  const [witaTimeString, setWitaTimeString] = useState<string>(formatWitaClock());
  const [currentShift, setCurrentShift] = useState(getCurrentShift());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Running digital WITA clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setWitaTimeString(formatWitaClock(now));
      setCurrentShift(getCurrentShift(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    try {
      await refreshFromCloud();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm font-sans">
      {/* Hospital Privacy & Safety Warning Ribbon */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1 text-xs text-amber-300 flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span className="font-medium">Privasi & Etika RS:</span>
          <span className="text-amber-200/90 truncate">
            Gunakan Inisial + No. RM. AsKep 3S adalah media dokumentasi klinis, verifikasi selalu oleh CI / perawat primer berwenang.
          </span>
        </div>
        <span className="hidden md:inline-block font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">
          WITA (UTC+8) • KMB Doenges 3S
        </span>
      </div>

      {/* Remote update notification toast banner (Conflict / Real-time multi-device) */}
      {remoteUpdateToast && (
        <div className="bg-teal-600 text-white px-4 py-1.5 text-xs flex items-center justify-between shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span className="font-semibold">{remoteUpdateToast}</span>
          </div>
          <button
            onClick={dismissRemoteUpdateToast}
            className="text-[11px] underline hover:text-teal-200 ml-4 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Write Error Banner (if any) */}
      {lastSyncError && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 px-4 py-1 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-medium">Status Sinkronisasi: {lastSyncError}</span>
          </div>
          <button
            onClick={handleRefreshClick}
            className="text-[11px] font-bold text-rose-300 underline hover:text-white ml-2 cursor-pointer"
          >
            Coba Sinkron Ulang
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand & Digital WITA Clock */}
        <div className="flex items-center gap-3">
          <div className="bg-teal-500 text-slate-950 p-2 rounded-xl font-black text-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Hospital className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                AsKep <span className="text-teal-400 font-extrabold">3S</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                SDKI • SLKI • SIKI
              </span>
            </div>

            {/* Running Digital WITA Clock */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono mt-0.5">
              <Clock className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span className="font-bold text-teal-300">{witaTimeString}</span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                • {getShiftLabel(currentShift).split('(')[0].trim()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Icons & Sync Indicator */}
        <div className="flex items-center gap-2">
          {/* Sync Status Badge */}
          <div
            onClick={onOpenSyncModal}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50 px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-colors"
            title="Klik untuk membuka Pengaturan Sinkronisasi Cloud Multi-Perangkat"
          >
            {syncStatus === 'saved' && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Cloud className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Cloud Aktif ✓</span>
                <span className="text-[10px] text-slate-400 font-mono">({lastSyncTime})</span>
              </span>
            )}

            {syncStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Menyimpan ke Cloud…</span>
              </span>
            )}

            {syncStatus === 'offline' && (
              <span className="flex items-center gap-1.5 text-rose-300 font-medium">
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Offline — cache lokal aktif</span>
              </span>
            )}

            {/* Reload from cloud button */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleRefreshClick();
              }}
              disabled={isRefreshing}
              className="ml-1 p-0.5 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
              title="Muat ulang dari cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
            </button>
          </div>

          {/* Admin Panel Button (only if admin NIM) */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-600/70 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Panel Admin: Kelola Allowlist NIM Resmi"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Admin Allowlist</span>
            </button>
          )}

          {/* Quick Buttons */}
          <button
            onClick={exportSelectedToExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
            title="Ekspor Data Pasien ke File Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Ekspor Excel</span>
          </button>

          <button
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Buka Kalender Jadwal Shift & SOAP"
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Kalender</span>
          </button>

          <button
            onClick={onOpenCatalog}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Katalog Lengkap Standar 3S PPNI"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Katalog 3S</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Panduan Deployment & Cloud Setup"
          >
            <HelpCircle className="w-5 h-5 text-slate-300" />
          </button>

          {/* User profile & NIM / Logout */}
          <div className="flex items-center pl-2 border-l border-slate-800 ml-1">
            <div className="text-right mr-2 text-left hidden sm:block">
              <p className="text-xs font-bold text-white truncate max-w-[140px]">
                {currentUser?.displayName || 'Mahasiswa Ners'}
              </p>
              <p className="text-[10px] text-teal-400 font-mono font-bold truncate max-w-[140px]">
                {currentUser?.nim ? `NIM ${currentUser.nim}` : 'KMB Profesi'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Keluar dari Akun NIM"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
