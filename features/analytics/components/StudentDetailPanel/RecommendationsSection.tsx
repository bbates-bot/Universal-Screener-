/**
 * RecommendationsSection Component
 * Displays actionable recommendations for the student
 */

import React from 'react';
import { GradeCategory, ReadinessStatus } from '../../types';

interface RecommendationsSectionProps {
  screenerStatus: GradeCategory;
  readinessStatus: ReadinessStatus | null;
  recommendations: string[];
  skillGapCount: number;
  isLoading?: boolean;
}

// Icon components for different recommendation types
const RecommendationIcon: React.FC<{ type: 'focus' | 'practice' | 'support' | 'advance' }> = ({ type }) => {
  switch (type) {
    case 'focus':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case 'practice':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case 'support':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'advance':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
  }
};

// Generate default recommendations based on status
const getDefaultRecommendations = (
  screenerStatus: GradeCategory,
  readinessStatus: ReadinessStatus | null,
  skillGapCount: number
): Array<{ text: string; type: 'focus' | 'practice' | 'support' | 'advance'; priority: 'high' | 'medium' | 'low' }> => {
  const recommendations: Array<{ text: string; type: 'focus' | 'practice' | 'support' | 'advance'; priority: 'high' | 'medium' | 'low' }> = [];

  if (screenerStatus === 'far-below') {
    recommendations.push({
      text: 'Provide intensive intervention with targeted small-group instruction',
      type: 'support',
      priority: 'high',
    });
    recommendations.push({
      text: 'Focus on foundational skill gaps before introducing grade-level content',
      type: 'focus',
      priority: 'high',
    });
  } else if (screenerStatus === 'below') {
    recommendations.push({
      text: 'Implement supplemental support during core instruction time',
      type: 'support',
      priority: 'medium',
    });
    recommendations.push({
      text: 'Use scaffolded practice to build toward grade-level expectations',
      type: 'practice',
      priority: 'medium',
    });
  } else if (screenerStatus === 'on-or-above') {
    recommendations.push({
      text: 'Provide enrichment opportunities and extension activities',
      type: 'advance',
      priority: 'low',
    });
    recommendations.push({
      text: 'Consider peer tutoring roles to reinforce mastery',
      type: 'practice',
      priority: 'low',
    });
  }

  if (readinessStatus === 'not-yet-ready' && skillGapCount > 0) {
    recommendations.push({
      text: `Address ${skillGapCount} identified prerequisite skill gap${skillGapCount > 1 ? 's' : ''} before course enrollment`,
      type: 'focus',
      priority: 'high',
    });
  } else if (readinessStatus === 'approaching') {
    recommendations.push({
      text: 'Provide just-in-time support for prerequisite skills during instruction',
      type: 'support',
      priority: 'medium',
    });
  }

  return recommendations;
};

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  screenerStatus,
  readinessStatus,
  recommendations: customRecommendations,
  skillGapCount,
  isLoading = false,
}) => {
  const defaultRecs = getDefaultRecommendations(screenerStatus, readinessStatus, skillGapCount);

  // Combine custom and default recommendations
  const allRecommendations = customRecommendations.length > 0
    ? customRecommendations.map((text) => ({ text, type: 'focus' as const, priority: 'medium' as const }))
    : defaultRecs;

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedRecommendations = [...allRecommendations].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  if (isLoading) {
    return (
      <div className="p-6 border-t border-slate-100 animate-pulse">
        <div className="h-5 w-36 bg-slate-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (sortedRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="p-6 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
        Recommendations
      </h3>

      <div className="space-y-3">
        {sortedRecommendations.map((rec, index) => {
          const priorityColors = {
            high: 'border-l-rose-500 bg-rose-50',
            medium: 'border-l-amber-500 bg-amber-50',
            low: 'border-l-emerald-500 bg-emerald-50',
          };

          const iconColors = {
            high: 'text-rose-600 bg-rose-100',
            medium: 'text-amber-600 bg-amber-100',
            low: 'text-emerald-600 bg-emerald-100',
          };

          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${priorityColors[rec.priority]}`}
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${iconColors[rec.priority]}`}>
                <RecommendationIcon type={rec.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">{rec.text}</p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">
                  {rec.priority} priority
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Create Action Plan
        </button>
        <button className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RecommendationsSection;
