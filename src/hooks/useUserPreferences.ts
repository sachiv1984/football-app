// src/hooks/useUserPreferences.ts
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './utils/useLocalStorage';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  favoriteTeams: string[];
  favoriteLeagues: string[];
  defaultView: 'fixtures' | 'table' | 'stats';
  notifications: {
    matchStart: boolean;
    goals: boolean;
    finalResults: boolean;
    favoriteTeamResults: boolean;
  };
  betInsights: {
    minConfidence: number;
    favoriteMarkets: string[];
    hideHighRisk: boolean;
  };
  display: {
    timezone: string;
    dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
    currency: 'GBP' | 'USD' | 'EUR';
    language: 'en' | 'es' | 'fr' | 'de';
  };
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  favoriteTeams: [],
  favoriteLeagues: ['premier-league'],
  defaultView: 'fixtures',
  notifications: {
    matchStart: true,
    goals: true,
    finalResults: true,
    favoriteTeamResults: true,
  },
  betInsights: {
    minConfidence: 60,
    favoriteMarkets: ['match_result', 'over_under_goals', 'both_teams_score'],
    hideHighRisk: false,
  },
  display: {
    timezone: 'Europe/London',
    dateFormat: 'dd/mm/yyyy',
    currency: 'GBP',
    language: 'en',
  },
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'userPreferences',
    defaultPreferences
  );

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...updates,
      // Deep merge nested objects
      notifications: { ...prev.notifications, ...updates.notifications },
      betInsights: { ...prev.betInsights, ...updates.betInsights },
      display: { ...prev.display, ...updates.display },
    }));
  }, [setPreferences]);

  const addFavoriteTeam = useCallback((teamId: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteTeams: [...prev.favoriteTeams.filter(id => id !== teamId), teamId]
    }));
  }, [setPreferences]);

  const removeFavoriteTeam = useCallback((teamId: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteTeams: prev.favoriteTeams.filter(id => id !== teamId)
    }));
  }, [setPreferences]);

  const toggleFavoriteTeam = useCallback((teamId: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteTeams: prev.favoriteTeams.includes(teamId)
        ? prev.favoriteTeams.filter(id => id !== teamId)
        : [...prev.favoriteTeams, teamId]
    }));
  }, [setPreferences]);

  const addFavoriteLeague = useCallback((leagueId: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteLeagues: [...prev.favoriteLeagues.filter(id => id !== leagueId), leagueId]
    }));
  }, [setPreferences]);

  const removeFavoriteLeague = useCallback((leagueId: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteLeagues: prev.favoriteLeagues.filter(id => id !== leagueId)
    }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, [setPreferences]);

  return {
    preferences,
    updatePreferences,
    addFavoriteTeam,
    removeFavoriteTeam,
    toggleFavoriteTeam,
    addFavoriteLeague,
    removeFavoriteLeague,
    resetPreferences,
  };
};
