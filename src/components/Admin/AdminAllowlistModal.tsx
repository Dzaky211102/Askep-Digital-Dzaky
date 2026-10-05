/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AllowedNimRecord } from '../../types/askep';
import {
  fetchAllowedNims,
  addAllowedNim,
  deleteAllowedNim,
  ADMIN_NIM
} from '../../services/nimAuth';
import {
  X,
  Shield,
  UserPlus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  UserCheck
} from 'lucide-react';

interface AdminAllowlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAllowlistModal: React.FC<AdminAllowlistModalProps> = ({ isOpen, onClose }) => {
  const [nims, setNims] = useState<AllowedNimRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form input states
  const [newNim, setNewNim] = useState('');
  const [newName, setNewName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await fetchAllowedNims();
      setNims(list);
    } catch (err: any) {
      console.warn('Error loading allowlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setFormError(null);
      setFormSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNim.trim() || !newName.trim()) {
      setFormError('NIM dan Nama wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await addAllowedNim(newNim, newName);
      setFormSuccess(`NIM ${newNim} (${newName}) berhasil ditambahkan ke daftar resmi!`);
      setNewNim('');
      setNewName('');
      await loadData();
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menambahkan NIM.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (nim: string, name: string) => {
    if (nim === ADMIN_NIM) {
      alert('NIM Admin utama tidak dapat dihapus.');
      return;
    }

    if (!window.confirm(`Hapus ${name} (${nim}) dari daftar resmi? Pengguna tidak akan bisa mendaftar.`)) {
      return;
    }

    try {
      await deleteAllowedNim(nim);
      await loadData();
    } catch (err: any) {
      alert('Gagal menghapus: ' + (err?.message || 'Kesalahan sistem'));
    }
  };

  const filteredNims = nims.filter(
    item =>
      item.nim.includes(searchTerm) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Kelola Allowlist Pengguna Resmi (Admin)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Koleksi database <code className="font-mono text-teal-300">allowed_nims</code> • Admin: {ADMIN_NIM}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* Add NIM Form */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-teal-600" />
              <span>Tambah Mahasiswa ke Daftar Resmi</span>
            </h4>

            {formError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  NIM (Hanya Angka)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newNim}
                  onChange={e => setNewNim(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 2511102412999"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Mahasiswa
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Siti Nurhaliza"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newNim || !newName}
                  className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  {isSubmitting ? '...' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>

          {/* List Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-800">
                  Daftar Pengguna Resmi ({filteredNims.length})
                </h4>
                <button
                  type="button"
                  onClick={loadData}
                  className="p-1 text-slate-400 hover:text-teal-600 transition-colors"
                  title="Muat Ulang"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Cari nama atau NIM..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {filteredNims.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Tidak ada mahasiswa yang cocok dengan pencarian.
                </div>
              ) : (
                filteredNims.map(item => (
                  <div
                    key={item.nim}
                    className="p-3 bg-white hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          {item.nim === ADMIN_NIM && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-teal-700 font-semibold text-[11px]">
                          {item.nim}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.registered ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Sudah Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Belum Aktivasi</span>
                        </span>
                      )}

                      {item.nim !== ADMIN_NIM && (
                        <button
                          type="button"
                          onClick={() => handleDelete(item.nim, item.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Hapus dari daftar resmi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
