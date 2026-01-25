/**
 * StudentDetailPanel Component
 * Slide-out panel showing detailed student information
 * Enhanced with accessibility features: focus trap, keyboard navigation
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { StudentHeader } from './StudentHeader';
import { ScreenerResults } from './ScreenerResults';
import { ReadinessDetails } from './ReadinessDetails';
import { RecommendationsSection } from './RecommendationsSection';
import { FocusTrap } from '../common';
import { GradeCategory, ReadinessStatus } from '../../types';

interface DomainResult {
  domain: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: GradeCategory;
}

interface SkillGap {
  code: string;
  standard: string;
  description: string;
  domain: string;
}

export interface StudentDetailData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  grade: string;
  gradeLabel: string;
  schoolName: string;
  screenerStatus: GradeCategory;
  readinessStatus: ReadinessStatus | null;
  screener: {
    subject: string;
    testDate: string;
    overallScore: number;
    maxScore: number;
    overallPercentage: number;
    domains: DomainResult[];
  } | null;
  readiness: {
    course: string;
    courseLabel: string;
    status: ReadinessStatus;
    score: number;
    assessmentDate: string;
    prerequisitesMet: number;
    prerequisitesTotal: number;
    gaps: SkillGap[];
  } | null;
  recommendations: string[];
}

interface StudentDetailPanelProps {
  student: StudentDetailData | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
}

export const StudentDetailPanel: React.FC<StudentDetailPanelProps> = ({
  student,
  isOpen,
  isLoading = false,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key to close panel
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle click outside to close panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    // Add delay to prevent immediate close on open
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="bg-indigo-600 p-6">
        <div className="flex justify-between mb-4">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg" />
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg" />
            <div className="w-8 h-8 bg-indigo-500 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl" />
          <div>
            <div className="h-6 w-40 bg-indigo-500 rounded mb-2" />
            <div className="h-4 w-24 bg-indigo-500 rounded" />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="h-8 w-24 bg-indigo-500 rounded-lg" />
          <div className="h-8 w-32 bg-indigo-500 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-indigo-500 rounded-xl" />
          <div className="h-16 bg-indigo-500 rounded-xl" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-6">
        <div className="h-5 w-32 bg-slate-200 rounded mb-4" />
        <div className="h-24 bg-slate-100 rounded-xl mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );

  // Build descriptive label for screen readers
  const panelLabel = student
    ? `Student details for ${student.firstName} ${student.lastName}`
    : 'Student details panel';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/30 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel with Focus Trap */}
      <FocusTrap active={isOpen} returnFocusOnDeactivate={true}>
        <div
          ref={panelRef}
          className={`
            fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50
            transform transition-transform duration-300 ease-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-detail-title"
          aria-describedby="student-detail-description"
          aria-label={panelLabel}
        >
          {/* Hidden description for screen readers */}
          <div id="student-detail-description" className="sr-only">
            {student
              ? `Viewing detailed information for ${student.firstName} ${student.lastName}, Grade ${student.grade} at ${student.schoolName}. Press Escape to close.`
              : 'Select a student to view their details. Press Escape to close.'}
          </div>

          <div className="h-full overflow-y-auto">
            {isLoading ? (
              <LoadingSkeleton />
            ) : student ? (
              <>
                {/* Header */}
                <StudentHeader
                  firstName={student.firstName}
                  lastName={student.lastName}
                  username={student.username}
                  grade={student.grade}
                  gradeLabel={student.gradeLabel}
                  schoolName={student.schoolName}
                  screenerStatus={student.screenerStatus}
                  readinessStatus={student.readinessStatus}
                  onClose={onClose}
                  closeButtonRef={closeButtonRef}
                />

              {/* Screener Results */}
              {student.screener && (
                <ScreenerResults
                  subject={student.screener.subject}
                  testDate={student.screener.testDate}
                  overallScore={student.screener.overallScore}
                  maxScore={student.screener.maxScore}
                  overallPercentage={student.screener.overallPercentage}
                  overallLevel={student.screenerStatus}
                  domains={student.screener.domains}
                />
              )}

              {/* No screener data state */}
              {!student.screener && (
                <div className="p-6">
                  <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
                    Screener Results
                  </h3>
                  <div className="text-center py-8 bg-slate-50 rounded-xl">
                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-bold text-slate-500">No Screener Data</p>
                    <p className="text-xs text-slate-400 mt-1">Student has not completed a screener assessment</p>
                  </div>
                </div>
              )}

              {/* Readiness Details */}
              {student.readiness && (
                <ReadinessDetails
                  course={student.readiness.course}
                  courseLabel={student.readiness.courseLabel}
                  status={student.readiness.status}
                  score={student.readiness.score}
                  assessmentDate={student.readiness.assessmentDate}
                  prerequisitesMet={student.readiness.prerequisitesMet}
                  prerequisitesTotal={student.readiness.prerequisitesTotal}
                  gaps={student.readiness.gaps}
                />
              )}

              {/* Recommendations */}
              <RecommendationsSection
                screenerStatus={student.screenerStatus}
                readinessStatus={student.readinessStatus}
                recommendations={student.recommendations}
                skillGapCount={student.readiness?.gaps.length || 0}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="font-bold text-slate-500">No Student Selected</p>
                <p className="text-sm text-slate-400 mt-1">Select a student to view details</p>
              </div>
            </div>
            )}
          </div>
        </div>
      </FocusTrap>
    </>
  );
};

export default StudentDetailPanel;
