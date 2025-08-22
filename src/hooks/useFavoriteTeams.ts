// src/hooks/useFavoriteTeams.ts
import { useCallback } from 'react';
import { useUserPreferences } from './useUserPreferences';
import { useFixtures, useMatchDetails } from './index';
import { Team, Fixture } from '@/types';

export const useFavoriteTeams = () => {
  const { preferences, toggleFavoriteTeam } = useUserPreferences();

  const { fixtures: favoriteFixtures, loading: fixturesLoading } = useFixtures({
    teams: preferences.favoriteTeams,
    limit: 10
  });

  const isFavorite = useCallback((teamId: string) => {
    return preferences.favoriteTeams.includes(teamId);
  }, [preferences.favoriteTeams]);

  const getFavoriteTeamsFixtures = useCallback(() => {
    return favoriteFixtures.filter(fixture => 
      preferences.favoriteTeams.includes(fixture.homeTeam.id) ||
      preferences.favoriteTeams.includes(fixture.awayTeam.id)
    );
  }, [favoriteFixtures, preferences.favoriteTeams]);

  const getUpcomingFavoriteFixtures = useCallback((days: number = 7) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return favoriteFixtures.filter(fixture => {
      const fixtureDate = new Date(fixture.datetime);
      return fixtureDate >= now && fixtureDate <= futureDate;
    });
  }, [favoriteFixtures]);

  const getFavoriteTeamStats = useCallback(() => {
    const teamStats = preferences.favoriteTeams.map(teamId => {
      const teamFixtures = favoriteFixtures.filter(
        f => f.homeTeam.id === teamId || f.awayTeam.id === teamId
      );
      
      const wins = teamFixtures.filter(f => 
        (f.homeTeam.id === teamId && f.homeScore > f.awayScore) ||
        (f.awayTeam.id === teamId && f.awayScore > f.homeScore)
      ).length;

      const draws = teamFixtures.filter(f => f.homeScore === f.awayScore).length;
      const losses = teamFixtures.length - wins - draws;

      return {
        teamId,
        played: teamFixtures.length,
        wins,
        draws,
        losses,
        winPercentage: teamFixtures.length > 0 ? (wins / teamFixtures.length) * 100 : 0
      };
    });

    return teamStats;
  }, [favoriteFixtures, preferences.favoriteTeams]);

  return {
    favoriteTeamIds: preferences.favoriteTeams,
    favoriteFixtures: getFavoriteTeamsFixtures(),
    upcomingFixtures: getUpcomingFavoriteFixtures(),
    favoriteTeamStats: getFavoriteTeamStats(),
    isFavorite,
    toggleFavorite: toggleFavoriteTeam,
    loading: fixturesLoading,
  };
};
