/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, X, Cloud, Terminal, Shield, BookOpen, Download, Server } from 'lucide-react';

interface HelpDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpDeploymentModal: React.FC<HelpDeploymentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-400" />
              <span>Panduan Penggunaan, Setup Cloud & Deployment AsKep 3S</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dokumentasi teknis untuk mahasiswa ners, perawat ruangan, dan administrator sistem.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Section 1: Alur Kerja AsKep 3S */}
          <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-200 space-y-2">
            <h3 className="font-bold text-teal-950 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-700" />
              <span>1. Alur Dokumentasi Asuhan Keperawatan KMB</span>
            </h3>
            <ol className="list-decimal pl-5 space-y-1 text-slate-700">
              <li><strong>Pengkajian (Tahap 1):</strong> Isi 7 formulir (Sampul, Identitas, Riwayat & Genogram visual 3 generasi, 13 Domain Doenges & TTV, Head-to-Toe, Penunjang Lab/Rad, dan Terapi Obat).</li>
              <li><strong>Analisa Data Otomatis (Tahap 2):</strong> Klik tombol <em>"Buat Analisa Data Otomatis"</em>. Rule engine memindai kata kunci dan temuan klinis (skala nyeri, luka, TTV, skor Morse) dan mencocokkannya dengan tanda mayor (≥80%) dan minor buku SDKI PPNI. Pilih diagnosa dan urutkan prioritas.</li>
              <li><strong>Diagnosis SDKI (Tahap 3):</strong> Periksa tabel PES yang diformulasikan otomatis (Aktual: <em>Problem b.d Etiologi d.d Gejala</em>; Risiko: <em>Problem dibuktikan dengan faktor risiko</em>). Anda dapat mengedit teks bila diperlukan.</li>
              <li><strong>Intervensi 3S (Tahap 4):</strong> Setiap diagnosis otomatis dipetakan ke luaran SLKI (indikator skala 1–5 dengan target waktu) dan intervensi SIKI (4 kategori tindakan: Observasi, Terapeutik, Edukasi, Kolaborasi).</li>
              <li><strong>Implementasi (Tahap 5):</strong> Centang checklist tindakan saat dinas per shift (Pagi 07-14, Sore 14-21, Malam 21-07 WITA). Waktu WITA dan nama perawat otomatis tercatat.</li>
              <li><strong>Evaluasi SOAP (Tahap 6):</strong> Nilai pencapaian indikator luaran SLKI (skala 1–5), status <em>Tujuan Tercapai / Tercapai Sebagian</em> dihitung otomatis, lalu simpan rencana tindak lanjut.</li>
            </ol>
          </div>

          {/* Section 2: Waktu WITA */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-600" />
              <span>2. Jam Digital & Zona Waktu WITA (Asia/Makassar, UTC+8)</span>
            </h3>
            <p>
              Seluruh waktu di dalam aplikasi dikunci pada <strong>WITA (UTC+8)</strong> terlepas dari zona waktu laptop atau handphone pengguna. Jam digital aktif berjalan di bagian atas header. Shift dinas dibagi:
            </p>
            <ul className="list-disc pl-5 space-y-0.5 font-mono text-[11px] text-slate-800">
              <li>Dinas Pagi: 07.00 – 14.00 WITA</li>
              <li>Dinas Sore: 14.00 – 21.00 WITA</li>
              <li>Dinas Malam: 21.00 – 07.00 WITA</li>
            </ul>
          </div>

          {/* Section 3: Cara Deploy ke Hosting */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>3. Langkah Deploy ke Vercel / Netlify / Firebase Hosting</span>
            </h3>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800">A. Deploy ke Vercel:</h4>
              <p>1. Push repositori ini ke GitHub / GitLab Anda.</p>
              <p>2. Buka dashboard Vercel (vercel.com), klik <strong>Add New Project</strong> dan import repositori.</p>
              <p>3. Framework Preset: <strong>Vite</strong>. Build command: <code className="bg-slate-200 px-1 rounded">npm run build</code>, Output directory: <code className="bg-slate-200 px-1 rounded">dist</code>.</p>
              <p>4. Klik <strong>Deploy</strong>. Aplikasi langsung online dengan URL HTTPS gratis.</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-slate-800">B. Deploy ke Firebase Hosting:</h4>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] space-y-1">
                <p># Install Firebase CLI</p>
                <p className="text-teal-300">npm install -g firebase-tools</p>
                <p># Login dan inisialisasi</p>
                <p className="text-teal-300">firebase login</p>
                <p className="text-teal-300">firebase init hosting</p>
                <p># Build dan deploy</p>
                <p className="text-teal-300">npm run build</p>
                <p className="text-teal-300">firebase deploy --only hosting</p>
              </div>
            </div>
          </div>

          {/* Section 4: Backup & Ekspor Excel */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Download className="w-4 h-4 text-teal-600" />
              <span>4. Backup Data & Ekspor Spreadsheet (.xlsx)</span>
            </h3>
            <p>
              Operator dapat mencentang satu atau beberapa pasien di dashboard lalu mengklik <strong>Ekspor Excel</strong>. File <code className="bg-slate-200 px-1 rounded">AsKep_[tanggal-WITA].xlsx</code> memuat lembar kerja lengkap (Ringkasan, Identitas, 13 Domain, Pemeriksaan Fisik, Penunjang, Terapi, Analisa Data, Diagnosis SDKI, Intervensi 3S, Implementasi, dan SOAP) dengan format rapi dan highlight otomatis pada nilai lab abnormal.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
