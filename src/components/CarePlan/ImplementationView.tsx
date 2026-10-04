/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { ImplementationLog, ShiftType } from '../../types/askep';
import {
  formatWitaDateInput,
  formatWitaTimeInput,
  getCurrentShift,
  getShiftLabel
} from '../../utils/witaTime';
import {
  CheckSquare,
  Square,
  Clock,
  User,
  Filter,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const ImplementationView: React.FC = () => {
  const { activeCarePlan, saveCarePlan, activePatient, setActiveStage } = usePatients();
  const { currentUser } = useAuth();

  const [activeDateWita, setActiveDateWita] = useState<string>(formatWitaDateInput(new Date()));
  const [selectedShift, setSelectedShift] = useState<ShiftType>(getCurrentShift());
  const [filterPendingOnly, setFilterPendingOnly] = useState<boolean>(false);

  if (!activeCarePlan || !activePatient) return null;

  const diagnoses = activeCarePlan.diagnoses || [];
  const logs = activeCarePlan.implementations || [];
  const operatorName = currentUser?.displayName || 'Ners Mahasiswa';

  // Extract all active actions from diagnoses interventions
  interface ActionItem {
    diagnosisId: string;
    sdkCode: string;
    problem: string;
    sikiCode: string;
    sikiLabel: string;
    actionId: string;
    description: string;
    category: 'Observasi' | 'Terapeutik' | 'Edukasi' | 'Kolaborasi';
  }

  const allAvailableActions: ActionItem[] = [];
  diagnoses.forEach(dx => {
    dx.interventions.forEach(interv => {
      interv.actions.forEach(action => {
        if (action.isSelected) {
          allAvailableActions.push({
            diagnosisId: dx.id,
            sdkCode: dx.sdkCode,
            problem: dx.problem,
            sikiCode: interv.code,
            sikiLabel: interv.label,
            actionId: action.id,
            description: action.description,
            category: action.category
          });
        }
      });
    });
  });

  // Find log for given action on current date & shift
  const findLogForAction = (actionId: string) => {
    return logs.find(
      l => l.actionId === actionId && l.dateWita === activeDateWita && l.shift === selectedShift
    );
  };

  const handleToggleActionCompletion = (action: ActionItem) => {
    const existingLog = findLogForAction(action.actionId);

    if (existingLog) {
      // Toggle off / remove
      const updatedLogs = logs.filter(l => l.id !== existingLog.id);
      saveCarePlan({
        ...activeCarePlan,
        implementations: updatedLogs
      });
    } else {
      // Create new completed implementation log with auto WITA timestamp
      const now = new Date();
      const newLog: ImplementationLog = {
        id: `impl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        diagnosisId: action.diagnosisId,
        sikiCode: action.sikiCode,
        actionId: action.actionId,
        actionDescription: action.description,
        category: action.category,
        timestampWita: `${activeDateWita} ${formatWitaTimeInput(now)}:00 WITA`,
        dateWita: activeDateWita,
        timeWita: formatWitaTimeInput(now),
        shift: selectedShift,
        operatorName,
        patientResponse: '',
        isCompleted: true
      };

      saveCarePlan({
        ...activeCarePlan,
        implementations: [...logs, newLog]
      });
    }
  };

  const handleUpdateLogDetails = (logId: string, updates: Partial<ImplementationLog>) => {
    const updated = logs.map(l => (l.id === logId ? { ...l, ...updates } : l));
    saveCarePlan({
      ...activeCarePlan,
      implementations: updated
    });
  };

  const handleCheckAllInShift = () => {
    if (confirm(`Centang semua tindakan pada ${getShiftLabel(selectedShift)} tanggal ${activeDateWita}?`)) {
      const now = new Date();
      const currentShiftActionIds = new Set(
        logs
          .filter(l => l.dateWita === activeDateWita && l.shift === selectedShift)
          .map(l => l.actionId)
      );

      const newLogs: ImplementationLog[] = [...logs];

      allAvailableActions.forEach(action => {
        if (!currentShiftActionIds.has(action.actionId)) {
          newLogs.push({
            id: `impl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            diagnosisId: action.diagnosisId,
            sikiCode: action.sikiCode,
            actionId: action.actionId,
            actionDescription: action.description,
            category: action.category,
            timestampWita: `${activeDateWita} ${formatWitaTimeInput(now)}:00 WITA`,
            dateWita: activeDateWita,
            timeWita: formatWitaTimeInput(now),
            shift: selectedShift,
            operatorName,
            patientResponse: 'Tindakan selesai dilaksanakan sesuai prosedur.',
            isCompleted: true
          });
        }
      });

      saveCarePlan({
        ...activeCarePlan,
        implementations: newLogs
      });
    }
  };

  const displayedActions = allAvailableActions.filter(action => {
    if (!filterPendingOnly) return true;
    const log = findLogForAction(action.actionId);
    return !log || !log.isCompleted;
  });

  const completedInCurrentShiftCount = allAvailableActions.filter(action => {
    const log = findLogForAction(action.actionId);
    return log && log.isCompleted;
  }).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-teal-600" />
            <span>Tahap 5: Catatan Implementasi Keperawatan (Shift WITA)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mencatat tindakan SIKI yang terlaksana otomatis dengan cap waktu WITA (Asia/Makassar) dan nama ners pelaksana.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveStage(6)}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-xl transition-all shadow-xs self-start sm:self-auto"
        >
          <span>Lanjut ke Evaluasi (SOAP)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar: Tanggal WITA & Pilihan Shift Dinas */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker (WITA) */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-300">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-700">Tanggal:</span>
            <input
              type="date"
              value={activeDateWita}
              onChange={e => setActiveDateWita(e.target.value)}
              className="font-bold text-slate-900 bg-transparent focus:outline-hidden font-mono"
            />
          </div>

          {/* Shift Selectors */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-300">
            {(['pagi', 'sore', 'malam'] as const).map(shift => {
              const isActive = selectedShift === shift;
              return (
                <button
                  key={shift}
                  type="button"
                  onClick={() => setSelectedShift(shift)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs capitalize transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Shift {shift}
                </button>
              );
            })}
          </div>

          {/* Shift Time Info */}
          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            ({getShiftLabel(selectedShift)})
          </span>
        </div>

        {/* Bulk Action & Filters */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterPendingOnly(!filterPendingOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border font-semibold transition-all ${
              filterPendingOnly
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterPendingOnly ? 'Hanya Belum Dikerjakan' : 'Tampilkan Semua'}</span>
          </button>

          <button
            type="button"
            onClick={handleCheckAllInShift}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-2xs"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Centang Semua Shift Ini</span>
          </button>
        </div>
      </div>

      {/* Implementation Stats & Actions List */}
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between px-1">
          <p className="font-bold text-slate-800">
            Daftar Checklist Tindakan Intervensi ({completedInCurrentShiftCount}/{allAvailableActions.length} Selesai di Shift Ini):
          </p>
          <span className="text-teal-700 font-bold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Operator: {operatorName}
          </span>
        </div>

        {allAvailableActions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
            <p>Belum ada tindakan SIKI yang dicentang di tahap Intervensi.</p>
            <button
              onClick={() => setActiveStage(4)}
              className="mt-2 text-xs text-teal-600 font-semibold hover:underline"
            >
              ← Kembali ke Tahap 4 (Intervensi) untuk memilih tindakan
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedActions.map(action => {
              const log = findLogForAction(action.actionId);
              const isDone = !!(log && log.isCompleted);

              return (
                <div
                  key={action.actionId}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isDone
                      ? 'bg-teal-50/40 border-teal-300 ring-1 ring-teal-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleActionCompletion(action)}
                        className="mt-0.5 text-slate-400 hover:text-teal-600 flex-shrink-0"
                      >
                        {isDone ? (
                          <CheckSquare className="w-5 h-5 text-teal-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                              action.category === 'Observasi'
                                ? 'bg-sky-100 text-sky-800'
                                : action.category === 'Terapeutik'
                                ? 'bg-emerald-100 text-emerald-800'
                                : action.category === 'Edukasi'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {action.category}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {action.sikiCode}
                          </span>
                          <span className="font-mono text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded font-semibold">
                            {action.sdkCode} - {action.problem}
                          </span>
                        </div>

                        <p className={`text-xs ${isDone ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                          {action.description}
                        </p>
                      </div>
                    </div>

                    {isDone && log && (
                      <div className="flex items-center gap-1.5 text-[11px] text-teal-800 bg-white px-2.5 py-1 rounded-xl border border-teal-200 font-mono font-bold flex-shrink-0">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{log.timeWita} WITA</span>
                      </div>
                    )}
                  </div>

                  {/* Detail Expanded Form: Waktu WITA, Respon Pasien & Nama Operator */}
                  {isDone && log && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-teal-100 bg-white p-3 rounded-xl">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Jam Pelaksanaan (WITA):
                        </label>
                        <input
                          type="time"
                          value={log.timeWita}
                          onChange={e =>
                            handleUpdateLogDetails(log.id, {
                              timeWita: e.target.value,
                              timestampWita: `${log.dateWita} ${e.target.value}:00 WITA`
                            })
                          }
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Nama Perawat Pelaksana:
                        </label>
                        <input
                          type="text"
                          value={log.operatorName}
                          onChange={e => handleUpdateLogDetails(log.id, { operatorName: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Respon Klien / Hasil Tindakan:
                        </label>
                        <input
                          type="text"
                          value={log.patientResponse || ''}
                          onChange={e => handleUpdateLogDetails(log.id, { patientResponse: e.target.value })}
                          placeholder="e.g. Pasien kooperatif, nyeri menurun..."
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveStage(4)}
            className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Intervensi 3S</span>
          </button>

          <button
            onClick={() => setActiveStage(6)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            <span>Lanjut ke Tahap 6: Evaluasi SOAP →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
