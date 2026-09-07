import React, { useState } from 'react';
import DocumentLibrary from '../components/DocumentLibrary.jsx';
import DocumentDetails from '../components/DocumentDetails.jsx';

export function DocumentsPage({ onOpenUpload }) {
  const [selected, setSelected] = useState(null);
  if (selected) {
    return <DocumentDetails doc={selected} onBack={() => setSelected(null)} />;
  }
  return <DocumentLibrary onOpenUpload={onOpenUpload} onSelectDocument={setSelected} />;
}

export default DocumentsPage;
