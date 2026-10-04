/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Patient, CarePlan, PatientCover, PatientIdentity, PatientHistory, DomainAssessment, PhysicalExamHeadToToe, DiagnosticData } from '../types/askep';
import { SEED_PATIENT, SEED_CAREPLAN } from '../data/seedData';
import { exportPatientsToExcel } from '../services/excelExport';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, query, where, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { formatWitaDateInput, formatWitaDateTimeInput } from '../utils/witaTime';

export type AskepStage = 1 | 2 | 3 | 4 | 5 | 6; 
// 1: Pengkajian (7 Sub-langkah: Sampul, Identitas, Riwayat, 13 Domain, Fisik, Penunjang, Terapi)
// 2: Analisa Data
// 3: Diagnosis SDKI
// 4: Intervensi SLKI-SIKI
// 5: Implementasi Keperawatan
// 6: Evaluasi SOAP

interface PatientContextType {
  patients: Patient[];
  carePlans: Record<string, CarePlan>;
  activePatient: Patient | null;
  activeCarePlan: CarePlan | null;
  activeStage: AskepStage;
  currentFormStep: number;
  syncStatus: 'saved' | 'saving' | 'offline';
  selectedPatientIds: string[];
  searchTerm: string;
  statusFilter: 'semua' | 'aktif' | 'pulang';
  roomFilter: string;
  
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
  
  // Data Mutation
  savePatient: (patient: Patient) => Promise<void>;
  saveCarePlan: (carePlan: CarePlan) => Promise<void>;
  createNewPatient: () => Patient;
  deletePatient: (patientId: string) => Promise<void>;
  resetToSeedData: () => void;
  exportSelectedToExcel: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isGuest } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [carePlans, setCarePlans] = useState<Record<string, CarePlan>>({});
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<AskepStage>(1);
  const [currentFormStep, setCurrentFormStep] = useState<number>(1);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'aktif' | 'pulang'>('semua');
  const [roomFilter, setRoomFilter] = useState<string>('semua');

  const saveDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize from LocalStorage or Seed Data
  useEffect(() => {
    const localPatientsStr = localStorage.getItem('askep_patients_db');
    const localCarePlansStr = localStorage.getItem('askep_careplans_db');

    if (localPatientsStr && localCarePlansStr) {
      try {
        const parsedPatients: Patient[] = JSON.parse(localPatientsStr);
        const parsedCarePlans: Record<string, CarePlan> = JSON.parse(localCarePlansStr);
        setPatients(parsedPatients);
        setCarePlans(parsedCarePlans);
        if (parsedPatients.length > 0 && !activePatientId) {
          setActivePatientId(parsedPatients[0].id);
        }
      } catch (e) {
        setPatients([SEED_PATIENT]);
        setCarePlans({ [SEED_PATIENT.id]: SEED_CAREPLAN });
        setActivePatientId(SEED_PATIENT.id);
      }
    } else {
      // First boot: initialize with the rich clinical seed case "Tn. J"
      setPatients([SEED_PATIENT]);
      setCarePlans({ [SEED_PATIENT.id]: SEED_CAREPLAN });
      setActivePatientId(SEED_PATIENT.id);
      localStorage.setItem('askep_patients_db', JSON.stringify([SEED_PATIENT]));
      localStorage.setItem('askep_careplans_db', JSON.stringify({ [SEED_PATIENT.id]: SEED_CAREPLAN }));
    }
  }, []);

  // Listen to Firestore if authenticated and not in guest mode
  useEffect(() => {
    if (!currentUser || isGuest) return;

    try {
      const qPatients = query(collection(db, 'patients'), where('ownerId', '==', currentUser.id));
      const unsubPatients = onSnapshot(
        qPatients,
        snapshot => {
          const cloudPatients: Patient[] = [];
          snapshot.forEach(docSnap => {
            cloudPatients.push(docSnap.data() as Patient);
          });
          if (cloudPatients.length > 0) {
            setPatients(cloudPatients);
            localStorage.setItem('askep_patients_db', JSON.stringify(cloudPatients));
          }
          setSyncStatus('saved');
        },
        error => {
          handleFirestoreError(error, OperationType.LIST, 'patients');
          setSyncStatus('offline');
        }
      );

      const qCarePlans = query(collection(db, 'carePlans'), where('ownerId', '==', currentUser.id));
      const unsubCarePlans = onSnapshot(
        qCarePlans,
        snapshot => {
          const cloudCarePlans: Record<string, CarePlan> = {};
          snapshot.forEach(docSnap => {
            const cp = docSnap.data() as CarePlan;
            cloudCarePlans[cp.patientId] = cp;
          });
          if (Object.keys(cloudCarePlans).length > 0) {
            setCarePlans(prev => ({ ...prev, ...cloudCarePlans }));
            localStorage.setItem('askep_careplans_db', JSON.stringify({ ...carePlans, ...cloudCarePlans }));
          }
          setSyncStatus('saved');
        },
        error => {
          handleFirestoreError(error, OperationType.LIST, 'carePlans');
          setSyncStatus('offline');
        }
      );

      return () => {
        unsubPatients();
        unsubCarePlans();
      };
    } catch (err) {
      console.warn('Real-time listener setup error:', err);
      setSyncStatus('offline');
    }
  }, [currentUser?.id, isGuest]);

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0] || null;
  const activeCarePlan = activePatient ? carePlans[activePatient.id] || null : null;

  // Save patient with local cache + debounced cloud sync
  const savePatient = async (updatedPatient: Patient) => {
    setSyncStatus('saving');
    
    // Update local state immediately
    const newPatients = patients.some(p => p.id === updatedPatient.id)
      ? patients.map(p => (p.id === updatedPatient.id ? updatedPatient : p))
      : [updatedPatient, ...patients];

    setPatients(newPatients);
    localStorage.setItem('askep_patients_db', JSON.stringify(newPatients));

    if (saveDebounceTimeout.current) clearTimeout(saveDebounceTimeout.current);

    saveDebounceTimeout.current = setTimeout(async () => {
      if (currentUser && !isGuest) {
        try {
          await setDoc(doc(db, 'patients', updatedPatient.id), updatedPatient);
          setSyncStatus('saved');
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `patients/${updatedPatient.id}`);
          setSyncStatus('offline');
        }
      } else {
        setSyncStatus('saved');
      }
    }, 600);
  };

  // Save care plan with local cache + debounced cloud sync
  const saveCarePlan = async (updatedCarePlan: CarePlan) => {
    setSyncStatus('saving');

    const newCarePlans = {
      ...carePlans,
      [updatedCarePlan.patientId]: updatedCarePlan
    };

    setCarePlans(newCarePlans);
    localStorage.setItem('askep_careplans_db', JSON.stringify(newCarePlans));

    if (saveDebounceTimeout.current) clearTimeout(saveDebounceTimeout.current);

    saveDebounceTimeout.current = setTimeout(async () => {
      if (currentUser && !isGuest) {
        try {
          await setDoc(doc(db, 'carePlans', updatedCarePlan.id), updatedCarePlan);
          setSyncStatus('saved');
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `carePlans/${updatedCarePlan.id}`);
          setSyncStatus('offline');
        }
      } else {
        setSyncStatus('saved');
      }
    }, 600);
  };

  const createNewPatient = (): Patient => {
    const id = `pt_${Date.now()}`;
    const today = formatWitaDateInput(new Date());
    const nowWita = formatWitaDateTimeInput(new Date());

    const newPatient: Patient = {
      id,
      ownerId: currentUser?.id || 'guest_nurse',
      initials: 'Ny. S',
      mrn: `RM-${Math.floor(1000 + Math.random() * 9000)}`,
      room: 'Ruang Teratai Bed 01',
      medicalDiagnosis: 'Post Operasi Laparatomi Ileus Obstruktif',
      status: 'aktif',
      admissionDate: today,
      assessmentDate: nowWita,
      cover: {
        title: 'Asuhan Keperawatan pada Ny. S dengan Masalah Post Operasi Laparatomi di Ruang Teratai RSUD Abdul Wahab Sjahranie',
        stase: 'Keperawatan Medikal Bedah (KMB)',
        studentName: currentUser?.displayName || 'Ners Mahasiswa',
        studentNim: currentUser?.nim || '2411102411163',
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
          palliativeProvocative: 'Nyeri bertambah saat batuk atau mengubah posisi tubuh miring.',
          quality: 'Perih dan seperti disayat pada luka operasi.',
          regionRadiating: 'Abdomen bagian tengah (garis vertikal midline), tidak menjalar.',
          severityScale: 5,
          timingDuration: 'Hilang timbul, menetap saat bergerak.'
        },
        neurosensori: {
          findings: ['Compos Mentis', 'GCS 15'],
          subjective: 'Pasien sadar penuh dan dapat menjawab pertanyaan dengan jelas.',
          objective: 'Kesadaran Compos Mentis, orientasi baik.'
        },
        sirkulasi: {
          findings: ['Akral hangat', 'CRT < 2 detik', 'Nadi kuat teratur'],
          subjective: 'Tidak ada keluhan berdebar-debar.',
          objective: 'TD 120/80 mmHg, Nadi 84 x/mnt.'
        },
        pernapasan: {
          findings: ['Vesikuler', 'Tidak ada retraksi'],
          subjective: 'Bernapas terasa agak tertahan karena takut luka perut sakit.',
          objective: 'RR 18 x/mnt, SpO2 99%.'
        },
        nyeriKetidaknyamanan: {
          findings: ['Nyeri post operasi skala 5/10', 'Meringis saat batuk'],
          subjective: 'Pasien mengeluh nyeri luka operasi perut skala 5/10.',
          objective: 'Tampak memegangi area perut saat batuk.'
        },
        makananCairan: {
          findings: ['Puasa bertahap hingga bising usus positif', 'Infus KaEN 3B 20 tpm'],
          subjective: 'Pasien menyatakan haus dan bibir agak kering.',
          objective: 'Mukosa agak kering, bising usus 4x/mnt, intake 1500 ml, output urin 1400 ml.',
          fluidIntakeMl: 1500,
          fluidOutputMl: 1400,
          fluidBalanceMl: 100
        },
        eliminasi: {
          findings: ['Terpasang foley catheter', 'Urin kuning jernih'],
          subjective: 'Tidak ada rasa nyeri pada kandung kemih.',
          objective: 'Urine bag terisi 1400 ml/24 jam, terpasang drainase luka.'
        },
        seksualitas: {
          findings: ['Tidak ada keluhan'],
          subjective: 'Tidak ada keluhan.',
          objective: 'Normal.'
        },
        aktivitasIstirahat: {
          findings: ['Bedrest pasca bedah hari ke-1', 'Mobilisasi miring kanan-kiri bertahap'],
          subjective: 'Takut bergerak karena luka operasi.',
          objective: 'Kekuatan otot 5/5 di keempat ekstremitas, gerakan hati-hati.'
        },
        hygiene: {
          findings: ['Diseka di tempat tidur'],
          subjective: 'Mandi diseka dibantu perawat.',
          objective: 'Kebersihan cukup baik.'
        },
        integritasEgo: {
          findings: ['Tenang, menerima kondisi'],
          subjective: 'Berharap luka cepat kering dan lekas pulang.',
          objective: 'Kooperatif.'
        },
        interaksiSosial: {
          findings: ['Didampingi suami'],
          subjective: 'Senang keluarga mendampingi.',
          objective: 'Komunikasi baik.'
        },
        penyuluhanPembelajaran: {
          findings: ['Edukasi mobilisasi dini pasca laparatomi'],
          subjective: 'Menanyakan kapan boleh minum dan makan bubur.',
          objective: 'Mendengarkan edukasi perawatan.'
        },
        patientSafety: {
          findings: ['Side rail terpasang', 'Morse 45 Risiko Sedang'],
          subjective: 'Meminta bantuan perawat jika ingin ganti posisi.',
          objective: 'Side rails terpasang, gelang kuning terpasang.'
        }
      },
      physicalExam: {
        head: 'Normocephal, tidak ada lesi.',
        eyes: 'Konjungtiva tidak anemis, sklera tidak ikterik.',
        ears: 'Bersih, pendengaran normal.',
        nose: 'Bersih, tidak ada deviasi.',
        mouth: 'Mukosa agak kering, tidak ada stomatitis.',
        neck: 'JVP normal, tidak ada pembesaran KGB.',
        thoraxLungs: {
          inspection: 'Simetris, pergerakan dinding dada teratur.',
          palpation: 'Fremitus raba seimbang kanan kiri.',
          percussion: 'Sonor seluruh lapang paru.',
          auscultation: 'Vesikuler, ronki (-), wheezing (-).'
        },
        thoraxHeart: {
          inspection: 'Iktus kordis tidak tampak.',
          palpation: 'Iktus kordis teraba di ICS V midclavicula sinistra.',
          percussion: 'Batas jantung dalam batas normal.',
          auscultation: 'BJ I dan II murni, murmur (-).'
        },
        abdomen: {
          inspection: 'Tampak luka insisi operasi laparatomi vertikal di linea mediana sepanjang 12 cm, tertutup kassa steril rapi, tidak tampak rembesan darah.',
          auscultation: 'Bising usus 4-5 x/menit (hipoaktif post op).',
          palpation: 'Nyeri tekan pada sekitar luka operasi (+), tidak ada massa abnormal.',
          percussion: 'Timpani menurun.'
        },
        inguinalGenitalia: 'Terpasang folley kateter, tidak ada perdarahan.',
        extremities: {
          upperRightStrength: 5,
          upperLeftStrength: 5,
          lowerRightStrength: 5,
          lowerLeftStrength: 5,
          edema: 'Tidak ada edema perifer',
          turgor: 'Elastis',
          deformityNotes: 'Ekstremitas utuh, tidak ada deformitas tulang.'
        }
      },
      diagnostics: {
        laboratories: [
          { id: `lab_${Date.now()}_1`, date: today, testName: 'Hemoglobin (Hb)', result: '12.5', numericResult: 12.5, unit: 'g/dL', normalRange: '12.0 - 16.0', normalMin: 12, normalMax: 16, flag: 'normal' },
          { id: `lab_${Date.now()}_2`, date: today, testName: 'Leukosit', result: '9800', numericResult: 9800, unit: '/uL', normalRange: '4.000 - 10.000', normalMin: 4000, normalMax: 10000, flag: 'normal' },
          { id: `lab_${Date.now()}_3`, date: today, testName: 'Glukosa Darah Sewaktu (GDS)', result: '112', numericResult: 112, unit: 'mg/dL', normalRange: '70 - 140', normalMin: 70, normalMax: 140, flag: 'normal' }
        ],
        radiologies: [
          { id: `rad_${Date.now()}`, date: today, examinationType: 'Foto Polos Abdomen 3 Posisi Pre-Op', impression: 'Tampak dilatasi loop usus halus dengan multiple air-fluid level pendek (step-ladder appearance), sesuai gambaran ileus obstruktif letak tinggi.' }
        ]
      },
      therapies: [
        { id: `th_${Date.now()}_1`, medicationName: 'Ketorolac 30mg', dose: '30 mg', route: 'IV', frequency: 'Tiap 8 jam', indication: 'Analgetik pasca laparatomi', startDate: today },
        { id: `th_${Date.now()}_2`, medicationName: 'Ceftriaxone 1g', dose: '1 gram', route: 'IV', frequency: 'Tiap 12 jam', indication: 'Antibiotik profilaksis infeksi luka operasi', startDate: today },
        { id: `th_${Date.now()}_3`, medicationName: 'Infus KaEN 3B', dose: '500 mL / 20 tpm', route: 'IV', frequency: 'Kontinu', indication: 'Rehidrasi dan rumatan elektrolit', startDate: today }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newCarePlan: CarePlan = {
      id: `cp_${id}`,
      patientId: id,
      ownerId: currentUser?.id || 'guest_nurse',
      candidates: [],
      diagnoses: [],
      implementations: [],
      evaluations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    savePatient(newPatient);
    saveCarePlan(newCarePlan);
    setActivePatientId(id);
    setActiveStage(1);
    setCurrentFormStep(1);

    return newPatient;
  };

  const deletePatient = async (patientId: string) => {
    const updated = patients.filter(p => p.id !== patientId);
    setPatients(updated);
    localStorage.setItem('askep_patients_db', JSON.stringify(updated));

    const updatedCarePlans = { ...carePlans };
    delete updatedCarePlans[patientId];
    setCarePlans(updatedCarePlans);
    localStorage.setItem('askep_careplans_db', JSON.stringify(updatedCarePlans));

    if (activePatientId === patientId) {
      setActivePatientId(updated.length > 0 ? updated[0].id : null);
    }

    if (currentUser && !isGuest) {
      try {
        await deleteDoc(doc(db, 'patients', patientId));
        await deleteDoc(doc(db, 'carePlans', `cp_${patientId}`));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `patients/${patientId}`);
      }
    }
  };

  const resetToSeedData = () => {
    setPatients([SEED_PATIENT]);
    setCarePlans({ [SEED_PATIENT.id]: SEED_CAREPLAN });
    setActivePatientId(SEED_PATIENT.id);
    localStorage.setItem('askep_patients_db', JSON.stringify([SEED_PATIENT]));
    localStorage.setItem('askep_careplans_db', JSON.stringify({ [SEED_PATIENT.id]: SEED_CAREPLAN }));
    setActiveStage(1);
    setCurrentFormStep(1);
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

  const exportSelectedToExcel = () => {
    const targets = selectedPatientIds.length > 0
      ? patients.filter(p => selectedPatientIds.includes(p.id))
      : activePatient ? [activePatient] : patients;
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
        selectedPatientIds,
        searchTerm,
        statusFilter,
        roomFilter,
        setActivePatientId,
        setActiveStage,
        setCurrentFormStep,
        setSearchTerm,
        setStatusFilter,
        setRoomFilter,
        toggleSelectPatient,
        selectAllPatients,
        deselectAllPatients,
        savePatient,
        saveCarePlan,
        createNewPatient,
        deletePatient,
        resetToSeedData,
        exportSelectedToExcel
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
