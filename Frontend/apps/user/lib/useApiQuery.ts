'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '@repo/auth';

export interface ApiQueryState<T> {
  data: T | null;
  loading: boolean;
  /** User-facing message, or null when the last load succeeded. */
  error: string | null;
  /** HTTP status of the failure (0 for network errors), null when there is none. */
  errorStatus: number | null;
  /** Re-runs the request (e.g. from a "Try again" button). */
  reload: () => void;
}

/**
 * GETs `url` on mount (and whenever `url` or `reload` changes), aborting the
 * request if the component unmounts first. Pass `null` to skip fetching.
 */
export function useApiQuery<T>(url: string | null, fallbackError = 'Something went wrong. Please try again.'): ApiQueryState<T> {
  const [attempt, setAttempt] = useState(0);
  // Identifies the current request; loading = "no result for this key yet".
  // Derived instead of set at the start of the effect (avoids an extra render).
  const key = url === null ? null : `${attempt}:${url}`;
  const [result, setResult] = useState<{
    key: string | null;
    data: T | null;
    error: string | null;
    errorStatus: number | null;
  }>({ key: null, data: null, error: null, errorStatus: null });

  useEffect(() => {
    if (key === null || url === null) return;
    const controller = new AbortController();

    api.get<T>(url, { signal: controller.signal })
      .then((res) => {
        if (controller.signal.aborted) return;
        setResult({ key, data: res.data ?? null, error: null, errorStatus: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        // Network failures surface as a bare TypeError ("Failed to fetch") — show the friendly fallback
        setResult((prev) => ({
          key,
          data: prev.data,
          error: err instanceof ApiError ? err.message : fallbackError,
          errorStatus: err instanceof ApiError ? err.status : 0,
        }));
      });

    return () => controller.abort();
  }, [key, url, fallbackError]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const loading = key !== null && result.key !== key;
  const error = loading ? null : result.error;
  const errorStatus = loading ? null : result.errorStatus;
  const data = result.data;

  return useMemo(
    () => ({ data, loading, error, errorStatus, reload }),
    [data, loading, error, errorStatus, reload],
  );
}
