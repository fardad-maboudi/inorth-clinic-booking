import { joorchinFetch as fetch } from "../joorchin.js";
/**
 * Auth plugin client — OTP/password login, recovery and profile.
 * Import from '@/api/plugins/auth'.
 */
import { normalizeIranianMobile, toLatinDigits } from '../auth.js';
import { useQuery } from '@tanstack/react-query';
import { getAuthHeaders as getPreviewHeaders } from '../auth.js';
import { joorchinResponseError } from '@/api/joorchin';

const APP_ID = import.meta.env.VITE_APP_ID;
const TOKEN_KEY = `joorchin_user_token:${import.meta.env?.VITE_APP_ID}`;
const REFRESH_KEY = `joorchin_user_refresh:${import.meta.env?.VITE_APP_ID}`;
// Built at runtime, never inlined as a literal: the generated-site security gate
// blocks hardcoded /api/v1/apps/... URLs, and this client is the sanctioned seam.
const APP_BASE = `/api/v1/apps/${APP_ID}`;

/**
 * @param {string} token
 */
export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/**
 * The access token lives 24h. The platform's httpOnly refresh cookie is scoped
 * to Joorchin's own domain and to the refresh endpoint's own path, so it never
 * reaches this site — the server hands site logins the refresh token in the
 * JSON body instead, and we send it back explicitly.
 */
function storeSession(data) {
  if (data?.token) setAuthToken(data.token);
  if (data?.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
  return data;
}

/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function refreshSession() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;
  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-app-id': APP_ID },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    clearAuthToken(); // the family was rotated away or revoked — sign out
    return null;
  }
  return storeSession(await response.json());
}

/** Run a request, and retry it once through a refresh on a 401. */
async function withSession(run) {
  const response = await run();
  if (response.status !== 401) return response;
  const refreshed = await refreshSession();
  return refreshed ? run() : response;
}

/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function hasAuthToken() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

/** Derived from auth's required page-file contract; safe for return redirects. */
export const AUTH_LOGIN_PATH = '/auth/login';

/** Shared staff login route installed with the auth plugin. */
export const SITE_ADMIN_LOGIN_PATH = '/admin/login';

/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function getUserAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return { Authorization: `Bearer ${token}` };
  return getPreviewHeaders();
}

async function parse(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw joorchinResponseError(response.status, text);
  }
  return response.json();
}

/** Customer OTP request for this site (site_user); dashboard staff use requestAdminOtp.
 * @param {string} phoneNumber  * @returns {Promise<import('../joorchin.js').ApiResult>}
 * @example
 * await requestOtp('09121234567');
 * const session = await verifyOtp('09121234567', '12345'); // signs the customer in
 */
export async function requestOtp(phoneNumber) {
  return parse(await fetch('/api/v1/auth/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-app-id': APP_ID },
    body: JSON.stringify({ phoneNumber: normalizeIranianMobile(phoneNumber) ?? toLatinDigits(phoneNumber) }),
  }));
}

/** Customer OTP verification (site_user); saves the SDK session. Staff use verifyAdminOtp.
 * @param {string} phoneNumber
 * @param {string} otp  * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function verifyOtp(phoneNumber, otp) {
  const data = await parse(await fetch('/api/v1/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-app-id': APP_ID },
    body: JSON.stringify({ phoneNumber: normalizeIranianMobile(phoneNumber) ?? toLatinDigits(phoneNumber), otp }),
  }));
  return storeSession(data);
}

/** Site customer password login (site_user); staff use loginAdminWithPassword.
 * @param {string} phoneNumber
 * @param {string} password
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function loginWithPassword(phoneNumber, password) {
  const data = await parse(await fetch(APP_BASE + '/auth/login/password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: normalizeIranianMobile(phoneNumber) ?? toLatinDigits(phoneNumber), password }),
  }));
  return storeSession(data);
}

/**
 * Uniform response: callers must not infer whether this phone has an account.
 * @param {string} phoneNumber
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function forgotPassword(phoneNumber) {
  return parse(await fetch(APP_BASE + '/auth/forgot-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: normalizeIranianMobile(phoneNumber) ?? toLatinDigits(phoneNumber) }),
  }));
}

/**
 * Verify the reset code and set a new password; the user signs in afterwards.
 * @param {string} phoneNumber
 * @param {unknown} otp
 * @param {unknown} newPassword
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function resetPassword(phoneNumber, otp, newPassword) {
  const result = await parse(await fetch(APP_BASE + '/auth/reset-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: normalizeIranianMobile(phoneNumber) ?? toLatinDigits(phoneNumber), otp, newPassword }),
  }));
  clearAuthToken();
  return result;
}

/** Shop owner/admin/invited staff OTP request (site_admin). Requires active membership. Never Joorchin platform-admin login.
 * @param {string} phoneNumber  * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function requestAdminOtp(phoneNumber) {
  return parse(await fetch(APP_BASE + '/auth/admin/initiate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: normalizeIranianMobile(phoneNumber) ?? toLatinDigits(phoneNumber) }),
  }));
}

/** Shop-staff OTP verification (site_admin); saves the SDK session. Never use customer verifyOtp for dashboard access.
 * @param {string} phoneNumber
 * @param {string} otp  * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function verifyAdminOtp(phoneNumber, otp) {
  const data = await parse(await fetch(APP_BASE + '/auth/admin/verify-otp', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: normalizeIranianMobile(phoneNumber) ?? toLatinDigits(phoneNumber), otp }),
  }));
  return storeSession(data);
}

/** Shop-staff password login (site_admin); server rechecks active membership. Never platform operators.
 * @param {string} phoneNumber
 * @param {string} password
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function loginAdminWithPassword(phoneNumber, password) {
  const data = await parse(await fetch(APP_BASE + '/auth/admin/login/password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: normalizeIranianMobile(phoneNumber) ?? toLatinDigits(phoneNumber), password }),
  }));
  return storeSession(data);
}

/** Staff password recovery; requires active admin membership or an invitation for this site.
 * @param {string} phoneNumber
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function forgotAdminPassword(phoneNumber) {
  return parse(await fetch(APP_BASE + '/auth/admin/forgot-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: normalizeIranianMobile(phoneNumber) ?? toLatinDigits(phoneNumber) }),
  }));
}

/** Rechecks admin membership before resetting the password; sign in again afterwards.
 * @param {string} phoneNumber
 * @param {string} otp
 * @param {string} newPassword
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function resetAdminPassword(phoneNumber, otp, newPassword) {
  const result = await parse(await fetch(APP_BASE + '/auth/admin/reset-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: normalizeIranianMobile(phoneNumber) ?? toLatinDigits(phoneNumber), otp, newPassword }),
  }));
  clearAuthToken();
  return result;
}

/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function me() {
  return parse(await withSession(() =>
    fetch(`${APP_BASE}/users/me`, { headers: getUserAuthHeaders() })));
}

/**
 * @param {Record<string,unknown>} payload
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function updateMe(payload) {
  return parse(await withSession(() => fetch(`${APP_BASE}/users/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getUserAuthHeaders() },
    body: JSON.stringify(payload),
  })));
}

/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function logout() {
  const headers = getUserAuthHeaders();
  try {
    return await parse(await fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers,
    }));
  } finally {
    clearAuthToken();
  }
}

export { APP_ID, APP_BASE };

/** Current caller profile. No staff authority is inferred from its role.
 * @param {{enabled?:boolean}} [options]
 * @returns {{data: import('../joorchin.js').ApiResult|undefined, error: Error|null, isPending: boolean, refetch: Function}}
 */
export function useCustomerProfile(options = {}) {
  return useQuery({ queryKey: ['joorchin', APP_ID, 'auth', 'me', getUserAuthHeaders()],
    queryFn: me, enabled: options.enabled ?? true, retry: false });
}

/** Same-origin shopper return destination, with external/ambiguous paths rejected.
 * @param {unknown} value @param {string} [fallback]
 * @returns {string}
 */
export function safeReturnPath(value, fallback = '/') {
  // eslint-disable-next-line no-control-regex -- reject ASCII control characters and backslash
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return fallback;
  const url = new URL(value, 'https://return.invalid');
  return url.origin === 'https://return.invalid' ? url.pathname + url.search + url.hash : fallback;
}
