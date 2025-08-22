// src/components/common/PerformanceOptimizedFixtureCard.tsx
import React, { memo, useMemo } from 'react';
import { LazyImage } from '@/utils/performance';
import { Fixture } from '@/types';
import { formatDate, formatTime } from '@/utils';

interface PerformanceOptimizedFixtureCardProps {
  fixture: Fixture;
  onClick?: (fixture: Fixture) => void;
  showLeague?: boolean;
}

export const PerformanceOptimizedFixtureCard = memo<PerformanceOptimizedFixtureCardProps>(({
  fixture,
  onClick,
  showLeague = true
}) => {
  const formattedDate = useMemo(() => formatDate(fixture.datetime), [fixture.datetime]);
  const formattedTime = useMemo(() => formatTime(fixture.datetime), [fixture.datetime]);
  
  const isLive = fixture.status === 'live';
  const isFinished = fixture.status === 'finished';

  const handleClick = () => {
    onClick?.(fixture);
  };

  return (
    <div 
      className="fixture-card cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
    >
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-2 right-2 flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-red-500 font-medium">LIVE</span>
        </div>
      )}

      {/* League info */}
      {showLeague && (
        <div className="text-xs text-gray-500 mb-2">{fixture.competition.name}</div>
      )}

      {/* Teams */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <LazyImage
            src={fixture.homeTeam.logo}
            alt={fixture.homeTeam.name}
            className="team-logo"
            placeholder="/placeholder-team.svg"
          />
          <span className="font-medium text-gray-900 truncate">{fixture.homeTeam.name}</span>
        </div>

        {/* Score or Time */}
        <div className="px-3 text-center">
          {isFinished || isLive ? (
            <div className="text-xl font-bold text-gray-900">
              {fixture.homeScore} - {fixture.awayScore}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <div>{formattedTime}</div>
              <div className="text-xs">{formattedDate}</div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 flex-1 justify-end">
          <span className="font-medium text-gray-900 truncate">{fixture.awayTeam.name}</span>
          <LazyImage
            src={fixture.awayTeam.logo}
            alt={fixture.awayTeam.name}
            className="team-logo"
            placeholder="/placeholder-team.svg"
          />
        </div>
      </div>

      {/* Match status */}
      {isLive && (
        <div className="text-center text-xs text-gray-500">
          {fixture.minute}'
        </div>
      )}
    </div>
  );
});

PerformanceOptimizedFixtureCard.displayName = 'PerformanceOptimizedFixtureCard';
