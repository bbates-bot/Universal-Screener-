/**
 * Region Selector Component
 * Allows users to select their preferred grade display region (UK, NZ, AU)
 * Only shown when using international curriculum systems
 */

import React from 'react';
import { useCurriculum } from '../contexts/CurriculumContext';
import { GradeDisplayRegion } from '../types/curriculum';

const REGION_OPTIONS: {
  value: GradeDisplayRegion;
  label: string;
  flag: string;
  description: string;
}[] = [
  {
    value: 'UK',
    label: 'United Kingdom',
    flag: '\u{1F1EC}\u{1F1E7}',
    description: 'Year 7, Year 10, etc.',
  },
  {
    value: 'NZ',
    label: 'New Zealand',
    flag: '\u{1F1F3}\u{1F1FF}',
    description: 'Year 7, Year 10, etc.',
  },
  {
    value: 'AU',
    label: 'Australia',
    flag: '\u{1F1E6}\u{1F1FA}',
    description: 'Year 6, Year 9, etc.',
  },
];

interface RegionSelectorProps {
  compact?: boolean;
  className?: string;
}

export function RegionSelector({ compact = false, className = '' }: RegionSelectorProps) {
  const { currentSystem, displayRegion, setDisplayRegion } = useCurriculum();

  // Only show for international curricula
  if (currentSystem === 'US_COMMON_CORE_AP') {
    return null;
  }

  const currentOption = REGION_OPTIONS.find((o) => o.value === displayRegion);

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <select
          value={displayRegion}
          onChange={(e) => setDisplayRegion(e.target.value as GradeDisplayRegion)}
          className={`
            appearance-none bg-slate-50 border border-slate-200
            rounded-lg font-medium text-xs cursor-pointer
            focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500
            transition-all hover:bg-slate-100
            ${compact ? 'pl-6 pr-6 py-1' : 'pl-8 pr-8 py-1.5'}
          `}
          title="Select grade display region"
        >
          {REGION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.flag} {compact ? option.value : option.label}
            </option>
          ))}
        </select>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-sm">
          {currentOption?.flag}
        </div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-3 h-3 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default RegionSelector;
