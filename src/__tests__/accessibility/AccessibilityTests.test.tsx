// src/__tests__/accessibility/AccessibilityTests.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FixtureCard } from '@/components/fixtures/FixtureCard';
import { GlobalSearch } from '@/components/search/GlobalSearch';

expect.extend(toHaveNoViolations);

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

describe('Accessibility Tests', () => {
  it('FixtureCard should have no accessibility violations', async () => {
    const { container } = render(
      <FixtureCard fixture={mockFixture} onClick={() => {}} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('GlobalSearch should have no accessibility violations', async () => {
    const { container } = render(
      <GlobalSearch onResultSelect={() => {}} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels and roles', () => {
    const { getByRole, getByLabelText } = render(
      <GlobalSearch onResultSelect={() => {}} />
    );

    expect(getByRole('searchbox')).toBeInTheDocument();
    expect(getByLabelText(/search teams/i)).toBeInTheDocument();
  });
});
