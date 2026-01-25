/**
 * useKeyboardNavigation Hook
 * Provides keyboard navigation utilities for lists and tables
 */

import React, { useState, useCallback, useEffect, RefObject } from 'react';

interface UseKeyboardNavigationOptions {
  /** Total number of items to navigate through */
  itemCount: number;
  /** Whether keyboard navigation is enabled */
  enabled?: boolean;
  /** Whether to loop around at the ends */
  loop?: boolean;
  /** Initial focused index */
  initialIndex?: number;
  /** Callback when selection is confirmed (Enter/Space) */
  onSelect?: (index: number) => void;
  /** Callback when escape is pressed */
  onEscape?: () => void;
  /** Orientation of the list (affects arrow keys) */
  orientation?: 'vertical' | 'horizontal' | 'both';
}

interface UseKeyboardNavigationReturn {
  /** Currently focused index */
  focusedIndex: number;
  /** Set the focused index manually */
  setFocusedIndex: (index: number) => void;
  /** Keyboard event handler to attach to the container */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** Check if an item at index is focused */
  isFocused: (index: number) => boolean;
  /** Reset focus to initial state */
  resetFocus: () => void;
  /** Move focus to first item */
  focusFirst: () => void;
  /** Move focus to last item */
  focusLast: () => void;
}

export const useKeyboardNavigation = ({
  itemCount,
  enabled = true,
  loop = true,
  initialIndex = -1,
  onSelect,
  onEscape,
  orientation = 'vertical',
}: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn => {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex);

  // Reset focus when item count changes significantly
  useEffect(() => {
    if (focusedIndex >= itemCount && itemCount > 0) {
      setFocusedIndex(itemCount - 1);
    }
  }, [itemCount, focusedIndex]);

  const moveFocus = useCallback((direction: 'next' | 'prev') => {
    if (itemCount === 0) return;

    setFocusedIndex((current) => {
      if (direction === 'next') {
        if (current >= itemCount - 1) {
          return loop ? 0 : current;
        }
        return current + 1;
      } else {
        if (current <= 0) {
          return loop ? itemCount - 1 : 0;
        }
        return current - 1;
      }
    });
  }, [itemCount, loop]);

  const focusFirst = useCallback(() => {
    if (itemCount > 0) {
      setFocusedIndex(0);
    }
  }, [itemCount]);

  const focusLast = useCallback(() => {
    if (itemCount > 0) {
      setFocusedIndex(itemCount - 1);
    }
  }, [itemCount]);

  const resetFocus = useCallback(() => {
    setFocusedIndex(initialIndex);
  }, [initialIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enabled || itemCount === 0) return;

    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';

    switch (e.key) {
      case 'ArrowDown':
        if (isVertical) {
          e.preventDefault();
          moveFocus('next');
        }
        break;
      case 'ArrowUp':
        if (isVertical) {
          e.preventDefault();
          moveFocus('prev');
        }
        break;
      case 'ArrowRight':
        if (isHorizontal) {
          e.preventDefault();
          moveFocus('next');
        }
        break;
      case 'ArrowLeft':
        if (isHorizontal) {
          e.preventDefault();
          moveFocus('prev');
        }
        break;
      case 'Home':
        e.preventDefault();
        focusFirst();
        break;
      case 'End':
        e.preventDefault();
        focusLast();
        break;
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0 && focusedIndex < itemCount) {
          e.preventDefault();
          onSelect?.(focusedIndex);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onEscape?.();
        break;
    }
  }, [enabled, itemCount, orientation, focusedIndex, moveFocus, focusFirst, focusLast, onSelect, onEscape]);

  const isFocused = useCallback((index: number) => {
    return focusedIndex === index;
  }, [focusedIndex]);

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    isFocused,
    resetFocus,
    focusFirst,
    focusLast,
  };
};

/**
 * Hook to manage roving tabindex pattern
 * Only the focused item has tabindex=0, others have tabindex=-1
 */
export const useRovingTabindex = (
  containerRef: RefObject<HTMLElement>,
  itemSelector: string,
  options: UseKeyboardNavigationOptions
) => {
  const navigation = useKeyboardNavigation(options);

  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll<HTMLElement>(itemSelector);
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === navigation.focusedIndex ? '0' : '-1');
      if (index === navigation.focusedIndex) {
        item.focus();
      }
    });
  }, [navigation.focusedIndex, containerRef, itemSelector]);

  return navigation;
};

export default useKeyboardNavigation;
