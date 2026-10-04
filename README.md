# AsKep 3S — Sistem Dokumentasi Keperawatan KMB Digital (Doenges 13 Domain & 3S PPNI)

Aplikasi web profesional mobile-first untuk mahasiswa profesi ners, perawat klinik, dan perawat pendidik dalam mendigitalkan proses asuhan keperawatan Medikal Bedah (KMB) model 13 domain Doenges terintegrasi penuh dengan panduan **3S DPP PPNI (SDKI, SLKI, SIKI)**.

---

## Fitur Utama

1. **Pengkajian Lengkap 13 Domain Doenges:**
   - Sampul & Metadata resmi (Institusi, Mahasiswa, Stase KMB, RS, Ruangan).
   - Identitas Klien & Peringatan Privasi (Inisial + No. RM).
   - Riwayat Kesehatan (Keluhan utama Masuk vs Saat Dikaji, RPS, RPD, RPK) & **Visual Genogram 3 Generasi** interaktif dengan ekspor gambar PNG.
   - 13 Domain: Neurosensori, Sirkulasi, Pernapasan, Nyeri (PQRST terstruktur + skala 0–10), Makanan/Cairan (Balans 24 jam), Eliminasi, Seksualitas, Aktivitas/Istirahat, Hygiene, Integritas Ego, Interaksi Sosial, Penyuluhan, Patient Safety.
   - Perhitungan otomatis **GCS (Eye/Verbal/Motorik)** dan **Morse Fall Scale (Skor Risiko Jatuh)**.
   - Pemeriksaan fisik Head-to-toe dengan tombol *"Isi Normal Semua"* & tabel kekuatan otot 4 ekstremitas (skala 0–5).
   - Tabel laboratorium dinamis dengan preset lengkap rujukan normal (Hematologi, Kimia, Elektrolit, AGD) dan penanda otomatis **↑ (Tinggi) / ↓ (Rendah)** berwarna.
   - Tabel Terapi Medis terstruktur (Nama obat, Dosis, Rute, Frekuensi, Indikasi).

2. **Rule Engine Analisa Data Otomatis (Inti Aplikasi):**
   - Memindai temuan data subjektif (DS) dan data objektif (DO).
   - Mencocokkan dengan kriteria Tanda Mayor (≥80%) dan Minor buku SDKI PPNI.
   - Menghasilkan kandidat masalah, skor kecocokan (Tinggi/Sedang/Rendah), dan faktor pemicu.
   - Formulasi otomatis kalimat **PES**:
     - *Aktual:* `[Problem] b.d. [Etiologi] d.d. [Tanda/Gejala]`
     - *Risiko:* `[Problem] dibuktikan dengan [Faktor Risiko]` (tanpa d.d.)
   - Operator bebas memilih diagnosis, mengurutkan prioritas (reorder up/down), mengedit kalimat PES, atau menambah diagnosis manual dari seluruh katalog.

3. **Integrasi Standar 3S (SDKI – SLKI – SIKI):**
   - Basis data terstruktur >60 diagnosis KMB resmi DPP PPNI edisi 1 cetakan II.
   - Otomatis memetakan diagnosis ke Luaran SLKI (indikator skala 1–5 dengan target waktu jam) dan Intervensi SIKI (4 kategori: Observasi, Terapeutik, Edukasi, Kolaborasi).

4. **Implementasi & Jam Digital WITA (Asia/Makassar, UTC+8):**
   - Jam digital aktif di header terstandar WITA terlepas dari zona waktu perangkat.
   - Shift dinas: Pagi (07.00–14.00), Sore (14.00–21.00), Malam (21.00–07.00 WITA).
   - Checklist tindakan intervensi otomatis menyimpan cap waktu WITA, nama operator perawat, dan respon klien.
   - Tombol *"Centang Semua Shift Ini"* dengan konfirmasi.

5. **Evaluasi Perkembangan (SOAP):**
   - Penilaian indikator SLKI per shift (skala 1–5).
   - Evaluasi otomatis status luaran: *Tujuan Tercapai / Tercapai Sebagian / Belum Tercapai*.
   - Rencana tindak lanjut (Planning): Lanjutkan, Modifikasi, atau Hentikan intervensi.

6. **Ekspor Spreadsheet (.xlsx via SheetJS) & Format Cetak Siap Pakai:**
   - Ekspor Excel multi-sheet terformat rapi: *Ringkasan Pasien*, *Identitas*, *13 Domain*, *Fisik*, *Penunjang*, *Terapi*, *Analisa Data*, *Diagnosis PES*, *Intervensi 3S*, *Implementasi*, dan *Evaluasi SOAP*.
   - Format cetak resmi dokumen asuhan keperawatan dengan styling print CSS yang siap ditandatangani mahasiswa dan Clinical Instructor (CI).

7. **Data Contoh Bawaan (Seed):**
   - Tersedia kasus *"Tn. J – Fraktur Kominutif Ankle Sinistra"* lengkap dari pengkajian hingga evaluasi SOAP.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
- **Backend / Database:** Firebase Authentication + Cloud Firestore dengan persistensi offline & ABAC Security Rules.
- **Ekspor Data:** SheetJS (`xlsx`).
- **Zona Waktu:** Asia/Makassar (`WITA`, UTC+8).

---

## Panduan Setup Cloud & Deployment

### 1. Menjalankan di Lokal (Development)

```bash
# Clone atau buka direktori proyek
npm install

# Jalankan server pengembangan di port 3000
npm run dev
```

Buka peramban pada `http://localhost:3000`.

### 2. Konfigurasi Firebase (Auth & Firestore)

File `firebase-applet-config.json` telah disediakan secara otomatis. Jika ingin menggunakan proyek Firebase mandiri:
1. Buat proyek baru di [Firebase Console](https://console.firebase.google.com/).
2. Aktifkan **Authentication** (metode Google Sign-in dan Email/Password).
3. Buat database **Cloud Firestore**.
4. Terapkan aturan keamanan pada file `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. Salin konfigurasi web app dari Firebase Console ke file `firebase-applet-config.json` atau variabel `.env`.

### 3. Deploy ke Vercel

1. Buka [Vercel](https://vercel.com) dan hubungkan akun GitHub Anda.
2. Pilih repository `askep-3s`.
3. Pengaturan Build:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Masukkan environment variable dari `.env.example` jika diperlukan.
5. Klik **Deploy**.

### 4. Deploy ke Firebase Hosting

```bash
# Pastikan sudah login ke Firebase CLI
firebase login

# Inisialisasi hosting
firebase init hosting
# Public directory: dist
# Configure as a single-page app: Yes

# Build proyek
npm run build

# Deploy ke live hosting
firebase deploy --only hosting
```

---

## Struktur File Utama

```
├── firebase-blueprint.json       # Intermediate Representation (IR) schema Firestore
├── firestore.rules               # Aturan keamanan ketat Attribute-Based Access Control (ABAC)
├── security_spec.md              # Spesifikasi keamanan & Dirty Dozen payload test
├── src/
│   ├── types/askep.ts            # Tipe data TypeScript komprehensif
│   ├── utils/witaTime.ts         # Utility zona waktu Asia/Makassar (WITA, UTC+8)
│   ├── data/
│   │   ├── catalog3s.ts          # Katalog inti diagnosis, luaran, dan intervensi 3S PPNI
│   │   ├── extendedCatalog.ts    # Perluasan katalog 60+ diagnosis KMB
│   │   ├── labPresets.ts         # Preset nilai rujukan laboratorium lengkap
│   │   └── seedData.ts           # Kasus contoh klinis Tn. J (Fraktur Ankle)
│   ├── services/
│   │   ├── firebase.ts           # Inisialisasi Firebase & error handling Firestore
│   │   ├── ruleEngine.ts         # Clinical Diagnostic Rule Engine berbasis data fokus
│   │   └── excelExport.ts        # Generator file Excel multi-sheet SheetJS
│   ├── context/
│   │   ├── AuthContext.tsx       # State autentikasi (Google, Email, Mode Tamu)
│   │   └── PatientContext.tsx    # State pasien, auto-save debounce, sinkronisasi
│   ├── components/
│   │   ├── Header.tsx            # Digital clock WITA, status sinkronisasi, menu navigasi
│   │   ├── StageNavigation.tsx   # Stepper alur 6 tahap asuhan keperawatan
│   │   ├── PatientBar.tsx        # Bar status pasien aktif & quick actions
│   │   ├── PatientListModal.tsx  # Dashboard multi-pasien & filter ruangan/status
│   │   ├── CalendarView.tsx      # Kalender jadwal shift & catatan SOAP (WITA)
│   │   ├── CatalogBrowserModal.ts# Pencarian katalog 3S & ekspor JSON
│   │   ├── PrintReportModal.tsx  # Format cetak laporan resmi siap pakai (PDF)
│   │   ├── HelpDeploymentModal.ts# Panduan bantuan di dalam aplikasi
│   │   ├── Pengkajian/           # 7 formulir tahap pengkajian 13 domain Doenges
│   │   └── CarePlan/             # Analisa Data, Diagnosis, Intervensi, Implementasi, Evaluasi
│   ├── App.tsx                   # Komponen utama aplikasi
│   └── main.tsx                  # Titik masuk aplikasi
└── package.json
```

---

## Hak Cipta & Rujukan

- Standar Diagnosis Keperawatan Indonesia (SDKI) DPP PPNI
- Standar Luaran Keperawatan Indonesia (SLKI) DPP PPNI
- Standar Intervensi Keperawatan Indonesia (SIKI) DPP PPNI
- Rencana Asuhan Keperawatan: Pedoman untuk Perencanaan dan Pendokumentasian Perawatan Pasien (Marilynn E. Doenges)
