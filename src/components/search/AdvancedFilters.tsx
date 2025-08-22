// src/components/search/AdvancedFilters.tsx
interface FilterOption {
  id: string;
  label: string;
  value: string | number;
  count?: number;
}

interface FilterSection {
  id: string;
  title: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'toggle';
  options?: FilterOption[];
  min?: number;
  max?: number;
  value?: any;
}

interface AdvancedFiltersProps {
  sections: FilterSection[];
  onFiltersChange: (filters: Record<string, any>) => void;
  onReset: () => void;
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  sections,
  onFiltersChange,
  onReset,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [filterCounts, setFilterCounts] = useState<Record<string, number>>({});

  const updateFilter = (sectionId: string, value: any) => {
    const newFilters = { ...activeFilters, [sectionId]: value };
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
    
    // Update filter counts
    const counts: Record<string, number> = {};
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '' && 
          !(Array.isArray(val) && val.length === 0)) {
        counts[key] = Array.isArray(val) ? val.length : 1;
      }
    });
    setFilterCounts(counts);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setFilterCounts({});
    onReset();
  };

  const activeFilterCount = Object.keys(filterCounts).length;

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn btn-outline flex items-center space-x-2 ${
          activeFilterCount > 0 ? 'bg-blue-50 border-blue-500 text-blue-700' : ''
        }`}
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute z-40 top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
              disabled={activeFilterCount === 0}
            >
              Clear all
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {sections.map((section) => (
              <div key={section.id} className="p-4 border-b border-gray-100 last:border-b-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {section.title}
                  {filterCounts[section.id] && (
                    <span className="ml-2 text-blue-600">({filterCounts[section.id]})</span>
                  )}
                </label>

                {/* Select Filter */}
                {section.type === 'select' && (
                  <select
                    value={activeFilters[section.id] || ''}
                    onChange={(e) => updateFilter(section.id, e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="">All</option>
                    {section.options?.map((option) => (
                      <option key={option.id} value={option.value}>
                        {option.label} {option.count && `(${option.count})`}
                      </option>
                    ))}
                  </select>
                )}

                {/* Multi-select Filter */}
                {section.type === 'multiselect' && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {section.options?.map((option) => (
                      <label key={option.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={(activeFilters[section.id] || []).includes(option.value)}
                          onChange={(e) => {
                            const currentValues = activeFilters[section.id] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.value]
                              : currentValues.filter((v: any) => v !== option.value);
                            updateFilter(section.id, newValues);
                          }}
                          className="form-checkbox mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {option.label} {option.count && `(${option.count})`}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Range Filter */}
                {section.type === 'range' && (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        min={section.min}
                        max={section.max}
                        value={activeFilters[section.id]?.min || ''}
                        onChange={(e) => updateFilter(section.id, {
                          ...activeFilters[section.id],
                          min: e.target.value ? Number(e.target.value) : undefined
                        })}
                        className="form-input flex-1"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        min={section.min}
                        max={section.max}
                        value={activeFilters[section.id]?.max || ''}
                        onChange={(e) => updateFilter(section.id, {
                          ...activeFilters[section.id],
                          max: e.target.value ? Number(e.target.value) : undefined
                        })}
                        className="form-input flex-1"
                      />
                    </div>
                  </div>
                )}

                {/* Toggle Filter */}
                {section.type === 'toggle' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters[section.id] || false}
                      onChange={(e) => updateFilter(section.id, e.target.checked)}
                      className="form-checkbox mr-2"
                    />
                    <span className="text-sm text-gray-700">Enabled</span>
                  </label>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-primary w-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
