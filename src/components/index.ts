// src/components/index.ts - Central export file for all design system components

// Common Components
export { default as Button } from './common/Button/Button';
export { default as Card } from './common/Card/Card';
export { default as Badge } from './common/Badge/Badge';
export { default as Table } from './common/Table/Table';
export { default as Modal } from './common/Modal/Modal';
export { default as Header } from './common/Header/Header';
export { default as Footer } from './common/Footer/Footer';

// Fixture Components
export { default as HeroSection } from './fixtures/HeroSection/HeroSection';

// League Components
// export { default as LeagueTable } from './league/LeagueTable/LeagueTable';

// Stats Components  
// export { default as StatsTable } from './stats/StatsTable/StatsTable';

// Insights Components
// export { default as AIInsightCard } from './insights/AIInsightCard/AIInsightCard';

// Type exports - Common
export type { ButtonProps, ButtonVariant, ButtonSize } from './common/Button/Button.types';
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './common/Card/Card.types';
export type { BadgeProps, BadgeVariant } from './common/Badge/Badge.types';
export type { TableProps, Column, SortOrder } from './common/Table/Table.types';
export type { ModalProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps } from './common/Modal/Modal.types';

// Type exports - Fixtures
export type { 
  HeroSectionProps, 
  FeaturedFixture, 
  Team, 
  Competition, 
  AIInsight 
} from './fixtures/HeroSection/HeroSection.types';

// Type exports - League
// export type { LeagueTableProps, TeamData } from './league/LeagueTable/LeagueTable.types';

// Type exports - Stats
// export type { StatsTableProps, MatchStats } from './stats/StatsTable/StatsTable.types';

// Type exports - Insights
// export type { AIInsightCardProps, InsightData } from './insights/AIInsightCard/AIInsightCard.types';

// Design tokens
export { designTokens } from '../styles/designTokens';
