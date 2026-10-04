/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePatients, AskepStage } from '../context/PatientContext';
import {
  ClipboardList,
  Cpu,
  Stethoscope,
  HeartHandshake,
  CheckSquare,
  FileCheck,
  ChevronRight
} from 'lucide-react';

interface StageNavigationProps {
  onOpenPrint?: () => void;
}

export const StageNavigation: React.FC<StageNavigationProps> = ({ onOpenPrint }) => {
  const { activeStage, setActiveStage, activePatient, activeCarePlan } = usePatients();

  const stages: { stage: AskepStage; label: string; sub: string; icon: React.FC<any>; count?: number }[] = [
    {
      stage: 1,
      label: '1. Pengkajian',
      sub: '13 Domain Doenges & TTV',
      icon: ClipboardList
    },
    {
      stage: 2,
      label: '2. Analisa Data',
      sub: 'Auto Rule Engine DS/DO',
      icon: Cpu,
      count: activeCarePlan?.candidates?.length || 0
    },
    {
      stage: 3,
      label: '3. Diagnosis SDKI',
      sub: 'Formulasi PES Standar',
      icon: Stethoscope,
      count: activeCarePlan?.diagnoses?.length || 0
    },
    {
      stage: 4,
      label: '4. Intervensi 3S',
      sub: 'SLKI & SIKI PPNI',
      icon: HeartHandshake,
      count: activeCarePlan?.diagnoses?.reduce((acc, d) => acc + d.interventions.length, 0) || 0
    },
    {
      stage: 5,
      label: '5. Implementasi',
      sub: 'Catatan Shift WITA',
      icon: CheckSquare,
      count: activeCarePlan?.implementations?.length || 0
    },
    {
      stage: 6,
      label: '6. Evaluasi SOAP',
      sub: 'Penilaian Indikator SLKI',
      icon: FileCheck,
      count: activeCarePlan?.evaluations?.length || 0
    }
  ];

  if (!activePatient) return null;

  return (
    <div className="bg-white border-b border-slate-200 px-3 py-2 sticky top-[72px] z-30 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-1">
        <div className="flex items-center gap-1 sm:gap-2 flex-nowrap min-w-max">
          {stages.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeStage === item.stage;
            const isCompleted = (item.stage < activeStage) || (item.count !== undefined && item.count > 0);

            return (
              <React.Fragment key={item.stage}>
                <button
                  onClick={() => setActiveStage(item.stage)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all relative ${
                    isActive
                      ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-600/25 ring-2 ring-teal-600/20'
                      : isCompleted
                      ? 'bg-teal-50/70 text-slate-800 hover:bg-teal-100/70 border border-teal-200/60'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg flex items-center justify-center ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isCompleted
                        ? 'bg-teal-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive
                              ? 'bg-white text-teal-800'
                              : 'bg-teal-600 text-white'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[10px] truncate max-w-[120px] ${
                        isActive ? 'text-teal-100' : 'text-slate-500'
                      }`}
                    >
                      {item.sub}
                    </p>
                  </div>
                </button>

                {idx < stages.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
