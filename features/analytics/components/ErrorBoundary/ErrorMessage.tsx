/**
 * ErrorMessage Component
 * Displays error messages with retry option
 */

import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error loading data',
  message = 'Something went wrong. Please try again.',
  error,
  onRetry,
  showDetails = false,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-4 px-4',
      icon: 'w-8 h-8',
      iconInner: 'w-4 h-4',
      title: 'text-sm',
      message: 'text-xs',
      button: 'px-3 py-1.5 text-xs',
    },
    md: {
      container: 'py-8 px-6',
      icon: 'w-12 h-12',
      iconInner: 'w-6 h-6',
      title: 'text-base',
      message: 'text-sm',
      button: 'px-4 py-2 text-sm',
    },
    lg: {
      container: 'py-12 px-8',
      icon: 'w-16 h-16',
      iconInner: 'w-8 h-8',
      title: 'text-lg',
      message: 'text-base',
      button: 'px-6 py-2.5 text-base',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`text-center ${sizes.container} ${className}`}>
      {/* Icon */}
      <div
        className={`${sizes.icon} bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4`}
      >
        <svg
          className={`${sizes.iconInner} text-rose-500`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className={`font-bold text-slate-700 mb-1 ${sizes.title}`}>{title}</h3>

      {/* Message */}
      <p className={`text-slate-500 mb-4 ${sizes.message}`}>{message}</p>

      {/* Error details */}
      {showDetails && error && (
        <div className="mb-4 p-3 bg-slate-100 rounded-lg text-left max-w-md mx-auto">
          <p className="text-xs font-mono text-slate-600 break-all">
            {error.message}
          </p>
        </div>
      )}

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className={`${sizes.button} bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-2`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
