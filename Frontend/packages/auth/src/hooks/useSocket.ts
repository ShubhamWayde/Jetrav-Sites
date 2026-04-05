'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getAccessToken } from '../utils/auth';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SocketMessage {
  event: string;
  data: unknown;
}

type EventHandler = (data: unknown) => void;

// ── Defaults ───────────────────────────────────────────────────────────────────

const WS_BASE =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WS_URL) ||
  'ws://localhost:8080';

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useSocket() {
  const ws        = useRef<WebSocket | null>(null);
  const handlers  = useRef<Map<string, Set<EventHandler>>>(new Map());
  const reconnect = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopped   = useRef(false);

  const connect = useCallback(() => {
    if (stopped.current) return;

    // Re-read token on every attempt — it may have been stored after mount.
    const token = getAccessToken();
    if (!token) {
      // Not authenticated yet — retry after a short delay.
      reconnect.current = setTimeout(connect, 2000);
      return;
    }

    const url    = `${WS_BASE}/ws?token=${token}`;
    const socket = new WebSocket(url);
    ws.current   = socket;

    socket.onopen = () => {
      // Clear any pending reconnect timer on successful open.
      if (reconnect.current) {
        clearTimeout(reconnect.current);
        reconnect.current = null;
      }
    };

    socket.onmessage = (e) => {
      try {
        const msg: SocketMessage = JSON.parse(e.data as string);
        handlers.current.get(msg.event)?.forEach(fn => fn(msg.data));
      } catch {
        // ignore malformed frames
      }
    };

    socket.onclose = (ev) => {
      if (stopped.current) return;
      // 4001 = custom code we could use for "unauthorized" — don't retry.
      // Normal close codes: reconnect after 3 s.
      if (ev.code === 1008 /* Policy Violation = auth error */ || ev.code === 4001) return;
      reconnect.current = setTimeout(connect, 3000);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    stopped.current = false;
    connect();
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
