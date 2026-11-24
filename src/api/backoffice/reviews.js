/**
 * Site back-office SDK — reviews: the moderation queue.
 *
 * For the site's owner, admins and team only; every call needs a staff
 * capability and 403s for customers. Visitor and customer pages use
 * '@/api/plugins/reviews' instead. Installed and owned by the platform.
 */
import { pluginAction } from './client.js';

/** Pending reviews awaiting a decision. Requires `review:moderate`. */
export const listReviewQueue = ({ limit = 20, skip = 0 } = {}) =>
  pluginAction('reviews', 'reviews', { query: { status: 'pending', limit, skip } });
export const approveReview = (id) =>
  pluginAction('reviews', `reviews/${encodeURIComponent(id)}/approve`, { method: 'POST' });
export const rejectReview = (id) =>
  pluginAction('reviews', `reviews/${encodeURIComponent(id)}/reject`, { method: 'POST' });
export const moderateReview = (id, status) =>
  pluginAction('reviews', `reviews/${encodeURIComponent(id)}/moderation`, { method: 'POST', body: { status } });
