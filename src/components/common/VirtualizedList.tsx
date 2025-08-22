// src/components/common/VirtualizedList.tsx
import React from 'react';
import { useVirtualScroll } from '@/utils/performance';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export const VirtualizedList = <T,>({
  items,
  itemHeight,
  height,
  renderItem,
  className = '',
}: VirtualizedListProps<T>) => {
  const { visibleItems, totalHeight, offsetY, handleScroll } = useVirtualScroll(
    items,
    itemHeight,
    height
  );

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
