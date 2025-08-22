
import { useState, useCallback, useEffect, useRef } from 'react';
import { footballService, getErrorMessage } from '@/services';
import { useLocalStorage } from './utils/useLocalStorage';
import type { Team } from '@/types';

interface UseTeamSearchReturn {
  results: Team[];
  loading: boolean;
  error: string | null;
  query: string;
  search: (searchTerm: string) => Promise<void>;
  clear: () => void;
  history: string[];
  clearHistory: () => void;
  selectTeam: (team: Team) => void;
  selectedTeams: Team[];
  removeSelectedTeam: (teamId: string) => void;
  clearSelected: () => void;
}

/**
 * Hook for team search with history and selection
 */
export const useTeamSearch = (): UseTeamSearchReturn => {
  const [results, setResults] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Search history (persistent)
  const [history, setHistory] = useLocalStorage<string[]>('search-history', []);

  // Selected teams (persistent)
  const [selectedTeams, setSelectedTeams] = useLocalStorage<Team[]>('selected-teams', []);

  // Debounce timer
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Perform search
  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await footballService.searchTeams(searchTerm);
      setResults(response.data);

      // Add to search history (avoid duplicates)
      if (!history.includes(searchTerm)) {
        const newHistory = [searchTerm, ...history].slice(0, 10); // Keep last 10 searches
        setHistory(newHistory);
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        console.error('Search error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [history, setHistory]);

  // Debounced search function
  const search = useCallback(async (searchTerm: string) => {
    setQuery(searchTerm);

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer
    debounceRef.current = setTimeout(() => {
      performSearch(searchTerm);
    }, 300); // 300ms delay
  }, [performSearch]);

  // Clear search
  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  // Select a team
  const selectTeam = useCallback((team: Team) => {
    if (!selectedTeams.find(t => t.id === team.id)) {
      setSelectedTeams(prev => [...prev, team]);
    }
  }, [selectedTeams, setSelectedTeams]);

  // Remove selected team
  const removeSelectedTeam = useCallback((teamId: string) => {
    setSelectedTeams(prev => prev.filter(t => t.id !== teamId));
  }, [setSelectedTeams]);

  // Clear selected teams
  const clearSelected = useCallback(() => {
    setSelectedTeams([]);
  }, [setSelectedTeams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    loading,
    error,
    query,
    search,
    clear,
    history,
    clearHistory,
    selectTeam,
    selectedTeams,
    removeSelectedTeam,
    clearSelected
  };
};
