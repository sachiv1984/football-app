import { useState, useEffect, useCallback } from 'react';
import { footballService, getErrorMessage } from '@/services';
import { useLocalStorage } from './utils/useLocalStorage';
import type { LeagueTableRow } from '@/types';

interface UseLeagueTableReturn {
  table: LeagueTableRow[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  selectedCompetition: string;
  setCompetition: (competitionId: string) => void;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing league table data
 */
export const useLeagueTable = (
  initialCompetition: string = 'premier-league'
): UseLeagueTableReturn => {
  const [table, setTable] = useState<LeagueTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Persistent competition selection
  const [selectedCompetition, setSelectedCompetition] = useLocalStorage(
    'selected-competition',
    initialCompetition
  );

  // Fetch league table
  const fetchTable = useCallback(async (competitionId: string = selectedCompetition) => {
    setLoading(true);
    setError(null);

    try {
      const response = await footballService.getLeagueTable(competitionId);
      setTable(response.data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Error fetching league table:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCompetition]);

  // Change competition and refetch
  const setCompetition = useCallback((competitionId: string) => {
    setSelectedCompetition(competitionId);
    fetchTable(competitionId);
  }, [setSelectedCompetition, fetchTable]);

  // Refetch with current competition
  const refetch = useCallback(() => {
    return fetchTable(selectedCompetition);
  }, [fetchTable, selectedCompetition]);

  // Force refresh (bypass cache)
  const refresh = useCallback(async () => {
    const { apiClient } = await import('@/services');
    apiClient.clearCache(`league-table-${selectedCompetition}`);
    await fetchTable(selectedCompetition);
  }, [fetchTable, selectedCompetition]);

  // Auto-fetch on mount and competition change
  useEffect(() => {
    fetchTable();
  }, [fetchTable]);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTable();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [fetchTable]);

  return {
    table,
    loading,
    error,
    lastUpdated,
    selectedCompetition,
    setCompetition,
    refetch,
    refresh
  };
};
