import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMatchDetails } from '@/hooks';
import { 
  MatchHeader, 
  TabNavigation, 
  StatsTable, 
  AIInsightCard,
  LoadingSpinner,
  ErrorMessage 
} from '@/components';

const FixtureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('stats');

  const {
    fixture,
    matchStats,
    aiInsights,
    playerStats,
    loading,
    error,
    refetch,
    loadPlayerStats
  } = useMatchDetails(id!);

  // Load player stats when Player Stats tab is clicked
  useEffect(() => {
    if (activeTab === 'players') {
      loadPlayerStats();
    }
  }, [activeTab, loadPlayerStats]);

  if (loading.fixture) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" className="mx-auto" />
      </div>
    );
  }

  if (error.fixture || !fixture) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          message={error.fixture || 'Fixture not found'} 
          onRetry={refetch.fixture}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Match Header */}
      <MatchHeader fixture={fixture} />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { id: 'stats', label: 'Match Stats' },
          { id: 'insights', label: 'AI Insights', badge: aiInsights.length },
          { id: 'players', label: 'Player Stats' },
          { id: 'predictions', label: 'Predictions' }
        ]}
      />

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'stats' && (
          <div>
            {loading.stats ? (
              <LoadingSpinner className="mx-auto" />
            ) : error.stats ? (
              <ErrorMessage message={error.stats} onRetry={refetch.stats} />
            ) : matchStats ? (
              <StatsTable matchStats={matchStats} />
            ) : null}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="grid gap-4">
            {loading.insights ? (
              <LoadingSpinner className="mx-auto" />
            ) : error.insights ? (
              <ErrorMessage message={error.insights} onRetry={refetch.insights} />
            ) : aiInsights.length > 0 ? (
              aiInsights.map(insight => (
                <AIInsightCard key={insight.id} insight={insight} />
              ))
            ) : (
              <p className="text-center text-gray-500">No insights available</p>
            )}
          </div>
        )}

        {activeTab === 'players' && (
          <div>
            {loading.players ? (
              <LoadingSpinner className="mx-auto" />
            ) : error.players ? (
              <ErrorMessage message={error.players} onRetry={refetch.players} />
            ) : playerStats.length > 0 ? (
              <div className="grid gap-4">
                {/* Player stats table would go here */}
                <p>Player stats loaded: {playerStats.length} players</p>
              </div>
            ) : (
              <p className="text-center text-gray-500">No player stats available</p>
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div>
            {/* Additional predictions content */}
            <p className="text-center text-gray-500">Predictions coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixtureDetail;
