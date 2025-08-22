import { useState, useEffect, useCallback } from 'react';
import { footballService, getErrorMessage } from '@/services';
import { useLiveUpdates } from './utils/useLiveUpdates';
import type { Fixture, MatchStats, AIInsight, PlayerStats } from '@/types';

interface UseMatchDetailsReturn {
  fixture: Fixture | null;
  matchStats: MatchStats | null;
  aiInsights: AIInsight[];
  playerStats: PlayerStats[];
  loading: {
    fixture: boolean;
    stats: boolean;
    insights: boolean;
    players: boolean;
  };
  error: {
    fixture: string | null;
    stats: string | null;
    insights: string | null;
    players: string | null;
  };
  refetch: {
    fixture: () => Promise<void>;
    stats: () => Promise<void>;
    insights: () => Promise<void>;
    players: () => Promise<void>;
    all: () => Promise<void>;
  };
  loadPlayerStats: () => Promise<void>;
}

/**
 * Hook for managing individual fixture details with lazy loading
 */
export const useMatchDetails = (
  fixtureId: string,
  options: { enableLiveUpdates?: boolean } = {}
): UseMatchDetailsReturn => {
  const { enableLiveUpdates = true } = options;

  // State for different data sections
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);

  // Loading states for each section
  const [loading, setLoading] = useState({
    fixture: false,
    stats: false,
    insights: false,
    players: false
  });

  // Error states for each section
  const [error, setError] = useState({
    fixture: null as string | null,
    stats: null as string | null,
    insights: null as string | null,
    players: null as string | null
  });

  // Live updates
  const { liveData, subscribe, unsubscribe } = useLiveUpdates();

  // Subscribe to live updates for this fixture
  useEffect(() => {
    if (enableLiveUpdates && fixture?.status === 'live') {
      subscribe(fixtureId);
      return () => unsubscribe(fixtureId);
    }
  }, [enableLiveUpdates, fixture?.status, fixtureId, subscribe, unsubscribe]);

  // Update fixture with live data
  useEffect(() => {
    const liveUpdate = liveData.get(fixtureId);
    if (liveUpdate && fixture) {
      setFixture(prev => prev ? {
        ...prev,
        homeScore: liveUpdate.homeScore,
        awayScore: liveUpdate.awayScore,
        status: liveUpdate.status as any
      } : prev);
    }
  }, [liveData, fixtureId, fixture]);

  // Generic fetch function
  const fetchData = useCallback(async <T>(
    section: keyof typeof loading,
    fetchFn: () => Promise<{ data: T }>,
    setState: (data: T) => void
  ) => {
    setLoading(prev => ({ ...prev, [section]: true }));
    setError(prev => ({ ...prev, [section]: null }));

    try {
      const response = await fetchFn();
      setState(response.data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(prev => ({ ...prev, [section]: errorMessage }));
      console.error(`Error fetching ${section}:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  }, []);

  // Fetch fixture details
  const fetchFixture = useCallback(() => {
    return fetchData(
      'fixture',
      () => footballService.getFixtureById(fixtureId),
      setFixture
    );
  }, [fixtureId, fetchData]);

  // Fetch match statistics
  const fetchStats = useCallback(() => {
    return fetchData(
      'stats',
      () => footballService.getMatchStats(fixtureId),
      setMatchStats
    );
  }, [fixtureId, fetchData]);

  // Fetch AI insights
  const fetchInsights = useCallback(() => {
    return fetchData(
      'insights',
      () => footballService.getAIInsights(fixtureId),
      setAIInsights
    );
  }, [fixtureId, fetchData]);

  // Fetch player statistics (lazy loaded)
  const fetchPlayers = useCallback(() => {
    return fetchData(
      'players',
      () => footballService.getPlayerStats(fixtureId),
      setPlayerStats
    );
  }, [fixtureId, fetchData]);

  // Lazy load player stats (called when user clicks Player Stats tab)
  const loadPlayerStats = useCallback(async () => {
    if (playerStats.length === 0 && !loading.players) {
      await fetchPlayers();
    }
  }, [playerStats.length, loading.players, fetchPlayers]);

  // Refetch all data
  const refetchAll = useCallback(async () => {
    await Promise.all([
      fetchFixture(),
      fetchStats(),
      fetchInsights(),
      ...(playerStats.length > 0 ? [fetchPlayers()] : [])
    ]);
  }, [fetchFixture, fetchStats, fetchInsights, fetchPlayers, playerStats.length]);

  // Auto-fetch essential data on mount
  useEffect(() => {
    if (fixtureId) {
      fetchFixture();
      fetchStats();
      fetchInsights();
    }
  }, [fixtureId, fetchFixture, fetchStats, fetchInsights]);

  return {
    fixture,
    matchStats,
    aiInsights,
    playerStats,
    loading,
    error,
    refetch: {
      fixture: fetchFixture,
      stats: fetchStats,
      insights: fetchInsights,
      players: fetchPlayers,
      all: refetchAll
    },
    loadPlayerStats
  };
};
