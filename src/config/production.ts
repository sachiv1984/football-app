export const productionConfig = {
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.footballdata.org/v4',
    key: process.env.REACT_APP_API_KEY || '',
    timeout: 15000,
    enableMockData: false,
    enableLogging: false,
  },
  cache: {
    fixtures: 2 * 60 * 1000,      // 2 minutes
    liveFixtures: 15 * 1000,      // 15 seconds  
    teams: 30 * 60 * 1000,        // 30 minutes
    leagueTable: 15 * 60 * 1000,  // 15 minutes
    aiInsights: 5 * 60 * 1000,    // 5 minutes
    matchStats: 1 * 60 * 1000,    // 1 minute
  },
  features: {
    enableRealTimeUpdates: true,
    enableOfflineMode: true,
    enableErrorReporting: true,
    enablePerformanceLogging: false,
  }
};
