// Re-export all new types for convenience
export * from './types/index';

// Re-export curriculum types for convenience
export type { CurriculumSystem, GradeDisplayRegion } from './types/curriculum';

export enum ScreenerLevel {
  ON_ABOVE = 'On or above grade level',
  BELOW = 'Below grade level',
  FAR_BELOW = 'Far below grade level',
  NOT_STARTED = 'Not started',
  IN_PROGRESS = 'In progress'
}

export enum UserRole {
  ADMIN = 'Administrator',
  ADMISSIONS = 'Admissions',
  TEACHER = 'Teacher'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
}

export type Subject =
  | 'Math'
  | 'Reading Foundations'
  | 'Reading Comprehension'
  | 'ELA'
  | 'AP Precalculus'
  | 'AP Calculus AB'
  | 'AP Calculus BC'
  | 'AP Statistics'
  | 'AP English Language'
  | 'AP English Literature'
  // Pearson Edexcel IGCSE aligned subjects
  | 'Edexcel Math Pre-IG1'
  | 'Edexcel Math Pre-IG2'
  | 'Edexcel Math IG1'
  | 'Edexcel Math IG2'
  | 'Edexcel English Pre-IG1'
  | 'Edexcel English Pre-IG2'
  | 'Edexcel English IG1'
  | 'Edexcel English IG2';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  strand: string;
}

export interface School {
  id: string;
  name: string;
  district: string;
  address?: string;
  principal?: string;
  schoolCode?: string;
  status: 'Active' | 'Inactive';
}

export interface AssignedAssessment {
  subject: Subject;
  type: 'General' | 'AP Readiness' | 'Edexcel IGCSE';
}

export interface Student {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  grade: string; // Stored in native system (e.g., "9" for US, "Y10" for UK)
  schoolId: string;
  language: 'English' | 'Spanish';
  assignedAssessments: AssignedAssessment[];
  // Curriculum system - defaults to US_COMMON_CORE_AP for backward compatibility
  curriculumSystem?: 'US_COMMON_CORE_AP' | 'UK_NATIONAL_ALEVEL' | 'EDEXCEL_INTERNATIONAL' | 'CAMBRIDGE_INTERNATIONAL';
}

// Learning objective performance tracking
export interface StandardPerformance {
  standardCode: string;      // e.g., "CCSS.MATH.CONTENT.3.NF.A.1"
  standardName: string;      // Human-readable name
  questionsAttempted: number;
  questionsCorrect: number;
  mastery: 'proficient' | 'developing' | 'needs-support';
}

export interface StudentResult extends Student {
  studentId?: string; // Reference to the original student's ID
  subject: Subject;
  overallLevel: ScreenerLevel;
  percentile: number;
  strandScores: Record<string, number>; // 0-100
  testDate: string;
  // Learning objectives tracking
  standardsPerformance?: StandardPerformance[];
  masteredObjectives?: string[];  // Standards with >= 70% correct
  gapObjectives?: string[];       // Standards with < 60% correct
  // Curriculum system this result belongs to (for cross-system comparison)
  resultCurriculumSystem?: 'US_COMMON_CORE_AP' | 'UK_NATIONAL_ALEVEL' | 'EDEXCEL_INTERNATIONAL' | 'CAMBRIDGE_INTERNATIONAL';
}

export interface ScreenerWindow {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  grades: string[];
  schoolIds: string[];
  subject: Subject;
}
