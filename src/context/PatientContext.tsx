/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Patient,
  CarePlan,
  PatientCover,
  PatientIdentity,
  PatientHistory,
  DomainAssessment,
  PhysicalExamHeadToToe,
  DiagnosticData
} from '../types/askep';
import { SEED_PATIENT, SEED_CAREPLAN } from '../data/seedData';
import { exportPatientsToExcel } from '../services/excelExport';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { formatWitaDateInput, formatWitaDateTimeInput, formatWitaClock } from '../utils/witaTime';

export type AskepStage = 1 | 2 | 3 | 4 | 5 | 6;

// Unique Device ID per browser session for multi-device sync & conflict detection
export const CURRENT_DEVICE_ID = (() => {
  if (typeof window === 'undefined') return 'server';
  let id = sessionStorage.getItem('askep_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem('askep_device_id', id);
  }
  return id;
})();

interface PatientContextType {
  patients: Patient[];
  carePlans: Record<string, CarePlan>;
  activePatient: Patient | null;
  activeCarePlan: CarePlan | null;
  activeStage: AskepStage;
  currentFormStep: number;
  syncStatus: 'saved' | 'saving' | 'offline';
  lastSyncTime: string;
  lastSyncError: string | null;
  selectedPatientIds: string[];
  searchTerm: string;
  statusFilter: 'semua' | 'aktif' | 'pulang';
  roomFilter: string;
  remoteUpdateToast: string | null;
  pendingMigrationCount: number;

  // Actions
  setActivePatientId: (id: string | null) => void;
  setActiveStage: (stage: AskepStage) => void;
  setCurrentFormStep: (step: number) => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: 'semua' | 'aktif' | 'pulang') => void;
  setRoomFilter: (room: string) => void;
  toggleSelectPatient: (id: string) => void;
  selectAllPatients: () => void;
  deselectAllPatients: () => void;
  dismissRemoteUpdateToast: () => void;

  // Data Mutation & Cloud Sync
  savePatient: (patient: Patient) => Promise<void>;
  saveCarePlan: (carePlan: CarePlan) => Promise<void>;
  flushPendingSaves: () => Promise<void>;
  refreshFromCloud: () => Promise<void>;
  createNewPatient: () => Patient;
  deletePatient: (patientId: string) => Promise<void>;
  resetToSeedData: () => void;
  exportSelectedToExcel: () => void;

  // Old data migration
  importOldLocalData: () => Promise<void>;
  dismissMigration: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [carePlans, setCarePlans] = useState<Record<string, CarePlan>>({});
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [activeStage, setActiveStageInternal] = useState<AskepStage>(1);
  const [currentFormStep, setCurrentFormStepInternal] = useState<number>(1);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const [lastSyncTime, setLastSyncTime] = useState<string>(formatWitaClock());
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'aktif' | 'pulang'>('semua');
  const [roomFilter, setRoomFilter] = useState<string>('semua');

  // Conflict Toast & Old Data Migration
  const [remoteUpdateToast, setRemoteUpdateToast] = useState<string | null>(null);
  const [pendingMigrationCount, setPendingMigrationCount] = useState<number>(0);

  // Debounce & Flush Refs
  const saveDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const pendingPatientSave = useRef<Patient | null>(null);
  const pendingCarePlanSave = useRef<CarePlan | null>(null);

  // Check for old local storage data when user logs in
  useEffect(() => {
    if (!currentUser) {
      setPatients([]);
      setCarePlans({});
      setActivePatientId(null);
      return;
    }

    const migrationKey = `askep_migrated_${currentUser.id}`;
    const alreadyMigrated = localStorage.getItem(migrationKey);

    if (!alreadyMigrated) {
      const localStr = localStorage.getItem('askep_patients_db');
      if (localStr) {
        try {
          const localPatients: Patient[] = JSON.parse(localStr);
          const unmigrated = localPatients.filter(
            p => !p.ownerId || p.ownerId !== currentUser.id || p.ownerId === 'nurse_default_uid'
          );
          if (unmigrated.length > 0) {
            setPendingMigrationCount(unmigrated.length);
          }
        } catch {
          // ignore
        }
      }
    }
  }, [currentUser?.id]);

  // Flush pending debounced writes immediately to Firestore
  const flushPendingSaves = useCallback(async () => {
    if (saveDebounceTimeout.current) {
      clearTimeout(saveDebounceTimeout.current);
      saveDebounceTimeout.current = null;
    }

    if (!currentUser) return;

    if (pendingPatientSave.current) {
      const p = pendingPatientSave.current;
      pendingPatientSave.current = null;
      try {
        await setDoc(doc(db, 'patients', p.id), p, { merge: true });
        setSyncStatus('saved');
        setLastSyncTime(formatWitaClock());
        setLastSyncError(null);
      } catch (err: any) {
        console.error('Flush patient save error:', err);
        setSyncStatus('offline');
        setLastSyncError(err?.message || 'Gagal menyimpan pasien ke cloud');
      }
    }

    if (pendingCarePlanSave.current) {
      const cp = pendingCarePlanSave.current;
      pendingCarePlanSave.current = null;
      try {
        await setDoc(doc(db, 'carePlans', cp.id), cp, { merge: true });
        setSyncStatus('saved');
        setLastSyncTime(formatWitaClock());
        setLastSyncError(null);
      } catch (err: any) {
        console.error('Flush carePlan save error:', err);
        setSyncStatus('offline');
        setLastSyncError(err?.message || 'Gagal menyimpan rencana asuhan');
      }
    }
  }, [currentUser]);

  // Flush on tab close or navigation away
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushPendingSaves();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushPendingSaves();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flushPendingSaves]);

  // Wrap navigation step changes with auto-flush
  const setActiveStage = (stage: AskepStage) => {
    flushPendingSaves();
    setActiveStageInternal(stage);
  };

  const setCurrentFormStep = (step: number) => {
    flushPendingSaves();
    setCurrentFormStepInternal(step);
  };

  // -------------------------------------------------------------
  // Real-Time Listeners (onSnapshot) for Patients & CarePlans
  // -------------------------------------------------------------
  useEffect(() => {
    if (!currentUser) {
      setPatients([]);
      setCarePlans({});
      return;
    }

    setSyncStatus('saving');
    let isInitialLoad = true;

    // 1. Subscribe to Patients collection
    const qPatients = query(
      collection(db, 'patients'),
      where('ownerId', '==', currentUser.id)
    );

    const unsubPatients = onSnapshot(
      qPatients,
      snapshot => {
        const cloudPatients: Patient[] = [];
        let remoteUpdateDetected = false;
        let remoteActor = '';

        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Patient;
          // Filter out soft-deleted patients
          if (data.deleted === true) return;

          cloudPatients.push(data);

          // Detect if changed from another device
          if (!snapshot.metadata.hasPendingWrites && data.deviceId && data.deviceId !== CURRENT_DEVICE_ID) {
            if (!isInitialLoad) {
              remoteUpdateDetected = true;
              remoteActor = data.updatedBy || 'perangkat lain';
            }
          }
        });

        if (cloudPatients.length > 0) {
          // Sort by updatedAt descending
          cloudPatients.sort((a, b) => {
            const timeA = new Date(a.updatedAt || 0).getTime();
            const timeB = new Date(b.updatedAt || 0).getTime();
            return timeB - timeA;
          });

          setPatients(cloudPatients);
          setActivePatientId(prev => {
            if (prev && cloudPatients.some(p => p.id === prev)) return prev;
            return cloudPatients[0].id;
          });
        } else if (isInitialLoad) {
          // New account with 0 cloud patients: seed Tn. J
          const initialPatient: Patient = {
            ...SEED_PATIENT,
            ownerId: currentUser.id,
            cover: {
              ...SEED_PATIENT.cover,
              studentName: currentUser.displayName,
              studentNim: currentUser.nim || ''
            },
            deviceId: CURRENT_DEVICE_ID,
            updatedBy: currentUser.displayName,
            updatedAt: new Date().toISOString()
          };

          const initialCarePlan: CarePlan = {
            ...SEED_CAREPLAN,
            ownerId: currentUser.id,
            deviceId: CURRENT_DEVICE_ID,
            updatedBy: currentUser.displayName,
            updatedAt: new Date().toISOString()
          };

          setDoc(doc(db, 'patients', initialPatient.id), initialPatient);
          setDoc(doc(db, 'carePlans', initialCarePlan.id), initialCarePlan);
          setPatients([initialPatient]);
          setActivePatientId(initialPatient.id);
        }

        if (remoteUpdateDetected) {
          setRemoteUpdateToast(`Data diperbarui dari perangkat lain (${remoteActor})`);
          setTimeout(() => setRemoteUpdateToast(null), 5000);
        }

        setSyncStatus('saved');
        setLastSyncTime(formatWitaClock());
        setLastSyncError(null);
        isInitialLoad = false;
      },
      error => {
        console.error('Firestore Patients onSnapshot error:', error);
        setSyncStatus('offline');
        setLastSyncError('Koneksi terputus — data disimpan secara offline.');
      }
    );

    // 2. Subscribe to CarePlans collection
    const qCarePlans = query(
      collection(db, 'carePlans'),
      where('ownerId', '==', currentUser.id)
    );

    const unsubCarePlans = onSnapshot(
      qCarePlans,
      snapshot => {
        const cloudCarePlans: Record<string, CarePlan> = {};
        snapshot.forEach(docSnap => {
          const cp = docSnap.data() as CarePlan;
          if (cp.deleted !== true) {
            cloudCarePlans[cp.patientId] = cp;
          }
        });

        if (Object.keys(cloudCarePlans).length > 0) {
          setCarePlans(cloudCarePlans);
        }
      },
      error => {
        console.error('Firestore CarePlans onSnapshot error:', error);
      }
    );

    return () => {
      unsubPatients();
      unsubCarePlans();
    };
  }, [currentUser?.id]);

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0] || null;
  const activeCarePlan = activePatient ? carePlans[activePatient.id] || null : null;

  // -------------------------------------------------------------
  // Data Mutation: Save Patient (Granular Merge + Metadata)
  // -------------------------------------------------------------
  const savePatient = async (updatedPatient: Patient) => {
    if (!currentUser) return;

    setSyncStatus('saving');

    const patientWithMetadata: Patient = {
      ...updatedPatient,
      ownerId: currentUser.id,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.displayName || currentUser.nim,
      deviceId: CURRENT_DEVICE_ID
    };

    // Immediate optimistic update in React state
    setPatients(prev => {
      const idx = prev.findIndex(p => p.id === patientWithMetadata.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = patientWithMetadata;
        return updated;
      }
      return [patientWithMetadata, ...prev];
    });

    // Store in pending ref for flush
    pendingPatientSave.current = patientWithMetadata;

    if (saveDebounceTimeout.current) clearTimeout(saveDebounceTimeout.current);

    saveDebounceTimeout.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'patients', patientWithMetadata.id), patientWithMetadata, { merge: true });
        pendingPatientSave.current = null;
        setSyncStatus('saved');
        setLastSyncTime(formatWitaClock());
        setLastSyncError(null);
      } catch (err: any) {
        console.error('savePatient error:', err);
        setSyncStatus('offline');
        setLastSyncError(err?.message || 'Gagal menyimpan pasien ke cloud.');
      }
    }, 350);
  };

  // -------------------------------------------------------------
  // Data Mutation: Save CarePlan (Granular Merge + Metadata)
  // -------------------------------------------------------------
  const saveCarePlan = async (updatedCarePlan: CarePlan) => {
    if (!currentUser) return;

    setSyncStatus('saving');

    const carePlanWithMetadata: CarePlan = {
      ...updatedCarePlan,
      ownerId: currentUser.id,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.displayName || currentUser.nim,
      deviceId: CURRENT_DEVICE_ID
    };

    setCarePlans(prev => ({
      ...prev,
      [carePlanWithMetadata.patientId]: carePlanWithMetadata
    }));

    pendingCarePlanSave.current = carePlanWithMetadata;

    if (saveDebounceTimeout.current) clearTimeout(saveDebounceTimeout.current);

    saveDebounceTimeout.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'carePlans', carePlanWithMetadata.id), carePlanWithMetadata, { merge: true });
        pendingCarePlanSave.current = null;
        setSyncStatus('saved');
        setLastSyncTime(formatWitaClock());
        setLastSyncError(null);
      } catch (err: any) {
        console.error('saveCarePlan error:', err);
        setSyncStatus('offline');
        setLastSyncError(err?.message || 'Gagal menyimpan care plan ke cloud.');
      }
    }, 350);
  };

  // Force reload / refresh from Cloud
  const refreshFromCloud = async () => {
    if (!currentUser) return;
    setSyncStatus('saving');
    try {
      const q = query(collection(db, 'patients'), where('ownerId', '==', currentUser.id));
      const snap = await getDocs(q);
      const list: Patient[] = [];
      snap.forEach(d => {
        const item = d.data() as Patient;
        if (item.deleted !== true) list.push(item);
      });
      list.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      setPatients(list);
      setSyncStatus('saved');
      setLastSyncTime(formatWitaClock());
      setLastSyncError(null);
    } catch (err: any) {
      setSyncStatus('offline');
      setLastSyncError('Gagal memuat ulang dari cloud: ' + err.message);
    }
  };

  // Create new patient
  const createNewPatient = (): Patient => {
    const id = `pt_${Date.now()}`;
    const today = formatWitaDateInput(new Date());
    const nowWita = formatWitaDateTimeInput(new Date());

    const studentName = currentUser?.displayName || 'Ners Mahasiswa';
    const studentNim = currentUser?.nim || '';

    const newPatient: Patient = {
      id,
      ownerId: currentUser?.id || 'unassigned',
      initials: 'Ny. S',
      mrn: `RM-${Math.floor(1000 + Math.random() * 9000)}`,
      room: 'Ruang Teratai',
      medicalDiagnosis: 'Post Operasi Laparatomi Ileus Obstruktif',
      status: 'aktif',
      admissionDate: today,
      assessmentDate: nowWita,
      cover: {
        title: 'Asuhan Keperawatan pada Ny. S dengan Masalah Post Operasi Laparatomi di Ruang Teratai RSUD Abdul Wahab Sjahranie',
        stase: 'Keperawatan Medikal Bedah (KMB)',
        studentName,
        studentNim,
        studyProgram: 'Profesi Ners',
        faculty: 'Fakultas Ilmu Keperawatan',
        university: currentUser?.institution || 'Universitas Muhammadiyah Kalimantan Timur',
        academicYear: '2026/2027',
        room: 'Ruang Teratai',
        hospital: 'RSUD Abdul Wahab Sjahranie'
      },
      identity: {
        initials: 'Ny. S',
        mrn: `RM-${Math.floor(1000 + Math.random() * 9000)}`,
        age: 42,
        gender: 'P',
        address: 'Jl. Pemuda No. 12, Samarinda',
        maritalStatus: 'Menikah',
        religion: 'Islam',
        education: 'D3 / Sarjana',
        occupation: 'Pegawai Swasta',
        ethnicity: 'Jawa / Indonesia',
        admissionDate: today,
        assessmentDate: nowWita,
        medicalDiagnosis: 'Post Operasi Laparatomi Ileus Obstruktif',
        assessmentMethods: {
          autoanamnesa: true,
          alloanamnesa: true,
          pemeriksaanFisik: true,
          statusKlien: true
        }
      },
      history: {
        chiefComplaintAdmission: 'Nyeri perut hebat melilit dan kembung tidak bisa BAB/flatus.',
        chiefComplaintAssessment: 'Nyeri pada luka bekas sayatan operasi perut skala 5/10, bertambah saat batuk atau bergerak.',
        presentIllnessHistory: 'Pasien datang dengan distensi abdomen dan mual muntah sejak 2 hari SMRS. Dilakukan laparatomi eksplorasi adhesiolisis.',
        pastMedicalHistory: 'Riwayat apendisitis 5 tahun lalu.',
        familyMedicalHistory: 'Tidak ada riwayat penyakit keluarga yang bermakna.',
        genogram: {
          nodes: [
            { id: 'gn1', generation: 1, gender: 'L', isPatient: false, isDeceased: true, isCoHabitant: false, label: 'Kakek', relation: 'Kakek' },
            { id: 'gn2', generation: 1, gender: 'P', isPatient: false, isDeceased: true, isCoHabitant: false, label: 'Nenek', relation: 'Nenek' },
            { id: 'gn3', generation: 2, gender: 'L', isPatient: false, isDeceased: false, isCoHabitant: false, label: 'Ayah', relation: 'Ayah', age: 68 },
            { id: 'gn4', generation: 2, gender: 'P', isPatient: false, isDeceased: false, isCoHabitant: false, label: 'Ibu', relation: 'Ibu', age: 65 },
            { id: 'gn5', generation: 3, gender: 'P', isPatient: true, isDeceased: false, isCoHabitant: true, label: 'Ny. S (Pasien)', relation: 'Pasien', age: 42 },
            { id: 'gn6', generation: 3, gender: 'L', isPatient: false, isDeceased: false, isCoHabitant: true, label: 'Suami', relation: 'Suami', age: 45 }
          ],
          notes: 'Genogram 3 generasi. Tinggal bersama suami.'
        }
      },
      domains: {
        vitalSigns: {
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
          heartRate: 84,
          respiratoryRate: 18,
          temperature: 37.0,
          spO2: 99,
          gcsEye: 4,
          gcsVerbal: 5,
          gcsMotor: 6,
          gcsTotal: 15,
          weightKg: 58,
          heightCm: 158,
          bmi: 23.2,
          consciousness: 'Compos Mentis'
        },
        morseFallScale: {
          historyOfFalling: 0,
          secondaryDiagnosis: 15,
          ambulatoryAid: 0,
          ivTherapy: 20,
          gaitTransferring: 10,
          mentalStatus: 0,
          totalScore: 45,
          riskCategory: 'Risiko Sedang (25-50)'
        },
        painAssessment: {
          palliativeProvocative: 'Luka jahitan operasi abdomen, nyeri bertambah saat batuk/bergerak, berkurang jika tirah baring posisi semi Fowler',
          quality: 'Perih seperti tersayat dan berdenyut kencang',
          regionRadiating: 'Abdomen kuadran bawah meluas ke sekitar umbilikus, tidak menjalar',
          severityScale: 5,
          timingDuration: 'Hilang timbul, menetap 10-15 menit setiap perubahan posisi'
        },
        neurosensori: {
          findings: ['GCS 15 (E4V5M6)', 'Refleks fisiologis patella (+/+)'],
          subjective: 'Pasien tidak mengeluh pusing atau pandangan kabur.',
          objective: 'Kesadaran compos mentis, pupil isokor 3mm/3mm, refleks cahaya (+/+).'
        },
        sirkulasi: {
          findings: ['Nadi reguler 84 x/mnt', 'CRT < 2 detik', 'Akral hangat'],
          subjective: 'Pasien tidak mengeluhkan dada berdebar-debar atau keringat dingin.',
          objective: 'Akral hangat kering merah, CRT < 2 detik, konjungtiva merah muda tidak anemis, pulsasi perifer kuat.'
        },
        pernapasan: {
          findings: ['Vesikuler (+/+)', 'Ronkhi (-/-)', 'RR 18 x/mnt'],
          subjective: 'Pasien tidak merasa sesak, namun agak menahan napas dalam karena luka operasi terasa tertarik.',
          objective: 'Dada simetris, suara napas vesikuler normal, ronkhi/wheezing (-), RR 18 x/mnt, SpO2 99% room air.'
        },
        nyeriKetidaknyamanan: {
          findings: ['Nyeri insisi operasi', 'Skala nyeri 5/10', 'Tampak meringis saat miring'],
          subjective: 'Pasien mengeluh nyeri pada area luka operasi perut skala 5/10, bertambah saat batuk atau miring.',
          objective: 'Wajah tampak meringis saat bergerak, bersikap protektif memegangi perut, terpasang perban kassa bersih.'
        },
        makananCairan: {
          findings: ['Puasa pasca operasi (NPO)', 'Bising usus (+, 6x/m)', 'Infus RL 20 tpm'],
          subjective: 'Pasien mengatakan masih haus dan bibir agak kering karena anjuran puasa bertahap.',
          objective: 'Turgor kulit baik < 2 detik, mukosa bibir lembap sedang, bising usus terdengar pelan 6x/mnt, infus RL terpasang di metacarpal kiri lancar.',
          fluidIntakeMl: 1500,
          fluidOutputMl: 1350,
          fluidBalanceMl: 150
        },
        eliminasi: {
          findings: ['Kateter urine terpasang (Urin 1000 cc)', 'Belum BAB pasca operasi'],
          subjective: 'Pasien merasa ingin buang angin tetapi belum bisa flatus.',
          objective: 'Terpasang folley catheter no 16, urine bag terisi 1000 ml kuning jernih, distensi kandung kemih (-).'
        },
        seksualitas: {
          findings: ['Tidak ada keluhan reproduksi'],
          subjective: 'Tidak ada keluhan organ reproduksi.',
          objective: 'Kebersihan genetalia baik, terpasang kateter urine.'
        },
        aktivitasIstirahat: {
          findings: ['Tirah baring (bedrest)', 'Mobilisasi miring kanan-kiri bertahap', 'ADL dibantu'],
          subjective: 'Pasien menyatakan belum berani duduk karena takut jahitan lepas.',
          objective: 'Pasien tirah baring posisi semi fowler, rentang gerak aktif pada ekstremitas superior, ADL dibantu perawat/keluarga.'
        },
        hygiene: {
          findings: ['Seka di tempat tidur', 'Kuku dan kulit bersih'],
          subjective: 'Keluarga mengatakan pasien telah diseka pagi hari.',
          objective: 'Kulit bersih, rambut rapi, bau badan (-), kuku pendek.'
        },
        integritasEgo: {
          findings: ['Kooperatif', 'Sedikit cemas proses pemulihan'],
          subjective: 'Pasien bertanya kapan bisa makan nasi dan pulang ke rumah.',
          objective: 'Kontak mata baik, respon verbal adekuat, tampak antusias mendengarkan penjelasan perawat.'
        },
        interaksiSosial: {
          findings: ['Didampingi suami', 'Dukungan keluarga baik'],
          subjective: 'Pasien merasa nyaman karena suami selalu mendampingi.',
          objective: 'Suami aktif membantu kebutuhan pasien dan ramah berinteraksi dengan perawat.'
        },
        penyuluhanPembelajaran: {
          findings: ['Perlu edukasi mobilisasi dini dan nutrisi'],
          subjective: 'Keluarga menanyakan makanan yang baik untuk mempercepat jahitan kering.',
          objective: 'Pasien dan keluarga memperhatikan saat diedukasi tentang latihan napas dalam dan batuk efektif.'
        },
        patientSafety: {
          findings: ['Side rail terpasang', 'Gelang risiko jatuh kuning (+)', 'Skor Morse 45'],
          subjective: 'Pasien memahami fungsi pagar pengaman tempat tidur.',
          objective: 'Side rail terpasang pada kedua sisi ranjang, rem roda ranjang terkunci aman, bel perawat di jangkauan tangan.'
        }
      },
      physicalExam: {
        head: 'Mesocephalic simetris, tidak ada hematoma',
        eyes: 'Konjungtiva ananemis, sklera anikterik, refleks pupil (+/+)',
        ears: 'Simetris, bersih, serumen (-), pendengaran adekuat',
        nose: 'Pernapasan cuping hidung (-), deviasi septum (-)',
        mouth: 'Mukosa lembap, karies (-)',
        neck: 'Deviasi trakea (-), JVP normal',
        thoraxLungs: {
          inspection: 'Simetris saat inspirasi/ekspirasi, retraksi dada (-)',
          palpation: 'Vocal fremitus simetris kanan dan kiri',
          percussion: 'Sonor pada seluruh lapang paru',
          auscultation: 'Suara vesikuler pada kedua paru, ronkhi (-), wheezing (-)'
        },
        thoraxHeart: {
          inspection: 'Iktus kordis tidak terlihat',
          palpation: 'Iktus kordis teraba di ICS V linea midklavikularis sinistra',
          percussion: 'Batas jantung normal',
          auscultation: 'Bunyi jantung I dan II murni reguler, gallop (-), murmur (-)'
        },
        abdomen: {
          inspection: 'Bentuk cembung sedang, luka insisi vertikal tertutup perban steril',
          auscultation: 'Bising usus 6 x/menit',
          palpation: 'Nyeri tekan di sekitar luka operasi',
          percussion: 'Timpani pada seluruh kuadran abdomen'
        },
        inguinalGenitalia: 'Terpasang folley catheter no 16, urine jernih',
        extremities: {
          upperRightStrength: 5,
          upperLeftStrength: 5,
          lowerRightStrength: 5,
          lowerLeftStrength: 5,
          edema: 'Edema (-/-) pada keempat ekstremitas',
          turgor: '< 2 detik',
          deformityNotes: 'Tidak ada fraktur atau deformitas tulang, infus terpasang di metacarpal kiri'
        }
      },
      diagnostics: {
        laboratories: [
          { id: 'lab1', date: today, testName: 'Hemoglobin (Hb)', result: '12.4', normalRange: '12.0 - 16.0 g/dL', unit: 'g/dL', flag: 'normal' },
          { id: 'lab2', date: today, testName: 'Leukosit', result: '11200', normalRange: '4.000 - 10.000 /uL', unit: '/uL', flag: 'high' },
          { id: 'lab3', date: today, testName: 'Trombosit', result: '245000', normalRange: '150.000 - 450.000 /uL', unit: '/uL', flag: 'normal' },
          { id: 'lab4', date: today, testName: 'Hematokrit', result: '38', normalRange: '37 - 47 %', unit: '%', flag: 'normal' },
          { id: 'lab5', date: today, testName: 'Gula Darah Sewaktu (GDS)', result: '115', normalRange: '< 140 mg/dL', unit: 'mg/dL', flag: 'normal' },
          { id: 'lab6', date: today, testName: 'Ureum', result: '24', normalRange: '15 - 40 mg/dL', unit: 'mg/dL', flag: 'normal' },
          { id: 'lab7', date: today, testName: 'Kreatinin', result: '0.8', normalRange: '0.6 - 1.1 mg/dL', unit: 'mg/dL', flag: 'normal' }
        ],
        radiologies: [
          { id: 'rad1', examinationType: 'Foto Polos Abdomen 3 Posisi', date: today, impression: 'Pre-op: Gambaran air-fluid level dan distensi usus halus (ileus obstruktif).' }
        ]
      },
      therapies: [
        { id: 'th1', medicationName: 'Ceftriaxone', dose: '1 gram', route: 'IV', frequency: 'Tiap 12 jam', indication: 'Profilaksis antibiotik pasca bedah', startDate: today },
        { id: 'th2', medicationName: 'Ketorolac', dose: '30 mg', route: 'IV', frequency: 'Tiap 8 jam', indication: 'Analgetik sedang-berat pasca operasi', startDate: today },
        { id: 'th3', medicationName: 'Ranitidine', dose: '50 mg', route: 'IV', frequency: 'Tiap 12 jam', indication: 'Gastroprotektor anti-sekresi asam lambung', startDate: today },
        { id: 'th4', medicationName: 'Ringer Lactate (RL)', dose: '500 ml', route: 'IV', frequency: '20 tpm (tetes/menit)', indication: 'Pemeliharaan cairan dan elektrolit rumatan', startDate: today }
      ],
      createdAt: nowWita,
      updatedAt: nowWita,
      deviceId: CURRENT_DEVICE_ID,
      updatedBy: studentName
    };

    const newCarePlan: CarePlan = {
      id: `cp_${id}`,
      patientId: id,
      ownerId: currentUser?.id || 'unassigned',
      candidates: [],
      diagnoses: [],
      implementations: [],
      evaluations: [],
      createdAt: nowWita,
      updatedAt: nowWita,
      deviceId: CURRENT_DEVICE_ID,
      updatedBy: studentName
    };

    savePatient(newPatient);
    saveCarePlan(newCarePlan);
    setActivePatientId(id);
    setActiveStage(1);
    setCurrentFormStep(1);

    return newPatient;
  };

  // Soft delete patient so other devices immediately sync and remove it
  const deletePatient = async (patientId: string) => {
    // Optimistic local update
    const updated = patients.filter(p => p.id !== patientId);
    setPatients(updated);

    const updatedCarePlans = { ...carePlans };
    delete updatedCarePlans[patientId];
    setCarePlans(updatedCarePlans);

    if (activePatientId === patientId) {
      setActivePatientId(updated.length > 0 ? updated[0].id : null);
    }

    if (currentUser) {
      try {
        // Soft delete on Firestore with deleted flag
        await setDoc(
          doc(db, 'patients', patientId),
          {
            deleted: true,
            deletedAt: new Date().toISOString(),
            updatedBy: currentUser.displayName || currentUser.nim,
            deviceId: CURRENT_DEVICE_ID
          },
          { merge: true }
        );

        await setDoc(
          doc(db, 'carePlans', `cp_${patientId}`),
          {
            deleted: true,
            deletedAt: new Date().toISOString(),
            updatedBy: currentUser.displayName || currentUser.nim,
            deviceId: CURRENT_DEVICE_ID
          },
          { merge: true }
        );

        setSyncStatus('saved');
        setLastSyncTime(formatWitaClock());
      } catch (err: any) {
        console.error('deletePatient error:', err);
        handleFirestoreError(err, OperationType.DELETE, `patients/${patientId}`);
      }
    }
  };

  // Reset to default clinical seed case
  const resetToSeedData = () => {
    if (!currentUser) return;
    const seedWithUser: Patient = {
      ...SEED_PATIENT,
      ownerId: currentUser.id,
      cover: {
        ...SEED_PATIENT.cover,
        studentName: currentUser.displayName,
        studentNim: currentUser.nim || ''
      },
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.displayName,
      deviceId: CURRENT_DEVICE_ID
    };

    const seedCpWithUser: CarePlan = {
      ...SEED_CAREPLAN,
      ownerId: currentUser.id,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.displayName,
      deviceId: CURRENT_DEVICE_ID
    };

    savePatient(seedWithUser);
    saveCarePlan(seedCpWithUser);
    setActivePatientId(seedWithUser.id);
    setActiveStage(1);
    setCurrentFormStep(1);
  };

  // Migrate old local data into current cloud account
  const importOldLocalData = async () => {
    if (!currentUser) return;
    const localStr = localStorage.getItem('askep_patients_db');
    if (!localStr) return;

    try {
      const localPatients: Patient[] = JSON.parse(localStr);
      for (const p of localPatients) {
        // Don't overwrite if existing in current patients
        if (!patients.some(existing => existing.id === p.id)) {
          const migratedPatient: Patient = {
            ...p,
            ownerId: currentUser.id,
            updatedBy: currentUser.displayName || currentUser.nim,
            deviceId: CURRENT_DEVICE_ID,
            updatedAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'patients', migratedPatient.id), migratedPatient, { merge: true });
        }
      }

      localStorage.setItem(`askep_migrated_${currentUser.id}`, 'true');
      setPendingMigrationCount(0);
      await refreshFromCloud();
    } catch (err) {
      console.error('Migration error:', err);
      throw err;
    }
  };

  const dismissMigration = () => {
    if (currentUser) {
      localStorage.setItem(`askep_migrated_${currentUser.id}`, 'true');
    }
    setPendingMigrationCount(0);
  };

  const toggleSelectPatient = (id: string) => {
    setSelectedPatientIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllPatients = () => {
    setSelectedPatientIds(patients.map(p => p.id));
  };

  const deselectAllPatients = () => {
    setSelectedPatientIds([]);
  };

  const dismissRemoteUpdateToast = () => {
    setRemoteUpdateToast(null);
  };

  const exportSelectedToExcel = () => {
    const targets =
      selectedPatientIds.length > 0
        ? patients.filter(p => selectedPatientIds.includes(p.id))
        : activePatient
        ? [activePatient]
        : patients;
    exportPatientsToExcel(targets, carePlans);
  };

  return (
    <PatientContext.Provider
      value={{
        patients,
        carePlans,
        activePatient,
        activeCarePlan,
        activeStage,
        currentFormStep,
        syncStatus,
        lastSyncTime,
        lastSyncError,
        selectedPatientIds,
        searchTerm,
        statusFilter,
        roomFilter,
        remoteUpdateToast,
        pendingMigrationCount,
        setActivePatientId,
        setActiveStage,
        setCurrentFormStep,
        setSearchTerm,
        setStatusFilter,
        setRoomFilter,
        toggleSelectPatient,
        selectAllPatients,
        deselectAllPatients,
        dismissRemoteUpdateToast,
        savePatient,
        saveCarePlan,
        flushPendingSaves,
        refreshFromCloud,
        createNewPatient,
        deletePatient,
        resetToSeedData,
        exportSelectedToExcel,
        importOldLocalData,
        dismissMigration
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) throw new Error('usePatients must be used within a PatientProvider');
  return context;
};
