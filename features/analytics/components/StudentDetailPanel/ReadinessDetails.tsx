/**
 * ReadinessDetails Component
 * Displays readiness information with prerequisite skill gaps
 */

import React from 'react';
import { ReadinessStatus } from '../../types';

interface SkillGap {
  code: string;
  standard: string;
  description: string;
  domain: string;
}

interface MasteredStandard {
  code: string;
  name: string;
}

interface ReadinessDetailsProps {
  course: string;
  courseLabel: string;
  status: ReadinessStatus;
  score: number;
  assessmentDate: string;
  prerequisitesMet: number;
  prerequisitesTotal: number;
  gaps: SkillGap[];
  masteredStandards?: MasteredStandard[];
  isLoading?: boolean;
}

// Determine if this is a grade-level assessment (e.g., "Grade 7 Performance") vs AP/IGCSE readiness
const isGradeLevelAssessment = (courseLabel: string) => {
  return courseLabel.startsWith('Grade');
};

// Status labels that adapt based on whether this is grade-level or readiness assessment
const getStatusConfig = (courseLabel: string): Record<ReadinessStatus, { color: string; bg: string; lightBg: string; label: string; description: string }> => {
  const isGradeLevel = isGradeLevelAssessment(courseLabel);

  return {
    'ready': {
      color: 'text-emerald-600',
      bg: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
      label: isGradeLevel ? 'On Track' : 'Ready',
      description: isGradeLevel
        ? `Student is performing at or above ${courseLabel} expectations`
        : 'Student has demonstrated mastery of prerequisite skills',
    },
    'approaching': {
      color: 'text-amber-600',
      bg: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      label: isGradeLevel ? 'Approaching' : 'Approaching',
      description: isGradeLevel
        ? `Student is approaching ${courseLabel} expectations`
        : 'Student is close but needs support in some areas',
    },
    'not-yet-ready': {
      color: 'text-rose-600',
      bg: 'bg-rose-500',
      lightBg: 'bg-rose-50',
      label: isGradeLevel ? 'Below Level' : 'Not Yet Ready',
      description: isGradeLevel
        ? `Student is below ${courseLabel} expectations and needs intervention`
        : 'Student needs significant support before starting',
    },
  };
};

export const ReadinessDetails: React.FC<ReadinessDetailsProps> = ({
  course,
  courseLabel,
  status,
  score,
  assessmentDate,
  prerequisitesMet,
  prerequisitesTotal,
  gaps,
  masteredStandards = [],
  isLoading = false,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusConfig = getStatusConfig(courseLabel);
  const statusInfo = statusConfig[status];
  const completionPercentage = Math.round((prerequisitesMet / prerequisitesTotal) * 100);
  const isGradeLevel = isGradeLevelAssessment(courseLabel);

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
        <div className="h-24 bg-slate-100 rounded-xl mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border-t border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
          {isGradeLevel ? `${courseLabel} Performance` : `${courseLabel} Readiness`}
        </h3>
        <span className="text-xs text-slate-400">{formatDate(assessmentDate)}</span>
      </div>

      {/* Status card */}
      <div className={`rounded-xl p-4 mb-6 ${statusInfo.lightBg}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${statusInfo.bg} flex items-center justify-center`}>
              {status === 'ready' && (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {status === 'approaching' && (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              {status === 'not-yet-ready' && (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div>
              <p className={`font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
              <p className="text-xs text-slate-500">{statusInfo.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-800">{score}%</p>
            <p className="text-xs text-slate-500">{isGradeLevel ? 'Performance Score' : 'Readiness Score'}</p>
          </div>
        </div>

        {/* Prerequisites/Standards progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-600">{isGradeLevel ? 'Standards Mastered' : 'Prerequisites Met'}</span>
            <span className="font-bold text-slate-700">
              {prerequisitesMet} of {prerequisitesTotal} ({completionPercentage}%)
            </span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${statusInfo.bg}`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Skill gaps */}
      {gaps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Skill Gaps ({gaps.length})
            </p>
          </div>

          <div className="space-y-2">
            {gaps.map((gap, index) => (
              <div
                key={index}
                className="bg-rose-50 border border-rose-100 rounded-lg p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 bg-rose-200 text-rose-700 text-[10px] font-bold rounded">
                        {gap.code}
                      </span>
                      <span className="text-xs text-slate-500">{gap.domain}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700">{gap.standard}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{gap.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gaps.length === 0 && (
        <div className="text-center py-6 bg-emerald-50 rounded-xl">
          <svg className="w-10 h-10 text-emerald-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-bold text-emerald-700">
            {isGradeLevel ? 'Meeting Grade-Level Standards' : 'No Skill Gaps Identified'}
          </p>
          <p className="text-xs text-emerald-600">
            {isGradeLevel
              ? `Student is on track for ${courseLabel} expectations`
              : 'Student has met all prerequisite requirements'}
          </p>
        </div>
      )}

      {/* Mastered Standards List */}
      {masteredStandards.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Standards Met ({masteredStandards.length})
            </p>
          </div>

          <div className="space-y-2">
            {masteredStandards.map((standard, index) => (
              <div
                key={index}
                className="bg-emerald-50 border border-emerald-100 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-700 text-[10px] font-bold rounded shrink-0">
                    {standard.code}
                  </span>
                  <p className="text-sm font-medium text-slate-700">{standard.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadinessDetails;
