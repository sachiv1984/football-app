import React from 'react';
import { useFixtures, useLeagueTable } from '@/hooks';
import { FixturesList, LeagueTable, LoadingSpinner, ErrorMessage } from '@/components';

const HomePage: React.FC = () => {
  const {
    fixtures,
    loading: fixturesLoading,
    error: fixturesError,
    hasMore,
    loadMore,
    setFilters
  } = useFixtures({ limit: 10 });

  const {
    table,
    loading: tableLoading,
    error: tableError,
    refresh: refreshTable
  } = useLeagueTable();

  const handleFilterChange = (filters: any) => {
    setFilters(filters);
  };

  const handleLoadMore = async () => {
    await loadMore();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-center mb-8">
          Football Fixtures & Stats
        </h1>
      </section>

      {/* Fixtures Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Upcoming Fixtures</h2>
          <button
            onClick={() => setFilters({ status: 'live' })}
            className="btn btn-secondary btn-sm"
          >
            Show Live Matches
          </button>
        </div>

        {fixturesError ? (
          <ErrorMessage message={fixturesError} />
        ) : (
          <FixturesList
            fixtures={fixtures}
            loading={fixturesLoading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onFilterChange={handleFilterChange}
          />
        )}
      </section>

      {/* League Table Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">League Table</h2>
          <button
            onClick={refreshTable}
            className="btn btn-outline btn-sm"
            disabled={tableLoading}
          >
            {tableLoading ? <LoadingSpinner size="sm" /> : 'Refresh'}
          </button>
        </div>

        {tableError ? (
          <ErrorMessage message={tableError} />
        ) : (
          <LeagueTable
            table={table}
            loading={tableLoading}
          />
        )}
      </section>
    </div>
  );
};

export default HomePage;
