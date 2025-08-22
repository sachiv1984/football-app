// src/components/common/PerformanceMonitor.tsx
import React, { useEffect, useState } from 'react';
import { usePerformanceMonitor } from '@/utils/performance';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right'
}) => {
  const { metrics, getMemoryUsage } = usePerformanceMonitor();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      getMemoryUsage();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [enabled, getMemoryUsage]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black text-white text-xs px-2 py-1 rounded mb-2 opacity-50 hover:opacity-100 transition-opacity"
      >
        Perf Monitor
      </button>
      
      {isVisible && (
        <div className="bg-black text-white text-xs p-3 rounded shadow-lg min-w-48">
          <div className="space-y-1">
            <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
            <div>API: {metrics.apiCallTime.toFixed(2)}ms</div>
            <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
            <div>FPS: {getFPS()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// FPS calculation utility
let lastTime = performance.now();
let frames = 0;
let fps = 0;

function getFPS() {
  const currentTime = performance.now();
  frames++;
  
  if (currentTime >= lastTime + 1000) {
    fps = Math.round((frames * 1000) / (currentTime - lastTime));
    frames = 0;
    lastTime = currentTime;
  }
  
  return fps;
}

// Request animation frame for FPS calculation
function updateFPS() {
  getFPS();
  requestAnimationFrame(updateFPS);
}

if (typeof window !== 'undefined') {
  updateFPS();
}
