/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePatients } from '../../context/PatientContext';
import { PatientIdentity, Gender } from '../../types/askep';
import { User, ShieldAlert, Calendar, CheckSquare, Square, AlertCircle } from 'lucide-react';

export const IdentityForm: React.FC = () => {
  const { activePatient, savePatient } = usePatients();

  if (!activePatient) return null;

  const identity = activePatient.identity;

  const handleChange = (field: keyof PatientIdentity, value: any) => {
    const updatedIdentity = { ...identity, [field]: value };

    // Also sync top-level patient fields
    const updatedPatient = {
      ...activePatient,
      identity: updatedIdentity,
      initials: field === 'initials' ? value : activePatient.initials,
      mrn: field === 'mrn' ? value : activePatient.mrn,
      medicalDiagnosis: field === 'medicalDiagnosis' ? value : activePatient.medicalDiagnosis,
      admissionDate: field === 'admissionDate' ? value : activePatient.admissionDate,
      assessmentDate: field === 'assessmentDate' ? value : activePatient.assessmentDate
    };

    savePatient(updatedPatient);
  };

  const handleMethodToggle = (key: keyof PatientIdentity['assessmentMethods']) => {
    const currentMethods = identity.assessmentMethods;
    handleChange('assessmentMethods', {
      ...currentMethods,
      [key]: !currentMethods[key]
    });
  };

  // Date logical validation
  const isDateInvalid =
    identity.admissionDate &&
    identity.assessmentDate &&
    identity.assessmentDate.substring(0, 10) < identity.admissionDate;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto">
      {/* Header with Privacy Warning */}
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" />
          <span>Pengkajian Identitas Pasien (Format KMB)</span>
        </h3>
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Kerahasiaan Rekam Medis (Permenkes 24/2022 & Kode Etik PPNI):</p>
            <p className="text-amber-700 mt-0.5">
              Identifikasi pasien menggunakan <strong>Inisial</strong> (misal: Tn. J, Ny. S) dan <strong>Nomor Rekam Medis</strong>. Dilarang mencantumkan nama lengkap, NIK, atau nomor telepon pribadi pasien untuk menjaga kerahasiaan data klinis.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 text-xs">
        {/* Row 1: Inisial, No RM, Umur, JK */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Inisial Pasien <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={identity.initials}
              onChange={e => handleChange('initials', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-bold text-slate-900"
              placeholder="e.g. Tn. J"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              No. Rekam Medis (RM) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={identity.mrn}
              onChange={e => handleChange('mrn', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono text-slate-900"
              placeholder="e.g. RM-2026-8812"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Umur (Tahun)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={identity.age === 0 || identity.age === undefined ? '' : identity.age}
              onFocus={e => e.target.select()}
              onChange={e => {
                const cleaned = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '');
                handleChange('age', cleaned === '' ? '' : Number(cleaned));
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900"
              placeholder="34"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Jenis Kelamin
            </label>
            <select
              value={identity.gender}
              onChange={e => handleChange('gender', e.target.value as Gender)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Diagnosa Medis & Ruangan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Diagnosa Medis (Saat Pengkajian) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={identity.medicalDiagnosis}
              onChange={e => handleChange('medicalDiagnosis', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-semibold text-slate-900"
              placeholder="e.g. Fraktur Kominutif Ankle Sinistra Closed"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ruangan & No. Bed
            </label>
            <input
              type="text"
              value={activePatient.room || ''}
              onChange={e => {
                const newRoom = e.target.value;
                savePatient({
                  ...activePatient,
                  room: newRoom,
                  cover: {
                    ...activePatient.cover,
                    room: newRoom
                  }
                });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900"
              placeholder="e.g. Teratai Bed 02"
            />
          </div>
        </div>

        {/* Row 3: Tanggal Masuk RS & Tanggal Pengkajian (WITA) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Tanggal Masuk Rumah Sakit (WITA)</span>
            </label>
            <input
              type="date"
              value={identity.admissionDate}
              onChange={e => handleChange('admissionDate', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Tanggal & Jam Pengkajian (WITA)</span>
            </label>
            <input
              type="datetime-local"
              value={identity.assessmentDate}
              onChange={e => handleChange('assessmentDate', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
            />
          </div>

          {isDateInvalid && (
            <div className="sm:col-span-2 text-rose-600 flex items-center gap-1 text-[11px] font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Perhatian: Tanggal pengkajian tidak boleh mendahului tanggal masuk RS.</span>
            </div>
          )}
        </div>

        {/* Row 4: Status Demografi Tambahan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Status Marital</label>
            <input
              type="text"
              value={identity.maritalStatus}
              onChange={e => handleChange('maritalStatus', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="Menikah / Belum"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Agama</label>
            <input
              type="text"
              value={identity.religion}
              onChange={e => handleChange('religion', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="Islam / Kristen / ..."
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Pendidikan</label>
            <input
              type="text"
              value={identity.education}
              onChange={e => handleChange('education', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="SMA / S1"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Suku / Bangsa</label>
            <input
              type="text"
              value={identity.ethnicity}
              onChange={e => handleChange('ethnicity', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="Bugis / Jawa / Banjar"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Pekerjaan</label>
            <input
              type="text"
              value={identity.occupation}
              onChange={e => handleChange('occupation', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="Wiraswasta / PNS / Buruh"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Alamat Domisili</label>
            <input
              type="text"
              value={identity.address}
              onChange={e => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="Kota / Kabupaten"
            />
          </div>
        </div>

        {/* Metode Pengkajian Checkbox */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block font-semibold text-slate-800 mb-2">
            Metode Pengkajian Data yang Digunakan:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'autoanamnesa', label: 'Autoanamnesa (Pasien langsung)' },
              { key: 'alloanamnesa', label: 'Alloanamnesa (Keluarga/saksi)' },
              { key: 'pemeriksaanFisik', label: 'Pemeriksaan Fisik Langsung' },
              { key: 'statusKlien', label: 'Status Dokumen Klien / RM' }
            ].map(item => {
              const isChecked = identity.assessmentMethods[item.key as keyof PatientIdentity['assessmentMethods']];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleMethodToggle(item.key as keyof PatientIdentity['assessmentMethods'])}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                    isChecked
                      ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="text-[11px] leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
