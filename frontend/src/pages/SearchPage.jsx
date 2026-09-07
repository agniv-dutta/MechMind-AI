import React, { useState } from 'react';
import SearchPanel from '../components/search/SearchPanel.jsx';
import SearchResults from '../components/SearchResults.jsx';
import AdvancedSearch from '../components/AdvancedSearch.jsx';
import { useSearch } from '../hooks/useSearch.js';
import { useNotifications } from '../context/NotificationContext.jsx';

export function SearchPage({ onUseInChat, onViewDoc }) {
  const { results, loading, search } = useSearch();
  const { notify } = useNotifications();
  const [advanced, setAdvanced] = useState(false);

  const handleSearch = async (query, filters) => {
    if (!query.trim()) return;
    try {
      await search(query, filters);
    } catch (err) {
      notify(`Search failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      <SearchPanel onSearch={handleSearch} loading={loading} />
      <button onClick={() => setAdvanced(!advanced)} className="text-xs font-bold text-teal-700 hover:underline">
        {advanced ? 'Hide advanced options' : 'Show advanced options'}
      </button>
      {advanced && <AdvancedSearch onUseInChat={onUseInChat} onViewDoc={onViewDoc} />}
      <SearchResults results={results} loading={loading} onUseInChat={onUseInChat} />
    </div>
  );
}

export default SearchPage;
