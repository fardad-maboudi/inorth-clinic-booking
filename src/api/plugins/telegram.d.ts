/**
 * Is a bot connected for this site?
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function isTelegramEnabled(): Promise<import("../joorchin.js").ApiResult>;
/**
 * t.me deep link that opts the visitor into updates (optionally a topic).
 * @param {unknown} topic
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getBotLink(topic: unknown): Promise<import("../joorchin.js").ApiResult>;
/**
 * t.me deep link that links the visitor's chat to an order for status pushes.
 *
 * The link is MINTED BY THE SERVER and signed. It used to be built here from
 * the raw order id, so anyone who guessed an id could subscribe themselves to a
 * stranger's fulfilment messages; the bot now refuses any payload it did not
 * sign. Returns null when the caller is not the order's owner.
 * @param {string} orderId
 * @param {string} sessionId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getOrderTrackingLink(orderId: string, sessionId: string): Promise<import("../joorchin.js").ApiResult>;
export { APP_ID };
import { APP_ID } from '@/api/joorchin';
