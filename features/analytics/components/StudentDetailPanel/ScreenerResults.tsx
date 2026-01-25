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
  overallScore,
  maxScore,
  overallPercentage,
  overallLevel,
  domains,
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
            <p className="text-3xl font-black text-slate-800">{overallPercentage}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">
              {overallScore} / {maxScore}
            </p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${levelConfig[overallLevel].color} ${levelConfig[overallLevel].bg.replace('bg-', 'bg-opacity-20 bg-')}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${level.bg}`} />
              {level.label}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${level.bg}`}
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Domain breakdown */}
      <div className="space-y-3">
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
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-600">
                    {domain.percentage}%
                  </span>
                  <span className={`w-2 h-2 rounded-full ${domainLevel.bg}`} />
                </div>
              </div>

              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${domainLevel.bg}`}
                  style={{ width: `${domain.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScreenerResults;
