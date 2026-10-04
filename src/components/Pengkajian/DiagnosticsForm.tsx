/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { LabResult, RadiologyResult } from '../../types/askep';
import { LAB_PRESETS, determineLabFlag, LabPresetItem } from '../../data/labPresets';
import { formatWitaDateInput } from '../../utils/witaTime';
import { FlaskConical, Plus, Trash2, ArrowUp, ArrowDown, Camera, Check } from 'lucide-react';

export const DiagnosticsForm: React.FC = () => {
  const { activePatient, savePatient } = usePatients();
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  if (!activePatient) return null;

  const diagnostics = activePatient.diagnostics;
  const labs = diagnostics.laboratories;
  const rads = diagnostics.radiologies;
  const todayWita = formatWitaDateInput(new Date());

  const handleAddLabRow = (preset?: LabPresetItem) => {
    const newLab: LabResult = {
      id: `lab_${Date.now()}`,
      date: todayWita,
      testName: preset ? preset.testName : 'Pemeriksaan Baru',
      result: '',
      unit: preset ? preset.unit : '',
      normalRange: preset ? preset.normalRange : '',
      normalMin: preset ? preset.normalMin : undefined,
      normalMax: preset ? preset.normalMax : undefined,
      flag: 'normal'
    };

    savePatient({
      ...activePatient,
      diagnostics: {
        ...diagnostics,
        laboratories: [...labs, newLab]
      }
    });
  };

  const handleUpdateLab = (id: string, updates: Partial<LabResult>) => {
    const updatedLabs = labs.map(item => {
      if (item.id === id) {
        const next = { ...item, ...updates };
        // Recalculate flag if result or min/max changed
        if (updates.result !== undefined || updates.normalMin !== undefined || updates.normalMax !== undefined) {
          next.flag = determineLabFlag(next.result, next.normalMin, next.normalMax);
        }
        return next;
      }
      return item;
    });

    savePatient({
      ...activePatient,
      diagnostics: {
        ...diagnostics,
        laboratories: updatedLabs
      }
    });
  };

  const handleDeleteLab = (id: string) => {
    savePatient({
      ...activePatient,
      diagnostics: {
        ...diagnostics,
        laboratories: labs.filter(l => l.id !== id)
      }
    });
  };

  const handleAddRadiology = () => {
    const newRad: RadiologyResult = {
      id: `rad_${Date.now()}`,
      date: todayWita,
      examinationType: 'Foto Rontgen...',
      impression: ''
    };
    savePatient({
      ...activePatient,
      diagnostics: {
        ...diagnostics,
        radiologies: [...rads, newRad]
      }
    });
  };

  const handleUpdateRad = (id: string, updates: Partial<RadiologyResult>) => {
    const updatedRads = rads.map(r => (r.id === id ? { ...r, ...updates } : r));
    savePatient({
      ...activePatient,
      diagnostics: {
        ...diagnostics,
        radiologies: updatedRads
      }
    });
  };

  const handleDeleteRad = (id: string) => {
    savePatient({
      ...activePatient,
      diagnostics: {
        ...diagnostics,
        radiologies: rads.filter(r => r.id !== id)
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-teal-600" />
          <span>Pemeriksaan Penunjang (Laboratorium & Radiologi)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Tabel nilai rujukan standar dengan deteksi otomatis nilai di luar rentang normal (↑ / ↓) yang terhubung ke rule engine SDKI.
        </p>
      </div>

      {/* 1. LABORATORIUM DINAMIS */}
      <div className="space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Tambah Cepat Preset Lab:</span>
            <select
              value={selectedPreset}
              onChange={e => {
                const p = LAB_PRESETS.find(item => item.testName === e.target.value);
                if (p) {
                  handleAddLabRow(p);
                  setSelectedPreset('');
                }
              }}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium"
            >
              <option value="">-- Pilih Pemeriksaan Preset --</option>
              {LAB_PRESETS.map(p => (
                <option key={p.testName} value={p.testName}>
                  [{p.category}] {p.testName} ({p.normalRange} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => handleAddLabRow()}
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-3 py-1.5 rounded-lg self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Baris Manual</span>
          </button>
        </div>

        {/* Lab Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5 w-24">Tanggal</th>
                <th className="p-2.5">Nama Tes</th>
                <th className="p-2.5 w-28">Hasil Nilai</th>
                <th className="p-2.5 w-20">Satuan</th>
                <th className="p-2.5 w-32">Rentang Normal</th>
                <th className="p-2.5 w-28 text-center">Status Flag</th>
                <th className="p-2.5 w-10 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {labs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Belum ada data laboratorium. Pilih preset di atas atau tambah baris manual.
                  </td>
                </tr>
              ) : (
                labs.map(lab => (
                  <tr
                    key={lab.id}
                    className={`transition-colors ${
                      lab.flag === 'high'
                        ? 'bg-rose-50/50'
                        : lab.flag === 'low'
                        ? 'bg-amber-50/50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-2">
                      <input
                        type="date"
                        value={lab.date}
                        onChange={e => handleUpdateLab(lab.id, { date: e.target.value })}
                        className="w-full px-1.5 py-1 bg-white border border-slate-200 rounded text-[11px] font-mono"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={lab.testName}
                        onChange={e => handleUpdateLab(lab.id, { testName: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-900"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={lab.result}
                        onChange={e => handleUpdateLab(lab.id, { result: e.target.value })}
                        placeholder="Nilai"
                        className={`w-full px-2 py-1 bg-white border rounded font-mono font-bold ${
                          lab.flag === 'high'
                            ? 'border-rose-400 text-rose-700 bg-rose-50/40'
                            : lab.flag === 'low'
                            ? 'border-amber-400 text-amber-700 bg-amber-50/40'
                            : 'border-slate-200 text-slate-900'
                        }`}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={lab.unit}
                        onChange={e => handleUpdateLab(lab.id, { unit: e.target.value })}
                        placeholder="Satuan"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-600"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={lab.normalRange}
                        onChange={e => handleUpdateLab(lab.id, { normalRange: e.target.value })}
                        placeholder="e.g. 12-16"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-600"
                      />
                    </td>
                    <td className="p-2 text-center">
                      {lab.flag === 'high' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full text-[10px]">
                          <ArrowUp className="w-3 h-3" /> TINGGI (↑)
                        </span>
                      ) : lab.flag === 'low' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full text-[10px]">
                          <ArrowDown className="w-3 h-3" /> RENDAH (↓)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                          <Check className="w-3 h-3" /> Normal
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteLab(lab.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. RADIOLOGI & DIAGNOSTIK LAIN */}
      <div className="pt-4 border-t border-slate-200 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide">
            <Camera className="w-4 h-4 text-sky-600" />
            <span>Pemeriksaan Radiologi & Pencitraan (Rontgen / USG / CT-Scan)</span>
          </h4>

          <button
            type="button"
            onClick={handleAddRadiology}
            className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3 py-1 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Hasil Radiologi</span>
          </button>
        </div>

        <div className="space-y-3">
          {rads.length === 0 ? (
            <p className="text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
              Belum ada hasil radiologi yang ditambahkan.
            </p>
          ) : (
            rads.map(rad => (
              <div key={rad.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="date"
                      value={rad.date}
                      onChange={e => handleUpdateRad(rad.id, { date: e.target.value })}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                    />
                    <input
                      type="text"
                      value={rad.examinationType}
                      onChange={e => handleUpdateRad(rad.id, { examinationType: e.target.value })}
                      placeholder="e.g. Foto Rontgen Ankle Sinistra AP/Lateral"
                      className="flex-1 px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteRad(rad.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kesan / Ekspertise Dokter Radiologi:
                  </label>
                  <textarea
                    value={rad.impression}
                    onChange={e => handleUpdateRad(rad.id, { impression: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    placeholder="e.g. Tampak fraktur kominutif pada maleolus lateralis dan medialis..."
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
