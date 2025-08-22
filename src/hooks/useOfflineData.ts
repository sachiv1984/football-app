// src/hooks/useOfflineData.ts
import { useState, useEffect, useCallback } from 'react';

interface OfflineData<T> {
  data: T | null;
  timestamp: number;
  isStale: boolean;
}

export const useOfflineData = <T>(
  key: string,
  fetcher: () => Promise<T>,
  maxAge: number = 5 * 60 * 1000 // 5 minutes default
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cached = localStorage.getItem(`offline_${key}`);
        if (cached) {
          const offlineData: OfflineData<T> = JSON.parse(cached);
          const isStale = Date.now() - offlineData.timestamp > maxAge;
          
          if (!isStale || isOffline) {
            setData(offlineData.data);
          }
        }
      } catch (error) {
        console.error('Failed to load cached data:', error);
      }
    };

    loadCachedData();
  }, [key, maxAge, isOffline]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchData = useCallback(async (force: boolean = false) => {
    if (isOffline && !force) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);

      // Cache the result
      const offlineData: OfflineData<T> = {
        data: result,
        timestamp: Date.now(),
        isStale: false,
      };
      localStorage.setItem(`offline_${key}`, JSON.stringify(offlineData));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // If we have cached data and we're offline, use it
      if (isOffline && data === null) {
        try {
          const cached = localStorage.getItem(`offline_${key}`);
          if (cached) {
            const offlineData: OfflineData<T> = JSON.parse(cached);
            setData(offlineData.data);
          }
        } catch (cacheError) {
          console.error('Failed to load cached data as fallback:', cacheError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [fetcher, key, isOffline, data]);

  // Auto-fetch when coming back online
  useEffect(() => {
    if (!isOffline) {
      fetchData();
    }
  }, [isOffline, fetchData]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(`offline_${key}`);
    setData(null);
  }, [key]);

  return {
    data,
    loading,
    error,
    isOffline,
    fetchData,
    clearCache,
  };
};
