/**
 * ReadinessSection Component
 * Container for readiness visualizations (donut chart + skill gaps bar chart)
 */

import React, { useMemo } from 'react';
import { CollapsibleSection } from '../../../../shared/components';
import { ReadinessDonutChart } from './ReadinessDonutChart';
import { SkillGapsChart } from './SkillGapsChart';
import { ReadinessDistribution, SkillGap } from '../../types';
import { CurriculumSystem } from '../../../../types/curriculum';

interface ReadinessSectionProps {
  readinessData: ReadinessDistribution;
  skillGapsData: SkillGap[];
  curriculum: CurriculumSystem;
  isLoading?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  className?: string;
}

export const ReadinessSection: React.FC<ReadinessSectionProps> = ({
  readinessData,
  skillGapsData,
  curriculum,
  isLoading = false,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  // Get curriculum-specific label - now uses grade-level performance terminology
  const curriculumLabel = useMemo(() => {
    switch (curriculum) {
      case 'EDEXCEL_INTERNATIONAL':
        return 'IGCSE';
      case 'US_COMMON_CORE_AP':
      default:
        return 'Grade-Level';
    }
  }, [curriculum]);

  // Calculate quick stats for header
  const quickStats = useMemo(() => {
    const total = readinessData.ready + readinessData.approaching + readinessData.notYetReady;

    if (total === 0) {
      return null;
    }

    const readyPercentage = Math.round((readinessData.ready / total) * 100);
    const approachingPercentage = Math.round((readinessData.approaching / total) * 100);

    return {
      total,
      readyPercentage,
      approachingPercentage,
      onTrackPercentage: readyPercentage + approachingPercentage,
    };
  }, [readinessData]);

  // Header right content - quick stats summary
  const headerRight = quickStats && (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="font-bold text-emerald-700">{quickStats.readyPercentage}%</span>
        <span className="text-emerald-600 text-xs">On Track</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="font-bold text-amber-700">{quickStats.approachingPercentage}%</span>
        <span className="text-amber-600 text-xs">Approaching</span>
      </div>
    </div>
  );

  return (
    <CollapsibleSection
      title="Performance Analytics"
      subtitle="Student performance distribution and skill gap analysis"
      defaultExpanded={!isCollapsed}
      isExpanded={!isCollapsed}
      onToggle={(expanded) => onToggleCollapse?.(!expanded)}
      headerRight={headerRight}
      className={className}
    >
      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donut chart - Readiness Distribution */}
        <div className="relative">
          <ReadinessDonutChart
            data={readinessData}
            isLoading={isLoading}
            curriculumLabel={curriculumLabel}
          />
        </div>

        {/* Bar chart - Skill Gaps */}
        <div>
          <SkillGapsChart
            data={skillGapsData}
            isLoading={isLoading}
            maxItems={6}
            sortOrder="descending"
          />
        </div>
      </div>

      {/* Insights section */}
      {!isLoading && quickStats && (
        <ReadinessInsights
          readinessData={readinessData}
          skillGapsData={skillGapsData}
          curriculumLabel={curriculumLabel}
        />
      )}
    </CollapsibleSection>
  );
};

// Insights component showing correlation between screener and readiness
interface ReadinessInsightsProps {
  readinessData: ReadinessDistribution;
  skillGapsData: SkillGap[];
  curriculumLabel: string;
}

const ReadinessInsights: React.FC<ReadinessInsightsProps> = ({
  readinessData,
  skillGapsData,
  curriculumLabel,
}) => {
  const total = readinessData.ready + readinessData.approaching + readinessData.notYetReady;

  if (total === 0) return null;

  const criticalGaps = skillGapsData.filter((g) => g.percentage >= 70);
  const significantGaps = skillGapsData.filter((g) => g.percentage >= 50 && g.percentage < 70);

  const readyPercentage = Math.round((readinessData.ready / total) * 100);
  const notReadyPercentage = Math.round((readinessData.notYetReady / total) * 100);

  return (
    <div className="mt-8 pt-6 border-t border-slate-100">
      <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
        Key Insights
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Performance insight */}
        <InsightCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconColor={readyPercentage >= 50 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}
          title={`${readyPercentage}% On Grade Level`}
          description={
            readyPercentage >= 70
              ? 'Strong foundation across the selected cohort'
              : readyPercentage >= 50
              ? 'Majority of students are meeting grade-level expectations'
              : 'Additional support may be needed for this group'
          }
        />

        {/* Critical gaps insight */}
        {criticalGaps.length > 0 && (
          <InsightCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            iconColor="text-rose-600 bg-rose-50"
            title={`${criticalGaps.length} Critical Skill Gap${criticalGaps.length > 1 ? 's' : ''}`}
            description={`Focus on: ${criticalGaps.slice(0, 2).map((g) => g.domain).join(', ')}${criticalGaps.length > 2 ? '...' : ''}`}
          />
        )}

        {/* Intervention recommendation */}
        {notReadyPercentage > 30 && (
          <InsightCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            iconColor="text-indigo-600 bg-indigo-50"
            title="Intervention Recommended"
            description={`${notReadyPercentage}% of students are below grade level and need targeted support`}
          />
        )}

        {/* Positive message when doing well */}
        {notReadyPercentage <= 30 && criticalGaps.length === 0 && (
          <InsightCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconColor="text-emerald-600 bg-emerald-50"
            title="Strong Performance"
            description="Most students are meeting or exceeding grade-level expectations"
          />
        )}
      </div>
    </div>
  );
};

// Insight card component
interface InsightCardProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
}

const InsightCard: React.FC<InsightCardProps> = ({
  icon,
  iconColor,
  title,
  description,
}) => (
  <div className="flex gap-3 p-4 bg-slate-50 rounded-xl">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
      {icon}
    </div>
    <div>
      <h5 className="font-bold text-slate-800 text-sm">{title}</h5>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
  </div>
);

export default ReadinessSection;
