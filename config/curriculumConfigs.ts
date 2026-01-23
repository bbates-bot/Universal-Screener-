/**
 * Curriculum Configurations
 * Defines available curriculum systems and their settings
 */

import {
  CurriculumConfig,
  CurriculumSystem,
  Qualification,
} from '../types/curriculum';
import { GRADE_LEVELS, EDEXCEL_STAGES } from '../constants/gradeMappings';
import {
  MATH_STRANDS,
  READING_STRANDS,
  ELA_STRANDS,
  AP_MATH_STRANDS,
  AP_ENGLISH_STRANDS,
  EDEXCEL_MATH_STRANDS,
  EDEXCEL_ENGLISH_STRANDS,
} from '../constants';

// US Common Core + AP Configuration
const US_QUALIFICATIONS: Qualification[] = [
  {
    id: 'general',
    name: 'General Assessment',
    shortName: 'General',
    description: 'Common Core State Standards aligned assessments',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        shortName: 'Math',
        strands: MATH_STRANDS,
      },
      {
        id: 'reading-foundations',
        name: 'Reading Foundations',
        shortName: 'Reading',
        strands: READING_STRANDS,
      },
      {
        id: 'reading-comprehension',
        name: 'Reading Comprehension',
        shortName: 'Reading Comp',
        strands: READING_STRANDS,
      },
      {
        id: 'ela',
        name: 'English Language Arts',
        shortName: 'ELA',
        strands: ELA_STRANDS,
      },
    ],
    gradeRange: { min: 'K', max: '12' },
  },
  {
    id: 'ap-readiness',
    name: 'AP Readiness',
    shortName: 'AP',
    description: 'Advanced Placement course readiness assessments',
    subjects: [
      {
        id: 'ap-precalculus',
        name: 'AP Precalculus',
        shortName: 'Pre-Calc',
        strands: AP_MATH_STRANDS,
      },
      {
        id: 'ap-calculus-ab',
        name: 'AP Calculus AB',
        shortName: 'Calc AB',
        strands: AP_MATH_STRANDS,
      },
      {
        id: 'ap-calculus-bc',
        name: 'AP Calculus BC',
        shortName: 'Calc BC',
        strands: AP_MATH_STRANDS,
      },
      {
        id: 'ap-statistics',
        name: 'AP Statistics',
        shortName: 'Stats',
        strands: AP_MATH_STRANDS,
      },
      {
        id: 'ap-english-language',
        name: 'AP English Language',
        shortName: 'Eng Lang',
        strands: AP_ENGLISH_STRANDS,
      },
      {
        id: 'ap-english-literature',
        name: 'AP English Literature',
        shortName: 'Eng Lit',
        strands: AP_ENGLISH_STRANDS,
      },
    ],
    gradeRange: { min: '9', max: '12' },
  },
];

// Edexcel International Configuration (aligned to Pearson Edexcel IGCSE)
// Lower Secondary: UK Years 7-9 (US Grades 6-8)
// IGCSE: UK Years 10-11 (US Grades 9-10)
// IAL: UK Years 12-13 (US Grades 11-12)
const EDEXCEL_QUALIFICATIONS: Qualification[] = [
  {
    id: 'lower-secondary',
    name: 'Lower Secondary',
    shortName: 'LS',
    description: 'Pre-IGCSE foundation programme (Years 7-9)',
    subjects: [
      {
        id: 'edexcel-math-pre-ig1',
        name: 'Mathematics (Years 7-8)',
        shortName: 'Math Pre-IG1',
        questionBankPath: 'edexcel-math/pre-ig1',
        strands: EDEXCEL_MATH_STRANDS,
      },
      {
        id: 'edexcel-math-pre-ig2',
        name: 'Mathematics (Year 9)',
        shortName: 'Math Pre-IG2',
        questionBankPath: 'edexcel-math/pre-ig2',
        strands: EDEXCEL_MATH_STRANDS,
      },
      {
        id: 'edexcel-english-pre-ig1',
        name: 'English Language (Years 7-8)',
        shortName: 'English Pre-IG1',
        questionBankPath: 'edexcel-english/pre-ig1',
        strands: EDEXCEL_ENGLISH_STRANDS,
      },
      {
        id: 'edexcel-english-pre-ig2',
        name: 'English Language (Year 9)',
        shortName: 'English Pre-IG2',
        questionBankPath: 'edexcel-english/pre-ig2',
        strands: EDEXCEL_ENGLISH_STRANDS,
      },
    ],
    gradeRange: { min: '6', max: '8' }, // US Grades 6-8 = UK Years 7-9
  },
  {
    id: 'igcse',
    name: 'International GCSE',
    shortName: 'IGCSE',
    description: 'Pearson Edexcel International GCSE (Years 10-11)',
    subjects: [
      {
        id: 'edexcel-math-ig1',
        name: 'Mathematics (Year 10 / IG1)',
        shortName: 'Math IG1',
        questionBankPath: 'edexcel-math/ig1',
        strands: EDEXCEL_MATH_STRANDS,
      },
      {
        id: 'edexcel-math-ig2',
        name: 'Mathematics (Year 11 / IG2)',
        shortName: 'Math IG2',
        questionBankPath: 'edexcel-math/ig2',
        strands: EDEXCEL_MATH_STRANDS,
      },
      {
        id: 'edexcel-english-ig1',
        name: 'English Language (Year 10 / IG1)',
        shortName: 'English IG1',
        questionBankPath: 'edexcel-english/ig1',
        strands: EDEXCEL_ENGLISH_STRANDS,
      },
      {
        id: 'edexcel-english-ig2',
        name: 'English Language (Year 11 / IG2)',
        shortName: 'English IG2',
        questionBankPath: 'edexcel-english/ig2',
        strands: EDEXCEL_ENGLISH_STRANDS,
      },
    ],
    gradeRange: { min: '9', max: '10' }, // US Grades 9-10 = UK Years 10-11
  },
  {
    id: 'ial-as',
    name: 'International AS Level',
    shortName: 'AS',
    description: 'Pearson Edexcel International Advanced Subsidiary (Year 12)',
    subjects: [], // To be implemented with question banks
    gradeRange: { min: '11', max: '11' }, // US Grade 11 = UK Year 12
  },
  {
    id: 'ial-a2',
    name: 'International A Level',
    shortName: 'A2',
    description: 'Pearson Edexcel International Advanced Level (Year 13)',
    subjects: [], // To be implemented with question banks
    gradeRange: { min: '12', max: '12' }, // US Grade 12 = UK Year 13
  },
];

// Full curriculum configurations
export const CURRICULUM_CONFIGS: Record<CurriculumSystem, CurriculumConfig> = {
  US_COMMON_CORE_AP: {
    system: 'US_COMMON_CORE_AP',
    displayName: 'US Common Core + AP',
    shortName: 'US',
    description: 'Common Core State Standards with Advanced Placement',
    defaultRegion: 'US',
    gradeLevelLabel: 'Grade Level',
    qualificationLabel: 'Assessment Type',
    qualifications: US_QUALIFICATIONS,
    gradeLevels: GRADE_LEVELS,
  },
  EDEXCEL_INTERNATIONAL: {
    system: 'EDEXCEL_INTERNATIONAL',
    displayName: 'Pearson Edexcel International',
    shortName: 'Edexcel',
    description: 'Pearson Edexcel International GCSE curriculum',
    defaultRegion: 'UK',
    gradeLevelLabel: 'Stage',
    qualificationLabel: 'Qualification',
    qualifications: EDEXCEL_QUALIFICATIONS,
    gradeLevels: GRADE_LEVELS,
  },
  UK_NATIONAL_ALEVEL: {
    system: 'UK_NATIONAL_ALEVEL',
    displayName: 'UK National Curriculum + A-Level',
    shortName: 'UK',
    description: 'UK National Curriculum with A-Level pathway',
    defaultRegion: 'UK',
    gradeLevelLabel: 'Year Group',
    qualificationLabel: 'Key Stage',
    qualifications: [], // To be implemented
    gradeLevels: GRADE_LEVELS,
  },
  CAMBRIDGE_INTERNATIONAL: {
    system: 'CAMBRIDGE_INTERNATIONAL',
    displayName: 'Cambridge International',
    shortName: 'Cambridge',
    description: 'Cambridge Assessment International Education',
    defaultRegion: 'UK',
    gradeLevelLabel: 'Year Group',
    qualificationLabel: 'Programme',
    qualifications: [], // To be implemented
    gradeLevels: GRADE_LEVELS,
  },
};

// Get configuration for a curriculum system
export function getCurriculumConfig(system: CurriculumSystem): CurriculumConfig {
  return CURRICULUM_CONFIGS[system];
}

// Get all available curriculum systems
export function getAvailableCurriculumSystems(): CurriculumSystem[] {
  return Object.keys(CURRICULUM_CONFIGS) as CurriculumSystem[];
}

// Get qualifications for a curriculum system
export function getQualifications(system: CurriculumSystem): Qualification[] {
  return CURRICULUM_CONFIGS[system].qualifications;
}

// Get subjects for a qualification
export function getSubjectsForQualification(
  system: CurriculumSystem,
  qualificationId: string
) {
  const qualification = CURRICULUM_CONFIGS[system].qualifications.find(
    (q) => q.id === qualificationId
  );
  return qualification?.subjects || [];
}

// Check if a curriculum system is fully implemented
export function isCurriculumImplemented(system: CurriculumSystem): boolean {
  const config = CURRICULUM_CONFIGS[system];
  return config.qualifications.length > 0;
}

// Default curriculum system
export const DEFAULT_CURRICULUM_SYSTEM: CurriculumSystem = 'US_COMMON_CORE_AP';
