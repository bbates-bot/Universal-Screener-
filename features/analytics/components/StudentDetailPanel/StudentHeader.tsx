/**
 * StudentHeader Component
 * Header section of the student detail panel with avatar and basic info
 */

import React from 'react';
import { GradeCategory, ReadinessStatus } from '../../types';

interface StudentHeaderProps {
  firstName: string;
  lastName: string;
  username: string;
  grade: string;
  gradeLabel: string;
  schoolName: string;
  screenerStatus: GradeCategory;
  readinessStatus: ReadinessStatus | null;
  onClose: () => void;
  closeButtonRef?: React.RefObject<HTMLButtonElement>;
}

// Status configuration
const statusConfig: Record<GradeCategory, { bg: string; text: string; label: string }> = {
  'on-or-above': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'On/Above Grade Level' },
  'below': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Below Grade Level' },
  'far-below': { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Far Below Grade Level' },
  'non-applicable': { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Not Yet Assessed' },
};

const readinessConfig: Record<ReadinessStatus, { bg: string; text: string; label: string }> = {
  'ready': { bg: 'bg-emerald-500', text: 'text-emerald-700', label: 'Ready' },
  'approaching': { bg: 'bg-amber-500', text: 'text-amber-700', label: 'Approaching' },
  'not-yet-ready': { bg: 'bg-rose-500', text: 'text-rose-700', label: 'Not Yet Ready' },
};

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  firstName,
  lastName,
  username,
  grade,
  gradeLabel,
  schoolName,
  screenerStatus,
  readinessStatus,
  onClose,
  closeButtonRef,
}) => {
  const status = statusConfig[screenerStatus];
  const readiness = readinessStatus ? readinessConfig[readinessStatus] : null;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6">
      {/* Close button */}
      <div className="flex justify-between items-start mb-4">
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors -ml-2 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-indigo-600"
          aria-label={`Close panel for ${firstName} ${lastName}`}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Quick actions */}
        <div className="flex items-center gap-2" role="toolbar" aria-label="Student actions">
          <button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-indigo-600"
            aria-label="Print student report"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-indigo-600"
            aria-label="More options for student"
            type="button"
            aria-haspopup="menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Avatar and name */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-black"
          aria-hidden="true"
        >
          {firstName[0]}{lastName[0]}
        </div>
        <div>
          <h2 id="student-detail-title" className="text-2xl font-black">
            {firstName} {lastName}
          </h2>
          <p className="text-indigo-200" aria-label={`Username: ${username}`}>@{username}</p>
        </div>
      </div>

      {/* Quick info badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {gradeLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {schoolName}
        </span>
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-xl ${status.bg}`}>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Screener Status
          </p>
          <p className={`font-bold ${status.text}`}>{status.label}</p>
        </div>

        {readiness ? (
          <div className="p-3 rounded-xl bg-white/90">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Readiness
            </p>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${readiness.bg}`} />
              <span className={`font-bold ${readiness.text}`}>{readiness.label}</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-white/90">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Readiness
            </p>
            <p className="font-bold text-slate-400">Not Assessed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHeader;
