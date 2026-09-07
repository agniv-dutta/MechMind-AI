import React from 'react';
import { FileText } from 'lucide-react';
import { DocumentCard } from './DocumentCard.jsx';
import { LoadingSpinner } from '../common/LoadingSpinner.jsx';
import { useDocuments } from '../../hooks/useDocuments.js';

export function DocumentBrowser({ viewMode = 'grid', onSelect, onDelete }) {
  const { documents, loading, error } = useDocuments();

  if (loading) return <LoadingSpinner label="Loading documents…" />;
  if (error) return <p className="text-sm text-red-600">Failed to load documents: {error.message}</p>;
  if (!documents.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-12 h-12 text-slate-300 mb-3" />
        <h3 className="font-bold text-slate-900">No documents uploaded yet</h3>
        <p className="text-sm text-slate-500">Upload your first technical manual to get started</p>
      </div>
    );
  }
  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-2'}>
      {documents.map((doc) => (
        <DocumentCard key={doc.id || doc.filename} doc={doc} viewMode={viewMode} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default DocumentBrowser;
