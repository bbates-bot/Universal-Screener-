/**
 * Curriculum Selector Component
 * Dropdown to switch between curriculum systems (US, Edexcel, etc.)
 */

import React from 'react';
import { useCurriculum } from '../contexts/CurriculumContext';
import { CurriculumSystem } from '../types/curriculum';
import { isCurriculumImplemented } from '../config/curriculumConfigs';

// Curriculum options with display info and color coding
const CURRICULUM_OPTIONS: {
  value: CurriculumSystem;
  label: string;
  shortLabel: string;
  flag: string;
  color: string; // Tailwind color class for visual identification
  bgColor: string;
  borderColor: string;
  implemented: boolean;
}[] = [
  {
    value: 'US_COMMON_CORE_AP',
    label: 'US Common Core + AP',
    shortLabel: 'US',
    flag: '\u{1F1FA}\u{1F1F8}', // US flag emoji
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    implemented: true,
  },
  {
    value: 'EDEXCEL_INTERNATIONAL',
    label: 'Edexcel International',
    shortLabel: 'Edexcel',
    flag: '\u{1F310}', // Globe emoji
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    implemented: true,
  },
  {
    value: 'UK_NATIONAL_ALEVEL',
    label: 'UK National + A-Levels',
    shortLabel: 'UK',
    flag: '\u{1F1EC}\u{1F1E7}', // UK flag emoji
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    implemented: false,
  },
  {
    value: 'CAMBRIDGE_INTERNATIONAL',
    label: 'Cambridge International',
    shortLabel: 'Cambridge',
    flag: '\u{1F310}', // Globe emoji
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    implemented: false,
  },
];

// Export for use in other components
export { CURRICULUM_OPTIONS };

interface CurriculumSelectorProps {
  compact?: boolean;
  className?: string;
}

export function CurriculumSelector({ compact = false, className = '' }: CurriculumSelectorProps) {
  const { currentSystem, setSystem } = useCurriculum();

  const currentOption = CURRICULUM_OPTIONS.find((o) => o.value === currentSystem);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSystem = e.target.value as CurriculumSystem;
    if (isCurriculumImplemented(newSystem)) {
      setSystem(newSystem);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <select
          value={currentSystem}
          onChange={handleChange}
          className={`
            appearance-none border
            rounded-xl font-bold text-sm cursor-pointer
            focus:ring-2 focus:ring-offset-1 transition-all
            ${currentOption?.bgColor || 'bg-slate-50'}
            ${currentOption?.borderColor || 'border-slate-200'}
            ${currentOption?.color || 'text-slate-700'}
            hover:opacity-90
            ${compact ? 'pl-8 pr-8 py-1.5' : 'pl-10 pr-10 py-2'}
          `}
        >
          {CURRICULUM_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={!option.implemented}
            >
              {option.flag} {compact ? option.shortLabel : option.label}
              {!option.implemented ? ' (Coming Soon)' : ''}
            </option>
          ))}
        </select>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-base">
          {currentOption?.flag}
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-4 h-4 ${currentOption?.color || 'text-slate-400'}`}
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

export default CurriculumSelector;
