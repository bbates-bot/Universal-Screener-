/**
 * CollapsibleSection Component
 * Reusable expand/collapse wrapper for dashboard sections
 */

import React, { useState, useRef, useEffect } from 'react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  defaultExpanded = true,
  isExpanded: controlledExpanded,
  onToggle,
  children,
  headerRight,
  className = '',
  contentClassName = '',
}) => {
  // Support both controlled and uncontrolled modes
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  // Measure content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContentHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const handleToggle = () => {
    const newExpanded = !expanded;

    if (isControlled) {
      onToggle?.(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
      onToggle?.(newExpanded);
    }
  };

  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-100 shadow-sm
        overflow-hidden transition-shadow
        ${expanded ? 'shadow-md' : ''}
        ${className}
      `}
    >
      {/* Header */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full p-6 flex items-center justify-between gap-4 text-left hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            {title}
            {!expanded && (
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                Collapsed
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Right side content and toggle */}
        <div className="flex items-center gap-4">
          {headerRight && expanded && (
            <div onClick={(e) => e.stopPropagation()}>
              {headerRight}
            </div>
          )}

          <div
            className={`
              w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center
              transition-transform duration-300
              ${expanded ? 'rotate-180' : 'rotate-0'}
            `}
          >
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {/* Content with smooth height animation */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: expanded ? contentHeight ?? 'auto' : 0,
          opacity: expanded ? 1 : 0,
        }}
      >
        <div ref={contentRef} className={`p-6 pt-0 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
