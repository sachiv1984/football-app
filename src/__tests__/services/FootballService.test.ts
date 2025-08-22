// src/__tests__/services/FootballService.test.ts
import { footballService } from '@/services/api/FootballService';
import { apiClient } from '@/services/api/ApiClient';

jest.mock('@/services/api/ApiClient');

describe('FootballService', () => {
  const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFixtures', () => {
    it('should fetch fixtures with default parameters', async () => {
      const mockResponse = {
        data: { fixtures: [], hasMore: false, total: 0 }
      };
      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await footballService.getFixtures();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/fixtures', {
        params: { limit: 20, offset: 0 }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should apply filters correctly', async () => {
      const mockResponse = {
        data: { fixtures: [], hasMore: false, total: 0 }
      };
      mockedApiClient.get.mockResolvedValue(mockResponse);

      await footballService.getFixtures({
        teams: ['1', '2'],
        status: 'live',
        limit: 10,
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/fixtures', {
        params: {
          limit: 10,
          offset: 0,
          teams: '1,2',
          status: 'live',
        }
      });
    });
  });

  describe('getMatchDetails', () => {
    it('should fetch match details by id', async () => {
      const mockMatch = { id: '1', homeTeam: {}, awayTeam: {} };
      mockedApiClient.get.mockResolvedValue({ data: mockMatch });

      const result = await footballService.getMatchDetails('1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/fixtures/1');
      expect(result).toEqual(mockMatch);
    });

    it('should handle errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(footballService.getMatchDetails('1')).rejects.toThrow('Network error');
    });
  });
});
