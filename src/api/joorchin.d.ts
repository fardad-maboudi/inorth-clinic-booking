/** Base URL for an entity collection, e.g. `/api/v1/apps/{appId}/entities/todo`.
 * @param {string} entity
 * @param {string=} id
 * @returns {string}
 */
export function entitiesUrl(entity: string, id?: string | undefined): string;
/**
 * Replace the user-facing error messages, e.g. for an English site:
 * `setJoorchinErrorCopy({ network: 'Could not reach the server.', generic: 'Something went wrong.' })`.
 * Only the keys of `JOORCHIN_ERROR_COPY` are accepted and only string values;
 * unknown keys are ignored. Call once at startup; pass `{}` to reset to the defaults.
 * @param {Partial<Record<keyof typeof JOORCHIN_ERROR_COPY, string>>} overrides
 * @returns {void}
 */
export function setJoorchinErrorCopy(overrides?: Partial<Record<keyof typeof JOORCHIN_ERROR_COPY, string>>): void;
/**
 * Build the Error every platform/plugin client throws for a failed request.
 * `message` is safe to render; `status`, `code`, `details`, `diagnostic` and
 * `retryable` are for branching (401 → login, 422 → field errors) and logs.
 * @param {number} status
 * @param {string=} text
 * @param {Record<string,unknown>=} extra
 */
export function createJoorchinError(status: number, text?: string | undefined, extra?: Record<string, unknown> | undefined): Error;
/**
 * Network failure (offline, DNS, CORS, reset) → the same displayable shape.
 * @param {unknown} cause
 */
export function createJoorchinNetworkError(cause: unknown): Error;
/** Read the identity of the SDK making the call, not the scaffold version.
 * @param {"site-sdk" | "backoffice-sdk"} [name]
 * @returns {string | null}
 */
export function sdkClientIdentity(name?: "site-sdk" | "backoffice-sdk"): string | null;
/** API URL against the configured Joorchin origin in live mode; left relative for demo mode. */
export function joorchinApiUrl(input: string | URL | Request): string;
/** True when the site's current caller header belongs to the SDK-owned session. */
export function sdkSessionMatchesCaller(): boolean;
/** Run an SDK operation and translate Joorchin transport errors to the site's safe error shape. */
export function joorchinSdkCall<T>(operation: () => Promise<T>): Promise<T>;
/**
 * `fetch` with the network failure mapped to Persian copy. Aborts are
 * rethrown untouched so callers can still ignore their own cancellations.
 * @param {string|URL|Request} url
 * @param {RequestInit=} init
 */
export function joorchinFetch(url: string | URL | Request, init?: RequestInit | undefined): Promise<Response>;
/**
 * Inspect a failed response body and surface owner-actionable backend errors as
 * a toast (today: plugin-not-installed). Returns a DISPLAYABLE message string
 * (never the raw body). Kept for clients that build their own Error; prefer
 * `createJoorchinError` / `parseJoorchinResponse`, which also keep `status`.
 * @param {number} status
 * @param {string} text
 */
export function surfaceJoorchinError(status: number, text: string): string;
/**
 * The one call every client makes for a non-OK response:
 * `throw joorchinResponseError(response.status, await response.text())`.
 * Toasts owner-actionable errors, then returns the displayable Error.
 * @param {number} status
 * @param {string} text
 */
export function joorchinResponseError(status: number, text: string): Error;
/**
 * Shared response parser for the platform client AND every plugin client.
 * Failed responses throw `createJoorchinError`; a 2xx whose body is not JSON
 * (an SPA/proxy HTML page served for an API path) throws the unavailable copy
 * instead of `Unexpected token '<'`.
 * @param {Response} response
 * @returns {Promise<unknown>}
 */
export function parseJoorchinResponse(response: Response): Promise<unknown>;
/** @typedef {Record<string, unknown> | Array<Record<string, unknown>>} ApiResult JSON from a plugin route: an object, or a list of objects. */
/** @typedef {import('./plugin-models.js').PluginRowMap} PluginRowMap */
/** @template {string} P @template {string} E @typedef {P extends keyof PluginRowMap ? (E extends keyof PluginRowMap[P] ? PluginRowMap[P][E] : Record<string,unknown>) : Record<string,unknown>} PluginRow */
/** @typedef {{_id?: string, id?: string, created_at?: string, updated_at?: string}} EntityMeta */
/** @template T @param {T[] | {items?:T[],data?:T[],results?:T[],rows?:T[],total?:number} | Record<string,unknown> | null | undefined | number | string} value
 * @param {number=} total
 * @returns {RowList<T>}
 */
export function asRowList<T>(value: T[] | {
    items?: T[];
    data?: T[];
    results?: T[];
    rows?: T[];
    total?: number;
} | Record<string, unknown> | null | undefined | number | string, total?: number | undefined): RowList<T>;
/**
 * List rows of an entity collection. Pass a row type for typed fields:
 * `listEntities<{ title: string }>('todo')`.
 * @template {Record<string,unknown>} [T=Record<string,unknown>]
 * @param {string | (EntityListOptions & {entity:string})} entity
 * @param {EntityListOptions} [params]
 * @returns {Promise<RowList<T>>} an Array — the rows. Also readable as `.items` / `.data` /
 *   `.results` / `.rows`, with `.total` — see `asRowList`.
 * @example
 * const todos = await listEntities('todo', { filter: { done: false }, sort: '-created_at', limit: 20 });
 * todos.total; // unpaged count
 */
export function listEntities<T extends Record<string, unknown> = Record<string, unknown>>(entity: string | (EntityListOptions & {
    entity: string;
}), params?: EntityListOptions): Promise<RowList<T>>;
/** @template {Record<string,unknown>} [T=Record<string,unknown>]
 * @param {string} entity @param {string} id
 * @returns {Promise<T & EntityMeta>}
 */
export function getEntity<T extends Record<string, unknown> = Record<string, unknown>>(entity: string, id: string): Promise<T & EntityMeta>;
/** @template {Record<string,unknown>} [T=Record<string,unknown>]
 * @param {string} entity @param {Partial<T>} data
 * @returns {Promise<T & EntityMeta>}
 */
export function createEntity<T extends Record<string, unknown> = Record<string, unknown>>(entity: string, data: Partial<T>): Promise<T & EntityMeta>;
/** @template {Record<string,unknown>} [T=Record<string,unknown>]
 * @param {string} entity @param {string} id @param {Partial<T>} data
 * @returns {Promise<T & EntityMeta>}
 */
export function updateEntity<T extends Record<string, unknown> = Record<string, unknown>>(entity: string, id: string, data: Partial<T>): Promise<T & EntityMeta>;
/** @param {string} entity @param {string} id
 * @returns {Promise<unknown>}
 */
export function deleteEntity(entity: string, id: string): Promise<unknown>;
export function pluginDataUrl(pluginId: any, entity: any, id: any): string;
/**
 * List rows of a plugin collection (product, category, order, post, …). Row
 * fields are typed for known plugin entities (`PluginRowMap`).
 * @template {string} P @template {string} E
 * @param {P} pluginId @param {E} entity @param {EntityListOptions} [params]
 * @returns {Promise<RowList<PluginRow<P, E>>>} an Array — the rows. Also readable as `.items` / `.data` /
 *   `.results` / `.rows`, with `.total` — see `asRowList`.
 */
export function listPluginRecords<P extends string, E extends string>(pluginId: P, entity: E, params?: EntityListOptions): Promise<RowList<PluginRow<P, E>>>;
/** One plugin row; the type follows `PluginRowMap` for known plugin entities.
 * @template {string} P @template {string} E
 * @param {P} pluginId @param {E} entity @param {string} id
 * @returns {Promise<PluginRow<P, E> & EntityMeta>}
 */
export function getPluginRecord<P extends string, E extends string>(pluginId: P, entity: E, id: string): Promise<PluginRow<P, E> & EntityMeta>;
/** @template {string} P @template {string} E
 * @param {P} pluginId @param {E} entity @param {Partial<PluginRow<P, E>>} data
 * @returns {Promise<PluginRow<P, E> & EntityMeta>}
 */
export function createPluginRecord<P extends string, E extends string>(pluginId: P, entity: E, data: Partial<PluginRow<P, E>>): Promise<PluginRow<P, E> & EntityMeta>;
/** @template {string} P @template {string} E
 * @param {P} pluginId @param {E} entity @param {string} id @param {Partial<PluginRow<P, E>>} data
 * @returns {Promise<PluginRow<P, E> & EntityMeta>}
 */
export function updatePluginRecord<P extends string, E extends string>(pluginId: P, entity: E, id: string, data: Partial<PluginRow<P, E>>): Promise<PluginRow<P, E> & EntityMeta>;
/** @param {string} pluginId @param {string} entity @param {string} id
 * @returns {Promise<unknown>}
 */
export function deletePluginRecord(pluginId: string, entity: string, id: string): Promise<unknown>;
/**
 * Authenticated app-scoped request for semantic plugin routes not covered by CRUD helpers.
 * @param {string} path
 * @param {RequestInit=} init
 * @returns {Promise<ApiResult>}
 */
export function requestAppApi(path: string, init?: RequestInit | undefined): Promise<ApiResult>;
/**
 * POST to a plugin endpoint that the backend deliberately exposes without site
 * authentication (for example the Forms contact-message endpoint). URL
 * construction stays in this platform seam so generated plugin clients never
 * guess or hardcode the app-scoped REST path.
 * @param {string} pluginId
 * @param {string} action
 * @param {Record<string,unknown>} data
 * @returns {Promise<ApiResult>}
 */
export function postPublicPluginAction(pluginId: string, action: string, data: Record<string, unknown>): Promise<ApiResult>;
/**
 * GET a plugin-owned action through the platform transport seam. `action` may
 * be empty for a plugin's root endpoint (for example server-side search).
 * @param {string} pluginId
 * @param {string=} action
 * @param {Record<string,unknown>=} query
 * @returns {Promise<ApiResult>}
 */
export function getPluginAction(pluginId: string, action?: string | undefined, query?: Record<string, unknown> | undefined): Promise<ApiResult>;
/**
 * General authenticated plugin action transport for generated plugin clients.
 * URL construction, tenant scoping, auth and error handling stay platform-owned.
 * @param {string} pluginId
 * @param {string=} action
 * @param {{method?:string,query?:Record<string,unknown>,data?:unknown,headers?:Record<string,string>}=} options
 * @returns {Promise<ApiResult>}
 * @example
 * const summary = await requestPluginAction('reviews', 'summary', { query: { targetId } });
 * await requestPluginAction('reviews', 'reviews', { method: 'POST', data: { targetId, rating: 5 } });
 */
export function requestPluginAction(pluginId: string, action?: string | undefined, { method, query, data, headers }?: {
    method?: string;
    query?: Record<string, unknown>;
    data?: unknown;
    headers?: Record<string, string>;
} | undefined): Promise<ApiResult>;
/**
 * POST to one of this app's configured integration endpoints.
 * @param {string} packageName
 * @param {string} endpoint
 * @param {Record<string,unknown>} data
 * @returns {Promise<ApiResult>}
 */
export function postIntegrationAction(packageName: string, endpoint: string, data: Record<string, unknown>): Promise<ApiResult>;
/**
 * @param {string=} pluginId
 * @returns {Promise<Record<string,unknown>>}
 */
export function getPublicSettings(pluginId?: string | undefined): Promise<Record<string, unknown>>;
/**
 * App-wide tracking, ownership-verification, and custom head settings.
 * @returns {Promise<Record<string,unknown>>}
 */
export function getPublicSiteSettings(): Promise<Record<string, unknown>>;
/**
 * Record a visitor event for the owner's analytics, e.g.
 * `track('signup_click', { plan: 'pro', seats: 3 })`. Fire-and-forget: it never
 * throws, never blocks, and is a no-op where the telemetry beacon is not
 * installed (SSR, tests). The name is normalised to lower_snake_case; props keep
 * at most 10 keys of string, number or boolean values. Do not put personal data
 * (phone, email, name) in props.
 * @param {string} name
 * @param {Record<string, string | number | boolean>} [props]
 * @returns {void}
 */
export function track(name: string, props?: Record<string, string | number | boolean>): void;
/**
 * Narrow an untrusted value (response field or query param) to an outcome.
 * @param {unknown} value
 * @returns {PaymentOutcome|undefined}
 */
export function asPaymentOutcome(value: unknown): PaymentOutcome | undefined;
/**
 * Vite's resolved base without a trailing slash: the mount path in a preview
 * container, `''` on a published root domain.
 * @returns {string}
 */
export function appBasePath(): string;
/**
 * Absolute URL of an app route that keeps the preview the preview base base.
 * A hand-built absolute shop URL 404s in previews.
 * @param {string} path Route such as `/shop/order-success`.
 * @param {Record<string,string|undefined>=} query
 * @returns {string}
 */
export function appUrl(path: string, query?: Record<string, string | undefined> | undefined): string;
/**
 * THE one place gateway return parameters are interpreted: Zarinpal
 * `Authority`/`Status`, Zibal `trackId`/`success`/`status`, SEP `RefNum`/`State`,
 * Mellat `SaleReferenceId`/`ResCode`, plus the server return bridge's
 * `outcome` and `orderId`. The server still verifies; this only locates values.
 * @param {string|URLSearchParams|Record<string,unknown>|null|undefined} input A query string, URLSearchParams or plain object.
 * @returns {{orderId?:string,authority?:string,status?:string,outcome?:PaymentOutcome,params:Record<string,string>,hasGatewayParams:boolean}}
 */
export function normalizeGatewayReturn(input: string | URLSearchParams | Record<string, unknown> | null | undefined): {
    orderId?: string;
    authority?: string;
    status?: string;
    outcome?: PaymentOutcome;
    params: Record<string, string>;
    hasGatewayParams: boolean;
};
/**
 * Read the redirect instruction off a create-payment / checkout / pay
 * response. Old responses carry only `paymentUrl`/`checkoutUrl` (GET).
 * @param {PaymentStartResult|null|undefined} result
 * @returns {PaymentRedirect|null}
 */
export function paymentRedirectOf(result: PaymentStartResult | null | undefined): PaymentRedirect | null;
/**
 * True for a sandbox/demo payment, so previews can say "test payment".
 * @param {PaymentStartResult|null|undefined} result
 * @returns {boolean}
 */
export function isSandboxPayment(result: PaymentStartResult | null | undefined): boolean;
/**
 * Send the shopper to the gateway. GET navigates; POST builds and submits a
 * form (fields are bank-issued tokens). Inside a Telegram Mini App a GET opens
 * through `openLink` so the gateway runs in the external browser.
 * @param {PaymentStartResult|null|undefined} result
 * @returns {boolean} true when a navigation was started.
 */
export function redirectToPayment(result: PaymentStartResult | null | undefined): boolean;
export const JOORCHIN_ERROR_COPY: Readonly<{
    network: "ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.";
    unavailable: "سرویس موقتاً در دسترس نیست. لطفاً چند لحظه دیگر دوباره تلاش کنید.";
    unauthorized: "برای ادامه وارد حساب کاربری خود شوید.";
    forbidden: "اجازه دسترسی به این بخش را ندارید.";
    notFound: "مورد درخواستی پیدا نشد.";
    invalid: "اطلاعات ارسال‌شده معتبر نیست. لطفاً آن را بررسی کنید.";
    rateLimited: "تعداد درخواست‌ها زیاد است. لطفاً کمی بعد دوباره تلاش کنید.";
    generic: "درخواست انجام نشد. لطفاً دوباره تلاش کنید.";
}>;
/**
 * JSON from a plugin route: an object, or a list of objects.
 */
export type ApiResult = Record<string, unknown> | Array<Record<string, unknown>>;
export type PluginRowMap = import("./plugin-models.js").PluginRowMap;
export type PluginRow<P extends string, E extends string> = P extends keyof PluginRowMap ? (E extends keyof PluginRowMap[P] ? PluginRowMap[P][E] : Record<string, unknown>) : Record<string, unknown>;
export type EntityMeta = {
    _id?: string;
    id?: string;
    created_at?: string;
    updated_at?: string;
};
export type RowList<T> = T[] & {
    items: T[];
    data: T[];
    results: T[];
    rows: T[];
    records: T[];
    list: T[];
    total: number;
} & Record<string, any>;
export type EntityListOptions = {
    filter?: Record<string, unknown>;
    sort?: string;
    limit?: number;
    skip?: number;
    envelope?: boolean;
};
export type PaymentOutcome = "paid" | "pending" | "cancelled" | "failed";
/**
 * Gateway hand-off. POST must be a form submit (SEP/Mellat/Parsian/Sadad style).
 */
export type PaymentRedirect = {
    method: "GET" | "POST";
    url: string;
    fields?: Record<string, string>;
};
export type PaymentStartResult = {
    paymentUrl?: string;
    checkoutUrl?: string;
    redirect?: PaymentRedirect;
    sandbox?: boolean;
    demo?: boolean;
};
/** @template T @typedef {T[] & {items:T[],data:T[],results:T[],rows:T[],records:T[],list:T[],total:number} & Record<string,any>} RowList */
/** @typedef {{filter?:Record<string,unknown>,sort?:string,limit?:number,skip?:number,envelope?:boolean}} EntityListOptions */
/** @type {string} */
export const APP_ID: string;
