// src/components/mobile/FloatingActionButton.tsx
import React, { useState } from 'react';
import { Plus, Star, TrendingUp, Filter, X } from 'lucide-react';

interface FABAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`fixed bottom-20 right-4 z-40 ${className}`}>
      {/* Action Buttons */}
      <div className={`space-y-2 mb-2 transition-all duration-300 ${
        isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <div
            key={action.id}
            className="flex items-center space-x-3"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <div className="bg-white px-3 py-2 rounded-lg shadow-md text-sm font-medium text-gray-900 whitespace-nowrap">
              {action.label}
            </div>
            <button
              onClick={() => {
                action.onClick();
                setIsExpanded(false);
              }}
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 ${
                action.color || 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <action.icon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={toggleExpanded}
        className={`w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        }`}
      >
        {isExpanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </div>
  );
};
