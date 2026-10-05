/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePatients } from '../../context/PatientContext';
import { Database, UploadCloud, X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface OldDataMigrationModalProps {
  isOpen: boolean;
  localCount: number;
  onConfirmImport: () => Promise<void>;
  onDismiss: () => void;
}

export const OldDataMigrationModal: React.FC<OldDataMigrationModalProps> = ({
  isOpen,
  localCount,
  onConfirmImport,
  onDismiss
}) => {
  const { currentUser } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || localCount === 0) return null;

  const handleImport = async () => {
    setMigrating(true);
    setErrorMsg(null);
    try {
      await onConfirmImport();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mengimpor data.');
      setMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 mx-auto">
          <UploadCloud className="w-6 h-6 text-teal-600 animate-bounce" />
        </div>

        <h3 className="text-center font-bold text-slate-900 text-base">
          Impor Data Lama Perangkat
        </h3>

        <div className="my-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-2">
          <p className="flex items-center gap-1.5 font-bold text-slate-900">
            <Database className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Ditemukan {localCount} data pasien di memori lokal perangkat ini.</span>
          </p>
          <p className="text-slate-600 text-[11px]">
            Apakah Anda ingin memindahkan data pasien ini ke akun cloud NIM <strong>{currentUser?.nim}</strong> agar dapat diakses dari laptop dan HP Anda secara sinkron?
          </p>
          <p className="text-[10px] text-teal-700 font-medium">
            ✓ Data cloud yang sudah ada tidak akan tertimpa.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDismiss}
            disabled={migrating}
            className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Abaikan
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={migrating}
            className="flex-1 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {migrating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memindahkan...</span>
              </>
            ) : (
              <>
                <span>Impor Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
