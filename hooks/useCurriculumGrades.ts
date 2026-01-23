/**
 * Hook for curriculum-aware grade operations
 * Combines CurriculumContext with grade conversion utilities
 */

import { useMemo, useCallback } from 'react';
import { useCurriculum } from '../contexts/CurriculumContext';
import {
  getGradeDisplayForCurriculum,
  getGradeOptionsForCurriculum,
  getCurriculumForSubject,
  convertGradeBetweenSystems,
  isEdexcelSubject,
  isAPSubject,
} from '../utils/gradeConversion';
import { Subject, Student, StudentResult } from '../types';

/**
 * Hook providing curriculum-aware grade utilities
 */
export function useCurriculumGrades() {
  const { currentSystem, displayRegion, currentConfig } = useCurriculum();

  // Get grade options formatted for current curriculum/region
  const gradeOptions = useMemo(() => {
    return getGradeOptionsForCurriculum(currentSystem, displayRegion);
  }, [currentSystem, displayRegion]);

  // Format a grade for display in current context
  const formatGrade = useCallback(
    (usGrade: string) => {
      return getGradeDisplayForCurriculum(usGrade, currentSystem, displayRegion);
    },
    [currentSystem, displayRegion]
  );

  // Format a student's grade for display, accounting for their curriculum
  const formatStudentGrade = useCallback(
    (student: Student) => {
      const studentCurriculum = student.curriculumSystem || 'US_COMMON_CORE_AP';

      // If student is in a different curriculum, convert for display
      if (studentCurriculum !== currentSystem) {
        return convertGradeBetweenSystems(
          student.grade,
          studentCurriculum,
          currentSystem,
          displayRegion
        );
      }

      return formatGrade(student.grade);
    },
    [currentSystem, displayRegion, formatGrade]
  );

  // Check if a subject matches the current curriculum
  const isSubjectInCurrentCurriculum = useCallback(
    (subject: Subject) => {
      const subjectCurriculum = getCurriculumForSubject(subject);
      return subjectCurriculum === currentSystem;
    },
    [currentSystem]
  );

  // Filter students by current curriculum
  const filterStudentsByCurriculum = useCallback(
    (students: Student[]) => {
      return students.filter((s) => {
        const studentCurriculum = s.curriculumSystem || 'US_COMMON_CORE_AP';
        return studentCurriculum === currentSystem;
      });
    },
    [currentSystem]
  );

  // Filter results by current curriculum
  const filterResultsByCurriculum = useCallback(
    (results: StudentResult[]) => {
      return results.filter((r) => {
        // Check both the result's curriculum and the subject
        const resultCurriculum = r.resultCurriculumSystem || getCurriculumForSubject(r.subject);
        return resultCurriculum === currentSystem;
      });
    },
    [currentSystem]
  );

  // Get subjects available for current curriculum
  const getSubjectsForCurrentCurriculum = useCallback(() => {
    if (!currentConfig) return [];

    return currentConfig.qualifications.flatMap((qual) =>
      qual.subjects.map((subj) => ({
        id: subj.id,
        name: subj.name,
        shortName: subj.shortName,
        qualification: qual.name,
        qualificationId: qual.id,
      }))
    );
  }, [currentConfig]);

  // Get the label for grade level (e.g., "Grade Level" vs "Year Group")
  const gradeLevelLabel = currentConfig?.gradeLevelLabel || 'Grade Level';

  // Get the label for qualification (e.g., "AP Course" vs "Qualification")
  const qualificationLabel = currentConfig?.qualificationLabel || 'Assessment Type';

  return {
    // Current state
    currentSystem,
    displayRegion,
    currentConfig,

    // Labels
    gradeLevelLabel,
    qualificationLabel,

    // Grade utilities
    gradeOptions,
    formatGrade,
    formatStudentGrade,

    // Subject utilities
    isSubjectInCurrentCurriculum,
    isEdexcelSubject,
    isAPSubject,
    getSubjectsForCurrentCurriculum,

    // Filtering
    filterStudentsByCurriculum,
    filterResultsByCurriculum,
  };
}

export default useCurriculumGrades;
