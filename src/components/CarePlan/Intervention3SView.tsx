/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { NursingDiagnosisCarePlan, SikiAction, SlkiIndicator } from '../../types/askep';
import { ALL_CATALOG_3S } from '../../data/extendedCatalog';
import {
  HeartHandshake,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Search,
  BookOpen
} from 'lucide-react';

export const Intervention3SView: React.FC = () => {
  const { activeCarePlan, saveCarePlan, setActiveStage } = usePatients();
  const [selectedDxId, setSelectedDxId] = useState<string>('');

  if (!activeCarePlan) return null;

  const diagnoses = activeCarePlan.diagnoses || [];
  const currentDx = diagnoses.find(d => d.id === selectedDxId) || diagnoses[0] || null;

  const handleUpdateDx = (id: string, updates: Partial<NursingDiagnosisCarePlan>) => {
    const updated = diagnoses.map(d => (d.id === id ? { ...d, ...updates } : d));
    saveCarePlan({
      ...activeCarePlan,
      diagnoses: updated
    });
  };

  const handleToggleAction = (dxId: string, intervIndex: number, actionId: string) => {
    const dx = diagnoses.find(d => d.id === dxId);
    if (!dx) return;

    const updatedIntervs = [...dx.interventions];
    const targetInterv = updatedIntervs[intervIndex];
    if (!targetInterv) return;

    targetInterv.actions = targetInterv.actions.map(a =>
      a.id === actionId ? { ...a, isSelected: !a.isSelected } : a
    );

    handleUpdateDx(dxId, { interventions: updatedIntervs });
  };

  const handleAddCustomAction = (
    dxId: string,
    intervIndex: number,
    category: 'Observasi' | 'Terapeutik' | 'Edukasi' | 'Kolaborasi'
  ) => {
    const desc = prompt(`Masukkan tindakan ${category} baru:`);
    if (!desc || !desc.trim()) return;

    const dx = diagnoses.find(d => d.id === dxId);
    if (!dx) return;

    const updatedIntervs = [...dx.interventions];
    const targetInterv = updatedIntervs[intervIndex];
    if (!targetInterv) return;

    const newAction: SikiAction = {
      id: `act_${Date.now()}`,
      category,
      description: desc.trim(),
      isSelected: true
    };

    targetInterv.actions = [...targetInterv.actions, newAction];
    handleUpdateDx(dxId, { interventions: updatedIntervs });
  };

  const handleDeleteAction = (dxId: string, intervIndex: number, actionId: string) => {
    const dx = diagnoses.find(d => d.id === dxId);
    if (!dx) return;

    const updatedIntervs = [...dx.interventions];
    const targetInterv = updatedIntervs[intervIndex];
    if (!targetInterv) return;

    targetInterv.actions = targetInterv.actions.filter(a => a.id !== actionId);
    handleUpdateDx(dxId, { interventions: updatedIntervs });
  };

  const handleUpdateIndicatorTarget = (dxId: string, indId: string, target: number) => {
    const dx = diagnoses.find(d => d.id === dxId);
    if (!dx) return;

    const updatedIndicators = dx.outcome.indicators.map(ind =>
      ind.id === indId ? { ...ind, targetScale: target } : ind
    );

    handleUpdateDx(dxId, {
      outcome: {
        ...dx.outcome,
        indicators: updatedIndicators
      }
    });
  };

  const handleAddIndicator = (dxId: string) => {
    const name = prompt('Masukkan nama indikator luaran baru (SLKI):');
    if (!name || !name.trim()) return;

    const dx = diagnoses.find(d => d.id === dxId);
    if (!dx) return;

    const newInd: SlkiIndicator = {
      id: `ind_${Date.now()}`,
      name: name.trim(),
      targetScale: 4,
      currentScale: 2
    };

    handleUpdateDx(dxId, {
      outcome: {
        ...dx.outcome,
        indicators: [...dx.outcome.indicators, newInd]
      }
    });
  };

  if (diagnoses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-2xl mx-auto my-6">
        <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="font-bold text-slate-800 text-sm">Belum Ada Diagnosis Terpilih</h4>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Silakan jalankan analisa data terlebih dahulu untuk menetapkan diagnosis keperawatan.
        </p>
        <button
          onClick={() => setActiveStage(2)}
          className="bg-teal-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
        >
          ← Buka Analisa Data
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-600" />
            <span>Tahap 4: Rencana Intervensi Keperawatan 3S (SLKI & SIKI PPNI)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tujuan & Kriteria Hasil (SLKI dengan target skor 1–5) dan Rencana Tindakan SIKI (Observasi, Terapeutik, Edukasi, Kolaborasi).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveStage(5)}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-xl transition-all shadow-xs self-start sm:self-auto"
        >
          <span>Lanjut ke Implementasi (Shift WITA)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs per Diagnosis */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 border-b border-slate-100">
        {diagnoses.map(dx => {
          const isSelected = (currentDx?.id === dx.id);
          return (
            <button
              key={dx.id}
              onClick={() => setSelectedDxId(dx.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-xs ring-2 ring-teal-600/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span className="font-mono text-[10px] bg-black/15 px-1.5 py-0.2 rounded">
                Dx {dx.priority}
              </span>
              <span>{dx.sdkCode} - {dx.problem}</span>
            </button>
          );
        })}
      </div>

      {currentDx && (
        <div className="space-y-6 text-xs">
          {/* Diagnostic Card Header */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded border border-teal-300">
                  {currentDx.sdkCode}
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  {currentDx.problem}
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Prioritas Ke-{currentDx.priority}
              </span>
            </div>
            <p className="text-slate-700 font-medium text-xs italic">
              "{currentDx.pesStatement}"
            </p>
          </div>

          {/* 1. SLKI: TUJUAN DAN KRITERIA HASIL */}
          <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-teal-950 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  <span>Luaran & Kriteria Hasil (SLKI): {currentDx.outcome.label} ({currentDx.outcome.code})</span>
                </h4>
                <p className="text-[11px] text-teal-800 mt-0.5">
                  Ekspektasi: <strong className="uppercase">{currentDx.outcome.expectation}</strong> setelah intervensi keperawatan.
                </p>
              </div>

              {/* Timeframe setting */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-teal-200">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-[11px] font-medium text-slate-600">Target Waktu:</span>
                <select
                  value={currentDx.outcome.timeframeHours}
                  onChange={e =>
                    handleUpdateDx(currentDx.id, {
                      outcome: {
                        ...currentDx.outcome,
                        timeframeHours: Number(e.target.value)
                      }
                    })
                  }
                  className="font-bold text-teal-800 bg-transparent focus:outline-hidden"
                >
                  <option value={24}>1 × 24 Jam</option>
                  <option value={48}>2 × 24 Jam</option>
                  <option value={72}>3 × 24 Jam</option>
                  <option value={120}>5 × 24 Jam</option>
                </select>
              </div>
            </div>

            {/* Indicators Table */}
            <div className="border border-teal-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-teal-100/70 text-teal-900 font-semibold border-b border-teal-200">
                  <tr>
                    <th className="p-2.5">Indikator Luaran SLKI</th>
                    <th className="p-2.5 w-40 text-center">Skala Saat Dikaji (1-5)</th>
                    <th className="p-2.5 w-40 text-center">Target Skala (1-5)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentDx.outcome.indicators.map(ind => (
                    <tr key={ind.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium text-slate-800">
                        • {ind.name}
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-500 font-mono">
                        Skala {ind.currentScale || 2}
                      </td>
                      <td className="p-2.5 text-center">
                        <select
                          value={ind.targetScale}
                          onChange={e =>
                            handleUpdateIndicatorTarget(currentDx.id, ind.id, Number(e.target.value))
                          }
                          className="px-2 py-1 bg-teal-50 border border-teal-300 font-bold text-teal-800 rounded-lg"
                        >
                          <option value={3}>Skala 3 (Cukup)</option>
                          <option value={4}>Skala 4 (Baik)</option>
                          <option value={5}>Skala 5 (Optimal / Bebas)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleAddIndicator(currentDx.id)}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold"
              >
                + Tambah Indikator Luaran Manual
              </button>
            </div>
          </div>

          {/* 2. SIKI: INTERVENSI DENGAN 4 KATEGORI (O / T / E / K) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                <span>Rencana Intervensi Keperawatan (SIKI): 4 Kategori Tindakan</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Tindakan yang dicentang akan otomatis menjadi lembar checklist implementasi per shift.
              </span>
            </div>

            {currentDx.interventions.map((interv, intervIdx) => (
              <div
                key={interv.code + intervIdx}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {interv.code}
                    </span>
                    <strong className="text-slate-900 text-sm">{interv.label}</strong>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold uppercase">
                      {interv.type}
                    </span>
                  </div>
                </div>

                {/* 4 Categories: Observasi, Terapeutik, Edukasi, Kolaborasi */}
                {(['Observasi', 'Terapeutik', 'Edukasi', 'Kolaborasi'] as const).map(catName => {
                  const catActions = interv.actions.filter(a => a.category === catName);

                  return (
                    <div key={catName} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                            catName === 'Observasi'
                              ? 'bg-sky-100 text-sky-800'
                              : catName === 'Terapeutik'
                              ? 'bg-emerald-100 text-emerald-800'
                              : catName === 'Edukasi'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          Tindakan {catName} ({catActions.filter(a => a.isSelected).length}/{catActions.length})
                        </span>

                        <button
                          type="button"
                          onClick={() => handleAddCustomAction(currentDx.id, intervIdx, catName)}
                          className="text-[10px] text-teal-700 hover:text-teal-900 font-semibold"
                        >
                          + Tambah Tindakan {catName}
                        </button>
                      </div>

                      <div className="space-y-1.5 pl-1">
                        {catActions.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic pl-2">
                            Tidak ada tindakan {catName.toLowerCase()} yang dipilih.
                          </p>
                        ) : (
                          catActions.map(action => (
                            <div
                              key={action.id}
                              className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                                action.isSelected
                                  ? 'bg-slate-50 border-slate-200'
                                  : 'bg-white border-slate-100 opacity-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 flex-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAction(currentDx.id, intervIdx, action.id)}
                                  className="text-slate-400 hover:text-teal-600 flex-shrink-0"
                                >
                                  {action.isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-teal-600" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                                <span className={`text-xs ${action.isSelected ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}`}>
                                  {action.description}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteAction(currentDx.id, intervIdx, action.id)}
                                className="text-slate-300 hover:text-rose-600 p-1 flex-shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Navigation to Next Step */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStage(3)}
              className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Diagnosis</span>
            </button>

            <button
              onClick={() => setActiveStage(5)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 px-5 py-2.5 rounded-xl shadow-md transition-all"
            >
              <span>Lanjut ke Tahap 5: Implementasi Keperawatan →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
