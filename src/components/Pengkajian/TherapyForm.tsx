/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePatients } from '../../context/PatientContext';
import { MedicalTherapy } from '../../types/askep';
import { formatWitaDateInput } from '../../utils/witaTime';
import { Pill, Plus, Trash2, Calendar } from 'lucide-react';

export const TherapyForm: React.FC = () => {
  const { activePatient, savePatient, setActiveStage } = usePatients();

  if (!activePatient) return null;

  const therapies = activePatient.therapies || [];
  const todayWita = formatWitaDateInput(new Date());

  const handleAddTherapy = () => {
    const newTherapy: MedicalTherapy = {
      id: `th_${Date.now()}`,
      medicationName: '',
      dose: '',
      route: 'IV',
      frequency: 'Tiap 8 jam',
      indication: '',
      startDate: todayWita
    };

    savePatient({
      ...activePatient,
      therapies: [...therapies, newTherapy]
    });
  };

  const handleUpdateTherapy = (id: string, updates: Partial<MedicalTherapy>) => {
    const updated = therapies.map(t => (t.id === id ? { ...t, ...updates } : t));
    savePatient({
      ...activePatient,
      therapies: updated
    });
  };

  const handleDeleteTherapy = (id: string) => {
    savePatient({
      ...activePatient,
      therapies: therapies.filter(t => t.id !== id)
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            <span>Program Terapi Medis & Farmakologi</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar pengobatan kolaborasi dokter-perawat (nama, dosis, rute, frekuensi, dan indikasi klinis).
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddTherapy}
          className="flex items-center gap-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Terapi Obat</span>
        </button>
      </div>

      {/* Therapy Cards / Table */}
      <div className="space-y-3 text-xs">
        {therapies.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-xs">Belum ada program terapi medis yang ditambahkan.</p>
            <button
              type="button"
              onClick={handleAddTherapy}
              className="mt-3 text-xs text-teal-600 font-semibold hover:underline"
            >
              + Tambah Obat Pertama
            </button>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5 w-12 text-center">No</th>
                  <th className="p-2.5">Nama Obat</th>
                  <th className="p-2.5 w-32">Dosis</th>
                  <th className="p-2.5 w-28">Rute</th>
                  <th className="p-2.5 w-32">Frekuensi</th>
                  <th className="p-2.5">Indikasi Klinis</th>
                  <th className="p-2.5 w-28">Mulai (WITA)</th>
                  <th className="p-2.5 w-10 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {therapies.map((th, index) => (
                  <tr key={th.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 text-center font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={th.medicationName}
                        onChange={e => handleUpdateTherapy(th.id, { medicationName: e.target.value })}
                        placeholder="e.g. Ketorolac"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-900"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={th.dose}
                        onChange={e => handleUpdateTherapy(th.id, { dose: e.target.value })}
                        placeholder="e.g. 30 mg"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={th.route}
                        onChange={e => handleUpdateTherapy(th.id, { route: e.target.value as any })}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-medium"
                      >
                        <option value="IV">IV (Intravena)</option>
                        <option value="Oral">Oral</option>
                        <option value="IM">IM (Intramuskular)</option>
                        <option value="SC">SC (Subkutan)</option>
                        <option value="Topikal">Topikal</option>
                        <option value="Inhalasi">Inhalasi</option>
                        <option value="Suppositoria">Suppositoria</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={th.frequency}
                        onChange={e => handleUpdateTherapy(th.id, { frequency: e.target.value })}
                        placeholder="e.g. Tiap 8 jam"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={th.indication}
                        onChange={e => handleUpdateTherapy(th.id, { indication: e.target.value })}
                        placeholder="e.g. Analgetik pasca fraktur"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-slate-700"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="date"
                        value={th.startDate}
                        onChange={e => handleUpdateTherapy(th.id, { startDate: e.target.value })}
                        className="w-full px-1.5 py-1 bg-white border border-slate-200 rounded text-[11px] font-mono"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteTherapy(th.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Next Stage Navigation Banner */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
          <div>
            <h4 className="font-bold text-teal-900 text-sm">
              Pengkajian Selesai! Siap Melakukan Analisa Data?
            </h4>
            <p className="text-xs text-teal-700 mt-0.5">
              Klik tombol di samping untuk menjalankan rule engine otomatis yang akan memindai keluhan subjektif & objektif menjadi kandidat diagnosis SDKI.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveStage(2)}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all whitespace-nowrap"
          >
            Lanjut ke Tahap 2: Analisa Data →
          </button>
        </div>
      </div>
    </div>
  );
};
