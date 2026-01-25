/**
 * StudentRow Component
 * Individual row in the student table with status badges
 * Enhanced with keyboard navigation support
 */

import React, { useEffect, useRef } from 'react';
import { GradeCategory, ReadinessStatus } from '../../types';

interface StudentRowData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  grade: string;
  gradeLabel: string;
  schoolName: string;
  screenerStatus: GradeCategory;
  readinessStatus: ReadinessStatus | null;
  lastAssessmentDate: string | null;
}

interface StudentRowProps {
  student: StudentRowData;
  onClick: (studentId: string) => void;
  isSelected?: boolean;
  isFocused?: boolean;
  rowIndex?: number;
  onFocus?: () => void;
  className?: string;
}

// Status badge component
const StatusBadge: React.FC<{
  status: GradeCategory;
  size?: 'sm' | 'md';
}> = ({ status, size = 'md' }) => {
  const config = {
    'on-or-above': {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'On/Above Grade',
    },
    'below': {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      label: 'Below Grade',
    },
    'far-below': {
      bg: 'bg-rose-100',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
      label: 'Far Below',
    },
    'non-applicable': {
      bg: 'bg-slate-100',
      text: 'text-slate-500',
      dot: 'bg-slate-400',
      label: 'Not Assessed',
    },
  };

  const { bg, text, dot, label } = config[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses} ${bg} ${text} rounded-full font-bold`}
    >
      <span className={`w-1.5 h-1.5 ${dot} rounded-full`} />
      {label}
    </span>
  );
};

// Readiness indicator
const ReadinessIndicator: React.FC<{
  status: ReadinessStatus | null;
}> = ({ status }) => {
  if (!status) {
    return <span className="text-xs text-slate-400">-</span>;
  }

  const config = {
    'ready': {
      bg: 'bg-emerald-500',
      label: 'Ready',
    },
    'approaching': {
      bg: 'bg-amber-500',
      label: 'Approaching',
    },
    'not-yet-ready': {
      bg: 'bg-rose-500',
      label: 'Not Ready',
    },
  };

  const { bg, label } = config[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 ${bg} rounded-full`} />
      <span className="text-xs font-medium text-slate-600">{label}</span>
    </div>
  );
};

export const StudentRow: React.FC<StudentRowProps> = ({
  student,
  onClick,
  isSelected = false,
  isFocused = false,
  rowIndex = 0,
  onFocus,
  className = '',
}) => {
  const rowRef = useRef<HTMLTableRowElement>(null);

  // Focus the row when isFocused changes
  useEffect(() => {
    if (isFocused && rowRef.current) {
      rowRef.current.focus();
    }
  }, [isFocused]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';

    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Build accessible label for the row
  const rowLabel = `${student.firstName} ${student.lastName}, ${student.gradeLabel}, ${student.schoolName}, Screener: ${student.screenerStatus.replace('-', ' ')}, Readiness: ${student.readinessStatus || 'Not assessed'}`;

  return (
    <tr
      ref={rowRef}
      onClick={() => onClick(student.id)}
      onFocus={onFocus}
      tabIndex={isFocused ? 0 : -1}
      role="row"
      aria-rowindex={rowIndex + 2} // +2 for header row and 1-based index
      aria-selected={isSelected}
      aria-label={rowLabel}
      className={`
        cursor-pointer transition-colors outline-none
        ${isSelected
          ? 'bg-indigo-50 hover:bg-indigo-100'
          : 'hover:bg-slate-50'
        }
        ${isFocused
          ? 'ring-2 ring-inset ring-indigo-500'
          : ''
        }
        ${className}
      `}
    >
      {/* Student name & avatar */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm
              ${isSelected
                ? 'bg-indigo-200 text-indigo-700'
                : 'bg-indigo-100 text-indigo-600'
              }
            `}
          >
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-xs text-slate-400">@{student.username}</p>
          </div>
        </div>
      </td>

      {/* Grade */}
      <td className="px-4 py-3">
        <span className="text-sm font-medium text-slate-600">
          {student.gradeLabel}
        </span>
      </td>

      {/* School */}
      <td className="px-4 py-3">
        <span className="text-sm text-slate-600 truncate block max-w-[150px]">
          {student.schoolName}
        </span>
      </td>

      {/* Screener Status */}
      <td className="px-4 py-3">
        <StatusBadge status={student.screenerStatus} />
      </td>

      {/* Readiness */}
      <td className="px-4 py-3">
        <ReadinessIndicator status={student.readinessStatus} />
      </td>

      {/* Last Assessment */}
      <td className="px-4 py-3">
        <span className="text-sm text-slate-500">
          {formatDate(student.lastAssessmentDate)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3" role="gridcell">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(student.id);
          }}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          aria-label={`View details for ${student.firstName} ${student.lastName}`}
          type="button"
          tabIndex={-1} // Only focusable via row navigation
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
};

export default StudentRow;
export { StatusBadge, ReadinessIndicator };
