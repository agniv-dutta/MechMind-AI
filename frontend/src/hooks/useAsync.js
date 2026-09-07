import { useState, useCallback } from 'react';

export function useAsync(asyncFn) {
  const [state, setState] = useState({ data: null, error: null, loading: false });
  const run = useCallback(
    async (...args) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await asyncFn(...args);
        setState({ data, error: null, loading: false });
        return data;
      } catch (error) {
        setState({ data: null, error, loading: false });
        throw error;
      }
    },
    [asyncFn]
  );
  return { ...state, run, set: setState };
}
