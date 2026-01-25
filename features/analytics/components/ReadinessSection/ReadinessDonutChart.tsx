/**
 * ReadinessDonutChart Component
 * Donut chart showing distribution of readiness levels
 */

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { ReadinessDistribution, ReadinessStatus } from '../../types';

interface ReadinessDonutChartProps {
  data: ReadinessDistribution;
  isLoading?: boolean;
  curriculumLabel?: string; // "Grade-Level" or "IGCSE"
  className?: string;
}

// Color configuration
const COLORS: Record<ReadinessStatus, string> = {
  ready: '#22C55E',       // Green
  approaching: '#F59E0B', // Amber
  'not-yet-ready': '#EF4444', // Red
};

const LIGHT_COLORS: Record<ReadinessStatus, string> = {
  ready: '#DCFCE7',
  approaching: '#FEF3C7',
  'not-yet-ready': '#FEE2E2',
};

export const ReadinessDonutChart: React.FC<ReadinessDonutChartProps> = ({
  data,
  isLoading = false,
  curriculumLabel = 'Grade-Level',
  className = '',
}) => {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    const total = data.ready + data.approaching + data.notYetReady;

    if (total === 0) {
      return [];
    }

    return [
      {
        name: 'On Track',
        value: data.ready,
        status: 'ready' as ReadinessStatus,
        percentage: Math.round((data.ready / total) * 100),
      },
      {
        name: 'Approaching',
        value: data.approaching,
        status: 'approaching' as ReadinessStatus,
        percentage: Math.round((data.approaching / total) * 100),
      },
      {
        name: 'Below Level',
        value: data.notYetReady,
        status: 'not-yet-ready' as ReadinessStatus,
        percentage: Math.round((data.notYetReady / total) * 100),
      },
    ].filter((item) => item.value > 0);
  }, [data]);

  const total = data.ready + data.approaching + data.notYetReady;
  const isEmpty = total === 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-100">
          <p className="font-bold text-slate-800">{item.name}</p>
          <p className="text-sm text-slate-600">
            {item.value} students ({item.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;

    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-slate-600">
              {entry.value}
            </span>
            <span className="text-sm text-slate-400">
              ({entry.payload?.value || 0})
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-48 h-48 rounded-full bg-slate-100 animate-pulse" />
          <div className="flex gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-16 h-4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-slate-600 mb-1">No Performance Data</h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Complete assessments to see performance distribution
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Chart title */}
      <div className="text-center mb-4">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
          Performance Distribution
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {total} students assessed
        </p>
      </div>

      {/* Donut chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.status]}
                  stroke={COLORS[entry.status]}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Center label overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-2rem' }}>
        <div className="text-center">
          <p className="text-3xl font-black text-slate-800">{total}</p>
          <p className="text-xs font-bold text-slate-400 uppercase">Students</p>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <ReadinessStatCard
          label="On Track"
          value={data.ready}
          percentage={total > 0 ? Math.round((data.ready / total) * 100) : 0}
          status="ready"
        />
        <ReadinessStatCard
          label="Approaching"
          value={data.approaching}
          percentage={total > 0 ? Math.round((data.approaching / total) * 100) : 0}
          status="approaching"
        />
        <ReadinessStatCard
          label="Below Level"
          value={data.notYetReady}
          percentage={total > 0 ? Math.round((data.notYetReady / total) * 100) : 0}
          status="not-yet-ready"
        />
      </div>
    </div>
  );
};

// Helper component for stat cards below the chart
interface ReadinessStatCardProps {
  label: string;
  value: number;
  percentage: number;
  status: ReadinessStatus;
}

const ReadinessStatCard: React.FC<ReadinessStatCardProps> = ({
  label,
  value,
  percentage,
  status,
}) => (
  <div
    className="p-3 rounded-xl text-center transition-transform hover:scale-105"
    style={{ backgroundColor: LIGHT_COLORS[status] }}
  >
    <p
      className="text-xl font-black"
      style={{ color: COLORS[status] }}
    >
      {value}
    </p>
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mt-0.5">
      {label}
    </p>
    <p className="text-xs font-bold text-slate-400">
      {percentage}%
    </p>
  </div>
);

export default ReadinessDonutChart;
