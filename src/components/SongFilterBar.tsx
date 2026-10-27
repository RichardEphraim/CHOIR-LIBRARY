import React from 'react';
import { SearchFilterState } from '../types/choir';
import { Search, X, RotateCcw } from 'lucide-react';

interface FilterFacets {
  broughtByOptions: string[];
  composerOptions: string[];
  yearOptions: string[];
  tagOptions: string[];
}

interface SongFilterBarProps {
  filters: SearchFilterState;
  facets: FilterFacets;
  resultCount: number;
  totalChurchSongs: number;
  onFilterChange: (updated: Partial<SearchFilterState>) => void;
  onResetFilters: () => void;
}

export const SongFilterBar: React.FC<SongFilterBarProps> = ({
  filters,
  facets,
  resultCount,
  totalChurchSongs,
  onFilterChange,
  onResetFilters,
}) => {
  const isFiltered =
    Boolean(filters.searchQuery) ||
    filters.origin !== 'all' ||
    filters.tag !== 'all' ||
    filters.broughtBy !== 'all' ||
    filters.yearBrought !== 'all';

  return (
    <div className="space-y-3 bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          placeholder="Search by title, composer, lyrics excerpt, or chorister..."
          className="w-full pl-10 pr-9 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:bg-white focus:border-neutral-900 transition-colors"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onFilterChange({ searchQuery: '' })}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Origin segmented filter & dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Origin Filter */}
        <div className="flex items-center p-0.5 bg-neutral-100 rounded-lg border border-neutral-200 shrink-0">
          <button
            onClick={() => onFilterChange({ origin: 'all' })}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filters.origin === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All Songs
          </button>
          <button
            onClick={() => onFilterChange({ origin: 'Original' })}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filters.origin === 'Original'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Originals
          </button>
          <button
            onClick={() => onFilterChange({ origin: 'External' })}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filters.origin === 'External'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            External
          </button>
        </div>

        {/* Secondary filters: Category, Brought By, Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={filters.tag}
            onChange={(e) => onFilterChange({ tag: e.target.value })}
            className="py-1 px-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs focus:outline-none focus:border-neutral-900 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {facets.tagOptions.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          {/* Brought By */}
          <select
            value={filters.broughtBy}
            onChange={(e) => onFilterChange({ broughtBy: e.target.value })}
            className="py-1 px-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs focus:outline-none focus:border-neutral-900 cursor-pointer max-w-[140px] truncate"
          >
            <option value="all">All Choristers</option>
            {facets.broughtByOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {/* Sort order */}
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as SearchFilterState['sortBy'] })}
            className="py-1 px-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs focus:outline-none focus:border-neutral-900 cursor-pointer"
          >
            <option value="dateBrought-desc">Newest Introduced</option>
            <option value="dateBrought-asc">Oldest Introduced</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer pl-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
