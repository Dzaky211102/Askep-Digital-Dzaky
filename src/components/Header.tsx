/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { formatWitaClock, getWitaDate, getCurrentShift, getShiftLabel } from '../utils/witaTime';
import { usePatients } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  CloudCheck,
  RefreshCw,
  WifiOff,
  FileSpreadsheet,
  BookOpen,
  Calendar,
  HelpCircle,
  User,
  LogOut,
  Hospital,
  AlertTriangle,
  Cloud,
  Zap
} from 'lucide-react';

interface HeaderProps {
  onOpenCatalog: () => void;
  onOpenCalendar: () => void;
  onOpenHelp: () => void;
  onOpenPrint: () => void;
  onOpenSyncModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCatalog,
  onOpenCalendar,
  onOpenHelp,
  onOpenPrint,
  onOpenSyncModal
}) => {
  const { syncStatus, exportSelectedToExcel, activePatient } = usePatients();
  const { currentUser, isGuest, logout } = useAuth();
  const [witaTimeString, setWitaTimeString] = useState<string>(formatWitaClock());
  const [currentShift, setCurrentShift] = useState(getCurrentShift());

  // Running digital WITA clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setWitaTimeString(formatWitaClock(now));
      setCurrentShift(getCurrentShift(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      {/* Hospital Privacy & Safety Warning Ribbon */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1 text-xs text-amber-300 flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span className="font-medium">Privasi & Etika RS:</span>
          <span className="text-amber-200/90 truncate">
            Gunakan Inisial + No. RM (jangan cantumkan nama lengkap). AsKep 3S adalah alat bantu dokumentasi klinis, verifikasi selalu oleh pembimbing/perawat primer.
          </span>
        </div>
        <span className="hidden md:inline-block font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">
          WITA (UTC+8) • KMB Doenges 3S
        </span>
      </div>

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
          {/* Real-time Sync Status & Multi-Device Button */}
          <button
            onClick={onOpenSyncModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              !isGuest && currentUser
                ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/80'
                : 'bg-amber-950/80 border-amber-500/80 text-amber-200 hover:bg-amber-900 animate-pulse shadow-sm shadow-amber-500/20'
            }`}
            title="Klik untuk Sinkronisasi Multi-Device (HP & Laptop)"
          >
            {!isGuest && currentUser ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Cloud Sinkron</span>
                <span className="text-[10px] bg-emerald-800/80 text-emerald-200 px-1.5 py-0.2 rounded font-mono">
                  {currentUser.email?.split('@')[0] || 'Aktif'}
                </span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold">Sinkronkan 2 HP/Laptop</span>
              </>
            )}
          </button>

          {/* Quick Buttons */}
          <button
            onClick={exportSelectedToExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            title="Ekspor Data Pasien ke File Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Ekspor Excel</span>
          </button>

          <button
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            title="Buka Kalender Jadwal Shift & SOAP"
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Kalender</span>
          </button>

          <button
            onClick={onOpenCatalog}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            title="Katalog Lengkap Standar 3S PPNI"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Katalog 3S</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Panduan Deployment & Cloud Setup"
          >
            <HelpCircle className="w-5 h-5 text-slate-300" />
          </button>

          {/* User profile / Logout */}
          <div className="flex items-center pl-1 border-l border-slate-800 ml-1">
            <button
              onClick={onOpenSyncModal}
              className="hidden xl:block text-right mr-2 hover:opacity-80 transition-opacity text-left cursor-pointer"
              title="Kelola Akun & Sinkronisasi"
            >
              <p className="text-xs font-bold text-white truncate max-w-[130px]">
                {currentUser?.displayName || 'Ners Mahasiswa'}
              </p>
              <p className="text-[10px] text-teal-400 font-mono truncate max-w-[130px]">
                {currentUser?.nim || 'KMB Profesi'}
              </p>
            </button>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
              title="Ganti Sesi / Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
