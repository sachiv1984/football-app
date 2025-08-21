export const developmentConfig = {
  api: {
    baseUrl: 'http://localhost:3001/api',
    key: 'demo_development_key',
    timeout: 10000,
    enableMockData: true,
    enableLogging: true,
  },
  cache: {
    fixtures: 5 * 60 * 1000,      // 5 minutes
    liveFixtures: 30 * 1000,      // 30 seconds
    teams: 60 * 60 * 1000,        // 1 hour
    leagueTable: 30 * 60 * 1000,  // 30 minutes
    aiInsights: 10 * 60 * 1000,   // 10 minutes
    matchStats: 2 * 60 * 1000,    // 2 minutes
  },
  features: {
    enableRealTimeUpdates: true,
    enableOfflineMode: true,
    enableErrorReporting: false,
    enablePerformanceLogging: true,
  }
};
