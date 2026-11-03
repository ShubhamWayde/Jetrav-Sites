'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '@repo/auth';

export interface ApiQueryResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string;
  /** Re-runs the request with the same URL. */
  reload: () => void;
}

/**
 * GETs `url` and tracks loading / error state. The request is aborted when the
 * URL changes or the component unmounts, so a slow response can never overwrite
 * a newer one. Pass `null` to skip fetching (e.g. while a param is invalid).
 */
export function useApiQuery<T>(url: string | null, fallbackError = 'Failed to load data.'): ApiQueryResult<T> {
  const [attempt, setAttempt] = useState(0);
  // Identifies the current request; loading = "no result for this key yet".
  // Derived instead of set at the start of the effect (avoids an extra render).
  const key = url === null ? null : `${attempt}:${url}`;
  const [result, setResult] = useState<{ key: string | null; data?: T; error: string }>({
    key: null,
    error: '',
  });

  useEffect(() => {
    if (key === null || url === null) return;
    const controller = new AbortController();

    api
      .get<T>(url, { signal: controller.signal })
      .then((res) => {
        if (!controller.signal.aborted) setResult({ key, data: res.data, error: '' });
      })
      .catch((err: unknown) => {
        // Keep the previous data so the page doesn't blank out on a failed reload
        if (!controller.signal.aborted) {
          setResult((prev) => ({ key, data: prev.data, error: getErrorMessage(err, fallbackError) }));
        }
      });

    return () => controller.abort();
  }, [key, url, fallbackError]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const loading = key !== null && result.key !== key;

  return { data: result.data, loading, error: loading ? '' : result.error, reload };
}
