/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getMyLoyalty(): Promise<import("../joorchin.js").ApiResult>;
/**
 * @param {string} orderId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function earnOrderPoints(orderId: string): Promise<import("../joorchin.js").ApiResult>;
export function redeemPoints(points: any, idempotencyKey?: `${string}-${string}-${string}-${string}-${string}`): Promise<any>;
