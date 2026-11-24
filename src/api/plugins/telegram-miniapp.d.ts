/** Raw Telegram WebApp object, or null outside Telegram. */
export function tg(): any;
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function isTelegram(): Promise<import("../joorchin.js").ApiResult>;
/** Call once on mount: expand to full height and adopt Telegram's theme. */
export function initTelegram(): any;
/** The Telegram user, if any (display only — never trust it for authorization). */
export function telegramUser(): any;
/**
 * Exchange Telegram initData for a normal site session. The server verifies the
 * signature against the bot token, so this is a real login, not a client claim.
 * Returns the whole verified envelope: { user, actor, capabilities }.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function signInWithTelegram(): Promise<import("../joorchin.js").ApiResult>;
/**
 * Server-verified face after signInWithTelegram(): 'owner' | 'admin' | 'user'.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function actor(): Promise<import("../joorchin.js").ApiResult>;
/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function isOwner(): Promise<import("../joorchin.js").ApiResult>;
/**
 * Claimed Telegram staff (notification console). NOT a permission check.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function isStaff(): Promise<import("../joorchin.js").ApiResult>;
/**
 * Face switch for privileged screens — READING ONLY. `can()` renders; the
 * server re-checks every write against the live membership. Never gate a
 * mutation UI on it alone.
 * @param {unknown} capability
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function can(capability: unknown): Promise<import("../joorchin.js").ApiResult>;
/**
 * Merchant funnel event. Call only after the corresponding action succeeds.
 * @param {unknown} event
 * @param {string} itemId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function trackMiniAppEvent(event: unknown, itemId: string): Promise<import("../joorchin.js").ApiResult>;
/**
 * §8.4 "اتصال تلگرام": for a LOGGED-IN website visitor, mint the one-time
 * deep link that binds their own Telegram chat to their account (their
 * orders/cart become readable by the bot). Returns { linkUrl } or null when
 * not signed in. Works without the paid mini app.
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function linkTelegramAccount(): Promise<import("../joorchin.js").ApiResult>;
/**
 * Telegram's bottom MainButton — use it for the primary action of a screen.
 * @param {unknown} text
 * @param {unknown} onClick
 */
export function setMainButton(text: unknown, onClick: unknown): () => void;
/**
 * Telegram's back arrow — wire it to your router instead of a custom header.
 * @param {unknown} onClick
 */
export function setBackButton(onClick: unknown): () => void;
/**
 * @param {unknown=} style
 */
export function hapticFeedback(style?: unknown | undefined): void;
export function closeMiniApp(): void;
/**
 * Deep link that opens this mini app on a specific screen.
 * @param {unknown} botUsername
 * @param {Record<string,unknown>} payload
 */
export function shareLink(botUsername: unknown, payload: Record<string, unknown>): string;
/** startapp payload Telegram launched us with (e.g. 'product_123'). */
export function startParam(): any;
