import { joorchinFetch as fetch } from "../joorchin.js";
/**
 * Optional passkeys plugin client. OTP remains available through the auth plugin.
 */
import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import {
  APP_ID,
  getUserAuthHeaders,
  storeSession,
} from './auth';
import { joorchinResponseError } from '@/api/joorchin';

async function parse(response) {
  if (!response.ok) {
    throw joorchinResponseError(response.status, await response.text().catch(() => ''));
  }
  if (response.status === 204) return null;
  return response.json();
}

function headers(authenticated = false) {
  return {
    'Content-Type': 'application/json',
    'x-app-id': APP_ID,
    ...(authenticated ? getUserAuthHeaders() : {}),
  };
}

/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export function supportsPasskeys() {
  return browserSupportsWebAuthn();
}

/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function signInWithPasskey() {
  const ceremony = await parse(await fetch('/api/v1/auth/passkeys/login/options', {
    method: 'POST',
    headers: headers(),
    body: '{}',
  }));
  const response = await startAuthentication({ optionsJSON: ceremony.options });
  const result = await parse(await fetch('/api/v1/auth/passkeys/login/verify', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ ceremonyId: ceremony.ceremonyId, response }),
  }));
  if (result?.token || result?.access_token) storeSession(result);
  return result;
}

/**
 * @param {string} name
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function enrollPasskey(name) {
  const ceremony = await parse(await fetch('/api/v1/auth/passkeys/register/options', {
    method: 'POST',
    headers: headers(true),
    body: '{}',
  }));
  const response = await startRegistration({ optionsJSON: ceremony.options });
  return parse(await fetch('/api/v1/auth/passkeys/register/verify', {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ ceremonyId: ceremony.ceremonyId, name, response }),
  }));
}

/**
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function listPasskeys() {
  return parse(await fetch('/api/v1/auth/passkeys', {
    headers: headers(true),
  }));
}

/**
 * @param {string} credentialId
 * @param {string} name
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function renamePasskey(credentialId, name) {
  return parse(await fetch('/api/v1/auth/passkeys/' + encodeURIComponent(credentialId), {
    method: 'PATCH',
    headers: headers(true),
    body: JSON.stringify({ name }),
  }));
}

/**
 * @param {string} credentialId
 * @returns {Promise<import('../joorchin.js').ApiResult>}
 */
export async function revokePasskey(credentialId) {
  return parse(await fetch('/api/v1/auth/passkeys/' + encodeURIComponent(credentialId), {
    method: 'DELETE',
    headers: headers(true),
  }));
}
