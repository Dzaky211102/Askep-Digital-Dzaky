/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { usePatients } from '../../context/PatientContext';
import { PatientCover } from '../../types/askep';
import { FileText, Sparkles, Building, User, GraduationCap, Bed, Stethoscope, RefreshCw, Cloud, CheckCircle2 } from 'lucide-react';

export const CoverForm: React.FC = () => {
  const { activePatient, savePatient } = usePatients();

  if (!activePatient) return null;

  const cover = activePatient.cover;
  const currentRoom = cover.room || activePatient.room || '';
  const currentInitials = activePatient.initials || cover.title.split(' pada ')[1]?.split(' dengan ')[0] || 'Tn. J';
  const currentDiagnosis = activePatient.medicalDiagnosis || '';
  const currentHospital = cover.hospital || 'RSUD Abdul Wahab Sjahranie';

  // Track if title is generated automatically or custom edited
  const [isManualTitle, setIsManualTitle] = useState(false);

  // Helper to construct standard automatic title
  const generateStandardTitle = (
    initials: string,
    diagnosis: string,
    room: string,
    hospital: string
  ): string => {
    const pInit = initials.trim() || 'Pasien';
    const pDiag = diagnosis.trim() || 'Kondisi Klinis';
    const cleanRoom = room.trim();
    const pRoom = cleanRoom
      ? cleanRoom.toLowerCase().startsWith('ruang')
        ? `di ${cleanRoom}`
        : `di Ruang ${cleanRoom}`
      : '';
    const pHosp = hospital.trim() || 'RSUD';
    return `Asuhan Keperawatan pada ${pInit} dengan Masalah ${pDiag} ${pRoom} ${pHosp}`.replace(/\s+/g, ' ').trim();
  };

  const handleFieldChange = (field: keyof PatientCover, value: string) => {
    const updatedCover: PatientCover = { ...cover, [field]: value };

    // If auto title is active and relevant fields changed, update title
    let updatedTitle = updatedCover.title;
    if (!isManualTitle && (field === 'room' || field === 'hospital')) {
      updatedTitle = generateStandardTitle(
        currentInitials,
        currentDiagnosis,
        field === 'room' ? value : currentRoom,
        field === 'hospital' ? value : currentHospital
      );
      updatedCover.title = updatedTitle;
    }

    savePatient({
      ...activePatient,
      room: field === 'room' ? value : activePatient.room,
      cover: updatedCover
    });
  };

  const handlePatientIdentityChange = (field: 'initials' | 'medicalDiagnosis', value: string) => {
    const updatedCover = { ...cover };

    if (!isManualTitle) {
      updatedCover.title = generateStandardTitle(
        field === 'initials' ? value : currentInitials,
        field === 'medicalDiagnosis' ? value : currentDiagnosis,
        currentRoom,
        currentHospital
      );
    }

    savePatient({
      ...activePatient,
      [field]: value,
      identity: {
        ...activePatient.identity,
        [field]: value
      },
      cover: updatedCover
    });
  };

  const handleManualTitleChange = (val: string) => {
    setIsManualTitle(true);
    handleFieldChange('title', val);
  };

  const handleResetAutoTitle = () => {
    setIsManualTitle(false);
    const autoTitle = generateStandardTitle(currentInitials, currentDiagnosis, currentRoom, currentHospital);
    const updatedCover = { ...cover, title: autoTitle };
    savePatient({
      ...activePatient,
      cover: updatedCover
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>Sampul & Metadata Asuhan Keperawatan (KMB)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Semua field dapat diedit bebas dan tersinkronisasi otomatis ke cloud.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetAutoTitle}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          title="Sinkronkan judul otomatis berdasarkan inisial, masalah, ruang, dan RS"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Judul Otomatis</span>
        </button>
      </div>

      {/* Multi-Device Cloud Sync Notice */}
      <div className="mb-5 p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center justify-between text-xs text-teal-950">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-teal-600 shrink-0 animate-pulse" />
          <span>
            <strong>Penyimpanan Cloud Selalu Aktif:</strong> Data pasien tersinkron real-time antar perangkat (HP & Laptop) melalui akun NIM Anda.
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-semibold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Multi-Device Ready</span>
        </span>
      </div>

      <div className="space-y-5 text-xs">
        {/* Judul Laporan */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="cover-title" className="block font-semibold text-slate-700">
              Judul Asuhan Keperawatan
            </label>
            <span className="text-[11px] text-slate-400">
              {isManualTitle ? 'Diedit Manual (Klik tombol di atas untuk otomatis)' : 'Sinkron Otomatis'}
            </span>
          </div>
          <textarea
            id="cover-title"
            value={cover.title}
            onChange={e => handleManualTitleChange(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900 font-medium"
            placeholder="Asuhan Keperawatan pada..."
          />
        </div>

        {/* Pasien & Diagnosis Klinis di Sampul */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100">
          <div>
            <label htmlFor="cover-initials" className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Nama Pasien / Inisial</span>
            </label>
            <input
              id="cover-initials"
              type="text"
              value={currentInitials}
              onChange={e => handlePatientIdentityChange('initials', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900 font-bold"
              placeholder="e.g. Tn. J"
            />
          </div>

          <div>
            <label htmlFor="cover-med-diag" className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Diagnosis Medis Utama</span>
            </label>
            <input
              id="cover-med-diag"
              type="text"
              value={currentDiagnosis}
              onChange={e => handlePatientIdentityChange('medicalDiagnosis', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900 font-medium"
              placeholder="e.g. Fraktur Femur Dekstra Tertutup"
            />
          </div>
        </div>

        {/* Ruang Rawat & Rumah Sakit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cover-hospital" className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Rumah Sakit / Wahana Praktik</span>
            </label>
            <input
              id="cover-hospital"
              type="text"
              value={cover.hospital}
              onChange={e => handleFieldChange('hospital', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900"
              placeholder="e.g. RSUD Abdul Wahab Sjahranie"
            />
          </div>

          <div>
            <label htmlFor="cover-room" className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-teal-600" />
              <span>Ruang Rawat / Bangsal</span>
            </label>
            <input
              id="cover-room"
              type="text"
              value={currentRoom}
              onChange={e => handleFieldChange('room', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900 font-semibold"
              placeholder="e.g. Ruang Teratai (Bedah Orthopedi)"
            />
          </div>
        </div>

        {/* Identitas Mahasiswa */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-1.5">
            <User className="w-4 h-4 text-teal-600" />
            <span>Identitas Penyusun / Mahasiswa Profesi</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cover-student-name" className="block font-medium text-slate-600 mb-1">
                Nama Mahasiswa
              </label>
              <input
                id="cover-student-name"
                type="text"
                value={cover.studentName}
                onChange={e => handleFieldChange('studentName', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900 font-medium"
                placeholder="e.g. Muhammad Dzaky Ramdani"
              />
            </div>
            <div>
              <label htmlFor="cover-student-nim" className="block font-medium text-slate-600 mb-1">
                NIM / NIRM
              </label>
              <input
                id="cover-student-nim"
                type="text"
                value={cover.studentNim}
                onChange={e => handleFieldChange('studentNim', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono font-bold text-slate-900"
                placeholder="e.g. 2511102412185"
              />
            </div>
            <div>
              <label htmlFor="cover-stase" className="block font-medium text-slate-600 mb-1">
                Stase
              </label>
              <input
                id="cover-stase"
                type="text"
                value={cover.stase}
                onChange={e => handleFieldChange('stase', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900"
                placeholder="e.g. Keperawatan Medikal Bedah (KMB)"
              />
            </div>
            <div>
              <label htmlFor="cover-academic-year" className="block font-medium text-slate-600 mb-1">
                Tahun Akademik
              </label>
              <input
                id="cover-academic-year"
                type="text"
                value={cover.academicYear}
                onChange={e => handleFieldChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900"
                placeholder="e.g. 2026/2027"
              />
            </div>
          </div>
        </div>

        {/* Institusi Akademik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="cover-study-program" className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              <span>Program Studi</span>
            </label>
            <input
              id="cover-study-program"
              type="text"
              value={cover.studyProgram}
              onChange={e => handleFieldChange('studyProgram', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900"
              placeholder="Profesi Ners"
            />
          </div>
          <div>
            <label htmlFor="cover-faculty" className="block font-semibold text-slate-700 mb-1">
              Fakultas
            </label>
            <input
              id="cover-faculty"
              type="text"
              value={cover.faculty}
              onChange={e => handleFieldChange('faculty', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900"
              placeholder="Fakultas Ilmu Keperawatan"
            />
          </div>
          <div>
            <label htmlFor="cover-university" className="block font-semibold text-slate-700 mb-1">
              Universitas / Institusi
            </label>
            <input
              id="cover-university"
              type="text"
              value={cover.university}
              onChange={e => handleFieldChange('university', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900"
              placeholder="Universitas Muhammadiyah Kalimantan Timur"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
