/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePatients } from '../../context/PatientContext';
import { PatientCover } from '../../types/askep';
import { FileText, Sparkles, Building, User, GraduationCap } from 'lucide-react';

export const CoverForm: React.FC = () => {
  const { activePatient, savePatient } = usePatients();

  if (!activePatient) return null;

  const cover = activePatient.cover;

  const handleChange = (field: keyof PatientCover, value: string) => {
    const updatedCover = { ...cover, [field]: value };
    savePatient({
      ...activePatient,
      cover: updatedCover
    });
  };

  const handleGenerateTitle = () => {
    const autoTitle = `Asuhan Keperawatan pada ${activePatient.initials} dengan Masalah ${activePatient.medicalDiagnosis || 'Fraktur'} di Ruang ${activePatient.room || 'Bedah'} ${cover.hospital || 'RSUD'}`;
    handleChange('title', autoTitle);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>Sampul & Metadata Asuhan Keperawatan (KMB)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Format resmi dokumen laporan asuhan keperawatan stase KMB profesi ners.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateTitle}
          className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Judul Otomatis</span>
        </button>
      </div>

      <div className="space-y-5 text-xs">
        {/* Judul Laporan */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Judul Asuhan Keperawatan
          </label>
          <textarea
            value={cover.title}
            onChange={e => handleChange('title', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-900 font-medium"
            placeholder="Asuhan Keperawatan pada..."
          />
        </div>

        {/* 2 Kolom Institusi & Stase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Rumah Sakit / Wahana Praktik</span>
            </label>
            <input
              type="text"
              value={cover.hospital}
              onChange={e => handleChange('hospital', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="e.g. RSUD Abdul Wahab Sjahranie"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ruang Rawat / Bangsal
            </label>
            <input
              type="text"
              value={cover.room}
              onChange={e => {
                handleChange('room', e.target.value);
                savePatient({ ...activePatient, room: e.target.value });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
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
              <label className="block font-medium text-slate-600 mb-1">Nama Mahasiswa</label>
              <input
                type="text"
                value={cover.studentName}
                onChange={e => handleChange('studentName', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                placeholder="e.g. Ners. Rahmat Hidayat, S.Kep"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">NIM / NIRM</label>
              <input
                type="text"
                value={cover.studentNim}
                onChange={e => handleChange('studentNim', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
                placeholder="e.g. 2411102411163"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Stase</label>
              <input
                type="text"
                value={cover.stase}
                onChange={e => handleChange('stase', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                placeholder="e.g. Keperawatan Medikal Bedah (KMB)"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Tahun Akademik</label>
              <input
                type="text"
                value={cover.academicYear}
                onChange={e => handleChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                placeholder="e.g. 2026/2027"
              />
            </div>
          </div>
        </div>

        {/* Institusi Akademik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>Program Studi</span>
            </label>
            <input
              type="text"
              value={cover.studyProgram}
              onChange={e => handleChange('studyProgram', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="Profesi Ners"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Fakultas</label>
            <input
              type="text"
              value={cover.faculty}
              onChange={e => handleChange('faculty', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="Fakultas Ilmu Keperawatan"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Universitas / Institusi</label>
            <input
              type="text"
              value={cover.university}
              onChange={e => handleChange('university', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="Universitas Muhammadiyah Kalimantan Timur"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
