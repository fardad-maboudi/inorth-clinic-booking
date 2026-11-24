import { joorchinFetch as fetch } from "../joorchin.js";
/**
 * Telegram Mini App helpers — import from '@/api/plugins/telegram-miniapp'.
 * Only meaningful inside Telegram; every helper degrades to a no-op in a normal
 * browser so the same components can be previewed on the web.
 */
import { getAuthHeaders } from '../auth.js';
import { authenticateMiniApp, miniAppSession } from '../telegram-session.js';
import { APP_ID } from '@/api/joorchin';

const BASE = `/api/v1/apps/${APP_ID}/plugins/telegram`;

/** Raw Telegram WebApp object, or null outside Telegram. */
export function tg() {
  return (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) || null;
}

/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function isTelegram() {
  return Boolean(tg());
}

/** Call once on mount: expand to full height and adopt Telegram's theme. */
export function initTelegram() {
  const app = tg();
  if (!app) return null;
  app.ready();
  app.expand();
  const p = app.themeParams || {};
  const root = document.documentElement;
  if (p.bg_color) root.style.setProperty('--tg-bg', p.bg_color);
  if (p.text_color) root.style.setProperty('--tg-text', p.text_color);
  root.style.setProperty('--tg-viewport-height', (app.viewportStableHeight || window.innerHeight) + 'px');
  return app;
}

/** The Telegram user, if any (display only — never trust it for authorization). */
export function telegramUser() {
  const app = tg();
  return (app && app.initDataUnsafe && app.initDataUnsafe.user) || null;
}

/**
 * Exchange Telegram initData for a normal site session. The server verifies the
 * signature against the bot token, so this is a real login, not a client claim.
 * Returns the whole verified envelope: { user, actor, capabilities }.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function signInWithTelegram() {
  const session = miniAppSession() ?? await authenticateMiniApp(tg());
  return session ? { ...session } : null;
}

/**
 * Server-verified face after signInWithTelegram(): 'owner' | 'admin' | 'user'.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function actor() {
  return miniAppSession()?.actor ?? null;
}
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function isOwner() {
  return actor() === 'owner';
}
/**
 * Claimed Telegram staff (notification console). NOT a permission check.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function isStaff() {
  return actor() === 'admin';
}
/**
 * Face switch for privileged screens — READING ONLY. `can()` renders; the
 * server re-checks every write against the live membership. Never gate a
 * mutation UI on it alone.
 * @param {unknown} capability
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function can(capability) {
  return Boolean(miniAppSession()?.capabilities.includes(capability));
}

/**
 * Merchant funnel event. Call only after the corresponding action succeeds.
 * @param {unknown} event
 * @param {string} itemId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function trackMiniAppEvent(event, itemId) {
  const auth = getAuthHeaders();
  if (!auth.Authorization) return false;
  const res = await fetch(`${BASE}/miniapp/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({ event, ...(itemId ? { itemId } : {}) }),
  });
  return res.ok;
}

/**
 * §8.4 "اتصال تلگرام": for a LOGGED-IN website visitor, mint the one-time
 * deep link that binds their own Telegram chat to their account (their
 * orders/cart become readable by the bot). Returns { linkUrl } or null when
 * not signed in. Works without the paid mini app.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function linkTelegramAccount() {
  const auth = getAuthHeaders();
  if (!auth.Authorization) return null;
  const res = await fetch(`${BASE}/account-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.linkUrl ? { linkUrl: data.linkUrl, botUsername: data.botUsername } : null;
}

/**
 * Telegram's bottom MainButton — use it for the primary action of a screen.
 * @param {unknown} text
 * @param {unknown} onClick
 */
export function setMainButton(text, onClick) {
  const app = tg();
  if (!app || !app.MainButton) return () => {};
  app.MainButton.setText(text);
  app.MainButton.show();
  app.MainButton.onClick(onClick);
  return () => {
    app.MainButton.offClick(onClick);
    app.MainButton.hide();
  };
}

/**
 * Telegram's back arrow — wire it to your router instead of a custom header.
 * @param {unknown} onClick
 */
export function setBackButton(onClick) {
  const app = tg();
  if (!app || !app.BackButton) return () => {};
  app.BackButton.show();
  app.BackButton.onClick(onClick);
  return () => {
    app.BackButton.offClick(onClick);
    app.BackButton.hide();
  };
}

/**
 * @param {unknown=} style
 */
export function hapticFeedback(style = 'light') {
  const app = tg();
  if (app && app.HapticFeedback) app.HapticFeedback.impactOccurred(style);
}

export function closeMiniApp() {
  const app = tg();
  if (app) app.close();
}

/**
 * Deep link that opens this mini app on a specific screen.
 * @param {unknown} botUsername
 * @param {Record<string,unknown>} payload
 */
export function shareLink(botUsername, payload) {
  if (!botUsername) return null;
  return `https://t.me/${botUsername}?startapp=${encodeURIComponent(payload || '')}`;
}

/** startapp payload Telegram launched us with (e.g. 'product_123'). */
export function startParam() {
  const app = tg();
  return (app && app.initDataUnsafe && app.initDataUnsafe.start_param) || null;
}
