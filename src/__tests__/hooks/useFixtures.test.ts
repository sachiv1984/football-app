// src/__tests__/hooks/useFixtures.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useFixtures } from '@/hooks/useFixtures';
import { footballService } from '@/services';

// Mock the football service
jest.mock('@/services', () => ({
  footballService: {
    getFixtures: jest.fn(),
  },
}));

const mockFixtures = [
  {
    id: '1',
    homeTeam: { id: '1', name: 'Liverpool', logo: '/liverpool.png', league: 'Premier League' },
    awayTeam: { id: '2', name: 'Arsenal', logo: '/arsenal.png', league: 'Premier League' },
    homeScore: 2,
    awayScore: 1,
    status: 'finished',
    datetime: '2024-01-15T15:00:00Z',
    competition: { id: 'pl', name: 'Premier League' },
    minute: 90,
  },
  {
    id: '2',
    homeTeam: { id: '3', name: 'Chelsea', logo: '/chelsea.png', league: 'Premier League' },
    awayTeam: { id: '4', name: 'Tottenham', logo: '/tottenham.png', league: 'Premier League' },
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled',
    datetime: '2024-01-16T17:30:00Z',
    competition: { id: 'pl', name: 'Premier League' },
    minute: 0,
  },
];

describe('useFixtures Hook', () => {
  const mockedFootballService = footballService as jest.Mocked<typeof footballService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch fixtures on mount', async () => {
    mockedFootballService.getFixtures.mockResolvedValue({
      fixtures: mockFixtures,
      hasMore: false,
      total: 2,
    });

    const { result } = renderHook(() => useFixtures());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.fixtures).toEqual(mockFixtures);
    expect(result.current.error).toBeNull();
    expect(mockedFootballService.getFixtures).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
    });
  });

  it('should handle filters correctly', async () => {
    mockedFootballService.getFixtures.mockResolvedValue({
      fixtures: [mockFixtures[0]],
      hasMore: false,
      total: 1,
    });

    const { result } = renderHook(() => useFixtures());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setFilters({ teams: ['1'], status: 'finished' });
    });

    await waitFor(() => {
      expect(mockedFootballService.getFixtures).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        teams: ['1'],
        status: 'finished',
      });
    });
  });

  it('should load more fixtures', async () => {
    mockedFootballService.getFixtures
      .mockResolvedValueOnce({
        fixtures: mockFixtures,
        hasMore: true,
        total: 4,
      })
      .mockResolvedValueOnce({
        fixtures: mockFixtures.slice(0, 1),
        hasMore: false,
        total: 4,
      });

    const { result } = renderHook(() => useFixtures());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasMore).toBe(true);
    expect(result.current.fixtures).toHaveLength(2);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.fixtures).toHaveLength(3);
    expect(result.current.hasMore).toBe(false);
  });

  it('should handle errors', async () => {
    const errorMessage = 'Failed to fetch fixtures';
    mockedFootballService.getFixtures.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFixtures());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.fixtures).toEqual([]);
  });
});
