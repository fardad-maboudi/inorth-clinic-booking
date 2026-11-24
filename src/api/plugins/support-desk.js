/** Support desk client — authenticated, tenant-scoped ticket lifecycle. */
import { createLiveChannel } from './live-updates.js';
import { requestPluginAction } from '@/api/joorchin';

const PLUGIN_ID = 'support-desk';

/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listSupportTickets(/** @type {{status?: unknown, limit?: number, skip?: number}} */ { status, limit = 30, skip = 0 } = {}) {
  return requestPluginAction(PLUGIN_ID, 'tickets', { query: { status, limit, skip } });
}

/**
 * @param {string} ticketId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getSupportTicket(ticketId, { limit = 500, skip = 0 } = {}) {
  return requestPluginAction(PLUGIN_ID, `tickets/${ticketId}`, { query: { limit, skip } });
}

/**
 * @param {Record<string,unknown>} data
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function createSupportTicket(data) {
  return requestPluginAction(PLUGIN_ID, 'tickets', { method: 'POST', data });
}

/**
 * @param {string} ticketId
 * @param {Record<string,unknown>} body
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function replyToSupportTicket(ticketId, body) {
  return requestPluginAction(PLUGIN_ID, `tickets/${ticketId}/replies`, {
    method: 'POST',
    data: { body },
  });
}

/** Close an owned ticket. Repeated close requests preserve its history.
 * @param {string} ticketId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function closeSupportTicket(ticketId) {
  return requestPluginAction(PLUGIN_ID, `tickets/${ticketId}/close`, { method: 'POST', data: {} });
}

/**
 * Realtime ticket updates through the authenticated user's self-room. Pushes
 * arrive over the socket; while it is down (and only then, and only in a
 * visible tab) the callback fires on a slow backing-off timer so callers can
 * refetch. Shared transport — see '@/api/plugins/live-updates'.
 * @param {string} ticketId
 * @param {unknown} callback
 */
export function subscribeToSupportTicket(ticketId, callback, /** @type {{minPollMs?: unknown}} */ { minPollMs } = {}) {
  const channel = createLiveChannel({
    events: ['support-desk.updated'],
    onEvent: (_event, data) => {
      if (String(data?.ticketId) === String(ticketId)) callback(data);
    },
    onPoll: () => { callback({ ticketId, kind: 'poll' }); },
    ...(minPollMs ? { minPollMs } : {}),
  });
  return () => channel.close();
}
