import { sdkClientIdentity } from "../joorchin.js";
/**
 * Live updates over the authenticated user's WebSocket self-room, with a
 * disciplined polling fallback. Import from '@/api/plugins/live-updates'.
 *
 *   const channel = createLiveChannel({
 *     events: ['notification'],
 *     onEvent: (event, data) => { ... },   // socket push
 *     onPoll: async () => fetchCount(),    // fallback only; return a value and
 *   });                                    // repeats of it trigger backoff
 *   channel.close();
 *
 * Polling runs ONLY while the socket is down and the tab is visible. Do not add
 * your own setInterval on top of this — that is the bug this module replaces.
 */
import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthHeaders } from '../auth.js';

const APP_ID = import.meta.env.VITE_APP_ID;

/** Fallback cadence. Slow on purpose: a disconnected client is the exception. */
const DEFAULT_MIN_POLL_MS = 60000;
const DEFAULT_MAX_POLL_MS = 300000;
/** Socket reconnect backoff. */
const RECONNECT_MIN_MS = 1000;
const RECONNECT_MAX_MS = 30000;

/** Signed-in user id, read from the JWT payload. Empty when signed out. */
export function currentUserId() {
  try {
    const token = getAuthHeaders().Authorization?.replace(/^Bearer\s+/i, '') || '';
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return String(payload.sub || '');
  } catch {
    return '';
  }
}

/**
 * @param {{room?: string, events?: string[], onEvent?: (event: string, data: unknown) => void, onPoll?: Function, minPollMs?: number, maxPollMs?: number}} [options]
 * @returns {{isConnected: () => boolean, close: () => void}}
 */
export function createLiveChannel({
  room,
  events = [],
  onEvent,
  onPoll,
  minPollMs = DEFAULT_MIN_POLL_MS,
  maxPollMs = DEFAULT_MAX_POLL_MS,
} = {}) {
  const userId = currentUserId();
  const targetRoom = room || (userId ? `user:${userId}` : '');

  let closed = false;
  let ws = null;
  let socketOpen = false;
  let reconnectTimer = null;
  let reconnectDelay = RECONNECT_MIN_MS;
  let pollTimer = null;
  let pollDelay = minPollMs;
  let lastPollValue;
  let havePolled = false;

  const hidden = () =>
    typeof document !== 'undefined' && document.visibilityState === 'hidden';

  function clearTimer(timer) {
    if (timer) clearTimeout(timer);
    return null;
  }

  async function runPoll() {
    if (closed || !onPoll) return;
    try {
      const value = await onPoll();
      if (closed) return;
      // Unchanged result ⇒ nothing is happening ⇒ ask less often. Any change
      // snaps straight back to the fast cadence. Returning nothing means "I
      // cannot tell", which must read as changed — silently stretching to the
      // max interval behind a caller that never opted in would look like the
      // feature is broken.
      const unchanged =
        havePolled && value !== undefined && value === lastPollValue;
      pollDelay = unchanged ? Math.min(pollDelay * 2, maxPollMs) : minPollMs;
      lastPollValue = value;
      havePolled = true;
    } catch {
      // Signed out or offline — the next tick retries.
    }
  }

  /**
   * Self-rescheduling timeout, not setInterval: the delay changes as it backs
   * off, and a backgrounded tab must not accumulate a queue of due ticks.
   */
  function schedulePoll() {
    pollTimer = clearTimer(pollTimer);
    if (closed || !onPoll) return;
    pollTimer = setTimeout(async () => {
      pollTimer = null;
      if (closed) return;
      if (!socketOpen && !hidden()) await runPoll();
      schedulePoll();
    }, pollDelay);
  }

  function onVisibilityChange() {
    if (closed || hidden()) return;
    // Catch up on whatever was skipped while hidden, but only if push is not
    // already covering us.
    if (!socketOpen) void runPoll();
  }

  function scheduleReconnect() {
    if (closed || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_MS);
  }

  function connect() {
    if (closed || !targetRoom) return;
    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const token = getAuthHeaders().Authorization?.replace(/^Bearer\s+/i, '') || '';
      const params = new URLSearchParams({ app_id: APP_ID });
      if (token) params.set('token', token);
      const identity = sdkClientIdentity();
      if (identity) params.set('client', identity);
      ws = new WebSocket(`${proto}//${window.location.host}/ws-user-apps?${params}`);

      ws.addEventListener('open', () => {
        socketOpen = true;
        reconnectDelay = RECONNECT_MIN_MS;
        try {
          ws.send(JSON.stringify({ type: 'join', room: targetRoom }));
        } catch {
          // Socket died between open and send; close will reconnect.
        }
      });

      ws.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message?.type !== 'broadcast') return;
          if (events.length && !events.includes(message.event)) return;
          onEvent?.(message.event, message.data);
        } catch {
          // Unparseable frame — ignore it rather than tearing the socket down.
        }
      });

      const onDown = () => {
        socketOpen = false;
        ws = null;
        // Resync as soon as we notice, then let the fallback timer take over
        // until the socket is back.
        if (!hidden()) void runPoll();
        scheduleReconnect();
      };
      ws.addEventListener('close', onDown);
      ws.addEventListener('error', () => {
        if (ws && ws.readyState === WebSocket.OPEN) return;
        onDown();
      });
    } catch {
      ws = null;
      socketOpen = false;
      scheduleReconnect();
    }
  }

  connect();
  schedulePoll();
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  return {
    isConnected: () => socketOpen,
    close() {
      if (closed) return;
      closed = true;
      pollTimer = clearTimer(pollTimer);
      reconnectTimer = clearTimer(reconnectTimer);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
      if (ws) {
        try { ws.close(); } catch { /* ignore socket close failure */ }
        ws = null;
      }
      socketOpen = false;
    },
  };
}

/**
 * A query that refreshes itself when the server pushes one of `events`
 * (and polls slowly only while the socket is down). Use instead of your own
 * setInterval or WebSocket:
 *
 *   const { data } = useLiveQuery({
 *     queryKey: ['notifications'],
 *     queryFn: listNotifications,
 *     events: ['notification'],
 *   });
 *
 * `room` defaults to the signed-in user's room; signed-out visitors just get
 * the plain query.
 * @param {{queryKey: readonly unknown[], queryFn: Function, events?: string[], room?: string, enabled?: boolean, staleTime?: number}} options
 * @returns {{data: any, error: Error|null, isLoading: boolean, isPending: boolean, isError: boolean, isFetching: boolean, isSuccess: boolean, refetch: Function}}
 */
export function useLiveQuery({ queryKey, queryFn, events = [], room, enabled = true, staleTime = 30_000 }) {
  const client = useQueryClient();
  const query = useQuery({ queryKey, queryFn, enabled, staleTime });
  const latest = useRef({ queryKey, queryFn });
  useEffect(() => {
    latest.current = { queryKey, queryFn };
  });
  const eventsKey = events.join('|');
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;
    const channel = createLiveChannel({
      room,
      events,
      onEvent: () => {
        void client.invalidateQueries({ queryKey: latest.current.queryKey });
      },
      // Fallback only. A cheap fingerprint lets the channel back off while
      // nothing changes; the fetched data lands in the cache either way.
      onPoll: async () => {
        const data = await client.fetchQuery({
          queryKey: latest.current.queryKey,
          queryFn: latest.current.queryFn,
          staleTime: 0,
        });
        try {
          return JSON.stringify(data);
        } catch {
          return undefined;
        }
      },
    });
    return () => channel.close();
    // `events` is compared by value through eventsKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, enabled, room, eventsKey]);
  return query;
}
