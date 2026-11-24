/**
 * Site back-office SDK — loyalty-club: manual point adjustments.
 *
 * For the site's owner, admins and team only; every call needs a staff
 * capability and 403s for customers. Visitor and customer pages use
 * '@/api/plugins/loyalty-club' instead. Installed and owned by the platform.
 */
import { pluginAction } from './client.js';

/** Credit (+) or debit (-) a member's points. Requires `customer:write`. */
export const adjustPoints = (userId, delta, note, idempotencyKey = crypto.randomUUID()) =>
  pluginAction('loyalty-club', 'adjust', { method: 'POST', body: { userId, delta, note, idempotencyKey } });
