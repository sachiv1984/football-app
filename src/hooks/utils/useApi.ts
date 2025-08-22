import { useState, useCallback, useRef, useEffect } from 'react';
import { getErrorMessage, logError } from '@/services';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  retries?: number;
  timeout?: number;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  cancel: () => void;
  reset: () => void;
}

/**
 * Generic API calling hook with loading/error states
 */
export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<{ data: T }>,
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const { onSuccess, onError, retries = 3, timeout = 10000 } = options;

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    let attempt = 1;
    let lastError: Error;

    while (attempt <= retries) {
      try {
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort();
        }, timeout);

        const response = await apiFunction(...args, {
          signal: abortControllerRef.current.signal
        });

        clearTimeout(timeoutId);
        
        setData(response.data);
        setLoading(false);
        onSuccess?.(response.data);
        
        return response.data;

      } catch (err: any) {
        lastError = err;
        
        // Don't retry if aborted
        if (err.name === 'AbortError') {
          setLoading(false);
          return null;
        }

        // Don't retry on certain errors
        if (err.status && [400, 401, 403, 404].includes(err.status)) {
          break;
        }

        if (attempt < retries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
        } else {
          break;
        }
      }
    }

    // Handle final error
    const errorMessage = getErrorMessage(lastError!);
    setError(errorMessage);
    setLoading(false);
    logError(lastError!, 'useApi');
    onError?.(errorMessage);

    return null;
  }, [apiFunction, onSuccess, onError, retries, timeout]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    cancel();
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    data,
    loading,
    error,
    execute,
    cancel,
    reset
  };
};
