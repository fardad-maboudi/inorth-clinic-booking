import { joorchinFetch as fetch } from "../joorchin.js";
/** loyalty-club semantic client — server-owned state transitions only. */
import { getAuthHeaders } from '../auth.js';
import { APP_ID, joorchinResponseError } from '@/api/joorchin';

const BASE = `/api/v1/apps/${APP_ID}/plugins/loyalty-club`;

async function call(path, { method = 'GET', body } = {}) {
  const response = await fetch(BASE + path, {
    method,
    headers: { ...getAuthHeaders(), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw joorchinResponseError(response.status, text);
  }
  return response.json();
}

/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getMyLoyalty() { return call('/me'); }
/**
 * @param {string} orderId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function earnOrderPoints(orderId) {
  return call('/orders/' + encodeURIComponent(orderId) + '/earn', { method: 'POST' });
}
export function redeemPoints(points, idempotencyKey = crypto.randomUUID()) {
  return call('/redeem', { method: 'POST', body: { points, idempotencyKey } });
}
