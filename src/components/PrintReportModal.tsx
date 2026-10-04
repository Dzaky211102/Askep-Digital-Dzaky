/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { usePatients } from '../context/PatientContext';
import { Printer, X, Download } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose }) => {
  const { activePatient, carePlans } = usePatients();
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !activePatient) return null;

  const cp = carePlans[activePatient.id];
  const cover = activePatient.cover;
  const idt = activePatient.identity;
  const hist = activePatient.history;
  const dom = activePatient.domains;
  const ttv = dom.vitalSigns;
  const pain = dom.painAssessment;
  const morse = dom.morseFallScale;
  const pex = activePatient.physicalExam;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Action Header (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold">
              Format Laporan Asuhan Keperawatan Siap Cetak (KMB Doenges 3S)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          ref={reportRef}
          className="p-8 sm:p-12 overflow-y-auto space-y-8 text-slate-900 text-xs font-sans print:p-0 print:text-[10pt]"
        >
          {/* 1. COVER / HEADER DOKUMEN */}
          <div className="text-center border-b-2 border-slate-900 pb-6 space-y-2">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider">
              {cover.hospital || 'RUMAH SAKIT UMUM DAERAH'}
            </h1>
            <h2 className="text-sm font-bold uppercase text-slate-700">
              DOKUMENTASI ASUHAN KEPERAWATAN MEDIKAL BEDAH (KMB)
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl mx-auto italic font-medium">
              "{cover.title}"
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4 text-left border-t border-slate-200 mt-4 text-[11px]">
              <div>
                <p>Nama Mahasiswa: <strong>{cover.studentName}</strong></p>
                <p>NIM: <strong>{cover.studentNim}</strong></p>
                <p>Stase: <strong>{cover.stase}</strong></p>
              </div>
              <div>
                <p>Program Studi: <strong>{cover.studyProgram}</strong></p>
                <p>Institusi: <strong>{cover.university}</strong></p>
                <p>Tahun Akademik: <strong>{cover.academicYear}</strong></p>
              </div>
            </div>
          </div>

          {/* 2. IDENTITAS PASIEN */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm bg-slate-100 p-1.5 rounded border border-slate-300 uppercase">
              I. IDENTITAS KLIEN
            </h3>
            <table className="w-full text-left border-collapse border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-semibold w-40 bg-slate-50">Inisial / No. RM</td>
                  <td className="p-1.5">{activePatient.initials} ({activePatient.mrn})</td>
                  <td className="p-1.5 font-semibold w-40 bg-slate-50">Umur / JK</td>
                  <td className="p-1.5">{idt.age} Tahun / {idt.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-semibold bg-slate-50">Diagnosa Medis</td>
                  <td className="p-1.5">{idt.medicalDiagnosis}</td>
                  <td className="p-1.5 font-semibold bg-slate-50">Ruang Rawat / Bed</td>
                  <td className="p-1.5">{activePatient.room}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-1.5 font-semibold bg-slate-50">Tgl Masuk RS</td>
                  <td className="p-1.5">{idt.admissionDate}</td>
                  <td className="p-1.5 font-semibold bg-slate-50">Tgl Pengkajian (WITA)</td>
                  <td className="p-1.5">{idt.assessmentDate}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-semibold bg-slate-50">Alamat Domisili</td>
                  <td colSpan={3} className="p-1.5">{idt.address}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. RIWAYAT KESEHATAN */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm bg-slate-100 p-1.5 rounded border border-slate-300 uppercase">
              II. RIWAYAT KESEHATAN
            </h3>
            <div className="space-y-2 pl-2">
              <p><strong>1. Keluhan Utama Saat Masuk RS:</strong> {hist.chiefComplaintAdmission}</p>
              <p><strong>2. Keluhan Utama Saat Pengkajian:</strong> {hist.chiefComplaintAssessment}</p>
              <p><strong>3. Riwayat Penyakit Sekarang (RPS):</strong> {hist.presentIllnessHistory}</p>
              <p><strong>4. Riwayat Penyakit Dahulu (RPD):</strong> {hist.pastMedicalHistory}</p>
              <p><strong>5. Riwayat Penyakit Keluarga (RPK):</strong> {hist.familyMedicalHistory}</p>
              <p><strong>6. Catatan Genogram 3 Generasi:</strong> {hist.genogram.notes || 'Genogram 3 generasi tercatat lengkap.'}</p>
            </div>
          </div>

          {/* 4. TTV & 13 DOMAIN DOENGES */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm bg-slate-100 p-1.5 rounded border border-slate-300 uppercase">
              III. TANDA VITAL, SKALA NYERI & 13 DOMAIN DOENGES
            </h3>
            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2 border border-slate-200 rounded">
              <p>TD: <strong>{ttv.bloodPressureSystolic}/{ttv.bloodPressureDiastolic} mmHg</strong></p>
              <p>Nadi: <strong>{ttv.heartRate} x/mnt</strong></p>
              <p>RR: <strong>{ttv.respiratoryRate} x/mnt</strong></p>
              <p>Suhu: <strong>{ttv.temperature} °C</strong></p>
              <p>SpO2: <strong>{ttv.spO2} %</strong></p>
              <p>GCS: <strong>{ttv.gcsTotal} ({ttv.consciousness})</strong></p>
              <p>Nyeri PQRST: <strong>Skala {pain.severityScale}/10</strong></p>
              <p>Morse Scale: <strong>{morse.totalScore} ({morse.riskCategory})</strong></p>
            </div>

            <table className="w-full text-left border-collapse border border-slate-300 mt-2">
              <thead className="bg-slate-100 font-semibold border-b border-slate-300">
                <tr>
                  <th className="p-1.5 w-44">Domain Doenges</th>
                  <th className="p-1.5">Gejala Subjektif (DS)</th>
                  <th className="p-1.5">Tanda Objektif (DO)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-1.5 font-medium bg-slate-50">1. Neurosensori</td>
                  <td className="p-1.5">{dom.neurosensori.subjective || '-'}</td>
                  <td className="p-1.5">{dom.neurosensori.objective || '-'}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-medium bg-slate-50">2. Sirkulasi</td>
                  <td className="p-1.5">{dom.sirkulasi.subjective || '-'}</td>
                  <td className="p-1.5">{dom.sirkulasi.objective || '-'}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-medium bg-slate-50">3. Pernapasan</td>
                  <td className="p-1.5">{dom.pernapasan.subjective || '-'}</td>
                  <td className="p-1.5">{dom.pernapasan.objective || '-'}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-medium bg-slate-50">4. Nyeri / Kenyamanan</td>
                  <td className="p-1.5">{dom.nyeriKetidaknyamanan.subjective || '-'}</td>
                  <td className="p-1.5">{dom.nyeriKetidaknyamanan.objective || '-'}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-medium bg-slate-50">5. Makanan & Cairan</td>
                  <td className="p-1.5">{dom.makananCairan.subjective || '-'}</td>
                  <td className="p-1.5">{dom.makananCairan.objective || '-'}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-medium bg-slate-50">6. Aktivitas & Istirahat</td>
                  <td className="p-1.5">{dom.aktivitasIstirahat.subjective || '-'}</td>
                  <td className="p-1.5">{dom.aktivitasIstirahat.objective || '-'}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-medium bg-slate-50">7. Patient Safety</td>
                  <td className="p-1.5">{dom.patientSafety.subjective || '-'}</td>
                  <td className="p-1.5">{dom.patientSafety.objective || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. ANALISA DATA & DIAGNOSIS SDKI */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm bg-slate-100 p-1.5 rounded border border-slate-300 uppercase">
              IV. ANALISA DATA & DAFTAR DIAGNOSIS KEPERAWATAN (SDKI)
            </h3>
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-semibold border-b border-slate-300">
                <tr>
                  <th className="p-1.5 w-12 text-center">No</th>
                  <th className="p-1.5 w-60">Data Fokus (DS & DO)</th>
                  <th className="p-1.5 w-44">Etiologi</th>
                  <th className="p-1.5">Problem & Formulasi PES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(cp?.diagnoses || []).map((dx, i) => (
                  <tr key={dx.id}>
                    <td className="p-1.5 text-center font-bold">{i + 1}</td>
                    <td className="p-1.5 text-[10px]">
                      <p><strong>DS:</strong> {dx.dataFocus.subjective.join(', ')}</p>
                      <p><strong>DO:</strong> {dx.dataFocus.objective.join(', ')}</p>
                    </td>
                    <td className="p-1.5">{dx.etiology}</td>
                    <td className="p-1.5 font-medium">
                      <strong>{dx.problem} ({dx.sdkCode})</strong>
                      <p className="italic text-[10px] text-slate-600 mt-0.5">{dx.pesStatement}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 6. INTERVENSI 3S (SLKI - SIKI) */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm bg-slate-100 p-1.5 rounded border border-slate-300 uppercase">
              V. RENCANA ASUHAN KEPERAWATAN (SLKI & SIKI PPNI)
            </h3>
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-semibold border-b border-slate-300">
                <tr>
                  <th className="p-1.5 w-12 text-center">Dx</th>
                  <th className="p-1.5 w-52">Tujuan & Kriteria Hasil (SLKI)</th>
                  <th className="p-1.5">Intervensi Keperawatan (SIKI - O/T/E/K)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(cp?.diagnoses || []).map(dx => (
                  <tr key={dx.id}>
                    <td className="p-1.5 text-center font-bold">{dx.priority}</td>
                    <td className="p-1.5 text-[10px]">
                      <strong>{dx.outcome.label} ({dx.outcome.code})</strong>
                      <p>Ekspektasi: {dx.outcome.expectation} ({dx.outcome.timeframeHours} jam)</p>
                      <ul className="list-disc pl-3 mt-1">
                        {dx.outcome.indicators.map(ind => (
                          <li key={ind.id}>{ind.name} (Target: {ind.targetScale}/5)</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-1.5 text-[10px] space-y-1">
                      {dx.interventions.map(i => (
                        <div key={i.code}>
                          <strong>{i.label} ({i.code})</strong>
                          <ul className="list-disc pl-3 text-slate-700">
                            {i.actions.filter(a => a.isSelected).map(a => (
                              <li key={a.id}>[{a.category}] {a.description}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 7. IMPLEMENTASI & EVALUASI SOAP */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm bg-slate-100 p-1.5 rounded border border-slate-300 uppercase">
              VI. CATATAN IMPLEMENTASI (WITA) & EVALUASI SOAP
            </h3>
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-semibold border-b border-slate-300">
                <tr>
                  <th className="p-1.5 w-24">Tgl & Jam WITA</th>
                  <th className="p-1.5 w-20">Shift</th>
                  <th className="p-1.5">Implementasi Tindakan & Evaluasi Perkembangan (SOAP)</th>
                  <th className="p-1.5 w-28 text-center">Paraf / Nama Ners</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[10px]">
                {(cp?.implementations || []).slice(0, 8).map(imp => (
                  <tr key={imp.id}>
                    <td className="p-1.5 font-mono">{imp.dateWita} {imp.timeWita}</td>
                    <td className="p-1.5 uppercase font-bold">{imp.shift}</td>
                    <td className="p-1.5">
                      <p><strong>[{imp.category}]</strong> {imp.actionDescription}</p>
                      {imp.patientResponse && <p className="italic text-slate-600">Respon: {imp.patientResponse}</p>}
                    </td>
                    <td className="p-1.5 text-center">{imp.operatorName}</td>
                  </tr>
                ))}
                {(cp?.evaluations || []).map(ev => (
                  <tr key={ev.id} className="bg-teal-50/40">
                    <td className="p-1.5 font-mono">{ev.dateWita} {ev.timeWita}</td>
                    <td className="p-1.5 uppercase font-bold text-teal-800">SOAP ({ev.shift})</td>
                    <td className="p-1.5">
                      <p>{ev.subjective}</p>
                      <p>{ev.objective}</p>
                      <p><strong>A:</strong> {ev.analysis.outcomeStatus} ({ev.analysis.notes})</p>
                      <p><strong>P:</strong> {ev.planning.action} - {ev.planning.details}</p>
                    </td>
                    <td className="p-1.5 text-center font-bold">{ev.operatorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature Block */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs">
            <div>
              <p>Mengetahui,</p>
              <p className="font-semibold">Pembimbing Klinik / CI Ruangan</p>
              <div className="h-16" />
              <p className="font-bold underline">( .................................................... )</p>
              <p className="text-[10px] text-slate-500">NIP / NIDN.</p>
            </div>

            <div>
              <p>Samarinda, WITA</p>
              <p className="font-semibold">Mahasiswa Profesi Ners</p>
              <div className="h-16" />
              <p className="font-bold underline">( {cover.studentName} )</p>
              <p className="text-[10px] text-slate-500">NIM. {cover.studentNim}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
