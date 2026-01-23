/**
 * Curriculum System Types
 * Supports multiple international curriculum frameworks
 */

// Available curriculum systems
export type CurriculumSystem =
  | 'US_COMMON_CORE_AP'
  | 'UK_NATIONAL_ALEVEL'
  | 'EDEXCEL_INTERNATIONAL'
  | 'CAMBRIDGE_INTERNATIONAL';

// Regions for grade display formatting
export type GradeDisplayRegion = 'US' | 'UK' | 'NZ' | 'AU';

// Qualification structure within a curriculum
export interface Qualification {
  id: string;
  name: string;
  shortName: string;
  description: string;
  subjects: QualificationSubject[];
  gradeRange?: {
    min: string;
    max: string;
  };
}

// Subject within a qualification
export interface QualificationSubject {
  id: string;
  name: string;
  shortName: string;
  questionBankPath?: string;
  strands: string[];
}

// Grade level structure
export interface GradeLevel {
  id: string;
  displayName: string;
  usEquivalent: string;
  ukEquivalent: string;
  nzEquivalent: string;
  auEquivalent: string;
  ageRange: {
    min: number;
    max: number;
  };
}

// Full curriculum configuration
export interface CurriculumConfig {
  system: CurriculumSystem;
  displayName: string;
  shortName: string;
  description: string;
  defaultRegion: GradeDisplayRegion;
  gradeLevelLabel: string;
  qualificationLabel: string;
  qualifications: Qualification[];
  gradeLevels: GradeLevel[];
}

// Curriculum context state
export interface CurriculumState {
  currentSystem: CurriculumSystem;
  displayRegion: GradeDisplayRegion;
  currentConfig: CurriculumConfig | null;
}

// Curriculum context actions
export interface CurriculumContextValue extends CurriculumState {
  setSystem: (system: CurriculumSystem) => void;
  setDisplayRegion: (region: GradeDisplayRegion) => void;
  getGradeDisplay: (gradeLevel: GradeLevel) => string;
  getGradeLevelLabel: () => string;
  getQualificationLabel: () => string;
}

// Grade mapping entry for equivalency table
export interface GradeMapping {
  us: string;
  uk: string;
  nz: string;
  au: string;
  ageRange: string;
  edexcelStage?: string;
  cambridgeStage?: string;
}

// Filter option for curriculum-aware dropdowns
export interface CurriculumFilterOption {
  value: string;
  label: string;
  curriculum: CurriculumSystem;
}
