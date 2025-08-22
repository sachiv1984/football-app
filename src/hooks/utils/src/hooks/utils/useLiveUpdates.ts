import { useState, useEffect, useCallback, useRef } from 'react';
import { footballService, getErrorMessage } from '@/services';
import { featureFlags } from '@/config';

interface LiveUpdateData {
  fixtureId: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  minute?: number;
  lastUpdated: string;
}

interface UseLiveUpdatesReturn {
  liveData: Map<string, LiveUpdateData>;
  isConnected: boolean;
  error: string | null;
  subscribe: (fixtureId: string) => void;
  unsubscribe: (fixtureId: string) => void;
  subscribeToAll: (fixtureIds: string[]) => void;
  unsubscribeAll: () => void;
}

/**
 * Live updates hook using polling (can be extended to WebSocket)
 */
export const useLiveUpdates = (
  pollInterval: number = 30000 // 30 seconds default
): UseLiveUpdatesReturn => {
  const [liveData, setLiveData] = useState<Map<string, LiveUpdateData>>(new Map());
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const subscribedFixtures = useRef<Set<string>>(new Set());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  // Fetch live updates for subscribed fixtures
  const fetchLiveUpdates = useCallback(async () => {
    if (!featureFlags.enableRealTimeUpdates || subscribedFixtures.current.size === 0) {
      return;
    }

    if (isPollingRef.current) {
      return; // Prevent overlapping requests
    }

    isPollingRef.current = true;
    setError(null);

    try {
      const promises = Array.from(subscribedFixtures.current).map(async (fixtureId) => {
        try {
          const response = await footballService.getFixtureById(fixtureId);
          const fixture = response.data;

          return {
            fixtureId,
            homeScore: fixture.homeScore,
            awayScore: fixture.awayScore,
            status: fixture.status,
            lastUpdated: new Date().toISOString()
          } as LiveUpdateData;
        } catch (err) {
          console.warn(`Failed to fetch live data for fixture ${fixtureId}:`, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      
      setLiveData(prev => {
        const updated = new Map(prev);
        results.forEach(result => {
          if (result) {
            updated.set(result.fixtureId, result);
          }
        });
        return updated;
      });

      setIsConnected(true);

    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setIsConnected(false);
      console.error('Live updates error:', err);
    } finally {
      isPollingRef.current = false;
    }
  }, []);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    if (subscribedFixtures.current.size > 0) {
      // Initial fetch
      fetchLiveUpdates();
      
      // Set up polling interval
      pollIntervalRef.current = setInterval(() => {
        fetchLiveUpdates();
      }, pollInterval);
    }
  }, [fetchLiveUpdates, pollInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Subscribe to fixture updates
  const subscribe = useCallback((fixtureId: string) => {
    subscribedFixtures.current.add(fixtureId);
    startPolling();
  }, [startPolling]);

  // Unsubscribe from fixture updates
  const unsubscribe = useCallback((fixtureId: string) => {
    subscribedFixtures.current.delete(fixtureId);
    setLiveData(prev => {
      const updated = new Map(prev);
      updated.delete(fixtureId);
      return updated;
    });

    if (subscribedFixtures.current.size === 0) {
      stopPolling();
    }
  }, [stopPolling]);

  // Subscribe to multiple fixtures
  const subscribeToAll = useCallback((fixtureIds: string[]) => {
    fixtureIds.forEach(id => subscribedFixtures.current.add(id));
    startPolling();
  }, [startPolling]);

  // Unsubscribe from all fixtures
  const unsubscribeAll = useCallback(() => {
    subscribedFixtures.current.clear();
    setLiveData(new Map());
    stopPolling();
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Handle visibility change (pause when tab is not visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (subscribedFixtures.current.size > 0) {
          startPolling();
        }
      } else {
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startPolling, stopPolling]);

  return {
    liveData,
    isConnected,
    error,
    subscribe,
    unsubscribe,
    subscribeToAll,
    unsubscribeAll
  };
};
