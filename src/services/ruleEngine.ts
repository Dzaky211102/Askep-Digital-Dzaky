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
 */
export function generateAnalisaData(patient: Patient): DiagnosticCandidate[] {
  const candidates: DiagnosticCandidate[] = [];
  const domains = patient.domains;
  const ttv = domains.vitalSigns;
  const pain = domains.painAssessment;
  const morse = domains.morseFallScale;
  const pex = patient.physicalExam;
  const labs = patient.diagnostics.laboratories;

  // Aggregate subjective & objective text pools from 13 domains
  const subjectivePool: { domain: string; text: string }[] = [];
  const objectivePool: { domain: string; text: string }[] = [];

  // Helper to extract texts
  const addDomainTexts = (domainName: string, sub: string, obj: string, findings: string[]) => {
    if (sub && sub.trim()) subjectivePool.push({ domain: domainName, text: sub });
    if (obj && obj.trim()) objectivePool.push({ domain: domainName, text: obj });
    findings.forEach(f => objectivePool.push({ domain: domainName, text: f }));
  };

  addDomainTexts('Neurosensori', domains.neurosensori.subjective, domains.neurosensori.objective, domains.neurosensori.findings);
  addDomainTexts('Sirkulasi', domains.sirkulasi.subjective, domains.sirkulasi.objective, domains.sirkulasi.findings);
  addDomainTexts('Pernapasan', domains.pernapasan.subjective, domains.pernapasan.objective, domains.pernapasan.findings);
  addDomainTexts('Nyeri & Kenyamanan', domains.nyeriKetidaknyamanan.subjective, domains.nyeriKetidaknyamanan.objective, domains.nyeriKetidaknyamanan.findings);
  addDomainTexts('Makanan & Cairan', domains.makananCairan.subjective, domains.makananCairan.objective, domains.makananCairan.findings);
  addDomainTexts('Eliminasi', domains.eliminasi.subjective, domains.eliminasi.objective, domains.eliminasi.findings);
  addDomainTexts('Seksualitas', domains.seksualitas.subjective, domains.seksualitas.objective, domains.seksualitas.findings);
  addDomainTexts('Aktivitas & Istirahat', domains.aktivitasIstirahat.subjective, domains.aktivitasIstirahat.objective, domains.aktivitasIstirahat.findings);
  addDomainTexts('Hygiene', domains.hygiene.subjective, domains.hygiene.objective, domains.hygiene.findings);
  addDomainTexts('Integritas Ego', domains.integritasEgo.subjective, domains.integritasEgo.objective, domains.integritasEgo.findings);
  addDomainTexts('Interaksi Sosial', domains.interaksiSosial.subjective, domains.interaksiSosial.objective, domains.interaksiSosial.findings);
  addDomainTexts('Penyuluhan & Pembelajaran', domains.penyuluhanPembelajaran.subjective, domains.penyuluhanPembelajaran.objective, domains.penyuluhanPembelajaran.findings);
  addDomainTexts('Patient Safety', domains.patientSafety.subjective, domains.patientSafety.objective, domains.patientSafety.findings);

  // Add history chief complaints
  if (patient.history.chiefComplaintAssessment) {
    subjectivePool.push({ domain: 'Keluhan Utama', text: patient.history.chiefComplaintAssessment });
  }

  // Combined lower-case search strings
  const fullSubStr = subjectivePool.map(s => s.text.toLowerCase()).join(' ') + ' ' + (patient.history.chiefComplaintAssessment?.toLowerCase() || '');
  const fullObjStr = objectivePool.map(o => o.text.toLowerCase()).join(' ') + ' ' +
    `${pex.extremities.deformityNotes || ''} ${pex.thoraxLungs.auscultation || ''} ${pex.extremities.edema || ''}`.toLowerCase();

  // Test abnormal lab flags
  const highLeukosit = labs.some(l => l.testName.toLowerCase().includes('leukosit') && l.flag === 'high');
  const lowHb = labs.some(l => l.testName.toLowerCase().includes('hemoglobin') && l.flag === 'low');
  const highGds = labs.some(l => l.testName.toLowerCase().includes('glukosa') && l.flag === 'high');

  // Evaluate each catalog diagnosis
  for (const cat of ALL_CATALOG_3S) {
    let matchScore = 0;
    const reasons: string[] = [];
    const dsQuotes: string[] = [];
    const doQuotes: string[] = [];
    let etiology = cat.causes[0] || 'Kondisi klinis terkait';

    if (cat.code === 'D.0077') {
      // Nyeri Akut: Skala Nyeri >= 1, mengeluh nyeri, PQRST, meringis
      if (pain.severityScale > 0 || fullSubStr.includes('nyeri') || fullSubStr.includes('sakit')) {
        matchScore += 45;
        reasons.push(`Skala nyeri terukur ${pain.severityScale}/10 (P: ${pain.palliativeProvocative || '-'}, Q: ${pain.quality || '-'})`);
        dsQuotes.push(`Pasien mengeluh nyeri pada ${pain.regionRadiating || 'area terdampak'} dengan skala ${pain.severityScale}/10 (${pain.quality || 'seperti tertusuk/berdenyut'})`);
      }
      if (fullObjStr.includes('meringis') || fullObjStr.includes('protektif') || ttv.heartRate > 100 || ttv.bloodPressureSystolic >= 140) {
        matchScore += 40;
        reasons.push('Tampak ekspresi meringis, bersikap protektif, atau perubahan TTV terkait nyeri');
        doQuotes.push(`Tampak meringis menahan nyeri, bersikap protektif, TD: ${ttv.bloodPressureSystolic}/${ttv.bloodPressureDiastolic} mmHg, Nadi: ${ttv.heartRate} x/mnt`);
      }
      if (patient.identity.medicalDiagnosis.toLowerCase().includes('fraktur') || patient.identity.medicalDiagnosis.toLowerCase().includes('post op') || patient.identity.medicalDiagnosis.toLowerCase().includes('trauma')) {
        matchScore += 15;
        etiology = 'Agen pencedera fisik (trauma / kerusakan jaringan / diskontinuitas tulang)';
      }
    } else if (cat.code === 'D.0054') {
      // Gangguan Mobilitas Fisik
      const minStrength = Math.min(
        pex.extremities.upperRightStrength,
        pex.extremities.upperLeftStrength,
        pex.extremities.lowerRightStrength,
        pex.extremities.lowerLeftStrength
      );
      if (minStrength < 5 || fullSubStr.includes('sulit gerak') || fullSubStr.includes('keterbatasan gerak') || fullSubStr.includes('bedrest') || fullSubStr.includes('kruk')) {
        matchScore += 45;
        reasons.push(`Penurunan kekuatan otot ekstremitas (nilai terendah: ${minStrength}/5)`);
        dsQuotes.push(`Pasien mengeluh sulit menggerakkan bagian tubuh yang sakit dan merasa terbatas dalam beraktivitas`);
        doQuotes.push(`Kekuatan otot: Ekstremitas Atas (${pex.extremities.upperRightStrength}/${pex.extremities.upperLeftStrength}), Ekstremitas Bawah (${pex.extremities.lowerRightStrength}/${pex.extremities.lowerLeftStrength}), ROM menurun, terpasang gips/imobilisasi`);
      }
      if (fullObjStr.includes('kelemahan') || fullObjStr.includes('terbatas') || fullObjStr.includes('gips') || fullObjStr.includes('kruk') || patient.identity.medicalDiagnosis.toLowerCase().includes('fraktur')) {
        matchScore += 40;
        reasons.push('Gerakan terbatas dan ketergantungan mobilisasi');
        etiology = 'Kerusakan integritas struktur tulang dan nyeri saat bergerak';
      }
    } else if (cat.code === 'D.0129') {
      // Gangguan Integritas Kulit / Jaringan
      if (fullObjStr.includes('luka') || fullObjStr.includes('robek') || fullObjStr.includes('insisi') || fullObjStr.includes('operasi') || fullObjStr.includes('fraktur terbuka') || fullObjStr.includes('lecet')) {
        matchScore += 80;
        reasons.push('Terdapat kerusakan integritas lapisan kulit / diskontinuitas jaringan atau luka operasi/trauma');
        doQuotes.push(`Tampak diskontinuitas jaringan/luka operasi atau lesi kulit: ${pex.extremities.deformityNotes || 'terdapat luka insisi pasca reduksi/fiksasi'}`);
        etiology = 'Faktor mekanis (prosedur pembedahan / trauma fisik)';
      }
    } else if (cat.code === 'D.0142') {
      // Risiko Infeksi
      if (highLeukosit || fullObjStr.includes('luka') || fullObjStr.includes('infus') || fullObjStr.includes('kateter') || ttv.temperature >= 37.5) {
        matchScore += 75;
        if (highLeukosit) reasons.push('Peningkatan kadar leukosit darah di atas rentang normal');
        reasons.push('Adanya portal masuk kuman (luka terbuka, akses intravena / kateter, prosedur invasif)');
        doQuotes.push(`Terdapat luka terbuka / luka operasi terpasang balutan, akses intravena aktif, Leukosit: ${labs.find(l => l.testName.toLowerCase().includes('leukosit'))?.result || '-'} /uL, Suhu: ${ttv.temperature} °C`);
        etiology = 'Efek prosedur invasif, luka operasi terbuka, dan penurunan integritas pertahanan kulit';
      }
    } else if (cat.code === 'D.0143') {
      // Risiko Jatuh (Morse Scale)
      if (morse.totalScore >= 25) {
        matchScore += 85;
        reasons.push(`Skor Morse Fall Scale ${morse.totalScore} kategori ${morse.riskCategory}`);
        doQuotes.push(`Skor Morse Fall Scale: ${morse.totalScore} (${morse.riskCategory}), menggunakan alat bantu gerak, riwayat jatuh / keterbatasan mobilitas`);
        etiology = 'Kelemahan anggota gerak bawah, pemakaian gips/alat bantu, dan status pasca operasi';
      }
    } else if (cat.code === 'D.0001') {
      // Bersihan Jalan Napas Tidak Efektif
      if (fullObjStr.includes('sputum') || fullObjStr.includes('ronkhi') || fullObjStr.includes('batuk tidak efektif') || fullSubStr.includes('dahak sulit keluar')) {
        matchScore += 80;
        reasons.push('Terdengar ronkhi / penumpukan sputum dan batuk tidak efektif');
        dsQuotes.push('Pasien mengeluh sesak dan dahak kental sulit dikeluarkan');
        doQuotes.push(`Auskultasi: ${pex.thoraxLungs.auscultation || 'terdengar ronkhi'}, batuk tidak efektif, frekuensi nafas ${ttv.respiratoryRate} x/mnt`);
        etiology = 'Sekresi yang tertahan dan hipersekresi jalan napas';
      }
    } else if (cat.code === 'D.0005') {
      // Pola Napas Tidak Efektif
      if (ttv.respiratoryRate > 24 || ttv.respiratoryRate < 14 || fullSubStr.includes('sesak') || fullObjStr.includes('retraksi') || fullObjStr.includes('cuping hidung')) {
        matchScore += 70;
        reasons.push(`Frekuensi nafas abnormal (${ttv.respiratoryRate} x/mnt) dan penggunaan otot bantu napas`);
        dsQuotes.push('Pasien mengeluh sesak napas terutama saat bergerak atau berbaring datar');
        doQuotes.push(`RR: ${ttv.respiratoryRate} x/mnt, SpO2: ${ttv.spO2}%, tampak penggunaan otot bantu pernapasan`);
        etiology = 'Hambatan upaya napas (nyeri saat bernapas / kelelahan otot pernapasan)';
      }
    } else if (cat.code === 'D.0009') {
      // Perfusi Perifer Tidak Efektif
      if (fullObjStr.includes('crt >') || fullObjStr.includes('akral dingin') || fullObjStr.includes('pucat') || fullObjStr.includes('nadi lemah') || lowHb) {
        matchScore += 75;
        reasons.push('Pengisian kapiler (CRT) memanjang, akral dingin, atau anemia');
        doQuotes.push(`CRT > 3 detik, akral teraba dingin, konjungtiva anemis, kadar Hb: ${labs.find(l => l.testName.toLowerCase().includes('hemoglobin'))?.result || '-'} g/dL`);
        etiology = 'Penurunan konsentrasi hemoglobin / spasme vascular perifer';
      }
    } else if (cat.code === 'D.0130') {
      // Hipertermia
      if (ttv.temperature > 37.5) {
        matchScore += 85;
        reasons.push(`Suhu tubuh febris (${ttv.temperature} °C)`);
        dsQuotes.push('Pasien mengeluh badan terasa panas dan meriang');
        doQuotes.push(`Suhu tubuh terukur ${ttv.temperature} °C, kulit teraba hangat, takikardia (${ttv.heartRate} x/mnt)`);
        etiology = 'Proses inflamasi / respon infeksi sistemik';
      }
    } else if (cat.code === 'D.0109') {
      // Defisit Perawatan Diri
      if (fullSubStr.includes('tidak bisa mandi') || fullSubStr.includes('dibantu keluarga') || fullObjStr.includes('ketergantungan') || fullObjStr.includes('keterbatasan mandi')) {
        matchScore += 70;
        reasons.push('Keterbatasan kemandirian aktivitas merawat diri (mandi/berpakaian)');
        dsQuotes.push('Pasien mengeluh belum bisa mandi atau ganti baju sendiri, semua dibantu perawat/keluarga');
        doQuotes.push('Ketergantungan total/parsial dalam pemenuhan ADL (mandi, berpakaian, toileting) akibat imobilisasi');
        etiology = 'Gangguan muskuloskeletal dan nyeri saat bergerak';
      }
    } else if (cat.code === 'D.0080') {
      // Ansietas
      if (fullSubStr.includes('cemas') || fullSubStr.includes('khawatir') || fullSubStr.includes('takut operasi') || fullObjStr.includes('gelisah') || fullObjStr.includes('tegang')) {
        matchScore += 75;
        reasons.push('Verbalisasi rasa cemas/khawatir terhadap penyakit dan prosedur perawatan');
        dsQuotes.push('Pasien menyatakan khawatir dengan kondisi kakinya dan takut tidak bisa bekerja lagi seperti semula');
        doQuotes.push('Pasien tampak gelisah, tegang saat diajak bicara mengenai rencana operasi, kontak mata sering berpindah');
        etiology = 'Krisis situasional dan ancaman terhadap status kesehatan';
      }
    } else if (cat.code === 'D.0111') {
      // Defisit Pengetahuan
      if (fullSubStr.includes('tidak tahu') || fullSubStr.includes('bertanya') || fullObjStr.includes('kurang paham')) {
        matchScore += 65;
        reasons.push('Pasien menanyakan tentang prosedur penanganan dan proses pemulihan penyakit');
        dsQuotes.push('Pasien dan keluarga sering menanyakan berapa lama proses penyembuhan dan apa pantangan makanan');
        doQuotes.push('Pasien menunjukkan kebingungan terhadap prosedur perawatan dan instruksi latihan');
        etiology = 'Kurang terpapar informasi mengenai perawatan fraktur dan rehabilitasi';
      }
    } else if (cat.code === 'D.0055') {
      // Gangguan Pola Tidur
      if (fullSubStr.includes('sulit tidur') || fullSubStr.includes('sering terbangun') || fullSubStr.includes('kurang tidur')) {
        matchScore += 70;
        reasons.push('Keluhan sering terbangun malam hari akibat nyeri atau lingkungan RS');
        dsQuotes.push('Pasien mengeluh hanya tidur 3-4 jam per malam karena sering terbangun saat kaki tersenggol atau nyeri datang');
        doQuotes.push('Konjungtiva tampak kemerahan, lingkaran hitam bawah mata, pasien sering menguap');
        etiology = 'Hambatan lingkungan ruangan dan nyeri fisik';
      }
    } else if (cat.code === 'D.0027') {
      // Ketidakstabilan GDS
      if (highGds) {
        matchScore += 80;
        reasons.push('Kadar glukosa darah di atas rentang rujukan normal');
        doQuotes.push(`GDS terukur ${labs.find(l => l.testName.toLowerCase().includes('glukosa'))?.result || '-'} mg/dL`);
        etiology = 'Resistensi insulin dan stres metabolik';
      }
    }

    // Only include candidate if there was some rule match
    if (matchScore >= 40) {
      let confidence: 'Tinggi' | 'Sedang' | 'Rendah' = 'Rendah';
      if (matchScore >= 75) confidence = 'Tinggi';
      else if (matchScore >= 50) confidence = 'Sedang';

      // Generate accurate PES statement adhering to PPNI format:
      // Aktual: [Problem] b.d. [Etiologi] d.d. [Tanda/Gejala]
      // Risiko: [Problem] dibuktikan dengan [Faktor Risiko] (NO "d.d.")
      // Promkes: [Problem] dibuktikan dengan [Tanda/Gejala]
      let pesStatement = '';
      if (cat.type === 'aktual') {
        const symptomsStr = [...dsQuotes, ...doQuotes].slice(0, 2).join(', ');
        pesStatement = `${cat.name} (${cat.code}) b.d. ${etiology} d.d. ${symptomsStr || 'keluhan dan temuan klinis pasien'}`;
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

  // Sort descending by matchScore
  candidates.sort((a, b) => b.matchScore - a.matchScore);
  candidates.forEach((c, idx) => {
    c.priorityOrder = idx + 1;
  });

  return candidates;
}
