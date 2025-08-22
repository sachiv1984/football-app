// src/__tests__/utils/performance.test.ts
import { renderHook } from '@testing-library/react';
import { useIntersectionObserver } from '@/utils/performance';

// Mock IntersectionObserver
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

global.IntersectionObserver = jest.fn(() => ({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: mockDisconnect,
})) as jest.Mock;

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create and observe target element', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useIntersectionObserver(mockCallback));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold: 0.1, rootMargin: '50px' })
    );

    // Simulate element being set
    const mockElement = document.createElement('div');
    Object.defineProperty(result.current, 'current', {
      value: mockElement,
      writable: true,
    });

    expect(mockObserve).toHaveBeenCalledWith(mockElement);
  });

  it('should cleanup observer on unmount', () => {
    const mockCallback = jest.fn();
    const { unmount } = renderHook(() => useIntersectionObserver(mockCallback));

    unmount();

    expect(mockUnobserve).toHaveBeenCalled();
  });
});

// src/__tests__/integration/FixtureFlow.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from '@/App';

// Mock API responses
jest.mock('@/services', () => ({
  footballService: {
    getFixtures: jest.fn().mockResolvedValue({
      fixtures: [
        {
          id: '1',
          homeTeam: { id: '1', name: 'Liverpool', logo: '/liverpool.png' },
          awayTeam: { id: '2', name: 'Arsenal', logo: '/arsenal.png' },
          homeScore: 2,
          awayScore: 1,
          status: 'finished',
          datetime: '2024-01-15T15:00:00Z',
          competition: { id: 'pl', name: 'Premier League' },
        },
      ],
      hasMore: false,
      total: 1,
    }),
    getMatchDetails: jest.fn().mockResolvedValue({
      id: '1',
      homeTeam: { id: '1', name: 'Liverpool', logo: '/liverpool.png' },
      awayTeam: { id: '2', name: 'Arsenal', logo: '/arsenal.png' },
      homeScore: 2,
      awayScore: 1,
      status: 'finished',
    }),
    getMatchStats: jest.fn().mockResolvedValue({
      homeStats: { shotsOnTarget: 6, corners: 5 },
      awayStats: { shotsOnTarget: 3, corners: 4 },
    }),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Fixture Flow Integration', () => {
  it('should display fixtures and navigate to detail page', async () => {
    renderWithProviders(<App />);

    // Wait for fixtures to load
    await waitFor(() => {
      expect(screen.getByText('Liverpool')).toBeInTheDocument();
      expect(screen.getByText('Arsenal')).toBeInTheDocument();
    });

    // Click on fixture to navigate to detail page
    fireEvent.click(screen.getByTestId('fixture-card'));

    // Should navigate to fixture detail page
    await waitFor(() => {
      expect(window.location.pathname).toContain('/fixtures/1');
    });
  });
});
