import { useState, useEffect, useCallback, useMemo } from 'react';
import { footballService, getErrorMessage } from '@/services';
import { useLocalStorage } from './utils/useLocalStorage';
import { useLiveUpdates } from './utils/useLiveUpdates';
import type { Fixture, FilterParams, PaginatedResponse } from '@/types';

interface UseFixturesOptions {
  autoFetch?: boolean;
  enableLiveUpdates?: boolean;
  pollInterval?: number;
}

interface UseFixturesReturn {
  fixtures: Fixture[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
  filters: FilterParams;
  setFilters: (filters: Partial<FilterParams>) => void;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  clearFilters: () => void;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing fixtures data with filtering, pagination, and live updates
 */
export const useFixtures = (
  initialFilters: FilterParams = {},
  options: UseFixturesOptions = {}
): UseFixturesReturn => {
  const {
    autoFetch = true,
    enableLiveUpdates = true,
    pollInterval = 30000
  } = options;

  // State management
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    hasMore: false,
    totalPages: 0,
    currentPage: 1
  });

  // Persistent filters
  const [filters, setStoredFilters] = useLocalStorage<FilterParams>(
    'fixtures-filters',
    initialFilters
  );

  // Live updates for live fixtures
  const { liveData, subscribe, unsubscribe } = useLiveUpdates(pollInterval);

  // Get live fixture IDs
  const liveFixtureIds = useMemo(() => 
    fixtures.filter(f => f.status === 'live').map(f => f.id),
    [fixtures]
  );

  // Subscribe to live updates
  useEffect(() => {
    if (enableLiveUpdates && liveFixtureIds.length > 0) {
      liveFixtureIds.forEach(id => subscribe(id));
      
      return () => {
        liveFixtureIds.forEach(id => unsubscribe(id));
      };
    }
  }, [liveFixtureIds, enableLiveUpdates, subscribe, unsubscribe]);

  // Update fixtures with live data
  useEffect(() => {
    if (liveData.size > 0) {
      setFixtures(prev => prev.map(fixture => {
        const liveUpdate = liveData.get(fixture.id);
        if (liveUpdate) {
          return {
            ...fixture,
            homeScore: liveUpdate.homeScore,
            awayScore: liveUpdate.awayScore,
            status: liveUpdate.status as any
          };
        }
        return fixture;
      }));
    }
  }, [liveData]);

  // Fetch fixtures
  const fetchFixtures = useCallback(async (
    newFilters: FilterParams = filters,
    append: boolean = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<Fixture> = await footballService.getFixtures(newFilters);
      
      setFixtures(prev => append ? [...prev, ...response.data] : response.data);
      setPagination({
        hasMore: response.pagination.hasNext,
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.page
      });

    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Error fetching fixtures:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Set filters and refetch
  const setFilters = useCallback((newFilters: Partial<FilterParams>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setStoredFilters(updatedFilters);
    fetchFixtures(updatedFilters);
  }, [filters, setStoredFilters, fetchFixtures]);

  // Refetch with current filters
  const refetch = useCallback(() => {
    return fetchFixtures(filters);
  }, [fetchFixtures, filters]);

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading) return;

    const nextPageFilters = { ...filters, page: pagination.currentPage + 1 };
    await fetchFixtures(nextPageFilters, true);
  }, [pagination, loading, filters, fetchFixtures]);

  // Clear filters
  const clearFilters = useCallback(() => {
    const clearedFilters = { page: 1, limit: 10 };
    setStoredFilters(clearedFilters);
    fetchFixtures(clearedFilters);
  }, [setStoredFilters, fetchFixtures]);

  // Force refresh (bypass cache)
  const refresh = useCallback(async () => {
    // Clear cache for fixtures
    const { apiClient } = await import('@/services');
    apiClient.clearCache('fixtures');
    
    await fetchFixtures(filters);
  }, [fetchFixtures, filters]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchFixtures();
    }
  }, [autoFetch, fetchFixtures]);

  return {
    fixtures,
    loading,
    error,
    hasMore: pagination.hasMore,
    totalPages: pagination.totalPages,
    currentPage: pagination.currentPage,
    filters,
    setFilters,
    refetch,
    loadMore,
    clearFilters,
    refresh
  };
};
