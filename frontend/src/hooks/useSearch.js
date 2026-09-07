import { useState, useCallback } from 'react';
import { searchService } from '../services/api.js';

const DEFAULT_FILTERS = {
  equipmentTypes: [],
  dateRange: { start: '', end: '' },
  confidenceMin: 0.3,
  searchMode: 'hybrid',
};

export function useSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState('');

  const search = useCallback(async (query, filters = DEFAULT_FILTERS) => {
    setLoading(true);
    setError(null);
    setLastQuery(query);
    try {
      const res = await searchService.search(query, filters);
      const items = res?.results || res?.data || res || [];
      setResults(Array.isArray(items) ? items : []);
      return items;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setLastQuery('');
    setError(null);
  }, []);

  return { results, loading, error, lastQuery, search, clear, defaultFilters: DEFAULT_FILTERS };
}
