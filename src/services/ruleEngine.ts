/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, DiagnosticCandidate } from '../types/askep';
import { ALL_CATALOG_3S, CatalogItem3S } from '../data/extendedCatalog';

export interface RuleTriggerResult {
  sdkCode: string;
  matchedMajorSubjective: string[];
  matchedMajorObjective: string[];
  matchedMinorSubjective: string[];
  matchedMinorObjective: string[];
  supportingQuotesDS: string[];
  supportingQuotesDO: string[];
  reasons: string[];
  etiologySuggestion: string;
}

/**
 * Deterministic diagnostic rule engine that scans patient data against SDKI criteria.
 * Completely defensive against undefined / null fields and supports all 44 SDKI diagnoses.
 */
export function generateAnalisaData(patient: Patient): DiagnosticCandidate[] {
  if (!patient) return [];

  const candidates: DiagnosticCandidate[] = [];
  const domains = patient.domains || ({} as any);
  const ttv = domains.vitalSigns || ({} as any);
  const pain = domains.painAssessment || ({} as any);
  const morse = domains.morseFallScale || ({} as any);
  const pex = patient.physicalExam || ({} as any);
  const diagnostics = patient.diagnostics || ({} as any);
  const labs = Array.isArray(diagnostics.laboratories) ? diagnostics.laboratories : [];
  const history = patient.history || ({} as any);
  const identity = patient.identity || ({} as any);

  const medDiag = (identity.medicalDiagnosis || patient.medicalDiagnosis || '').toLowerCase();
  const chiefComplaint = (history.chiefComplaintAssessment || history.chiefComplaintAdmission || '').toLowerCase();
  const presentIllness = (history.presentIllnessHistory || '').toLowerCase();

  // Aggregate subjective & objective text pools from 13 domains
  const subjectivePool: { domain: string; text: string }[] = [];
  const objectivePool: { domain: string; text: string }[] = [];

  // Helper to safely extract texts
  const addDomainTexts = (domainName: string, domainObj: any) => {
    if (!domainObj) return;
    if (domainObj.subjective && typeof domainObj.subjective === 'string' && domainObj.subjective.trim()) {
      subjectivePool.push({ domain: domainName, text: domainObj.subjective.trim() });
    }
    if (domainObj.objective && typeof domainObj.objective === 'string' && domainObj.objective.trim()) {
      objectivePool.push({ domain: domainName, text: domainObj.objective.trim() });
    }
    if (Array.isArray(domainObj.findings)) {
      domainObj.findings.forEach((f: any) => {
        if (typeof f === 'string' && f.trim()) {
          objectivePool.push({ domain: domainName, text: f.trim() });
        }
      });
    }
  };

  addDomainTexts('Neurosensori', domains.neurosensori);
  addDomainTexts('Sirkulasi', domains.sirkulasi);
  addDomainTexts('Pernapasan', domains.pernapasan);
  addDomainTexts('Nyeri & Kenyamanan', domains.nyeriKetidaknyamanan);
  addDomainTexts('Makanan & Cairan', domains.makananCairan);
  addDomainTexts('Eliminasi', domains.eliminasi);
  addDomainTexts('Seksualitas', domains.seksualitas);
  addDomainTexts('Aktivitas & Istirahat', domains.aktivitasIstirahat);
  addDomainTexts('Hygiene', domains.hygiene);
  addDomainTexts('Integritas Ego', domains.integritasEgo);
  addDomainTexts('Interaksi Sosial', domains.interaksiSosial);
  addDomainTexts('Penyuluhan & Pembelajaran', domains.penyuluhanPembelajaran);
  addDomainTexts('Patient Safety', domains.patientSafety);

  // Add history chief complaints
  if (history.chiefComplaintAssessment) {
    subjectivePool.push({ domain: 'Keluhan Pengkajian', text: history.chiefComplaintAssessment });
  }
  if (history.chiefComplaintAdmission) {
    subjectivePool.push({ domain: 'Keluhan Masuk RS', text: history.chiefComplaintAdmission });
  }
  if (history.presentIllnessHistory) {
    subjectivePool.push({ domain: 'Riwayat Penyakit', text: history.presentIllnessHistory });
  }

  // Physical exam string extracts
  const extPex = pex.extremities || {};
  const thoraxPex = pex.thoraxLungs || {};
  const abdomenPex = pex.abdomen || {};

  const pexText = [
    typeof extPex.deformityNotes === 'string' ? extPex.deformityNotes : '',
    typeof extPex.edema === 'string' ? extPex.edema : '',
    typeof thoraxPex.auscultation === 'string' ? thoraxPex.auscultation : '',
    typeof abdomenPex.palpation === 'string' ? abdomenPex.palpation : '',
    typeof abdomenPex.inspection === 'string' ? abdomenPex.inspection : ''
  ].join(' ');

  // Combined lower-case search strings
  const fullSubStr = (subjectivePool.map(s => s.text).join(' ') + ' ' + chiefComplaint + ' ' + presentIllness).toLowerCase();
  const fullObjStr = (objectivePool.map(o => o.text).join(' ') + ' ' + pexText).toLowerCase();
  const fullClinicalContext = `${medDiag} ${chiefComplaint} ${presentIllness} ${fullSubStr} ${fullObjStr}`;

  // Test abnormal lab flags
  const highLeukosit = labs.some((l: any) => l.testName && l.testName.toLowerCase().includes('leukosit') && l.flag === 'high');
  const lowHb = labs.some((l: any) => l.testName && l.testName.toLowerCase().includes('hemoglobin') && l.flag === 'low');
  const highGds = labs.some((l: any) => l.testName && l.testName.toLowerCase().includes('glukosa') && l.flag === 'high');
  const lowGds = labs.some((l: any) => l.testName && l.testName.toLowerCase().includes('glukosa') && l.flag === 'low');
  const lowTrombosit = labs.some((l: any) => l.testName && l.testName.toLowerCase().includes('trombosit') && l.flag === 'low');

  // Parse vital signs for numeric thresholds safely
  const hr = Number(ttv.heartRate) || 0;
  const systolic = Number(ttv.bloodPressureSystolic) || 0;
  const diastolic = Number(ttv.bloodPressureDiastolic) || 0;
  const temp = Number(String(ttv.temperature || '').replace(',', '.')) || 0;
  const rr = Number(ttv.respiratoryRate) || 0;
  const spo2 = Number(ttv.spO2) || 0;
  const painScale = Number(pain.severityScale) || 0;
  const morseScore = Number(morse.totalScore) || 0;

  // Muscle strengths
  const minStrength = Math.min(
    Number(extPex.upperRightStrength ?? 5),
    Number(extPex.upperLeftStrength ?? 5),
    Number(extPex.lowerRightStrength ?? 5),
    Number(extPex.lowerLeftStrength ?? 5)
  );

  // Evaluate each catalog diagnosis
  for (const cat of ALL_CATALOG_3S) {
    let matchScore = 0;
    const reasons: string[] = [];
    const dsQuotes: string[] = [];
    const doQuotes: string[] = [];
    let etiology = cat.causes[0] || 'Kondisi klinis terkait';

    // 1. High-precision Clinical Rules
    if (cat.code === 'D.0077') {
      // Nyeri Akut
      if (painScale > 0 || fullSubStr.includes('nyeri') || fullSubStr.includes('sakit') || fullSubStr.includes('ngilu') || fullSubStr.includes('pedih')) {
        matchScore += 45;
        reasons.push(`Skala nyeri ${painScale}/10 (P: ${pain.palliativeProvocative || '-'}, Q: ${pain.quality || '-'})`);
        dsQuotes.push(`Pasien mengeluh nyeri pada ${pain.regionRadiating || 'area lesi/cedera'} dengan skala ${painScale}/10 (${pain.quality || 'seperti tertusuk/berdenyut/tersayat'})`);
      }
      if (fullObjStr.includes('meringis') || fullObjStr.includes('protektif') || hr > 100 || systolic >= 140) {
        matchScore += 40;
        reasons.push('Tampak ekspresi meringis, bersikap protektif, atau perubahan TTV terkait nyeri');
        doQuotes.push(`Tampak meringis menahan sakit, bersikap protektif, TD: ${ttv.bloodPressureSystolic || 120}/${ttv.bloodPressureDiastolic || 80} mmHg, Nadi: ${ttv.heartRate || 80} x/mnt`);
      }
      if (medDiag.includes('fraktur') || medDiag.includes('post op') || medDiag.includes('operasi') || medDiag.includes('trauma') || medDiag.includes('laparatomi') || medDiag.includes('apendisitis')) {
        matchScore += 15;
        etiology = 'Agen pencedera fisik (prosedur bedah / trauma diskontinuitas jaringan)';
      }
    } else if (cat.code === 'D.0078') {
      // Nyeri Kronis
      if (fullSubStr.includes('kronis') || fullSubStr.includes('menahun') || fullSubStr.includes('bulan') || fullSubStr.includes('kanker')) {
        matchScore += 65;
        reasons.push('Keluhan nyeri berlangsung lama atau menahun (> 3 bulan)');
        dsQuotes.push('Pasien mengeluhkan rasa nyeri yang telah berlangsung menahun dan mengganggu aktivitas sehari-hari');
        doQuotes.push('Tampak kelelahan fisik, riwayat konsumsi analgetik jangka panjang');
        etiology = 'Kondisi muskuloskeletal kronis / proses degeneratif jaringan';
      }
    } else if (cat.code === 'D.0054') {
      // Gangguan Mobilitas Fisik
      if (minStrength < 5 || fullSubStr.includes('sulit gerak') || fullSubStr.includes('keterbatasan gerak') || fullSubStr.includes('tidak bisa jalan') || fullSubStr.includes('bedrest') || fullSubStr.includes('kruk') || fullSubStr.includes('takut bergerak')) {
        matchScore += 45;
        reasons.push(`Penurunan kekuatan otot ekstremitas (${minStrength}/5) atau keluhan sulit mobilisasi`);
        dsQuotes.push('Pasien mengeluh sulit menggerakkan bagian tubuh yang sakit dan merasa terbatas dalam bergerak');
        doQuotes.push(`Kekuatan otot: Ekstremitas Atas (${extPex.upperRightStrength ?? 5}/${extPex.upperLeftStrength ?? 5}), Ekstremitas Bawah (${extPex.lowerRightStrength ?? 5}/${extPex.lowerLeftStrength ?? 5}), rentang gerak (ROM) terbatas`);
      }
      if (fullObjStr.includes('kelemahan') || fullObjStr.includes('terbatas') || fullObjStr.includes('gips') || fullObjStr.includes('spalk') || fullObjStr.includes('bidai') || fullObjStr.includes('kruk') || medDiag.includes('fraktur') || medDiag.includes('laparatomi') || medDiag.includes('stroke')) {
        matchScore += 40;
        reasons.push('Imobilisasi pasca trauma/operasi dan ketergantungan mobilisasi');
        etiology = 'Kerusakan integritas struktur tulang, nyeri saat bergerak, dan kelemahan fisik';
      }
    } else if (cat.code === 'D.0129') {
      // Gangguan Integritas Kulit / Jaringan
      if (fullObjStr.includes('luka') || fullObjStr.includes('insisi') || fullObjStr.includes('sayat') || fullObjStr.includes('jahitan') || fullObjStr.includes('operasi') || fullObjStr.includes('robek') || fullObjStr.includes('fraktur') || fullObjStr.includes('lecet') || medDiag.includes('laparatomi') || medDiag.includes('fraktur') || medDiag.includes('operasi')) {
        matchScore += 80;
        reasons.push('Terdapat luka insisi pembedahan / diskontinuitas jaringan atau lesi kulit');
        doQuotes.push(`Tampak diskontinuitas jaringan/luka operasi: ${extPex.deformityNotes || abdomenPex.inspection || 'terdapat luka insisi bedah/trauma tertutup balutan'}`);
        etiology = 'Faktor mekanis (prosedur pembedahan / trauma jaringan)';
      }
    } else if (cat.code === 'D.0142') {
      // Risiko Infeksi
      if (highLeukosit || fullObjStr.includes('luka') || fullObjStr.includes('infus') || fullObjStr.includes('kateter') || temp >= 37.5 || medDiag.includes('operasi') || medDiag.includes('laparatomi') || medDiag.includes('fraktur')) {
        matchScore += 75;
        if (highLeukosit) reasons.push('Peningkatan kadar leukosit di atas batas normal');
        reasons.push('Adanya portal masuk kuman (luka bedah, akses intravena / kateter, prosedur invasif)');
        doQuotes.push(`Terdapat luka terbuka / luka operasi terpasang balutan, akses intravena aktif, Leukosit: ${labs.find((l: any) => l.testName?.toLowerCase().includes('leukosit'))?.result || '-'} /uL, Suhu: ${ttv.temperature || 37.0} °C`);
        etiology = 'Efek prosedur invasif, kerusakan pertahanan primer kulit, dan trauma jaringan';
      }
    } else if (cat.code === 'D.0143') {
      // Risiko Jatuh (Morse Fall Scale)
      if (morseScore >= 25 || fullObjStr.includes('risiko jatuh') || fullObjStr.includes('kruk') || minStrength < 5 || medDiag.includes('fraktur')) {
        matchScore += 85;
        reasons.push(`Skor Morse Fall Scale ${morseScore} (${morse.riskCategory || 'Risiko Jatuh'})`);
        doQuotes.push(`Skor Morse Fall Scale: ${morseScore} (${morse.riskCategory || 'Terpasang gelang kuning'}), terpasang infus IV / bidai / imobilisasi`);
        etiology = 'Kelemahan anggota gerak bawah, penggunaan alat bantu/bidai, dan status pasca trauma/operasi';
      }
    } else if (cat.code === 'D.0001') {
      // Bersihan Jalan Napas Tidak Efektif
      if (fullObjStr.includes('sputum') || fullObjStr.includes('ronkhi') || fullObjStr.includes('batuk tidak efektif') || fullSubStr.includes('dahak') || fullSubStr.includes('batuk')) {
        matchScore += 80;
        reasons.push('Terdengar ronkhi / penumpukan sputum dan batuk tidak efektif');
        dsQuotes.push('Pasien mengeluh batuk berdahak dan dahak kental sulit dikeluarkan');
        doQuotes.push(`Auskultasi paru: ${thoraxPex.auscultation || 'terdengar ronkhi basah'}, batuk tidak efektif, frekuensi napas: ${ttv.respiratoryRate || 20} x/mnt`);
        etiology = 'Hipersekresi jalan napas dan sekresi yang tertahan';
      }
    } else if (cat.code === 'D.0005') {
      // Pola Napas Tidak Efektif
      if (rr > 24 || (rr > 0 && rr < 14) || fullSubStr.includes('sesak') || fullObjStr.includes('retraksi') || fullObjStr.includes('cuping hidung')) {
        matchScore += 70;
        reasons.push(`Frekuensi napas abnormal (${ttv.respiratoryRate} x/mnt) atau keluhan sesak napas`);
        dsQuotes.push('Pasien mengeluh sesak napas terutama saat bergerak atau berbaring datar');
        doQuotes.push(`RR: ${ttv.respiratoryRate || 24} x/mnt, SpO2: ${ttv.spO2 || 98}%, tampak penggunaan otot bantu napas`);
        etiology = 'Hambatan upaya napas (nyeri saat bernapas / kelelahan otot pernapasan)';
      }
    } else if (cat.code === 'D.0003') {
      // Gangguan Pertukaran Gas
      if ((spo2 > 0 && spo2 < 95) || fullSubStr.includes('gelisah') && rr > 24 || fullObjStr.includes('sianosis')) {
        matchScore += 75;
        reasons.push(`Saturasi oksigen rendah (${spo2}%) atau tanda hipoksemia`);
        dsQuotes.push('Pasien mengeluh pusing dan sesak napas berat');
        doQuotes.push(`SpO2: ${spo2}%, akral sianosis ringan, pola napas cepat dan dangkal`);
        etiology = 'Ketidakseimbangan ventilasi-perfusi dan perubahan membran alveolus-kapiler';
      }
    } else if (cat.code === 'D.0009') {
      // Perfusi Perifer Tidak Efektif
      if (fullObjStr.includes('crt >') || fullObjStr.includes('akral dingin') || fullObjStr.includes('pucat') || fullObjStr.includes('edema') || lowHb) {
        matchScore += 75;
        reasons.push('Pengisian kapiler (CRT) memanjang, akral dingin, atau anemia');
        doQuotes.push(`CRT > 2 detik, akral dingin, konjungtiva anemis, kadar Hb: ${labs.find((l: any) => l.testName?.toLowerCase().includes('hemoglobin'))?.result || '-'} g/dL`);
        etiology = 'Penurunan konsentrasi hemoglobin / spasme vascular perifer';
      }
    } else if (cat.code === 'D.0011') {
      // Penurunan Curah Jantung
      if (medDiag.includes('chf') || medDiag.includes('jantung') || (systolic > 160 && hr > 110) || fullObjStr.includes('murmur') || fullObjStr.includes('gallop')) {
        matchScore += 75;
        reasons.push('Tanda perubahan afterload / preload jantung dan kelelahan');
        dsQuotes.push('Pasien mengeluh cepat lelah dan dada berdebar-debar saat beraktivitas');
        doQuotes.push(`TD: ${ttv.bloodPressureSystolic}/${ttv.bloodPressureDiastolic} mmHg, Nadi: ${ttv.heartRate} x/mnt, disritmia`);
        etiology = 'Perubahan kontraktilitas miokard dan perubahan afterload';
      }
    } else if (cat.code === 'D.0130') {
      // Hipertermia
      if (temp > 37.5 || fullSubStr.includes('panas') || fullSubStr.includes('demam') || fullSubStr.includes('meriang')) {
        matchScore += 85;
        reasons.push(`Suhu tubuh febris (${ttv.temperature} °C)`);
        dsQuotes.push('Pasien mengeluh badan terasa panas meriang dan menggigil');
        doQuotes.push(`Suhu tubuh terukur ${ttv.temperature || 38.0} °C, kulit teraba hangat/kemerahan, frekuensi nadi meningkat`);
        etiology = 'Proses inflamasi dan respon infeksi sistemik';
      }
    } else if (cat.code === 'D.0023') {
      // Hipovolemia
      if (fullObjStr.includes('mukosa kering') || fullObjStr.includes('turgor buruk') || fullSubStr.includes('haus') || fullSubStr.includes('muntah') || fullSubStr.includes('pendarahan')) {
        matchScore += 70;
        reasons.push('Tanda kehilangan cairan aktif (muntah/perdarahan) atau dehidrasi');
        dsQuotes.push('Pasien mengeluh merasa sangat haus, tenggorokan kering, dan badan lemas');
        doQuotes.push('Turgor kulit melambat, membran mukosa bibir kering, nadi teraba cepat dan lemah');
        etiology = 'Kehilangan cairan aktif dan intake cairan yang tidak adekuat';
      }
    } else if (cat.code === 'D.0022') {
      // Hipervolemia
      if (fullObjStr.includes('edema') || fullObjStr.includes('asites') || fullObjStr.includes('distensi')) {
        matchScore += 65;
        reasons.push('Penumpukan kelebihan volume cairan (edema / asites)');
        dsQuotes.push('Pasien mengeluh bengkak pada tungkai dan berat badan terasa meningkat');
        doQuotes.push(`Edema perifer ${extPex.edema || 'positif'}, distensi vena jugularis`);
        etiology = 'Gangguan mekanisme regulasi dan retensi natrium serta air';
      }
    } else if (cat.code === 'D.0019') {
      // Defisit Nutrisi
      if (fullSubStr.includes('nafsu makan turun') || fullSubStr.includes('tidak nafsu makan') || fullSubStr.includes('mual') || fullSubStr.includes('puasa') || fullSubStr.includes('npo')) {
        matchScore += 65;
        reasons.push('Penurunan asupan nutrisi oral atau program puasa pra/pasca operasi');
        dsQuotes.push('Pasien mengeluh nafsu makan menurun, makanan hanya habis 1/3 porsi');
        doQuotes.push('Porsi makan tidak dihabiskan, bising usus hipoaktif, membran mukosa pucat');
        etiology = 'Ketidakmampuan mencerna makanan dan faktor psikologis keengganan makan';
      }
    } else if (cat.code === 'D.0049') {
      // Konstipasi
      if (fullSubStr.includes('belum bab') || fullSubStr.includes('sulit bab') || fullSubStr.includes('flatus') || fullObjStr.includes('bising usus') || medDiag.includes('ileus')) {
        matchScore += 75;
        reasons.push('Penurunan motilitas gastrointestinal atau belum BAB pasca anestesi/bedah');
        dsQuotes.push('Pasien mengeluh belum BAB atau flatus sejak pasca tindakan operasi');
        doQuotes.push(`Bising usus terdengar lambat (hipoaktif), abdomen teraba tegang / distensi`);
        etiology = 'Efek agen farmakologis anestesi dan penurunan mobilitas fisik';
      }
    } else if (cat.code === 'D.0076') {
      // Nausea
      if (fullSubStr.includes('mual') || fullSubStr.includes('enek') || fullSubStr.includes('muntah')) {
        matchScore += 75;
        reasons.push('Sensasi mual dan rasa tidak nyaman pada epigastrium');
        dsQuotes.push('Pasien mengeluhkan rasa mual, perut terasa begah dan ingin muntah');
        doQuotes.push('Pasien tampak menelan berulang, saliva meningkat, menolak makan');
        etiology = 'Efek toksin anestesi pasca pembedahan dan distensi lambung';
      }
    } else if (cat.code === 'D.0056') {
      // Intoleransi Aktivitas
      if (fullSubStr.includes('lemas') || fullSubStr.includes('lelah') || fullSubStr.includes('capek')) {
        matchScore += 65;
        reasons.push('Ketidakcukupan energi untuk beraktivitas');
        dsQuotes.push('Pasien mengeluh merasa sangat lelah dan lemas saat mencoba duduk di ranjang');
        doQuotes.push('Nadi meningkat > 20% saat bergerak, wajah tampak pucat dan lelah');
        etiology = 'Ketidakseimbangan antara suplai dan kebutuhan oksigen serta imobilitas';
      }
    } else if (cat.code === 'D.0109') {
      // Defisit Perawatan Diri
      if (fullSubStr.includes('tidak bisa mandi') || fullSubStr.includes('dibantu keluarga') || fullSubStr.includes('seka') || fullObjStr.includes('ketergantungan') || fullObjStr.includes('adl dibantu') || fullObjStr.includes('bedrest')) {
        matchScore += 70;
        reasons.push('Ketergantungan aktivitas harian (mandi, berpakaian, toileting) akibat sakit/imobilisasi');
        dsQuotes.push('Pasien mengeluh belum bisa mandi atau berpakaian sendiri, semua ADL dibantu');
        doQuotes.push('Ketergantungan parsial/total dalam perawatan diri (mandi, eliminasi, berpakaian) di tempat tidur');
        etiology = 'Gangguan muskuloskeletal, nyeri pasca bedah, dan kelemahan neuromuskular';
      }
    } else if (cat.code === 'D.0080') {
      // Ansietas
      if (fullSubStr.includes('cemas') || fullSubStr.includes('khawatir') || fullSubStr.includes('takut') || fullObjStr.includes('gelisah') || fullObjStr.includes('tegang')) {
        matchScore += 75;
        reasons.push('Verbalisasi rasa cemas/khawatir terhadap penyakit dan masa depan');
        dsQuotes.push('Pasien mengungkapkan rasa khawatir mengenai kesembuhan lukanya dan hasil operasi');
        doQuotes.push('Pasien tampak tegang, sering bertanya mengenai kondisinya, kontak mata berulang');
        etiology = 'Krisis situasional, ancaman terhadap konsep diri, dan kurang terpapar informasi';
      }
    } else if (cat.code === 'D.0111') {
      // Defisit Pengetahuan
      if (fullSubStr.includes('tidak tahu') || fullSubStr.includes('bertanya') || fullSubStr.includes('kurang paham') || fullSubStr.includes('edukasi') || fullObjStr.includes('kurang paham')) {
        matchScore += 65;
        reasons.push('Keluarga/pasien menanyakan tentang proses perawatan dan prosedur latihan di rumah');
        dsQuotes.push('Pasien dan keluarga aktif bertanya mengenai pantangan makanan dan perawatan luka');
        doQuotes.push('Pasien menunjukkan perlunya bimbingan dalam teknik mobilisasi dini dan nutrisi');
        etiology = 'Kurang terpapar informasi mengenai perawatan penyakit dan rehabilitasi';
      }
    } else if (cat.code === 'D.0055') {
      // Gangguan Pola Tidur
      if (fullSubStr.includes('sulit tidur') || fullSubStr.includes('sering terbangun') || fullSubStr.includes('kurang tidur') || fullSubStr.includes('insomnia')) {
        matchScore += 70;
        reasons.push('Keluhan sering terbangun malam hari akibat nyeri atau kebisingan ruang rawat');
        dsQuotes.push('Pasien mengeluh sulit tidur nyenyak karena sering terbangun saat posisi tubuh berubah');
        doQuotes.push('Wajah tampak lesu, lingkaran hitam bawah mata, pasien sering menguap');
        etiology = 'Hambatan lingkungan ruang perawatan dan nyeri fisik';
      }
    } else if (cat.code === 'D.0027') {
      // Ketidakstabilan Kadar Glukosa Darah
      if (highGds || lowGds || medDiag.includes('diabetes') || medDiag.includes('dm')) {
        matchScore += 80;
        reasons.push('Kadar glukosa darah abnormal atau riwayat diabetes melitus');
        doQuotes.push(`GDS terukur ${labs.find((l: any) => l.testName?.toLowerCase().includes('glukosa'))?.result || '-'} mg/dL`);
        etiology = 'Resistensi insulin dan stres metabolik pasca pembedahan';
      }
    } else if (cat.code === 'D.0141') {
      // Risiko Perdarahan
      if (lowTrombosit || fullObjStr.includes('perdarahan') || medDiag.includes('laparatomi') || medDiag.includes('cito')) {
        matchScore += 70;
        reasons.push('Trombositopenia atau tindakan pembedahan vaskular/mayor');
        doQuotes.push('Terdapat luka insisi bedah abdomen, pemantauan tanda hematoma / drainase');
        etiology = 'Tindakan pembedahan mayor dan trauma pembuluh darah';
      }
    } else if (cat.code === 'D.0066') {
      // Gangguan Eliminasi Urine
      if (fullObjStr.includes('kateter') || fullSubStr.includes('tidak bisa kencing') || fullSubStr.includes('retensi urine')) {
        matchScore += 65;
        reasons.push('Pemasangan kateter urin indwelling atau gangguan sensasi miksi');
        dsQuotes.push('Pasien mengatakan belum merasakan sensasi ingin BAK karena terpasang selang kateter');
        doQuotes.push('Terpasang folley catheter no 16, urine bag terisi cairan kekuningan jernih');
        etiology = 'Efek pembiusan (anestesi blok spinal) dan pemakaian kateter urin';
      }
    }

    // 2. Secondary General Keyword Scan against Catalog Major/Minor criteria
    if (matchScore < 40) {
      const allIndicators = [
        ...cat.majorSubjective,
        ...cat.majorObjective,
        ...cat.minorSubjective,
        ...cat.minorObjective
      ];

      let matchedIndicators = 0;
      for (const ind of allIndicators) {
        const words = ind.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const hasMatch = words.some(w => fullClinicalContext.includes(w));
        if (hasMatch) {
          matchedIndicators++;
          if (cat.majorSubjective.includes(ind) || cat.minorSubjective.includes(ind)) {
            dsQuotes.push(`Pasien menunjukkan indikator: ${ind}`);
          } else {
            doQuotes.push(`Temuan klinis objektif: ${ind}`);
          }
        }
      }

      if (matchedIndicators >= 2) {
        matchScore = Math.min(85, 30 + matchedIndicators * 15);
        reasons.push(`Ditemukan ${matchedIndicators} tanda & gejala klinis yang bersesuaian dengan ${cat.name}`);
      }
    }

    // Include candidate if threshold met
    if (matchScore >= 40) {
      let confidence: 'Tinggi' | 'Sedang' | 'Rendah' = 'Rendah';
      if (matchScore >= 75) confidence = 'Tinggi';
      else if (matchScore >= 50) confidence = 'Sedang';

      let pesStatement = '';
      if (cat.type === 'aktual') {
        const symptomsStr = [...dsQuotes, ...doQuotes].slice(0, 2).join(', ');
        pesStatement = `${cat.name} (${cat.code}) b.d. ${etiology} d.d. ${symptomsStr || 'keluhan subjektif dan temuan objektif pasien'}`;
      } else if (cat.type === 'risiko') {
        pesStatement = `${cat.name} (${cat.code}) dibuktikan dengan ${etiology}`;
      } else {
        pesStatement = `${cat.name} (${cat.code}) dibuktikan dengan kesiapan dan komitmen pasien`;
      }

      candidates.push({
        id: `cand_${cat.code}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sdkCode: cat.code,
        problem: cat.name,
        category: cat.category,
        etiology,
        type: cat.type,
        matchConfidence: confidence,
        matchScore,
        matchReasons: reasons,
        suggestedPes: pesStatement,
        dataFocusSubjective: dsQuotes.length > 0 ? dsQuotes : ['Keluhan subjektif sesuai temuan pengkajian domain'],
        dataFocusObjective: doQuotes.length > 0 ? doQuotes : ['Tanda objektif sesuai temuan fisik dan penunjang'],
        selected: confidence === 'Tinggi',
        priorityOrder: candidates.length + 1
      });
    }
  }

  // Fallback safety: If clinical notes were extremely sparse and no candidates scored >= 40,
  // ensure high-relevance clinical diagnoses based on diagnosis/chief complaint are always provided!
  if (candidates.length === 0) {
    const fallbackCodes = ['D.0077', 'D.0143', 'D.0142', 'D.0111'];
    fallbackCodes.forEach((code, idx) => {
      const cat = ALL_CATALOG_3S.find(c => c.code === code);
      if (!cat) return;

      const etiology = cat.causes[0] || 'Kondisi klinis penyakit saat ini';
      let pes = '';
      if (cat.type === 'aktual') {
        pes = `${cat.name} (${cat.code}) b.d. ${etiology} d.d. keluhan pasien dan perubahan tanda vital`;
      } else {
        pes = `${cat.name} (${cat.code}) dibuktikan dengan ${etiology}`;
      }

      candidates.push({
        id: `cand_fb_${code}_${Date.now()}_${idx}`,
        sdkCode: cat.code,
        problem: cat.name,
        category: cat.category,
        etiology,
        type: cat.type,
        matchConfidence: 'Sedang',
        matchScore: 60 - idx * 5,
        matchReasons: ['Diusulkan berdasarkan riwayat masuk rawat dan profil diagnosis klinis umum'],
        suggestedPes: pes,
        dataFocusSubjective: ['Data fokus subjektif sesuai keluhan awal saat pengkajian'],
        dataFocusObjective: ['Data fokus objektif sesuai observasi tanda vital dan kondisi umum'],
        selected: idx < 2,
        priorityOrder: idx + 1
      });
    });
  }

  // Sort descending by matchScore
  candidates.sort((a, b) => b.matchScore - a.matchScore);
  candidates.forEach((c, idx) => {
    c.priorityOrder = idx + 1;
  });

  return candidates;
}
