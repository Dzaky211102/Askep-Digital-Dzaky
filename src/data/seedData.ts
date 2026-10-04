/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, CarePlan } from '../types/askep';
import { formatWitaDateInput, formatWitaDateTimeInput } from '../utils/witaTime';

export const SEED_PATIENT_ID = 'patient_tn_j_sample';
export const SEED_CAREPLAN_ID = 'careplan_tn_j_sample';

const now = new Date();
const todayWita = formatWitaDateInput(now);
const todayTimeWita = formatWitaDateTimeInput(now);

export const SEED_PATIENT: Patient = {
  id: SEED_PATIENT_ID,
  ownerId: 'default_nurse',
  initials: 'Tn. J',
  mrn: 'RM-2026-8812',
  room: 'Ruang Teratai 3B Bed 02',
  medicalDiagnosis: 'Fraktur Kominutif Ankle Sinistra Closed',
  status: 'aktif',
  admissionDate: todayWita,
  assessmentDate: todayTimeWita,
  cover: {
    title: 'Asuhan Keperawatan pada Tn. J dengan Masalah Fraktur Kominutif Ankle Sinistra di Ruang Teratai RSUD Abdul Wahab Sjahranie',
    stase: 'Keperawatan Medikal Bedah (KMB)',
    studentName: 'Ners. Rahmat Hidayat, S.Kep',
    studentNim: '2411102411163',
    studyProgram: 'Profesi Ners',
    faculty: 'Fakultas Ilmu Keperawatan & Kesehatan',
    university: 'Universitas Muhammadiyah Kalimantan Timur',
    academicYear: '2026/2027',
    room: 'Ruang Teratai (Bedah Orthopedi)',
    hospital: 'RSUD Abdul Wahab Sjahranie Samarinda'
  },
  identity: {
    initials: 'Tn. J',
    mrn: 'RM-2026-8812',
    age: 34,
    gender: 'L',
    address: 'Jl. Pahlawan No. 45, Samarinda, Kalimantan Timur',
    maritalStatus: 'Menikah',
    religion: 'Islam',
    education: 'SMA / Sederajat',
    occupation: 'Wiraswasta',
    ethnicity: 'Bugis / Indonesia',
    admissionDate: todayWita,
    assessmentDate: todayTimeWita,
    medicalDiagnosis: 'Fraktur Kominutif Ankle Sinistra Closed',
    assessmentMethods: {
      autoanamnesa: true,
      alloanamnesa: true,
      pemeriksaanFisik: true,
      statusKlien: true
    }
  },
  history: {
    chiefComplaintAdmission: 'Nyeri hebat pada pergelangan kaki kiri dan tidak dapat digerakkan setelah kecelakaan lalu lintas sepeda motor.',
    chiefComplaintAssessment: 'Pasien mengeluh nyeri berdenyut dan ngilu pada pergelangan kaki kiri yang terpasang bidai spalk, bertambah sakit saat kaki digerakkan.',
    presentIllnessHistory: 'Pasien mengalami kecelakaan motor tunggal pada hari ini sekitar pukul 08.00 WITA akibat menghindari lubang jalan dan terjatuh dengan pergelangan kaki kiri terbentur aspal dan tertindih motor. Pasien langsung diantar warga ke IGD RSUD AWS. Di IGD pasien dipasang infus RL 20 tpm, bidai spalk sementara pada pergelangan kaki kiri, dan diberi injeksi Ketorolac 30mg IV. Setelah dilakukan rontgen cito ankle sinistra, pasien ditransfer ke Ruang Teratai untuk persiapan operasi ORIF.',
    pastMedicalHistory: 'Pasien tidak memiliki riwayat hipertensi, diabetes melitus, asma, atau alergi obat maupun makanan. Pasien belum pernah mengalami patah tulang atau dirawat di rumah sakit sebelumnya.',
    familyMedicalHistory: 'Tidak ada anggota keluarga yang memiliki riwayat penyakit genetik, gangguan pembekuan darah, atau diabetes melitus.',
    genogram: {
      nodes: [
        { id: 'g1_1', generation: 1, gender: 'L', isPatient: false, isDeceased: true, isCoHabitant: false, label: 'Kakek', relation: 'Kakek dari Ayah' },
        { id: 'g1_2', generation: 1, gender: 'P', isPatient: false, isDeceased: true, isCoHabitant: false, label: 'Nenek', relation: 'Nenek dari Ayah' },
        { id: 'g1_3', generation: 1, gender: 'L', isPatient: false, isDeceased: true, isCoHabitant: false, label: 'Kakek', relation: 'Kakek dari Ibu' },
        { id: 'g1_4', generation: 1, gender: 'P', isPatient: false, isDeceased: false, isCoHabitant: false, label: 'Nenek', relation: 'Nenek dari Ibu', age: 78 },
        { id: 'g2_1', generation: 2, gender: 'L', isPatient: false, isDeceased: false, isCoHabitant: false, label: 'Ayah', relation: 'Ayah', age: 60 },
        { id: 'g2_2', generation: 2, gender: 'P', isPatient: false, isDeceased: false, isCoHabitant: false, label: 'Ibu', relation: 'Ibu', age: 57 },
        { id: 'g3_1', generation: 3, gender: 'L', isPatient: true, isDeceased: false, isCoHabitant: true, label: 'Tn. J (Pasien)', relation: 'Pasien', age: 34 },
        { id: 'g3_2', generation: 3, gender: 'P', isPatient: false, isDeceased: false, isCoHabitant: true, label: 'Istri', relation: 'Istri', age: 31 },
        { id: 'g3_3', generation: 3, gender: 'L', isPatient: false, isDeceased: false, isCoHabitant: true, label: 'Anak', relation: 'Anak ke-1', age: 6 }
      ],
      notes: 'Genogram 3 generasi. Pasien tinggal serumah bersama istri dan 1 orang anak laki-laki.'
    }
  },
  domains: {
    vitalSigns: {
      bloodPressureSystolic: 130,
      bloodPressureDiastolic: 85,
      heartRate: 92,
      respiratoryRate: 20,
      temperature: 36.9,
      spO2: 98,
      gcsEye: 4,
      gcsVerbal: 5,
      gcsMotor: 6,
      gcsTotal: 15,
      weightKg: 68,
      heightCm: 170,
      bmi: 23.5,
      consciousness: 'Compos Mentis'
    },
    morseFallScale: {
      historyOfFalling: 25, // Ya, jatuh kecelakaan motor hari ini
      secondaryDiagnosis: 15, // Ya
      ambulatoryAid: 15, // Kruk / bedrest / dibantu
      ivTherapy: 20, // Ya, terpasang infus RL
      gaitTransferring: 20, // Gangguan gaya berjalan / imobilitas
      mentalStatus: 0, // Sadar akan kemampuan diri
      totalScore: 95,
      riskCategory: 'Risiko Tinggi (≥51)'
    },
    painAssessment: {
      palliativeProvocative: 'Nyeri bertambah saat menggerakkan pergelangan kaki atau tersenggol; berkurang saat diistirahatkan dan diposisikan lebih tinggi.',
      quality: 'Terasa berdenyut-denyut dan tertusuk tajam.',
      regionRadiating: 'Pergelangan kaki kiri (ankle sinistra), nyeri menjalar hingga ke pertengahan betis.',
      severityScale: 7,
      timingDuration: 'Nyeri terus-menerus timbul, semakin intens jika pergelangan kaki berubah posisi.'
    },
    neurosensori: {
      findings: ['GCS 15 Compos Mentis', 'Pupil isokor 3mm/3mm refleks cahaya positif', 'Sensasi sensori ekstremitas atas normal', 'Parestesia ringan di ujung jari kaki kiri akibat edema'],
      subjective: 'Pasien mengatakan kadang terasa kesemutan ringan di jemari kaki kiri karena dibebat.',
      objective: 'Kesadaran Compos Mentis (E4V5M6), pupil isokor, refleks cahaya (+/+), tidak ada defisit saraf kranial.'
    },
    sirkulasi: {
      findings: ['Akral hangat pada 3 ekstremitas', 'CRT kaki kanan < 2 detik', 'CRT kaki kiri 3 detik', 'Edema lokal ankle sinistra', 'Nadi dorsalis pedis teraba cukup kuat'],
      subjective: 'Pasien merasa kaki kirinya bengkak dan kencang pada area pergelangan.',
      objective: 'TD 130/85 mmHg, Nadi 92 x/mnt reguler, CRT kaki kiri 3 detik, teraba edema non-pitting di sekitar maleolus lateralis dan medialis.'
    },
    pernapasan: {
      findings: ['Suara napas vesikuler di seluruh lapang paru', 'Tidak ada suara napas tambahan wheezing/ronkhi', 'RR 20 x/mnt teratur', 'SpO2 98% room air'],
      subjective: 'Pasien mengatakan tidak sesak napas dan tidak ada batuk.',
      objective: 'Thorax simetris bilateral, pernapasan teratur tanpa retraksi dinding dada, auskultasi vesikuler.'
    },
    nyeriKetidaknyamanan: {
      findings: ['Skala nyeri 7/10', 'Ekspresi wajah meringis', 'Sikap protektif memegangi tepi ranjang saat kaki tersenggol'],
      subjective: 'Pasien mengeluh nyeri skala 7/10 pada pergelangan kaki kiri, rasanya nyut-nyutan dan menusuk tajam.',
      objective: 'Pasien tampak meringis menahan nyeri dan berhati-hati saat merubah posisi tubuh di tempat tidur.'
    },
    makananCairan: {
      findings: ['Nafsu makan baik', 'Diet nasi biasa porsi habis 3/4', 'Turgor kulit elastis', 'Mukosa bibir lembap', 'Terpasang infus RL 20 tpm di tangan kanan'],
      subjective: 'Pasien mengatakan tidak ada mual atau muntah, makan habis 3/4 porsi.',
      objective: 'Turgor kulit elastis < 2 detik, mukosa oral lembap, bising usus 10x/mnt, intake cairan 1800 ml/24 jam, output urin 1500 ml/24 jam.',
      fluidIntakeMl: 1800,
      fluidOutputMl: 1500,
      fluidBalanceMl: 300
    },
    eliminasi: {
      findings: ['BAK spontan menggunakan urinal di tempat tidur', 'Warna urin kuning jernih', 'BAB belum sejak masuk RS'],
      subjective: 'Pasien mengatakan kencing lancar di tempat tidur dibantu istri memakai urinal, belum buang air besar sejak pagi.',
      objective: 'Abdomen supel, tidak distensi, kandung kemih tidak teraba tegang, output urin 1500 ml/24 jam kuning jernih.'
    },
    seksualitas: {
      findings: ['Tidak ada keluhan organ reproduksi'],
      subjective: 'Pasien mengatakan tidak ada keluhan terkait sistem perkemihan atau organ genital.',
      objective: 'Area genital bersih, tidak ada kelainan anatomis.'
    },
    aktivitasIstirahat: {
      findings: ['Keterbatasan pergerakan ekstremitas kiri bawah', 'Terpasang bidai spalk gips', 'Tirah baring (bedrest)', 'Kekuatan otot kaki kiri terbatas 2/5 akibat nyeri dan fraktur', 'Tidur terganggu saat nyeri timbul'],
      subjective: 'Pasien mengatakan tidak bisa bangun dari tempat tidur dan tidak bisa melangkah sama sekali dengan kaki kirinya.',
      objective: 'Aktivitas sebagian besar di tempat tidur (Indeks Barthel: ketergantungan moderat), kekuatan otot ekstremitas kiri bawah 2/5, rentang gerak (ROM) ankle sinistra terfiksasi bidai.'
    },
    hygiene: {
      findings: ['Perawatan diri mandi diseka di tempat tidur', 'Berpakaian dibantu keluarga dan perawat'],
      subjective: 'Pasien mengatakan mandi dan ganti pakaian dibantu oleh istri dan perawat.',
      objective: 'Kebersihan tubuh terjaga cukup, kuku bersih, pakaian bersih dan rapi.'
    },
    integritasEgo: {
      findings: ['Pasien tampak agak tegang memikirkan rencana tindakan operasi', 'Mencari informasi tentang keberhasilan operasi ORIF'],
      subjective: 'Pasien mengatakan agak cemas karena ini pertama kalinya harus dioperasi dan dipasang pen/plat.',
      objective: 'Kontak mata baik, sesekali tampak termenung, kooperatif saat berkomunikasi.'
    },
    interaksiSosial: {
      findings: ['Didampingi penuh oleh istri', 'Keluarga memberikan dukungan moral penuh'],
      subjective: 'Pasien merasa tenang karena didampingi oleh istri tercinta.',
      objective: 'Hubungan interpersonal pasien dengan perawat dan dokter baik dan komunikatif.'
    },
    penyuluhanPembelajaran: {
      findings: ['Pasien dan keluarga menanyakan tentang persiapan operasi besok pagi'],
      subjective: 'Pasien menanyakan jam berapa harus mulai puasa sebelum operasi dan berapa lama pemulihan pasca operasi.',
      objective: 'Pasien mendengarkan penjelasan perawat dengan seksama dan mengulang arahan dasar.'
    },
    patientSafety: {
      findings: ['Skor Morse 95 (Risiko Tinggi)', 'Terpasang gelang penanda risiko jatuh kuning', 'Side rail ranjang terpasang kedua sisi', 'Lantai kamar kering', 'Bel perawat berada dekat jangkauan'],
      subjective: 'Pasien menyatakan memahami instruksi untuk tidak turun dari tempat tidur sendirian.',
      objective: 'Gelang identitas dan gelang risiko jatuh warna kuning terpasang aman di pergelangan tangan kiri, kedua pengaman tempat tidur dinaikkan.'
    }
  },
  physicalExam: {
    head: 'Bentuk mesocephal, kulit kepala bersih, tidak ada benjolan atau hematoma.',
    eyes: 'Konjungtiva anemis (-/-), sklera ikterik (-/-), refleks pupil (+/+), tidak ada edema periorbita.',
    ears: 'Simetris, bersih, serumen minimal, tidak ada perdarahan atau sekret, pendengaran baik.',
    nose: 'Simetris, deviasi septum (-), sekret (-), pernapasan cuping hidung (-).',
    mouth: 'Mukosa bibir lembap, tidak sianosis, gigi utuh, faring tidak hiperemis.',
    neck: 'JVP dalam batas normal (5-2 cmH2O), tidak ada pembesaran kelenjar tiroid atau limfadenopati.',
    thoraxLungs: {
      inspection: 'Bentuk thoraks normochest, gerakan dinding dada simetris saat inspirasi dan ekspirasi, retraksi (-).',
      palpation: 'Vocal fremitus teraba simetris di kedua lapang paru kanan dan kiri.',
      percussion: 'Sonor di seluruh lapang paru.',
      auscultation: 'Suara napas vesikuler di kedua paru, ronkhi (-/-), wheezing (-/-).'
    },
    thoraxHeart: {
      inspection: 'Iktus kordis tidak terlihat.',
      palpation: 'Iktus kordis teraba di ICS V linea midklavikularis sinistra, tidak ada thrill.',
      percussion: 'Batas jantung kanan ICS IV linea parasternalis dekstra, batas kiri ICS V linea midklavikularis sinistra.',
      auscultation: 'Bunyi jantung I dan II murni reguler, gallop (-), murmur (-).'
    },
    abdomen: {
      inspection: 'Dinding perut datar, simetris, tidak ada luka operasi atau distensi.',
      auscultation: 'Bising usus 10 kali/menit, normal.',
      palpation: 'Supel, nyeri tekan (-), hepar dan lien tidak teraba membesar.',
      percussion: 'Timpani di seluruh kuadran abdomen.'
    },
    inguinalGenitalia: 'Kebersihan baik, tidak ada hernia, tidak ada lesi kulit atau perdarahan.',
    extremities: {
      upperRightStrength: 5,
      upperLeftStrength: 5,
      lowerRightStrength: 5,
      lowerLeftStrength: 2,
      edema: 'Edema lokal non-pitting pada pergelangan kaki kiri (+)',
      turgor: 'Elastis < 2 detik',
      deformityNotes: 'Ekstremitas bawah sinistra: terpasang bidai spalk gips dari bawah lutut hingga telapak kaki, deformitas pergelangan kaki kiri akibat fraktur tertutup kominutif maleolus lateralis/medialis, nyeri tekan lokal hebat (+), krepitasi terfiksasi bidai, CRT jemari kaki kiri 3 detik.'
    }
  },
  diagnostics: {
    laboratories: [
      { id: 'lab1', date: todayWita, testName: 'Hemoglobin (Hb)', result: '11.8', numericResult: 11.8, unit: 'g/dL', normalRange: '12.0 - 16.0', normalMin: 12.0, normalMax: 16.0, flag: 'low' },
      { id: 'lab2', date: todayWita, testName: 'Leukosit', result: '11800', numericResult: 11800, unit: '/uL', normalRange: '4.000 - 10.000', normalMin: 4000, normalMax: 10000, flag: 'high' },
      { id: 'lab3', date: todayWita, testName: 'Trombosit', result: '240000', numericResult: 240000, unit: '/uL', normalRange: '150.000 - 450.000', normalMin: 150000, normalMax: 450000, flag: 'normal' },
      { id: 'lab4', date: todayWita, testName: 'Hematokrit (Ht)', result: '36.5', numericResult: 36.5, unit: '%', normalRange: '37 - 48', normalMin: 37, normalMax: 48, flag: 'low' },
      { id: 'lab5', date: todayWita, testName: 'Glukosa Darah Sewaktu (GDS)', result: '108', numericResult: 108, unit: 'mg/dL', normalRange: '70 - 140', normalMin: 70, normalMax: 140, flag: 'normal' },
      { id: 'lab6', date: todayWita, testName: 'Ureum', result: '24', numericResult: 24, unit: 'mg/dL', normalRange: '15 - 45', normalMin: 15, normalMax: 45, flag: 'normal' },
      { id: 'lab7', date: todayWita, testName: 'Kreatinin', result: '0.85', numericResult: 0.85, unit: 'mg/dL', normalRange: '0.6 - 1.2', normalMin: 0.6, normalMax: 1.2, flag: 'normal' },
      { id: 'lab8', date: todayWita, testName: 'Natrium (Na+)', result: '139', numericResult: 139, unit: 'mEq/L', normalRange: '135 - 145', normalMin: 135, normalMax: 145, flag: 'normal' },
      { id: 'lab9', date: todayWita, testName: 'Kalium (K+)', result: '4.1', numericResult: 4.1, unit: 'mEq/L', normalRange: '3.5 - 5.1', normalMin: 3.5, normalMax: 5.1, flag: 'normal' }
    ],
    radiologies: [
      {
        id: 'rad1',
        date: todayWita,
        examinationType: 'Foto Rontgen Ankle Sinistra Proyeksi AP / Lateral',
        impression: 'Tampak diskontinuitas tulang komplit kominutif pada distal fibula dan maleolus medialis os tibia sinistra dengan dislokasi subluksasi sendi talocruralis. Soft tissue swelling (+). Kesan: Fraktur Kominutif Bimalleolar Ankle Sinistra.'
      }
    ]
  },
  therapies: [
    { id: 'th1', medicationName: 'Ketorolac Tromethamine', dose: '30 mg', route: 'IV', frequency: 'Tiap 8 jam', indication: 'Analgetik kuat untuk penanganan nyeri akut pasca fraktur', startDate: todayWita },
    { id: 'th2', medicationName: 'Ceftriaxone', dose: '1 gram', route: 'IV', frequency: 'Tiap 12 jam', indication: 'Antibiotik profilaksis perioperatif orthopedi', startDate: todayWita },
    { id: 'th3', medicationName: 'Ranitidine', dose: '50 mg', route: 'IV', frequency: 'Tiap 12 jam', indication: 'Gastroprotektor pencegah stres ulcer', startDate: todayWita },
    { id: 'th4', medicationName: 'Cairan Ringer Laktat (RL)', dose: '500 mL / 20 tpm', route: 'IV', frequency: 'Kontinu intravena', indication: 'Pemeliharaan cairan dan elektrolit', startDate: todayWita }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const SEED_CAREPLAN: CarePlan = {
  id: SEED_CAREPLAN_ID,
  patientId: SEED_PATIENT_ID,
  ownerId: 'default_nurse',
  candidates: [],
  diagnoses: [
    {
      id: 'dx_1',
      priority: 1,
      sdkCode: 'D.0077',
      problem: 'Nyeri Akut',
      type: 'aktual',
      etiology: 'Agen pencedera fisik (diskontinuitas tulang dan trauma fraktur kominutif ankle sinistra)',
      signsSymptoms: 'Mengeluh nyeri skala 7/10, meringis, bersikap protektif, nadi 92x/mnt, TD 130/85 mmHg',
      pesStatement: 'Nyeri Akut (D.0077) b.d. Agen pencedera fisik (trauma diskontinuitas jaringan tulang ankle sinistra) d.d. Mengeluh nyeri berdenyut skala 7/10, tampak meringis menahan nyeri, bersikap protektif memegangi tepi ranjang, nadi 92 x/mnt.',
      dataFocus: {
        subjective: [
          'Pasien mengeluh nyeri berdenyut dan tertusuk tajam pada pergelangan kaki kiri dengan skala 7/10.',
          'Nyeri bertambah parah jika kaki kiri bergerak atau tersenggol.'
        ],
        objective: [
          'Tampak ekspresi wajah meringis menahan sakit.',
          'Bersikap protektif menghindari sentuhan pada pergelangan kaki kiri.',
          'Nadi: 92 x/menit, TD: 130/85 mmHg.'
        ]
      },
      outcome: {
        code: 'L.08066',
        label: 'Tingkat Nyeri',
        expectation: 'Menurun',
        timeframeHours: 72,
        indicators: [
          { id: 'ind_nyeri_1', name: 'Keluhan nyeri berkurang', targetScale: 4, currentScale: 2 },
          { id: 'ind_nyeri_2', name: 'Meringis menurun', targetScale: 4, currentScale: 2 },
          { id: 'ind_nyeri_3', name: 'Sikap protektif menurun', targetScale: 5, currentScale: 2 },
          { id: 'ind_nyeri_4', name: 'Pola tidur membaik', targetScale: 4, currentScale: 3 }
        ]
      },
      interventions: [
        {
          code: 'I.08238',
          label: 'Manajemen Nyeri',
          type: 'utama',
          actions: [
            { id: 'act_1', category: 'Observasi', description: 'Identifikasi lokasi, karakteristik, durasi, frekuensi, kualitas, intensitas nyeri (PQRST)', isSelected: true },
            { id: 'act_2', category: 'Observasi', description: 'Identifikasi skala nyeri secara berkala (skala 0-10)', isSelected: true },
            { id: 'act_3', category: 'Terapeutik', description: 'Berikan teknik nonfarmakologis untuk mengurangi rasa nyeri (relaksasi napas dalam, elevasi tungkai)', isSelected: true },
            { id: 'act_4', category: 'Terapeutik', description: 'Pertahankan fiksasi dan posisi bidai spalk pergelangan kaki kiri tetap stabil', isSelected: true },
            { id: 'act_5', category: 'Edukasi', description: 'Jelaskan penyebab nyeri dan ajarkan teknik napas dalam saat serangan nyeri timbul', isSelected: true },
            { id: 'act_6', category: 'Kolaborasi', description: 'Kolaborasi pemberian analgetik Ketorolac 30mg IV tiap 8 jam', isSelected: true }
          ]
        }
      ]
    },
    {
      id: 'dx_2',
      priority: 2,
      sdkCode: 'D.0054',
      problem: 'Gangguan Mobilitas Fisik',
      type: 'aktual',
      etiology: 'Kerusakan integritas struktur tulang dan nyeri saat bergerak',
      signsSymptoms: 'Mengeluh sulit menggerakkan kaki kiri, kekuatan otot ekstremitas kiri bawah 2/5, gerakan terbatas, terpasang bidai',
      pesStatement: 'Gangguan Mobilitas Fisik (D.0054) b.d. Kerusakan integritas struktur tulang ankle sinistra dan nyeri saat bergerak d.d. Pasien mengeluh tidak bisa berjalan/menggerakkan kaki kiri, kekuatan otot kaki kiri 2/5, gerakan terbatas dengan bidai terpasang.',
      dataFocus: {
        subjective: ['Pasien mengatakan tidak dapat menggerakkan kaki kiri untuk melangkah atau menumpu berat badan.'],
        objective: ['Kekuatan otot ekstremitas kiri bawah 2/5, terpasang bidai spalk dari lutut hingga ujung kaki, ADL dibantu penuh.']
      },
      outcome: {
        code: 'L.05042',
        label: 'Mobilitas Fisik',
        expectation: 'Meningkat',
        timeframeHours: 72,
        indicators: [
          { id: 'ind_mob_1', name: 'Pergerakan ekstremitas membaik', targetScale: 4, currentScale: 2 },
          { id: 'ind_mob_2', name: 'Kekuatan otot membaik', targetScale: 4, currentScale: 2 },
          { id: 'ind_mob_3', name: 'Rentang gerak (ROM) sendi lain terpelihara', targetScale: 5, currentScale: 3 }
        ]
      },
      interventions: [
        {
          code: 'I.05173',
          label: 'Dukungan Mobilisasi',
          type: 'utama',
          actions: [
            { id: 'act_mob_1', category: 'Observasi', description: 'Identifikasi toleransi fisik melakukan pergerakan dan monitor kondisi umum', isSelected: true },
            { id: 'act_mob_2', category: 'Terapeutik', description: 'Fasilitasi alih baring miring tiap 2 jam dengan bantal penyangga pada kaki yang cedera', isSelected: true },
            { id: 'act_mob_3', category: 'Edukasi', description: 'Ajarkan latihan rentang gerak pasif dan aktif pada ekstremitas yang sehat', isSelected: true },
            { id: 'act_mob_4', category: 'Kolaborasi', description: 'Kolaborasi dengan fisioterapis dalam program mobilisasi bertahap pasca operasi', isSelected: true }
          ]
        }
      ]
    },
    {
      id: 'dx_3',
      priority: 3,
      sdkCode: 'D.0143',
      problem: 'Risiko Jatuh',
      type: 'risiko',
      etiology: 'Kelemahan ekstremitas bawah sinistra, pemakaian alat bantu/bidai, dan status pasca trauma',
      signsSymptoms: 'Faktor risiko: Skor Morse Fall Scale 95 (Risiko Tinggi), terpasang infus IV, keterbatasan mobilitas',
      pesStatement: 'Risiko Jatuh (D.0143) dibuktikan dengan kelemahan anggota gerak bawah sinistra akibat fraktur, pemakaian bidai spalk, terpasang infus intravena, dan skor Morse Fall Scale 95 (kategori risiko tinggi).',
      dataFocus: {
        subjective: ['Pasien mengatakan sadar kakinya tidak bisa digerakkan dan berjanji tidak akan turun sendiri.'],
        objective: ['Skor Morse Fall Scale 95 (Risiko Tinggi), terpasang infus RL, terpasang bidai spalk kaki kiri.']
      },
      outcome: {
        code: 'L.14138',
        label: 'Tingkat Jatuh',
        expectation: 'Menurun',
        timeframeHours: 72,
        indicators: [
          { id: 'ind_jatuh_1', name: 'Jatuh dari tempat tidur tidak terjadi', targetScale: 5, currentScale: 5 },
          { id: 'ind_jatuh_2', name: 'Kepatuhan penggunaan pengaman ranjang', targetScale: 5, currentScale: 5 }
        ]
      },
      interventions: [
        {
          code: 'I.14540',
          label: 'Pencegahan Jatuh',
          type: 'utama',
          actions: [
            { id: 'act_jatuh_1', category: 'Observasi', description: 'Identifikasi faktor risiko jatuh berkala dan pasang gelang penanda risiko jatuh warna kuning', isSelected: true },
            { id: 'act_jatuh_2', category: 'Terapeutik', description: 'Pastikan pengaman tempat tidur (side rails) selalu terpasang di kedua sisi dan roda ranjang terkunci', isSelected: true },
            { id: 'act_jatuh_3', category: 'Terapeutik', description: 'Dekatkan tombol bel pemanggil dan perlengkapan penting dalam jangkauan tangan pasien', isSelected: true },
            { id: 'act_jatuh_4', category: 'Edukasi', description: 'Edukasi keluarga untuk selalu mendampingi pasien dan meminta bantuan perawat jika butuh berpindah', isSelected: true }
          ]
        }
      ]
    }
  ],
  implementations: [
    {
      id: 'impl_1',
      diagnosisId: 'dx_1',
      sikiCode: 'I.08238',
      actionId: 'act_1',
      actionDescription: 'Mengidentifikasi lokasi, karakteristik, durasi, frekuensi, kualitas, intensitas nyeri (PQRST)',
      category: 'Observasi',
      timestampWita: `${todayWita} 08:30:00 WITA`,
      dateWita: todayWita,
      timeWita: '08:30',
      shift: 'pagi',
      operatorName: 'Ners. Rahmat Hidayat, S.Kep',
      patientResponse: 'Pasien menyatakan nyeri skala 7/10 berdenyut di pergelangan kaki kiri, bertambah jika kaki digerakkan.',
      isCompleted: true
    },
    {
      id: 'impl_2',
      diagnosisId: 'dx_1',
      sikiCode: 'I.08238',
      actionId: 'act_3',
      actionDescription: 'Memberikan teknik nonfarmakologis relaksasi nafas dalam dan memposisikan kaki kiri lebih tinggi dengan bantal',
      category: 'Terapeutik',
      timestampWita: `${todayWita} 09:00:00 WITA`,
      dateWita: todayWita,
      timeWita: '09:00',
      shift: 'pagi',
      operatorName: 'Ners. Rahmat Hidayat, S.Kep',
      patientResponse: 'Pasien mempraktikkan nafas dalam, kaki ditinggikan 15 derajat, pasien merasa lebih rileks.',
      isCompleted: true
    },
    {
      id: 'impl_3',
      diagnosisId: 'dx_1',
      sikiCode: 'I.08238',
      actionId: 'act_6',
      actionDescription: 'Melakukan kolaborasi pemberian analgetik Ketorolac 30mg via bolus intravena',
      category: 'Kolaborasi',
      timestampWita: `${todayWita} 09:15:00 WITA`,
      dateWita: todayWita,
      timeWita: '09:15',
      shift: 'pagi',
      operatorName: 'Ners. Rahmat Hidayat, S.Kep',
      patientResponse: 'Obat masuk perlahan melalui selang infus, tidak ada tanda alergi/ekstravasasi, 30 menit kemudian nyeri menurun ke skala 4/10.',
      isCompleted: true
    },
    {
      id: 'impl_4',
      diagnosisId: 'dx_3',
      sikiCode: 'I.14540',
      actionId: 'act_jatuh_2',
      actionDescription: 'Memasang gelang kuning penanda risiko jatuh dan menaikkan pengaman tempat tidur (side rails) kedua sisi',
      category: 'Terapeutik',
      timestampWita: `${todayWita} 09:30:00 WITA`,
      dateWita: todayWita,
      timeWita: '09:30',
      shift: 'pagi',
      operatorName: 'Ners. Rahmat Hidayat, S.Kep',
      patientResponse: 'Side rail terpasang rapat dan roda bed terkunci, keluarga mengerti pentingnya pengaman ranjang.',
      isCompleted: true
    },
    {
      id: 'impl_5',
      diagnosisId: 'dx_1',
      sikiCode: 'I.08238',
      actionId: 'act_2',
      actionDescription: 'Melakukan evaluasi ulang skala nyeri setelah 2 jam pemberian analgetik',
      category: 'Observasi',
      timestampWita: `${todayWita} 11:30:00 WITA`,
      dateWita: todayWita,
      timeWita: '11:30',
      shift: 'pagi',
      operatorName: 'Ners. Rahmat Hidayat, S.Kep',
      patientResponse: 'Pasien mengatakan nyeri berkurang menjadi skala 3-4/10 dan mulai bisa beristirahat tidur siang.',
      isCompleted: true
    }
  ],
  evaluations: [
    {
      id: 'eval_1',
      diagnosisId: 'dx_1',
      sdkCode: 'D.0077',
      problem: 'Nyeri Akut b.d Agen Pencedera Fisik',
      dateWita: todayWita,
      timeWita: '13:45',
      shift: 'pagi',
      operatorName: 'Ners. Rahmat Hidayat, S.Kep',
      subjective: 'S: Pasien mengatakan nyeri sudah jauh berkurang dibanding tadi pagi, skala nyeri saat ini 3-4 dari 10, rasa berdenyut mereda setelah disuntik dan kaki dielevasikan.',
      objective: 'O: Pasien tampak rileks, ekspresi meringis berkurang, TD 125/80 mmHg, Nadi 84 x/mnt reguler, RR 18 x/mnt, bidai spalk tetap terpasang rapi.',
      painScaleCurrent: 3,
      analysis: {
        ratings: [
          { indicatorId: 'ind_nyeri_1', name: 'Keluhan nyeri berkurang', initialScore: 2, targetScore: 4, evaluatedScore: 4 },
          { indicatorId: 'ind_nyeri_2', name: 'Meringis menurun', initialScore: 2, targetScore: 4, evaluatedScore: 4 },
          { indicatorId: 'ind_nyeri_3', name: 'Sikap protektif menurun', initialScore: 2, targetScore: 5, evaluatedScore: 3 },
          { indicatorId: 'ind_nyeri_4', name: 'Pola tidur membaik', initialScore: 3, targetScore: 4, evaluatedScore: 4 }
        ],
        outcomeStatus: 'Tercapai Sebagian',
        notes: 'Target luaran tercapai sebagian: keluhan nyeri menurun dari skala 7 ke skala 3, meringis mereda, namun pasien masih perlu menjaga posisi imobilisasi.'
      },
      planning: {
        action: 'Lanjutkan intervensi',
        details: 'Lanjutkan observasi skala nyeri tiap 4 jam, lanjutkan teknik relaksasi napas dalam, lanjutkan jadwal injeksi Ketorolac 30mg IV jam 17.00 WITA (dinas sore).'
      }
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
