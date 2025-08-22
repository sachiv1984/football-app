// src/components/mobile/MobileFixtureCard.tsx
import React from 'react';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { LazyImage } from '@/utils/performance';
import { Fixture } from '@/types';
import { Star, TrendingUp, Calendar } from 'lucide-react';

interface MobileFixtureCardProps {
  fixture: Fixture;
  isFavorite?: boolean;
  onToggleFavorite?: (fixtureId: string) => void;
  onViewStats?: (fixture: Fixture) => void;
  onViewInsights?: (fixture: Fixture) => void;
  className?: string;
}

export const MobileFixtureCard: React.FC<MobileFixtureCardProps> = ({
  fixture,
  isFavorite = false,
  onToggleFavorite,
  onViewStats,
  onViewInsights,
  className = ''
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const handleSwipe = (swipe: { direction: string }) => {
    if (swipe.direction === 'left') {
      setShowActions(true);
    } else if (swipe.direction === 'right') {
      setShowActions(false);
    }
  };

  const handleTap = () => {
    onViewStats?.(fixture);
  };

  const handleLongPress = () => {
    setShowActions(!showActions);
  };

  const { elementRef, isPressed } = useTouchGestures(
    handleSwipe,
    handleTap,
    handleLongPress
  );

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={elementRef}
        className={`bg-white rounded-lg border border-gray-100 transition-all duration-300 ${
          isPressed ? 'scale-95' : 'scale-100'
        } ${showActions ? 'translate-x-[-80px]' : 'translate-x-0'}`}
      >
        {/* Main Card Content */}
        <div className="p-4">
          {/* Competition */}
          <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
            <span>{fixture.competition.name}</span>
            {fixture.status === 'live' && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-500 font-medium">LIVE</span>
              </div>
            )}
          </div>

          {/* Teams and Score */}
          <div className="space-y-3">
            {/* Home Team */}
            <div className="flex items-center space-x-3">
              <LazyImage
                src={fixture.homeTeam.logo}
                alt={fixture.homeTeam.name}
                className="w-8 h-8 flex-shrink-0"
              />
              <span className="font-medium text-gray-900 flex-1 truncate">
                {fixture.homeTeam.name}
              </span>
              {fixture.status !== 'scheduled' && (
                <span className="text-2xl font-bold text-gray-900 w-8 text-center">
                  {fixture.homeScore}
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex items-center space-x-3">
              <LazyImage
                src={fixture.awayTeam.logo}
                alt={fixture.awayTeam.name}
                className="w-8 h-8 flex-shrink-0"
              />
              <span className="font-medium text-gray-900 flex-1 truncate">
                {fixture.awayTeam.name}
              </span>
              {fixture.status !== 'scheduled' && (
                <span className="text-2xl font-bold text-gray-900 w-8 text-center">
                  {fixture.awayScore}
                </span>
              )}
            </div>
          </div>

          {/* Time/Status */}
          <div className="mt-3 text-center">
            {fixture.status === 'scheduled' && (
              <div className="text-sm text-gray-600">
                <div>{new Date(fixture.datetime).toLocaleDateString()}</div>
                <div className="text-lg font-semibold">
                  {new Date(fixture.datetime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            )}
            {fixture.status === 'live' && (
              <div className="text-sm text-gray-600">
                {fixture.minute}'
              </div>
            )}
            {fixture.status === 'finished' && (
              <div className="text-sm text-green-600 font-medium">
                Full Time
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-0 right-0 h-full flex items-center space-x-1 pr-2 bg-gray-50">
        <button
          onClick={() => onToggleFavorite?.(fixture.id)}
          className={`p-2 rounded-lg transition-colors ${
            isFavorite 
              ? 'bg-yellow-100 text-yellow-600' 
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          <Star className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => onViewInsights?.(fixture)}
          className="p-2 bg-green-100 text-green-600 rounded-lg"
        >
          <TrendingUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
