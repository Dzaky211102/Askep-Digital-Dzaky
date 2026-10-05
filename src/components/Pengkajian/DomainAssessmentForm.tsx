/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { DomainAssessment, VitalSigns, PQRSTPain, MorseFallScale } from '../../types/askep';
import {
  Activity,
  Heart,
  Wind,
  Smile,
  Coffee,
  Droplets,
  HeartCrack,
  Moon,
  Sparkles,
  Shield,
  HelpCircle,
  Users,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const DOMAIN_CHECKLIST_PRESETS: Record<string, string[]> = {
  neurosensori: [
    'Compos Mentis (GCS 15)',
    'Pupil isokor 3mm/3mm',
    'Refleks cahaya (+/+)',
    'Pusing / vertigo',
    'Parestesia / kebas',
    'Sakit kepala berdenyut',
    'Refleks patologis (-)'
  ],
  sirkulasi: [
    'Akral hangat',
    'Akral dingin',
    'CRT < 2 detik',
    'CRT > 3 detik (memanjang)',
    'Nadi perifer teraba kuat',
    'Edema lokal non-pitting',
    'Edema tungkai',
    'Konjungtiva anemis (-)'
  ],
  pernapasan: [
    'Vesikuler simetris bilateral',
    'Ronkhi (-/-)',
    'Wheezing (-/-)',
    'Pola napas teratur',
    'Retraksi dinding dada (-)',
    'Pernapasan cuping hidung (-)',
    'Batuk tidak efektif'
  ],
  nyeriKetidaknyamanan: [
    'Ekspresi wajah meringis',
    'Sikap protektif memegangi area sakit',
    'Gelisah menahan nyeri',
    'Nyeri tekan lokal (+)',
    'Bertambah berat saat digerakkan'
  ],
  makananCairan: [
    'Nafsu makan baik',
    'Porsi makan habis 3/4',
    'Turgor kulit elastis < 2 detik',
    'Mukosa bibir lembap',
    'Mual / muntah (-)',
    'Bising usus normal (10-12x/mnt)'
  ],
  eliminasi: [
    'BAK spontan lancar',
    'Urin kuning jernih',
    'Terpasang kateter urine',
    'BAB normal 1x/hari',
    'Distensi kandung kemih (-)'
  ],
  seksualitas: [
    'Tidak ada keluhan organ reproduksi',
    'Tidak ada perdarahan abnormal'
  ],
  aktivitasIstirahat: [
    'Tirah baring (bedrest)',
    'Keterbatasan mobilisasi ekstremitas',
    'Terpasang bidai / gips / fiksasi',
    'ADL dibantu sebagian',
    'Tidur nyenyak 6-7 jam/hari'
  ],
  hygiene: [
    'Kebersihan diri cukup baik',
    'Mandi diseka di tempat tidur',
    'Kuku pendek dan bersih',
    'Oral hygiene bersih'
  ],
  integritasEgo: [
    'Kooperatif saat berkomunikasi',
    'Merasa cemas menghadapi prosedur operasi',
    'Menerima kondisi sakit',
    'Kontak mata baik'
  ],
  interaksiSosial: [
    'Didampingi keluarga / pasangan',
    'Dukungan sosial keluarga sangat baik',
    'Komunikasi dengan ners terbuka'
  ],
  penyuluhanPembelajaran: [
    'Menanyakan jadwal dan prosedur tindakan',
    'Memahami anjuran puasa & istirahat',
    'Perlu edukasi mobilisasi bertahap'
  ],
  patientSafety: [
    'Side rails tempat tidur terpasang kedua sisi',
    'Gelang penanda risiko jatuh kuning terpasang',
    'Bel perawat terjangkau',
    'Lantai ruangan kering dan aman'
  ]
};

export const DomainAssessmentForm: React.FC = () => {
  const { activePatient, savePatient } = usePatients();
  const [openDomainKey, setOpenDomainKey] = useState<string>('nyeriKetidaknyamanan');

  if (!activePatient) return null;

  const domains = activePatient.domains;
  const ttv = domains.vitalSigns;
  const pain = domains.painAssessment;
  const morse = domains.morseFallScale;

  // Helper to parse string with comma/dot to numeric float
  const parseClinicalNumber = (val: string | number | undefined): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    const normalized = String(val).replace(',', '.').trim();
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper to format display value so empty or 0 doesn't force a stuck leading "0"
  const getDisplayValue = (val: string | number | undefined): string => {
    if (val === undefined || val === null || val === '') return '';
    if (val === 0 || val === '0') return '';
    return String(val);
  };

  // Sanitize integer inputs (TD, Nadi, RR, SpO2) - desimalnya di-nolkan dan hilangkan leading zero
  const sanitizeIntegerInput = (raw: string): string => {
    if (!raw) return '';
    // Strip everything from first dot or comma onwards (desimalnya di-nolkan)
    const intOnly = raw.split(/[.,]/)[0];
    let cleaned = intOnly.replace(/[^0-9]/g, '');
    // Strip leading zeroes e.g. "0120" -> "120"
    if (/^0+[1-9]/.test(cleaned)) {
      cleaned = cleaned.replace(/^0+/, '');
    } else if (/^0+$/.test(cleaned)) {
      cleaned = '0';
    }
    return cleaned;
  };

  // Sanitize decimal inputs (Suhu, BB, TB) - mendukung titik dan koma tanpa stuck leading 0
  const sanitizeDecimalInput = (raw: string): string => {
    if (!raw) return '';
    // Allow digits, dot, comma
    let cleaned = raw.replace(/[^0-9.,]/g, '');

    // If starts with separator (e.g. ".5" or ",5") -> "0.5" or "0,5"
    if (cleaned.startsWith('.') || cleaned.startsWith(',')) {
      cleaned = '0' + cleaned;
    }

    // Strip redundant leading zeroes before a non-zero digit, e.g. "036.5" -> "36.5", "01" -> "1"
    if (/^0+[1-9]/.test(cleaned)) {
      cleaned = cleaned.replace(/^0+/, '');
    }

    // Keep only the first decimal separator (either dot or comma)
    const firstSepIndex = cleaned.search(/[.,]/);
    if (firstSepIndex !== -1) {
      const sep = cleaned[firstSepIndex];
      const before = cleaned.slice(0, firstSepIndex);
      const after = cleaned.slice(firstSepIndex + 1).replace(/[.,]/g, '');
      cleaned = before + sep + after;
    }

    return cleaned;
  };

  const integerTtvFields: (keyof VitalSigns)[] = [
    'bloodPressureSystolic',
    'bloodPressureDiastolic',
    'heartRate',
    'respiratoryRate',
    'spO2'
  ];

  const handleTtvChange = (field: keyof VitalSigns, rawValue: any) => {
    let cleanVal = rawValue;
    if (typeof rawValue === 'string') {
      if (integerTtvFields.includes(field)) {
        cleanVal = sanitizeIntegerInput(rawValue);
      } else {
        cleanVal = sanitizeDecimalInput(rawValue);
      }
    }

    const updatedTtv = { ...ttv, [field]: cleanVal };

    // Recalculate GCS total
    if (field === 'gcsEye' || field === 'gcsVerbal' || field === 'gcsMotor') {
      updatedTtv.gcsTotal =
        (Number(updatedTtv.gcsEye) || 0) +
        (Number(updatedTtv.gcsVerbal) || 0) +
        (Number(updatedTtv.gcsMotor) || 0);
    }

    // Recalculate BMI automatically if height and weight are provided
    if (field === 'weightKg' || field === 'heightCm') {
      const wKg = parseClinicalNumber(updatedTtv.weightKg);
      const hCm = parseClinicalNumber(updatedTtv.heightCm);
      const hM = hCm / 100;
      if (hM > 0 && wKg > 0) {
        updatedTtv.bmi = parseFloat((wKg / (hM * hM)).toFixed(1));
      } else {
        updatedTtv.bmi = '';
      }
    }

    savePatient({
      ...activePatient,
      domains: {
        ...domains,
        vitalSigns: updatedTtv
      }
    });
  };

  const handlePainChange = (field: keyof PQRSTPain, value: any) => {
    savePatient({
      ...activePatient,
      domains: {
        ...domains,
        painAssessment: {
          ...pain,
          [field]: value
        }
      }
    });
  };

  const handleMorseChange = (field: keyof MorseFallScale, value: number) => {
    const nextMorse = { ...morse, [field]: value };
    const total =
      Number(nextMorse.historyOfFalling) +
      Number(nextMorse.secondaryDiagnosis) +
      Number(nextMorse.ambulatoryAid) +
      Number(nextMorse.ivTherapy) +
      Number(nextMorse.gaitTransferring) +
      Number(nextMorse.mentalStatus);

    let cat: MorseFallScale['riskCategory'] = 'Risiko Rendah (0-24)';
    if (total >= 51) cat = 'Risiko Tinggi (≥51)';
    else if (total >= 25) cat = 'Risiko Sedang (25-50)';

    nextMorse.totalScore = total;
    nextMorse.riskCategory = cat;

    savePatient({
      ...activePatient,
      domains: {
        ...domains,
        morseFallScale: nextMorse
      }
    });
  };

  const handleDomainTextChange = (
    domainKey: keyof Omit<DomainAssessment, 'vitalSigns' | 'morseFallScale' | 'painAssessment'>,
    type: 'subjective' | 'objective',
    value: string
  ) => {
    savePatient({
      ...activePatient,
      domains: {
        ...domains,
        [domainKey]: {
          ...domains[domainKey],
          [type]: value
        }
      }
    });
  };

  const handleToggleFinding = (
    domainKey: keyof Omit<DomainAssessment, 'vitalSigns' | 'morseFallScale' | 'painAssessment'>,
    finding: string
  ) => {
    const currentFindings = domains[domainKey].findings || [];
    const exists = currentFindings.includes(finding);
    const newFindings = exists
      ? currentFindings.filter(f => f !== finding)
      : [...currentFindings, finding];

    savePatient({
      ...activePatient,
      domains: {
        ...domains,
        [domainKey]: {
          ...domains[domainKey],
          findings: newFindings
        }
      }
    });
  };

  const domainList: { key: any; label: string; icon: React.FC<any> }[] = [
    { key: 'nyeriKetidaknyamanan', label: '1. Nyeri & Kenyamanan (PQRST)', icon: Activity },
    { key: 'aktivitasIstirahat', label: '2. Aktivitas & Istirahat (Mobilisasi / Gips)', icon: Moon },
    { key: 'sirkulasi', label: '3. Sirkulasi (Perfusi / CRT / Edema)', icon: Heart },
    { key: 'pernapasan', label: '4. Pernapasan (Ventilasi / Auskultasi)', icon: Wind },
    { key: 'neurosensori', label: '5. Neurosensori (Saraf / Refleks)', icon: Eye },
    { key: 'makananCairan', label: '6. Makanan & Cairan (Balans / Diet)', icon: Coffee },
    { key: 'eliminasi', label: '7. Eliminasi (Urine & Fekal)', icon: Droplets },
    { key: 'patientSafety', label: '8. Patient Safety & Proteksi', icon: Shield },
    { key: 'hygiene', label: '9. Hygiene (Perawatan Diri)', icon: Sparkles },
    { key: 'integritasEgo', label: '10. Integritas Ego (Kecemasan / Koping)', icon: HeartCrack },
    { key: 'interaksiSosial', label: '11. Interaksi Sosial (Dukungan Keluarga)', icon: Users },
    { key: 'penyuluhanPembelajaran', label: '12. Penyuluhan & Pembelajaran (Edukasi)', icon: HelpCircle },
    { key: 'seksualitas', label: '13. Seksualitas & Reproduksi', icon: Smile }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          <span>Pengkajian 13 Domain Model Doenges, TTV & Skala Jatuh Morse</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Data subjektif (DS) dan data objektif (DO) terstruktur dengan checklist klinis cepat untuk rule engine analisa data SDKI.
        </p>
      </div>

      {/* 1. TANDA-TANDA VITAL LENGKAP & GCS */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Tanda-Tanda Vital (TTV) & Status Kesadaran (GCS)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">TD Sistolik (mmHg)</label>
            <input
              type="text"
              inputMode="numeric"
              value={getDisplayValue(ttv.bloodPressureSystolic)}
              onFocus={e => e.target.select()}
              onChange={e => handleTtvChange('bloodPressureSystolic', e.target.value)}
              placeholder="120"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">TD Diastolik (mmHg)</label>
            <input
              type="text"
              inputMode="numeric"
              value={getDisplayValue(ttv.bloodPressureDiastolic)}
              onFocus={e => e.target.select()}
              onChange={e => handleTtvChange('bloodPressureDiastolic', e.target.value)}
              placeholder="80"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Frekuensi Nadi (x/m)</label>
            <input
              type="text"
              inputMode="numeric"
              value={getDisplayValue(ttv.heartRate)}
              onFocus={e => e.target.select()}
              onChange={e => handleTtvChange('heartRate', e.target.value)}
              placeholder="80"
              className={`w-full px-2.5 py-1.5 bg-white border rounded-xl font-bold ${
                parseClinicalNumber(ttv.heartRate) > 100 || (parseClinicalNumber(ttv.heartRate) > 0 && parseClinicalNumber(ttv.heartRate) < 60)
                  ? 'border-amber-400 text-amber-700'
                  : 'border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Pernapasan RR (x/m)</label>
            <input
              type="text"
              inputMode="numeric"
              value={getDisplayValue(ttv.respiratoryRate)}
              onFocus={e => e.target.select()}
              onChange={e => handleTtvChange('respiratoryRate', e.target.value)}
              placeholder="20"
              className={`w-full px-2.5 py-1.5 bg-white border rounded-xl font-bold ${
                parseClinicalNumber(ttv.respiratoryRate) > 24
                  ? 'border-amber-400 text-amber-700'
                  : 'border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Suhu Tubuh (°C)</label>
            <input
              type="text"
              inputMode="decimal"
              value={getDisplayValue(ttv.temperature)}
              onFocus={e => e.target.select()}
              onChange={e => handleTtvChange('temperature', e.target.value)}
              placeholder="36.5"
              className={`w-full px-2.5 py-1.5 bg-white border rounded-xl font-bold ${
                parseClinicalNumber(ttv.temperature) > 37.5
                  ? 'border-rose-400 text-rose-700'
                  : 'border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">SpO2 (%)</label>
            <input
              type="text"
              inputMode="numeric"
              value={getDisplayValue(ttv.spO2)}
              onFocus={e => e.target.select()}
              onChange={e => handleTtvChange('spO2', e.target.value)}
              placeholder="98"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-teal-700"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">BB (kg)</label>
            <input
              type="text"
              inputMode="decimal"
              value={getDisplayValue(ttv.weightKg)}
              onFocus={e => e.target.select()}
              onChange={e => handleTtvChange('weightKg', e.target.value)}
              placeholder="60"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">TB (cm)</label>
            <input
              type="text"
              inputMode="decimal"
              value={getDisplayValue(ttv.heightCm)}
              onFocus={e => e.target.select()}
              onChange={e => handleTtvChange('heightCm', e.target.value)}
              placeholder="165"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
            />
          </div>
        </div>

        {/* GCS & Kesadaran */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs border-t border-slate-200">
          <div>
            <label className="block font-medium text-slate-600 mb-1">GCS: Eye (1-4)</label>
            <select
              value={ttv.gcsEye}
              onChange={e => handleTtvChange('gcsEye', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
            >
              <option value={4}>4 - Spontan buka mata</option>
              <option value={3}>3 - Terhadap suara/perintah</option>
              <option value={2}>2 - Terhadap rangsang nyeri</option>
              <option value={1}>1 - Tidak ada respon</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">GCS: Verbal (1-5)</label>
            <select
              value={ttv.gcsVerbal}
              onChange={e => handleTtvChange('gcsVerbal', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
            >
              <option value={5}>5 - Orientasi baik & sesuai</option>
              <option value={4}>4 - Bingung / disorientasi</option>
              <option value={3}>3 - Kata-kata tidak teratur</option>
              <option value={2}>2 - Bersuara mengerang/gumam</option>
              <option value={1}>1 - Tidak bersuara</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">GCS: Motorik (1-6)</label>
            <select
              value={ttv.gcsMotor}
              onChange={e => handleTtvChange('gcsMotor', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
            >
              <option value={6}>6 - Mengikuti perintah</option>
              <option value={5}>5 - Melokalisir nyeri</option>
              <option value={4}>4 - Menghindar dari nyeri</option>
              <option value={3}>3 - Fleksi abnormal (dekortikasi)</option>
              <option value={2}>2 - Ekstensi abnormal (deserebrasi)</option>
              <option value={1}>1 - Tidak ada gerakan</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total GCS (Auto)</label>
            <div className="w-full px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-xl font-mono font-bold text-teal-800 text-center text-sm">
              E{ttv.gcsEye}V{ttv.gcsVerbal}M{ttv.gcsMotor} = {ttv.gcsTotal}
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Tingkat Kesadaran</label>
            <select
              value={ttv.consciousness}
              onChange={e => handleTtvChange('consciousness', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-semibold"
            >
              <option value="Compos Mentis">Compos Mentis</option>
              <option value="Apatis">Apatis</option>
              <option value="Somnolen">Somnolen</option>
              <option value="Sopor">Sopor</option>
              <option value="Coma">Coma</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. PENGKAJIAN NYERI PQRST & SKALA 0-10 */}
      <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-rose-950 text-xs flex items-center gap-1.5 uppercase tracking-wide">
            <Activity className="w-4 h-4 text-rose-600" />
            <span>Pengkajian Nyeri Terstruktur PQRST & Skala 0–10 (NRS)</span>
          </h4>
          <span className="font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full text-xs">
            Skala Nyeri: {pain.severityScale} / 10
          </span>
        </div>

        {/* Visual Pain Slider */}
        <div className="px-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
            <span>0 (Tidak Nyeri)</span>
            <span>1-3 (Ringan)</span>
            <span>4-6 (Sedang)</span>
            <span>7-10 (Berat / Sangat Berat)</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={pain.severityScale}
            onChange={e => handlePainChange('severityScale', Number(e.target.value))}
            className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">P (Pemicu & Pereda)</label>
            <input
              type="text"
              value={pain.palliativeProvocative}
              onChange={e => handlePainChange('palliativeProvocative', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl"
              placeholder="e.g. Nyeri bertambah saat gerak..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Q (Kualitas Nyeri)</label>
            <input
              type="text"
              value={pain.quality}
              onChange={e => handlePainChange('quality', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl"
              placeholder="e.g. Berdenyut, tertusuk tajam..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">R (Lokasi & Radiasi)</label>
            <input
              type="text"
              value={pain.regionRadiating}
              onChange={e => handlePainChange('regionRadiating', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl"
              placeholder="e.g. Ankle sinistra menjalar ke betis..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">T (Waktu & Durasi)</label>
            <input
              type="text"
              value={pain.timingDuration}
              onChange={e => handlePainChange('timingDuration', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl"
              placeholder="e.g. Terus-menerus, timbul tiba-tiba..."
            />
          </div>
        </div>
      </div>

      {/* 3. SKOR RISIKO JATUH MORSE (MFS) OTOMATIS */}
      <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5 uppercase tracking-wide">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Skor Pengkajian Risiko Jatuh Morse (Morse Fall Scale)</span>
          </h4>
          <span
            className={`font-bold px-3 py-1 rounded-full text-xs border ${
              morse.totalScore >= 51
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : morse.totalScore >= 25
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            Total Skor: {morse.totalScore} • {morse.riskCategory}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">1. Riwayat Jatuh (3 bln terakhir)</label>
            <select
              value={morse.historyOfFalling}
              onChange={e => handleMorseChange('historyOfFalling', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl"
            >
              <option value={0}>Tidak (0 poin)</option>
              <option value={25}>Ya (25 poin)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">2. Diagnosis Sekunder (≥ 2)</label>
            <select
              value={morse.secondaryDiagnosis}
              onChange={e => handleMorseChange('secondaryDiagnosis', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl"
            >
              <option value={0}>Tidak (0 poin)</option>
              <option value={15}>Ya (15 poin)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">3. Alat Bantu Berjalan</label>
            <select
              value={morse.ambulatoryAid}
              onChange={e => handleMorseChange('ambulatoryAid', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl"
            >
              <option value={0}>Tidak ada / Bedrest / Kursi roda (0)</option>
              <option value={15}>Tongkat / Kruk / Walker (15)</option>
              <option value={30}>Menopang perabot / dinding (30)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">4. Terpasang Infus Intravena</label>
            <select
              value={morse.ivTherapy}
              onChange={e => handleMorseChange('ivTherapy', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl"
            >
              <option value={0}>Tidak (0 poin)</option>
              <option value={20}>Ya (20 poin)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">5. Gaya Berjalan / Berpindah</label>
            <select
              value={morse.gaitTransferring}
              onChange={e => handleMorseChange('gaitTransferring', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl"
            >
              <option value={0}>Normal / Bedrest total (0)</option>
              <option value={10}>Lemah / Pincang / Terbatas (10)</option>
              <option value={20}>Terganggu / Hilang keseimbangan (20)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">6. Status Mental</label>
            <select
              value={morse.mentalStatus}
              onChange={e => handleMorseChange('mentalStatus', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl"
            >
              <option value={0}>Menyadari batas kemampuan diri (0)</option>
              <option value={15}>Lupa keterbatasan / Overestimate (15)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. ACCORDION 13 DOMAIN MODEL DOENGES */}
      <div className="space-y-3">
        <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-2">
          <span>Pengkajian 13 Domain Doenges (DS & DO + Checklist Temuan)</span>
          <span className="text-xs text-slate-500 font-normal">Klik untuk membuka detail domain</span>
        </h4>

        {domainList.map(item => {
          const Icon = item.icon;
          const isOpen = openDomainKey === item.key;
          const currentDomain = domains[item.key as keyof typeof domains] as any;
          const presets = DOMAIN_CHECKLIST_PRESETS[item.key] || [];
          const selectedFindingsCount = currentDomain?.findings?.length || 0;

          return (
            <div
              key={item.key}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen ? 'border-teal-500 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenDomainKey(isOpen ? '' : item.key)}
                className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
                  isOpen ? 'bg-teal-50/60 font-bold text-teal-900' : 'text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isOpen ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold">{item.label}</span>
                    {selectedFindingsCount > 0 && (
                      <span className="ml-2 text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.2 rounded-full">
                        {selectedFindingsCount} temuan
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="p-4 bg-white border-t border-slate-100 space-y-4 text-xs">
                  {/* Checklist temuan umum sekali klik */}
                  {presets.length > 0 && (
                    <div>
                      <p className="font-semibold text-slate-700 mb-1.5">
                        Checklist Temuan Cepat (Klik untuk memilih temuan klinis):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {presets.map(finding => {
                          const isPicked = currentDomain.findings?.includes(finding);
                          return (
                            <button
                              key={finding}
                              type="button"
                              onClick={() => handleToggleFinding(item.key, finding)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                                isPicked
                                  ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {isPicked ? '✓ ' : '+ '}
                              {finding}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2 Kolom DS & DO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Data Subjektif (DS / Gejala)</span>
                        <span className="text-[10px] text-slate-400 font-normal">Apa yang dikatakan pasien</span>
                      </label>
                      <textarea
                        value={currentDomain.subjective || ''}
                        onChange={e => handleDomainTextChange(item.key, 'subjective', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                        placeholder="e.g. Pasien mengatakan..."
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Data Objektif (DO / Tanda)</span>
                        <span className="text-[10px] text-slate-400 font-normal">Apa yang diamati & diperiksa ners</span>
                      </label>
                      <textarea
                        value={currentDomain.objective || ''}
                        onChange={e => handleDomainTextChange(item.key, 'objective', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                        placeholder="e.g. Tampak meringis, edema..."
                      />
                    </div>
                  </div>

                  {/* Khusus Domain Makanan / Cairan: Input Balans Cairan */}
                  {item.key === 'makananCairan' && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">Intake Cairan 24 Jam (mL)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={getDisplayValue(currentDomain.fluidIntakeMl)}
                          onFocus={e => e.target.select()}
                          placeholder="e.g. 1500"
                          onChange={e => {
                            const inClean = sanitizeIntegerInput(e.target.value);
                            const inMl = parseClinicalNumber(inClean);
                            const outMl = parseClinicalNumber(currentDomain.fluidOutputMl);
                            savePatient({
                              ...activePatient,
                              domains: {
                                ...domains,
                                makananCairan: {
                                  ...domains.makananCairan,
                                  fluidIntakeMl: inClean,
                                  fluidBalanceMl: inMl - outMl
                                }
                              }
                            });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">Output Cairan / Urin (mL)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={getDisplayValue(currentDomain.fluidOutputMl)}
                          onFocus={e => e.target.select()}
                          placeholder="e.g. 1400"
                          onChange={e => {
                            const outClean = sanitizeIntegerInput(e.target.value);
                            const outMl = parseClinicalNumber(outClean);
                            const inMl = parseClinicalNumber(currentDomain.fluidIntakeMl);
                            savePatient({
                              ...activePatient,
                              domains: {
                                ...domains,
                                makananCairan: {
                                  ...domains.makananCairan,
                                  fluidOutputMl: outClean,
                                  fluidBalanceMl: inMl - outMl
                                }
                              }
                            });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Balans Cairan (Auto)</label>
                        <div className="w-full px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-xl font-bold text-teal-800 text-center">
                          {currentDomain.fluidBalanceMl >= 0 ? `+${currentDomain.fluidBalanceMl}` : currentDomain.fluidBalanceMl} mL / 24 Jam
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
