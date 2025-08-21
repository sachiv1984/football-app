import axios, { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from 'axios';
import { apiConfig, featureFlags } from '@/config';
import { cacheManager, getCacheKey, getCacheTTL } from './cache';
import { ApiError, NetworkError, TimeoutError, logError } from './errors';
import type { ApiResponse, RequestOptions, RateLimitInfo } from './types';

/**
 * HTTP client with caching, retries, and error handling
 */
class ApiClient {
  private client: AxiosInstance;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(config: CreateAxiosDefaults = {}) {
    this.client = axios.create({
      baseURL: apiConfig.baseUrl,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(apiConfig.key && {
          'Authorization': `Bearer ${apiConfig.key}`
        }),
        'X-Requested-With': 'XMLHttpRequest',
        ...config.headers
      },
      ...config
    });

    this.setupInterceptors();
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add timestamp to requests
        config.metadata = { startTime: Date.now() };

        // Log requests if enabled
        if (apiConfig.enableLogging) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data
          });
        }

        return config;
      },
      (error) => {
        logError(error, 'Request Interceptor');
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - (response.config.metadata?.startTime || 0);

        // Update rate limit info from headers
        this.updateRateLimitInfo(response.headers);

        // Log responses if enabled
        if (apiConfig.enableLogging) {
          console.log(`[API Response] ${response.status} ${response.config.url} (${duration}ms)`, {
            data: response.data
          });
        }

        // Log performance if enabled
        if (featureFlags.enablePerformanceLogging && duration > 1000) {
          console.warn(`[Performance] Slow request: ${response.config.url} took ${duration}ms`);
        }

        return response;
      },
      (error) => {
        const duration = Date.now() - (error.config?.metadata?.startTime || 0);

        if (apiConfig.enableLogging) {
          console.error(`[API Error] ${error.config?.url} (${duration}ms)`, error);
        }

        // Transform axios errors to custom errors
        if (error.code === 'ECONNABORTED') {
          return Promise.reject(new TimeoutError('Request timeout', apiConfig.timeout));
        }

        if (!error.response) {
          return Promise.reject(new NetworkError('Network error - please check your connection'));
        }

        const { status, data } = error.response;
        return Promise.reject(new ApiError(
          data?.message || `HTTP ${status} Error`,
          status,
          data?.code || 'HTTP_ERROR',
          data
        ));
      }
    );
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimitInfo(headers: any): void {
    if (headers['x-ratelimit-limit']) {
      this.rateLimitInfo = {
        limit: parseInt(headers['x-ratelimit-limit']),
        remaining: parseInt(headers['x-ratelimit-remaining'] || '0'),
        reset: parseInt(headers['x-ratelimit-reset'] || '0'),
        retryAfter: headers['retry-after'] ? parseInt(headers['retry-after']) : undefined
      };
    }
  }

  /**
   * Execute HTTP request with retries and caching
   */
  async request<T>(
    config: AxiosRequestConfig,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      cache = true,
      cacheTTL,
      retries = 3,
      timeout,
      signal
    } = options;

    // Generate cache key
    const cacheKey = getCacheKey(
      config.method || 'GET',
      config.url || '',
      JSON.stringify(config.params || {}),
      JSON.stringify(config.data || {})
    );

    // Try cache first (for GET requests)
    if (cache && config.method === 'GET') {
      const cached = cacheManager.get<ApiResponse<T>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Setup request config
    const requestConfig: AxiosRequestConfig = {
      ...config,
      timeout: timeout || apiConfig.timeout,
      signal,
    };

    let lastError: Error;

    // Retry logic
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.client.request<T>(requestConfig);
        
        const apiResponse: ApiResponse<T> = {
          data: response.data,
          success: true,
          timestamp: new Date().toISOString(),
        };

        // Cache successful GET requests
        if (cache && config.method === 'GET') {
          const ttl = cacheTTL || getCacheTTL('fixtures');
          cacheManager.set(cacheKey, apiResponse, ttl);
        }

        return apiResponse;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof ApiError && [400, 401, 403, 404].includes(error.status)) {
          break;
        }

        // Don't retry on timeout errors for the last attempt
        if (error instanceof TimeoutError && attempt === retries) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s, etc.
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    logError(lastError, 'API Request');
    throw lastError;
  }

  /**
   * GET request
   */
  async get<T>(url: string, params?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, params }, options);
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data }, { cache: false, ...options });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data }, { cache: false, ...options });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url }, { cache: false, ...options });
  }

  /**
   * Clear cache entry
   */
  clearCache(key: string): boolean {
    return cacheManager.clear(key);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    cacheManager.clearAll();
  }

  /**
   * Get rate limit info
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', {}, { cache: false, retries: 1, timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
