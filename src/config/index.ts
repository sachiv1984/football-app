import { developmentConfig } from './development';
import { productionConfig } from './production';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

export const config = isProduction ? productionConfig : developmentConfig;

// Export individual sections for easier access
export const apiConfig = config.api;
export const cacheConfig = config.cache;
export const featureFlags = config.features;

// Helper functions
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature];
};

export const getCacheTTL = (type: keyof typeof config.cache): number => {
  return config.cache[type];
};

// Development utilities
export const DevConfig = {
  enableMockMode: () => {
    if (isDevelopment) {
      (config.api as any).enableMockData = true;
      console.log('🎭 Mock data mode enabled');
    }
  },
  enableApiMode: () => {
    if (isDevelopment) {
      (config.api as any).enableMockData = false;
      console.log('🌐 API data mode enabled');
    }
  },
  logConfig: () => {
    if (isDevelopment) {
      console.log('📋 Current Configuration:');
      console.table(config);
    }
  }
};
