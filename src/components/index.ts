// src/components/index.ts - Central Export File

export { default as Header } from './common/Header/Header';
export { default as Footer } from './common/Footer/Footer';
export { default as Button } from './common/Button/Button';
export { default as Badge } from './common/Badge/Badge';
export { default as Card } from './common/Card/Card';

// Tab Navigation
export { default as TabNavigation } from './common/TabNavigation/TabNavigation';

// Fixtures
export { default as HeroSection } from './fixtures/HeroSection/HeroSection';
export { default as FixtureCard } from './fixtures/FixtureCard/FixtureCard';
export { default as FixturesList } from './fixtures/FixturesList/FixturesList';
export { default as MatchHeader } from './fixtures/MatchHeader/MatchHeader';

// League
export { default as LeagueTable } from './league/LeagueTable/LeagueTable';

// Stats
export { default as StatsTable } from './stats/StatsTable/StatsTable';
export { default as StatRow } from './stats/StatsTable/StatRow';

// AI Insights
export { default as AIInsightCard } from './insights/AIInsightCard/AIInsightCard';
export { default as InsightsContainer } from './insights/AIInsightCard/InsightsContainer';
export { default as ConfidenceIndicator } from './insights/AIInsightCard/ConfidenceIndicator';

// Types
export type { Fixture, Team, LeagueTableRow, Competition, AIInsight, MatchStats, TeamStats } from '../types';
export type { Tab, TabNavigationProps } from './common/TabNavigation/TabNavigation.types';
export type { MatchHeaderProps } from './fixtures/MatchHeader/MatchHeader.types';
export type { StatsTableProps, StatRowProps } from './stats/StatsTable/StatsTable.types';
export type { AIInsightCardProps, InsightsContainerProps } from './insights/AIInsightCard/AIInsightCard.types';
