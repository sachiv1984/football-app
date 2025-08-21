import { apiClient } from './ApiClient';
import { getCacheTTL, getCacheKey } from './cache';
import { apiConfig } from '@/config';
import type { 
  Fixture, 
  Team, 
  LeagueTableRow, 
  MatchStats, 
  AIInsight, 
  PlayerStats,
  Competition 
} from '@/types';
import type { ApiResponse, PaginatedResponse, FilterParams, RequestOptions } from './types';

/**
 * Football-specific API service
 */
class FootballService {
  private readonly endpoints = {
    fixtures: '/fixtures',
    fixture: '/fixtures/:id',
    matchStats: '/fixtures/:id/stats',
    teams: '/teams',
    team: '/teams/:id',
    leagueTable: '/competitions/:id/standings',
    aiInsights: '/fixtures/:id/insights',
    playerStats: '/fixtures/:id/players',
    competitions: '/competitions',
    search: '/search',
  };

  /**
   * Get fixtures with optional filtering
   */
  async getFixtures(filters: FilterParams = {}): Promise<PaginatedResponse<Fixture>> {
    const options: RequestOptions = {
      cacheTTL: filters.status === 'live' ? getCacheTTL('liveFixtures') : getCacheTTL('fixtures')
    };

    if (apiConfig.enableMockData) {
      return this.getMockFixtures(filters);
    }

    const response = await apiClient.get<Fixture[]>(this.endpoints.fixtures, filters, options);
    
    // Transform to paginated response format
    return {
      ...response,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total: response.data.length,
        totalPages: Math.ceil(response.data.length / (filters.limit || 10)),
        hasNext: false, // Will be updated based on actual API response
        hasPrevious: (filters.page || 1) > 1
      }
    };
  }

  /**
   * Get single fixture by ID
   */
  async getFixtureById(id: string): Promise<ApiResponse<Fixture>> {
    const options: RequestOptions = {
      cacheTTL: getCacheTTL('fixtures')
    };

    if (apiConfig.enableMockData) {
      return this.getMockFixture(id);
    }

    const url = this.endpoints.fixture.replace(':id', id);
    return apiClient.get<Fixture>(url, {}, options);
  }

  /**
   * Get match statistics
   */
  async getMatchStats(fixtureId: string): Promise<ApiResponse<MatchStats>> {
    const options: RequestOptions = {
      cacheTTL: getCacheTTL('matchStats')
    };

    if (apiConfig.enableMockData) {
      return this.getMockMatchStats(fixtureId);
    }

    const url = this.endpoints.matchStats.replace(':id', fixtureId);
    return apiClient.get<MatchStats>(url, {}, options);
  }

  /**
   * Get teams list
   */
  async getTeams(filters: FilterParams = {}): Promise<ApiResponse<Team[]>> {
    const options: RequestOptions = {
      cacheTTL: getCacheTTL('teams')
    };

    if (apiConfig.enableMockData) {
      return this.getMockTeams();
    }

    return apiClient.get<Team[]>(this.endpoints.teams, filters, options);
  }

  /**
   * Get single team by ID
   */
  async getTeamById(id: string): Promise<ApiResponse<Team>> {
    const options: RequestOptions = {
      cacheTTL: getCacheTTL('teams')
    };

    if (apiConfig.enableMockData) {
      return this.getMockTeam(id);
    }

    const url = this.endpoints.team.replace(':id', id);
    return apiClient.get<Team>(url, {}, options);
  }

  /**
   * Get league table
   */
  async getLeagueTable(competitionId: string = 'premier-league'): Promise<ApiResponse<LeagueTableRow[]>> {
    const options: RequestOptions = {
      cacheTTL: getCacheTTL('leagueTable')
    };

    if (apiConfig.enableMockData) {
      return this.getMockLeagueTable();
    }

    const url = this.endpoints.leagueTable.replace(':id', competitionId);
    return apiClient.get<LeagueTableRow[]>(url, {}, options);
  }

  /**
   * Get AI insights for a fixture
   */
  async getAIInsights(fixtureId: string): Promise<ApiResponse<AIInsight[]>> {
    const options: RequestOptions = {
      cacheTTL: getCacheTTL('aiInsights')
    };

    if (apiConfig.enableMockData) {
      return this.getMockAIInsights(fixtureId);
    }

    const url = this.endpoints.aiInsights.replace(':id', fixtureId);
    return apiClient.get<AIInsight[]>(url, {}, options);
  }

  /**
   * Get player statistics for a fixture
   */
  async getPlayerStats(fixtureId: string): Promise<ApiResponse<PlayerStats[]>> {
    const options: RequestOptions = {
      cacheTTL: getCacheTTL('matchStats')
    };

    if (apiConfig.enableMockData) {
      return this.getMockPlayerStats(fixtureId);
    }

    const url = this.endpoints.playerStats.replace(':id', fixtureId);
    return apiClient.get<PlayerStats[]>(url, {}, options);
  }

  /**
   * Search teams
   */
  async searchTeams(query: string): Promise<ApiResponse<Team[]>> {
    if (!query.trim()) {
      return {
        data: [],
        success: true,
        timestamp: new Date().toISOString()
      };
    }

    const options: RequestOptions = {
      cacheTTL: getCacheTTL('teams')
    };

    if (apiConfig.enableMockData) {
      return this.getMockSearchResults(query);
    }

    return apiClient.get<Team[]>(this.endpoints.search, { q: query, type: 'teams' }, options);
  }

  /**
   * Get competitions list
   */
  async getCompetitions(): Promise<ApiResponse<Competition[]>> {
    const options: RequestOptions = {
      cacheTTL: getCacheTTL('teams') // Long cache since competitions don't change often
    };

    if (apiConfig.enableMockData) {
      return this.getMockCompetitions();
    }

    return apiClient.get<Competition[]>(this.endpoints.competitions, {}, options);
  }

  // Mock data methods for development
  private async getMockFixtures(filters: FilterParams = {}): Promise<PaginatedResponse<Fixture>> {
    // Simulate API delay
    await this.simulateDelay();

    const { getMockFixtures } = await import('./mockData');
    const fixtures = getMockFixtures(filters);

    return {
      data: fixtures,
      success: true,
      timestamp: new Date().toISOString(),
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total: fixtures.length,
        totalPages: Math.ceil(fixtures.length / (filters.limit || 10)),
        hasNext: false,
        hasPrevious: (filters.page || 1) > 1
      }
    };
  }

  private async getMockFixture(id: string): Promise<ApiResponse<Fixture>> {
    await this.simulateDelay();
    const { getMockFixtureById } = await import('./mockData');
    const fixture = getMockFixtureById(id);

    if (!fixture) {
      throw new Error(`Fixture with ID ${id} not found`);
    }

    return {
      data: fixture,
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  private async getMockMatchStats(fixtureId: string): Promise<ApiResponse<MatchStats>> {
    await this.simulateDelay();
    const { getMockMatchStats } = await import('./mockData');
    
    return {
      data: getMockMatchStats(fixtureId),
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  private async getMockTeams(): Promise<ApiResponse<Team[]>> {
    await this.simulateDelay();
    const { getMockTeams } = await import('./mockData');
    
    return {
      data: getMockTeams(),
