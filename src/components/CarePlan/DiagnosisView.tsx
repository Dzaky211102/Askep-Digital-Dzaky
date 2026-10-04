/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePatients } from '../../context/PatientContext';
import { Stethoscope, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Trash2, Edit3 } from 'lucide-react';

export const DiagnosisView: React.FC = () => {
  const { activeCarePlan, saveCarePlan, setActiveStage } = usePatients();

  if (!activeCarePlan) return null;

  const diagnoses = activeCarePlan.diagnoses || [];

  const handleUpdatePes = (id: string, newPes: string) => {
    const updated = diagnoses.map(d => (d.id === id ? { ...d, pesStatement: newPes } : d));
    saveCarePlan({
      ...activeCarePlan,
      diagnoses: updated
    });
  };

  const handleMovePriority = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= diagnoses.length) return;

    const reordered = [...diagnoses];
    const temp = reordered[index];
    reordered[index] = reordered[newIdx];
    reordered[newIdx] = temp;

    reordered.forEach((d, i) => {
      d.priority = i + 1;
    });

    saveCarePlan({
      ...activeCarePlan,
      diagnoses: reordered
    });
  };

  const handleDeleteDiagnosis = (id: string) => {
    const updated = diagnoses.filter(d => d.id !== id);
    updated.forEach((d, i) => {
      d.priority = i + 1;
    });
    saveCarePlan({
      ...activeCarePlan,
      diagnoses: updated
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <span>Tahap 3: Daftar Diagnosis Keperawatan (Standar SDKI PPNI)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Format resmi PES (Problem b.d Etiologi d.d Gejala/Tanda) untuk diagnosis aktual dan dibuktikan dengan faktor risiko untuk diagnosis risiko.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveStage(4)}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-xl transition-all shadow-xs self-start sm:self-auto"
        >
          <span>Lanjut ke Intervensi (SLKI-SIKI)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {diagnoses.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-xs">Belum ada diagnosis yang diterapkan.</p>
          <button
            onClick={() => setActiveStage(2)}
            className="mt-3 text-xs text-teal-600 font-semibold hover:underline"
          >
            ← Kembali ke Analisa Data untuk memilih diagnosis
          </button>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Formatted Table Analisa Data & Diagnosa */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-16 text-center">Prioritas</th>
                  <th className="p-3 w-72">Data Fokus (DS & DO)</th>
                  <th className="p-3 w-48">Etiologi / Penyebab</th>
                  <th className="p-3">Problem (SDKI) & Pernyataan Lengkap (PES)</th>
                  <th className="p-3 w-20 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {diagnoses.map((dx, index) => (
                  <tr key={dx.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Prioritas & Reorder */}
                    <td className="p-3 text-center align-top">
                      <div className="flex flex-col items-center gap-1">
                        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-900 font-bold flex items-center justify-center text-xs">
                          {dx.priority}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMovePriority(index, 'up')}
                            disabled={index === 0}
                            className="p-0.5 text-slate-400 hover:text-teal-600 disabled:opacity-20"
                            title="Naik"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMovePriority(index, 'down')}
                            disabled={index === diagnoses.length - 1}
                            className="p-0.5 text-slate-400 hover:text-teal-600 disabled:opacity-20"
                            title="Turun"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Data Fokus */}
                    <td className="p-3 align-top text-[11px] space-y-1.5 bg-slate-50/50">
                      <div>
                        <strong className="text-teal-800">Data Subjektif (DS):</strong>
                        <ul className="list-disc pl-4 text-slate-700 mt-0.5">
                          {dx.dataFocus.subjective.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-slate-800">Data Objektif (DO):</strong>
                        <ul className="list-disc pl-4 text-slate-700 mt-0.5">
                          {dx.dataFocus.objective.map((o, i) => (
                            <li key={i}>{o}</li>
                          ))}
                        </ul>
                      </div>
                    </td>

                    {/* Etiologi */}
                    <td className="p-3 align-top font-medium text-slate-800 text-[11px]">
                      {dx.etiology}
                    </td>

                    {/* Problem & PES */}
                    <td className="p-3 align-top space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {dx.sdkCode}
                        </span>
                        <strong className="text-slate-900 text-xs">{dx.problem}</strong>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                            dx.type === 'aktual'
                              ? 'bg-rose-100 text-rose-800'
                              : dx.type === 'risiko'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {dx.type}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                          Kalimat PES Lengkap (Dapat Diedit):
                        </label>
                        <textarea
                          value={dx.pesStatement}
                          onChange={e => handleUpdatePes(dx.id, e.target.value)}
                          rows={2}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                        />
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="p-3 align-top text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteDiagnosis(dx.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Hapus Diagnosis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setActiveStage(2)}
              className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Analisa Data</span>
            </button>

            <button
              onClick={() => setActiveStage(4)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 px-5 py-2.5 rounded-xl shadow-md transition-all"
            >
              <span>Lanjut ke Tahap 4: Intervensi 3S →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
