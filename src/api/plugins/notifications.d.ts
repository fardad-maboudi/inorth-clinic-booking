/**
 * Signed-in user's inbox rows (newest first).
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listMyNotifications({ limit, skip }?: {
    limit?: number;
    skip?: number;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * Unread badge count. Prefer listMyNotifications().meta.unread on cold start.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function unreadCount(): Promise<import("../joorchin.js").ApiResult>;
/**
 * Mark specific rows read; omit ids to mark everything read.
 * @param {string[]} ids
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function markRead(ids: string[]): Promise<import("../joorchin.js").ApiResult>;
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function markAllRead(): Promise<import("../joorchin.js").ApiResult>;
/**
 * Live updates. callback receives { row?, unread? }: row on each pushed
 * notification, unread on every count refresh (including once right away).
 * @param {unknown} callback
 */
export function subscribeToNotifications(callback: unknown): () => void;
export const APP_ID: any;
