/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePatients } from '../../context/PatientContext';
import {
  FileText,
  User,
  History,
  Activity,
  UserCheck,
  FlaskConical,
  Pill,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const PENGKAJIAN_STEPS = [
  { step: 1, label: 'Sampul & Meta', icon: FileText },
  { step: 2, label: 'Identitas', icon: User },
  { step: 3, label: 'Riwayat & Genogram', icon: History },
  { step: 4, label: '13 Domain & TTV', icon: Activity },
  { step: 5, label: 'Head-to-Toe', icon: UserCheck },
  { step: 6, label: 'Penunjang (Lab & Rad)', icon: FlaskConical },
  { step: 7, label: 'Program Terapi', icon: Pill }
];

export const SubStepNavigation: React.FC = () => {
  const { currentFormStep, setCurrentFormStep, setActiveStage } = usePatients();

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Step buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {PENGKAJIAN_STEPS.map(item => {
            const Icon = item.icon;
            const isActive = currentFormStep === item.step;
            const isDone = currentFormStep > item.step;

            return (
              <button
                key={item.step}
                onClick={() => setCurrentFormStep(item.step)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : isDone
                    ? 'bg-white text-teal-800 border border-teal-200 hover:bg-teal-50'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isDone ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{item.step}. {item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Prev / Next controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {currentFormStep > 1 && (
            <button
              onClick={() => setCurrentFormStep(currentFormStep - 1)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>
          )}

          {currentFormStep < 7 ? (
            <button
              onClick={() => setCurrentFormStep(currentFormStep + 1)}
              className="flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 px-3.5 py-1.5 rounded-xl shadow-xs"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveStage(2)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 px-4 py-1.5 rounded-xl shadow-sm animate-pulse"
            >
              <span>Lanjut ke Analisa Data</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
