/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { PatientHistory, GenogramNode } from '../../types/askep';
import { History, GitFork, Plus, Trash2, Download, Check, Sparkles } from 'lucide-react';

export const HistoryAndGenogram: React.FC = () => {
  const { activePatient, savePatient } = usePatients();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  if (!activePatient) return null;

  const history = activePatient.history;
  const genogram = history.genogram;

  const handleChange = (field: keyof PatientHistory, value: any) => {
    savePatient({
      ...activePatient,
      history: {
        ...history,
        [field]: value
      }
    });
  };

  const handleAddGenogramNode = (generation: 1 | 2 | 3) => {
    const newNode: GenogramNode = {
      id: `gn_${Date.now()}`,
      generation,
      gender: 'L',
      isPatient: false,
      isDeceased: false,
      isCoHabitant: generation === 3,
      label: generation === 1 ? 'Kakek' : generation === 2 ? 'Saudara Ayah/Ibu' : 'Saudara',
      relation: generation === 1 ? 'Generasi I' : generation === 2 ? 'Generasi II' : 'Generasi III',
      age: 30
    };

    const updatedNodes = [...genogram.nodes, newNode];
    handleChange('genogram', {
      ...genogram,
      nodes: updatedNodes
    });
  };

  const handleUpdateNode = (id: string, updates: Partial<GenogramNode>) => {
    const updatedNodes = genogram.nodes.map(n => (n.id === id ? { ...n, ...updates } : n));
    handleChange('genogram', {
      ...genogram,
      nodes: updatedNodes
    });
  };

  const handleDeleteNode = (id: string) => {
    const updatedNodes = genogram.nodes.filter(n => n.id !== id);
    handleChange('genogram', {
      ...genogram,
      nodes: updatedNodes
    });
  };

  // Export genogram to PNG image
  const handleExportGenogramImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Genogram 3 Generasi - Pasien: ${activePatient.initials} (${activePatient.mrn})`, 30, 35);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Keterangan: Kotak (Laki-laki), Lingkaran (Perempuan), Arsiran/Teal (Klien/Pasien), Silang (Meninggal), Garis Putus-putus (Tinggal Serumah)`, 30, 55);

    // Draw lines between generations
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 190);
    ctx.lineTo(860, 190);
    ctx.moveTo(40, 340);
    ctx.lineTo(860, 340);
    ctx.stroke();

    // Generation Labels
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#0d9488';
    ctx.fillText('GENERASI I (Kakek & Nenek)', 40, 95);
    ctx.fillText('GENERASI II (Orang Tua & Paman/Bibi)', 40, 225);
    ctx.fillText('GENERASI III (Pasien, Pasangan & Saudara)', 40, 375);

    // Render nodes per generation
    [1, 2, 3].forEach(gen => {
      const nodes = genogram.nodes.filter(n => n.generation === gen);
      const startY = gen === 1 ? 140 : gen === 2 ? 270 : 420;
      const spacing = Math.min(130, Math.floor(760 / Math.max(1, nodes.length)));

      nodes.forEach((node, i) => {
        const x = 120 + i * spacing;
        const y = startY;

        // Draw living together boundary if applicable
        if (node.isCoHabitant) {
          ctx.strokeStyle = '#0d9488';
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(x - 28, y - 28, 56, 56);
          ctx.setLineDash([]);
        }

        // Draw node shape (Square for male, Circle for female)
        ctx.fillStyle = node.isPatient ? '#0d9488' : '#f8fafc';
        ctx.strokeStyle = node.isPatient ? '#0f766e' : '#334155';
        ctx.lineWidth = node.isPatient ? 3 : 2;

        if (node.gender === 'L') {
          ctx.fillRect(x - 18, y - 18, 36, 36);
          ctx.strokeRect(x - 18, y - 18, 36, 36);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Deceased X mark
        if (node.isDeceased) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(x - 15, y - 15);
          ctx.lineTo(x + 15, y + 15);
          ctx.moveTo(x + 15, y - 15);
          ctx.lineTo(x - 15, y + 15);
          ctx.stroke();
        }

        // Text label
        ctx.fillStyle = '#0f172a';
        ctx.font = node.isPatient ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, x, y + 32);
        if (node.age) {
          ctx.font = '9px sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.fillText(`${node.age} th`, x, y + 44);
        }
      });
    });

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Genogram_${activePatient.initials}_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-teal-600" />
          <span>Pengkajian Riwayat Keperawatan & Genogram 3 Generasi</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Keluhan utama, riwayat penyakit (RPS, RPD, RPK), serta silsilah kesehatan keluarga minimal 3 generasi.
        </p>
      </div>

      <div className="space-y-5 text-xs">
        {/* 2 Kolom Keluhan Utama: Masuk RS vs Saat Dikaji */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block font-bold text-slate-800 mb-1">
              1. Keluhan Utama Saat Masuk RS (IGD/Poli)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Keluhan yang membawa pasien pertama kali datang mencari pertolongan medis.
            </p>
            <textarea
              value={history.chiefComplaintAdmission}
              onChange={e => handleChange('chiefComplaintAdmission', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="e.g. Nyeri hebat pada pergelangan kaki kiri setelah kecelakaan motor..."
            />
          </div>

          <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200">
            <label className="block font-bold text-teal-950 mb-1">
              2. Keluhan Utama Saat Pengkajian (Sekarang)
            </label>
            <p className="text-[11px] text-teal-700 mb-2">
              Keluhan paling dirasakan klien saat dilakukan pengkajian di ruang rawat.
            </p>
            <textarea
              value={history.chiefComplaintAssessment}
              onChange={e => handleChange('chiefComplaintAssessment', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="e.g. Pasien mengeluh nyeri berdenyut skala 7/10 pada pergelangan kaki kiri..."
            />
          </div>
        </div>

        {/* Riwayat Penyakit Sekarang (RPS) */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Riwayat Penyakit Sekarang (RPS)
          </label>
          <p className="text-[11px] text-slate-500 mb-1">
            Jelaskan kronologis onset, pemicu kejadian, lokasi, tindakan pertolongan pertama, dan perkembangan kondisi hingga saat dikaji.
          </p>
          <textarea
            value={history.presentIllnessHistory}
            onChange={e => handleChange('presentIllnessHistory', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800"
            placeholder="e.g. Pasien mengalami kecelakaan motor pada pukul 08.00 WITA..."
          />
        </div>

        {/* RPD dan RPK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Riwayat Penyakit Dahulu (RPD)
            </label>
            <textarea
              value={history.pastMedicalHistory}
              onChange={e => handleChange('pastMedicalHistory', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="e.g. Tidak ada riwayat hipertensi, diabetes melitus, asma, atau alergi obat..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Riwayat Penyakit Keluarga (RPK)
            </label>
            <textarea
              value={history.familyMedicalHistory}
              onChange={e => handleChange('familyMedicalHistory', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="e.g. Tidak ada riwayat penyakit genetik atau menular di keluarga..."
            />
          </div>
        </div>

        {/* Visual Genogram Editor (Minimal 3 Generasi) */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-300 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <GitFork className="w-4 h-4 text-teal-600" />
                <span>Editor Genogram Visual (3 Generasi)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Simbol standar: □ Laki-laki | ○ Perempuan | ■/● Pasien (Teal) | ✕ Meninggal | ⬚ Tinggal Serumah
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportGenogramImage}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Gambar (PNG)</span>
              </button>
            </div>
          </div>

          {/* Interactive Genogram Node Cards by Generation */}
          {[1, 2, 3].map(gen => {
            const genNodes = genogram.nodes.filter(n => n.generation === gen);
            const genTitle =
              gen === 1
                ? 'Generasi I (Kakek & Nenek)'
                : gen === 2
                ? 'Generasi II (Orang Tua & Paman/Bibi)'
                : 'Generasi III (Pasien, Pasangan & Saudara/Anak)';

            return (
              <div key={gen} className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>{genTitle}</span>
                    <span className="text-slate-400 font-normal">({genNodes.length} anggota)</span>
                  </h5>

                  <button
                    type="button"
                    onClick={() => handleAddGenogramNode(gen as 1 | 2 | 3)}
                    className="flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Anggota Gen {gen}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {genNodes.map(node => (
                    <div
                      key={node.id}
                      className={`p-2.5 rounded-xl border transition-all text-xs ${
                        node.isPatient
                          ? 'border-teal-500 bg-teal-50/70 ring-1 ring-teal-500'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {/* Symbol Preview */}
                          <div
                            className={`w-6 h-6 flex items-center justify-center font-bold text-[10px] ${
                              node.gender === 'L' ? 'rounded-xs' : 'rounded-full'
                            } ${
                              node.isPatient
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {node.isDeceased ? '✕' : node.gender}
                          </div>
                          <input
                            type="text"
                            value={node.label}
                            onChange={e => handleUpdateNode(node.id, { label: e.target.value })}
                            className="font-bold text-xs bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 px-1 py-0.5 focus:outline-hidden w-28 truncate"
                            placeholder="Label"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteNode(node.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Controls: Gender, Deceased, CoHabitant, IsPatient */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleUpdateNode(node.id, { gender: node.gender === 'L' ? 'P' : 'L' })}
                          className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700"
                        >
                          {node.gender === 'L' ? '□ Pria' : '○ Wanita'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateNode(node.id, { isDeceased: !node.isDeceased })}
                          className={`px-1.5 py-0.5 rounded border ${
                            node.isDeceased ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold' : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {node.isDeceased ? '✕ Meninggal' : 'Hidup'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateNode(node.id, { isCoHabitant: !node.isCoHabitant })}
                          className={`px-1.5 py-0.5 rounded border ${
                            node.isCoHabitant ? 'bg-teal-100 text-teal-800 border-teal-300 font-bold' : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {node.isCoHabitant ? '⬚ Serumah' : 'Terpisah'}
                        </button>

                        {gen === 3 && (
                          <button
                            type="button"
                            onClick={() => handleUpdateNode(node.id, { isPatient: !node.isPatient })}
                            className={`px-1.5 py-0.5 rounded border ${
                              node.isPatient ? 'bg-teal-700 text-white border-teal-700 font-bold' : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            {node.isPatient ? '★ Pasien' : 'Bukan Pasien'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Naratif Genogram:
            </label>
            <input
              type="text"
              value={genogram.notes}
              onChange={e => handleChange('genogram', { ...genogram, notes: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="e.g. Genogram 3 generasi. Pasien tinggal serumah bersama istri dan 1 anak..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
