import { joorchinFetch as fetch } from "../joorchin.js";
/**
 * Notifications plugin client — per-user inbox + live updates.
 * Import from '@/api/plugins/notifications'.
 *
 * subscribeToNotifications(callback) gives you live badge updates: a WebSocket
 * push when possible, a slow visibility-aware poll only while the socket is
 * down. It returns an unsubscribe function and tears itself down when the last
 * listener leaves. All listeners share ONE socket and ONE timer — never add an
 * interval of your own on top of this.
 */
import { getAuthHeaders } from '../auth.js';
import { createLiveChannel } from './live-updates.js';
import { joorchinResponseError } from '@/api/joorchin';

const APP_ID = import.meta.env.VITE_APP_ID;
const BASE = `/api/v1/apps/${APP_ID}/plugins/notifications`;

let listeners = [];
let channel = null;
let lastUnread = null;

async function parse(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw joorchinResponseError(response.status, text);
  }
  return response.json();
}

/**
 * Signed-in user's inbox rows (newest first).
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function listMyNotifications({ limit = 30, skip = 0 } = {}) {
  const data = await parse(await fetch(`${BASE}/my?limit=${limit}&skip=${skip}`, {
    headers: getAuthHeaders(),
  }));
  return data;
}

/**
 * Unread badge count. Prefer listMyNotifications().meta.unread on cold start.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function unreadCount() {
  const data = await parse(await fetch(`${BASE}/unread-count`, {
    headers: getAuthHeaders(),
  }));
  return Number(data?.count ?? 0);
}

/**
 * Mark specific rows read; omit ids to mark everything read.
 * @param {string[]} ids
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function markRead(ids) {
  return parse(await fetch(`${BASE}/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(ids ? { ids } : { all: true }),
  }));
}

/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function markAllRead() {
  return markRead();
}

/**
 * Live updates. callback receives { row?, unread? }: row on each pushed
 * notification, unread on every count refresh (including once right away).
 * @param {unknown} callback
 */
export function subscribeToNotifications(callback) {
  listeners.push(callback);
  if (!channel) {
    channel = createLiveChannel({
      events: ['notification'],
      onEvent: (_event, data) => {
        if (Number.isFinite(lastUnread)) lastUnread += 1;
        emit({ row: data, ...(lastUnread === null ? {} : { unread: lastUnread }) });
      },
      // Fallback only. unread-count is ONE server-side query; listMyNotifications
      // is four, so never poll that for a badge.
      onPoll: refresh,
    });
  }
  refresh().catch(() => {});
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    listeners = listeners.filter((fn) => fn !== callback);
    if (!listeners.length) teardown();
  };
}

function emit(payload) {
  for (const fn of [...listeners]) fn(payload);
}

async function refresh() {
  try {
    lastUnread = await unreadCount();
    emit({ unread: lastUnread });
    return lastUnread;
  } catch {
    // Not signed in or offline — stay silent.
    return undefined;
  }
}

function teardown() {
  channel?.close();
  channel = null;
  lastUnread = null;
}

export { APP_ID };
