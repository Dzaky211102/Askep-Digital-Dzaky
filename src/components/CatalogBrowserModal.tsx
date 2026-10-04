/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ALL_CATALOG_3S } from '../data/extendedCatalog';
import {
  BookOpen,
  Search,
  X,
  FileJson,
  Upload,
  Download,
  CheckCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface CatalogBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatalogBrowserModal: React.FC<CatalogBrowserModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [activeCode, setActiveCode] = useState<string>('D.0077');

  if (!isOpen) return null;

  const filtered = ALL_CATALOG_3S.filter(item => {
    const matchSearch =
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.slkiOutcome.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sikiIntervention.label.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCat = selectedCategory === 'semua' || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const activeItem = ALL_CATALOG_3S.find(i => i.code === activeCode) || filtered[0] || ALL_CATALOG_3S[0];

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(ALL_CATALOG_3S, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Katalog_3S_PPNI_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Katalog Terpadu Standar 3S (SDKI – SLKI – SIKI) DPP PPNI</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Basis data resmi standar profesi keperawatan Indonesia edisi 1 cetakan II.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl transition-colors"
              title="Unduh Database Katalog Format JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor JSON</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari kode (D.xxxx / L.xxxx / I.xxxx), nama masalah, atau intervensi..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option value="semua">Semua Kategori ({ALL_CATALOG_3S.length})</option>
              <option value="Fisiologis">Fisiologis</option>
              <option value="Psikologis">Psikologis</option>
              <option value="Perilaku">Perilaku</option>
              <option value="Relasional">Relasional</option>
              <option value="Lingkungan">Lingkungan</option>
            </select>
          </div>
        </div>

        {/* 2 Columns: List on Left, Comprehensive 3S Mapping on Right */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left Column: Diagnosis List (4 cols) */}
          <div className="md:col-span-4 p-3 overflow-y-auto max-h-[60vh] md:max-h-none space-y-1.5">
            {filtered.map(item => {
              const isSelected = activeItem.code === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setActiveCode(item.code)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/70 shadow-xs ring-1 ring-teal-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono font-bold text-teal-800 text-[11px]">
                      {item.code}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                        item.type === 'aktual'
                          ? 'bg-rose-100 text-rose-800'
                          : item.type === 'risiko'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <strong className="text-slate-900 font-bold block mb-0.5">{item.name}</strong>
                  <span className="text-[10px] text-slate-500">{item.subCategory}</span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed 3S Interconnection View (8 cols) */}
          <div className="md:col-span-8 p-6 space-y-5 overflow-y-auto">
            {/* Diagnosis SDKI Detail */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded border border-teal-300">
                    {activeItem.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{activeItem.name}</h3>
                </div>
                <span className="text-slate-500 text-[11px]">
                  Kategori: <strong>{activeItem.category}</strong> ({activeItem.subCategory})
                </span>
              </div>

              <div>
                <strong className="text-slate-800 block mb-0.5">Definisi SDKI:</strong>
                <p className="text-slate-700 leading-relaxed">{activeItem.definition}</p>
              </div>

              <div>
                <strong className="text-slate-800 block mb-0.5">
                  Penyebab (Etiologi) / Faktor Risiko:
                </strong>
                <ul className="list-disc pl-4 text-slate-700 space-y-0.5">
                  {activeItem.causes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <strong className="text-teal-900 block mb-1">Gejala & Tanda Mayor:</strong>
                  <ul className="list-disc pl-4 text-slate-700 text-[11px] space-y-0.5">
                    {activeItem.majorSubjective.map((ms, i) => (
                      <li key={`ms_${i}`}>[DS] {ms}</li>
                    ))}
                    {activeItem.majorObjective.map((mo, i) => (
                      <li key={`mo_${i}`}>[DO] {mo}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong className="text-slate-700 block mb-1">Gejala & Tanda Minor:</strong>
                  <ul className="list-disc pl-4 text-slate-600 text-[11px] space-y-0.5">
                    {activeItem.minorSubjective.map((ms, i) => (
                      <li key={`mins_${i}`}>[DS] {ms}</li>
                    ))}
                    {activeItem.minorObjective.map((mo, i) => (
                      <li key={`mino_${i}`}>[DO] {mo}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Luaran SLKI Mapping */}
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-900 bg-teal-200/70 px-2 py-0.5 rounded">
                    {activeItem.slkiOutcome.code}
                  </span>
                  <h4 className="font-bold text-teal-950 text-sm">
                    Luaran Utama: {activeItem.slkiOutcome.label}
                  </h4>
                </div>
                <span className="text-teal-800 font-bold uppercase text-[11px]">
                  Ekspektasi: {activeItem.slkiOutcome.expectation}
                </span>
              </div>

              <div>
                <strong className="text-teal-950 block mb-1">Indikator Penilaian (Skala 1 – 5):</strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {activeItem.slkiOutcome.indicators.map((ind, i) => (
                    <div
                      key={i}
                      className="bg-white p-2 rounded-lg border border-teal-200 text-slate-800 font-medium text-[11px]"
                    >
                      • {ind}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Intervensi SIKI Mapping (O/T/E/K) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                    {activeItem.sikiIntervention.code}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Intervensi Utama: {activeItem.sikiIntervention.label}
                  </h4>
                </div>
                <span className="text-slate-500 font-semibold uppercase text-[11px]">
                  {activeItem.sikiIntervention.type}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded text-[11px]">
                    Observasi ({activeItem.sikiIntervention.observasi.length})
                  </span>
                  <ul className="list-disc pl-4 text-slate-700 mt-1 space-y-0.5">
                    {activeItem.sikiIntervention.observasi.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    Terapeutik ({activeItem.sikiIntervention.terapeutik.length})
                  </span>
                  <ul className="list-disc pl-4 text-slate-700 mt-1 space-y-0.5">
                    {activeItem.sikiIntervention.terapeutik.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                    Edukasi ({activeItem.sikiIntervention.edukasi.length})
                  </span>
                  <ul className="list-disc pl-4 text-slate-700 mt-1 space-y-0.5">
                    {activeItem.sikiIntervention.edukasi.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                    Kolaborasi ({activeItem.sikiIntervention.kolaborasi.length})
                  </span>
                  <ul className="list-disc pl-4 text-slate-700 mt-1 space-y-0.5">
                    {activeItem.sikiIntervention.kolaborasi.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Copyright & Source Attributions */}
        <div className="p-3 bg-slate-900 text-slate-400 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>
              Sumber Rujukan Resmi: <strong>Standar Diagnosis (SDKI), Standar Luaran (SLKI), & Standar Intervensi (SIKI)</strong> © Dewan Pengurus Pusat Persatuan Perawat Nasional Indonesia (DPP PPNI).
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl border border-slate-700"
          >
            Tutup Katalog
          </button>
        </div>
      </div>
    </div>
  );
};
