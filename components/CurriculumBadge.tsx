/**
 * Curriculum Badge Component
 * Visual indicator showing which curriculum system a student/result belongs to
 */

import React from 'react';
import { CurriculumSystem } from '../types/curriculum';

interface CurriculumBadgeProps {
  curriculum: CurriculumSystem;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const CURRICULUM_STYLES: Record<
  CurriculumSystem,
  {
    flag: string;
    label: string;
    shortLabel: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  US_COMMON_CORE_AP: {
    flag: '\u{1F1FA}\u{1F1F8}',
    label: 'US Common Core',
    shortLabel: 'US',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  EDEXCEL_INTERNATIONAL: {
    flag: '\u{1F310}',
    label: 'Edexcel IGCSE',
    shortLabel: 'Edexcel',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  UK_NATIONAL_ALEVEL: {
    flag: '\u{1F1EC}\u{1F1E7}',
    label: 'UK National',
    shortLabel: 'UK',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  CAMBRIDGE_INTERNATIONAL: {
    flag: '\u{1F310}',
    label: 'Cambridge',
    shortLabel: 'Cambridge',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
  },
};

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function CurriculumBadge({
  curriculum,
  size = 'sm',
  showLabel = true,
  className = '',
}: CurriculumBadgeProps) {
  const style = CURRICULUM_STYLES[curriculum];

  if (!style) return null;

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-bold rounded-lg border
        ${style.bgColor} ${style.textColor} ${style.borderColor}
        ${SIZE_CLASSES[size]}
        ${className}
      `}
      title={style.label}
    >
      <span>{style.flag}</span>
      {showLabel && <span>{size === 'sm' ? style.shortLabel : style.label}</span>}
    </span>
  );
}

/**
 * Helper to get curriculum from subject name
 */
export function getCurriculumFromSubject(subject: string): CurriculumSystem {
  if (subject.toLowerCase().includes('edexcel')) {
    return 'EDEXCEL_INTERNATIONAL';
  }
  return 'US_COMMON_CORE_AP';
}

export default CurriculumBadge;
