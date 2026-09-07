import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { EQUIPMENT_TYPES, SEARCH_MODES } from '../../utils/constants.js';

export function SearchPanel({ onSearch, loading = false }) {
  const [query, setQuery] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState({
    equipmentTypes: [],
    dateRange: { start: '', end: '' },
    confidenceMin: 0.3,
    searchMode: 'hybrid',
  });

  const toggleEquipment = (opt) => {
    setFilters((f) => ({
      ...f,
      equipmentTypes: f.equipmentTypes.includes(opt)
        ? f.equipmentTypes.filter((e) => e !== opt)
        : [...f.equipmentTypes, opt],
    }));
  };

  const activePills = [
    ...filters.equipmentTypes.map((e) => `CLASS: ${e.toUpperCase()}`),
    ...(filters.confidenceMin > 0 ? [`CONFIDENCE > ${Math.round(filters.confidenceMin * 100)}%`] : []),
    `MODE: ${filters.searchMode.toUpperCase()}`,
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center px-4 py-2.5 bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-teal-500/20 rounded-xl focus-within:border-teal-500">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(query, filters)}
            placeholder="Query system knowledge… (e.g. 'Hydraulic pump overheating symptoms')"
            className="flex-1 ml-2 outline-none bg-transparent text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear query">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => onSearch(query, filters)}
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-teal-50 text-teal-700 border-teal-300' : 'bg-white dark:bg-[#0f172a] text-slate-500 border-slate-200 dark:border-teal-500/20'}`}
          aria-label="Toggle filters"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {activePills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activePills.map((p) => (
            <span key={p} className="text-[10px] font-mono font-bold px-2 py-1 rounded-full bg-slate-900 text-teal-300 dark:bg-teal-500/15">
              {p}
            </span>
          ))}
        </div>
      )}

      {showFilters && (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Equipment Class</p>
            <div className="space-y-1.5">
              {EQUIPMENT_TYPES.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.equipmentTypes.includes(opt)} onChange={() => toggleEquipment(opt)} className="accent-teal-600" />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">
                Min. Confidence: {Math.round(filters.confidenceMin * 100)}%
              </p>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={filters.confidenceMin}
                onChange={(e) => setFilters({ ...filters, confidenceMin: parseFloat(e.target.value) })}
                className="w-full accent-teal-600"
              />
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Engine Mode</p>
              <div className="flex gap-3">
                {SEARCH_MODES.map((m) => (
                  <label key={m} className="flex items-center gap-1.5 capitalize cursor-pointer">
                    <input type="radio" name="search-mode" checked={filters.searchMode === m} onChange={() => setFilters({ ...filters, searchMode: m })} className="accent-teal-600" />
                    {m}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ equipmentTypes: [], dateRange: { start: '', end: '' }, confidenceMin: 0.3, searchMode: 'hybrid' })}
                className="flex-1 py-2 rounded-xl border border-slate-300 font-bold hover:bg-slate-50"
              >
                Clear All
              </button>
              <button onClick={() => setShowFilters(false)} className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPanel;
