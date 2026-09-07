import { useState, useCallback, useEffect } from 'react';
import { documentService } from '../services/api.js';

export function useDocuments({ autoLoad = true } = {}) {
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentService.list();
      const docs = res?.documents || res?.data || res || [];
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) load().catch(() => {});
  }, [autoLoad, load]);

  const remove = useCallback(async (id) => {
    await documentService.remove(id);
    setDocuments((d) => d.filter((doc) => (doc.id || doc.filename) !== id));
    if (selected?.id === id) setSelected(null);
  }, [selected]);

  return { documents, selected, setSelected, loading, error, reload: load, remove };
}
