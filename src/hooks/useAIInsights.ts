import { useState, useEffect, useCallback, useMemo } from 'react';
import { footballService, getErrorMessage } from '@/services';
import { useLocalStorage } from './utils/useLocalStorage';
import type { AIInsight } from '@/types';

interface InsightFilters {
  confidence?: 'high' | 'medium' | 'low' | '';
  market?: string;
  team?: string;
}

interface UseAIInsightsReturn {
  insights: AIInsight[];
  filteredInsights: AIInsight[];
  loading: boolean;
  error: string | null;
  filters: InsightFilters;
  setFilters: (filters: Partial<InsightFilters>) => void;
  clearFilters: () => void;
  refetch: () => Promise<void>;
  getInsightsByConfidence: (confidence: 'high' | 'medium' | 'low') => AIInsight[];
  getInsightsByMarket: (market: string) => AIInsight[];
  getTotalInsights: () => number;
  getConfidenceStats: () => { high: number; medium: number; low: number };
}

/**
 * Hook for managing AI betting insights with filtering
 */
export const useAIInsights = (
  fixtureIds: string[] = []
): UseAIInsightsReturn => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persistent filters
  const [filters, setStoredFilters] = useLocalStorage<InsightFilters>(
    'ai-insights-filters',
    {}
  );

  // Fetch insights for multiple fixtures
  const fetchInsights = useCallback(async () => {
    if (fixtureIds.length === 0) {
      setInsights([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const promises = fixtureIds.map(id => 
        footballService.getAIInsights(id).catch(err => {
          console.warn(`Failed to fetch insights for fixture ${id}:`, err);
          return { data: [] };
        })
      );

      const responses = await Promise.all(promises);
      const allInsights = responses.flatMap(response => response.data);
      
      setInsights(allInsights);

    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Error fetching AI insights:', err);
    } finally {
      setLoading(false);
    }
  }, [fixtureIds]);

  // Filter insights based on current filters
  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      if (filters.confidence && insight.confidence !== filters.confidence) {
        return false;
      }
      if (filters.market && insight.market !== filters.market) {
        return false;
      }
      if (filters.team && 
          !insight.supportingData?.some(data => 
            data.toLowerCase().includes(filters.team!.toLowerCase())
          )) {
        return false;
      }
      return true;
    });
  }, [insights, filters]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<InsightFilters>) => {
    setStoredFilters(prev => ({ ...prev, ...newFilters }));
  }, [setStoredFilters]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setStoredFilters({});
  }, [setStoredFilters]);

  // Get insights by confidence level
  const getInsightsByConfidence = useCallback((confidence: 'high' | 'medium' | 'low') => {
    return insights.filter(insight => insight.confidence === confidence);
  }, [insights]);

  // Get insights by market type
  const getInsightsByMarket = useCallback((market: string) => {
    return insights.filter(insight => insight.market === market);
  }, [insights]);

  // Get total insights count
  const getTotalInsights = useCallback(() => {
    return insights.length;
  }, [insights]);

  // Get confidence statistics
  const getConfidenceStats = useCallback(() => {
    return insights.reduce(
      (stats, insight) => {
        stats[insight.confidence]++;
        return stats;
      },
      { high: 0, medium: 0, low: 0 }
    );
  }, [insights]);

  // Refetch insights
  const refetch = useCallback(() => {
    return fetchInsights();
  }, [fetchInsights]);

  // Auto-fetch when fixture IDs change
  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    filteredInsights,
    loading,
    error,
    filters,
    setFilters,
    clearFilters,
    refetch,
    getInsightsByConfidence,
    getInsightsByMarket,
    getTotalInsights,
    getConfidenceStats
  };
};
