/**
 * Grade Conversion Utilities
 * Helpers for converting and displaying grades across curriculum systems
 */

import { CurriculumSystem, GradeDisplayRegion } from '../types/curriculum';
import { GRADE_MAPPINGS, QUESTION_BANK_STAGES } from '../constants/gradeMappings';

/**
 * Convert a US grade to the equivalent display for a given region
 */
export function convertUSGradeToRegion(
  usGrade: string,
  region: GradeDisplayRegion
): string {
  const mapping = GRADE_MAPPINGS.find((m) => m.us === usGrade);
  if (!mapping) return usGrade;

  switch (region) {
    case 'US':
      return usGrade === 'K' ? 'Kindergarten' : `Grade ${usGrade}`;
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

/**
 * Convert a UK year to US grade equivalent
 */
export function convertUKYearToUSGrade(ukYear: string): string | null {
  // Handle formats like "Year 10", "Y10", or just "10"
  const yearNum = ukYear.replace(/[^0-9]/g, '');
  const mapping = GRADE_MAPPINGS.find((m) => m.uk.includes(yearNum));
  return mapping?.us || null;
}

/**
 * Get the Edexcel stage for a given US grade
 */
export function getEdexcelStageForUSGrade(usGrade: string): string | null {
  const mapping = GRADE_MAPPINGS.find((m) => m.us === usGrade);
  return mapping?.edexcelStage || null;
}

/**
 * Get question bank stage ID (pre-ig1, pre-ig2, ig1, ig2) for a US grade
 */
export function getQuestionBankStageForGrade(usGrade: string): string | null {
  const stage = QUESTION_BANK_STAGES.find((s) => s.usGrades.includes(usGrade));
  return stage?.id || null;
}

/**
 * Get the appropriate grade display based on curriculum system and region
 */
export function getGradeDisplayForCurriculum(
  usGrade: string,
  curriculumSystem: CurriculumSystem,
  displayRegion: GradeDisplayRegion
): string {
  const mapping = GRADE_MAPPINGS.find((m) => m.us === usGrade);
  if (!mapping) return usGrade;

  // For Edexcel, show the Edexcel stage alongside the year
  if (curriculumSystem === 'EDEXCEL_INTERNATIONAL') {
    const regionDisplay = convertUSGradeToRegion(usGrade, displayRegion);
    if (mapping.edexcelStage) {
      // For Year 10/11 etc, append the stage
      return `${regionDisplay} (${mapping.edexcelStage})`;
    }
    return regionDisplay;
  }

  // For other systems, just show the regional equivalent
  return convertUSGradeToRegion(usGrade, displayRegion);
}

/**
 * Get all grades filtered for a curriculum system
 * Returns US grade IDs that are applicable to the curriculum
 */
export function getGradesForCurriculum(curriculumSystem: CurriculumSystem): string[] {
  switch (curriculumSystem) {
    case 'EDEXCEL_INTERNATIONAL':
      // Edexcel covers Years 7-13 = US Grades 6-12
      return ['6', '7', '8', '9', '10', '11', '12'];
    case 'UK_NATIONAL_ALEVEL':
      // UK National covers all years
      return GRADE_MAPPINGS.map((m) => m.us);
    case 'CAMBRIDGE_INTERNATIONAL':
      // Cambridge similar to Edexcel
      return ['6', '7', '8', '9', '10', '11', '12'];
    case 'US_COMMON_CORE_AP':
    default:
      // US covers K-12
      return GRADE_MAPPINGS.map((m) => m.us);
  }
}

/**
 * Get grade options for a dropdown, formatted for the current curriculum/region
 */
export function getGradeOptionsForCurriculum(
  curriculumSystem: CurriculumSystem,
  displayRegion: GradeDisplayRegion
): { value: string; label: string }[] {
  const grades = getGradesForCurriculum(curriculumSystem);

  return grades.map((grade) => ({
    value: grade,
    label: getGradeDisplayForCurriculum(grade, curriculumSystem, displayRegion),
  }));
}

/**
 * Determine if a subject belongs to the Edexcel curriculum
 */
export function isEdexcelSubject(subject: string): boolean {
  return subject.toLowerCase().includes('edexcel');
}

/**
 * Determine if a subject belongs to the AP curriculum
 */
export function isAPSubject(subject: string): boolean {
  return subject.toLowerCase().startsWith('ap ');
}

/**
 * Get the curriculum system for a subject
 */
export function getCurriculumForSubject(subject: string): CurriculumSystem {
  if (isEdexcelSubject(subject)) {
    return 'EDEXCEL_INTERNATIONAL';
  }
  // AP and general subjects are US curriculum
  return 'US_COMMON_CORE_AP';
}

/**
 * Convert grade between curriculum systems using age as the common factor
 */
export function convertGradeBetweenSystems(
  grade: string,
  fromSystem: CurriculumSystem,
  toSystem: CurriculumSystem,
  toRegion: GradeDisplayRegion
): string {
  // If same system, just format for the region
  if (fromSystem === toSystem) {
    return getGradeDisplayForCurriculum(grade, toSystem, toRegion);
  }

  // Find the mapping by the source grade
  let mapping;
  if (fromSystem === 'US_COMMON_CORE_AP') {
    mapping = GRADE_MAPPINGS.find((m) => m.us === grade);
  } else {
    // Try to find by UK year (most common international format)
    mapping = GRADE_MAPPINGS.find((m) => m.uk === grade || m.uk.includes(grade.replace(/[^0-9]/g, '')));
  }

  if (!mapping) return grade;

  // Return the equivalent for the target system/region
  return getGradeDisplayForCurriculum(mapping.us, toSystem, toRegion);
}
