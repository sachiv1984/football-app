import { getCacheTTL } from '@/config';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

/**
 * Simple in-memory cache with TTL support
 */
class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = { hits: 0, misses: 0, size: 0 };

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const defaultTtl = getCacheTTL('fixtures'); // Default fallback
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || defaultTtl,
    });

    this.stats.size = this.cache.size;
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    let cleared = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleared++;
      }
    }

    this.stats.size = this.cache.size;
    return cleared;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total === 0 ? 0 : (this.stats.hits / total) * 100;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Helper functions for common cache patterns
export const getCacheKey = (prefix: string, ...params: (string | number)[]): string => {
  return `${prefix}:${params.join(':')}`;
};

export const cacheOrFetch = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  // Try cache first
  const cached = cacheManager.get<T>(key);
  if (cached) {
    return cached;
  }

  // Fetch and cache
  const data = await fetcher();
  cacheManager.set(key, data, ttl);
  return data;
};

// Development utilities
export const CacheDebug = {
  logStats: () => {
    if (process.env.NODE_ENV === 'development') {
      const stats = cacheManager.getStats();
      console.log('📊 Cache Statistics:', {
        ...stats,
        hitRate: `${cacheManager.getHitRate().toFixed(2)}%`,
      });
    }
  },
  
  logKeys: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 Cache Keys:', cacheManager.keys());
    }
  },

  clear: () => {
    if (process.env.NODE_ENV === 'development') {
      cacheManager.clearAll();
      console.log('🗑️ Cache cleared');
    }
  }
};
