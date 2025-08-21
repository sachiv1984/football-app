/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Filter parameters for API requests
 */
export interface FilterParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  competition?: string;
  team?: string;
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * API endpoint configuration
 */
export interface EndpointConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
}

/**
 * Mock data configuration
 */
export interface MockConfig {
  enabled: boolean;
  delay?: number;
  failureRate?: number; // 0-1, probability of simulated failures
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    api: 'up' | 'down';
    database: 'up' | 'down';
    cache: 'up' | 'down';
  };
  responseTime: number;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  retryAfter?: number; // Seconds
}
