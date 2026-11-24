import { createClient } from "@joorchin/client-sdk";

const appId = String(import.meta.env.VITE_APP_ID || "6ae869523c5af491ed8a859b");
const serverUrl = String(
  import.meta.env.VITE_JOORCHIN_SERVER_URL || "https://api.joorchin.site",
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/i, "");
const apiBaseUrl = `${serverUrl}/api/v1`;

// The site's auth UI and the SDK share one app-scoped access-token key. The
// SDK keeps its rotated refresh pair under a separate API/app-namespaced key;
// REFRESH_KEY remains the compatibility key used by delivered site modules.
export const tokenStorageKey = `joorchin_user_token:${appId}`;
const legacyRefreshTokenKey = `joorchin_user_refresh:${appId}`;
const sdkRefreshTokenKey = `${tokenStorageKey}:refresh:${apiBaseUrl}:${appId}`;

function browserStorage() {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function storedValue(key) {
  try {
    return browserStorage()?.getItem(key) || undefined;
  } catch {
    return undefined;
  }
}

function makeClient() {
  return createClient({
    clientVersion: { name: "client-sdk", version: "0.3.1" },
    appId,
    serverUrl,
    token: storedValue(tokenStorageKey),
    refreshToken: storedValue(legacyRefreshTokenKey),
    tokenStorageKey,
  });
}

export const JOORCHIN_APP_ID = appId;
export const JOORCHIN_SERVER_URL = serverUrl;

// A live binding lets auth reset replace the in-memory bearer session without
// a full-page reload. SDK refreshes are single-flight within this client.
export let joorchin = makeClient();

export function resetJoorchinClient() {
  joorchin.cleanup();
  joorchin = makeClient();
  return joorchin;
}

/**
 * Keep the delivered auth helpers' localStorage contract and the SDK session
 * in sync after OTP, password, passkey, or refresh responses.
 * @param {Record<string, unknown>=} data
 * @returns {Record<string, unknown>=}
 */
export function setJoorchinSession(data) {
  const accessToken = typeof data?.token === "string"
    ? data.token
    : typeof data?.access_token === "string"
      ? data.access_token
      : "";
  if (!accessToken) return data;

  const refreshToken = typeof data?.refreshToken === "string" && data.refreshToken
    ? data.refreshToken
    : undefined;
  const session = {
    access_token: accessToken,
    ...(refreshToken ? { refreshToken } : {}),
  };
  joorchin.auth.setSession(session);

  const storage = browserStorage();
  try {
    storage?.setItem(tokenStorageKey, accessToken);
    if (refreshToken) storage?.setItem(legacyRefreshTokenKey, refreshToken);
    else storage?.removeItem(legacyRefreshTokenKey);
  } catch {
    // The SDK already falls back to its in-memory session when storage is blocked.
  }
  return data;
}

/** Mirror SDK-owned rotations into the delivered auth helper's legacy key. */
export function persistJoorchinSessionStorage() {
  const session = joorchin.auth.getSession();
  const storage = browserStorage();
  try {
    if (!session.access_token) {
      if (!session.refreshToken) storage?.removeItem(legacyRefreshTokenKey);
      return session;
    }
    storage?.setItem(tokenStorageKey, session.access_token);
    if (session.refreshToken) storage?.setItem(legacyRefreshTokenKey, session.refreshToken);
    else storage?.removeItem(legacyRefreshTokenKey);
  } catch {
    // The SDK session remains usable in memory when browser storage is blocked.
  }
  return session;
}

/** Set an access-only token, used only by callers that have no refresh pair. */
export function setJoorchinAccessToken(token) {
  if (typeof token !== "string" || !token) return;
  setJoorchinSession({ access_token: token });
}

/**
 * Compare a caller's Authorization header with the SDK-owned session. This
 * prevents preview/runtime identities from borrowing a different saved user's
 * bearer token or refresh family.
 * @param {string|undefined|null} authorization
 */
export function joorchinSessionMatchesAuthorization(authorization) {
  const session = joorchin.auth.getSession();
  if (!authorization) return !session.access_token && !session.refreshToken;
  const match = /^Bearer\s+([^\s]+)$/i.exec(String(authorization));
  return Boolean(match && match[1] === session.access_token);
}

/**
 * Use the SDK's app-scoped POST /apps/:appId/auth/refresh route, then mirror
 * the rotated pair into the legacy key consumed by the site's auth helpers.
 */
export async function refreshJoorchinSession() {
  try {
    const session = await joorchin.auth.refreshSession();
    const accessToken = session?.access_token;
    if (!accessToken) throw new Error("Joorchin refresh returned no access token");

    const storage = browserStorage();
    try {
      storage?.setItem(tokenStorageKey, accessToken);
      if (session.refreshToken) storage?.setItem(legacyRefreshTokenKey, session.refreshToken);
      else storage?.removeItem(legacyRefreshTokenKey);
    } catch {
      // The SDK session remains usable in memory.
    }
    return session;
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      try {
        browserStorage()?.removeItem(legacyRefreshTokenKey);
      } catch {
        // Best-effort cleanup after a revoked/expired refresh family.
      }
    }
    throw error;
  }
}

/**
 * Clear both session stores. Replacing the SDK session with a memory-only
 * sentinel first increments its session revision, so an in-flight refresh
 * cannot write the old token back after logout.
 */
export function clearJoorchinSession() {
  try {
    joorchin.auth.setSession({ access_token: "session-cleared" }, false);
  } catch {
    // Keep clearing storage even if an SDK runtime is partially unavailable.
  }
  const storage = browserStorage();
  try {
    storage?.removeItem(tokenStorageKey);
    storage?.removeItem(legacyRefreshTokenKey);
    storage?.removeItem(sdkRefreshTokenKey);
  } catch {
    // Storage may be disabled or quota-restricted.
  }
  return resetJoorchinClient();
}
