// src/components/mobile/SwipeableTabNavigation.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTouchGestures } from '@/hooks/useTouchGestures';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SwipeableTabNavigationProps {
  tabs: Tab[];
  initialTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export const SwipeableTabNavigation: React.FC<SwipeableTabNavigationProps> = ({
  tabs,
  initialTab,
  onTabChange,
  className = ''
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(() => {
    return initialTab ? tabs.findIndex(tab => tab.id === initialTab) || 0 : 0;
  });

  const contentRef = useRef<HTMLDivElement>(null);

  const handleSwipe = (swipe: { direction: string }) => {
    if (swipe.direction === 'left' && activeTabIndex < tabs.length - 1) {
      changeTab(activeTabIndex + 1);
    } else if (swipe.direction === 'right' && activeTabIndex > 0) {
      changeTab(activeTabIndex - 1);
    }
  };

  const { elementRef } = useTouchGestures(handleSwipe);

  const changeTab = (newIndex: number) => {
    setActiveTabIndex(newIndex);
    onTabChange?.(tabs[newIndex].id);
  };

  return (
    <div className={`${className}`}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => changeTab(index)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              index === activeTabIndex
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {tab.icon && <tab.icon className="h-4 w-4" />}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div 
        ref={(el) => {
          elementRef.current = el;
          contentRef.current = el;
        }}
        className="relative overflow-hidden"
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateX(-${activeTabIndex * 100}%)`,
            width: `${tabs.length * 100}%`
          }}
        >
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className="w-full flex-shrink-0 p-4"
              style={{ width: `${100 / tabs.length}%` }}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </div>

      {/* Swipe Indicator */}
      <div className="flex justify-center mt-4 space-x-1">
        {tabs.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === activeTabIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
