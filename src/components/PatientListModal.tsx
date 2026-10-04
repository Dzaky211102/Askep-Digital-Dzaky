/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';
import {
  X,
  Search,
  UserPlus,
  Trash2,
  FileSpreadsheet,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Bed,
  CheckCircle2
} from 'lucide-react';
import { Patient } from '../types/askep';

interface PatientListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientListModal: React.FC<PatientListModalProps> = ({ isOpen, onClose }) => {
  const {
    patients,
    activePatient,
    carePlans,
    setActivePatientId,
    createNewPatient,
    deletePatient,
    resetToSeedData,
    selectedPatientIds,
    toggleSelectPatient,
    selectAllPatients,
    deselectAllPatients,
    exportSelectedToExcel,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter
  } = usePatients();

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  if (!isOpen) return null;

  // Filter patients
  const filteredPatients = patients.filter(p => {
    const matchSearch =
      p.initials.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medicalDiagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.room.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'semua' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDeleteConfirm = async () => {
    if (patientToDelete) {
      await deletePatient(patientToDelete.id);
      setPatientToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Daftar & Manajemen Pasien AsKep KMB</span>
              <span className="text-xs font-mono bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                {patients.length} Pasien
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih pasien untuk membuka asuhan keperawatan atau pilih beberapa untuk ekspor Excel multi-sheet.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filters, Bulk Selection, Add */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari inisial, No RM, diagnosa, ruangan..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-xl text-xs px-3 py-1.5 text-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Rawat Aktif</option>
              <option value="pulang">Pulang / KRS</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'card' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-500'
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'table' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-500'
                }`}
                title="Tampilan Tabel"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedPatientIds.length === patients.length) {
                  deselectAllPatients();
                } else {
                  selectAllPatients();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 px-3 py-1.5 rounded-xl font-medium"
            >
              {selectedPatientIds.length === patients.length ? (
                <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{selectedPatientIds.length === patients.length ? 'Lepas Semua' : 'Pilih Semua'}</span>
            </button>

            {selectedPatientIds.length > 0 && (
              <button
                onClick={exportSelectedToExcel}
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Ekspor ({selectedPatientIds.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                createNewPatient();
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-xl shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Pasien</span>
            </button>
          </div>
        </div>

        {/* Content Body: Card Grid or Table */}
        <div className="p-6 overflow-y-auto flex-1">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">Tidak ada pasien yang sesuai filter pencarian.</p>
            </div>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map(p => {
                const isSelected = selectedPatientIds.includes(p.id);
                const isActive = p.id === activePatient?.id;
                const cp = carePlans[p.id];
                const dxCount = cp?.diagnoses?.length || 0;
                const implCount = cp?.implementations?.length || 0;
                const morse = p.domains.morseFallScale;

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border p-4 transition-all relative flex flex-col justify-between ${
                      isActive
                        ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top Row: Checkbox, Initials, Status */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleSelectPatient(p.id);
                            }}
                            className="text-slate-400 hover:text-teal-600"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-teal-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                              {p.initials}
                              <span className="text-xs font-mono font-normal text-slate-500">
                                ({p.mrn})
                              </span>
                            </h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Bed className="w-3.5 h-3.5 text-slate-400" />
                              {p.room}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            p.status === 'aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Diagnosis */}
                      <div className="bg-slate-50 rounded-xl p-2.5 my-2 border border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          Diagnosa Medis:
                        </p>
                        <p className="text-xs font-medium text-slate-800 line-clamp-2">
                          {p.medicalDiagnosis}
                        </p>
                      </div>

                      {/* Clinical Stats */}
                      <div className="grid grid-cols-3 gap-1.5 text-center my-2 text-[11px]">
                        <div className="bg-slate-100/80 p-1.5 rounded-lg">
                          <span className="text-slate-500 block text-[10px]">Nyeri</span>
                          <strong className="text-rose-600 font-bold">
                            {p.domains.painAssessment.severityScale}/10
                          </strong>
                        </div>
                        <div className="bg-slate-100/80 p-1.5 rounded-lg">
                          <span className="text-slate-500 block text-[10px]">Morse</span>
                          <strong className="text-amber-700 font-bold">{morse.totalScore}</strong>
                        </div>
                        <div className="bg-slate-100/80 p-1.5 rounded-lg">
                          <span className="text-slate-500 block text-[10px]">Dx 3S</span>
                          <strong className="text-teal-700 font-bold">{dxCount}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                      <button
                        onClick={() => {
                          setActivePatientId(p.id);
                          onClose();
                        }}
                        className={`flex-1 text-xs font-bold py-1.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
                          isActive
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                        <span>{isActive ? 'Sedang Dibuka' : 'Buka AsKep'}</span>
                      </button>

                      <button
                        onClick={() => setPatientToDelete(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Hapus Pasien"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-10">Pilih</th>
                    <th className="p-3">Inisial / No. RM</th>
                    <th className="p-3">Ruangan</th>
                    <th className="p-3">Diagnosa Medis</th>
                    <th className="p-3 text-center">Nyeri</th>
                    <th className="p-3 text-center">Morse Fall</th>
                    <th className="p-3 text-center">Dx 3S</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map(p => {
                    const isSelected = selectedPatientIds.includes(p.id);
                    const isActive = p.id === activePatient?.id;
                    const cp = carePlans[p.id];
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isActive ? 'bg-teal-50/50 font-semibold' : ''
                        }`}
                      >
                        <td className="p-3">
                          <button onClick={() => toggleSelectPatient(p.id)}>
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-teal-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="p-3">
                          <strong className="text-slate-900">{p.initials}</strong>
                          <span className="text-slate-400 ml-1.5 font-mono">({p.mrn})</span>
                        </td>
                        <td className="p-3 text-slate-600">{p.room}</td>
                        <td className="p-3 text-slate-800 max-w-[200px] truncate">
                          {p.medicalDiagnosis}
                        </td>
                        <td className="p-3 text-center font-bold text-rose-600">
                          {p.domains.painAssessment.severityScale}/10
                        </td>
                        <td className="p-3 text-center font-semibold text-amber-700">
                          {p.domains.morseFallScale.totalScore}
                        </td>
                        <td className="p-3 text-center font-semibold text-teal-700">
                          {cp?.diagnoses?.length || 0}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              p.status === 'aktif'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setActivePatientId(p.id);
                              onClose();
                            }}
                            className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-2.5 py-1 rounded-lg font-medium"
                          >
                            Buka
                          </button>
                          <button
                            onClick={() => setPatientToDelete(p)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer: Reset Seed & Close */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Muat ulang data contoh kasus Tn. J (Fraktur Kominutif Ankle Sinistra)? Data tersimpan akan diganti dengan data seed lengkap.')) {
                resetToSeedData();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold px-3 py-1.5 rounded-xl border border-amber-300 hover:bg-amber-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Contoh (Tn. J - Fraktur Ankle)</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Confirmation Delete Dialog */}
      {patientToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Hapus Data Pasien {patientToDelete.initials}?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Apakah Anda yakin ingin menghapus data pasien <strong>{patientToDelete.initials}</strong> ({patientToDelete.mrn}) beserta seluruh analisa data, diagnosa 3S, implementasi, dan catatan SOAP? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPatientToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-xs"
              >
                Ya, Hapus Pasien
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
