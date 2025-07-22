// Core TypeScript interfaces and types for the Medical Report Organizer

export interface MedicalReport {
  id: string;
  title: string;
  type: ReportType;
  dateCreated: Date;
  dateOfReport?: Date;
  originalImageUri?: string;
  extractedText: string;
  parsedData?: ParsedMedicalData;
  summary?: string;
  tags: string[];
  isBookmarked: boolean;
  correctedText?: string;
}

export enum ReportType {
  BLOOD_TEST = 'blood_test',
  PRESCRIPTION = 'prescription',
  DIAGNOSTIC = 'diagnostic',
  XRAY = 'xray',
  MRI = 'mri',
  CT_SCAN = 'ct_scan',
  LABORATORY = 'laboratory',
  VACCINATION = 'vaccination',
  CONSULTATION = 'consultation',
  OTHER = 'other'
}

export interface ParsedMedicalData {
  bloodTest?: BloodTestResults;
  prescription?: PrescriptionData;
  vitals?: VitalsData;
  [key: string]: any;
}

export interface BloodTestResults {
  glucose?: MedicalValue;
  hemoglobin?: MedicalValue;
  cholesterol?: MedicalValue;
  whiteBloodCells?: MedicalValue;
  redBloodCells?: MedicalValue;
  platelets?: MedicalValue;
  [key: string]: MedicalValue | undefined;
}

export interface MedicalValue {
  value: number | string;
  unit: string;
  normalRange?: string;
  status?: 'normal' | 'high' | 'low' | 'critical';
}

export interface PrescriptionData {
  medications: Medication[];
  doctor: string;
  clinic?: string;
  instructions?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

export interface VitalsData {
  bloodPressure?: string;
  heartRate?: MedicalValue;
  temperature?: MedicalValue;
  weight?: MedicalValue;
  height?: MedicalValue;
}

export interface CalendarReminder {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: ReminderType;
  isCompleted: boolean;
  relatedReportId?: string;
}

export enum ReminderType {
  APPOINTMENT = 'appointment',
  MEDICATION = 'medication',
  TEST = 'test',
  FOLLOW_UP = 'follow_up',
  OTHER = 'other'
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  relatedReportId?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'ur' | 'ar';
  enableNotifications: boolean;
  autoBackup: boolean;
  ocrLanguage: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes?: BoundingBox[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

export interface LLMResponse {
  summary?: string;
  analysis?: string;
  recommendations?: string[];
  confidence: number;
}
