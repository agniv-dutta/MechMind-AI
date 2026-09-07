import { useState, useCallback } from 'react';
import { graphService } from '../services/api.js';
import { ENTITY_COLORS } from '../types/index.js';

export function useGraph() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const colorFor = (type) => ENTITY_COLORS[type] || '#64748b';

  const query = useCallback(async (entity, opts) => {
    setLoading(true);
    setError(null);
    try {
      const res = await graphService.query(entity, opts);
      const n = (res?.nodes || []).map((node) => ({ ...node, color: node.color || colorFor(node.type) }));
      setNodes(n);
      setEdges(res?.edges || []);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { nodes, edges, selected, setSelected, loading, error, query };
}
