// src/components/search/GlobalSearch.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Star, Filter } from 'lucide-react';
import { useTeamSearch } from '@/hooks';
import { Team, Fixture } from '@/types';

interface SearchResult {
  type: 'team' | 'fixture' | 'league';
  id: string;
  title: string;
  subtitle?: string;
  data: Team | Fixture | any;
}

interface GlobalSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onResultSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    results: teamResults,
    loading: teamLoading,
    search: searchTeams,
    history,
    selectedTeams,
    selectTeam
  } = useTeamSearch();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      // Search teams
      await searchTeams(searchQuery);
      
      // Transform team results
      const teamSearchResults: SearchResult[] = teamResults.map(team => ({
        type: 'team' as const,
        id: team.id,
        title: team.name,
        subtitle: team.league,
        data: team
      }));

      // TODO: Add fixture and league search here
      // const fixtureResults = await searchFixtures(searchQuery);
      // const leagueResults = await searchLeagues(searchQuery);

      setSearchResults(teamSearchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && searchResults[activeIndex]) {
          handleResultSelect(searchResults[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'team') {
      selectTeam(result.data as Team);
    }
    onResultSelect?.(result);
    setIsOpen(false);
    setQuery('');
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search teams, fixtures, leagues..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-electric-yellow focus:border-electric-yellow bg-white text-gray-900 placeholder-gray-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSearchResults([]);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="loading-spinner h-5 w-5" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {!query && history.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Recent Searches
              </h4>
              <div className="space-y-1">
                {history.slice(0, 3).map((term, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(term)}
                    className="block w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Teams */}
          {!query && selectedTeams.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Favorite Teams
              </h4>
              <div className="space-y-1">
                {selectedTeams.slice(0, 3).map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleResultSelect({
                      type: 'team',
                      id: team.id,
                      title: team.name,
                      subtitle: team.league,
                      data: team
                    })}
                  >
                    <img 
                      src={team.logo} 
                      alt={team.name} 
                      className="w-4 h-4 mr-2" 
                    />
                    {team.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query && searchResults.length > 0 && (
            <div className="py-2">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultSelect(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center ${
                    index === activeIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  {result.type === 'team' && result.data.logo && (
                    <img 
                      src={result.data.logo} 
                      alt={result.title}
                      className="w-6 h-6 mr-3 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {result.title}
                    </div>
                    {result.subtitle && (
                      <div className="text-sm text-gray-500 truncate">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  <div className="ml-2 px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full capitalize">
                    {result.type}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query && !loading && searchResults.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try searching for team names or leagues</p>
            </div>
          )}

          {/* Quick Actions */}
          {!query && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Quick actions</span>
                <div className="flex space-x-2">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded">↵</kbd>
                  <span className="text-xs text-gray-500">to select</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
