/**
 * useAnalyticsFilters Hook
 * Provides filter-related utilities for the analytics dashboard
 */

import { useCallback, useMemo } from 'react';
import { useAnalytics } from '../context/AnalyticsContext';
import { useCurriculum } from '../../../contexts/CurriculumContext';
import { CURRICULUM_CONFIGS } from '../../../config/curriculumConfigs';
import { GRADE_MAPPINGS } from '../../../constants/gradeMappings';
import { CurriculumSystem } from '../../../types/curriculum';
import { GradeOption, SubjectOption, FilterState } from '../types';

export function useAnalyticsFilters() {
  const { state, actions } = useAnalytics();
  const { currentSystem, displayRegion } = useCurriculum();

  const { filters } = state;

  // Get curriculum configuration
  const curriculumConfig = useMemo(
    () => CURRICULUM_CONFIGS[filters.curriculum],
    [filters.curriculum]
  );

  // Get grade label based on curriculum
  const gradeLevelLabel = useMemo(() => {
    return curriculumConfig?.gradeLevelLabel || 'Grade Level';
  }, [curriculumConfig]);

  // Get grade options for current curriculum
  const gradeOptions = useMemo((): GradeOption[] => {
    const isEdexcel = filters.curriculum === 'EDEXCEL_INTERNATIONAL';

    if (isEdexcel) {
      // For Edexcel, show Year groups
      return GRADE_MAPPINGS.slice(6).map((mapping) => ({
        value: mapping.us,
        label: mapping.uk, // e.g., "Year 7", "Year 8", etc.
      }));
    } else {
      // For US curriculum, show Grade levels
      return GRADE_MAPPINGS.map((mapping) => ({
        value: mapping.us,
        label: mapping.us === 'K' ? 'Kindergarten' : `Grade ${mapping.us}`,
      }));
    }
  }, [filters.curriculum]);

  // Get subject options for current curriculum
  const subjectOptions = useMemo((): SubjectOption[] => {
    if (!curriculumConfig) return [];

    return curriculumConfig.qualifications.flatMap((qual) =>
      qual.subjects.map((subj) => ({
        value: subj.id,
        label: subj.name,
        qualification: qual.name,
      }))
    );
  }, [curriculumConfig]);

  // Get curriculum options
  const curriculumOptions = useMemo(() => {
    return [
      { value: 'EDEXCEL_INTERNATIONAL', label: 'Edexcel International' },
      { value: 'US_COMMON_CORE_AP', label: 'US Common Core + AP' },
    ];
  }, []);

  // Handle curriculum change
  const handleCurriculumChange = useCallback(
    (curriculum: CurriculumSystem) => {
      actions.setCurriculum(curriculum);
    },
    [actions]
  );

  // Handle school filter change
  const handleSchoolChange = useCallback(
    (schools: string[]) => {
      actions.setFilters({ schools });
    },
    [actions]
  );

  // Handle grade filter change
  const handleGradeChange = useCallback(
    (grades: string[]) => {
      actions.setFilters({ grades });
    },
    [actions]
  );

  // Handle subject filter change
  const handleSubjectChange = useCallback(
    (subjects: string[]) => {
      actions.setFilters({ subjects });
    },
    [actions]
  );

  // Handle search query change
  const handleSearchChange = useCallback(
    (searchQuery: string) => {
      actions.setFilters({ searchQuery });
    },
    [actions]
  );

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    actions.resetFilters();
  }, [actions]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.schools.length > 0 ||
      filters.grades.length > 0 ||
      filters.subjects.length > 0 ||
      filters.searchQuery.length > 0
    );
  }, [filters]);

  // Get formatted grade display
  const formatGradeDisplay = useCallback(
    (usGrade: string): string => {
      const isEdexcel = filters.curriculum === 'EDEXCEL_INTERNATIONAL';
      const mapping = GRADE_MAPPINGS.find((m) => m.us === usGrade);

      if (!mapping) return usGrade;

      if (isEdexcel) {
        return mapping.uk; // e.g., "Year 7"
      } else {
        return usGrade === 'K' ? 'Kindergarten' : `Grade ${usGrade}`;
      }
    },
    [filters.curriculum]
  );

  return {
    // Current filter state
    filters,
    curriculum: filters.curriculum,

    // Labels
    gradeLevelLabel,

    // Options
    curriculumOptions,
    gradeOptions,
    subjectOptions,

    // Handlers
    handleCurriculumChange,
    handleSchoolChange,
    handleGradeChange,
    handleSubjectChange,
    handleSearchChange,
    handleResetFilters,

    // Utilities
    hasActiveFilters,
    formatGradeDisplay,
  };
}

export default useAnalyticsFilters;
