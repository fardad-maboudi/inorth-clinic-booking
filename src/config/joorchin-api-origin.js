export const DEFAULT_JOORCHIN_API_ORIGIN = "https://api.joorchin.site";

const PINGGY_FREE_HOST = /(^|\.)pinggy-free\.link$/i;

/**
 * Resolve the Joorchin API origin used by both the browser SDK and Vite's dev
 * proxy. Temporary Pinggy hosts are only suitable for local HTTPS callbacks;
 * they are not the clinic's API, so stale local overrides fall back to the
 * canonical Joorchin API.
 *
 * @param {string | undefined | null} value
 * @returns {string}
 */
export function resolveJoorchinApiOrigin(value) {
  const configured = String(value ?? "").trim();
  const origin = (configured || DEFAULT_JOORCHIN_API_ORIGIN)
    .replace(/\/+$/, "")
    .replace(/\/api\/v1$/i, "");

  try {
    const urlToParse = /^[a-z][a-z\d+.-]*:\/\//i.test(origin)
      ? origin
      : `https://${origin}`;
    if (PINGGY_FREE_HOST.test(new URL(urlToParse).hostname)) {
      return DEFAULT_JOORCHIN_API_ORIGIN;
    }
  } catch {
    // Preserve the existing custom-origin behavior for values Vite accepts.
  }

  return origin;
}
