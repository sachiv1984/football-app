import React, { useState } from 'react';
import { 
  useFixtures, 
  useMatchDetails, 
  useLeagueTable, 
  useAIInsights,
  useTeamSearch 
} from '@/hooks';
import { DevConfig } from '@/config';

/**
 * Development component for testing hooks
 * Remove this in production
 */
const HookTester: React.FC = () => {
  const [selectedFixtureId, setSelectedFixtureId] = useState('fixture-1');

  // Test hooks
  const fixtures = useFixtures({ limit: 5 });
  const matchDetails = useMatchDetails(selectedFixtureId);
  const leagueTable = useLeagueTable();
  const aiInsights = useAIInsights([selectedFixtureId]);
  const teamSearch = useTeamSearch();

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">🧪 Hook Testing (Dev Only)</h2>
      
      {/* Configuration Controls */}
      <div className="mb-6 p-4 bg-white rounded">
        <h3 className="font-semibold mb-2">Configuration</h3>
        <div className="space-x-2">
          <button onClick={DevConfig.enableMockMode} className="btn btn-sm btn-primary">
            Enable Mock Data
          </button>
          <button onClick={DevConfig.enableApiMode} className="btn btn-sm btn-secondary">
            Enable API Data
          </button>
          <button onClick={DevConfig.logConfig} className="btn btn-sm btn-outline">
            Log Config
          </button>
        </div>
      </div>

      {/* Fixtures Hook Test */}
      <div className="mb-6 p-4 bg-white rounded">
        <h3 className="font-semibold mb-2">📅 useFixtures Hook</h3>
        <p>Loading: {fixtures.loading.toString()}</p>
        <p>Error: {fixtures.error || 'None'}</p>
        <p>Fixtures count: {fixtures.fixtures.length}</p>
        <p>Has more: {fixtures.hasMore.toString()}</p>
        <div className="mt-2 space-x-2">
          <button onClick={fixtures.refetch} className="btn btn-sm">Refetch</button>
          <button onClick={fixtures.loadMore} className="btn btn-sm">Load More</button>
          <button onClick={() => fixtures.setFilters({ status: 'live' })} className="btn btn-sm">
            Filter Live
          </button>
        </div>
      </div>

      {/* Match Details Hook Test */}
      <div className="mb-6 p-4 bg-white rounded">
        <h3 className="font-semibold mb-2">⚽ useMatchDetails Hook</h3>
        <select 
          value={selectedFixtureId}
          onChange={(e) => setSelectedFixtureId(e.target.value)}
          className="form-select mb-2"
        >
          {fixtures.fixtures.slice(0, 3).map(fixture => (
            <option key={fixture.id} value={fixture.id}>
              {fixture.homeTeam.name} vs {fixture.awayTeam.name}
            </option>
          ))}
        </select>
        <p>Fixture loaded: {matchDetails.fixture ? 'Yes' : 'No'}</p>
        <p>Stats loaded: {matchDetails.matchStats ? 'Yes' : 'No'}</p>
        <p>AI Insights: {matchDetails.aiInsights.length}</p>
        <p>Player Stats: {matchDetails.playerStats.length}</p>
        <div className="mt-2 space-x-2">
          <button onClick={matchDetails.refetch.all} className="btn btn-sm">Refetch All</button>
          <button onClick={matchDetails.loadPlayerStats} className="btn btn-sm">Load Players</button>
        </div>
      </div>

      {/* League Table Hook Test */}
      <div className="mb-6 p-4 bg-white rounded">
        <h3 className="font-semibold mb-2">🏆 useLeagueTable Hook</h3>
        <p>Loading: {leagueTable.loading.toString()}</p>
        <p>Error: {leagueTable.error || 'None'}</p>
        <p>Teams count: {leagueTable.table.length}</p>
        <p>Competition: {leagueTable.selectedCompetition}</p>
        <p>Last updated: {leagueTable.lastUpdated ? new Date(leagueTable.lastUpdated).toLocaleTimeString() : 'Never'}</p>
        <div className="mt-2 space-x-2">
          <button onClick={leagueTable.refetch} className="btn btn-sm">Refetch</button>
          <button onClick={leagueTable.refresh} className="btn btn-sm">Force Refresh</button>
        </div>
      </div>

      {/* AI Insights Hook Test */}
      <div className="mb-6 p-4 bg-white rounded">
        <h3 className="font-semibold mb-2">🤖 useAIInsights Hook</h3>
        <p>Loading: {aiInsights.loading.toString()}</p>
        <p>Error: {aiInsights.error || 'None'}</p>
        <p>Total insights: {aiInsights.getTotalInsights()}</p>
        <p>High confidence: {aiInsights.getConfidenceStats().high}</p>
        <div className="mt-2 space-x-2">
          <button onClick={aiInsights.refetch} className="btn btn-sm">Refetch</button>
          <button onClick={() => aiInsights.setFilters({ confidence: 'high' })} className="btn btn-sm">
            Filter High Confidence
          </button>
          <button onClick={aiInsights.clearFilters} className="btn btn-sm">Clear Filters</button>
        </div>
      </div>

      {/* Team Search Hook Test */}
      <div className="mb-6 p-4 bg-white rounded">
        <h3 className="font-semibold mb-2">🔍 useTeamSearch Hook</h3>
        <input
          type="text"
          placeholder="Search teams..."
          value={teamSearch.query}
          onChange={(e) => teamSearch.search(e.target.value)}
          className="form-input mb-2"
        />
        <p>Loading: {teamSearch.loading.toString()}</p>
        <p>Error: {teamSearch.error || 'None'}</p>
        <p>Results: {teamSearch.results.length}</p>
        <p>Selected teams: {teamSearch.selectedTeams.length}</p>
        <p>Search history: {teamSearch.history.length}</p>
        <div className="mt-2 space-x-2">
          <button onClick={teamSearch.clear} className="btn btn-sm">Clear</button>
          <button onClick={teamSearch.clearHistory} className="btn btn-sm">Clear History</button>
          <button onClick={teamSearch.clearSelected} className="btn btn-sm">Clear Selected</button>
        </div>
      </div>
    </div>
  );
};

export default HookTester;
