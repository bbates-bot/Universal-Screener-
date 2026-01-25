/**
 * useRetry Hook
 * Custom hook for retry logic with exponential backoff
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

interface UseRetryResult<T> {
  execute: (fn: () => Promise<T>) => Promise<T>;
  isRetrying: boolean;
  retryCount: number;
  reset: () => void;
  cancel: () => void;
}

export const useRetry = <T = any>({
  maxRetries = 3,
  initialDelay = 1000,
  maxDelay = 30000,
  backoffMultiplier = 2,
  onRetry,
  onMaxRetriesReached,
}: UseRetryOptions = {}): UseRetryResult<T> => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const cancelledRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate delay with exponential backoff
  const getDelay = useCallback(
    (attempt: number): number => {
      const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
      return Math.min(delay, maxDelay);
    },
    [initialDelay, backoffMultiplier, maxDelay]
  );

  // Sleep function with cancellation support
  const sleep = useCallback(
    (ms: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(() => {
          if (cancelledRef.current) {
            reject(new Error('Retry cancelled'));
          } else {
            resolve();
          }
        }, ms);
      });
    },
    []
  );

  // Execute function with retry logic
  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T> => {
      cancelledRef.current = false;
      let lastError: Error = new Error('Unknown error');
      let attempt = 0;

      while (attempt <= maxRetries) {
        try {
          if (cancelledRef.current) {
            throw new Error('Retry cancelled');
          }

          const result = await fn();
          setRetryCount(0);
          setIsRetrying(false);
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          if (cancelledRef.current) {
            throw lastError;
          }

          if (attempt < maxRetries) {
            attempt++;
            setRetryCount(attempt);
            setIsRetrying(true);

            const delay = getDelay(attempt - 1);
            onRetry?.(attempt, lastError);

            console.warn(
              `Retry attempt ${attempt}/${maxRetries} after ${delay}ms`,
              lastError.message
            );

            await sleep(delay);
          } else {
            onMaxRetriesReached?.(lastError);
            throw lastError;
          }
        }
      }

      throw lastError;
    },
    [maxRetries, getDelay, sleep, onRetry, onMaxRetriesReached]
  );

  // Reset retry state
  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    cancelledRef.current = false;
  }, []);

  // Cancel ongoing retry
  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setIsRetrying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    execute,
    isRetrying,
    retryCount,
    reset,
    cancel,
  };
};

/**
 * Wrapper function for retrying async operations
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: UseRetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    onRetry,
    onMaxRetriesReached,
  } = options;

  let lastError: Error = new Error('Unknown error');
  let attempt = 0;

  const getDelay = (attempt: number): number => {
    const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
    return Math.min(delay, maxDelay);
  };

  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        attempt++;
        const delay = getDelay(attempt - 1);
        onRetry?.(attempt, lastError);
        await sleep(delay);
      } else {
        onMaxRetriesReached?.(lastError);
        throw lastError;
      }
    }
  }

  throw lastError;
};

export default useRetry;
