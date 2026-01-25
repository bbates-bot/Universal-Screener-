/**
 * SkipLink Component
 * Allows keyboard users to skip to main content
 * Enhanced with multiple skip link support
 */

import React from 'react';

interface SkipLinkProps {
  /** Target element ID (without #) or href (with #) */
  href?: string;
  targetId?: string;
  /** Link label text */
  label?: string;
  children?: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  targetId,
  label,
  children,
}) => {
  // Support both href="#id" and targetId="id" formats
  const resolvedId = href?.startsWith('#') ? href.slice(1) : (targetId || href || '');
  const displayText = label || children || 'Skip to main content';

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(resolvedId);
    if (target) {
      // Make the target focusable if it isn't already
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${resolvedId}`}
      onClick={handleClick}
      className="
        sr-only focus:not-sr-only
        focus:absolute focus:top-4 focus:left-4 focus:z-[100]
        focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white
        focus:font-bold focus:rounded-lg focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
        transition-all
      "
    >
      {displayText}
    </a>
  );
};

export default SkipLink;
