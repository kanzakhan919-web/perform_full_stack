'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

// Loads data from one backend endpoint, e.g. useResource('employees').
// Returns { data, error, loading, reload }.
export function useResource(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      setData(await api(path));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading: data === null && !error, reload };
}
