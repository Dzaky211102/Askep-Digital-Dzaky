/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShiftType } from '../types/askep';

/**
 * Returns a Date object shifted to Asia/Makassar (UTC+8) time representation.
 */
export function getWitaDate(date: Date = new Date()): Date {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const witaOffset = 8 * 60 * 60 * 1000;
  return new Date(utc + witaOffset);
}

/**
 * Format date in YYYY-MM-DD using WITA
 */
export function formatWitaDateInput(date: Date = new Date()): string {
  const wita = getWitaDate(date);
  const y = wita.getFullYear();
  const m = String(wita.getMonth() + 1).padStart(2, '0');
  const d = String(wita.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format datetime in YYYY-MM-DDTHH:mm for datetime-local inputs
 */
export function formatWitaDateTimeInput(date: Date = new Date()): string {
  const wita = getWitaDate(date);
  const y = wita.getFullYear();
  const m = String(wita.getMonth() + 1).padStart(2, '0');
  const d = String(wita.getDate()).padStart(2, '0');
  const hh = String(wita.getHours()).padStart(2, '0');
  const mm = String(wita.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

/**
 * Format time in HH:mm using WITA
 */
export function formatWitaTimeInput(date: Date = new Date()): string {
  const wita = getWitaDate(date);
  const hh = String(wita.getHours()).padStart(2, '0');
  const mm = String(wita.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Format full human-readable string: e.g. "Sabtu, 04 Okt 2026, 18:30 WITA"
 */
export function formatWitaDisplay(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';
  
  const wita = getWitaDate(date);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const dayName = days[wita.getDay()];
  const d = String(wita.getDate()).padStart(2, '0');
  const m = months[wita.getMonth()];
  const y = wita.getFullYear();
  const hh = String(wita.getHours()).padStart(2, '0');
  const mm = String(wita.getMinutes()).padStart(2, '0');

  return `${dayName}, ${d} ${m} ${y}, ${hh}:${mm} WITA`;
}

/**
 * Format time only for digital clock: e.g. "18:04:22 WITA"
 */
export function formatWitaClock(date: Date = new Date()): string {
  const wita = getWitaDate(date);
  const hh = String(wita.getHours()).padStart(2, '0');
  const mm = String(wita.getMinutes()).padStart(2, '0');
  const ss = String(wita.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss} WITA`;
}

/**
 * Determine nursing shift based on WITA hour:
 * - Pagi: 07:00 - 14:00 (07:00 to 13:59)
 * - Sore: 14:00 - 21:00 (14:00 to 20:59)
 * - Malam: 21:00 - 07:00 (21:00 to 06:59)
 */
export function getCurrentShift(date: Date = new Date()): ShiftType {
  const wita = getWitaDate(date);
  const hour = wita.getHours();

  if (hour >= 7 && hour < 14) {
    return 'pagi';
  } else if (hour >= 14 && hour < 21) {
    return 'sore';
  } else {
    return 'malam';
  }
}

export function getShiftLabel(shift: ShiftType): string {
  switch (shift) {
    case 'pagi':
      return 'Dinas Pagi (07.00 - 14.00 WITA)';
    case 'sore':
      return 'Dinas Sore (14.00 - 21.00 WITA)';
    case 'malam':
      return 'Dinas Malam (21.00 - 07.00 WITA)';
  }
}
