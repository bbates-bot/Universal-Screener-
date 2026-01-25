/**
 * MetricCard Component
 * Individual metric card for summary section
 * Supports different color variants and click-to-filter functionality
 */

import React from 'react';
import { MetricType } from '../../types';

interface MetricCardProps {
  label: string;
  value: number;
  type: MetricType;
  isActive: boolean;
  onClick: () => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

// Color configurations for each metric type
const colorConfigs: Record<MetricType, {
  bg: string;
  bgActive: string;
  text: string;
  border: string;
  iconBg: string;
}> = {
  total: {
    bg: 'bg-slate-50',
    bgActive: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    iconBg: 'bg-slate-200',
  },
  onOrAbove: {
    bg: 'bg-emerald-50',
    bgActive: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-200',
  },
  below: {
    bg: 'bg-amber-50',
    bgActive: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    iconBg: 'bg-amber-200',
  },
  farBelow: {
    bg: 'bg-rose-50',
    bgActive: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
    iconBg: 'bg-rose-200',
  },
  nonApplicable: {
    bg: 'bg-slate-50',
    bgActive: 'bg-slate-100',
    text: 'text-slate-500',
    border: 'border-slate-200',
    iconBg: 'bg-slate-200',
  },
};

// Icons for each metric type
const metricIcons: Record<MetricType, React.ReactNode> = {
  total: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  onOrAbove: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  below: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  farBelow: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  nonApplicable: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  type,
  isActive,
  onClick,
  isLoading = false,
  icon,
  trend,
}) => {
  const colors = colorConfigs[type];
  const defaultIcon = metricIcons[type];

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className={`
          p-5 rounded-2xl border-2 ${colors.border} ${colors.bg}
          animate-pulse
        `}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-8 w-16 bg-slate-200 rounded" />
          </div>
          <div className={`w-10 h-10 rounded-xl ${colors.iconBg}`} />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-5 rounded-2xl border-2 text-left transition-all duration-200
        ${colors.border}
        ${isActive ? colors.bgActive : colors.bg}
        ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2 shadow-lg' : 'hover:shadow-md hover:scale-[1.02]'}
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        group
      `}
      aria-pressed={isActive}
      aria-label={`${label}: ${value}${isActive ? ' (currently filtering)' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {/* Label */}
          <p className={`text-xs font-bold uppercase tracking-wider ${colors.text} opacity-70`}>
            {label}
          </p>

          {/* Value */}
          <p className={`text-3xl font-black ${colors.text}`}>
            {value.toLocaleString()}
          </p>

          {/* Trend indicator (optional) */}
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              {trend.direction === 'up' && (
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trend.direction === 'down' && (
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className={`text-xs font-bold ${
                trend.direction === 'up' ? 'text-emerald-600' :
                trend.direction === 'down' ? 'text-rose-600' :
                'text-slate-500'
              }`}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}

          {/* Active indicator */}
          {isActive && (
            <p className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${colors.text} flex items-center gap-1`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Filtering
            </p>
          )}
        </div>

        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-xl ${colors.iconBg} ${colors.text}
          flex items-center justify-center
          group-hover:scale-110 transition-transform
        `}>
          {icon || defaultIcon}
        </div>
      </div>
    </button>
  );
};

export default MetricCard;
