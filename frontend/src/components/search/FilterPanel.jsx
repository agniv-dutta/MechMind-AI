import React from 'react';

// FilterPanel is rendered inside SearchPanel; this file exposes the equipment/date/confidence
// filter contract from the setup guide for direct reuse.
export function FilterPanel({ filters, onChange }) {
  return (
    <div className="text-xs text-slate-500">
      Use the filter toggle in the search bar — active filters: {(filters?.equipmentTypes || []).join(', ') || 'none'} ·
      {' '}min confidence {Math.round((filters?.confidenceMin ?? 0.3) * 100)}% · mode {filters?.searchMode || 'hybrid'}
      <button onClick={() => onChange?.({ equipmentTypes: [], dateRange: { start: '', end: '' }, confidenceMin: 0.3, searchMode: 'hybrid' })} className="ml-2 font-bold text-teal-700 hover:underline">
        Clear
      </button>
    </div>
  );
}

export default FilterPanel;
