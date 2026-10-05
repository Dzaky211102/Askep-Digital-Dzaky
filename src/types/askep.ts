/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Gender = 'L' | 'P';
export type PatientStatus = 'aktif' | 'pulang';
export type ShiftType = 'pagi' | 'sore' | 'malam';

export interface PatientCover {
  title: string;
  stase: string;
  studentName: string;
  studentNim: string;
  studyProgram: string;
  faculty: string;
  university: string;
  academicYear: string;
  room: string;
  hospital: string;
}

export interface PatientIdentity {
  initials: string;
  mrn: string; // No. RM
  age: number | string;
  gender: Gender;
  address: string;
  maritalStatus: string;
  religion: string;
  education: string;
  occupation: string;
  ethnicity: string;
  admissionDate: string; // YYYY-MM-DD
  assessmentDate: string; // YYYY-MM-DDTHH:mm
  medicalDiagnosis: string;
  assessmentMethods: {
    autoanamnesa: boolean;
    alloanamnesa: boolean;
    pemeriksaanFisik: boolean;
    statusKlien: boolean;
  };
}

export interface GenogramNode {
  id: string;
  generation: 1 | 2 | 3; // 1: Kakek/Nenek, 2: Orang Tua, 3: Pasien/Saudara
  gender: 'L' | 'P';
  isPatient: boolean;
  isDeceased: boolean;
  isCoHabitant: boolean; // Tinggal serumah
  label: string;
  relation: string;
  age?: number | string;
}

export interface GenogramData {
  nodes: GenogramNode[];
  notes: string;
}

export interface PatientHistory {
  chiefComplaintAdmission: string; // saat masuk RS
  chiefComplaintAssessment: string; // saat dikaji
  presentIllnessHistory: string; // RPS (PQRST)
  pastMedicalHistory: string; // RPD
  familyMedicalHistory: string; // RPK
  genogram: GenogramData;
}

export interface VitalSigns {
  bloodPressureSystolic: number | string;
  bloodPressureDiastolic: number | string;
  heartRate: number | string; // Nadi bpm
  respiratoryRate: number | string; // RR x/mnt
  temperature: number | string; // Suhu C (mendukung titik/koma)
  spO2: number | string; // %
  gcsEye: number; // 1-4
  gcsVerbal: number; // 1-5
  gcsMotor: number; // 1-6
  gcsTotal: number; // 3-15
  weightKg: number | string;
  heightCm: number | string;
  bmi: number | string;
  consciousness: 'Compos Mentis' | 'Apatis' | 'Somnolen' | 'Sopor' | 'Coma';
}

export interface MorseFallScale {
  historyOfFalling: number; // 0 or 25
  secondaryDiagnosis: number; // 0 or 15
  ambulatoryAid: number; // 0, 15, or 30
  ivTherapy: number; // 0 or 20
  gaitTransferring: number; // 0, 10, or 20
  mentalStatus: number; // 0 or 15
  totalScore: number;
  riskCategory: 'Risiko Rendah (0-24)' | 'Risiko Sedang (25-50)' | 'Risiko Tinggi (≥51)';
}

export interface PQRSTPain {
  palliativeProvocative: string; // P
  quality: string; // Q
  regionRadiating: string; // R
  severityScale: number; // 0 - 10 S
  timingDuration: string; // T
}

export interface DomainAssessment {
  vitalSigns: VitalSigns;
  morseFallScale: MorseFallScale;
  painAssessment: PQRSTPain;
  
  // 13 Domains (DS = Subjektif, DO = Objektif)
  neurosensori: {
    findings: string[];
    subjective: string;
    objective: string;
  };
  sirkulasi: {
    findings: string[];
    subjective: string;
    objective: string;
  };
  pernapasan: {
    findings: string[];
    subjective: string;
    objective: string;
  };
  nyeriKetidaknyamanan: {
    findings: string[];
    subjective: string;
    objective: string;
  };
  makananCairan: {
    findings: string[];
    subjective: string;
    objective: string;
    fluidIntakeMl: number | string;
    fluidOutputMl: number | string;
    fluidBalanceMl: number | string;
  };
  eliminasi: {
    findings: string[];
    subjective: string;
    objective: string;
  };
  seksualitas: {
    findings: string[];
    subjective: string;
    objective: string;
  };
  aktivitasIstirahat: {
    findings: string[];
    subjective: string;
    objective: string;
  };
  hygiene: {
    findings: string[];
    subjective: string;
    objective: string;
  };
  integritasEgo: {
    findings: string[];
    subjective: string;
    objective: string;
  };
  interaksiSosial: {
    findings: string[];
    subjective: string;
    objective: string;
  };
  penyuluhanPembelajaran: {
    findings: string[];
    subjective: string;
    objective: string;
  };
  patientSafety: {
    findings: string[];
    subjective: string;
    objective: string;
  };
}

export interface PhysicalExamHeadToToe {
  head: string;
  eyes: string;
  ears: string;
  nose: string;
  mouth: string;
  neck: string;
  thoraxLungs: {
    inspection: string;
    palpation: string;
    percussion: string;
    auscultation: string;
  };
  thoraxHeart: {
    inspection: string;
    palpation: string;
    percussion: string;
    auscultation: string;
  };
  abdomen: {
    inspection: string;
    auscultation: string;
    palpation: string;
    percussion: string;
  };
  inguinalGenitalia: string;
  extremities: {
    upperRightStrength: number; // 0-5
    upperLeftStrength: number;
    lowerRightStrength: number;
    lowerLeftStrength: number;
    edema: string;
    turgor: string;
    deformityNotes: string;
  };
}

export interface LabResult {
  id: string;
  date: string;
  testName: string;
  result: string;
  numericResult?: number;
  unit: string;
  normalRange: string;
  normalMin?: number;
  normalMax?: number;
  flag: 'normal' | 'high' | 'low';
}

export interface RadiologyResult {
  id: string;
  date: string;
  examinationType: string;
  impression: string;
}

export interface MedicalTherapy {
  id: string;
  medicationName: string;
  dose: string;
  route: 'Oral' | 'IV' | 'IM' | 'SC' | 'Topikal' | 'Inhalasi' | 'Suppositoria';
  frequency: string;
  indication: string;
  startDate: string;
}

export interface DiagnosticData {
  laboratories: LabResult[];
  radiologies: RadiologyResult[];
}

export interface DataFocusItem {
  type: 'DS' | 'DO';
  content: string;
  sourceDomain: string;
}

export interface DiagnosticCandidate {
  id: string;
  sdkCode: string;
  problem: string;
  category: string;
  etiology: string;
  type: 'aktual' | 'risiko' | 'promosi_kesehatan';
  matchConfidence: 'Tinggi' | 'Sedang' | 'Rendah';
  matchScore: number;
  matchReasons: string[];
  suggestedPes: string;
  dataFocusSubjective: string[];
  dataFocusObjective: string[];
  selected: boolean;
  priorityOrder: number;
}

export interface SlkiIndicator {
  id: string;
  name: string;
  targetScale: number; // 1 - 5
  currentScale?: number;
}

export interface SlkiOutcome {
  code: string; // L.xxxxx
  label: string;
  expectation: 'Meningkat' | 'Menurun' | 'Membaik';
  timeframeHours: number; // e.g., 72 hours (3x24 jam)
  indicators: SlkiIndicator[];
  notes?: string;
}

export interface SikiAction {
  id: string;
  category: 'Observasi' | 'Terapeutik' | 'Edukasi' | 'Kolaborasi';
  description: string;
  isSelected: boolean;
}

export interface SikiIntervention {
  code: string; // I.xxxxx
  label: string;
  type: 'utama' | 'pendukung';
  actions: SikiAction[];
}

export interface NursingDiagnosisCarePlan {
  id: string;
  priority: number;
  sdkCode: string;
  problem: string;
  type: 'aktual' | 'risiko' | 'promosi_kesehatan';
  etiology: string;
  signsSymptoms: string;
  pesStatement: string;
  dataFocus: {
    subjective: string[];
    objective: string[];
  };
  outcome: SlkiOutcome;
  interventions: SikiIntervention[];
}

export interface ImplementationLog {
  id: string;
  diagnosisId: string;
  sikiCode: string;
  actionId: string;
  actionDescription: string;
  category: 'Observasi' | 'Terapeutik' | 'Edukasi' | 'Kolaborasi';
  timestampWita: string; // ISO string or YYYY-MM-DD HH:mm:ss WITA
  dateWita: string; // YYYY-MM-DD
  timeWita: string; // HH:mm
  shift: ShiftType;
  operatorName: string;
  patientResponse?: string;
  isCompleted: boolean;
}

export interface EvaluationIndicatorRating {
  indicatorId: string;
  name: string;
  initialScore: number;
  targetScore: number;
  evaluatedScore: number; // 1-5
}

export interface EvaluationSoap {
  id: string;
  diagnosisId: string;
  sdkCode: string;
  problem: string;
  dateWita: string; // YYYY-MM-DD
  timeWita: string; // HH:mm
  shift: ShiftType;
  operatorName: string;
  subjective: string; // S
  objective: string; // O
  painScaleCurrent?: number; // 0-10
  analysis: {
    // A
    ratings: EvaluationIndicatorRating[];
    outcomeStatus: 'Tujuan Tercapai' | 'Tercapai Sebagian' | 'Belum Tercapai';
    notes: string;
  };
  planning: {
    // P
    action: 'Lanjutkan intervensi' | 'Modifikasi intervensi' | 'Hentikan intervensi';
    details: string;
  };
}

export interface Patient {
  id: string;
  ownerId: string;
  initials: string;
  mrn: string;
  room: string;
  medicalDiagnosis: string;
  status: PatientStatus;
  admissionDate: string;
  assessmentDate: string;
  cover: PatientCover;
  identity: PatientIdentity;
  history: PatientHistory;
  domains: DomainAssessment;
  physicalExam: PhysicalExamHeadToToe;
  diagnostics: DiagnosticData;
  therapies: MedicalTherapy[];
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
  deletedAt?: string;
  updatedBy?: string;
  deviceId?: string;
}

export interface CarePlan {
  id: string;
  patientId: string;
  ownerId: string;
  candidates: DiagnosticCandidate[];
  diagnoses: NursingDiagnosisCarePlan[];
  implementations: ImplementationLog[];
  evaluations: EvaluationSoap[];
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
  deletedAt?: string;
  updatedBy?: string;
  deviceId?: string;
}

export interface AllowedNimRecord {
  nim: string;
  name: string;
  registered: boolean;
  registeredAt?: string | null;
  createdAt: string;
  pinHash?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  nim?: string;
  institution?: string;
  role?: 'student' | 'admin';
}
