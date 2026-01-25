/**
 * SkillGapsChart Component
 * Horizontal bar chart showing prerequisite skill gaps by domain
 */

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { SkillGap } from '../../types';

interface SkillGapsChartProps {
  data: SkillGap[];
  isLoading?: boolean;
  maxItems?: number;
  sortOrder?: 'ascending' | 'descending';
  className?: string;
}

// Color based on gap severity
const getBarColor = (percentage: number): string => {
  if (percentage >= 70) return '#EF4444'; // Red - critical gap
  if (percentage >= 50) return '#F59E0B'; // Amber - significant gap
  if (percentage >= 30) return '#6366F1'; // Indigo - moderate gap
  return '#22C55E'; // Green - minor gap
};

const getBarBackground = (percentage: number): string => {
  if (percentage >= 70) return '#FEE2E2';
  if (percentage >= 50) return '#FEF3C7';
  if (percentage >= 30) return '#EEF2FF';
  return '#DCFCE7';
};

export const SkillGapsChart: React.FC<SkillGapsChartProps> = ({
  data,
  isLoading = false,
  maxItems = 8,
  sortOrder = 'descending',
  className = '',
}) => {
  // Sort and limit data
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (sortOrder === 'descending') {
        return b.percentage - a.percentage;
      }
      return a.percentage - b.percentage;
    });

    return sorted.slice(0, maxItems).map((item) => ({
      ...item,
      // Truncate long domain names for display
      displayName: item.domain.length > 25
        ? item.domain.substring(0, 22) + '...'
        : item.domain,
      fill: getBarColor(item.percentage),
    }));
  }, [data, maxItems, sortOrder]);

  const isEmpty = data.length === 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as SkillGap;
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-100 max-w-xs">
          <p className="font-bold text-slate-800">{item.domain}</p>
          <p className="text-sm text-slate-600 mt-1">{item.description}</p>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
            <span
              className="text-lg font-black"
              style={{ color: getBarColor(item.percentage) }}
            >
              {item.percentage}%
            </span>
            <span className="text-xs text-slate-400">
              ({item.studentCount} students with gaps)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
              <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-200 rounded-full animate-pulse"
                  style={{ width: `${70 - i * 10}%` }}
                />
              </div>
              <div className="w-12 h-4 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-slate-600 mb-1">No Skill Gaps Identified</h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Complete assessments to identify prerequisite skill gaps
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Chart title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
            Skill Gaps by Domain
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Showing top {Math.min(maxItems, data.length)} areas needing attention
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Significant
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Moderate
          </span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 50, left: 0, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              width={130}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
            <Bar
              dataKey="percentage"
              radius={[0, 6, 6, 0]}
              barSize={24}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                />
              ))}
              <LabelList
                dataKey="percentage"
                position="right"
                formatter={(value: number) => `${value}%`}
                style={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Show more link if there are more items */}
      {data.length > maxItems && (
        <div className="text-center mt-4">
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mx-auto">
            View all {data.length} skill gaps
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillGapsChart;
