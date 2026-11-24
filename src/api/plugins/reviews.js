/**
 * reviews plugin client — import from '@/api/plugins/reviews'.
 * Thin wrappers over the Joorchin plugin-data SDK (shared multi-tenant collections,
 * provisioned on install). Never hardcode /api/v1/apps URLs — the SDK injects the app id.
 */
import {
  listPluginRecords,
  getPluginRecord,
} from '@/api/joorchin';

const PLUGIN_ID = 'reviews';

/**
 * @param {Record<string,unknown>=} params
 * @returns {Promise<import('../joorchin.js').RowList<import('../plugin-models.js').ReviewsReviewRow>>}
 */
export async function listReviews(params = {}) {
  return listPluginRecords(PLUGIN_ID, 'review', params);
}

/**
 * @param {string} id
 * @returns {Promise<import('../plugin-models.js').ReviewsReviewRow>}
 */
export async function getReview(id) {
  return getPluginRecord(PLUGIN_ID, 'review', id);
}

import { requestPluginAction } from '@/api/joorchin';

/**
 * Public storefront read — APPROVED reviews only, newest first.
 * @param {string} targetId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 * @example
 * const reviews = await listApprovedReviews(product._id, { limit: 10 });
 * const { count, averageRating } = await reviewSummary(product._id);
 */
export function listApprovedReviews(targetId, { limit = 20, skip = 0 } = {}) {
  return requestPluginAction('reviews', 'reviews', { query: { targetId, limit, skip } });
}

/**
 * Public aggregate badge: { count, averageRating } over approved reviews.
 * @param {string} targetId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function reviewSummary(targetId) {
  return requestPluginAction('reviews', 'summary', { query: { targetId } });
}

/**
 * Shopper submission — lands as 'pending'; requires login; deduped per target.
 * @param {Record<string,unknown>} data
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function createReview(data) {
  return requestPluginAction('reviews', 'reviews', { method: 'POST', data });
}
/**
 * @param {string[]} targetIds
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function reviewSummaries(targetIds) {
  return requestPluginAction('reviews', 'summary', { query: { targetIds: targetIds.join(',') } });
}
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listMyReviews(/** @type {{targetId?: unknown}} */ { targetId } = {}) {
  return requestPluginAction('reviews', 'mine', { query: targetId ? { targetId } : {} });
}
/**
 * @param {string} id
 * @param {Record<string,unknown>} data
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function updateMyReview(id, data) {
  return requestPluginAction('reviews', `reviews/${id}`, { method: 'PUT', data });
}
