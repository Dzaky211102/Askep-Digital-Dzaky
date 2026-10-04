/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Patient, CarePlan } from '../types/askep';
import { formatWitaDateInput } from '../utils/witaTime';

/**
 * Clean sheet name to adhere to Excel's 31-character limit and valid chars.
 */
function sanitizeSheetName(name: string, fallback: string): string {
  const sanitized = name.replace(/[:\\/?*[\]]/g, '').trim();
  const truncated = sanitized.substring(0, 31);
  return truncated.length > 0 ? truncated : fallback.substring(0, 31);
}

/**
 * Auto-fit column widths based on cell content lengths.
 */
function autoFitColumns(rows: any[][]): XLSX.ColInfo[] {
  const colLengths: number[] = [];
  rows.forEach(row => {
    row.forEach((cell, colIndex) => {
      const cellLen = cell ? String(cell).length : 0;
      colLengths[colIndex] = Math.max(colLengths[colIndex] || 10, cellLen + 3);
    });
  });
  return colLengths.map(len => ({ wch: Math.min(len, 60) }));
}

/**
 * Generates and downloads a multi-sheet formatted .xlsx workbook for selected patients.
 */
export function exportPatientsToExcel(patients: Patient[], carePlansMap: Record<string, CarePlan>) {
  if (patients.length === 0) return;

  const workbook = XLSX.utils.book_new();

  // 1. Sheet: Ringkasan Pasien
  const summaryHeaders = [
    'No',
    'Inisial',
    'No. RM',
    'Ruangan',
    'Dx Medis',
    'Status',
    'Tgl Masuk (WITA)',
    'Tgl Pengkajian (WITA)',
    'TD (mmHg)',
    'Nadi (x/m)',
    'RR (x/m)',
    'Suhu (°C)',
    'Skala Nyeri',
    'Skor Morse',
    'Kategori Jatuh',
    'Jml Diagnosis 3S',
    'Jml Implementasi'
  ];

  const summaryData: any[][] = [summaryHeaders];
  patients.forEach((p, idx) => {
    const cp = carePlansMap[p.id];
    summaryData.push([
      idx + 1,
      p.initials,
      p.mrn,
      p.room || '-',
      p.medicalDiagnosis || '-',
      p.status.toUpperCase(),
      p.admissionDate || '-',
      p.assessmentDate || '-',
      `${p.domains.vitalSigns.bloodPressureSystolic}/${p.domains.vitalSigns.bloodPressureDiastolic}`,
      p.domains.vitalSigns.heartRate,
      p.domains.vitalSigns.respiratoryRate,
      p.domains.vitalSigns.temperature,
      p.domains.painAssessment.severityScale,
      p.domains.morseFallScale.totalScore,
      p.domains.morseFallScale.riskCategory,
      cp?.diagnoses?.length || 0,
      cp?.implementations?.length || 0
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = autoFitColumns(summaryData);
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Ringkasan Pasien');

  // If single patient or a few patients, export dedicated comprehensive sheets
  patients.forEach(p => {
    const cp = carePlansMap[p.id];
    const prefix = p.initials.replace(/[^a-zA-Z0-9]/g, '');

    // Sheet: Identitas & Riwayat
    const identData: any[][] = [
      ['ASUHAN KEPERAWATAN KMB - PENGKAJIAN IDENTITAS & RIWAYAT'],
      ['Inisial Pasien', p.initials, 'No. Rekam Medis', p.mrn],
      ['Umur', `${p.identity.age} Tahun`, 'Jenis Kelamin', p.identity.gender === 'L' ? 'Laki-laki' : 'Perempuan'],
      ['Ruangan / RS', `${p.room} / ${p.cover.hospital}`],
      ['Diagnosa Medis', p.medicalDiagnosis],
      ['Tanggal Masuk RS', p.admissionDate, 'Tanggal Pengkajian', p.assessmentDate],
      ['Status Perkawinan', p.identity.maritalStatus, 'Agama', p.identity.religion],
      ['Pekerjaan', p.identity.occupation, 'Suku', p.identity.ethnicity],
      ['Alamat Lengkap', p.identity.address],
      [],
      ['RIWAYAT KESEHATAN'],
      ['Keluhan Utama Saat Masuk', p.history.chiefComplaintAdmission],
      ['Keluhan Utama Saat Pengkajian', p.history.chiefComplaintAssessment],
      ['Riwayat Penyakit Sekarang (RPS)', p.history.presentIllnessHistory],
      ['Riwayat Penyakit Dahulu (RPD)', p.history.pastMedicalHistory],
      ['Riwayat Penyakit Keluarga (RPK)', p.history.familyMedicalHistory],
      ['Catatan Genogram', p.history.genogram.notes || 'Genogram 3 generasi tercatat.']
    ];
    const wsIdent = XLSX.utils.aoa_to_sheet(identData);
    wsIdent['!cols'] = autoFitColumns(identData);
    XLSX.utils.book_append_sheet(workbook, wsIdent, sanitizeSheetName(`${prefix}_Identitas`, 'Identitas'));

    // Sheet: 13 Domain Doenges
    const domainData: any[][] = [
      ['PENGKAJIAN 13 DOMAIN MODEL DOENGES & TTV'],
      ['Parameter TTV', 'Nilai', 'Parameter Lain', 'Nilai'],
      ['Tekanan Darah', `${p.domains.vitalSigns.bloodPressureSystolic}/${p.domains.vitalSigns.bloodPressureDiastolic} mmHg`, 'Kesadaran', p.domains.vitalSigns.consciousness],
      ['Frekuensi Nadi', `${p.domains.vitalSigns.heartRate} x/menit`, 'GCS Total', `E${p.domains.vitalSigns.gcsEye} V${p.domains.vitalSigns.gcsVerbal} M${p.domains.vitalSigns.gcsMotor} (${p.domains.vitalSigns.gcsTotal})`],
      ['Frekuensi Nafas (RR)', `${p.domains.vitalSigns.respiratoryRate} x/menit`, 'SpO2', `${p.domains.vitalSigns.spO2} %`],
      ['Suhu Tubuh', `${p.domains.vitalSigns.temperature} °C`, 'BB / TB / IMT', `${p.domains.vitalSigns.weightKg} kg / ${p.domains.vitalSigns.heightCm} cm / ${p.domains.vitalSigns.bmi}`],
      [],
      ['PENGKAJIAN NYERI PQRST', 'Skala Terukur: ' + p.domains.painAssessment.severityScale + ' / 10'],
      ['P (Pemicu/Pereda)', p.domains.painAssessment.palliativeProvocative],
      ['Q (Kualitas Rasa)', p.domains.painAssessment.quality],
      ['R (Lokasi / Radiasi)', p.domains.painAssessment.regionRadiating],
      ['S (Skala 0-10)', `${p.domains.painAssessment.severityScale} / 10`],
      ['T (Waktu / Durasi)', p.domains.painAssessment.timingDuration],
      [],
      ['SKOR RISIKO JATUH (MORSE FALL SCALE)', `Total Skor: ${p.domains.morseFallScale.totalScore} (${p.domains.morseFallScale.riskCategory})`],
      [],
      ['No', 'Domain Doenges', 'Gejala Subjektif (DS)', 'Tanda Objektif (DO)', 'Temuan Klinis Checklist'],
      [1, '1. Neurosensori', p.domains.neurosensori.subjective, p.domains.neurosensori.objective, p.domains.neurosensori.findings.join('; ')],
      [2, '2. Sirkulasi', p.domains.sirkulasi.subjective, p.domains.sirkulasi.objective, p.domains.sirkulasi.findings.join('; ')],
      [3, '3. Pernapasan', p.domains.pernapasan.subjective, p.domains.pernapasan.objective, p.domains.pernapasan.findings.join('; ')],
      [4, '4. Nyeri / Ketidaknyamanan', p.domains.nyeriKetidaknyamanan.subjective, p.domains.nyeriKetidaknyamanan.objective, p.domains.nyeriKetidaknyamanan.findings.join('; ')],
      [5, '5. Makanan & Cairan', p.domains.makananCairan.subjective, p.domains.makananCairan.objective, `Intake: ${p.domains.makananCairan.fluidIntakeMl} ml, Output: ${p.domains.makananCairan.fluidOutputMl} ml, Balans: ${p.domains.makananCairan.fluidBalanceMl} ml; ` + p.domains.makananCairan.findings.join('; ')],
      [6, '6. Eliminasi', p.domains.eliminasi.subjective, p.domains.eliminasi.objective, p.domains.eliminasi.findings.join('; ')],
      [7, '7. Seksualitas', p.domains.seksualitas.subjective, p.domains.seksualitas.objective, p.domains.seksualitas.findings.join('; ')],
      [8, '8. Aktivitas & Istirahat', p.domains.aktivitasIstirahat.subjective, p.domains.aktivitasIstirahat.objective, p.domains.aktivitasIstirahat.findings.join('; ')],
      [9, '9. Hygiene', p.domains.hygiene.subjective, p.domains.hygiene.objective, p.domains.hygiene.findings.join('; ')],
      [10, '10. Integritas Ego', p.domains.integritasEgo.subjective, p.domains.integritasEgo.objective, p.domains.integritasEgo.findings.join('; ')],
      [11, '11. Interaksi Sosial', p.domains.interaksiSosial.subjective, p.domains.interaksiSosial.objective, p.domains.interaksiSosial.findings.join('; ')],
      [12, '12. Penyuluhan / Pembelajaran', p.domains.penyuluhanPembelajaran.subjective, p.domains.penyuluhanPembelajaran.objective, p.domains.penyuluhanPembelajaran.findings.join('; ')],
      [13, '13. Patient Safety & Proteksi', p.domains.patientSafety.subjective, p.domains.patientSafety.objective, p.domains.patientSafety.findings.join('; ')]
    ];
    const wsDomain = XLSX.utils.aoa_to_sheet(domainData);
    wsDomain['!cols'] = autoFitColumns(domainData);
    XLSX.utils.book_append_sheet(workbook, wsDomain, sanitizeSheetName(`${prefix}_13Domain`, '13Domain'));

    // Sheet: Pemeriksaan Fisik Head to Toe
    const pex = p.physicalExam;
    const physData: any[][] = [
      ['PEMERIKSAAN FISIK HEAD TO TOE'],
      ['Area Pemeriksaan', 'Hasil Temuan Pemeriksaan Fisik'],
      ['Kepala', pex.head],
      ['Mata', pex.eyes],
      ['Telinga', pex.ears],
      ['Hidung', pex.nose],
      ['Mulut & Gigi', pex.mouth],
      ['Leher', pex.neck],
      ['Thorax Paru (Inspeksi)', pex.thoraxLungs.inspection],
      ['Thorax Paru (Palpasi)', pex.thoraxLungs.palpation],
      ['Thorax Paru (Perkusi)', pex.thoraxLungs.percussion],
      ['Thorax Paru (Auskultasi)', pex.thoraxLungs.auscultation],
      ['Thorax Jantung (Inspeksi)', pex.thoraxHeart.inspection],
      ['Thorax Jantung (Palpasi)', pex.thoraxHeart.palpation],
      ['Thorax Jantung (Perkusi)', pex.thoraxHeart.percussion],
      ['Thorax Jantung (Auskultasi)', pex.thoraxHeart.auscultation],
      ['Abdomen (Inspeksi)', pex.abdomen.inspection],
      ['Abdomen (Auskultasi)', pex.abdomen.auscultation],
      ['Abdomen (Palpasi)', pex.abdomen.palpation],
      ['Abdomen (Perkusi)', pex.abdomen.percussion],
      ['Inguinal & Genitalia', pex.inguinalGenitalia],
      ['Kekuatan Otot Ekstremitas', `Tangan Kanan: ${pex.extremities.upperRightStrength}/5 | Tangan Kiri: ${pex.extremities.upperLeftStrength}/5 | Kaki Kanan: ${pex.extremities.lowerRightStrength}/5 | Kaki Kiri: ${pex.extremities.lowerLeftStrength}/5`],
      ['Edema & Turgor', `Edema: ${pex.extremities.edema} | Turgor: ${pex.extremities.turgor}`],
      ['Catatan Deformitas / Luka', pex.extremities.deformityNotes]
    ];
    const wsPhys = XLSX.utils.aoa_to_sheet(physData);
    wsPhys['!cols'] = autoFitColumns(physData);
    XLSX.utils.book_append_sheet(workbook, wsPhys, sanitizeSheetName(`${prefix}_PemeriksaanFisik`, 'Fisik'));

    // Sheet: Penunjang & Terapi
    const penunjangData: any[][] = [
      ['HASIL PEMERIKSAAN LABORATORIUM'],
      ['No', 'Tanggal', 'Nama Pemeriksaan', 'Hasil', 'Satuan', 'Nilai Rujukan Normal', 'Flag Abnormal'],
      ...p.diagnostics.laboratories.map((lab, i) => [
        i + 1,
        lab.date,
        lab.testName,
        lab.result,
        lab.unit,
        lab.normalRange,
        lab.flag === 'high' ? 'TINGGI (↑)' : lab.flag === 'low' ? 'RENDAH (↓)' : 'NORMAL'
      ]),
      [],
      ['HASIL PEMERIKSAAN RADIOLOGI'],
      ['No', 'Tanggal', 'Jenis Pemeriksaan', 'Kesan / Ekspertise Dokter'],
      ...p.diagnostics.radiologies.map((r, i) => [i + 1, r.date, r.examinationType, r.impression]),
      [],
      ['PROGRAM TERAPI MEDIS / FARMAKOLOGI'],
      ['No', 'Nama Obat', 'Dosis', 'Rute', 'Frekuensi', 'Indikasi Klinis', 'Tgl Mulai'],
      ...p.therapies.map((th, i) => [i + 1, th.medicationName, th.dose, th.route, th.frequency, th.indication, th.startDate])
    ];
    const wsPenunjang = XLSX.utils.aoa_to_sheet(penunjangData);
    wsPenunjang['!cols'] = autoFitColumns(penunjangData);
    XLSX.utils.book_append_sheet(workbook, wsPenunjang, sanitizeSheetName(`${prefix}_PenunjangTerapi`, 'Penunjang'));

    // Sheet: Analisa Data & Diagnosa Keperawatan 3S
    const analisaData: any[][] = [
      ['TABEL ANALISA DATA KEPERAWATAN'],
      ['No', 'Data Fokus (DS & DO)', 'Etiologi / Penyebab', 'Problem / Masalah Keperawatan (SDKI)'],
      ...(cp?.diagnoses || []).map((dx, i) => [
        i + 1,
        `DS:\n- ${dx.dataFocus.subjective.join('\n- ')}\n\nDO:\n- ${dx.dataFocus.objective.join('\n- ')}`,
        dx.etiology,
        `${dx.problem} (${dx.sdkCode})`
      ]),
      [],
      ['DAFTAR DIAGNOSIS KEPERAWATAN (FORMAT PES SDKI)'],
      ['Prioritas', 'Kode', 'Diagnosis Keperawatan (PES Pernyataan Lengkap)'],
      ...(cp?.diagnoses || []).map(dx => [
        `Prioritas ${dx.priority}`,
        dx.sdkCode,
        dx.pesStatement
      ])
    ];
    const wsAnalisa = XLSX.utils.aoa_to_sheet(analisaData);
    wsAnalisa['!cols'] = autoFitColumns(analisaData);
    XLSX.utils.book_append_sheet(workbook, wsAnalisa, sanitizeSheetName(`${prefix}_Analisa_Dx`, 'Analisa'));

    // Sheet: Intervensi Keperawatan (SLKI - SIKI)
    const intervData: any[][] = [
      ['RENCANA ASUHAN KEPERAWATAN 3S (SLKI & SIKI)'],
      ['No Dx', 'Diagnosis SDKI', 'Tujuan & Kriteria Hasil (SLKI)', 'Intervensi Keperawatan (SIKI)', 'Tindakan Terpilih (O/T/E/K)']
    ];

    (cp?.diagnoses || []).forEach(dx => {
      const indicatorsStr = dx.outcome.indicators.map(ind => `- ${ind.name} (Target skor: ${ind.targetScale}/5)`).join('\n');
      const slkiStr = `${dx.outcome.label} (${dx.outcome.code})\nEkspektasi: ${dx.outcome.expectation}\nWaktu: ${dx.outcome.timeframeHours} jam\nIndikator:\n${indicatorsStr}`;

      const sikiBlocks = dx.interventions.map(interv => {
        const obs = interv.actions.filter(a => a.category === 'Observasi' && a.isSelected).map(a => `• Observasi: ${a.description}`).join('\n');
        const ter = interv.actions.filter(a => a.category === 'Terapeutik' && a.isSelected).map(a => `• Terapeutik: ${a.description}`).join('\n');
        const edu = interv.actions.filter(a => a.category === 'Edukasi' && a.isSelected).map(a => `• Edukasi: ${a.description}`).join('\n');
        const kol = interv.actions.filter(a => a.category === 'Kolaborasi' && a.isSelected).map(a => `• Kolaborasi: ${a.description}`).join('\n');
        return `${interv.label} (${interv.code}):\n${[obs, ter, edu, kol].filter(Boolean).join('\n')}`;
      }).join('\n\n');

      intervData.push([
        `Dx ${dx.priority}`,
        `${dx.problem}\n(${dx.sdkCode})`,
        slkiStr,
        dx.interventions.map(i => `${i.label} (${i.code})`).join(', '),
        sikiBlocks
      ]);
    });

    const wsInterv = XLSX.utils.aoa_to_sheet(intervData);
    wsInterv['!cols'] = autoFitColumns(intervData);
    XLSX.utils.book_append_sheet(workbook, wsInterv, sanitizeSheetName(`${prefix}_Intervensi3S`, 'Intervensi'));

    // Sheet: Implementasi & Evaluasi SOAP
    const implData: any[][] = [
      ['CATATAN IMPLEMENTASI KEPERAWATAN (WITA)'],
      ['No', 'Tgl & Waktu (WITA)', 'Shift', 'Kode Tindakan', 'Kategori', 'Uraian Tindakan Keperawatan', 'Nama Perawat / Operator', 'Respon Klien / Hasil'],
      ...(cp?.implementations || []).map((imp, i) => [
        i + 1,
        `${imp.dateWita} ${imp.timeWita} WITA`,
        imp.shift.toUpperCase(),
        imp.sikiCode,
        imp.category,
        imp.actionDescription,
        imp.operatorName,
        imp.patientResponse || '-'
      ]),
      [],
      ['CATATAN EVALUASI KEPERAWATAN (SOAP)'],
      ['No', 'Tanggal / Shift (WITA)', 'Diagnosis SDKI', 'S (Subjektif)', 'O (Objektif)', 'A (Analisis SLKI & Status)', 'P (Planning / Tindak Lanjut)', 'Evaluator'],
      ...(cp?.evaluations || []).map((ev, i) => {
        const ratingStr = ev.analysis.ratings.map(r => `${r.name}: ${r.evaluatedScore}/${r.targetScore}`).join(', ');
        return [
          i + 1,
          `${ev.dateWita} ${ev.timeWita} (${ev.shift.toUpperCase()})`,
          ev.sdkCode,
          ev.subjective,
          ev.objective,
          `Status: ${ev.analysis.outcomeStatus}\nNilai Indikator: ${ratingStr}\nCatatan: ${ev.analysis.notes}`,
          `${ev.planning.action}: ${ev.planning.details}`,
          ev.operatorName
        ];
      })
    ];
    const wsImpl = XLSX.utils.aoa_to_sheet(implData);
    wsImpl['!cols'] = autoFitColumns(implData);
    XLSX.utils.book_append_sheet(workbook, wsImpl, sanitizeSheetName(`${prefix}_Impl_SOAP`, 'Implementasi'));
  });

  // Write and trigger download
  const todayStr = formatWitaDateInput(new Date());
  const fileName = `AsKep_${todayStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
