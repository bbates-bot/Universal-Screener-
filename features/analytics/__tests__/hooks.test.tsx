/**
 * Tests for Analytics Hooks
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKeyboardNavigation, useRovingTabindex } from '../hooks/useKeyboardNavigation';
import { useRetry, withRetry } from '../hooks/useRetry';

describe('useKeyboardNavigation', () => {
  const defaultOptions = {
    itemCount: 5,
    enabled: true,
    loop: true,
    initialIndex: -1,
    onSelect: vi.fn(),
    onEscape: vi.fn(),
    orientation: 'vertical' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with initial index', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ ...defaultOptions, initialIndex: 2 })
    );

    expect(result.current.focusedIndex).toBe(2);
  });

  it('moves focus down on ArrowDown', () => {
    const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

    // Start at 0
    act(() => {
      result.current.setFocusedIndex(0);
    });

    // Simulate ArrowDown
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.focusedIndex).toBe(1);
  });

  it('moves focus up on ArrowUp', () => {
    const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

    act(() => {
      result.current.setFocusedIndex(2);
    });

    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowUp',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.focusedIndex).toBe(1);
  });

  it('loops from last to first when loop is enabled', () => {
    const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

    act(() => {
      result.current.setFocusedIndex(4); // Last item
    });

    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it('does not loop when loop is disabled', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ ...defaultOptions, loop: false })
    );

    act(() => {
      result.current.setFocusedIndex(4);
    });

    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.focusedIndex).toBe(4); // Stays at last
  });

  it('calls onSelect on Enter key', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ ...defaultOptions, onSelect })
    );

    act(() => {
      result.current.setFocusedIndex(2);
    });

    act(() => {
      result.current.handleKeyDown({
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it('calls onSelect on Space key', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ ...defaultOptions, onSelect })
    );

    act(() => {
      result.current.setFocusedIndex(3);
    });

    act(() => {
      result.current.handleKeyDown({
        key: ' ',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it('calls onEscape on Escape key', () => {
    const onEscape = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ ...defaultOptions, onEscape })
    );

    act(() => {
      result.current.handleKeyDown({
        key: 'Escape',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onEscape).toHaveBeenCalled();
  });

  it('focuses first item on Home key', () => {
    const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

    act(() => {
      result.current.setFocusedIndex(3);
    });

    act(() => {
      result.current.handleKeyDown({
        key: 'Home',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it('focuses last item on End key', () => {
    const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

    act(() => {
      result.current.setFocusedIndex(1);
    });

    act(() => {
      result.current.handleKeyDown({
        key: 'End',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.focusedIndex).toBe(4);
  });

  it('handles horizontal orientation', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ ...defaultOptions, orientation: 'horizontal' })
    );

    act(() => {
      result.current.setFocusedIndex(0);
    });

    // ArrowRight should move focus
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.focusedIndex).toBe(1);

    // ArrowLeft should move focus back
    act(() => {
      result.current.handleKeyDown({
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it('isFocused helper returns correct value', () => {
    const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));

    act(() => {
      result.current.setFocusedIndex(2);
    });

    expect(result.current.isFocused(2)).toBe(true);
    expect(result.current.isFocused(1)).toBe(false);
  });

  it('resetFocus returns to initial index', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ ...defaultOptions, initialIndex: 0 })
    );

    act(() => {
      result.current.setFocusedIndex(3);
    });

    act(() => {
      result.current.resetFocus();
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it('does nothing when disabled', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNavigation({ ...defaultOptions, enabled: false, onSelect })
    );

    act(() => {
      result.current.handleKeyDown({
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('useRetry', () => {
  beforeEach(() => {
    // Suppress console.warn for retry messages
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('executes function successfully on first try', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const { result } = renderHook(() => useRetry());

    let response: string | undefined;
    await act(async () => {
      response = await result.current.execute(fn);
    });

    expect(response).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('returns execute, isRetrying, retryCount, reset, and cancel', () => {
    const { result } = renderHook(() => useRetry());

    expect(result.current.execute).toBeInstanceOf(Function);
    expect(result.current.reset).toBeInstanceOf(Function);
    expect(result.current.cancel).toBeInstanceOf(Function);
    expect(typeof result.current.isRetrying).toBe('boolean');
    expect(typeof result.current.retryCount).toBe('number');
  });

  it('starts with isRetrying false and retryCount 0', () => {
    const { result } = renderHook(() => useRetry());

    expect(result.current.isRetrying).toBe(false);
    expect(result.current.retryCount).toBe(0);
  });

  it('resets state with reset function', () => {
    const { result } = renderHook(() => useRetry());

    act(() => {
      result.current.reset();
    });

    expect(result.current.retryCount).toBe(0);
    expect(result.current.isRetrying).toBe(false);
  });

  it('throws error after max retries with no delay', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('test error'));

    const { result } = renderHook(() => useRetry({ maxRetries: 0 }));

    await act(async () => {
      await expect(result.current.execute(fn)).rejects.toThrow('test error');
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('withRetry', () => {
  it('executes successfully on first try', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const response = await withRetry(fn, { maxRetries: 2 });

    expect(response).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after max retries exceeded with no delay', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent error'));

    await expect(
      withRetry(fn, { maxRetries: 0 })
    ).rejects.toThrow('persistent error');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls onMaxRetriesReached callback', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const onMaxRetriesReached = vi.fn();

    try {
      await withRetry(fn, { maxRetries: 0, onMaxRetriesReached });
    } catch (e) {
      // Expected
    }

    expect(onMaxRetriesReached).toHaveBeenCalledWith(expect.any(Error));
  });
});
