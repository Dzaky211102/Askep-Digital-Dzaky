/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export interface WarningRange {
  min?: number;
  max?: number;
  message?: string;
  level?: 'warning' | 'danger';
}

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number | undefined | null;
  onChange: (value: string) => void;
  allowDecimal?: boolean;
  min?: number;
  max?: number;
  warningRange?: WarningRange;
  formatDisplayWithComma?: boolean;
  className?: string;
  placeholder?: string;
}

/**
 * Parses any clinical input (string with dot or comma, number) to clean float or null
 */
export function parseClinicalNumber(val: string | number | undefined | null): number | null {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const str = String(val).replace(',', '.').trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Normalizes decimal representation for internal calculations / storage (using dot)
 */
export function normalizeDecimalForStorage(val: string | number | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  return String(val).replace(',', '.').trim();
}

/**
 * Formats decimal for Indonesian display (using comma) without adding phantom decimals
 */
export function formatIndonesianDisplay(val: string | number | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  return String(val).replace('.', ',');
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  allowDecimal = true,
  min,
  max,
  warningRange,
  formatDisplayWithComma = true,
  className = '',
  placeholder = '',
  onFocus,
  onBlur,
  disabled,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalText, setInternalText] = useState<string>('');

  // Sync internal text with incoming value prop
  useEffect(() => {
    if (!isFocused) {
      if (value === undefined || value === null || value === '') {
        setInternalText('');
      } else {
        const strVal = String(value);
        setInternalText(formatDisplayWithComma ? formatIndonesianDisplay(strVal) : strVal);
      }
    }
  }, [value, isFocused, formatDisplayWithComma]);

  // Clean raw user typing to prevent multiple decimals and strip invalid leading zeroes
  const cleanInputString = (raw: string): string => {
    if (!raw) return '';

    let cleaned = raw;
    if (!allowDecimal) {
      // Integer only: strip anything that is not digit
      cleaned = cleaned.replace(/\D/g, '');
    } else {
      // Decimal: allow digits, dot, comma
      cleaned = cleaned.replace(/[^0-9.,]/g, '');

      // If user typed dot or comma first, prepend "0"
      if (cleaned.startsWith('.') || cleaned.startsWith(',')) {
        cleaned = '0' + cleaned;
      }

      // Keep only the first separator
      const firstSepIdx = cleaned.search(/[.,]/);
      if (firstSepIdx !== -1) {
        const sep = cleaned[firstSepIdx];
        const before = cleaned.slice(0, firstSepIdx);
        const after = cleaned.slice(firstSepIdx + 1).replace(/[.,]/g, '');
        cleaned = before + sep + after;
      }
    }

    // Strip leading zeroes before a non-zero digit: "036" -> "36", but keep "0," / "0." / "0"
    if (/^0+[1-9]/.test(cleaned)) {
      cleaned = cleaned.replace(/^0+/, '');
    } else if (/^00+$/.test(cleaned)) {
      cleaned = '0';
    }

    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setInternalText('');
      onChange('');
      return;
    }

    const cleaned = cleanInputString(raw);

    // Optional hard min/max boundary (if specified)
    if (max !== undefined) {
      const parsed = parseClinicalNumber(cleaned);
      if (parsed !== null && parsed > max) {
        return; // Don't allow typing beyond hard maximum
      }
    }

    setInternalText(cleaned);
    // Send cleaned value (normalize to dot for storage consistency)
    onChange(cleaned);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    e.target.select();
    if (onFocus) onFocus(e);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    // Normalize formatting on blur
    let finalText = internalText.trim();
    if (finalText.endsWith('.') || finalText.endsWith(',')) {
      finalText = finalText.slice(0, -1);
    }

    setInternalText(formatDisplayWithComma ? formatIndonesianDisplay(finalText) : finalText);
    onChange(finalText);

    if (onBlur) onBlur(e);
  };

  // Determine soft warning status
  const parsedVal = parseClinicalNumber(internalText);
  let isWarning = false;
  let warningMessage = '';

  if (warningRange && parsedVal !== null) {
    if (warningRange.min !== undefined && parsedVal < warningRange.min) {
      isWarning = true;
      warningMessage = warningRange.message || `Nilai di bawah normal (< ${warningRange.min})`;
    } else if (warningRange.max !== undefined && parsedVal > warningRange.max) {
      isWarning = true;
      warningMessage = warningRange.message || `Nilai di atas normal (> ${warningRange.max})`;
    }
  }

  const borderClass = isWarning
    ? warningRange?.level === 'danger'
      ? 'border-rose-400 focus:ring-rose-500 text-rose-800'
      : 'border-amber-400 focus:ring-amber-500 text-amber-900'
    : 'border-slate-300 focus:ring-teal-500 text-slate-900';

  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode="decimal"
        value={internalText}
        onChange={handleChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-2.5 py-1.5 bg-white border rounded-xl font-bold transition-all outline-hidden focus:ring-2 disabled:bg-slate-100 disabled:text-slate-400 ${borderClass} ${className}`}
        {...rest}
      />
      {isWarning && (
        <span
          title={warningMessage}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none"
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        </span>
      )}
    </div>
  );
};
