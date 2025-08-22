// src/utils/codeSpittling.ts
import { lazy, ComponentType } from 'react';

// Lazy load route components
export const LazyHomePage = lazy(() => import('@/pages/HomePage'));
export const LazyFixtureDetailPage = lazy(() => import('@/pages/FixtureDetailPage'));
export const LazyLeagueTablePage = lazy(() => import('@/pages/LeagueTablePage'));
export const LazyStatsPage = lazy(() => import('@/pages/StatsPage'));
export const LazyInsightsPage = lazy(() => import('@/pages/InsightsPage'));

// Lazy load heavy components
export const LazyDataVisualization = lazy(() => import('@/components/charts/TeamStatChart'));
export const LazyAdvancedFilters = lazy(() => import('@/components/search/AdvancedFilters'));
export const LazyPreferencesModal = lazy(() => import('@/components/preferences/PreferencesModal'));

// HOC for lazy loading with error boundary
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback: React.ComponentType = () => <div className="animate-pulse bg-gray-200 rounded h-32" />
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return (props: P) => (
    <React.Suspense fallback={<fallback />}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

// Bundle analyzer utility
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // Only run in development
    import('webpack-bundle-analyzer').then(({ BundleAnalyzerPlugin }) => {
      console.log('Bundle analysis available at: http://localhost:8888');
    });
  }
};
