/**
 * @param {Record<string,unknown>=} params
 * @returns {Promise<import('../joorchin.js').RowList<import('../plugin-models.js').ReviewsReviewRow>>}
 */
export function listReviews(params?: Record<string, unknown> | undefined): Promise<import("../joorchin.js").RowList<import("../plugin-models.js").ReviewsReviewRow>>;
/**
 * @param {string} id
 * @returns {Promise<import('../plugin-models.js').ReviewsReviewRow>}
 */
export function getReview(id: string): Promise<import("../plugin-models.js").ReviewsReviewRow>;
/**
 * Public storefront read — APPROVED reviews only, newest first.
 * @param {string} targetId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 * @example
 * const reviews = await listApprovedReviews(product._id, { limit: 10 });
 * const { count, averageRating } = await reviewSummary(product._id);
 */
export function listApprovedReviews(targetId: string, { limit, skip }?: {
    limit?: number;
    skip?: number;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * Public aggregate badge: { count, averageRating } over approved reviews.
 * @param {string} targetId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function reviewSummary(targetId: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * Shopper submission — lands as 'pending'; requires login; deduped per target.
 * @param {Record<string,unknown>} data
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function createReview(data: Record<string, unknown>): Promise<import("../joorchin.js").ApiResult>;
/**
 * @param {string[]} targetIds
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function reviewSummaries(targetIds: string[]): Promise<import("../joorchin.js").ApiResult>;
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function listMyReviews({ targetId }?: {
    targetId?: unknown;
}): Promise<import("../joorchin.js").ApiResult>;
/**
 * @param {string} id
 * @param {Record<string,unknown>} data
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function updateMyReview(id: string, data: Record<string, unknown>): Promise<import("../joorchin.js").ApiResult>;
