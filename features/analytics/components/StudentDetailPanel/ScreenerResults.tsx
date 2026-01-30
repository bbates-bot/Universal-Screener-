/**
 * ScreenerResults Component
 * Displays screener test results with domain breakdown
 */

import React from 'react';
import { GradeCategory } from '../../types';

interface DomainResult {
  domain: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: GradeCategory;
}

interface ScreenerResultsProps {
  subject: string;
  testDate: string;
  overallScore: number;
  maxScore: number;
  overallPercentage: number;
  overallLevel: GradeCategory;
  domains: DomainResult[];
  masteredStandards?: string[];
  gapStandards?: string[];
  hideStandards?: boolean;
  isLoading?: boolean;
}

const levelConfig: Record<GradeCategory, { color: string; bg: string; label: string }> = {
  'on-or-above': { color: 'text-emerald-600', bg: 'bg-emerald-500', label: 'On/Above' },
  'below': { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Below' },
  'far-below': { color: 'text-rose-600', bg: 'bg-rose-500', label: 'Far Below' },
  'non-applicable': { color: 'text-slate-400', bg: 'bg-slate-300', label: 'N/A' },
};

export const ScreenerResults: React.FC<ScreenerResultsProps> = ({
  subject,
  testDate,
  overallPercentage,
  overallLevel,
  domains,
  masteredStandards = [],
  gapStandards = [],
  hideStandards = false,
  isLoading = false,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const level = levelConfig[overallLevel];

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-5 w-32 bg-slate-200 rounded mb-4" />
        <div className="h-20 bg-slate-100 rounded-xl mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
          Screener Results
        </h3>
        <span className="text-xs text-slate-400">{formatDate(testDate)}</span>
      </div>

      {/* Overall score card */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 font-medium">{subject}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${levelConfig[overallLevel].color} ${levelConfig[overallLevel].bg.replace('bg-', 'bg-opacity-20 bg-')}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${level.bg}`} />
            {level.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${level.bg}`}
            style={{ width: `${Math.min(overallPercentage || 0, 100)}%` }}
          />
        </div>
      </div>

      {/* Domain breakdown */}
      {domains.length > 0 && (
        <div className="space-y-3 mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Domain Breakdown
          </p>

          {domains.map((domain, index) => {
            const domainLevel = levelConfig[domain.level];

            return (
              <div
                key={index}
                className="bg-slate-50 rounded-lg p-3 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-700 text-sm">{domain.domain}</span>
                  <span className={`w-2 h-2 rounded-full ${domainLevel.bg}`} />
                </div>

                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${domainLevel.bg}`}
                    style={{ width: `${domain.percentage || 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Standards Being Met */}
      {!hideStandards && masteredStandards.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Standards Being Met
          </p>
          <div className="space-y-2">
            {masteredStandards.map((standard, index) => (
              <div
                key={index}
                className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-sm text-emerald-800"
              >
                {standard}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Gaps */}
      {!hideStandards && gapStandards.length > 0 && (
        <div className="space-y-3 mt-6">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Learning Gaps
          </p>
          <div className="space-y-2">
            {gapStandards.map((standard, index) => (
              <div
                key={index}
                className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 text-sm text-rose-800"
              >
                {standard}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenerResults;
