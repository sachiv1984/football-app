// src/components/mobile/PullToRefresh.tsx
import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  refreshThreshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  refreshThreshold = 70,
  className = ''
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTouchY = useRef<number>(0);
  const currentTouchY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startTouchY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;

    currentTouchY.current = e.touches[0].clientY;
    const distance = currentTouchY.current - startTouchY.current;

    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.6, refreshThreshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    if (!isPulling && !isRefreshing) {
      setPullDistance(0);
    }
  }, [isPulling, isRefreshing]);

  const progress = Math.min(pullDistance / refreshThreshold, 1);
  const shouldTrigger = pullDistance >= refreshThreshold;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-white z-10 transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance - 60}px)`,
          height: '60px',
        }}
      >
        <div className="flex items-center space-x-2 text-gray-600">
          <RefreshCw 
            className={`h-5 w-5 transition-transform duration-200 ${
              isRefreshing ? 'animate-spin' : shouldTrigger ? 'rotate-180' : ''
            }`} 
          />
          <span className="text-sm font-medium">
            {isRefreshing 
              ? 'Refreshing...' 
              : shouldTrigger 
                ? 'Release to refresh' 
                : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {(isPulling || isRefreshing) && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-10">
          <div
            className="h-full bg-blue-500 transition-all duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
