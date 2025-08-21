/**
 * Custom error classes for API service layer
 */

export class ApiError extends Error {
  public status: number;
  public code: string;
  public timestamp: string;
  public details?: any;

  constructor(message: string, status: number = 500, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.timestamp = new Date().toISOString();
    this.details = details;
  }
}

export class NetworkError extends Error {
  public timestamp: string;
  public retryable: boolean;

  constructor(message: string, retryable: boolean = true) {
    super(message);
    this.name = 'NetworkError';
    this.timestamp = new Date().toISOString();
    this.retryable = retryable;
  }
}

export class ValidationError extends Error {
  public field?: string;
  public timestamp: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.timestamp = new Date().toISOString();
  }
}

export class TimeoutError extends Error {
  public timeout: number;
  public timestamp: string;

  constructor(message: string, timeout: number) {
    super(message);
    this.name = 'TimeoutError';
    this.timeout = timeout;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Get user-friendly error message from any error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please check your API key.';
      case 403:
        return 'Access denied. You don\'t have permission to access this resource.';
      case 404:
        return 'The requested data was not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof NetworkError) {
    return 'Network connection failed. Please check your internet connection.';
  }

  if (error instanceof TimeoutError) {
    return 'Request timed out. Please try again.';
  }

  if (error instanceof ValidationError) {
    return `Invalid data: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

/**
 * Log error for debugging (development only)
 */
export const logError = (error: unknown, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
    console.error('Error:', error);
    
    if (error instanceof ApiError) {
      console.table({
        Status: error.status,
        Code: error.code,
        Message: error.message,
        Timestamp: error.timestamp,
      });
      if (error.details) {
        console.log('Details:', error.details);
      }
    }
    
    console.groupEnd();
  }
};
