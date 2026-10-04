/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CatalogItem3S, CATALOG_3S } from './catalog3s';
export type { CatalogItem3S };

export const ADDITIONAL_CATALOG_3S: CatalogItem3S[] = [
  {
    code: 'D.0078',
    name: 'Nyeri Kronis',
    category: 'Fisiologis',
    subCategory: 'Nyeri dan Kenyamanan',
    definition: 'Pengalaman sensorik atau emosional yang berkaitan dengan kerusakan jaringan aktual atau fungsional yang berlangsung lebih dari 3 bulan.',
    type: 'aktual',
    causes: ['Kondisi muskuloskeletal kronis', 'Kerusakan sistem saraf', 'Infiltrasi tumor'],
    majorSubjective: ['Mengeluh nyeri lebih dari 3 bulan', 'Merasa depresi / tertekan'],
    majorObjective: ['Tampak meringis', 'Gelisah', 'Tidak mampu menuntaskan aktivitas'],
    minorSubjective: ['Merasa takut mengalami cedera ulang'],
    minorObjective: ['Bersikap protektif', 'Waspada', 'Pola tidur berubah', 'Anoreksia'],
    slkiOutcome: {
      code: 'L.08066',
      label: 'Tingkat Nyeri',
      expectation: 'Menurun',
      indicators: ['Keluhan nyeri', 'Meringis', 'Sikap protektif', 'Gelisah', 'Pola tidur']
    },
    sikiIntervention: {
      code: 'I.08238',
      label: 'Manajemen Nyeri',
      type: 'utama',
      observasi: ['Identifikasi faktor pemberat/peringan nyeri kronis', 'Monitor efek samping penggunaan analgetik jangka panjang'],
      terapeutik: ['Fasilitasi terapi komplementer (akupresur, meditasi)', 'Berikan kompres hangat/dingin'],
      edukasi: ['Ajarkan teknik manajemen stres dan relaksasi', 'Anjurkan memonitor nyeri mandiri'],
      kolaborasi: ['Kolaborasi rujukan ke klinik manajemen nyeri']
    }
  },
  {
    code: 'D.0136',
    name: 'Risiko Cedera',
    category: 'Lingkungan',
    subCategory: 'Keamanan dan Proteksi',
    definition: 'Beresiko mengalami bahaya atau kerusakan fisik yang menyebabkan seseorang memerlukan bantuan.',
    type: 'risiko',
    causes: ['Perubahan orientasi afektif', 'Perubahan sensasi', 'Disfungsi autoimun', 'Hipoksia jaringan', 'Kegagalan mekanisme pertahanan tubuh'],
    majorSubjective: [],
    majorObjective: [],
    minorSubjective: [],
    minorObjective: [],
    slkiOutcome: {
      code: 'L.14136',
      label: 'Tingkat Cedera',
      expectation: 'Menurun',
      indicators: ['Kejadian cedera', 'Luka/lecet', 'Fraktur', 'Perdarahan']
    },
    sikiIntervention: {
      code: 'I.14537',
      label: 'Pencegahan Cedera',
      type: 'utama',
      observasi: ['Identifikasi area lingkungan yang berpotensi menyebabkan cedera'],
      terapeutik: ['Sediakan pencahayaan yang memadai', 'Gunakan pengaman tempat tidur sesuai protokol'],
      edukasi: ['Jelaskan alasan intervensi pencegahan jatuh/cedera'],
      kolaborasi: []
    }
  },
  {
    code: 'D.0006',
    name: 'Risiko Aspirasi',
    category: 'Fisiologis',
    subCategory: 'Respirasi',
    definition: 'Beresiko mengalami masuknya sekresi gastrointestinal, sekresi orofaring, benda cair atau padat ke dalam saluran trakeobronkial.',
    type: 'risiko',
    causes: ['Penurunan tingkat kesadaran', 'Penurunan refleks muntah dan/atau batuk', 'Gangguan menelan', 'Selang nasogastrik (NGT)', 'Pemberian makanan enteral'],
    majorSubjective: [],
    majorObjective: [],
    minorSubjective: [],
    minorObjective: [],
    slkiOutcome: {
      code: 'L.01006',
      label: 'Tingkat Aspirasi',
      expectation: 'Menurun',
      indicators: ['Tingkat kesadaran', 'Kemampuan menelan', 'Kebersihan jalan napas', 'Dispnea', 'Sianosis']
    },
    sikiIntervention: {
      code: 'I.01018',
      label: 'Pencegahan Aspirasi',
      type: 'utama',
      observasi: ['Monitor tingkat kesadaran, refleks batuk, refleks muntah, dan kemampuan menelan'],
      terapeutik: ['Posisikan tegak 90 derajat saat makan atau minimal 30 menit setelah makan'],
      edukasi: ['Anjurkan makan perlahan dan kunyah sampai halus'],
      kolaborasi: []
    }
  },
  {
    code: 'D.0008',
    name: 'Penurunan Curah Jantung',
    category: 'Fisiologis',
    subCategory: 'Sirkulasi',
    definition: 'Ketidakadekuatan jantung memompa darah untuk memenuhi kebutuhan metabolisme tubuh.',
    type: 'aktual',
    causes: ['Perubahan irama jantung', 'Perubahan frekuensi jantung', 'Perubahan kontraktilitas', 'Perubahan afterload', 'Perubahan preload'],
    majorSubjective: ['Lelah', 'Dispnea'],
    majorObjective: ['Bradikardia / Takikardia', 'Gambaran EKG aritmia', 'Edema', 'Distensi vena jugularis', 'Tekanan darah meningkat/menurun'],
    minorSubjective: ['Paroxysmal nocturnal dyspnea (PND)', 'Ortopnea', 'Batuk'],
    minorObjective: ['Suara jantung S3/S4', 'Ejection fraction (EF) menurun', 'CRT > 3 detik', 'Oliguria', 'Pucat'],
    slkiOutcome: {
      code: 'L.02008',
      label: 'Curah Jantung',
      expectation: 'Meningkat',
      indicators: ['Kekuatan nadi perifer', 'Ejection fraction', 'Edema', 'Dispnea', 'Tekanan darah', 'Suara jantung S3/S4']
    },
    sikiIntervention: {
      code: 'I.02075',
      label: 'Perawatan Jantung',
      type: 'utama',
      observasi: ['Identifikasi tanda/gejala primer penurunan curah jantung (dispnea, kelelahan, edema, ortopnea)', 'Monitor tekanan darah dan nadi tiap 4 jam', 'Monitor intake dan output cairan'],
      terapeutik: ['Posisikan semi-Fowler atau Fowler', 'Berikan diet jantung rendah garam', 'Berikan oksigen untuk mempertahankan SpO2 > 94%'],
      edukasi: ['Anjurkan beraktivitas fisik sesuai toleransi', 'Anjurkan berhenti merokok'],
      kolaborasi: ['Kolaborasi pemberian inotropik / diuretik / antiaritmia']
    }
  },
  {
    code: 'D.0020',
    name: 'Diare',
    category: 'Fisiologis',
    subCategory: 'Eliminasi',
    definition: 'Pengeluaran feses yang sering, lunak dan tidak berbentuk.',
    type: 'aktual',
    causes: ['Inflamasi gastrointestinal', 'Iritasi gastrointestinal', 'Proses infeksi', 'Malabsorpsi'],
    majorSubjective: [],
    majorObjective: ['Defekasi lebih dari 3 kali dalam 24 jam', 'Feses lembek atau cair'],
    minorSubjective: ['Urgency (kebelet)', 'Kram abdomen'],
    minorObjective: ['Frekuensi peristaltik usus meningkat (> 30x/mnt)', 'Bising usus hiperaktif'],
    slkiOutcome: {
      code: 'L.04033',
      label: 'Eliminasi Fekal',
      expectation: 'Membaik',
      indicators: ['Konsistensi feses', 'Frekuensi defekasi', 'Peristaltik usus', 'Kram abdomen']
    },
    sikiIntervention: {
      code: 'I.03101',
      label: 'Manajemen Diare',
      type: 'utama',
      observasi: ['Identifikasi penyebab diare', 'Identifikasi riwayat pemberian makanan', 'Monitor warna, volume, frekuensi, dan konsistensi tinja'],
      terapeutik: ['Berikan asupan cairan oral (oralit)', 'Pasang jalur IV jika dehidrasi sedang-berat'],
      edukasi: ['Anjurkan makanan porsi kecil dan sering serta rendah serat selama fase akut'],
      kolaborasi: ['Kolaborasi pemberian obat antimotilitas / antibiotik jika bakteri']
    }
  },
  {
    code: 'D.0040',
    name: 'Gangguan Eliminasi Urine',
    category: 'Fisiologis',
    subCategory: 'Eliminasi',
    definition: 'Disfungsi eliminasi urin.',
    type: 'aktual',
    causes: ['Penurunan kapasitas kandung kemih', 'Iritasi kandung kemih', 'Kelemahan otot panggul', 'Efek tindakan medis'],
    majorSubjective: ['Desakan berkemih (urgensi)', 'Urin menetes (dribbling)', 'Sering buang air kecil (frekuensi)', 'Nokturia'],
    majorObjective: ['Distensi kandung kemih', 'Berkemih tidak tuntas (hesitancy)', 'Volume residu urin meningkat'],
    minorSubjective: [],
    minorObjective: ['Enuresis'],
    slkiOutcome: {
      code: 'L.04034',
      label: 'Eliminasi Urine',
      expectation: 'Membaik',
      indicators: ['Sensasi berkemih', 'Desakan berkemih', 'Distensi kandung kemih', 'Urin menetes', 'Frekuensi berkemih']
    },
    sikiIntervention: {
      code: 'I.04152',
      label: 'Manajemen Eliminasi Urine',
      type: 'utama',
      observasi: ['Identifikasi tanda dan gejala retensi atau inkontinensia urin', 'Monitor eliminasi urin (frekuensi, konsistensi, aroma, volume, dan warna)'],
      terapeutik: ['Catat waktu-waktu dan haluaran berkemih', 'Batasi asupan cairan di malam hari'],
      edukasi: ['Ajarkan tanda dan gejala infeksi saluran kemih', 'Ajarkan mengenali tanda berkemih dan waktu yang tepat'],
      kolaborasi: []
    }
  },
  {
    code: 'D.0063',
    name: 'Gangguan Menelan',
    category: 'Fisiologis',
    subCategory: 'Neurosensori',
    definition: 'Fungsi menelan abnormal akibat defisit struktur atau fungsi oral, faring, atau esofagus.',
    type: 'aktual',
    causes: ['Gangguan serebrovaskular (stroke)', 'Kerusakan saraf kranial', 'Paralisis fasial', 'Kelemahan otot leher'],
    majorSubjective: ['Mengeluh sulit menelan'],
    majorObjective: ['Batuk sebelum/saat/setelah menelan', 'Makanan tertinggal di rongga mulut', 'Refleks menelan lambat atau tidak ada'],
    minorSubjective: ['Sensasi tersangkut di tenggorokan'],
    minorObjective: ['Regurgitasi', 'Salivasi berlebih (ngiler)', 'Muntah'],
    slkiOutcome: {
      code: 'L.06052',
      label: 'Status Menelan',
      expectation: 'Membaik',
      indicators: ['Kemampuan menelan', 'Refleks menelan', 'Batuk saat makan', 'Tersedak', 'Makanan tertinggal di mulut']
    },
    sikiIntervention: {
      code: 'I.06180',
      label: 'Pencegahan Aspirasi pada Gangguan Menelan',
      type: 'utama',
      observasi: ['Periksa kemampuan menelan dengan tes air putih', 'Monitor posisi makan dan tanda aspirasi'],
      terapeutik: ['Posisikan tegak 90 derajat', 'Sediakan makanan bentuk bubur saring / lunak', 'Siapkan suction di dekat tempat tidur'],
      edukasi: ['Ajarkan manuver menelan (chin tuck)'],
      kolaborasi: ['Kolaborasi dengan terapis wicara dan ahli gizi']
    }
  },
  {
    code: 'D.0119',
    name: 'Gangguan Komunikasi Verbal',
    category: 'Relasional',
    subCategory: 'Interaksi Sosial',
    definition: 'Penurunan, perlambatan, atau ketiadaan kemampuan untuk menerima, memproses, mengirim, dan/atau menggunakan sistem simbol.',
    type: 'aktual',
    causes: ['Penurunan sirkulasi serebral', 'Gangguan neuromuskular', 'Hambatan fisik (trakeostomi, intubasi)', 'Hambatan psikologis'],
    majorSubjective: [],
    majorObjective: ['Tidak mampu berbicara atau mendengar', 'Menunjukkan respon tidak sesuai'],
    minorSubjective: ['Afasia', 'Disartria', 'Apraksia'],
    minorObjective: ['Pelo', 'Gagap', 'Menolak berbicara'],
    slkiOutcome: {
      code: 'L.13118',
      label: 'Komunikasi Verbal',
      expectation: 'Meningkat',
      indicators: ['Kemampuan berbicara', 'Kemampuan mendengar', 'Kesesuaian ekspresi wajah/tubuh', 'Respon perilaku']
    },
    sikiIntervention: {
      code: 'I.13492',
      label: 'Promosi Komunikasi: Defisit Bicara',
      type: 'utama',
      observasi: ['Monitor kecepatan, tekanan, kuantitas, volume, dan diksi bicara', 'Monitor proses kognitif, anatomis, dan fisiologis yang berkaitan dengan bicara'],
      terapeutik: ['Gunakan metode komunikasi alternatif (papan tulis, kartu gambar, isyarat tangan)', 'Berikan waktu yang cukup untuk merespon pertanyaan'],
      edukasi: ['Anjurkan berbicara perlahan', 'Ajarkan keluarga cara berkomunikasi yang efektif'],
      kolaborasi: ['Rujuk ke terapis wicara jika perlu']
    }
  },
  {
    code: 'D.0131',
    name: 'Hipotermia',
    category: 'Fisiologis',
    subCategory: 'Termoregulasi',
    definition: 'Suhu tubuh berada di bawah rentang normal tubuh (< 36.0 C).',
    type: 'aktual',
    causes: ['Kerusakan hipotalamus', 'Konsumsi alkohol', 'Berat badan ekstrem', 'Terpapar lingkungan suhu rendah', 'Efek agen farmakologis'],
    majorSubjective: [],
    majorObjective: ['Kulit teraba dingin', 'Menggigil', 'Suhu tubuh di bawah normal (< 36.0 C)'],
    minorSubjective: [],
    minorObjective: ['Akrosianosis', 'Bradikardia', 'Dasar kuku sianotik', 'Hipoglikemia', 'Hipoventilasi'],
    slkiOutcome: {
      code: 'L.14134',
      label: 'Termoregulasi',
      expectation: 'Membaik',
      indicators: ['Menggigil', 'Suhu tubuh', 'Suhu kulit', 'Akral dingin', 'Bradikardia']
    },
    sikiIntervention: {
      code: 'I.14507',
      label: 'Manajemen Hipotermia',
      type: 'utama',
      observasi: ['Monitor suhu tubuh', 'Identifikasi penyebab hipotermia (terpapar AC dingin, pasca operasi)'],
      terapeutik: ['Sediakan lingkungan hangat (selimut pemanas/blanket warmer)', 'Ganti pakaian yang basah'],
      edukasi: ['Anjurkan makan/minum hangat'],
      kolaborasi: ['Kolaborasi pemberian cairan infus hangat jika hipotermia berat']
    }
  },
  {
    code: 'D.0058',
    name: 'Keletihan',
    category: 'Fisiologis',
    subCategory: 'Aktivitas dan Istirahat',
    definition: 'Penurunan kapasitas kerja fisik dan mental yang tidak pulih dengan istirahat biasa.',
    type: 'aktual',
    causes: ['Gangguan tidur', 'Gaya hidup monoton', 'Kondisi fisiologis (anemia, penyakit kronis)', 'Peristiwa hidup negatif'],
    majorSubjective: ['Merasa energi tidak pulih walaupun telah tidur', 'Merasa kurang tenaga', 'Mengeluh lelah'],
    majorObjective: ['Tidak mampu mempertahankan aktivitas fisik', 'Tampak lesu'],
    minorSubjective: ['Merasa bersalah akibat tidak mampu menjalankan tanggung jawab'],
    minorObjective: ['Kebutuhan istirahat meningkat'],
    slkiOutcome: {
      code: 'L.05046',
      label: 'Tingkat Keletihan',
      expectation: 'Menurun',
      indicators: ['Verbalisasi kepulihan energi', 'Kemampuan melakukan aktivitas rutin', 'Lesu', 'Sakit kepala', 'Keluhan lelah']
    },
    sikiIntervention: {
      code: 'I.05178',
      label: 'Manajemen Energi',
      type: 'utama',
      observasi: ['Identifikasi gangguan fungsi tubuh yang mengakibatkan kelelahan', 'Monitor kelelahan fisik dan emosional'],
      terapeutik: ['Sediakan lingkungan nyaman dan tenang', 'Lakukan rentang gerak pasif dan aktif bertahap'],
      edukasi: ['Anjurkan tirah baring terencana', 'Ajarkan strategi koping untuk mengurangi kelelahan'],
      kolaborasi: ['Kolaborasi dengan dokter dan gizi untuk terapi anemia/nutrisi']
    }
  },
  {
    code: 'D.0114',
    name: 'Ketidakpatuhan',
    category: 'Perilaku',
    subCategory: 'Penyuluhan dan Pembelajaran',
    definition: 'Perilaku individu dan/atau pemberi asuhan tidak mengikuti rencana perawatan/pengobatan yang disepakati bersama dengan tenaga kesehatan profesional.',
    type: 'aktual',
    causes: ['Kurang pemahaman terhadap instruksi pengobatan', 'Ketidaksesuaian rencana dengan gaya hidup', 'Fasilitas pelayanan kesehatan tidak memadai', 'Kendala finansial'],
    majorSubjective: [],
    majorObjective: ['Menolak menjalani perawatan/pengobatan', 'Perilaku tidak mengikuti program pengobatan/perawatan', 'Tanda-tanda penyakit menetap atau memburuk'],
    minorSubjective: ['Menyatakan ketidakmampuan mengikuti program'],
    minorObjective: ['Terdapat komplikasi akibat tidak patuh obat'],
    slkiOutcome: {
      code: 'L.12110',
      label: 'Tingkat Kepatuhan',
      expectation: 'Meningkat',
      indicators: ['Verbalisasi kemauan mematuhi program', 'Verbalisasi mengikuti anjuran', 'Perilaku mengikuti program pengobatan', 'Tanda gejala komplikasi']
    },
    sikiIntervention: {
      code: 'I.12361',
      label: 'Dukungan Kepatuhan Program Pengobatan',
      type: 'utama',
      observasi: ['Identifikasi kepatuhan menjalani program pengobatan', 'Identifikasi alasan ketidakpatuhan'],
      terapeutik: ['Fasilitasi membuat jadwal minum obat harian', 'Libatkan keluarga dalam pengawasan minum obat (PMO)'],
      edukasi: ['Informasikan konsekuensi tidak mematuhi program pengobatan', 'Anjurkan pasien dan keluarga bertanya hal yang belum dipahami'],
      kolaborasi: []
    }
  },
  {
    code: 'D.0074',
    name: 'Gangguan Rasa Nyaman',
    category: 'Psikologis',
    subCategory: 'Nyeri dan Kenyamanan',
    definition: 'Perasaan kurang senang, lega, dan sempurna dalam dimensi fisik, psikospiritual, lingkungan, dan/atau sosial.',
    type: 'aktual',
    causes: ['Gejala penyakit', 'Kurang privasi', 'Ketidakadekuatan sumber daya', 'Program pengobatan/perawatan', 'Gangguan stimulus lingkungan'],
    majorSubjective: ['Mengeluh tidak nyaman'],
    majorObjective: ['Gelisah'],
    minorSubjective: ['Mengeluh sulit tidur', 'Tidak mampu rileks', 'Mengeluh kedinginan/kepanasan', 'Merasa gatal'],
    minorObjective: ['Menunjukkan gejala distres', 'Tampak merintih/menangis', 'Pola eliminasi berubah'],
    slkiOutcome: {
      code: 'L.08064',
      label: 'Status Kenyamanan',
      expectation: 'Meningkat',
      indicators: ['Kesejahteraan fisik', 'Kesejahteraan psikologis', 'Dukungan sosial', 'Keluhan tidak nyaman', 'Gelisah']
    },
    sikiIntervention: {
      code: 'I.08244',
      label: 'Manajemen Kenyamanan Lingkungan',
      type: 'utama',
      observasi: ['Identifikasi sumber ketidaknyamanan (suhu, kebisingan, pencahayaan)'],
      terapeutik: ['Atur suhu ruangan yang nyaman', 'Atur posisi tidur yang nyaman', 'Batasi kunjungan jika perlu'],
      edukasi: ['Jelaskan pentingnya lingkungan yang tenang dan istirahat'],
      kolaborasi: []
    }
  },
  {
    code: 'D.0088',
    name: 'Ketidakberdayaan',
    category: 'Psikologis',
    subCategory: 'Integritas Ego',
    definition: 'Persepsi bahwa tindakan seseorang tidak akan mempengaruhi hasil secara signifikan; persepsi kurang kontrol terhadap situasi saat ini atau yang akan datang.',
    type: 'aktual',
    causes: ['Program perawatan yang kompleks', 'Lingkungan perawatan kesehatan yang tidak mendukung', 'Penyakit kronis yang memburuk'],
    majorSubjective: ['Menyatakan frustrasi atau tidak mampu berbuat apa-apa'],
    majorObjective: ['Enggan mengungkapkan perasaan', 'Ketergantungan pada orang lain'],
    minorSubjective: ['Merasa terasing'],
    minorObjective: ['Apatis', 'Pasif dalam pengambilan keputusan'],
    slkiOutcome: {
      code: 'L.09071',
      label: 'Keberdayaan',
      expectation: 'Meningkat',
      indicators: ['Pernyataan mampu melakukan tugas', 'Pernyataan keyakinan diri', 'Partisipasi dalam perawatan', 'Ketergantungan']
    },
    sikiIntervention: {
      code: 'I.09265',
      label: 'Promosi Harapan',
      type: 'utama',
      observasi: ['Identifikasi harapan masa depan', 'Identifikasi mekanisme koping yang biasa digunakan'],
      terapeutik: ['Bantu mengidentifikasi tujuan yang realistis', 'Libatkan pasien dalam perencanaan perawatan'],
      edukasi: ['Ajarkan mengenali aspek-aspek kehidupan yang masih dapat dikendalikan'],
      kolaborasi: []
    }
  },
  {
    code: 'D.0115',
    name: 'Kesiapan Peningkatan Manajemen Kesehatan',
    category: 'Perilaku',
    subCategory: 'Penyuluhan dan Pembelajaran',
    definition: 'Pola pengaturan dan pengintegrasian ke dalam kebiasaan sehari-hari program pengobatan untuk penyakit atau sekuelanya yang memuaskan untuk memenuhi tujuan kesehatan tertentu dan dapat ditingkatkan.',
    type: 'promosi_kesehatan',
    causes: ['Peningkatan motivasi hidup sehat', 'Keinginan mengoptimalkan kontrol penyakit'],
    majorSubjective: ['Mengekspresikan keinginan untuk mengelola perawatan masalah kesehatan'],
    majorObjective: ['Pilihan hidup sehari-hari tepat untuk memenuhi tujuan program kesehatan'],
    minorSubjective: ['Mengekspresikan minat dalam meningkatkan status kesehatan'],
    minorObjective: ['Menggambarkan pengurangan faktor risiko'],
    slkiOutcome: {
      code: 'L.12104',
      label: 'Manajemen Kesehatan',
      expectation: 'Meningkat',
      indicators: ['Melakukan tindakan untuk mengurangi faktor risiko', 'Menerapkan program perawatan', 'Aktivitas hidup sehari-hari efektif memenuhi tujuan']
    },
    sikiIntervention: {
      code: 'I.12460',
      label: 'Bimbingan Sistem Pelayanan Kesehatan',
      type: 'utama',
      observasi: ['Identifikasi masalah kesehatan saat ini dan kesiapan meningkatkan perawatan'],
      terapeutik: ['Fasilitasi konsultasi dengan tim medis multidisiplin', 'Berikan penguatan positif terhadap komitmen hidup sehat'],
      edukasi: ['Jelaskan hak dan kewajiban pasien serta rencana kontrol pasca rawat'],
      kolaborasi: []
    }
  },
  {
    code: 'D.0032',
    name: 'Risiko Ketidakseimbangan Cairan',
    category: 'Fisiologis',
    subCategory: 'Nutrisi dan Cairan',
    definition: 'Beresiko mengalami penurunan, peningkatan atau percepatan perpindahan cairan dari intravaskuler, interstisial atau intraseluler.',
    type: 'risiko',
    causes: ['Prosedur pembedahan mayor', 'Trauma/perdarahan', 'Luka bakar', 'Penyakit ginjal dan kelenjar', 'Disfungsi intestinal'],
    majorSubjective: [],
    majorObjective: [],
    minorSubjective: [],
    minorObjective: [],
    slkiOutcome: {
      code: 'L.03020',
      label: 'Keseimbangan Cairan',
      expectation: 'Meningkat',
      indicators: ['Asupan cairan', 'Haluaran urin', 'Kelembapan membran mukosa', 'Edema', 'Tekanan darah', 'Denyut nadi radialis']
    },
    sikiIntervention: {
      code: 'I.03121',
      label: 'Pemantauan Cairan',
      type: 'utama',
      observasi: ['Monitor frekuensi dan kekuatan nadi', 'Monitor frekuensi napas', 'Monitor tekanan darah', 'Monitor berat badan harian', 'Catat intake dan output cairan'],
      terapeutik: ['Atur interval waktu pemantauan sesuai kondisi pasien'],
      edukasi: ['Jelaskan tujuan dan prosedur pemantauan'],
      kolaborasi: []
    }
  }
];

export const ALL_CATALOG_3S: CatalogItem3S[] = [...CATALOG_3S, ...ADDITIONAL_CATALOG_3S];
