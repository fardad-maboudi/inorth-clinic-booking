import { joorchinFetch as fetch } from "./joorchin.js";
import { clearInMemoryAuthToken, setInMemoryAuthToken } from "./auth.js";

const AUTH_URL = `/api/v1/apps/${import.meta.env.VITE_APP_ID}/plugins/telegram/miniapp/auth`;
const SESSION_URL = AUTH_URL.replace(/auth$/, "session");
let currentSession = null;
let accessToken = null;
let expiresAt = 0;
let renewal = null;
let sessionEpoch = 0;

/** @typedef {{user: Record<string, unknown>, actor: string, capabilities: string[], simulated: boolean}} MiniAppSession */

/** @returns {MiniAppSession|null} the current Mini App session, or null before authentication. */
export function miniAppSession() { return currentSession; }
export function clearMiniAppSession() {
  sessionEpoch += 1;
  currentSession = null;
  accessToken = null;
  expiresAt = 0;
  clearInMemoryAuthToken();
}

function adopt(verified) {
  const payload = JSON.parse(atob(verified.token.split(".")[1].replaceAll("-", "+").replaceAll("_", "/")));
  if (!Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now() || !setInMemoryAuthToken(verified.token))
    throw new Error("Invalid Mini App session");
  accessToken = verified.token;
  expiresAt = payload.exp * 1000;
  currentSession = { user: verified.user, actor: verified.actor, capabilities: verified.capabilities ?? [], simulated: false };
  return currentSession;
}

/**
 * @param {Record<string, unknown>} app the app handle (simulated previews carry `__joorchinSimulated`)
 * @param {Record<string, unknown>} [previewUser]
 * @returns {Promise<MiniAppSession|null>}
 */
export async function authenticateMiniApp(app, previewUser) {
  if (app?.__joorchinSimulated && previewUser) {
    clearMiniAppSession();
    clearInMemoryAuthToken(true);
    currentSession = { user: previewUser, actor: previewUser.isSiteOwner ? "owner" : "user", capabilities: [], simulated: true };
    return currentSession;
  }
  if (!app?.initData) return null;
  try {
    const response = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ initData: app.initData }) });
    if (!response.ok) throw new Error("Telegram authentication failed");
    return adopt(await response.json());
  } catch (error) { clearMiniAppSession(); throw error; }
}

/** @returns {Promise<MiniAppSession|null>} */
export async function renewMiniAppSession() {
  if (currentSession?.simulated) return currentSession;
  if (renewal) return renewal;
  const epoch = sessionEpoch;
  renewal = (async () => {
    try {
      if (!accessToken || expiresAt <= Date.now()) throw new Error("Mini App session expired");
      const response = await fetch(SESSION_URL, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
      if (!response.ok) throw new Error("Mini App session renewal failed");
      const verified = await response.json();
      if (epoch !== sessionEpoch) throw new Error("Mini App session ended");
      return adopt(verified);
    } catch (error) { if (epoch === sessionEpoch) clearMiniAppSession(); throw error; }
  })();
  try { return await renewal; } finally { renewal = null; }
}

/** Renew before expiry and on foreground return; refusal unmounts protected UI. */
/**
 * @param {Record<string, unknown>} app
 * @param {(session: MiniAppSession) => void} onSession
 * @param {(error: Error) => void} onError
 * @returns {() => void} stop function
 */
export function maintainMiniAppSession(app, onSession, onError) {
  if (currentSession?.simulated) return () => {};
  let disposed = false;
  let timer;
  let deadline;
  const stop = () => { disposed = true; clearTimeout(timer); clearTimeout(deadline); app?.offEvent?.("activated", active); document.removeEventListener("visibilitychange", visible); };
  const schedule = () => {
    clearTimeout(timer);
    clearTimeout(deadline);
    if (!disposed) {
      timer = setTimeout(refresh, Math.max(0, expiresAt - Date.now() - 60_000));
      deadline = setTimeout(() => { clearMiniAppSession(); stop(); onError(new Error("Mini App session expired")); }, Math.max(0, expiresAt - Date.now()));
    }
  };
  const refresh = async () => {
    if (disposed) return;
    try {
      const session = await renewMiniAppSession();
      if (!disposed) { onSession(session); schedule(); }
    } catch (error) { if (!disposed) { stop(); onError(error); } }
  };
  const active = () => { if (expiresAt - Date.now() <= 60_000) void refresh(); };
  const visible = () => { if (document.visibilityState === "visible") active(); };
  app?.onEvent?.("activated", active);
  document.addEventListener("visibilitychange", visible);
  schedule();
  return stop;
}
