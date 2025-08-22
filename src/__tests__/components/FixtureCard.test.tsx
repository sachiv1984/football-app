// src/__tests__/components/FixtureCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FixtureCard } from '@/components/fixtures/FixtureCard';

const mockFixture = {
  id: '1',
  homeTeam: { id: '1', name: 'Liverpool', logo: '/liverpool.png', league: 'Premier League' },
  awayTeam: { id: '2', name: 'Arsenal', logo: '/arsenal.png', league: 'Premier League' },
  homeScore: 2,
  awayScore: 1,
  status: 'finished' as const,
  datetime: '2024-01-15T15:00:00Z',
  competition: { id: 'pl', name: 'Premier League' },
  minute: 90,
};

describe('FixtureCard Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders fixture information correctly', () => {
    render(<FixtureCard fixture={mockFixture} onClick={mockOnClick} />);

    expect(screen.getByText('Liverpool')).toBeInTheDocument();
    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Premier League')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<FixtureCard fixture={mockFixture} onClick={mockOnClick} />);

    fireEvent.click(screen.getByTestId('fixture-card'));

    expect(mockOnClick).toHaveBeenCalledWith(mockFixture);
  });

  it('displays live indicator for live matches', () => {
    const liveFixture = { ...mockFixture, status: 'live' as const, minute: 45 };
    
    render(<FixtureCard fixture={liveFixture} onClick={mockOnClick} />);

    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText("45'")).toBeInTheDocument();
  });

  it('displays scheduled time for upcoming matches', () => {
    const scheduledFixture = {
      ...mockFixture,
      status: 'scheduled' as const,
      datetime: '2024-01-16T15:00:00Z',
      homeScore: 0,
      awayScore: 0,
    };

    render(<FixtureCard fixture={scheduledFixture} onClick={mockOnClick} />);

    expect(screen.getByText('15:00')).toBeInTheDocument();
  });
});
