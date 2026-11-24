/**
 * Site back-office SDK — transport.
 *
 * `src/api/backoffice/*` is for the people who RUN this site: its owner, site
 * admins and invited team members (the `/admin` panel, the Telegram Mini App
 * owner screens). Every call here needs a staff capability (`order:refund`,
 * `product:write`, `team:manage`…) and fails with 403 for a visitor or customer.
 *
 * Visitors and customers use the site visitor SDK instead: `@/api/joorchin` and
 * `@/api/plugins/<id>`. Never import a back-office module from a storefront or
 * customer-account page. Platform-owned: re-synced from the template.
 */
import { getAuthHeaders as getSessionHeaders } from "../auth.js";
import { demoMode } from "../../demo/install.js";
import {
  joorchin,
  joorchinSessionMatchesAuthorization,
} from "../../lib/joorchinClient.js";
import {
  APP_ID,
  asRowList,
  joorchinFetch,
  joorchinSdkCall,
  sdkClientIdentity,
  parseJoorchinResponse,
} from "../joorchin.js";

/** Same storage key as the auth plugin client; admin OTP login writes it. */
const SITE_TOKEN_KEY = `joorchin_user_token:${import.meta.env?.VITE_APP_ID}`;

export const BACKOFFICE_APP_BASE = `/api/v1/apps/${APP_ID}`;

/** The signed-in staff token, else the preview / Mini App session token. */
export function backofficeAuthHeaders() {
  let token = null;
  try {
    token = globalThis.localStorage?.getItem(SITE_TOKEN_KEY) ?? null;
  } catch {
    // Storage blocked (private mode, sandboxed frame): fall back to the session.
  }
  return token ? { Authorization: `Bearer ${token}` } : getSessionHeaders();
}

function canUseBackofficeSdk() {
  return !demoMode && joorchinSessionMatchesAuthorization(
    backofficeAuthHeaders().Authorization,
  );
}

function decodedPathPart(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/**
 * Use the SDK for its app-scoped staff routes. Preview/runtime identities that
 * are not owned by the shared SDK session retain the fetch adapter below.
 */
function sdkBackofficeRequest(path, { method = "GET", body, query } = {}) {
  if (!canUseBackofficeSdk()) return null;
  const rawPath = String(path ?? "").replace(/^\/+/, "");
  if (!rawPath || /[?#]/.test(rawPath)) return null;

  const parts = rawPath.split("/");
  const verb = String(method).toUpperCase();
  const hasQuery = Object.keys(query ?? {}).length > 0;

  if (parts[0] === "members" && !hasQuery) {
    if (parts.length === 2 && parts[1] === "me" && verb === "GET") {
      return joorchinSdkCall(() => joorchin.backoffice.team.myMembership());
    }
    if (parts.length === 1 && verb === "GET") {
      return joorchinSdkCall(() => joorchin.backoffice.team.listMembers());
    }
    if (parts.length === 2 && parts[1] === "invite" && verb === "POST" && body !== undefined) {
      return joorchinSdkCall(() => joorchin.backoffice.team.inviteMember(
        /** @type {{phone:string,roleIds:string[]}} */ (body),
      ));
    }
  }
  if (parts.length === 1 && parts[0] === "roles" && verb === "GET" && !hasQuery) {
    return joorchinSdkCall(() => joorchin.backoffice.team.listRoles());
  }

  if (parts[0] !== "plugins" || parts.length < 3) return null;
  const pluginId = decodedPathPart(parts[1]);
  if (!pluginId || pluginId === "." || pluginId === "..") return null;

  if (parts[2] === "data" && parts.length >= 4) {
    const entity = decodedPathPart(parts[3]);
    if (!entity || entity.includes("/") || entity === "." || entity === "..") return null;
    const recordId = parts.length === 5 ? decodedPathPart(parts[4]) : undefined;
    if (parts.length > 5 || (parts.length === 5 && (!recordId || recordId === "." || recordId === ".."))) return null;
    const records = joorchin.backoffice.plugin(pluginId).records(entity);
    if (parts.length === 4 && verb === "GET") {
      return joorchinSdkCall(() => records.list(query ?? {}));
    }
    if (parts.length === 4 && verb === "POST" && body !== undefined) {
      return joorchinSdkCall(() => records.create(body));
    }
    if (parts.length === 5 && verb === "GET") {
      return joorchinSdkCall(() => records.get(recordId));
    }
    if (parts.length === 5 && verb === "PUT" && body !== undefined) {
      return joorchinSdkCall(() => records.update(recordId, body));
    }
    if (parts.length === 5 && verb === "DELETE") {
      return joorchinSdkCall(() => records.remove(recordId));
    }
    return null;
  }

  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(verb)) return null;
  const actionParts = parts.slice(2).map(decodedPathPart);
  if (actionParts.some((part) => !part || part.includes("/") || part === "." || part === "..")) return null;
  const action = actionParts.join("/");
  return joorchinSdkCall(() => joorchin.backoffice.plugin(pluginId).action(action, {
    method: verb,
    body,
    query,
  }));
}

function withQuery(path, query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * One back-office request, relative to this app: `backofficeRequest('/members')`.
 * Throws the shared Joorchin error (`status` preserved) on any non-2xx.
 */
export async function backofficeRequest(path, /** @type {{method?: string, body?: unknown, query?: Record<string, unknown>}} */ { method = "GET", body, query } = {}) {
  const sdkResult = sdkBackofficeRequest(path, { method, body, query });
  if (sdkResult !== null) return sdkResult;

  const identity = sdkClientIdentity("backoffice-sdk");
  const headers = { ...backofficeAuthHeaders(), ...(identity ? { "X-Joorchin-Client": identity } : {}) };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await joorchinFetch(BACKOFFICE_APP_BASE + withQuery(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return parseJoorchinResponse(response);
}

/** A back-office list call, normalised to the shared row-list shape. */
export async function backofficeList(path, query) {
  return asRowList(await backofficeRequest(path, { query }));
}

/**
 * A staff request to a platform URL that is not under this app's base
 * (`/api/v1/assets/...`). `body` may be FormData (sent as-is) or JSON.
 */
export async function backofficeFetch(url, /** @type {{method?: string, body?: unknown}} */ { method = "GET", body } = {}) {
  const identity = sdkClientIdentity("backoffice-sdk");
  const headers = { ...backofficeAuthHeaders(), ...(identity ? { "X-Joorchin-Client": identity } : {}) };
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  const response = await joorchinFetch(url, {
    method,
    headers,
    body: body === undefined || isForm ? body : JSON.stringify(body),
  });
  return parseJoorchinResponse(response);
}

/** A plugin service action: `pluginAction('reviews', 'reviews/42/approve', { method: 'POST' })`. */
export function pluginAction(pluginId, action, /** @type {{method?: string, body?: unknown, query?: unknown}} */ { method = "GET", body, query } = {}) {
  return backofficeRequest(`/plugins/${pluginId}/${action}`, { method, body, query });
}

/**
 * Generic CRUD over one plugin-data collection, as staff: `list` sees every
 * row, not only the caller's. Rows whose writes belong to a service route
 * (orders, carts, enrollments) refuse `create`/`update`/`delete`.
 */
export function pluginRecords(pluginId, entity) {
  const base = `/plugins/${pluginId}/data/${entity}`;
  const one = (id) => `${base}/${encodeURIComponent(String(id))}`;
  return Object.freeze({
    list: (query = {}) => backofficeList(base, query),
    get: (id) => backofficeRequest(one(id)),
    create: (data) => backofficeRequest(base, { method: "POST", body: data }),
    update: (id, data) => backofficeRequest(one(id), { method: "PUT", body: data }),
    remove: (id) => backofficeRequest(one(id), { method: "DELETE" }),
  });
}

/** An integration endpoint of an installable package (WhatsApp, Instagram…). */
export async function installableIntegration(pkg, endpoint, payload = {}) {
  if (canUseBackofficeSdk() && pkg !== "Core" && !/[/?#]/.test(`${pkg}${endpoint}`)) {
    const result = await joorchinSdkCall(() => joorchin.integrations[pkg][endpoint](payload));
    return result?.data ?? result;
  }
  const result = await backofficeRequest(
    `/integration-endpoints/installable/${pkg}/integration-endpoints/${endpoint}`,
    { method: "POST", body: payload },
  );
  return result?.data ?? result;
}

/** A core integration endpoint (`Core/SendSms`). */
export function coreIntegration(pkg, endpoint, payload = {}) {
  if (canUseBackofficeSdk() && pkg === "Core" && !/[/?#]/.test(endpoint)) {
    return joorchinSdkCall(() => joorchin.integrations.Core[endpoint](payload));
  }
  return backofficeRequest(
    `/integration-endpoints/${encodeURIComponent(pkg)}/${encodeURIComponent(endpoint)}`,
    { method: "POST", body: payload },
  );
}

export { APP_ID };

/** @typedef {import("@/api/joorchin").ApiResult} ApiResult */
