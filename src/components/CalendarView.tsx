/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePatients } from '../context/PatientContext';
import { formatWitaDateInput, getWitaDate } from '../utils/witaTime';
import {
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileCheck,
  User,
  Activity
} from 'lucide-react';

interface CalendarViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ isOpen, onClose }) => {
  const { patients, carePlans, activePatient, setActivePatientId } = usePatients();

  const nowWita = getWitaDate(new Date());
  const [currentYear, setCurrentYear] = useState<number>(nowWita.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(nowWita.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatWitaDateInput(new Date()));
  const [filterPatientId, setFilterPatientId] = useState<string>('all');

  if (!isOpen) return null;

  // Calendar month math
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Aggregate events (Implementations and Evaluations) for each day
  const eventsByDate: Record<string, { implCount: number; soapCount: number; patients: string[] }> = {};

  patients.forEach(p => {
    if (filterPatientId !== 'all' && p.id !== filterPatientId) return;

    const cp = carePlans[p.id];
    if (cp) {
      cp.implementations?.forEach(imp => {
        if (!eventsByDate[imp.dateWita]) {
          eventsByDate[imp.dateWita] = { implCount: 0, soapCount: 0, patients: [] };
        }
        eventsByDate[imp.dateWita].implCount += 1;
        if (!eventsByDate[imp.dateWita].patients.includes(p.initials)) {
          eventsByDate[imp.dateWita].patients.push(p.initials);
        }
      });

      cp.evaluations?.forEach(ev => {
        if (!eventsByDate[ev.dateWita]) {
          eventsByDate[ev.dateWita] = { implCount: 0, soapCount: 0, patients: [] };
        }
        eventsByDate[ev.dateWita].soapCount += 1;
        if (!eventsByDate[ev.dateWita].patients.includes(p.initials)) {
          eventsByDate[ev.dateWita].patients.push(p.initials);
        }
      });
    }
  });

  // Selected day items
  const dayImplementations: { patientName: string; mrn: string; item: any }[] = [];
  const dayEvaluations: { patientName: string; mrn: string; item: any }[] = [];

  patients.forEach(p => {
    if (filterPatientId !== 'all' && p.id !== filterPatientId) return;
    const cp = carePlans[p.id];
    if (cp) {
      cp.implementations?.forEach(imp => {
        if (imp.dateWita === selectedDateStr) {
          dayImplementations.push({ patientName: p.initials, mrn: p.mrn, item: imp });
        }
      });
      cp.evaluations?.forEach(ev => {
        if (ev.dateWita === selectedDateStr) {
          dayEvaluations.push({ patientName: p.initials, mrn: p.mrn, item: ev });
        }
      });
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-400" />
              <span>Kalender Jadwal Shift & Catatan SOAP (WITA)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Zona Waktu Asia/Makassar (UTC+8) • Klik tanggal untuk meninjau riwayat implementasi dan evaluasi pasien.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Month Navigation & Patient Filter */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="font-bold text-sm text-slate-800 min-w-[150px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Filter Pasien:</span>
            <select
              value={filterPatientId}
              onChange={e => setFilterPatientId(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium"
            >
              <option value="all">Semua Pasien ({patients.length})</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.initials} ({p.mrn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Body: 2 Columns (Calendar Grid + Selected Day Details) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left: Monthly Calendar (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 space-y-3">
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-[11px] mb-2">
              <span className="text-rose-500">Min</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span className="text-teal-600">Sab</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty offset days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty_${i}`} className="h-16 rounded-xl bg-slate-50/50" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const mStr = String(currentMonth + 1).padStart(2, '0');
                const dStr = String(dayNum).padStart(2, '0');
                const dateKey = `${currentYear}-${mStr}-${dStr}`;
                const event = eventsByDate[dateKey];
                const isSelected = selectedDateStr === dateKey;
                const isToday = formatWitaDateInput(new Date()) === dateKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedDateStr(dateKey)}
                    className={`h-16 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20 shadow-xs'
                        : isToday
                        ? 'border-teal-300 bg-teal-50/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? 'text-teal-900'
                            : isToday
                            ? 'text-teal-600 font-extrabold'
                            : 'text-slate-700'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-teal-700 bg-teal-100 px-1 rounded">
                          WITA
                        </span>
                      )}
                    </div>

                    {event && (
                      <div className="space-y-0.5">
                        {event.implCount > 0 && (
                          <div className="text-[9px] bg-teal-600 text-white font-bold px-1 rounded truncate">
                            {event.implCount} Impl
                          </div>
                        )}
                        {event.soapCount > 0 && (
                          <div className="text-[9px] bg-sky-600 text-white font-bold px-1 rounded truncate">
                            {event.soapCount} SOAP
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Day Timeline & Details (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-slate-50 space-y-4 overflow-y-auto">
            <div className="border-b border-slate-200 pb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Catatan Harian Pasien (WITA):
              </span>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <CalendarIcon className="w-4 h-4 text-teal-600" />
                <span>{selectedDateStr}</span>
              </h3>
            </div>

            {/* Implementation Logs for Selected Day */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 flex items-center justify-between">
                <span>Implementasi Shift ({dayImplementations.length})</span>
              </h4>

              {dayImplementations.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">
                  Tidak ada catatan implementasi pada tanggal ini.
                </p>
              ) : (
                <div className="space-y-2">
                  {dayImplementations.map(({ patientName, mrn, item }, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {patientName} <span className="font-mono text-[10px] text-slate-400">({mrn})</span>
                        </span>
                        <span className="font-mono text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          {item.timeWita} WITA ({item.shift})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700">{item.actionDescription}</p>
                      {item.patientResponse && (
                        <p className="text-[10px] text-slate-500 italic">
                          Respon: "{item.patientResponse}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SOAP Evaluations for Selected Day */}
            <div className="space-y-2 text-xs pt-3 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 flex items-center justify-between">
                <span>Evaluasi SOAP ({dayEvaluations.length})</span>
              </h4>

              {dayEvaluations.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">
                  Tidak ada evaluasi SOAP pada tanggal ini.
                </p>
              ) : (
                <div className="space-y-2">
                  {dayEvaluations.map(({ patientName, mrn, item }, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {patientName} • <span className="font-mono text-teal-700">{item.sdkCode}</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-teal-100 text-teal-800">
                          {item.analysis.outcomeStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 line-clamp-2">{item.subjective}</p>
                      <p className="text-[11px] text-slate-700 line-clamp-2">{item.objective}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Planning: <strong>{item.planning.action}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl"
          >
            Tutup Kalender
          </button>
        </div>
      </div>
    </div>
  );
};
