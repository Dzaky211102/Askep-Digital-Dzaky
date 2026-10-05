/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider, usePatients } from './context/PatientContext';
import { Header } from './components/Header';
import { StageNavigation } from './components/StageNavigation';
import { PatientBar } from './components/PatientBar';
import { SubStepNavigation } from './components/Pengkajian/SubStepNavigation';
import { CoverForm } from './components/Pengkajian/CoverForm';
import { IdentityForm } from './components/Pengkajian/IdentityForm';
import { HistoryAndGenogram } from './components/Pengkajian/HistoryAndGenogram';
import { DomainAssessmentForm } from './components/Pengkajian/DomainAssessmentForm';
import { PhysicalExamForm } from './components/Pengkajian/PhysicalExamForm';
import { DiagnosticsForm } from './components/Pengkajian/DiagnosticsForm';
import { TherapyForm } from './components/Pengkajian/TherapyForm';
import { AnalysisEngineView } from './components/CarePlan/AnalysisEngineView';
import { DiagnosisView } from './components/CarePlan/DiagnosisView';
import { Intervention3SView } from './components/CarePlan/Intervention3SView';
import { ImplementationView } from './components/CarePlan/ImplementationView';
import { EvaluationSOAPView } from './components/CarePlan/EvaluationSOAPView';
import { PatientListModal } from './components/PatientListModal';
import { CatalogBrowserModal } from './components/CatalogBrowserModal';
import { CalendarView } from './components/CalendarView';
import { PrintReportModal } from './components/PrintReportModal';
import { HelpDeploymentModal } from './components/HelpDeploymentModal';
import { AuthSyncModal } from './components/AuthSyncModal';
import { LoginGateView } from './components/Auth/LoginGateView';
import { AdminAllowlistModal } from './components/Admin/AdminAllowlistModal';
import { OldDataMigrationModal } from './components/Migration/OldDataMigrationModal';
import { ShieldCheck, HeartHandshake } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const {
    activeStage,
    currentFormStep,
    pendingMigrationCount,
    importOldLocalData,
    dismissMigration
  } = usePatients();

  // Modals state
  const [patientListModalOpen, setPatientListModalOpen] = useState(false);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Authentication Gateway: Show loading screen or Login Gate
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-300 font-mono">Memuat Sistem AsKep 3S Digital...</p>
        </div>
      </div>
    );
  }

  // BUG 1 Gateway: if not logged in with official NIM, only show LoginGateView
  if (!currentUser) {
    return <LoginGateView />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header with WITA digital clock & sync status */}
      <Header
        onOpenCatalog={() => setCatalogModalOpen(true)}
        onOpenCalendar={() => setCalendarModalOpen(true)}
        onOpenHelp={() => setHelpModalOpen(true)}
        onOpenPrint={() => setPrintModalOpen(true)}
        onOpenSyncModal={() => setSyncModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* Main 6-Stage Stepper Navigation */}
      <StageNavigation onOpenPrint={() => setPrintModalOpen(true)} />

      {/* Active Patient Bar & Quick Clinical Stats */}
      <PatientBar
        onOpenManagePatients={() => setPatientListModalOpen(true)}
        onOpenPrint={() => setPrintModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-6">
        {/* Stage 1: Pengkajian 13 Domain Doenges */}
        {activeStage === 1 && (
          <div className="space-y-4">
            <SubStepNavigation />
            {currentFormStep === 1 && <CoverForm />}
            {currentFormStep === 2 && <IdentityForm />}
            {currentFormStep === 3 && <HistoryAndGenogram />}
            {currentFormStep === 4 && <DomainAssessmentForm />}
            {currentFormStep === 5 && <PhysicalExamForm />}
            {currentFormStep === 6 && <DiagnosticsForm />}
            {currentFormStep === 7 && <TherapyForm />}
          </div>
        )}

        {/* Stage 2: Analisa Data (Rule Engine) */}
        {activeStage === 2 && <AnalysisEngineView />}

        {/* Stage 3: Diagnosis SDKI */}
        {activeStage === 3 && <DiagnosisView />}

        {/* Stage 4: Intervensi 3S (SLKI - SIKI) */}
        {activeStage === 4 && <Intervention3SView />}

        {/* Stage 5: Implementasi Keperawatan Shift WITA */}
        {activeStage === 5 && <ImplementationView />}

        {/* Stage 6: Evaluasi SOAP & Pencapaian SLKI */}
        {activeStage === 6 && <EvaluationSOAPView />}
      </main>

      {/* Footer Disclaimer & Legal */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <p className="font-bold text-white">
                AsKep 3S — Sistem Dokumentasi Keperawatan KMB Digital
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Model 13 Domain Doenges Terintegrasi Standar SDKI, SLKI, dan SIKI DPP PPNI.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 max-w-md">
            <div className="flex items-center justify-center md:justify-end gap-1.5 text-amber-300 font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Peringatan Keselamatan Klinis:</span>
            </div>
            <p>
              Aplikasi ini adalah media pembelajaran dan alat bantu pendokumentasian, bukan pengganti penilaian klinis profesional. Seluruh asuhan keperawatan wajib diverifikasi oleh pembimbing klinik (CI) atau perawat primer berwenang.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PatientListModal
        isOpen={patientListModalOpen}
        onClose={() => setPatientListModalOpen(false)}
      />

      <CatalogBrowserModal
        isOpen={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
      />

      <CalendarView
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
      />

      <PrintReportModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
      />

      <HelpDeploymentModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      <AuthSyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
      />

      <AdminAllowlistModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      {/* Migration Modal for Local Data */}
      <OldDataMigrationModal
        isOpen={pendingMigrationCount > 0}
        localCount={pendingMigrationCount}
        onConfirmImport={importOldLocalData}
        onDismiss={dismissMigration}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <MainAppContent />
      </PatientProvider>
    </AuthProvider>
  );
}
