/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';
import {
  UserPlus,
  Users,
  Printer,
  ChevronDown,
  Bed,
  Activity,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

interface PatientBarProps {
  onOpenManagePatients: () => void;
  onOpenPrint: () => void;
}

export const PatientBar: React.FC<PatientBarProps> = ({
  onOpenManagePatients,
  onOpenPrint
}) => {
  const {
    activePatient,
    patients,
    setActivePatientId,
    createNewPatient,
    exportSelectedToExcel
  } = usePatients();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!activePatient) {
    return (
      <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between">
        <p className="text-slate-600 text-sm">Belum ada pasien yang dipilih.</p>
        <button
          onClick={createNewPatient}
          className="flex items-center gap-1.5 bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pasien
        </button>
      </div>
    );
  }

  const morseScore = activePatient.domains.morseFallScale.totalScore;
  const morseCategory = activePatient.domains.morseFallScale.riskCategory;

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Patient Switcher & Clinical Info */}
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:border-teal-500 rounded-xl px-3 py-1.5 text-left shadow-xs transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                {activePatient.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {activePatient.initials}
                  </span>
                  <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                    {activePatient.mrn}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-[260px]">
                  {activePatient.room} • {activePatient.medicalDiagnosis}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5">
                <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Pilih Pasien Aktif</span>
                  <span className="text-[10px] text-teal-600 font-mono">({patients.length} Pasien)</span>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {patients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePatientId(p.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 text-xs transition-colors ${
                        p.id === activePatient.id ? 'bg-teal-50/70 font-semibold text-teal-900' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-800">
                          {p.initials} <span className="text-slate-400 font-normal">({p.mrn})</span>
                        </p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[210px]">
                          {p.room} • {p.medicalDiagnosis}
                        </p>
                      </div>
                      {p.id === activePatient.id && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-1.5 px-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      createNewPatient();
                    }}
                    className="flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-800 font-semibold p-1.5 rounded-lg hover:bg-teal-50"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Tambah Pasien Baru
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenManagePatients();
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 p-1.5"
                  >
                    Lihat Semua
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Clinical Quick Badges */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-slate-700 px-2 py-1 rounded-lg border border-slate-200">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              Nyeri: <strong className="text-rose-600">{activePatient.domains.painAssessment.severityScale}/10</strong>
            </span>

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border ${
                morseScore >= 51
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : morseScore >= 25
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Morse: <strong>{morseScore}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenManagePatients}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 transition-colors shadow-2xs"
            title="Buka Manajemen Seluruh Pasien"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Kelola Pasien ({patients.length})</span>
          </button>

          <button
            onClick={createNewPatient}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
            title="Tambah Pasien KMB Baru"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pasien Baru</span>
          </button>

          <button
            onClick={onOpenPrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
            title="Lihat Format Laporan Siap Cetak (Print View)"
          >
            <Printer className="w-3.5 h-3.5 text-teal-300" />
            <span className="hidden sm:inline">Cetak Dokumen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
