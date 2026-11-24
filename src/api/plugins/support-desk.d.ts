/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listSupportTickets({ status, limit, skip }?: {
    status?: unknown;
    limit?: number;
    skip?: number;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * @param {string} ticketId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getSupportTicket(ticketId: string, { limit, skip }?: {
    limit?: number;
    skip?: number;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * @param {Record<string,unknown>} data
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function createSupportTicket(data: Record<string, unknown>): Promise<import("../joorchin.js").ApiResult>;
/**
 * @param {string} ticketId
 * @param {Record<string,unknown>} body
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function replyToSupportTicket(ticketId: string, body: Record<string, unknown>): Promise<import("../joorchin.js").ApiResult>;
/** Close an owned ticket. Repeated close requests preserve its history.
 * @param {string} ticketId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function closeSupportTicket(ticketId: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * Realtime ticket updates through the authenticated user's self-room. Pushes
 * arrive over the socket; while it is down (and only then, and only in a
 * visible tab) the callback fires on a slow backing-off timer so callers can
 * refetch. Shared transport — see '@/api/plugins/live-updates'.
 * @param {string} ticketId
 * @param {unknown} callback
 */
export function subscribeToSupportTicket(ticketId: string, callback: unknown, { minPollMs }?: {
    minPollMs?: unknown;
}): () => void;
