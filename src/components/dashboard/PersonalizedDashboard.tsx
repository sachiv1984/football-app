// src/components/dashboard/PersonalizedDashboard.tsx
import React, { useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useFixtures, useLeagueTable, useAIInsights } from '@/hooks';
import { Settings, Plus, Star, TrendingUp, Calendar, Trophy } from 'lucide-react';

interface DashboardWidget {
  id: string;
  type: 'favorite_fixtures' | 'favorite_table' | 'ai_insights' | 'recent_results' | 'upcoming_matches';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
}

const defaultWidgets: DashboardWidget[] = [
  { id: '1', type: 'favorite_fixtures', title: 'Favorite Team Fixtures', size: 'large', position: 0 },
  { id: '2', type: 'ai_insights', title: 'Top AI Insights', size: 'medium', position: 1 },
  { id: '3', type: 'favorite_table', title: 'League Standings', size: 'medium', position: 2 },
  { id: '4', type: 'upcoming_matches', title: 'Today\'s Matches', size: 'small', position: 3 },
];

interface PersonalizedDashboardProps {
  className?: string;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  className = ''
}) => {
  const { preferences } = useUserPreferences();
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const { fixtures: favoriteFixtures } = useFixtures({
    teams: preferences.favoriteTeams,
    limit: 5
  });

  const { table: favoriteTable } = useLeagueTable();
  
  const { insights: topInsights } = useAIInsights(
    favoriteFixtures.map(f => f.id),
    { minConfidence: preferences.betInsights.minConfidence }
  );

  const renderWidget = (widget: DashboardWidget) => {
    const baseClasses = `bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow`;
    const sizeClasses = {
      small: 'col-span-1',
      medium: 'col-span-1 md:col-span-2',
      large: 'col-span-1 md:col-span-3'
    };

    switch (widget.type) {
      case 'favorite_fixtures':
        return (
          <div className={`${baseClasses} ${sizeClasses[widget.size]}`}>
            <div className="flex items-center space-x-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
            </div>
            <div className="space-y-3">
              {favoriteFixtures.slice(0, 3).map((fixture) => (
                <div key={fixture.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img src={fixture.homeTeam.logo} alt={fixture.homeTeam.name} className="w-6 h-6" />
                    <span className="font-medium text-sm">{fixture.homeTeam.name}</span>
                    <span className="text-gray-500 text-sm">vs</span>
                    <span className="font-medium text-sm">{fixture.awayTeam.name}</span>
                    <img src={fixture.awayTeam.logo} alt={fixture.awayTeam.name} className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{fixture.date}</div>
                    <div className="text-xs text-gray-500">{fixture.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'ai_insights':
        return (
          <div className={`${baseClasses} ${sizeClasses[widget.size]}`}>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
            </div>
            <div className="space-y-3">
              {topInsights.slice(0, 2).map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-teal-50 to-transparent border-l-4 border-teal-500 rounded-r-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{insight.market}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'favorite_table':
        return (
          <div className={`${baseClasses} ${sizeClasses[widget.size]}`}>
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
            </div>
            <div className="space-y-2">
              {favoriteTable.slice(0, 5).map((team, index) => (
                <div key={team.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 text-center font-medium">{index + 1}</span>
                    <img src={team.logo} alt={team.name} className="w-5 h-5" />
                    <span className={`font-medium ${preferences.favoriteTeams.includes(team.id) ? 'text-blue-600' : ''}`}>
                      {team.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{team.played}</span>
                    <span className="font-semibold text-gray-900">{team.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'upcoming_matches':
        return (
          <div className={`${baseClasses} ${sizeClasses[widget.size]}`}>
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
            </div>
            <div className="space-y-2">
              {favoriteFixtures.slice(0, 3).map((fixture) => (
                <div key={fixture.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{fixture.homeTeam.name} vs {fixture.awayTeam.name}</span>
                    <span className="text-xs text-gray-500">{fixture.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${className}`}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="text-gray-600">Personalized view of your favorite teams and insights</p>
        </div>
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className={`btn ${isCustomizing ? 'btn-primary' : 'btn-outline'} flex items-center space-x-2`}
        >
          <Settings className="h-4 w-4" />
          <span>{isCustomizing ? 'Done' : 'Customize'}</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Favorite Teams</p>
              <p className="text-xl font-semibold text-gray-900">{preferences.favoriteTeams.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">High Confidence Tips</p>
              <p className="text-xl font-semibold text-gray-900">
                {topInsights.filter(i => i.confidence >= 80).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Matches</p>
              <p className="text-xl font-semibold text-gray-900">{favoriteFixtures.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Favorite Leagues</p>
              <p className="text-xl font-semibold text-gray-900">{preferences.favoriteLeagues.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {widgets
          .sort((a, b) => a.position - b.position)
          .map((widget) => (
            <div key={widget.id} className={isCustomizing ? 'relative group' : ''}>
              {renderWidget(widget)}
              {isCustomizing && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}

        {/* Add Widget Button */}
        {isCustomizing && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
            <div className="text-center">
              <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Add Widget</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty State for No Favorites */}
      {preferences.favoriteTeams.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Favorite Teams Yet</h3>
          <p className="text-gray-500 mb-4">
            Add some favorite teams to see personalized fixtures and insights
          </p>
          <button className="btn btn-primary">
            Browse Teams
          </button>
        </div>
      )}
    </div>
  );
};
