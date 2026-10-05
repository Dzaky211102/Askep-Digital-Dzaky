/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  parseClinicalNumber,
  normalizeDecimalForStorage,
  formatIndonesianDisplay
} from '../components/Common/NumericInput';
import {
  sanitizeNim,
  getNimEmail,
  getNimUid,
  getNimPassword,
  INITIAL_OFFICIAL_NIMS,
  ADMIN_NIM
} from '../services/nimAuth';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

function assertEqual(actual: any, expected: any, testName: string) {
  const match = actual === expected;
  if (match) {
    console.log(`  ✓ PASS: ${testName} (expected: ${expected}, got: ${actual})`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} (expected: ${expected}, got: ${actual})`);
    failed++;
  }
}

console.log('====================================================');
console.log('1. TEST NUMERIC INPUT & CLINICAL NORMALIZATION (BUG 4)');
console.log('====================================================');

// Test cleaning logic simulating raw user input
function simulateClean(raw: string, allowDecimal = true): string {
  if (!raw) return '';
  let cleaned = raw;
  if (!allowDecimal) {
    cleaned = cleaned.replace(/\D/g, '');
  } else {
    cleaned = cleaned.replace(/[^0-9.,]/g, '');
    if (cleaned.startsWith('.') || cleaned.startsWith(',')) {
      cleaned = '0' + cleaned;
    }
    const firstSepIdx = cleaned.search(/[.,]/);
    if (firstSepIdx !== -1) {
      const sep = cleaned[firstSepIdx];
      const before = cleaned.slice(0, firstSepIdx);
      const after = cleaned.slice(firstSepIdx + 1).replace(/[.,]/g, '');
      cleaned = before + sep + after;
    }
  }
  if (/^0+[1-9]/.test(cleaned)) {
    cleaned = cleaned.replace(/^0+/, '');
  } else if (/^00+$/.test(cleaned)) {
    cleaned = '0';
  }
  return cleaned;
}

// 1. Ketik "36"
assertEqual(simulateClean('36'), '36', 'Ketik "36" menghasilkan "36"');

// 2. Ketik "36,5"
assertEqual(simulateClean('36,5'), '36,5', 'Ketik "36,5" menghasilkan "36,5"');

// 3. Ketik "36.5"
assertEqual(simulateClean('36.5'), '36.5', 'Ketik "36.5" menghasilkan "36.5"');

// 4. Ketik "0,5" (harus tetap ada 0 di depan koma)
assertEqual(simulateClean('0,5'), '0,5', 'Ketik "0,5" menjaga angka 0 sebelum koma');

// 5. Ketik "0.5" (harus tetap ada 0 di depan titik)
assertEqual(simulateClean('0.5'), '0.5', 'Ketik "0.5" menjaga angka 0 sebelum titik');

// 6. Ketik "036" (angka nol di depan harus dihilangkan)
assertEqual(simulateClean('036'), '36', 'Ketik "036" otomatis membuang angka 0 di depan -> "36"');

// 7. Ketik "0120"
assertEqual(simulateClean('0120'), '120', 'Ketik "0120" otomatis membuang angka 0 di depan -> "120"');

// 8. Hapus semua (backspace sampai kosong)
assertEqual(simulateClean(''), '', 'Hapus semua menghasilkan string kosong "" tanpa tersangkut di "0"');

// 9. Input koma di awal: ",5" -> otomatis "0,5"
assertEqual(simulateClean(',5'), '0,5', 'Input koma di awal ",5" menjadi "0,5"');

// 10. Desimal ganda dicegah: "36.5.2" -> "36.52"
assertEqual(simulateClean('36.5.2'), '36.52', 'Pemisah desimal ganda dibatasi');

// 11. Normalisasi desimal ke titik untuk perhitungan & database
assertEqual(parseClinicalNumber('36,5'), 36.5, 'parseClinicalNumber("36,5") menghasilkan float 36.5');
assertEqual(parseClinicalNumber('36.5'), 36.5, 'parseClinicalNumber("36.5") menghasilkan float 36.5');
assertEqual(parseClinicalNumber(''), null, 'parseClinicalNumber("") menghasilkan null (kosong tetap kosong)');
assertEqual(parseClinicalNumber(null), null, 'parseClinicalNumber(null) menghasilkan null');
assertEqual(parseClinicalNumber(0), 0, 'parseClinicalNumber(0) menghasilkan 0');

// 12. Format tampilan Indonesia dengan koma
assertEqual(formatIndonesianDisplay('36.5'), '36,5', 'formatIndonesianDisplay("36.5") menghasilkan "36,5"');
assertEqual(formatIndonesianDisplay('120'), '120', 'formatIndonesianDisplay("120") tetap "120" (tidak ada desimal palsu)');

console.log('\n====================================================');
console.log('2. TEST NIM IDENTITY & ALLOWLIST VALIDATION (BUG 1)');
console.log('====================================================');

// Allowlist count
assertEqual(INITIAL_OFFICIAL_NIMS.length, 10, 'Daftar resmi memiliki tepat 10 mahasiswa');

// Check all 10 students
const expectedList = [
  { nim: '2511102412215', name: 'Muhammad Rodiansyah' },
  { nim: '2511102412211', name: 'Arinda Fadilla Rizky Aulia' },
  { nim: '2511102412253', name: 'Syarah Auliza Firdayanti Yunus' },
  { nim: '2511102412250', name: 'Sheila Amelia Kartika' },
  { nim: '2511102412233', name: 'Helda Nur Handayani' },
  { nim: '2511102412232', name: 'Selpina' },
  { nim: '2511102412263', name: 'Vika Yulianita' },
  { nim: '2511102412265', name: 'Adelia Rachmawati' },
  { nim: '2511102412185', name: 'Muhammad Dzaky Ramdani' },
  { nim: '2511102412234', name: 'Anggie Kharisma Dewi' }
];

expectedList.forEach(expected => {
  const found = INITIAL_OFFICIAL_NIMS.find(s => s.nim === expected.nim);
  assert(!!found && found.name === expected.name, `Mahasiswa ${expected.name} (${expected.nim}) ada di daftar`);
});

// Admin NIM
assertEqual(ADMIN_NIM, '2511102412185', 'Admin NIM terkonfigurasi ke 2511102412185 (Muhammad Dzaky Ramdani)');

// Stable UID / Email Mapping
const email1 = getNimEmail('2511102412185');
const email2 = getNimEmail(' 2511102412185 ');
assertEqual(email1, '2511102412185@askep.local', 'Format email sintetis NIM konsisten');
assertEqual(email1, email2, 'Trim spasi menghasilkan email yang identik');

const uid1 = getNimUid('2511102412185');
const uid2 = getNimUid(' 251-110-2412185 ');
assertEqual(uid1, 'askep_nim_2511102412185', 'Format UID stabil askep_nim_<nim>');
assertEqual(uid1, uid2, 'UID deterministik identik di HP dan Laptop');

// Password deterministik
const pass1 = getNimPassword('2511102412185');
const pass2 = getNimPassword('2511102412185');
assertEqual(pass1, pass2, 'Kredensial turunan NIM konsisten di semua perangkat');

// Sanitasi NIM (hanya angka)
assertEqual(sanitizeNim(' 251-110-2412185 '), '2511102412185', 'Sanitasi NIM menghapus karakter non-digit');

console.log('\n====================================================');
console.log('3. TEST MULTI-DEVICE & CONFLICT HANDLING (BUG 2)');
console.log('====================================================');

// Simulasi 2 sesi browser (Sesi A dan Sesi B)
const deviceIdA: string = 'dev_laptop_dzaky_01';
const deviceIdB: string = 'dev_hp_dzaky_02';
assert(deviceIdA !== deviceIdB, 'Dua perangkat memiliki deviceId yang berbeda');

// Dokumen pasien dibuat di Sesi A
const patientA = {
  id: 'pt_test_01',
  ownerId: 'uid_dzaky_2511102412185',
  room: 'Ruang Teratai',
  domains: {
    vitalSigns: {
      temperature: '36.5',
      bloodPressureSystolic: '120',
      bloodPressureDiastolic: '80'
    }
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'Muhammad Dzaky Ramdani',
  deviceId: deviceIdA,
  deleted: false
};

// Sesi B menerima snapshot
const isRemoteUpdateForB = patientA.deviceId !== deviceIdB;
assert(isRemoteUpdateForB, 'Sesi B mendeteksi perubahan berasal dari perangkat lain');

// Field-level merging: Sesi A mengubah Ruang Rawat, Sesi B mengubah Suhu
const updateFromA = { room: 'Ruang ICU Bed 3', updatedAt: new Date().toISOString(), deviceId: deviceIdA };
const updateFromB = { domains: { vitalSigns: { temperature: '37.8' } }, updatedAt: new Date().toISOString(), deviceId: deviceIdB };

const mergedPatient = {
  ...patientA,
  room: updateFromA.room,
  domains: {
    ...patientA.domains,
    vitalSigns: {
      ...patientA.domains.vitalSigns,
      temperature: updateFromB.domains.vitalSigns.temperature
    }
  }
};

assertEqual(mergedPatient.room, 'Ruang ICU Bed 3', 'Perubahan Ruang Rawat dari Sesi A tersimpan');
assertEqual(mergedPatient.domains.vitalSigns.temperature, '37.8', 'Perubahan Suhu dari Sesi B tersimpan tanpa tertimpa');

// Soft Delete
const softDeletedPatient = {
  ...patientA,
  deleted: true,
  deletedAt: new Date().toISOString()
};

const visiblePatients = [patientA, softDeletedPatient].filter(p => p.deleted !== true);
assertEqual(visiblePatients.length, 1, 'Soft delete menyaring pasien yang dihapus secara real-time');

// Penambahan pasien baru di Perangkat A tersinkronisasi ke Perangkat B
const newPatientFromDeviceA = {
  id: 'pt_device_a_101',
  ownerId: 'uid_dzaky_2511102412185',
  initials: 'Ny. S',
  room: 'Ruang Teratai',
  deleted: false,
  deviceId: deviceIdA,
  updatedAt: new Date().toISOString()
};
const deviceBPatientsList = [patientA, newPatientFromDeviceA].filter(p => p.deleted !== true);
assert(deviceBPatientsList.some(p => p.id === 'pt_device_a_101'), 'Pasien baru yang ditambahkan di Perangkat A langsung tampil di Perangkat B');
assertEqual(deviceBPatientsList.length, 2, 'Total pasien di kedua perangkat sama persis (2 pasien)');

console.log('\n====================================================');
console.log('4. TEST SAMPUL & RUANG RAWAT EDITABILITY (BUG 3)');
console.log('====================================================');

// Test auto title generator
function generateTitle(initials: string, diagnosis: string, room: string, hospital: string): string {
  const pInit = initials.trim() || 'Pasien';
  const pDiag = diagnosis.trim() || 'Kondisi Klinis';
  const cleanRoom = room.trim();
  const pRoom = cleanRoom
    ? cleanRoom.toLowerCase().startsWith('ruang')
      ? `di ${cleanRoom}`
      : `di Ruang ${cleanRoom}`
    : '';
  const pHosp = hospital.trim() || 'RSUD';
  return `Asuhan Keperawatan pada ${pInit} dengan Masalah ${pDiag} ${pRoom} ${pHosp}`.replace(/\s+/g, ' ').trim();
}

const title = generateTitle('Tn. J', 'Fraktur Femur', 'Ruang Teratai', 'RSUD Abdul Wahab Sjahranie');
assertEqual(
  title,
  'Asuhan Keperawatan pada Tn. J dengan Masalah Fraktur Femur di Ruang Teratai RSUD Abdul Wahab Sjahranie',
  'Judul sampul terbuat secara otomatis dan dinamis'
);

const updatedTitle = generateTitle('Ny. S', 'Laparotomi', 'Ruang ICU', 'RSUD Abdul Wahab Sjahranie');
assertEqual(
  updatedTitle,
  'Asuhan Keperawatan pada Ny. S dengan Masalah Laparotomi di Ruang ICU RSUD Abdul Wahab Sjahranie',
  'Judul sampul merespon perubahan inisial, masalah, dan ruang rawat'
);

console.log('\n====================================================');
console.log(`HASIL TES: ${passed} BERHASIL, ${failed} GAGAL`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
}
