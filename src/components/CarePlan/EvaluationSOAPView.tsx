/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { EvaluationSoap, ShiftType } from '../../types/askep';
import {
  formatWitaDateInput,
  formatWitaTimeInput,
  getCurrentShift,
  getShiftLabel
} from '../../utils/witaTime';
import {
  FileCheck,
  Plus,
  Trash2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Clock,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

export const EvaluationSOAPView: React.FC = () => {
  const { activeCarePlan, saveCarePlan, activePatient, exportSelectedToExcel } = usePatients();
  const { currentUser } = useAuth();

  const [selectedDxId, setSelectedDxId] = useState<string>('');
  const [activeDateWita, setActiveDateWita] = useState<string>(formatWitaDateInput(new Date()));
  const [selectedShift, setSelectedShift] = useState<ShiftType>(getCurrentShift());

  if (!activeCarePlan || !activePatient) return null;

  const diagnoses = activeCarePlan.diagnoses || [];
  const currentDx = diagnoses.find(d => d.id === selectedDxId) || diagnoses[0] || null;
  const evaluations = activeCarePlan.evaluations || [];
  const ttv = activePatient.domains.vitalSigns;
  const pain = activePatient.domains.painAssessment;
  const operatorName = currentUser?.displayName || 'Ners Mahasiswa';

  // Create new SOAP entry pre-filled from current patient clinical state
  const handleCreateNewSoap = () => {
    if (!currentDx) return;

    const now = new Date();
    const prefillS = `S: Pasien mengeluh rasa tidak nyaman atau nyeri berkurang, skala nyeri saat ini terukur ${pain.severityScale}/10. Pasien merasa lebih tenang setelah istirahat.`;
    const prefillO = `O: Keadaan umum sedang, kesadaran Compos Mentis, TD: ${ttv.bloodPressureSystolic}/${ttv.bloodPressureDiastolic} mmHg, Nadi: ${ttv.heartRate} x/mnt, RR: ${ttv.respiratoryRate} x/mnt, Suhu: ${ttv.temperature} °C, SpO2: ${ttv.spO2}%.`;

    const ratings = currentDx.outcome.indicators.map(ind => ({
      indicatorId: ind.id,
      name: ind.name,
      initialScore: ind.currentScale || 2,
      targetScore: ind.targetScale || 4,
      evaluatedScore: ind.targetScale || 4
    }));

    const newEval: EvaluationSoap = {
      id: `eval_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      diagnosisId: currentDx.id,
      sdkCode: currentDx.sdkCode,
      problem: currentDx.problem,
      dateWita: activeDateWita,
      timeWita: formatWitaTimeInput(now),
      shift: selectedShift,
      operatorName,
      subjective: prefillS,
      objective: prefillO,
      painScaleCurrent: pain.severityScale,
      analysis: {
        ratings,
        outcomeStatus: 'Tercapai Sebagian',
        notes: `Kriteria hasil luaran ${currentDx.outcome.label} menunjukkan perbaikan respon klinis.`
      },
      planning: {
        action: 'Lanjutkan intervensi',
        details: 'Lanjutkan seluruh intervensi dan tindakan keperawatan pada shift berikutnya.'
      }
    };

    saveCarePlan({
      ...activeCarePlan,
      evaluations: [newEval, ...evaluations]
    });
  };

  const handleUpdateSoap = (id: string, updates: Partial<EvaluationSoap>) => {
    const updated = evaluations.map(e => (e.id === id ? { ...e, ...updates } : e));
    saveCarePlan({
      ...activeCarePlan,
      evaluations: updated
    });
  };

  const handleDeleteSoap = (id: string) => {
    saveCarePlan({
      ...activeCarePlan,
      evaluations: evaluations.filter(e => e.id !== id)
    });
  };

  // Recalculate achievement status automatically from indicator ratings
  const handleUpdateIndicatorScore = (evalId: string, indId: string, score: number) => {
    const ev = evaluations.find(e => e.id === evalId);
    if (!ev) return;

    const updatedRatings = ev.analysis.ratings.map(r =>
      r.indicatorId === indId ? { ...r, evaluatedScore: score } : r
    );

    const allReachedTarget = updatedRatings.every(r => r.evaluatedScore >= r.targetScore);
    const anyImproved = updatedRatings.some(r => r.evaluatedScore > r.initialScore);

    let status: 'Tujuan Tercapai' | 'Tercapai Sebagian' | 'Belum Tercapai' = 'Belum Tercapai';
    if (allReachedTarget) status = 'Tujuan Tercapai';
    else if (anyImproved) status = 'Tercapai Sebagian';

    handleUpdateSoap(evalId, {
      analysis: {
        ...ev.analysis,
        ratings: updatedRatings,
        outcomeStatus: status
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-teal-600" />
            <span>Tahap 6: Catatan Perkembangan & Evaluasi (SOAP)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi pencapaian luaran SLKI (skala 1–5), analisis tujuan tercapai/sebagian, dan rencana tindak lanjut per shift.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportSelectedToExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Lengkap (.xlsx)</span>
          </button>
        </div>
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

      {/* Action to create new SOAP */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-300">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-700">Tanggal WITA:</span>
            <input
              type="date"
              value={activeDateWita}
              onChange={e => setActiveDateWita(e.target.value)}
              className="font-bold text-slate-900 bg-transparent focus:outline-hidden font-mono"
            />
          </div>

          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-300">
            {(['pagi', 'sore', 'malam'] as const).map(shift => {
              const isActive = selectedShift === shift;
              return (
                <button
                  key={shift}
                  type="button"
                  onClick={() => setSelectedShift(shift)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs capitalize ${
                    isActive ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Shift {shift}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateNewSoap}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Catatan SOAP Baru ({currentDx?.sdkCode})</span>
        </button>
      </div>

      {/* SOAP List for Current Diagnosis */}
      <div className="space-y-4 text-xs">
        {evaluations.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
            <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p>Belum ada catatan evaluasi SOAP yang dibuat.</p>
            <button
              onClick={handleCreateNewSoap}
              className="mt-2 text-xs text-teal-600 font-semibold hover:underline"
            >
              + Buat Evaluasi SOAP Sekarang
            </button>
          </div>
        ) : (
          evaluations.map(ev => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs"
            >
              {/* Header: Date, Shift, SDK Code, Evaluator, Status Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {ev.sdkCode}
                  </span>
                  <strong className="text-slate-900 text-sm">{ev.problem}</strong>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({ev.dateWita} {ev.timeWita} WITA • Shift {ev.shift.toUpperCase()})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold px-3 py-1 rounded-full text-xs border ${
                      ev.analysis.outcomeStatus === 'Tujuan Tercapai'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : ev.analysis.outcomeStatus === 'Tercapai Sebagian'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {ev.analysis.outcomeStatus}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteSoap(ev.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* S & O Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    S - Data Subjektif Pasien (WITA):
                  </label>
                  <textarea
                    value={ev.subjective}
                    onChange={e => handleUpdateSoap(ev.id, { subjective: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    O - Data Objektif & TTV (WITA):
                  </label>
                  <textarea
                    value={ev.objective}
                    onChange={e => handleUpdateSoap(ev.id, { objective: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              {/* A: SLKI Indicator Ratings & Auto Status */}
              <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-teal-950 text-xs flex items-center gap-1.5 uppercase">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    <span>A - Analisis Status Luaran SLKI (Penilaian Indikator 1 – 5):</span>
                  </h5>
                  <span className="text-[11px] font-semibold text-teal-800">
                    Status: <strong>{ev.analysis.outcomeStatus}</strong>
                  </span>
                </div>

                <div className="border border-teal-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-teal-100/60 text-teal-900 font-semibold border-b border-teal-200">
                      <tr>
                        <th className="p-2">Indikator Luaran</th>
                        <th className="p-2 w-32 text-center">Skor Awal</th>
                        <th className="p-2 w-32 text-center">Target Skor</th>
                        <th className="p-2 w-44 text-center">Skor Hasil Evaluasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ev.analysis.ratings.map(r => (
                        <tr key={r.indicatorId} className="hover:bg-slate-50">
                          <td className="p-2 font-medium text-slate-800">{r.name}</td>
                          <td className="p-2 text-center font-mono font-bold text-slate-500">
                            {r.initialScore}/5
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-teal-700">
                            {r.targetScore}/5
                          </td>
                          <td className="p-2 text-center">
                            <select
                              value={r.evaluatedScore}
                              onChange={e =>
                                handleUpdateIndicatorScore(
                                  ev.id,
                                  r.indicatorId,
                                  Number(e.target.value)
                                )
                              }
                              className="px-2 py-1 bg-teal-50 border border-teal-300 font-bold text-teal-900 rounded-lg text-xs"
                            >
                              {[1, 2, 3, 4, 5].map(sc => (
                                <option key={sc} value={sc}>
                                  Skala {sc} / 5
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Catatan Analisis Perkembangan:
                  </label>
                  <input
                    type="text"
                    value={ev.analysis.notes}
                    onChange={e =>
                      handleUpdateSoap(ev.id, {
                        analysis: { ...ev.analysis, notes: e.target.value }
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* P: Planning */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    P - Tindak Lanjut Rencana:
                  </label>
                  <select
                    value={ev.planning.action}
                    onChange={e =>
                      handleUpdateSoap(ev.id, {
                        planning: { ...ev.planning, action: e.target.value as any }
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-xs"
                  >
                    <option value="Lanjutkan intervensi">Lanjutkan intervensi</option>
                    <option value="Modifikasi intervensi">Modifikasi intervensi</option>
                    <option value="Hentikan intervensi">Hentikan intervensi</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Uraian Rencana Kerja (Planning):
                  </label>
                  <input
                    type="text"
                    value={ev.planning.details}
                    onChange={e =>
                      handleUpdateSoap(ev.id, {
                        planning: { ...ev.planning, details: e.target.value }
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>

              {/* Evaluator Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Perawat Penilai: <strong>{ev.operatorName}</strong></span>
                <span className="font-mono">Tervalidasi Asia/Makassar (WITA)</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
