import { joorchinFetch as fetch } from "../joorchin.js";
/**
 * Telegram plugin client — import from '@/api/plugins/telegram'.
 * The bot is hosted by Joorchin (one webhook for every site); the site only
 * needs to send users to the bot via a t.me deep link. Never store the bot token
 * client-side. See the dashboard to connect a bot.
 */
import { APP_ID } from '@/api/joorchin';

const BASE = `/api/v1/apps/${APP_ID}/plugins/telegram`;
let cachedUsername;

async function botUsername() {
  if (cachedUsername !== undefined) return cachedUsername;
  try {
    const res = await fetch(`${BASE}/setup/public`);
    const data = res.ok ? await res.json() : {};
    cachedUsername = data.botUsername || null;
  } catch {
    cachedUsername = null;
  }
  return cachedUsername;
}

/**
 * Is a bot connected for this site?
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function isTelegramEnabled() {
  return Boolean(await botUsername());
}

/**
 * t.me deep link that opts the visitor into updates (optionally a topic).
 * @param {unknown} topic
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function getBotLink(topic) {
  const user = await botUsername();
  if (!user) return null;
  const payload = topic ? `?start=sub_${topic}` : '';
  return `https://t.me/${user}${payload}`;
}

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
export async function getOrderTrackingLink(orderId, sessionId) {
  if (!orderId) return null;
  try {
    const res = await fetch(`${BASE}/order-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(sessionId ? { orderId, sessionId } : { orderId }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data && (data.data ? data.data.link : data.link)) || null;
  } catch {
    return null;
  }
}

export { APP_ID };
