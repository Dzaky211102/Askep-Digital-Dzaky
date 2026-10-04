/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LabPresetItem {
  testName: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  normalRange: string;
  category: string;
}

export const LAB_PRESETS: LabPresetItem[] = [
  // Hematologi Lengkap
  { testName: 'Hemoglobin (Hb)', unit: 'g/dL', normalMin: 12.0, normalMax: 16.0, normalRange: '12.0 - 16.0', category: 'Hematologi' },
  { testName: 'Leukosit', unit: '/uL', normalMin: 4000, normalMax: 10000, normalRange: '4.000 - 10.000', category: 'Hematologi' },
  { testName: 'Trombosit', unit: '/uL', normalMin: 150000, normalMax: 450000, normalRange: '150.000 - 450.000', category: 'Hematologi' },
  { testName: 'Hematokrit (Ht)', unit: '%', normalMin: 37, normalMax: 48, normalRange: '37 - 48', category: 'Hematologi' },
  { testName: 'Eritrosit', unit: 'juta/uL', normalMin: 4.0, normalMax: 5.5, normalRange: '4.0 - 5.5', category: 'Hematologi' },
  { testName: 'Laju Endap Darah (LED)', unit: 'mm/jam', normalMin: 0, normalMax: 20, normalRange: '0 - 20', category: 'Hematologi' },

  // Kimia Klinik & Fungsi Ginjal / Hati
  { testName: 'Glukosa Darah Sewaktu (GDS)', unit: 'mg/dL', normalMin: 70, normalMax: 140, normalRange: '70 - 140', category: 'Kimia Klinik' },
  { testName: 'Glukosa Darah Puasa (GDP)', unit: 'mg/dL', normalMin: 70, normalMax: 100, normalRange: '70 - 100', category: 'Kimia Klinik' },
  { testName: 'Ureum', unit: 'mg/dL', normalMin: 15, normalMax: 45, normalRange: '15 - 45', category: 'Fungsi Ginjal' },
  { testName: 'Kreatinin', unit: 'mg/dL', normalMin: 0.6, normalMax: 1.2, normalRange: '0.6 - 1.2', category: 'Fungsi Ginjal' },
  { testName: 'SGOT / AST', unit: 'U/L', normalMin: 0, normalMax: 35, normalRange: '0 - 35', category: 'Fungsi Hati' },
  { testName: 'SGPT / ALT', unit: 'U/L', normalMin: 0, normalMax: 45, normalRange: '0 - 45', category: 'Fungsi Hati' },
  { testName: 'Albumin', unit: 'g/dL', normalMin: 3.5, normalMax: 5.2, normalRange: '3.5 - 5.2', category: 'Fungsi Hati' },
  { testName: 'Asam Urat', unit: 'mg/dL', normalMin: 3.0, normalMax: 7.0, normalRange: '3.0 - 7.0', category: 'Kimia Klinik' },

  // Elektrolit
  { testName: 'Natrium (Na+)', unit: 'mEq/L', normalMin: 135, normalMax: 145, normalRange: '135 - 145', category: 'Elektrolit' },
  { testName: 'Kalium (K+)', unit: 'mEq/L', normalMin: 3.5, normalMax: 5.1, normalRange: '3.5 - 5.1', category: 'Elektrolit' },
  { testName: 'Klorida (Cl-)', unit: 'mEq/L', normalMin: 96, normalMax: 106, normalRange: '96 - 106', category: 'Elektrolit' },
  { testName: 'Kalsium (Ca2+)', unit: 'mg/dL', normalMin: 8.5, normalMax: 10.5, normalRange: '8.5 - 10.5', category: 'Elektrolit' },

  // Analisa Gas Darah (AGD)
  { testName: 'pH Darah', unit: '', normalMin: 7.35, normalMax: 7.45, normalRange: '7.35 - 7.45', category: 'AGD' },
  { testName: 'PaCO2', unit: 'mmHg', normalMin: 35, normalMax: 45, normalRange: '35 - 45', category: 'AGD' },
  { testName: 'PaO2', unit: 'mmHg', normalMin: 80, normalMax: 100, normalRange: '80 - 100', category: 'AGD' },
  { testName: 'HCO3', unit: 'mEq/L', normalMin: 22, normalMax: 26, normalRange: '22 - 26', category: 'AGD' },
  { testName: 'Saturasi O2 (SaO2)', unit: '%', normalMin: 95, normalMax: 100, normalRange: '95 - 100', category: 'AGD' }
];

export function determineLabFlag(valStr: string, min?: number, max?: number): 'normal' | 'high' | 'low' {
  const val = parseFloat(valStr.replace(',', '.'));
  if (isNaN(val) || min === undefined || max === undefined) return 'normal';
  if (val > max) return 'high';
  if (val < min) return 'low';
  return 'normal';
}
