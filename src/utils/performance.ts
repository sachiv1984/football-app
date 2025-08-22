// src/utils/performance.ts
import { useEffect, useRef, useCallback, useState } from 'react';

// Intersection Observer Hook for Lazy Loading
export const useIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(callback);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [callback, options]);

  return targetRef;
};

// Virtual Scrolling Hook for Large Lists
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(0);

  useEffect(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 1, items.length);

    setVisibleStart(start);
    setVisibleEnd(end);
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleItems = items.slice(visibleStart, visibleEnd).map((item, index) => ({
    item,
    index: visibleStart + index,
  }));

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
};

// Image Lazy Loading Component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3C/svg%3E',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const observerRef = useIntersectionObserver(
    (entry) => {
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    },
    { threshold: 0.1 }
  );

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={observerRef} className={`relative overflow-hidden ${className}`}>
      {!isInView ? (
        <img 
          src={placeholder} 
          alt={alt} 
          className={`${className} filter blur-sm`}
        />
      ) : (
        <>
          {!isLoaded && !hasError && (
            <img 
              src={placeholder} 
              alt={alt} 
              className={`${className} filter blur-sm absolute inset-0`}
            />
          )}
          <img
            src={hasError ? placeholder : src}
            alt={alt}
            className={`${className} transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
      )}
    </div>
  );
};

// Performance Monitor Hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    apiCallTime: 0,
    memoryUsage: 0,
  });

  const measureRenderTime = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      setMetrics(prev => ({ ...prev, renderTime }));
    };
  }, []);

  const measureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    callName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const apiCallTime = endTime - startTime;
      
      console.log(`${callName} API call time: ${apiCallTime.toFixed(2)}ms`);
      setMetrics(prev => ({ ...prev, apiCallTime }));
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const apiCallTime = endTime - startTime;
      
      console.error(`${callName} API call failed after ${apiCallTime.toFixed(2)}ms:`, error);
      throw error;
    }
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      setMetrics(prev => ({ ...prev, memoryUsage }));
      return memoryUsage;
    }
    return 0;
  }, []);

  return {
    metrics,
    measureRenderTime,
    measureApiCall,
    getMemoryUsage,
  };
};
