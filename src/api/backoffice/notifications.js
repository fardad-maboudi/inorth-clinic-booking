/**
 * Site back-office SDK — notifications: broadcast to members and send SMS.
 *
 * For the site's owner, admins and team only; every call needs a staff
 * capability and 403s for customers. Visitor and customer pages use
 * '@/api/plugins/notifications' instead. Installed and owned by the platform.
 */
import { coreIntegration, pluginAction } from './client.js';

/** Send to chosen users or `all`. Requires `comms:broadcast`. */
export const sendNotification = ({ userIds, all, title, body, type, link, dedupKey, channels, sms }) =>
  pluginAction('notifications', 'send', {
    method: 'POST',
    body: { userIds, all, title, body, type, link, dedupKey, channels, sms },
  });

/** Requires `integration:write`. Prefer a pattern (`smsTemplate`/`patternKey`) over free text. */
export const sendSms = ({ to, message, smsTemplate, smsTokens, patternKey, allowFreeText = false }) =>
  coreIntegration('Core', 'SendSms', { to, message, smsTemplate, smsTokens, patternKey, allowFreeText });
