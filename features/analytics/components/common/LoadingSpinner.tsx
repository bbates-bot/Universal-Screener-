/**
 * LoadingSpinner Component
 * Accessible loading indicator with screen reader support
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <div
        className={`
          ${sizeClasses[size]}
          border-slate-200 border-t-indigo-600
          rounded-full animate-spin
        `}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Full page loading overlay
interface LoadingOverlayProps {
  isVisible: boolean;
  label?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  label = 'Loading content...',
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
      role="alert"
      aria-busy="true"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" label={label} />
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
