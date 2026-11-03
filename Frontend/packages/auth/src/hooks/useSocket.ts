'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getAccessToken } from '../utils/auth';
import { refreshAccessToken } from '../api';
import { WS_BASE_URL } from '../constants';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SocketMessage {
  event: string;
  data: unknown;
}

type EventHandler = (data: unknown) => void;

const MIN_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useSocket() {
  const ws = useRef<WebSocket | null>(null);
  const handlers = useRef<Map<string, Set<EventHandler>>>(new Map());
  const reconnect = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelay = useRef(MIN_RETRY_MS);
  const stopped = useRef(false);

  const scheduleReconnect = useCallback((connectFn: () => void) => {
    if (stopped.current) return;
    reconnect.current = setTimeout(connectFn, retryDelay.current);
    // Exponential backoff so a down server or dead session isn't hammered
    retryDelay.current = Math.min(retryDelay.current * 2, MAX_RETRY_MS);
  }, []);

  const connect = useCallback(async () => {
    if (stopped.current) return;

    // The token lives in memory; after a reload get one from the refresh cookie.
    if (!getAccessToken() && !(await refreshAccessToken())) {
      scheduleReconnect(connect);
      return;
    }
    const token = getAccessToken();
    if (stopped.current || !token) return;

    const socket = new WebSocket(`${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`);
    ws.current = socket;

    socket.onopen = () => {
      retryDelay.current = MIN_RETRY_MS;
    };

    socket.onmessage = (e) => {
      try {
        const msg: SocketMessage = JSON.parse(e.data as string);
        handlers.current.get(msg.event)?.forEach((fn) => fn(msg.data));
      } catch {
        // ignore malformed frames
      }
    };

    socket.onclose = async () => {
      if (stopped.current) return;
      // A rejected upgrade (e.g. expired token) arrives as an abnormal close,
      // so refresh before the next attempt; give up quietly if the session is gone.
      if (!(await refreshAccessToken())) return;
      scheduleReconnect(connect);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [scheduleReconnect]);

  useEffect(() => {
    stopped.current = false;
    void connect();
    return () => {
      stopped.current = true;
      if (reconnect.current) clearTimeout(reconnect.current);
      ws.current?.close();
    };
  }, [connect]);

  const on = useCallback((event: string, fn: EventHandler) => {
    if (!handlers.current.has(event)) handlers.current.set(event, new Set());
    handlers.current.get(event)!.add(fn);
  }, []);

  const off = useCallback((event: string, fn?: EventHandler) => {
    if (!fn) handlers.current.delete(event);
    else handlers.current.get(event)?.delete(fn);
  }, []);

  return { on, off };
}
