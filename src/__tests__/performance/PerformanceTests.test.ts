// src/__tests__/performance/PerformanceTests.test.ts
import { measureRenderTime, analyzeMemoryUsage } from '@/utils/testUtils';
import { render } from '@testing-library/react';
import React from 'react';

// Mock heavy component for testing
const HeavyComponent = ({ items }: { items: number[] }) => (
  <div>
    {items.map(item => (
      <div key={item} style={{ height: '100px', backgroundColor: `hsl(${item * 10}, 50%, 50%)` }}>
        Item {item}
      </div>
    ))}
  </div>
);

describe('Performance Tests', () => {
  it('should render large lists within acceptable time', () => {
    const items = Array.from({ length: 1000 }, (_, i) => i);
    
    const renderTime = measureRenderTime(() => {
      render(<HeavyComponent items={items} />);
    });

    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('should not cause memory leaks', () => {
    const initialMemory = analyzeMemoryUsage();
    
    // Render and unmount component multiple times
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(<HeavyComponent items={[1, 2, 3]} />);
      unmount();
    }

    const finalMemory = analyzeMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be minimal (less than 5MB)
    expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
  });
});
