export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  NONE = 'NONE'
}

export enum ReportStatus {
  NOT_STARTED = 'Not Started',
  PENDING_AI = 'Pending AI Analysis',
  PENDING_DOCTOR = 'Pending Doctor Review',
  VERIFIED = 'Verified'
}

export interface UserCredentials {
  id: string;
  password: string;
  role: UserRole;
}

export interface UserProfile {
  id: string;
  name: string;
  age: string;
  role: UserRole;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  preferredLanguage?: string;
  addressLine1?: string;
  addressLine2?: string;
  district?: string;
  state?: string;
  country?: string;
}

export interface PatientData {
  id: string;
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  symptoms: string[];
  otherSymptoms: string;
  medicalHistory: string; // Can be text or a data URL for a file
  medicalHistoryFileName?: string;
  currentMedications: string;
}

export interface AIReport {
  diagnosis: string;
  severity: string; // e.g., 'Low', 'Medium', 'High'
  medication: string;
  dietPlan: string;
  reasoning: string; // For doctor's internal review
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'PAT001' or 'DOC001'
  text: string;
  timestamp: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  patientData: PatientData;
  aiReport: AIReport | null;
  status: ReportStatus;
  doctorNotes?: string;
  verifiedBy?: string; // e.g., 'Dr. DOC001'
  verifiedDate?: string;
  chat?: ChatMessage[];
  followUpFor?: string; // ID of the original report
  followUpNote?: string; // Patient's note for the follow-up
}