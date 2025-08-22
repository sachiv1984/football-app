// src/components/mobile/MobileSearchModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Star } from 'lucide-react';
import { GlobalSearch } from '@/components/search/GlobalSearch';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect?: (result: any) => void;
}

export const MobileSearchModal: React.FC<MobileSearchModalProps> = ({
  isOpen,
  onClose,
  onResultSelect
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 md:hidden">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <GlobalSearch
            className="w-full"
            onResultSelect={(result) => {
              onResultSelect?.(result);
              onClose();
            }}
          />
        </div>
      </div>

      {/* Search Tips */}
      <div className="p-4">
        <div className="text-sm text-gray-600 mb-4">
          Try searching for teams, fixtures, or leagues
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Quick Search
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Premier League', 'Champions League', 'Liverpool', 'Manchester United'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Popular Teams
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Liverpool', league: 'Premier League', logo: '/team-logos/liverpool.png' },
                { name: 'Real Madrid', league: 'La Liga', logo: '/team-logos/real-madrid.png' },
                { name: 'Bayern Munich', league: 'Bundesliga', logo: '/team-logos/bayern.png' },
              ].map((team) => (
                <button
                  key={team.name}
                  className="flex items-center space-x-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <img src={team.logo} alt={team.name} className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{team.name}</div>
                    <div className="text-xs text-gray-500">{team.league}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
