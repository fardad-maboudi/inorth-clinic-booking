/** The signed-in staff token, else the preview / Mini App session token. */
export function backofficeAuthHeaders(): {
    Authorization?: undefined;
} | {
    Authorization: string;
};
/**
 * One back-office request, relative to this app: `backofficeRequest('/members')`.
 * Throws the shared Joorchin error (`status` preserved) on any non-2xx.
 */
export function backofficeRequest(path: any, { method, body, query }?: {
    method?: string;
    body?: unknown;
    query?: unknown;
}): Promise<unknown>;
/** A back-office list call, normalised to the shared row-list shape. */
export function backofficeList(path: any, query: any): Promise<import("@/api/joorchin").RowList<any>>;
/**
 * A staff request to a platform URL that is not under this app's base
 * (`/api/v1/assets/...`). `body` may be FormData (sent as-is) or JSON.
 */
export function backofficeFetch(url: any, { method, body }?: {
    method?: string;
    body?: unknown;
}): Promise<unknown>;
/** A plugin service action: `pluginAction('reviews', 'reviews/42/approve', { method: 'POST' })`. */
export function pluginAction(pluginId: any, action: any, { method, body, query }?: {
    method?: string;
    body?: unknown;
    query?: unknown;
}): Promise<unknown>;
/**
 * Generic CRUD over one plugin-data collection, as staff: `list` sees every
 * row, not only the caller's. Rows whose writes belong to a service route
 * (orders, carts, enrollments) refuse `create`/`update`/`delete`.
 */
export function pluginRecords(pluginId: any, entity: any): Readonly<{
    list: (query?: {}) => Promise<import("@/api/joorchin").RowList<any>>;
    get: (id: any) => Promise<unknown>;
    create: (data: any) => Promise<unknown>;
    update: (id: any, data: any) => Promise<unknown>;
    remove: (id: any) => Promise<unknown>;
}>;
/** An integration endpoint of an installable package (WhatsApp, Instagram…). */
export function installableIntegration(pkg: any, endpoint: any, payload?: {}): Promise<any>;
/** A core integration endpoint (`Core/SendSms`). */
export function coreIntegration(pkg: any, endpoint: any, payload?: {}): Promise<unknown>;
export const BACKOFFICE_APP_BASE: string;
export { APP_ID };
export type ApiResult = import("@/api/joorchin").ApiResult;
import { APP_ID } from "@/api/joorchin";
