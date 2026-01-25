/**
 * SummaryMetrics Component
 * Container for all metric cards in the analytics dashboard
 * Displays aggregate student performance data
 */

import React from 'react';
import { MetricCard } from './MetricCard';
import { SummaryData, MetricType } from '../../types';

interface SummaryMetricsProps {
  data: SummaryData;
  isLoading?: boolean;
  onMetricClick: (metric: MetricType | null) => void;
  activeMetric: MetricType | null;
  className?: string;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({
  data,
  isLoading = false,
  onMetricClick,
  activeMetric,
  className = '',
}) => {
  // Handle metric click - toggle if already active
  const handleMetricClick = (metric: MetricType) => {
    if (activeMetric === metric) {
      onMetricClick(null); // Deselect
    } else {
      onMetricClick(metric); // Select
    }
  };

  // Calculate percentages for display
  const getPercentage = (value: number): number => {
    if (data.total === 0) return 0;
    return Math.round((value / data.total) * 100);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800">Performance Overview</h2>
          <p className="text-sm text-slate-500">
            Click a metric to filter the student list below
          </p>
        </div>

        {/* Quick stats */}
        {!isLoading && data.total > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">
                <span className="font-bold text-emerald-700">{getPercentage(data.onOrAboveGrade)}%</span> on track
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-600">
                <span className="font-bold text-amber-700">{getPercentage(data.belowGrade)}%</span> need support
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Students"
          value={data.total}
          type="total"
          isActive={activeMetric === 'total'}
          onClick={() => handleMetricClick('total')}
          isLoading={isLoading}
        />

        <MetricCard
          label="On/Above Grade"
          value={data.onOrAboveGrade}
          type="onOrAbove"
          isActive={activeMetric === 'onOrAbove'}
          onClick={() => handleMetricClick('onOrAbove')}
          isLoading={isLoading}
        />

        <MetricCard
          label="Below Grade"
          value={data.belowGrade}
          type="below"
          isActive={activeMetric === 'below'}
          onClick={() => handleMetricClick('below')}
          isLoading={isLoading}
        />

        <MetricCard
          label="Far Below Grade"
          value={data.farBelowGrade}
          type="farBelow"
          isActive={activeMetric === 'farBelow'}
          onClick={() => handleMetricClick('farBelow')}
          isLoading={isLoading}
        />

        <MetricCard
          label="Not Assessed"
          value={data.nonApplicable}
          type="nonApplicable"
          isActive={activeMetric === 'nonApplicable'}
          onClick={() => handleMetricClick('nonApplicable')}
          isLoading={isLoading}
        />
      </div>

      {/* Empty state */}
      {!isLoading && data.total === 0 && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
          <svg
            className="w-12 h-12 mx-auto text-slate-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="font-bold text-slate-600 mb-1">No Students Found</h3>
          <p className="text-sm text-slate-400">
            Try adjusting your filters to see student data
          </p>
        </div>
      )}

      {/* Active filter indicator */}
      {activeMetric && !isLoading && (
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-medium text-indigo-700">
              Showing students: <span className="font-bold">{getMetricLabel(activeMetric)}</span>
            </span>
          </div>
          <button
            onClick={() => onMetricClick(null)}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Clear filter
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to get human-readable label for metric type
function getMetricLabel(metric: MetricType): string {
  switch (metric) {
    case 'total':
      return 'All Students';
    case 'onOrAbove':
      return 'On or Above Grade Level';
    case 'below':
      return 'Below Grade Level';
    case 'farBelow':
      return 'Far Below Grade Level';
    case 'nonApplicable':
      return 'Not Yet Assessed';
    default:
      return metric;
  }
}

export default SummaryMetrics;
