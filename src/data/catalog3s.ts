/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CatalogItem3S {
  code: string; // SDKI: D.xxxxx
  name: string;
  category: 'Fisiologis' | 'Psikologis' | 'Perilaku' | 'Relasional' | 'Lingkungan';
  subCategory: string; // e.g. Respirasi, Sirkulasi, Nyeri, Aktivitas, Nutrisi, dll
  definition: string;
  type: 'aktual' | 'risiko' | 'promosi_kesehatan';
  causes: string[]; // Etiologi / Faktor Risiko
  majorSubjective: string[];
  majorObjective: string[];
  minorSubjective: string[];
  minorObjective: string[];
  slkiOutcome: {
    code: string; // L.xxxxx
    label: string;
    expectation: 'Meningkat' | 'Menurun' | 'Membaik';
    indicators: string[]; // nama indikator (diukur 1-5)
  };
  sikiIntervention: {
    code: string; // I.xxxxx
    label: string;
    type: 'utama' | 'pendukung';
    observasi: string[];
    terapeutik: string[];
    edukasi: string[];
    kolaborasi: string[];
  };
}

export const CATALOG_3S: CatalogItem3S[] = [
  // 1. Muskuloskeletal & Nyeri
  {
    code: 'D.0077',
    name: 'Nyeri Akut',
    category: 'Fisiologis',
    subCategory: 'Nyeri dan Kenyamanan',
    definition: 'Pengalaman sensorik atau emosional yang berkaitan dengan kerusakan jaringan aktual atau fungsional, dengan onset mendadak atau lambat dan berintensitas ringan hingga berat yang berlangsung kurang dari 3 bulan.',
    type: 'aktual',
    causes: ['Agen pencedera fisiologis (mis. inflamasi, iskemia, neoplasma)', 'Agen pencedera kimiawi (mis. terbakar, bahan kimia)', 'Agen pencedera fisik (mis. abses, trauma, fraktur, prosedur operasi)'],
    majorSubjective: ['Mengeluh nyeri'],
    majorObjective: ['Tampak meringis', 'Bersikap protektif (mis. waspada, posisi menghindari nyeri)', 'Gelisah', 'Frekuensi nadi meningkat', 'Sulit tidur'],
    minorSubjective: [],
    minorObjective: ['Tekanan darah meningkat', 'Pola napas berubah', 'Nafsu makan berubah', 'Proses berpikir terganggu', 'Menarik diri', 'Berfokus pada diri sendiri', 'Diaforesis'],
    slkiOutcome: {
      code: 'L.08066',
      label: 'Tingkat Nyeri',
      expectation: 'Menurun',
      indicators: ['Keluhan nyeri', 'Meringis', 'Sikap protektif', 'Gelisah', 'Frekuensi nadi', 'Pola tidur']
    },
    sikiIntervention: {
      code: 'I.08238',
      label: 'Manajemen Nyeri',
      type: 'utama',
      observasi: [
        'Identifikasi lokasi, karakteristik, durasi, frekuensi, kualitas, dan intensitas nyeri (PQRST)',
        'Identifikasi skala nyeri (0-10)',
        'Identifikasi respon nyeri non verbal',
        'Identifikasi faktor yang memperberat dan memperingan nyeri'
      ],
      terapeutik: [
        'Berikan teknik nonfarmakologis untuk mengurangi rasa nyeri (relaksasi nafas dalam, kompres dingin/hangat, distraksi)',
        'Kontrol lingkungan yang memperberat rasa nyeri (suhu ruangan, pencahayaan, kebisingan)',
        'Fasilitasi istirahat dan tidur yang adekuat',
        'Pertahankan imobilisasi/posisi nyaman pada area cedera'
      ],
      edukasi: [
        'Jelaskan penyebab, periode, dan pemicu nyeri',
        'Jelaskan strategi meredakan nyeri secara mandiri',
        'Anjurkan memonitor nyeri secara mandiri',
        'Ajarkan teknik nonfarmakologis nafas dalam dan relaksasi'
      ],
      kolaborasi: [
        'Kolaborasi pemberian analgetik sesuai indikasi dokter'
      ]
    }
  },
  {
    code: 'D.0054',
    name: 'Gangguan Mobilitas Fisik',
    category: 'Fisiologis',
    subCategory: 'Aktivitas dan Istirahat',
    definition: 'Keterbatasan dalam gerakan fisik dari satu atau lebih ekstremitas secara mandiri.',
    type: 'aktual',
    causes: ['Kerusakan integritas struktur tulang (fraktur)', 'Perubahan metabolisme', 'Ketidakbugaran fisik', 'Penurunan kendali otot', 'Penurunan massa/kekuatan otot', 'Keterlambatan perkembangan', 'Nyeri', 'Program pembatasan gerak (bedrest)'],
    majorSubjective: ['Mengeluh sulit menggerakkan ekstremitas'],
    majorObjective: ['Kekuatan otot menurun', 'Rentang gerak (ROM) menurun'],
    minorSubjective: ['Nyeri saat bergerak', 'Enggan melakukan pergerakan', 'Merasa cemas saat bergerak'],
    minorObjective: ['Sendi kaku', 'Gerakan tidak terkoordinasi', 'Gerakan terbatas', 'Fisik lemah'],
    slkiOutcome: {
      code: 'L.05042',
      label: 'Mobilitas Fisik',
      expectation: 'Meningkat',
      indicators: ['Pergerakan ekstremitas', 'Kekuatan otot', 'Rentang gerak (ROM)', 'Kaku sendi', 'Gerakan terbatas', 'Kelemahan fisik']
    },
    sikiIntervention: {
      code: 'I.05173',
      label: 'Dukungan Mobilisasi',
      type: 'utama',
      observasi: [
        'Identifikasi adanya nyeri atau keluhan fisik lainnya saat mobilisasi',
        'Identifikasi toleransi fisik melakukan pergerakan',
        'Monitor frekuensi jantung dan tekanan darah sebelum memulai mobilisasi',
        'Monitor kondisi umum selama melakukan mobilisasi'
      ],
      terapeutik: [
        'Fasilitasi aktivitas mobilisasi dengan alat bantu (mis. kruk, walker, kursi roda)',
        'Fasilitasi melakukan pergerakan (ROM pasif/aktif bertahap)',
        'Libatkan keluarga untuk membantu pasien dalam meningkatkan pergerakan',
        'Ubah posisi secara berkala tiap 2 jam (alih baring)'
      ],
      edukasi: [
        'Jelaskan tujuan dan prosedur mobilisasi bertahap',
        'Anjurkan melakukan mobilisasi dini sesuai batas toleransi',
        'Ajarkan mobilisasi sederhana yang harus dilakukan (mis. duduk di tempat tidur, pindah ke kursi)'
      ],
      kolaborasi: [
        'Kolaborasi dengan fisioterapis dalam program latihan mobilitas jika perlu'
      ]
    }
  },
  {
    code: 'D.0129',
    name: 'Gangguan Integritas Kulit/Jaringan',
    category: 'Fisiologis',
    subCategory: 'Aktivitas dan Istirahat',
    definition: 'Kerusakan kulit (dermis dan/atau epidermis) atau jaringan (membran mukosa, kornea, fasia, otot, tendon, tulang, kartilago, kapsul sendi dan/atau ligamen).',
    type: 'aktual',
    causes: ['Perubahan sirkulasi', 'Perubahan status nutrisi (kelebihan atau kekurangan)', 'Kekurangan/kelebihan volume cairan', 'Penurunan mobilitas fisik', 'Bahan kimia iritatif', 'Suhu lingkungan ekstrem', 'Faktor mekanis (gesekan, luka operasi, fraktur terbuka)'],
    majorSubjective: [],
    majorObjective: ['Kerusakan jaringan dan/atau lapisan kulit'],
    minorSubjective: ['Nyeri lokal', 'Rasa perih/gatal'],
    minorObjective: ['Perdarahan', 'Kemerahan', 'Hematoma', 'Edema lokal'],
    slkiOutcome: {
      code: 'L.14125',
      label: 'Integritas Kulit dan Jaringan',
      expectation: 'Meningkat',
      indicators: ['Kerusakan jaringan', 'Kerusakan lapisan kulit', 'Nyeri', 'Perdarahan', 'Kemerahan', 'Hematoma']
    },
    sikiIntervention: {
      code: 'I.14564',
      label: 'Perawatan Luka',
      type: 'utama',
      observasi: [
        'Monitor karakteristik luka (drainase, warna, ukuran, bau, dan integritas jaringan sekitar)',
        'Monitor tanda-tanda infeksi pada luka (rubor, calor, dolor, tumor, functio laesa)'
      ],
      terapeutik: [
        'Lepaskan balutan lama dengan hati-hati menggunakan larutan NaCl 0.9%',
        'Bersihkan luka dengan cairan fisiologis steril (NaCl 0.9%)',
        'Pasang balutan steril sesuai jenis luka dan eksudat',
        'Pertahankan teknik aseptik steril selama tindakan perawatan luka'
      ],
      edukasi: [
        'Jelaskan tanda dan gejala infeksi lokal pada pasien dan keluarga',
        'Anjurkan mengonsumsi makanan tinggi protein untuk percepatan granulasi jaringan',
        'Ajarkan prosedur perawatan luka mandiri bila diperlukan'
      ],
      kolaborasi: [
        'Kolaborasi pemberian antibiotik profilaksis atau terapeutik sesuai instruksi dokter'
      ]
    }
  },
  {
    code: 'D.0142',
    name: 'Risiko Infeksi',
    category: 'Lingkungan',
    subCategory: 'Keamanan dan Proteksi',
    definition: 'Beresiko mengalami peningkatan terserang organisme patogenik.',
    type: 'risiko',
    causes: ['Penyakit kronis', 'Efek prosedur invasif (infus, kateter, luka operasi)', 'Malnutrisi', 'Peningkatan paparan organisme patogen lingkungan', 'Ketidakadekuatan pertahanan tubuh primer (gangguan integritas kulit)', 'Imunosupresi'],
    majorSubjective: [],
    majorObjective: [],
    minorSubjective: [],
    minorObjective: [],
    slkiOutcome: {
      code: 'L.14137',
      label: 'Tingkat Infeksi',
      expectation: 'Menurun',
      indicators: ['Demam', 'Kemerahan', 'Nyeri', 'Bengkak', 'Kadar leukosit membaik', 'Drainase purulen']
    },
    sikiIntervention: {
      code: 'I.14539',
      label: 'Pencegahan Infeksi',
      type: 'utama',
      observasi: [
        'Monitor tanda dan gejala infeksi lokal dan sistemik (suhu, leukosit, drainase luka)',
        'Monitor area insersi kateter intravena dan luka invasif'
      ],
      terapeutik: [
        'Batasi jumlah pengunjung',
        'Berikan perawatan kulit pada area edema dan luka dengan teknik aseptik',
        'Cuci tangan sebelum dan sesudah kontak dengan pasien dan lingkungan pasien',
        'Pertahankan kondisi aseptik pada pasien berisiko tinggi'
      ],
      edukasi: [
        'Jelaskan tanda dan gejala infeksi kepada pasien dan keluarga',
        'Ajarkan cara mencuci tangan dengan benar (6 langkah WHO)',
        'Ajarkan etika batuk dan perawatan kebersihan diri'
      ],
      kolaborasi: [
        'Kolaborasi pemberian imunisasi atau antibiotik profilaksis jika diindikasikan'
      ]
    }
  },
  {
    code: 'D.0143',
    name: 'Risiko Jatuh',
    category: 'Lingkungan',
    subCategory: 'Keamanan dan Proteksi',
    definition: 'Beresiko mengalami kerusakan fisik dan gangguan kesehatan akibat terjatuh.',
    type: 'risiko',
    causes: ['Usia ≥ 65 tahun atau anak-anak', 'Riwayat jatuh', 'Penggunaan alat bantu gerak', 'Penurunan kekuatan ekstremitas bawah', 'Kondisi pasca operasi fraktur / gips', 'Penggunaan obat penenang / analgetik narkotik'],
    majorSubjective: [],
    majorObjective: [],
    minorSubjective: [],
    minorObjective: [],
    slkiOutcome: {
      code: 'L.14138',
      label: 'Tingkat Jatuh',
      expectation: 'Menurun',
      indicators: ['Jatuh dari tempat tidur', 'Jatuh saat berdiri', 'Jatuh saat duduk', 'Jatuh saat berjalan']
    },
    sikiIntervention: {
      code: 'I.14540',
      label: 'Pencegahan Jatuh',
      type: 'utama',
      observasi: [
        'Identifikasi faktor risiko jatuh (skor Morse Fall Scale / skala jatuh)',
        'Identifikasi faktor lingkungan yang meningkatkan risiko jatuh (lantai licin, penerangan kurang)'
      ],
      terapeutik: [
        'Pasang pengaman tempat tidur (side rails) di kedua sisi',
        'Pastikan roda tempat tidur dan kursi roda dalam posisi terkunci',
        'Dekatkan bel pemanggil dan barang kebutuhan pribadi dalam jangkauan pasien',
        'Pasang gelang penanda risiko jatuh (warna kuning)'
      ],
      edukasi: [
        'Anjurkan memanggil perawat jika membutuhkan bantuan untuk berpindah',
        'Anjurkan keluarga untuk selalu mendampingi pasien',
        'Jelaskan alasan pemakaian pengaman tempat tidur'
      ],
      kolaborasi: []
    }
  },
  {
    code: 'D.0056',
    name: 'Intoleransi Aktivitas',
    category: 'Fisiologis',
    subCategory: 'Aktivitas dan Istirahat',
    definition: 'Ketidakcukupan energi untuk melakukan aktivitas sehari-hari.',
    type: 'aktual',
    causes: ['Ketidakseimbangan antara suplai dan kebutuhan oksigen', 'Tirah baring lama', 'Kelemahan fisik', 'Imobilitas', 'Gaya hidup monoton'],
    majorSubjective: ['Mengeluh lelah'],
    majorObjective: ['Frekuensi jantung meningkat >20% dari kondisi istirahat'],
    minorSubjective: ['Dispnea saat/setelah aktivitas', 'Merasa tidak nyaman setelah beraktivitas', 'Merasa lemah'],
    minorObjective: ['Tekanan darah berubah >20% dari kondisi istirahat', 'Gambaran EKG aritmia/iskemia', 'Sianosis'],
    slkiOutcome: {
      code: 'L.05047',
      label: 'Toleransi Aktivitas',
      expectation: 'Meningkat',
      indicators: ['Kemampuan melakukan aktivitas rutin', 'Keluhan lelah', 'Dispnea saat beraktivitas', 'Frekuensi nadi saat beraktivitas', 'Kemudahan bernapas']
    },
    sikiIntervention: {
      code: 'I.05178',
      label: 'Manajemen Energi',
      type: 'utama',
      observasi: [
        'Identifikasi gangguan fungsi tubuh yang mengakibatkan kelelahan',
        'Monitor kelelahan fisik dan emosional',
        'Monitor pola dan jam tidur',
        'Monitor lokasi dan ketidaknyamanan selama melakukan aktivitas'
      ],
      terapeutik: [
        'Sediakan lingkungan nyaman dan rendah stimulus (cahaya, suara, suhu)',
        'Lakukan rentang gerak pasif dan/atau aktif',
        'Fasilitasi duduk di sisi tempat tidur jika tidak dapat berpindah atau berjalan'
      ],
      edukasi: [
        'Anjurkan tirah baring dan pembatasan aktivitas berat',
        'Anjurkan melakukan aktivitas secara bertahap',
        'Ajarkan strategi koping untuk mengurangi kelelahan'
      ],
      kolaborasi: [
        'Kolaborasi dengan ahli gizi tentang cara meningkatkan asupan makanan tinggi energi'
      ]
    }
  },

  // 2. Respirasi
  {
    code: 'D.0001',
    name: 'Bersihan Jalan Napas Tidak Efektif',
    category: 'Fisiologis',
    subCategory: 'Respirasi',
    definition: 'Ketidakmampuan membersihkan sekret atau obstruksi jalan napas untuk mempertahankan jalan napas tetap paten.',
    type: 'aktual',
    causes: ['Spasme jalan napas', 'Hipersekresi jalan napas', 'Disfungsi neuromuskular', 'Benda asing dalam jalan napas', 'Sekresi yang tertahan', 'Proses infeksi'],
    majorSubjective: [],
    majorObjective: ['Batuk tidak efektif', 'Tidak mampu batuk', 'Sputum berlebih', 'Mengi, wheezing dan/atau ronkhi kering', 'Mekonium di jalan napas'],
    minorSubjective: ['Dispnea', 'Sulit bicara', 'Ortopnea'],
    minorObjective: ['Gelisah', 'Sianosis', 'Bunyi napas menurun', 'Frekuensi napas berubah', 'Pola napas berubah'],
    slkiOutcome: {
      code: 'L.01001',
      label: 'Bersihan Jalan Napas',
      expectation: 'Meningkat',
      indicators: ['Batuk efektif', 'Produksi sputum', 'Mengi', 'Wheezing', 'Ronkhi', 'Frekuensi napas', 'Pola napas']
    },
    sikiIntervention: {
      code: 'I.01011',
      label: 'Manajemen Jalan Napas',
      type: 'utama',
      observasi: [
        'Monitor pola napas (frekuensi, kedalaman, usaha napas)',
        'Monitor bunyi napas tambahan (mis. gurgling, mengi, wheezing, ronkhi)',
        'Monitor sputum (jumlah, warna, aroma)'
      ],
      terapeutik: [
        'Pertahankan kepatenan jalan napas dengan head-tilt chin-lift atau jaw-thrust jika perlu',
        'Posisikan semi-Fowler atau Fowler (30-45 derajat)',
        'Berikan minum hangat',
        'Lakukan fisioterapi dada jika perlu',
        'Lakukan penghisapan lendir (suction) kurang dari 15 detik'
      ],
      edukasi: [
        'Anjurkan asupan cairan 2000 ml/hari jika tidak ada kontraindikasi',
        'Ajarkan teknik batuk efektif'
      ],
      kolaborasi: [
        'Kolaborasi pemberian bronkodilator, ekspektoran, mukolitik, jika perlu'
      ]
    }
  },
  {
    code: 'D.0005',
    name: 'Pola Napas Tidak Efektif',
    category: 'Fisiologis',
    subCategory: 'Respirasi',
    definition: 'Inspirasi dan/atau ekspirasi yang tidak memberikan ventilasi adekuat.',
    type: 'aktual',
    causes: ['Depresi pusat pernapasan', 'Hambatan upaya napas (mis. nyeri saat bernapas, kelemahan otot)', 'Deformitas dinding dada', 'Gangguan neuromuskular', 'Kecemasan', 'Posisi tubuh yang menghambat ekspansi paru'],
    majorSubjective: ['Dispnea'],
    majorObjective: ['Penggunaan otot bantu pernapasan', 'Fase ekspirasi memanjang', 'Pola napas abnormal (mis. takipnea, bradipnea, hiperventilasi, Kussmaul, Cheyne-Stokes)'],
    minorSubjective: ['Ortopnea'],
    minorObjective: ['Pernapasan pursed-lip', 'Pernapasan cuping hidung', 'Diameter thoraks anterior-posterior meningkat', 'Ventilasi semenit menurun', 'Kapasitas vital menurun', 'Tekanan ekspirasi/inspirasi menurun'],
    slkiOutcome: {
      code: 'L.01004',
      label: 'Pola Napas',
      expectation: 'Membaik',
      indicators: ['Dispnea', 'Penggunaan otot bantu napas', 'Pemanjangan fase ekspirasi', 'Frekuensi napas', 'Kedalaman napas']
    },
    sikiIntervention: {
      code: 'I.01014',
      label: 'Pemantauan Respirasi',
      type: 'utama',
      observasi: [
        'Monitor frekuensi, irama, kedalaman, dan upaya napas',
        'Monitor pola napas (seperti bradipnea, takipnea, hiperventilasi, Kussmaul)',
        'Monitor saturasi oksigen (SpO2)',
        'Auskultasi bunyi napas'
      ],
      terapeutik: [
        'Atur interval pemantauan respirasi sesuai kondisi pasien',
        'Posisikan pasien semi-Fowler untuk memaksimalkan ekspansi thoraks',
        'Berikan terapi oksigen sesuai program medik'
      ],
      edukasi: [
        'Jelaskan tujuan dan prosedur pemantauan',
        'Ajarkan teknik relaksasi napas dalam'
      ],
      kolaborasi: [
        'Kolaborasi penyesuaian fraksi oksigen atau pemeriksaan AGD'
      ]
    }
  },
  {
    code: 'D.0003',
    name: 'Gangguan Pertukaran Gas',
    category: 'Fisiologis',
    subCategory: 'Respirasi',
    definition: 'Kelebihan atau kekurangan oksigenasi dan/atau eliminasi karbondioksida pada membran alveolus-kapiler.',
    type: 'aktual',
    causes: ['Ketidakseimbangan ventilasi-perfusi', 'Perubahan membran alveolus-kapiler'],
    majorSubjective: ['Dispnea'],
    majorObjective: ['PCO2 meningkat/menurun', 'PO2 menurun', 'Takikardia', 'pH arteri meningkat/menurun', 'Bunyi napas tambahan'],
    minorSubjective: ['Pusing', 'Penglihatan kabur'],
    minorObjective: ['Sianosis', 'Diaforesis', 'Gelisah', 'Napas cuping hidung', 'Pola napas abnormal', 'Warna kulit abnormal', 'Kesadaran menurun'],
    slkiOutcome: {
      code: 'L.01003',
      label: 'Pertukaran Gas',
      expectation: 'Meningkat',
      indicators: ['Tingkat kesadaran', 'Dispnea', 'Bunyi napas tambahan', 'PCO2', 'PO2', 'pH arteri', 'Takikardia', 'Sianosis']
    },
    sikiIntervention: {
      code: 'I.01026',
      label: 'Terapi Oksigen',
      type: 'utama',
      observasi: [
        'Monitor kecepatan aliran oksigen',
        'Monitor posisi alat terapi oksigen',
        'Monitor efektivitas terapi oksigen (oksimetri nadi, AGD)',
        'Monitor tanda-tanda hipoventilasi dan retensi CO2'
      ],
      terapeutik: [
        'Bersihkan sekret pada mulut, hidung, dan trakea jika perlu',
        'Pertahankan kepatenan jalan napas',
        'Siapkan dan atur peralatan pemberian oksigen (nasal kanul, simple mask, NRM)',
        'Berikan oksigen tambahan jika diindikasikan'
      ],
      edukasi: [
        'Ajarkan pasien dan keluarga cara menggunakan oksigen di rumah jika rawat jalan'
      ],
      kolaborasi: [
        'Kolaborasi penentuan dosis oksigen dan pemantauan gas darah arteri (AGD)'
      ]
    }
  },

  // 3. Sirkulasi & Cairan
  {
    code: 'D.0009',
    name: 'Perfusi Perifer Tidak Efektif',
    category: 'Fisiologis',
    subCategory: 'Sirkulasi',
    definition: 'Penurunan sirkulasi darah pada level kapiler yang dapat mengganggu metabolisme tubuh.',
    type: 'aktual',
    causes: ['Hiperglikemia', 'Penurunan konsentrasi hemoglobin (anemia)', 'Peningkatan tekanan darah', 'Kekurangan volume cairan', 'Penurunan aliran arteri dan/atau vena (trombus, trauma, gips ketat)'],
    majorSubjective: [],
    majorObjective: ['Pengisian kapiler (CRT) > 3 detik', 'Nadi perifer menurun atau tidak teraba', 'Akral teraba dingin', 'Warna kulit pucat', 'Turgor kulit menurun'],
    minorSubjective: ['Parastesia', 'Nyeri ekstremitas (klaudikasio intermiten)'],
    minorObjective: ['Edema', 'Penyembuhan luka lambat', 'Indeks ankle-brachial < 0.90', 'Bruit femoralis'],
    slkiOutcome: {
      code: 'L.02011',
      label: 'Perfusi Perifer',
      expectation: 'Meningkat',
      indicators: ['Kekuatan nadi perifer', 'Penyembuhan luka', 'Sensasi perifer', 'Warna kulit pucat', 'Edema perifer', 'Nyeri ekstremitas', 'Pengisian kapiler (CRT)', 'Akral dingin']
    },
    sikiIntervention: {
      code: 'I.02079',
      label: 'Perawatan Sirkulasi',
      type: 'utama',
      observasi: [
        'Periksa sirkulasi perifer (nadi perifer, edema, CRT, warna kulit, suhu akral)',
        'Identifikasi faktor risiko gangguan sirkulasi (diabetes, perokok, trauma, fraktur)',
        'Monitor panas, kemerahan, nyeri atau bengkak pada ekstremitas'
      ],
      terapeutik: [
        'Hindari pemasangan infus atau pengambilan darah di area keterbatasan perfusi',
        'Hindari pengukuran tekanan darah pada ekstremitas dengan keterbatasan perfusi',
        'Lakukan hidrasi yang adekuat',
        'Tinggikan ekstremitas 15-20 derajat jika terdapat edema venosa'
      ],
      edukasi: [
        'Anjurkan berhenti merokok',
        'Anjurkan berolahraga rutin',
        'Anjurkan mengecek kulit dari luka atau robekan setiap hari'
      ],
      kolaborasi: [
        'Kolaborasi pemberian obat antiplatelet, antikoagulan, atau antidiabetes'
      ]
    }
  },
  {
    code: 'D.0023',
    name: 'Hipovolemia',
    category: 'Fisiologis',
    subCategory: 'Nutrisi dan Cairan',
    definition: 'Penurunan volume cairan intravaskular, interstisial, dan/atau intraselular.',
    type: 'aktual',
    causes: ['Kehilangan cairan aktif (perdarahan, muntah, diare)', 'Kegagalan mekanisme regulasi', 'Peningkatan permeabilitas kapiler', 'Kekurangan intake cairan', 'Evaporasi'],
    majorSubjective: [],
    majorObjective: ['Frekuensi nadi meningkat', 'Nadi teraba lemah', 'Tekanan darah menurun', 'Tekanan nadi menyempit', 'Turgor kulit menurun', 'Membran mukosa kering', 'Volume urin menurun', 'Hematokrit meningkat'],
    minorSubjective: ['Merasa lemah', 'Mengeluh haus'],
    minorObjective: ['Pengisian vena menurun', 'Status mental berubah', 'Suhu tubuh meningkat', 'Konsentrasi urin meningkat', 'Berat badan turun tiba-tiba'],
    slkiOutcome: {
      code: 'L.03028',
      label: 'Status Cairan',
      expectation: 'Membaik',
      indicators: ['Kekuatan nadi', 'Turgor kulit', 'Output urin', 'Frekuensi nadi', 'Tekanan darah', 'Membran mukosa lembap', 'Hematokrit']
    },
    sikiIntervention: {
      code: 'I.03116',
      label: 'Manajemen Hipovolemia',
      type: 'utama',
      observasi: [
        'Periksa tanda dan gejala hipovolemia (frekuensi nadi meningkat, nadi teraba lemah, TD menurun, turgor menurun)',
        'Monitor intake dan output cairan (balance cairan harian)'
      ],
      terapeutik: [
        'Hitung kebutuhan cairan harian',
        'Berikan posisi modified Trendelenburg jika ada indikasi syok',
        'Berikan asupan cairan oral sesuai toleransi'
      ],
      edukasi: [
        'Anjurkan memperbanyak asupan cairan oral',
        'Anjurkan menghindari perubahan posisi mendadak'
      ],
      kolaborasi: [
        'Kolaborasi pemberian cairan IV isotonis (NaCl 0.9%, RL)',
        'Kolaborasi pemberian produk darah jika ada perdarahan aktif'
      ]
    }
  },
  {
    code: 'D.0022',
    name: 'Hipervolemia',
    category: 'Fisiologis',
    subCategory: 'Nutrisi dan Cairan',
    definition: 'Peningkatan volume cairan intravaskular, interstisial, dan/atau intraselular.',
    type: 'aktual',
    causes: ['Gangguan mekanisme regulasi (gagal ginjal, gagal jantung)', 'Kelebihan asupan cairan atau natrium', 'Efek agen farmakologis'],
    majorSubjective: ['Ortopnea', 'Dispnea', 'Paroxysmal nocturnal dyspnea (PND)'],
    majorObjective: ['Edema anasarka dan/atau edema perifer', 'Berat badan meningkat dalam waktu singkat', 'JVP meningkat', 'Refleks hepatojugular positif'],
    minorSubjective: [],
    minorObjective: ['Distensi vena leher', 'Terdengar suara napas tambahan (ronkhi)', 'Hepatomegali', 'Kadar Hb/Ht turun (hemodilusi)', 'Oliguria', 'Intake lebih besar dari output'],
    slkiOutcome: {
      code: 'L.03020',
      label: 'Keseimbangan Cairan',
      expectation: 'Meningkat',
      indicators: ['Asupan cairan', 'Haluaran urin', 'Kelembapan membran mukosa', 'Edema', 'Tekanan darah', 'Denyut nadi radialis']
    },
    sikiIntervention: {
      code: 'I.03114',
      label: 'Manajemen Hipervolemia',
      type: 'utama',
      observasi: [
        'Periksa tanda dan gejala hipervolemia (ortopnea, dispnea, edema, JVP, ronkhi)',
        'Monitor status hemodinamik (tekanan darah, frekuensi jantung)',
        'Monitor intake dan output cairan'
      ],
      terapeutik: [
        'Timbang berat badan setiap hari pada waktu yang sama',
        'Batasi asupan cairan dan garam',
        'Tinggikan kepala tempat tidur 30-40 derajat'
      ],
      edukasi: [
        'Anjurkan melapor jika haluaran urin < 0.5 mL/kgBB/jam dalam 6 jam',
        'Ajarkan cara mengukur dan mencatat asupan serta haluaran cairan'
      ],
      kolaborasi: [
        'Kolaborasi pemberian diuretik sesuai resep dokter',
        'Kolaborasi penggantian kehilangan kalium akibat diuretik'
      ]
    }
  },

  // 4. Nutrisi & Pencernaan
  {
    code: 'D.0019',
    name: 'Defisit Nutrisi',
    category: 'Fisiologis',
    subCategory: 'Nutrisi dan Cairan',
    definition: 'Asupan nutrisi tidak cukup untuk memenuhi kebutuhan metabolisme.',
    type: 'aktual',
    causes: ['Ketidakmampuan menelan makanan', 'Ketidakmampuan mencerna makanan', 'Ketidakmampuan mengabsorbsi nutrien', 'Peningkatan kebutuhan metabolisme', 'Faktor psikologis (keengganan untuk makan)'],
    majorSubjective: [],
    majorObjective: ['Berat badan menurun minimal 10% di bawah rentang ideal'],
    minorSubjective: ['Cepat kenyang setelah makan', 'Kram/nyeri abdomen', 'Nafsu makan menurun'],
    minorObjective: ['Bising usus hiperaktif', 'Otot pengunyah lemah', 'Otot menelan lemah', 'Membran mukosa pucat', 'Sariawan', 'Serum albumin turun', 'Rambut rontok berlebihan'],
    slkiOutcome: {
      code: 'L.03030',
      label: 'Status Nutrisi',
      expectation: 'Membaik',
      indicators: ['Porsi makan yang dihabiskan', 'Kekuatan otot pengunyah', 'Serum albumin', 'Berat badan', 'Indeks massa tubuh (IMT)', 'Nafsu makan']
    },
    sikiIntervention: {
      code: 'I.03119',
      label: 'Manajemen Nutrisi',
      type: 'utama',
      observasi: [
        'Identifikasi status nutrisi',
        'Identifikasi alergi dan intoleransi makanan',
        'Identifikasi makanan yang disukai',
        'Monitor asupan makanan',
        'Monitor berat badan'
      ],
      terapeutik: [
        'Lakukan oral hygiene sebelum makan jika perlu',
        'Fasilitasi menentukan pedoman diet (mis. piramida makanan)',
        'Sajikan makanan secara menarik dan suhu yang sesuai',
        'Berikan makanan tinggi kalori dan tinggi protein'
      ],
      edukasi: [
        'Anjurkan posisi duduk saat makan',
        'Ajarkan diet yang diprogramkan'
      ],
      kolaborasi: [
        'Kolaborasi dengan ahli gizi untuk menentukan jumlah kalori dan jenis nutrien yang dibutuhkan'
      ]
    }
  },
  {
    code: 'D.0076',
    name: 'Nausea',
    category: 'Fisiologis',
    subCategory: 'Nutrisi dan Cairan',
    definition: 'Perasaan tidak nyaman pada bagian belakang tenggorokan atau lambung yang dapat mengakibatkan muntah.',
    type: 'aktual',
    causes: ['Gangguan biokimiawi (uremia, ketoasidosis)', 'Iritasi lambung', 'Distensi lambung', 'Efek agen farmakologis (anestesi, kemoterapi, opioid)', 'Rasa/aroma tidak menyenangkan'],
    majorSubjective: ['Mengeluh mual', 'Merasa ingin muntah', 'Tidak berminat makan'],
    majorObjective: [],
    minorSubjective: ['Merasa asam di mulut', 'Sensasi panas/dingin', 'Sering menelan'],
    minorObjective: ['Salivasi meningkat', 'Pucat', 'Diaforesis', 'Takikardia', 'Pupil dilatasi'],
    slkiOutcome: {
      code: 'L.08065',
      label: 'Tingkat Nausea',
      expectation: 'Menurun',
      indicators: ['Nafsu makan', 'Keluhan mual', 'Perasaan ingin muntah', 'Sensasi panas/dingin', 'Frekuensi menelan', 'Diaforesis']
    },
    sikiIntervention: {
      code: 'I.03117',
      label: 'Manajemen Mual',
      type: 'utama',
      observasi: [
        'Identifikasi pengalaman mual',
        'Identifikasi dampak mual terhadap kualitas hidup (nafsu makan, aktivitas, tidur)',
        'Identifikasi faktor penyebab mual (pengobatan, prosedur)',
        'Monitor asupan nutrisi dan cairan'
      ],
      terapeutik: [
        'Kendalikan faktor lingkungan penyebab mual (bau menyengat, suara, stimulasi visual)',
        'Kurangi atau hilangkan keadaan penyebab mual',
        'Berikan makanan dalam jumlah kecil dan sering',
        'Berikan makanan dingin, cairan bening, tidak berbau, dan tidak berwarna jika perlu'
      ],
      edukasi: [
        'Anjurkan istirahat dan tidur yang cukup',
        'Anjurkan sering membersihkan mulut, kecuali jika merangsang mual',
        'Ajarkan penggunaan teknik nonfarmakologis untuk mengatasi mual (relaksasi, aromaterapi mint)'
      ],
      kolaborasi: [
        'Kolaborasi pemberian antiemetik sesuai resep dokter'
      ]
    }
  },

  // 5. Eliminasi
  {
    code: 'D.0049',
    name: 'Konstipasi',
    category: 'Fisiologis',
    subCategory: 'Eliminasi',
    definition: 'Penurunan defekasi normal yang disertai pengeluaran feses yang sulit dan tidak tuntas serta feses yang kering dan banyak.',
    type: 'aktual',
    causes: ['Penurunan motilitas gastrointestinal', 'Ketidakcukupan asupan serat', 'Ketidakcukupan asupan cairan', 'Imobilitas / tirah baring', 'Efek samping obat (analgetik opioid, antasida)'],
    majorSubjective: ['Defekasi kurang dari 2 kali seminggu', 'Pengeluaran feses lama dan sulit'],
    majorObjective: ['Feses keras', 'Peristaltik usus menurun'],
    minorSubjective: ['Mengejan saat defekasi'],
    minorObjective: ['Distensi abdomen', 'Kelemahan umum', 'Teraba massa pada rektal'],
    slkiOutcome: {
      code: 'L.04033',
      label: 'Eliminasi Fekal',
      expectation: 'Membaik',
      indicators: ['Konsistensi feses', 'Frekuensi defekasi', 'Peristaltik usus', 'Distensi abdomen', 'Keluhan defekasi lama dan sulit']
    },
    sikiIntervention: {
      code: 'I.04155',
      label: 'Manajemen Konstipasi',
      type: 'utama',
      observasi: [
        'Periksa tanda dan gejala konstipasi',
        'Periksa pergerakan usus, karakteristik feses (konsistensi, bentuk, volume, warna)',
        'Identifikasi faktor risiko konstipasi (obat, tirah baring, diet)'
      ],
      terapeutik: [
        'Anjurkan diet tinggi serat',
        'Lakukan masase abdomen jika perlu',
        'Berikan cairan hangat setelah makan'
      ],
      edukasi: [
        'Jelaskan etiologi masalah dan alasan tindakan',
        'Anjurkan peningkatan asupan cairan jika tidak ada kontraindikasi (minimal 2L/hari)',
        'Latih buang air besar secara teratur'
      ],
      kolaborasi: [
        'Kolaborasi penggunaan obat pencahar (laksatif/supositoria) bila perlu'
      ]
    }
  },
  {
    code: 'D.0050',
    name: 'Retensi Urine',
    category: 'Fisiologis',
    subCategory: 'Eliminasi',
    definition: 'Pengosongan kandung kemih yang tidak lengkap.',
    type: 'aktual',
    causes: ['Peningkatan tekanan uretra', 'Kerusakan arkus refleks', 'Blok sfingter', 'Efek anestesi pasca bedah'],
    majorSubjective: ['Sensasi penuh pada kandung kemih'],
    majorObjective: ['Disuria/anuria', 'Distensi kandung kemih'],
    minorSubjective: ['Dribbling'],
    minorObjective: ['Residu urin 150 ml atau lebih'],
    slkiOutcome: {
      code: 'L.04034',
      label: 'Eliminasi Urine',
      expectation: 'Membaik',
      indicators: ['Sensasi berkemih', 'Distensi kandung kemih', 'Disuria', 'Anuria', 'Volume residu urin']
    },
    sikiIntervention: {
      code: 'I.04148',
      label: 'Katerisasi Urine',
      type: 'utama',
      observasi: [
        'Monitor frekuensi, konsistensi, aroma, volume, dan warna urin',
        'Periksa distensi kandung kemih dengan palpasi dan perkusi'
      ],
      terapeutik: [
        'Pasang kateter urin sesuai indikasi dengan teknik steril',
        'Fiksasi kateter pada paha untuk mencegah tarikan',
        'Jaga posisi urine bag selalu lebih rendah dari kandung kemih'
      ],
      edukasi: [
        'Jelaskan tujuan dan prosedur pemasangan kateter urin',
        'Anjurkan menjaga kebersihan area perineal'
      ],
      kolaborasi: [
        'Kolaborasi tindakan bedah atau pemasangan kateter menetap jika ada retensi akut'
      ]
    }
  },

  // 6. Termoregulasi & Endokrin
  {
    code: 'D.0130',
    name: 'Hipertermia',
    category: 'Fisiologis',
    subCategory: 'Termoregulasi',
    definition: 'Suhu tubuh meningkat di atas rentang normal tubuh.',
    type: 'aktual',
    causes: ['Dehidrasi', 'Terpapar lingkungan panas', 'Proses penyakit (mis. infeksi, sepsis, kanker)', 'Ketidaksesuaian pakaian dengan suhu lingkungan', 'Peningkatan laju metabolisme'],
    majorSubjective: [],
    majorObjective: ['Suhu tubuh di atas nilai normal (> 37.5 C)'],
    minorSubjective: [],
    minorObjective: ['Kulit merah', 'Kejang', 'Takikardia', 'Takipnea', 'Kulit terasa hangat'],
    slkiOutcome: {
      code: 'L.14134',
      label: 'Termoregulasi',
      expectation: 'Membaik',
      indicators: ['Suhu tubuh', 'Suhu kulit', 'Kemerahan', 'Takikardia', 'Takipnea', 'Kejang']
    },
    sikiIntervention: {
      code: 'I.15506',
      label: 'Manajemen Hipertermia',
      type: 'utama',
      observasi: [
        'Identifikasi penyebab hipertermia (dehidrasi, infeksi, lingkungan)',
        'Monitor suhu tubuh tiap 2 jam',
        'Monitor kadar elektrolit dan haluaran urin'
      ],
      terapeutik: [
        'Sediakan lingkungan yang dingin dan ventilasi baik',
        'Longgarkan atau lepaskan pakaian',
        'Basahi dan kipasi permukaan tubuh atau berikan kompres hangat pada lipat paha dan aksila',
        'Berikan cairan oral secukupnya'
      ],
      edukasi: [
        'Anjurkan tirah baring',
        'Anjurkan banyak minum air putih'
      ],
      kolaborasi: [
        'Kolaborasi pemberian cairan intravena dan antipiretik'
      ]
    }
  },
  {
    code: 'D.0027',
    name: 'Ketidakstabilan Kadar Glukosa Darah',
    category: 'Fisiologis',
    subCategory: 'Nutrisi dan Cairan',
    definition: 'Variasi kadar glukosa darah naik/turun dari rentang normal.',
    type: 'aktual',
    causes: ['Kurang patuh pada rencana manajemen diet/obat', 'Kurang terpapar informasi tentang manajemen diabetes', 'Ketidaktepatan pemantauan glukosa darah', 'Kurang aktivitas fisik', 'Stres berlebihan'],
    majorSubjective: ['Hipoglikemia: Mengantuk, pusing, palpitasi; Hiperglikemia: Lelah/lesu, polidipsia, poliuria'],
    majorObjective: ['Kadar glukosa dalam darah/urin tinggi atau rendah'],
    minorSubjective: ['Mulut kering, pandangan kabur'],
    minorObjective: ['Jumlah urin meningkat'],
    slkiOutcome: {
      code: 'L.03022',
      label: 'Kestabilan Kadar Glukosa Darah',
      expectation: 'Meningkat',
      indicators: ['Kadar glukosa dalam darah', 'Kadar glukosa dalam urin', 'Keluhan lelah/lesu', 'Pusing', 'Rasa haus (polidipsia)', 'Jumlah urin (poliuria)']
    },
    sikiIntervention: {
      code: 'I.03115',
      label: 'Manajemen Hiperglikemia',
      type: 'utama',
      observasi: [
        'Identifikasi kemungkinan penyebab hiperglikemia',
        'Monitor kadar glukosa darah secara berkala (GDS / GDP / GD2PP)',
        'Monitor tanda dan gejala hiperglikemia (poliuria, polidipsia, polifagia, kelemahan, pandangan kabur)',
        'Monitor intake dan output cairan'
      ],
      terapeutik: [
        'Berikan asupan cairan oral jika dehidrasi',
        'Konsultasi dengan medis jika tanda dan gejala hiperglikemia memburuk'
      ],
      edukasi: [
        'Anjurkan kepatuhan terhadap diet dan olahraga',
        'Ajarkan pengelolaan diabetes (penggunaan insulin, obat oral, monitor glukosa darah mandiri)'
      ],
      kolaborasi: [
        'Kolaborasi pemberian insulin dan cairan intravena jika diperlukan'
      ]
    }
  },

  // 7. Neurologis & Kognitif
  {
    code: 'D.0066',
    name: 'Penurunan Kapasitas Adaptif Intrakranial',
    category: 'Fisiologis',
    subCategory: 'Neurosensori',
    definition: 'Gangguan mekanisme dinamika intrakranial dalam melakukan kompensasi terhadap stimulus yang dapat menurunkan kapasitas intrakranial.',
    type: 'aktual',
    causes: ['Cedera kepala / trauma kapitis', 'Edema serebral', 'Stroke hemoragik / iskemik', 'Hidrosefalus', 'Lesi desak ruang (tumor)'],
    majorSubjective: ['Sakit kepala hebat'],
    majorObjective: ['Tekanan intrakranial (TIK) meningkat ≥ 20 mmHg', 'Tingkat kesadaran menurun (GCS turun)', 'Refleks neurologis terganggu', 'Pola napas ireguler'],
    minorSubjective: [],
    minorObjective: ['Muntah proyektil', 'Papiledema', 'Postur deserebrasi/dekortikasi', 'Refleks pupil melambat atau asimetris', 'Trias Cushing (bradikardia, hipertensi dengan pulse pressure melebar, nafas ireguler)'],
    slkiOutcome: {
      code: 'L.06049',
      label: 'Kapasitas Adaptif Intrakranial',
      expectation: 'Meningkat',
      indicators: ['Tingkat kesadaran', 'Fungsi kognitif', 'Sakit kepala', 'Gelisah', 'Muntah proyektil', 'Refleks pupil', 'Tekanan darah', 'Pola napas']
    },
    sikiIntervention: {
      code: 'I.06198',
      label: 'Manajemen Peningkatan Tekanan Intrakranial',
      type: 'utama',
      observasi: [
        'Identifikasi penyebab peningkatan TIK',
        'Monitor tanda/gejala peningkatan TIK (TD meningkat, nadi lambat, pernapasan Cheyne-Stokes, muntah proyektil)',
        'Monitor status neurologis dan GCS tiap jam pada fase kritis',
        'Monitor intake dan output cairan'
      ],
      terapeutik: [
        'Tinggikan kepala tempat tidur 30 derajat dengan posisi leher lurus (midline)',
        'Hindari manuver Valsava (batuk kuat, mengejan)',
        'Cegah terjadinya kejang',
        'Atur ventilator untuk mempertahankan PaCO2 35-40 mmHg'
      ],
      edukasi: [
        'Jelaskan tujuan dan prosedur pemantauan kepada keluarga'
      ],
      kolaborasi: [
        'Kolaborasi pemberian sedasi dan antikonvulsan jika perlu',
        'Kolaborasi pemberian manitol / salin hipertonik 3%'
      ]
    }
  },

  // 8. Psikologis & Edukasi
  {
    code: 'D.0080',
    name: 'Ansietas',
    category: 'Psikologis',
    subCategory: 'Integritas Ego',
    definition: 'Kondisi emosi dan pengalaman subyektif individu terhadap objek yang tidak jelas dan spesifik akibat antisipasi bahaya yang memungkinkan individu melakukan tindakan untuk menghadapi ancaman.',
    type: 'aktual',
    causes: ['Krisis situasional (hospitalisasi, tindakan operasi)', 'Kebutuhan tidak terpenuhi', 'Krisis maturasional', 'Ancaman terhadap konsep diri', 'Kekhawatiran mengalami kegagalan'],
    majorSubjective: ['Merasa bingung', 'Merasa khawatir dengan akibat dari kondisi yang dihadapi', 'Sulit berkonsentrasi'],
    majorObjective: ['Tampak gelisah', 'Tampak tegang', 'Sulit tidur'],
    minorSubjective: ['Mengeluh pusing', 'Anoreksia', 'Palpitasi', 'Merasa tidak berdaya'],
    minorObjective: ['Frekuensi napas meningkat', 'Frekuensi nadi meningkat', 'Tekanan darah meningkat', 'Diaforesis', 'Tremor', 'Muka pucat', 'Kontak mata buruk'],
    slkiOutcome: {
      code: 'L.09093',
      label: 'Tingkat Ansietas',
      expectation: 'Menurun',
      indicators: ['Verbalisasi kebingungan', 'Verbalisasi khawatir', 'Perilaku gelisah', 'Perilaku tegang', 'Keluhan pusing', 'Frekuensi pernapasan', 'Frekuensi nadi', 'Pola tidur']
    },
    sikiIntervention: {
      code: 'I.09314',
      label: 'Reduksi Ansietas',
      type: 'utama',
      observasi: [
        'Identifikasi saat tingkat ansietas berubah (kondisi, waktu, stresor)',
        'Identifikasi kemampuan mengambil keputusan',
        'Monitor tanda-tanda ansietas (verbal dan nonverbal)'
      ],
      terapeutik: [
        'Ciptakan suasana terapeutik untuk menumbuhkan kepercayaan',
        'Temani pasien untuk mengurangi kecemasan, jika memungkinkan',
        'Pahami situasi yang membuat ansietas',
        'Dengarkan keluhan dengan penuh perhatian',
        'Gunakan pendekatan yang tenang dan meyakinkan'
      ],
      edukasi: [
        'Jelaskan prosedur, termasuk sensasi yang mungkin dialami',
        'Informasikan secara faktual mengenai diagnosis, pengobatan, dan prognosis',
        'Anjurkan keluarga untuk tetap bersama pasien',
        'Latih teknik relaksasi (napas dalam, lima jari, imajinasi terbimbing)'
      ],
      kolaborasi: [
        'Kolaborasi pemberian obat antiansietas jika perlu'
      ]
    }
  },
  {
    code: 'D.0111',
    name: 'Defisit Pengetahuan',
    category: 'Perilaku',
    subCategory: 'Penyuluhan dan Pembelajaran',
    definition: 'Ketiadaan atau kurangnya informasi kognitif yang berkaitan dengan topik tertentu.',
    type: 'aktual',
    causes: ['Keterbatasan kognitif', 'Gangguan fungsi kognitif', 'Kekeliruan mengikuti anjuran', 'Kurang terpapar informasi', 'Kurang minat dalam belajar'],
    majorSubjective: ['Menanyakan masalah yang dihadapi'],
    majorObjective: ['Menunjukkan perilaku tidak sesuai anjuran', 'Menunjukkan persepsi yang keliru terhadap masalah'],
    minorSubjective: [],
    minorObjective: ['Menjalani pemeriksaan yang tidak tepat', 'Menunjukkan perilaku berlebihan (mis. histeris, bermusuhan, apatis)'],
    slkiOutcome: {
      code: 'L.12111',
      label: 'Tingkat Pengetahuan',
      expectation: 'Meningkat',
      indicators: ['Perilaku sesuai anjuran', 'Verbalisasi minat dalam belajar', 'Kemampuan menjelaskan pengetahuan tentang suatu topik', 'Perilaku sesuai dengan pengetahuan', 'Pertanyaan tentang masalah yang dihadapi']
    },
    sikiIntervention: {
      code: 'I.12383',
      label: 'Edukasi Kesehatan',
      type: 'utama',
      observasi: [
        'Identifikasi kesiapan dan kemampuan menerima informasi',
        'Identifikasi faktor-faktor yang dapat meningkatkan dan menurunkan motivasi perilaku hidup bersih dan sehat'
      ],
      terapeutik: [
        'Sediakan materi dan media pendidikan kesehatan',
        'Jadwalkan pendidikan kesehatan sesuai kesepakatan',
        'Berikan kesempatan untuk bertanya'
      ],
      edukasi: [
        'Jelaskan faktor risiko yang dapat mempengaruhi kesehatan',
        'Ajarkan perilaku hidup bersih dan sehat',
        'Ajarkan strategi yang dapat digunakan untuk meningkatkan kepatuhan pengobatan'
      ],
      kolaborasi: []
    }
  },
  {
    code: 'D.0109',
    name: 'Defisit Perawatan Diri',
    category: 'Perilaku',
    subCategory: 'Kebersihan Diri',
    definition: 'Ketidakmampuan melakukan atau menyelesaikan aktivitas perawatan diri (mandi, berhias, makan, toileting).',
    type: 'aktual',
    causes: ['Gangguan muskuloskeletal (fraktur, dislokasi)', 'Gangguan neuromuskular', 'Kelemahan', 'Gangguan psikologis / ansietas berat', 'Penurunan motivasi / minat'],
    majorSubjective: ['Menolak melakukan perawatan diri'],
    majorObjective: ['Tidak mampu mandi/mengenakan pakaian/makan/ke toilet/berhias secara mandiri', 'Minat melakukan perawatan diri kurang'],
    minorSubjective: [],
    minorObjective: ['Badan berbau', 'Kuku kotor dan panjang', 'Gigi dan mulut kotor'],
    slkiOutcome: {
      code: 'L.11103',
      label: 'Perawatan Diri',
      expectation: 'Meningkat',
      indicators: ['Kemampuan mandi', 'Kemampuan mengenakan pakaian', 'Kemampuan makan', 'Kemampuan ke toilet (BAB/BAK)', 'Verbalisasi keinginan melakukan perawatan diri', 'Minat melakukan perawatan diri']
    },
    sikiIntervention: {
      code: 'I.11348',
      label: 'Dukungan Perawatan Diri',
      type: 'utama',
      observasi: [
        'Identifikasi kebiasaan aktivitas perawatan diri sesuai usia',
        'Monitor tingkat kemandirian',
        'Identifikasi kebutuhan alat bantu kebersihan diri, berpakaian, berhias, dan makan'
      ],
      terapeutik: [
        'Sediakan lingkungan yang terapeutik (privasi terjaga, hangat, rileks)',
        'Siapkan keperluan pribadi (mis. sabun, sampo, sikat gigi)',
        'Dampingi dalam melakukan perawatan diri sampai mandiri',
        'Fasilitasi untuk menerima keadaan ketergantungan'
      ],
      edukasi: [
        'Anjurkan melakukan perawatan diri secara konsisten sesuai kemampuan'
      ],
      kolaborasi: []
    }
  },
  {
    code: 'D.0055',
    name: 'Gangguan Pola Tidur',
    category: 'Fisiologis',
    subCategory: 'Aktivitas dan Istirahat',
    definition: 'Gangguan kualitas dan kuantitas waktu tidur akibat faktor eksternal.',
    type: 'aktual',
    causes: ['Hambatan lingkungan (kelembapan lingkungan sekitar, suhu lingkungan, pencahayaan, kebisingan)', 'Kurangnya kontrol tidur', 'Nyeri', 'Kurang privasi'],
    majorSubjective: ['Mengeluh sulit tidur', 'Mengeluh sering terjaga', 'Mengeluh tidak puas tidur', 'Mengeluh pola tidur berubah', 'Mengeluh istirahat tidak cukup'],
    majorObjective: [],
    minorSubjective: ['Mengeluh kemampuan beraktivitas menurun'],
    minorObjective: ['Mata tampak cekung', 'Sering menguap'],
    slkiOutcome: {
      code: 'L.05045',
      label: 'Pola Tidur',
      expectation: 'Membaik',
      indicators: ['Keluhan sulit tidur', 'Keluhan sering terjaga', 'Keluhan tidak puas tidur', 'Keluhan pola tidur berubah', 'Keluhan istirahat tidak cukup']
    },
    sikiIntervention: {
      code: 'I.05174',
      label: 'Dukungan Tidur',
      type: 'utama',
      observasi: [
        'Identifikasi pola aktivitas dan tidur',
        'Identifikasi faktor pengganggu tidur (fisik dan/atau psikologis)'
      ],
      terapeutik: [
        'Modifikasi lingkungan (pencahayaan, kebisingan, suhu, tempat tidur)',
        'Batasi waktu tidur siang, jika perlu',
        'Fasilitasi menghilangkan stres sebelum tidur',
        'Tetapkan jadwal tidur rutin'
      ],
      edukasi: [
        'Jelaskan pentingnya tidur cukup selama sakit',
        'Anjurkan menepati kebiasaan waktu tidur',
        'Anjurkan menghindari makanan/minuman yang mengganggu tidur (kafein)'
      ],
      kolaborasi: []
    }
  },
  {
    code: 'D.0128',
    name: 'Keterlambatan Pemulihan Pascabedah',
    category: 'Fisiologis',
    subCategory: 'Aktivitas dan Istirahat',
    definition: 'Perpanjangan jumlah hari pascabedah yang dibutuhkan individu untuk memulai dan melakukan aktivitas mempertahankan hidup, kesehatan, dan kesejahteraan.',
    type: 'aktual',
    causes: ['Skor ASA (American Society of Anesthesiologists) tinggi', 'Obesitas', 'Edema luka operasi', 'Infeksi luka pasca bedah', 'Nyeri hebat pasca bedah'],
    majorSubjective: ['Mengeluh tidak nyaman', 'Mengeluh nyeri'],
    majorObjective: ['Memerlukan bantuan untuk melakukan perawatan diri', 'Keterlambatan penyembuhan luka operasi'],
    minorSubjective: ['Enggan melakukan pergerakan'],
    minorObjective: ['Drainase luka operasi berlebih', 'Waktu pemulihan lebih panjang dari yang diharapkan'],
    slkiOutcome: {
      code: 'L.14129',
      label: 'Pemulihan Pascabedah',
      expectation: 'Meningkat',
      indicators: ['Kenyamanan', 'Kemampuan melakukan aktivitas perawatan diri', 'Penyembuhan luka', 'Nyeri', 'Drainase luka']
    },
    sikiIntervention: {
      code: 'I.14537',
      label: 'Perawatan Pascabedah',
      type: 'utama',
      observasi: [
        'Monitor tanda-tanda vital',
        'Monitor bising usus dan flatus',
        'Monitor intake dan output cairan',
        'Periksa luka operasi (karakteristik balutan, drainase)'
      ],
      terapeutik: [
        'Pertahankan kepatenan jalan napas',
        'Posisikan pasien untuk kenyamanan dan mencegah aspirasi',
        'Lakukan mobilisasi bertahap pasca bedah'
      ],
      edukasi: [
        'Ajarkan latihan napas dalam dan batuk efektif',
        'Jelaskan pentingnya mobilisasi dini'
      ],
      kolaborasi: [
        'Kolaborasi pemberian analgetik dan antibiotik pascabedah'
      ]
    }
  },
  {
    code: 'D.0017',
    name: 'Risiko Perdarahan',
    category: 'Fisiologis',
    subCategory: 'Sirkulasi',
    definition: 'Beresiko mengalami kehilangan darah baik internal (terjadi di dalam tubuh) maupun eksternal (terjadi hingga keluar tubuh).',
    type: 'risiko',
    causes: ['Aneurisma', 'Gangguan koagulasi (trombositopenia)', 'Efek agen farmakologis (antikoagulan, NSAID)', 'Tindakan pembedahan / trauma fisik berat', 'Riwayat ulkus peptikum'],
    majorSubjective: [],
    majorObjective: [],
    minorSubjective: [],
    minorObjective: [],
    slkiOutcome: {
      code: 'L.02017',
      label: 'Tingkat Perdarahan',
      expectation: 'Menurun',
      indicators: ['Kelembapan membran mukosa', 'Perdarahan pascabedah', 'Hemoglobin', 'Hematokrit', 'Tekanan darah', 'Denyut nadi apikal']
    },
    sikiIntervention: {
      code: 'I.02067',
      label: 'Pencegahan Perdarahan',
      type: 'utama',
      observasi: [
        'Monitor tanda dan gejala perdarahan (hematom, petekie, epistaksis, melena, drainase)',
        'Monitor nilai hematokrit/hemoglobin sebelum dan setelah kehilangan darah',
        'Monitor tanda-tanda vital ortostatik'
      ],
      terapeutik: [
        'Pertahankan bed rest selama perdarahan aktif',
        'Batasi tindakan invasif jika memungkinkan',
        'Gunakan sikat gigi yang lembut atau kapas'
      ],
      edukasi: [
        'Jelaskan tanda dan gejala perdarahan kepada pasien dan keluarga',
        'Anjurkan segera melapor jika menemukan perdarahan'
      ],
      kolaborasi: [
        'Kolaborasi pemberian produk darah (trombosit, PRC, FFP) jika diindikasikan'
      ]
    }
  },
  {
    code: 'D.0083',
    name: 'Gangguan Citra Tubuh',
    category: 'Psikologis',
    subCategory: 'Integritas Ego',
    definition: 'Perubahan persepsi tentang tubuh yang diakibatkan oleh perubahan bentuk, struktur atau fungsi tubuh.',
    type: 'aktual',
    causes: ['Perubahan struktur/bentuk tubuh (amputasi, trauma, luka parut, luka bedah, gips)', 'Perubahan fungsi tubuh', 'Prosedur bedah'],
    majorSubjective: ['Mengungkapkan kecacatan/kehilangan bagian tubuh'],
    majorObjective: ['Kehilangan bagian tubuh', 'Fungsi/struktur tubuh berubah/hilang'],
    minorSubjective: ['Mengungkapkan perasaan negatif tentang tubuhnya', 'Takut penolakan/reaksi orang lain'],
    minorObjective: ['Menyembunyikan/menunjukkan bagian tubuh secara berlebihan', 'Fokus pada penampilan masa lalu', 'Respon nonverbal pada perubahan tubuh'],
    slkiOutcome: {
      code: 'L.09067',
      label: 'Citra Tubuh',
      expectation: 'Meningkat',
      indicators: ['Verbalisasi perasaan positif tentang tubuh', 'Verbalisasi penerimaan perubahan tubuh', 'Kemampuan melihat bagian tubuh yang berubah', 'Kemampuan menyentuh bagian tubuh yang berubah', 'Hubungan sosial']
    },
    sikiIntervention: {
      code: 'I.09305',
      label: 'Promosi Citra Tubuh',
      type: 'utama',
      observasi: [
        'Identifikasi harapan citra tubuh berdasarkan tahap perkembangan',
        'Identifikasi budaya, agama, jenis kelamin, dan umur terkait citra tubuh',
        'Monitor frekuensi pernyataan kritik terhadap diri sendiri'
      ],
      terapeutik: [
        'Diskusikan perubahan tubuh dan fungsinya',
        'Bantu menentukan realistis harapan tubuh',
        'Bantu mengidentifikasi tindakan yang meningkatkan penampilan'
      ],
      edukasi: [
        'Jelaskan kepada keluarga tentang perawatan perubahan tubuh',
        'Anjurkan mengungkapkan perasaan terhadap perubahan tubuh'
      ],
      kolaborasi: []
    }
  },
  {
    code: 'D.0141',
    name: 'Risiko Luka Tekan (Dekubitus)',
    category: 'Fisiologis',
    subCategory: 'Aktivitas dan Istirahat',
    definition: 'Beresiko mengalami cedera lokal pada kulit dan/atau jaringan di bawahnya, biasanya di atas tonjolan tulang, akibat tekanan yang berkepanjangan dikombinasikan dengan gesekan.',
    type: 'risiko',
    causes: ['Penurunan mobilitas / tirah baring lama', 'Penurunan persepsi sensorik', 'Kelembapan kulit (inkontinensia)', 'Gaya gesek dan pergeseran', 'Malnutrisi'],
    majorSubjective: [],
    majorObjective: [],
    minorSubjective: [],
    minorObjective: [],
    slkiOutcome: {
      code: 'L.14125',
      label: 'Integritas Kulit dan Jaringan',
      expectation: 'Meningkat',
      indicators: ['Kemerahan pada tonjolan tulang', 'Elastisitas kulit', 'Keutuhan kulit', 'Tekstur kulit']
    },
    sikiIntervention: {
      code: 'I.14534',
      label: 'Pencegahan Luka Tekan',
      type: 'utama',
      observasi: [
        'Periksa kondisi kulit di atas tonjolan tulang tiap shift',
        'Identifikasi skor skala Braden / Norton untuk risiko luka tekan'
      ],
      terapeutik: [
        'Ubah posisi tiap 2 jam (miring kanan, telentang, miring kiri)',
        'Gunakan matras busa atau kasur udara (air mattress)',
        'Jaga sprei tetap kering, bersih, dan bebas dari kerutan',
        'Oleskan pelembap/lotion pada kulit yang kering'
      ],
      edukasi: [
        'Jelaskan kepada pasien dan keluarga pentingnya alih baring berkala'
      ],
      kolaborasi: []
    }
  },
  {
    code: 'D.0039',
    name: 'Risiko Syok',
    category: 'Fisiologis',
    subCategory: 'Sirkulasi',
    definition: 'Beresiko mengalami ketidakcukupan aliran darah ke jaringan tubuh, yang dapat mengakibatkan disfungsi seluler yang mengancam jiwa.',
    type: 'risiko',
    causes: ['Hipovolemia (dehidrasi berat, perdarahan masif)', 'Hipotensi persisten', 'Infeksi sistemik / sepsis', 'Sindrom respons inflamasi sistemik'],
    majorSubjective: [],
    majorObjective: [],
    minorSubjective: [],
    minorObjective: [],
    slkiOutcome: {
      code: 'L.02048',
      label: 'Tingkat Syok',
      expectation: 'Menurun',
      indicators: ['Kekuatan nadi', 'Tingkat kesadaran', 'Saturasi oksigen', 'Tekanan darah sistolik', 'Tekanan darah diastolik', 'Frekuensi nadi', 'Pucat', 'Akral dingin']
    },
    sikiIntervention: {
      code: 'I.02068',
      label: 'Pencegahan Syok',
      type: 'utama',
      observasi: [
        'Monitor status kardiopulmonal (frekuensi nadi, kekuatan nadi, frekuensi napas, TD, MAP)',
        'Monitor status oksigenasi (oksimetri nadi, AGD)',
        'Monitor status cairan (masukan dan haluaran, turgor kulit, CRT)'
      ],
      terapeutik: [
        'Berikan oksigenasi untuk mempertahankan saturasi oksigen > 94%',
        'Pasang jalur intravena kaliber besar (jarum 16G atau 18G)'
      ],
      edukasi: [
        'Jelaskan tanda dan gejala awal syok kepada pasien dan keluarga',
        'Anjurkan segera melapor jika merasa pusing berputar atau sesak'
      ],
      kolaborasi: [
        'Kolaborasi pemberian cairan IV kristaloid cepat sesuai protokol syok'
      ]
    }
  },
  {
    code: 'D.0011',
    name: 'Risiko Ketidakseimbangan Elektrolit',
    category: 'Fisiologis',
    subCategory: 'Nutrisi dan Cairan',
    definition: 'Beresiko mengalami perubahan kadar serum elektrolit yang dapat mengganggu kesehatan.',
    type: 'risiko',
    causes: ['Gagal ginjal', 'Ketidakseimbangan cairan (dehidrasi/kelebihan)', 'Efek samping obat (diuretik)', 'Muntah/diare berkepanjangan', 'Luka bakar luas'],
    majorSubjective: [],
    majorObjective: [],
    minorSubjective: [],
    minorObjective: [],
    slkiOutcome: {
      code: 'L.03021',
      label: 'Keseimbangan Elektrolit',
      expectation: 'Meningkat',
      indicators: ['Serum natrium', 'Serum kalium', 'Serum klorida', 'Serum kalsium', 'Serum magnesium']
    },
    sikiIntervention: {
      code: 'I.03122',
      label: 'Pemantauan Elektrolit',
      type: 'utama',
      observasi: [
        'Identifikasi kemungkinan penyebab ketidakseimbangan elektrolit',
        'Monitor kadar serum elektrolit (Na, K, Cl, Ca)',
        'Monitor tanda dan gejala ketidakseimbangan elektrolit (aritmia, kram otot, parestesia, kelemahan)'
      ],
      terapeutik: [
        'Atur interval waktu pemantauan sesuai dengan kondisi pasien',
        'Dokumentasikan hasil pemantauan'
      ],
      edukasi: [
        'Jelaskan tujuan dan prosedur pemantauan'
      ],
      kolaborasi: [
        'Kolaborasi koreksi elektrolit (mis. KCl drip atau NaCl 3%) jika nilai kritis'
      ]
    }
  }
];
