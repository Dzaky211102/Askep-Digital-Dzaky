/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePatients } from '../../context/PatientContext';
import { PhysicalExamHeadToToe } from '../../types/askep';
import { UserCheck, Sparkles, Check, Activity, Shield } from 'lucide-react';

export const NORMAL_PHYSICAL_EXAM: PhysicalExamHeadToToe = {
  head: 'Bentuk mesocephal, kulit kepala bersih, tidak ada hematoma atau lesi benjolan.',
  eyes: 'Konjungtiva tidak anemis, sklera tidak ikterik, pupil isokor 3mm/3mm refleks cahaya (+/+).',
  ears: 'Bentuk simetris, kanalis telinga bersih, serumen minimal, tidak ada perdarahan/cairan, fungsi pendengaran baik.',
  nose: 'Simetris, tidak ada deviasi septum, tidak ada polip, sekret (-), pernapasan cuping hidung (-).',
  mouth: 'Mukosa bibir lembap dan kemerahan, tidak sianosis, gigi utuh dan bersih, uvula di tengah, faring tidak hiperemis.',
  neck: 'JVP normal (5-2 cmH2O), trakea di tengah, tidak teraba pembesaran kelenjar tiroid atau getah bening.',
  thoraxLungs: {
    inspection: 'Bentuk normochest, gerakan dinding dada simetris saat inspirasi dan ekspirasi, tidak ada retraksi interkostal.',
    palpation: 'Vocal fremitus teraba seimbang di seluruh lapang paru kanan dan kiri.',
    percussion: 'Sonor di seluruh lapang paru.',
    auscultation: 'Suara napas vesikuler di kedua paru, tidak terdengar ronkhi atau wheezing.'
  },
  thoraxHeart: {
    inspection: 'Iktus kordis tidak terlihat.',
    palpation: 'Iktus kordis teraba di ICS V linea midklavikularis sinistra, thrill (-).',
    percussion: 'Batas jantung dalam batas normal (tidak ada kardiomegali).',
    auscultation: 'Bunyi jantung I dan II tunggal reguler, tidak ada gallop atau murmur.'
  },
  abdomen: {
    inspection: 'Bentuk dinding perut datar, simetris, tidak ada luka bekas operasi atau distensi.',
    auscultation: 'Bising usus normal (10-12 kali/menit).',
    palpation: 'Supel, tidak ada nyeri tekan, hepar dan lien tidak teraba membesar.',
    percussion: 'Timpani di seluruh kuadran abdomen.'
  },
  inguinalGenitalia: 'Kebersihan baik, tidak ada pembesaran kelenjar limfe inguinal, tidak ada lesi atau perdarahan.',
  extremities: {
    upperRightStrength: 5,
    upperLeftStrength: 5,
    lowerRightStrength: 5,
    lowerLeftStrength: 5,
    edema: 'Tidak ada edema perifer (non-edema)',
    turgor: 'Elastis, CRT < 2 detik',
    deformityNotes: 'Ekstremitas utuh, rentang gerak (ROM) bebas, tidak ada deformitas tulang.'
  }
};

export const PhysicalExamForm: React.FC = () => {
  const { activePatient, savePatient } = usePatients();

  if (!activePatient) return null;

  const pex = activePatient.physicalExam;

  const handleUpdate = (updates: Partial<PhysicalExamHeadToToe>) => {
    savePatient({
      ...activePatient,
      physicalExam: {
        ...pex,
        ...updates
      }
    });
  };

  const handleFillAllNormal = () => {
    if (confirm('Isi seluruh pemeriksaan fisik dengan template normal? Anda dapat mengubah bagian yang ditemukan abnormal setelahnya.')) {
      handleUpdate(NORMAL_PHYSICAL_EXAM);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <span>Pemeriksaan Fisik Head to Toe & Kekuatan Otot</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            IPPA (Inspeksi, Palpasi, Perkusi, Auskultasi) pada Thorax & Abdomen serta tabel skala kekuatan otot (0–5).
          </p>
        </div>

        <button
          type="button"
          onClick={handleFillAllNormal}
          className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-300 px-3.5 py-2 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Isi Normal Semua (Template)</span>
        </button>
      </div>

      <div className="space-y-6 text-xs">
        {/* 1. KEKUATAN OTOT 4 EKSTREMITAS (0-5) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Tabel Kekuatan Otot 4 Ekstremitas (Skala 0 – 5)</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              [ 5 5 / 5 5 ] = Normal
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Ekstremitas Atas Kanan
              </label>
              <select
                value={pex.extremities.upperRightStrength}
                onChange={e =>
                  handleUpdate({
                    extremities: {
                      ...pex.extremities,
                      upperRightStrength: Number(e.target.value)
                    }
                  })
                }
                className="w-full text-center font-bold text-base bg-teal-50 border border-teal-300 text-teal-900 rounded-lg py-1"
              >
                {[5, 4, 3, 2, 1, 0].map(s => (
                  <option key={s} value={s}>
                    Skala {s} {s === 5 ? '(Normal)' : s === 0 ? '(Paralisis)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Ekstremitas Atas Kiri
              </label>
              <select
                value={pex.extremities.upperLeftStrength}
                onChange={e =>
                  handleUpdate({
                    extremities: {
                      ...pex.extremities,
                      upperLeftStrength: Number(e.target.value)
                    }
                  })
                }
                className="w-full text-center font-bold text-base bg-teal-50 border border-teal-300 text-teal-900 rounded-lg py-1"
              >
                {[5, 4, 3, 2, 1, 0].map(s => (
                  <option key={s} value={s}>
                    Skala {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Ekstremitas Bawah Kanan
              </label>
              <select
                value={pex.extremities.lowerRightStrength}
                onChange={e =>
                  handleUpdate({
                    extremities: {
                      ...pex.extremities,
                      lowerRightStrength: Number(e.target.value)
                    }
                  })
                }
                className="w-full text-center font-bold text-base bg-teal-50 border border-teal-300 text-teal-900 rounded-lg py-1"
              >
                {[5, 4, 3, 2, 1, 0].map(s => (
                  <option key={s} value={s}>
                    Skala {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Ekstremitas Bawah Kiri
              </label>
              <select
                value={pex.extremities.lowerLeftStrength}
                onChange={e =>
                  handleUpdate({
                    extremities: {
                      ...pex.extremities,
                      lowerLeftStrength: Number(e.target.value)
                    }
                  })
                }
                className={`w-full text-center font-bold text-base rounded-lg py-1 border ${
                  pex.extremities.lowerLeftStrength < 5
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-teal-50 border-teal-300 text-teal-900'
                }`}
              >
                {[5, 4, 3, 2, 1, 0].map(s => (
                  <option key={s} value={s}>
                    Skala {s} {s <= 2 ? '(Terbatas/Fraktur)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Edema & Turgor Kulit
              </label>
              <input
                type="text"
                value={pex.extremities.edema}
                onChange={e =>
                  handleUpdate({
                    extremities: { ...pex.extremities, edema: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                placeholder="e.g. Edema lokal non-pitting ankle sinistra (+)"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan Deformitas / Gips / Balutan / Luka
              </label>
              <input
                type="text"
                value={pex.extremities.deformityNotes}
                onChange={e =>
                  handleUpdate({
                    extremities: { ...pex.extremities, deformityNotes: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                placeholder="e.g. Terpasang bidai spalk ankle sinistra, CRT 3 detik..."
              />
            </div>
          </div>
        </div>

        {/* 2. AREA KEPALA HINGGA LEHER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">1. Kepala & Rambut</label>
            <textarea
              value={pex.head}
              onChange={e => handleUpdate({ head: e.target.value })}
              rows={2}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">2. Mata</label>
            <textarea
              value={pex.eyes}
              onChange={e => handleUpdate({ eyes: e.target.value })}
              rows={2}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">3. Telinga</label>
            <textarea
              value={pex.ears}
              onChange={e => handleUpdate({ ears: e.target.value })}
              rows={2}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">4. Hidung</label>
            <textarea
              value={pex.nose}
              onChange={e => handleUpdate({ nose: e.target.value })}
              rows={2}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">5. Mulut & Gigi</label>
            <textarea
              value={pex.mouth}
              onChange={e => handleUpdate({ mouth: e.target.value })}
              rows={2}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">6. Leher (JVP & Tiroid)</label>
            <textarea
              value={pex.neck}
              onChange={e => handleUpdate({ neck: e.target.value })}
              rows={2}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        {/* 3. THORAX PARU & JANTUNG (IPPA) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide">
            <span>Pemeriksaan Thorax: Paru & Jantung (Format IPPA)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Paru */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <h5 className="font-bold text-teal-800 text-xs border-b border-slate-100 pb-1">
                Thorax Paru (Pulmo)
              </h5>
              <div>
                <span className="font-semibold text-slate-600 block text-[11px]">Inspeksi (I):</span>
                <input
                  type="text"
                  value={pex.thoraxLungs.inspection}
                  onChange={e =>
                    handleUpdate({
                      thoraxLungs: { ...pex.thoraxLungs, inspection: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-600 block text-[11px]">Palpasi (P):</span>
                <input
                  type="text"
                  value={pex.thoraxLungs.palpation}
                  onChange={e =>
                    handleUpdate({
                      thoraxLungs: { ...pex.thoraxLungs, palpation: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-600 block text-[11px]">Perkusi (P):</span>
                <input
                  type="text"
                  value={pex.thoraxLungs.percussion}
                  onChange={e =>
                    handleUpdate({
                      thoraxLungs: { ...pex.thoraxLungs, percussion: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-600 block text-[11px]">Auskultasi (A):</span>
                <input
                  type="text"
                  value={pex.thoraxLungs.auscultation}
                  onChange={e =>
                    handleUpdate({
                      thoraxLungs: { ...pex.thoraxLungs, auscultation: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Jantung */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <h5 className="font-bold text-rose-800 text-xs border-b border-slate-100 pb-1">
                Thorax Jantung (Cor)
              </h5>
              <div>
                <span className="font-semibold text-slate-600 block text-[11px]">Inspeksi (I):</span>
                <input
                  type="text"
                  value={pex.thoraxHeart.inspection}
                  onChange={e =>
                    handleUpdate({
                      thoraxHeart: { ...pex.thoraxHeart, inspection: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-600 block text-[11px]">Palpasi (P):</span>
                <input
                  type="text"
                  value={pex.thoraxHeart.palpation}
                  onChange={e =>
                    handleUpdate({
                      thoraxHeart: { ...pex.thoraxHeart, palpation: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-600 block text-[11px]">Perkusi (P):</span>
                <input
                  type="text"
                  value={pex.thoraxHeart.percussion}
                  onChange={e =>
                    handleUpdate({
                      thoraxHeart: { ...pex.thoraxHeart, percussion: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-600 block text-[11px]">Auskultasi (A):</span>
                <input
                  type="text"
                  value={pex.thoraxHeart.auscultation}
                  onChange={e =>
                    handleUpdate({
                      thoraxHeart: { ...pex.thoraxHeart, auscultation: e.target.value }
                    })
                  }
                  className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. ABDOMEN & GENITALIA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h5 className="font-bold text-slate-800 text-xs">Pemeriksaan Abdomen</h5>
            <div>
              <span className="text-[11px] font-medium text-slate-600">Inspeksi:</span>
              <input
                type="text"
                value={pex.abdomen.inspection}
                onChange={e =>
                  handleUpdate({ abdomen: { ...pex.abdomen, inspection: e.target.value } })
                }
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-600">Auskultasi (Bising Usus):</span>
              <input
                type="text"
                value={pex.abdomen.auscultation}
                onChange={e =>
                  handleUpdate({ abdomen: { ...pex.abdomen, auscultation: e.target.value } })
                }
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-600">Palpasi:</span>
              <input
                type="text"
                value={pex.abdomen.palpation}
                onChange={e =>
                  handleUpdate({ abdomen: { ...pex.abdomen, palpation: e.target.value } })
                }
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-600">Perkusi:</span>
              <input
                type="text"
                value={pex.abdomen.percussion}
                onChange={e =>
                  handleUpdate({ abdomen: { ...pex.abdomen, percussion: e.target.value } })
                }
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800 text-xs mb-2">Inguinal & Genitalia</h5>
            <textarea
              value={pex.inguinalGenitalia}
              onChange={e => handleUpdate({ inguinalGenitalia: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
              placeholder="e.g. Kebersihan baik, tidak ada lesi..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
