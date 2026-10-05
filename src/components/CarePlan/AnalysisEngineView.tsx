/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { usePatients } from '../../context/PatientContext';
import { generateAnalisaData } from '../../services/ruleEngine';
import { ALL_CATALOG_3S } from '../../data/extendedCatalog';
import { DiagnosticCandidate, NursingDiagnosisCarePlan, SikiIntervention } from '../../types/askep';
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  ArrowRight,
  Info,
  Search
} from 'lucide-react';

export const AnalysisEngineView: React.FC = () => {
  const { activePatient, activeCarePlan, saveCarePlan, setActiveStage } = usePatients();
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchCatalogTerm, setSearchCatalogTerm] = useState('');
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  // Auto-persist generated candidates if empty
  useEffect(() => {
    if (activePatient && activeCarePlan && (!activeCarePlan.candidates || activeCarePlan.candidates.length === 0)) {
      const generated = generateAnalisaData(activePatient);
      if (generated && generated.length > 0) {
        saveCarePlan({
          ...activeCarePlan,
          candidates: generated
        });
      }
    }
  }, [activePatient?.id, activeCarePlan?.id]);

  if (!activePatient) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 font-sans">
        Pilih atau tambahkan pasien untuk menampilkan analisa data.
      </div>
    );
  }

  // Fallback: candidates are ALWAYS available and never empty
  const candidates: DiagnosticCandidate[] =
    activeCarePlan?.candidates && activeCarePlan.candidates.length > 0
      ? activeCarePlan.candidates
      : generateAnalisaData(activePatient);

  // Generate / Run Rule Engine
  const handleRunRuleEngine = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const generated = generateAnalisaData(activePatient);
        if (activeCarePlan) {
          saveCarePlan({
            ...activeCarePlan,
            candidates: generated
          });
        }
      } catch (err) {
        console.error('Error generating analisa data:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  const handleToggleCandidate = (id: string) => {
    if (!activeCarePlan) return;
    const updated = candidates.map(c => (c.id === id ? { ...c, selected: !c.selected } : c));
    saveCarePlan({
      ...activeCarePlan,
      candidates: updated
    });
  };

  const handleMoveCandidate = (index: number, direction: 'up' | 'down') => {
    if (!activeCarePlan) return;
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= candidates.length) return;

    const reordered = [...candidates];
    const temp = reordered[index];
    reordered[index] = reordered[newIdx];
    reordered[newIdx] = temp;

    reordered.forEach((c, i) => {
      c.priorityOrder = i + 1;
    });

    saveCarePlan({
      ...activeCarePlan,
      candidates: reordered
    });
  };

  const handleUpdateCandidate = (id: string, updates: Partial<DiagnosticCandidate>) => {
    if (!activeCarePlan) return;
    const updated = candidates.map(c => (c.id === id ? { ...c, ...updates } : c));
    saveCarePlan({
      ...activeCarePlan,
      candidates: updated
    });
  };

  const handleDeleteCandidate = (id: string) => {
    if (!activeCarePlan) return;
    const updated = candidates.filter(c => c.id !== id);
    updated.forEach((c, idx) => {
      c.priorityOrder = idx + 1;
    });
    saveCarePlan({
      ...activeCarePlan,
      candidates: updated
    });
  };

  // Add manual diagnosis from 3S Catalog
  const handleAddManualFromCatalog = (catItem: (typeof ALL_CATALOG_3S)[0]) => {
    if (!activeCarePlan) return;
    let pes = '';
    if (catItem.type === 'aktual') {
      pes = `${catItem.name} (${catItem.code}) b.d. ${catItem.causes[0] || 'Kondisi klinis'} d.d. ${catItem.majorSubjective.concat(catItem.majorObjective).slice(0, 2).join(', ') || 'tanda dan gejala klinis'}`;
    } else if (catItem.type === 'risiko') {
      pes = `${catItem.name} (${catItem.code}) dibuktikan dengan ${catItem.causes[0] || 'faktor risiko terkait'}`;
    } else {
      pes = `${catItem.name} (${catItem.code}) dibuktikan dengan komitmen peningkatan kesehatan`;
    }

    const newCandidate: DiagnosticCandidate = {
      id: `cand_manual_${Date.now()}`,
      sdkCode: catItem.code,
      problem: catItem.name,
      category: catItem.category,
      etiology: catItem.causes[0] || 'Kondisi klinis',
      type: catItem.type,
      matchConfidence: 'Tinggi',
      matchScore: 100,
      matchReasons: ['Dipilih secara manual oleh operator perawat dari katalog resmi SDKI PPNI'],
      suggestedPes: pes,
      dataFocusSubjective: catItem.majorSubjective.length > 0 ? catItem.majorSubjective : ['Data fokus subjektif sesuai buku SDKI'],
      dataFocusObjective: catItem.majorObjective.length > 0 ? catItem.majorObjective : ['Data fokus objektif sesuai buku SDKI'],
      selected: true,
      priorityOrder: candidates.length + 1
    };

    saveCarePlan({
      ...activeCarePlan,
      candidates: [...candidates, newCandidate]
    });
    setShowCatalogModal(false);
  };

  // Apply selected candidates to active care plan diagnoses
  const handleApplyToCarePlan = () => {
    if (!activeCarePlan) return;
    const selected = candidates.filter(c => c.selected);
    if (selected.length === 0) {
      alert('Pilih minimal satu diagnosa kandidat yang bercentang untuk diterapkan ke rencana asuhan.');
      return;
    }

    const existingDxMap = new Map((activeCarePlan.diagnoses || []).map(d => [d.sdkCode, d]));

    const mappedDiagnoses: NursingDiagnosisCarePlan[] = selected.map((cand, idx) => {
      const existing = existingDxMap.get(cand.sdkCode);
      if (existing) {
        return {
          ...existing,
          priority: idx + 1,
          etiology: cand.etiology,
          pesStatement: cand.suggestedPes,
          dataFocus: {
            subjective: cand.dataFocusSubjective,
            objective: cand.dataFocusObjective
          }
        };
      }

      // Find catalog 3S info
      const cat = ALL_CATALOG_3S.find(item => item.code === cand.sdkCode);

      const interventions: SikiIntervention[] = cat
        ? [
            {
              code: cat.sikiIntervention.code,
              label: cat.sikiIntervention.label,
              type: cat.sikiIntervention.type,
              actions: [
                ...cat.sikiIntervention.observasi.map((desc, i) => ({
                  id: `act_${cand.sdkCode}_obs_${i}`,
                  category: 'Observasi' as const,
                  description: desc,
                  isSelected: true
                })),
                ...cat.sikiIntervention.terapeutik.map((desc, i) => ({
                  id: `act_${cand.sdkCode}_ter_${i}`,
                  category: 'Terapeutik' as const,
                  description: desc,
                  isSelected: true
                })),
                ...cat.sikiIntervention.edukasi.map((desc, i) => ({
                  id: `act_${cand.sdkCode}_edu_${i}`,
                  category: 'Edukasi' as const,
                  description: desc,
                  isSelected: true
                })),
                ...cat.sikiIntervention.kolaborasi.map((desc, i) => ({
                  id: `act_${cand.sdkCode}_kol_${i}`,
                  category: 'Kolaborasi' as const,
                  description: desc,
                  isSelected: true
                }))
              ]
            }
          ]
        : [];

      return {
        id: `dx_${cand.sdkCode}_${Date.now()}`,
        priority: idx + 1,
        sdkCode: cand.sdkCode,
        problem: cand.problem,
        type: cand.type,
        etiology: cand.etiology,
        signsSymptoms: cand.dataFocusObjective.join('; '),
        pesStatement: cand.suggestedPes,
        dataFocus: {
          subjective: cand.dataFocusSubjective,
          objective: cand.dataFocusObjective
        },
        outcome: {
          code: cat?.slkiOutcome.code || 'L.00000',
          label: cat?.slkiOutcome.label || 'Tujuan Luaran Keperawatan',
          expectation: cat?.slkiOutcome.expectation || 'Membaik',
          timeframeHours: 72,
          indicators: (cat?.slkiOutcome.indicators || ['Kondisi klinis membaik']).map((name, i) => ({
            id: `ind_${cand.sdkCode}_${i}`,
            name,
            targetScale: 4,
            currentScale: 2
          }))
        },
        interventions
      };
    });

    saveCarePlan({
      ...activeCarePlan,
      diagnoses: mappedDiagnoses
    });

    setActiveStage(3); // Jump to Stage 3: Diagnosis
  };

  const selectedCount = candidates.filter(c => c.selected).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-5xl mx-auto space-y-6">
      {/* Header & Trigger Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-600" />
            <span>Rule Engine Analisa Data Otomatis & Penegakan SDKI</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Memindai temuan subjektif (DS) dan objektif (DO) dari 13 domain Doenges, TTV, nyeri PQRST, dan hasil laboratorium untuk merumuskan kandidat masalah.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleRunRuleEngine}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-300 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Memindai Data Pengkajian...' : 'Buat Analisa Data Otomatis'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCatalogModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Candidates List / Interactive Table */}
      <div className="space-y-4 text-xs">
        {candidates.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Cpu className="w-10 h-10 text-teal-500 mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-slate-700 text-sm">Belum Ada Analisa Data</h4>
            <p className="text-slate-500 text-xs max-w-md mx-auto mt-1 mb-4">
              Klik tombol "Buat Analisa Data Otomatis" di atas untuk memindai pengkajian pasien {activePatient.initials}, atau tambah diagnosa manual dari katalog.
            </p>
            <button
              onClick={handleRunRuleEngine}
              className="bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
            >
              Jalankan Analisa Data Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800">
                Ditemukan {candidates.length} Kandidat Masalah SDKI ({selectedCount} Dipilih):
              </span>
              <p className="text-[11px] text-slate-500">
                Gunakan centang untuk memilih diagnosa yang akan diambil, dan panah ↑/↓ untuk menentukan prioritas.
              </p>
            </div>

            {candidates.map((cand, index) => (
              <div
                key={cand.id}
                className={`rounded-2xl border p-4 transition-all text-xs space-y-3 ${
                  cand.selected
                    ? 'border-teal-500 bg-white shadow-sm ring-1 ring-teal-500/30'
                    : 'border-slate-200 bg-slate-50/70 opacity-70'
                }`}
              >
                {/* Header Row: Checkbox, Problem, Priority Order, Match Confidence */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleCandidate(cand.id)}
                      className="text-slate-400 hover:text-teal-600"
                    >
                      {cand.selected ? (
                        <CheckSquare className="w-5 h-5 text-teal-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {cand.sdkCode}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{cand.problem}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                            cand.type === 'aktual'
                              ? 'bg-rose-100 text-rose-800'
                              : cand.type === 'risiko'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {cand.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Kategori: {cand.category} • Prioritas Ke: <strong>{index + 1}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        cand.matchConfidence === 'Tinggi'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : cand.matchConfidence === 'Sedang'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      Kecocokan {cand.matchConfidence} ({cand.matchScore}%)
                    </span>

                    {/* Reorder Buttons */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveCandidate(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-500 hover:text-teal-600 disabled:opacity-30"
                        title="Naikkan Prioritas"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCandidate(index, 'down')}
                        disabled={index === candidates.length - 1}
                        className="p-1 text-slate-500 hover:text-teal-600 disabled:opacity-30"
                        title="Turunkan Prioritas"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCandidate(cand.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Hapus Usulan Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Match Reasons / Triggers */}
                {cand.matchReasons.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-start gap-2 text-[11px]">
                    <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-700">Faktor Pemicu / Alasan Diusulkan: </strong>
                      <span className="text-slate-600">{cand.matchReasons.join('; ')}</span>
                    </div>
                  </div>
                )}

                {/* Formatted Tabel Analisa Data: Data Fokus | Etiologi | Problem */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                    <label className="block font-bold text-slate-700 mb-1">Data Fokus (DS & DO):</label>
                    <div className="space-y-1 text-[11px]">
                      <div>
                        <strong className="text-teal-800">DS:</strong>
                        <ul className="list-disc pl-4 text-slate-700">
                          {cand.dataFocusSubjective.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-1">
                        <strong className="text-slate-800">DO:</strong>
                        <ul className="list-disc pl-4 text-slate-700">
                          {cand.dataFocusObjective.map((o, i) => (
                            <li key={i}>{o}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Etiologi / Faktor Penyebab:
                    </label>
                    <textarea
                      value={cand.etiology}
                      onChange={e => handleUpdateCandidate(cand.id, { etiology: e.target.value })}
                      rows={4}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      placeholder="Penyebab atau faktor risiko..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Formulasi PES Otomatis (Dapat Diedit):
                    </label>
                    <textarea
                      value={cand.suggestedPes}
                      onChange={e => handleUpdateCandidate(cand.id, { suggestedPes: e.target.value })}
                      rows={4}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium text-slate-900 bg-white"
                      placeholder="[Problem] b.d. [Etiologi] d.d. [Tanda]..."
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Navigation CTA */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
              <div>
                <h4 className="font-bold text-teal-900 text-sm">
                  Terapkan {selectedCount} Diagnosis Terpilih ke Rencana Asuhan?
                </h4>
                <p className="text-xs text-teal-700 mt-0.5">
                  Diagnosis terpilih akan otomatis dibuatkan tabel luaran SLKI (indikator skor 1–5) dan intervensi SIKI terstruktur (Observasi, Terapeutik, Edukasi, Kolaborasi).
                </p>
              </div>

              <button
                type="button"
                onClick={handleApplyToCarePlan}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all whitespace-nowrap flex items-center gap-2"
              >
                <span>Terapkan ke Rencana 3S</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add Manual Diagnosis from Catalog */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h4 className="font-bold text-slate-900 text-sm">Pilih Diagnosis Manual dari Katalog SDKI</h4>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchCatalogTerm}
                onChange={e => setSearchCatalogTerm(e.target.value)}
                placeholder="Cari kode (D.xxxx) atau nama diagnosa..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {ALL_CATALOG_3S.filter(
                c =>
                  c.name.toLowerCase().includes(searchCatalogTerm.toLowerCase()) ||
                  c.code.toLowerCase().includes(searchCatalogTerm.toLowerCase()) ||
                  c.subCategory.toLowerCase().includes(searchCatalogTerm.toLowerCase())
              ).map(item => (
                <div
                  key={item.code}
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-700">{item.code}</span>
                      <strong className="text-slate-900">{item.name}</strong>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {item.definition}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddManualFromCatalog(item)}
                    className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
                  >
                    + Pilih
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
