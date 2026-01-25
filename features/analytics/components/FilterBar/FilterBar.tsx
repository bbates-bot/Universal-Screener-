/**
 * FilterBar Component
 * Unified filter bar for the Analytics Dashboard
 * Enhanced with accessibility features: ARIA labels, roles, and live region support
 */

import React, { useId } from 'react';
import { FilterDropdown } from './FilterDropdown';
import { StudentSearch } from './StudentSearch';
import { useAnalyticsFilters } from '../../hooks/useAnalyticsFilters';
import { School } from '../../../../types';

interface FilterBarProps {
  schools: School[];
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  schools,
  className = '',
}) => {
  const filterBarId = useId();
  const {
    filters,
    gradeLevelLabel,
    gradeOptions,
    subjectOptions,
    handleSchoolChange,
    handleGradeChange,
    handleSubjectChange,
    handleSearchChange,
    handleResetFilters,
    hasActiveFilters,
  } = useAnalyticsFilters();

  // Transform schools to dropdown options
  const schoolOptions = schools.map((school) => ({
    value: school.id,
    label: school.name,
  }));

  // Transform subject options with groups
  const subjectOptionsWithGroups = subjectOptions.map((opt) => ({
    value: opt.value,
    label: opt.label,
    group: opt.qualification,
  }));

  // Count active filters for screen reader announcement
  const activeFilterCount =
    filters.schools.length +
    filters.grades.length +
    filters.subjects.length +
    (filters.searchQuery ? 1 : 0);

  return (
    <div
      className={`
        bg-white p-6 rounded-2xl shadow-sm border border-slate-100
        space-y-4 md:space-y-0
        ${className}
      `}
      role="search"
      aria-label="Filter students"
      id={filterBarId}
    >
      {/* Filter Row */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* School Filter */}
        <FilterDropdown
          label="Filter By School"
          value={filters.schools}
          onChange={handleSchoolChange}
          options={schoolOptions}
          multiSelect={true}
          searchable={true}
          placeholder="All Campuses"
        />

        {/* Grade/Year Filter */}
        <FilterDropdown
          label={`Filter By ${gradeLevelLabel}`}
          value={filters.grades}
          onChange={handleGradeChange}
          options={gradeOptions}
          multiSelect={true}
          placeholder={`All ${gradeLevelLabel}s`}
        />

        {/* Subject Filter */}
        <FilterDropdown
          label="Filter By Subject"
          value={filters.subjects}
          onChange={handleSubjectChange}
          options={subjectOptionsWithGroups}
          multiSelect={true}
          searchable={true}
          placeholder="All Subjects"
        />

        {/* Student Search */}
        <StudentSearch
          value={filters.searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by name or username..."
          debounceMs={300}
        />
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div
          className="mt-4 pt-4 border-t border-slate-100"
          role="region"
          aria-label="Active filters"
          aria-live="polite"
          aria-atomic="false"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider" id={`${filterBarId}-active-label`}>
              Active Filters:
            </span>
            {/* Screen reader announcement */}
            <span className="sr-only">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} currently active.
            </span>

            {/* School filter tags */}
            {filters.schools.map((schoolId) => {
              const school = schools.find((s) => s.id === schoolId);
              return (
                <FilterTag
                  key={`school-${schoolId}`}
                  label={school?.name || schoolId}
                  onRemove={() =>
                    handleSchoolChange(filters.schools.filter((s) => s !== schoolId))
                  }
                />
              );
            })}

            {/* Grade filter tags */}
            {filters.grades.map((grade) => {
              const gradeOption = gradeOptions.find((g) => g.value === grade);
              return (
                <FilterTag
                  key={`grade-${grade}`}
                  label={gradeOption?.label || grade}
                  onRemove={() =>
                    handleGradeChange(filters.grades.filter((g) => g !== grade))
                  }
                />
              );
            })}

            {/* Subject filter tags */}
            {filters.subjects.map((subjectId) => {
              const subject = subjectOptions.find((s) => s.value === subjectId);
              return (
                <FilterTag
                  key={`subject-${subjectId}`}
                  label={subject?.label || subjectId}
                  onRemove={() =>
                    handleSubjectChange(filters.subjects.filter((s) => s !== subjectId))
                  }
                />
              );
            })}

            {/* Search query tag */}
            {filters.searchQuery && (
              <FilterTag
                label={`Search: "${filters.searchQuery}"`}
                onRemove={() => handleSearchChange('')}
              />
            )}

            {/* Reset all button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="
                flex items-center gap-1 px-2 py-1
                text-xs font-medium text-slate-500
                hover:text-rose-600 hover:bg-rose-50
                rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1
              "
              aria-label={`Reset all filters. Currently ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} active.`}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for filter tags
interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

const FilterTag: React.FC<FilterTagProps> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors"
      aria-label={`Remove ${label} filter`}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
);

export default FilterBar;
