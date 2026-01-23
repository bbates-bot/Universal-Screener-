/**
 * Grade Level Mappings
 * Equivalency table for US, UK, NZ, and AU education systems
 */

import { GradeMapping, GradeLevel } from '../types/curriculum';

// Complete grade equivalency mapping (aligned to Pearson Edexcel IGCSE)
// Reference: IGCSE is typically taken in UK Years 10-11 (US Grades 9-10)
export const GRADE_MAPPINGS: GradeMapping[] = [
  { us: 'K', uk: 'Reception', nz: 'Year 1', au: 'Prep/Foundation', ageRange: '5-6' },
  { us: '1', uk: 'Year 1', nz: 'Year 2', au: 'Year 1', ageRange: '6-7' },
  { us: '2', uk: 'Year 2', nz: 'Year 3', au: 'Year 2', ageRange: '7-8' },
  { us: '3', uk: 'Year 3', nz: 'Year 4', au: 'Year 3', ageRange: '8-9' },
  { us: '4', uk: 'Year 4', nz: 'Year 5', au: 'Year 4', ageRange: '9-10' },
  { us: '5', uk: 'Year 5', nz: 'Year 6', au: 'Year 5', ageRange: '10-11' },
  { us: '6', uk: 'Year 7', nz: 'Year 7', au: 'Year 6', ageRange: '11-12', edexcelStage: 'Lower Secondary 1' },
  { us: '7', uk: 'Year 8', nz: 'Year 8', au: 'Year 7', ageRange: '12-13', edexcelStage: 'Lower Secondary 2' },
  { us: '8', uk: 'Year 9', nz: 'Year 9', au: 'Year 8', ageRange: '13-14', edexcelStage: 'Lower Secondary 3' },
  { us: '9', uk: 'Year 10', nz: 'Year 10', au: 'Year 9', ageRange: '14-15', edexcelStage: 'IGCSE Year 1 (IG1)' },
  { us: '10', uk: 'Year 11', nz: 'Year 11', au: 'Year 10', ageRange: '15-16', edexcelStage: 'IGCSE Year 2 (IG2)' },
  { us: '11', uk: 'Year 12', nz: 'Year 12', au: 'Year 11', ageRange: '16-17', edexcelStage: 'AS Level' },
  { us: '12', uk: 'Year 13', nz: 'Year 13', au: 'Year 12', ageRange: '17-18', edexcelStage: 'A Level (A2)' },
];

// Convert mappings to GradeLevel format for CurriculumConfig
export const GRADE_LEVELS: GradeLevel[] = GRADE_MAPPINGS.map((mapping, index) => ({
  id: `grade-${mapping.us.replace('+', '-plus')}`,
  displayName: mapping.us,
  usEquivalent: mapping.us === 'K' ? 'Kindergarten' : `Grade ${mapping.us}`,
  ukEquivalent: mapping.uk,
  nzEquivalent: mapping.nz,
  auEquivalent: mapping.au,
  ageRange: {
    min: parseInt(mapping.ageRange.split('-')[0]),
    max: parseInt(mapping.ageRange.split('-')[1]),
  },
}));

// Edexcel-specific stage mappings (aligned to Pearson Edexcel IGCSE structure)
// Lower Secondary (Pre-IGCSE): UK Years 7-9, US Grades 6-8
// IGCSE: UK Years 10-11, US Grades 9-10
// IAL (International A-Level): UK Years 12-13, US Grades 11-12
export const EDEXCEL_STAGES = [
  { id: 'lower-secondary', name: 'Lower Secondary', description: 'Pre-IGCSE foundation (Years 7-9)', usGrades: ['6', '7', '8'], ukYears: ['7', '8', '9'] },
  { id: 'igcse', name: 'IGCSE', description: 'International GCSE (Years 10-11)', usGrades: ['9', '10'], ukYears: ['10', '11'] },
  { id: 'as-level', name: 'AS Level', description: 'International Advanced Subsidiary (Year 12)', usGrades: ['11'], ukYears: ['12'] },
  { id: 'a-level', name: 'A Level', description: 'International Advanced Level (Year 13)', usGrades: ['12'], ukYears: ['13'] },
];

// Question bank stage mappings (maps our question bank folders to stages)
export const QUESTION_BANK_STAGES = [
  { id: 'pre-ig1', name: 'Pre-IG1', stage: 'Lower Secondary', usGrades: ['6', '7'], ukYears: ['7', '8'] },
  { id: 'pre-ig2', name: 'Pre-IG2', stage: 'Lower Secondary', usGrades: ['8'], ukYears: ['9'] },
  { id: 'ig1', name: 'IG1', stage: 'IGCSE', usGrades: ['9'], ukYears: ['10'] },
  { id: 'ig2', name: 'IG2', stage: 'IGCSE', usGrades: ['10'], ukYears: ['11'] },
];

// Helper function to get grade equivalent for a region
export function getGradeForRegion(
  usGrade: string,
  region: 'US' | 'UK' | 'NZ' | 'AU'
): string {
  const mapping = GRADE_MAPPINGS.find((m) => m.us === usGrade);
  if (!mapping) return usGrade;

  switch (region) {
    case 'US':
      return mapping.us === 'K' ? 'Kindergarten' : `Grade ${mapping.us}`;
    case 'UK':
      return mapping.uk;
    case 'NZ':
      return mapping.nz;
    case 'AU':
      return mapping.au;
    default:
      return usGrade;
  }
}

// Helper function to get Edexcel stage from US grade
export function getEdexcelStageFromGrade(usGrade: string): string | null {
  const mapping = GRADE_MAPPINGS.find((m) => m.us === usGrade);
  return mapping?.edexcelStage || null;
}

// Helper function to get US grades for an Edexcel stage
export function getUSGradesForEdexcelStage(stage: string): string[] {
  const stageMapping = EDEXCEL_STAGES.find(
    (s) => s.name.toLowerCase() === stage.toLowerCase() || s.id === stage.toLowerCase()
  );
  return stageMapping?.usGrades || [];
}

// UI Labels by region
export const GRADE_LEVEL_LABELS: Record<'US' | 'UK' | 'NZ' | 'AU', string> = {
  US: 'Grade Level',
  UK: 'Year Group',
  NZ: 'Year Level',
  AU: 'Year Level',
};
