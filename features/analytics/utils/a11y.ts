/**
 * Accessibility Utilities
 * Helper functions for building accessible components
 */

/**
 * Generates ARIA attributes for sortable table headers
 */
export const getSortAriaProps = (
  columnKey: string,
  currentColumn: string | null,
  direction: 'asc' | 'desc'
): Record<string, string> => {
  const isSorted = columnKey === currentColumn;

  return {
    'aria-sort': isSorted ? (direction === 'asc' ? 'ascending' : 'descending') : 'none',
    role: 'columnheader',
  };
};

/**
 * Generates a unique ID for form elements
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Creates a properly formatted ARIA label for a status badge
 */
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    'on-or-above': 'On or above grade level',
    'below': 'Below grade level',
    'far-below': 'Far below grade level',
    'non-applicable': 'Not yet assessed',
    'ready': 'Ready for next level',
    'approaching': 'Approaching readiness',
    'not-yet-ready': 'Not yet ready',
  };

  return statusLabels[status] || status;
};

/**
 * Formats a number for screen reader announcement
 */
export const formatNumberForSR = (num: number, label: string): string => {
  if (num === 1) {
    return `${num} ${label}`;
  }
  return `${num} ${label}s`;
};

/**
 * Creates keyboard instructions for interactive elements
 */
export const getKeyboardInstructions = (elementType: 'table' | 'dropdown' | 'panel'): string => {
  const instructions: Record<string, string> = {
    table: 'Use arrow keys to navigate between rows. Press Enter or Space to select a row. Press Escape to deselect.',
    dropdown: 'Use arrow keys to navigate options. Press Enter or Space to select. Press Escape to close.',
    panel: 'Use Tab to navigate between elements. Press Escape to close the panel.',
  };

  return instructions[elementType] || '';
};

/**
 * Determines if reduced motion is preferred
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Creates a debounced announcer for screen readers
 * Prevents rapid-fire announcements from overwhelming users
 */
export const createDebouncedAnnouncer = (delay = 500) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastMessage = '';

  return (message: string, force = false) => {
    if (message === lastMessage && !force) return;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      lastMessage = message;
      // The actual announcement is handled by the LiveRegion component
    }, delay);

    return message;
  };
};

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Trap focus within a container
   */
  trapFocus: (container: HTMLElement, event: KeyboardEvent) => {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  },

  /**
   * Store and restore focus
   */
  createFocusRestorer: () => {
    const previousElement = document.activeElement as HTMLElement | null;

    return () => {
      previousElement?.focus();
    };
  },
};

/**
 * Color contrast utilities
 */
export const contrastUtils = {
  /**
   * Check if a color needs dark or light text
   */
  needsDarkText: (hexColor: string): boolean => {
    const rgb = parseInt(hexColor.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5;
  },
};
