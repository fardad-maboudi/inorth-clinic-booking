/**
 * Active products, newest first by default.
 * @param {{filter?:Record<string,unknown>,sort?:string,limit?:number,skip?:number}} [options]
 * @returns {Promise<Array<Record<string,unknown>>>} product rows (`.items` also works).
 * @example
 * const products = await listProducts({ sort: '-created_at', limit: 12 });
 * products.map((p) => p.title);
 */
export function listProducts({ filter, sort, limit, skip }?: {
    filter?: Record<string, unknown>;
    sort?: string;
    limit?: number;
    skip?: number;
}): Promise<Array<Record<string, unknown>>>;
/**
 * Returns the product plus `attributeList`: [{ key, label, value }] already
 * resolved to display labels and ordered like the storefront filters. Render
 * that — never Object.entries(product.attributes), which yields storage keys.
 * @param {string} id
 * @returns {Promise<import('../plugin-models.js').EcommerceProductRow & {attributeList: Array<{key: string, label: string, value: unknown}>}>}
 */
export function getProduct(id: string): Promise<import("../plugin-models.js").EcommerceProductRow & {
    attributeList: Array<{
        key: string;
        label: string;
        value: unknown;
    }>;
}>;
/**
 * Localized attribute title; unknown agent-defined keys fall back to the storage key.
 * @param {string} key
 * @param {Array<{key?:string,name?:string}>=} attributes
 * @returns {string}
 */
export function attributeLabel(key: string, attributes?: Array<{
    key?: string;
    name?: string;
}> | undefined): string;
/**
 * @param {Record<string,unknown>=} params
 * @returns {Promise<Array<Record<string,unknown>>>}
 */
export function listAttributes(params?: Record<string, unknown> | undefined): Promise<Array<Record<string, unknown>>>;
/**
 * Faceted search: filter by text, category, price range, tags and dynamic
 * attributes. `tags` takes one tag or an array of them; `attributes` is a
 * map like { color: 'red', size: ['L','XL'] }.
 * @param {Omit<Partial<import('./ecommerce-contracts.js').ProductSearchQuery>, 'tags'> & {tags?:string|string[],attributes?:Record<string,string|string[]>}} [params]
 * @returns {Promise<import('./ecommerce-contracts.js').ProductSearchResponse['items']>} an Array — matching product rows, with `.total` for the
 *   unpaged count and `.facets` when requested (`.items` also works).
 * @example
 * const result = await searchProducts({ q: 'کفش', minPrice: 100000, attributes: { color: ['red'] }, facets: 'true' });
 * result.total; result.facets;
 */
export function searchProducts(params?: Omit<Partial<import("./ecommerce-contracts.js").ProductSearchQuery>, "tags"> & {
    tags?: string | string[];
    attributes?: Record<string, string | string[]>;
}): Promise<import("./ecommerce-contracts.js").ProductSearchResponse["items"]>;
/**
 * Available filter facets + value counts for the catalog (optionally a category).
 * @param {Record<string,unknown>=} params
 * @returns {Promise<import('./ecommerce-contracts.js').FacetsResponse>}
 */
export function getFacets(params?: Record<string, unknown> | undefined): Promise<import("./ecommerce-contracts.js").FacetsResponse>;
/**
 * Store-wide settings (currency, tax, contact) — storefront-safe fields only.
 * @returns {Promise<import('./ecommerce-contracts.js').StoreSettingsResponse>}
 */
export function getStoreSettings(): Promise<import("./ecommerce-contracts.js").StoreSettingsResponse>;
/**
 * One root/layout bootstrap: settings, delivery choices, pickup points and cold facets.
 * @returns {Promise<import('./ecommerce-contracts.js').StorefrontResponse>}
 */
export function getStorefront(): Promise<import("./ecommerce-contracts.js").StorefrontResponse>;
/**
 * Catalog categories, ordered by their `order` field.
 * @returns {Promise<Array<import('../plugin-models.js').EcommerceCategoryRow>>} an Array — category rows (`.items` also works).
 * @param {Record<string,unknown>=} params
 */
export function listCategories(params?: Record<string, unknown> | undefined): Promise<Array<import("../plugin-models.js").EcommerceCategoryRow>>;
/**
 * @param {string} id
 * @returns {Promise<import('../plugin-models.js').EcommerceCategoryRow>}
 */
export function getCategory(id: string): Promise<import("../plugin-models.js").EcommerceCategoryRow>;
/** @returns {Promise<import('./ecommerce-contracts.js').CartResponse>} */
export function getCart(): Promise<import("./ecommerce-contracts.js").CartResponse>;
/**
 * @param {string} productId
 * @param {number=} qty
 * @param {string=} variantId Unique variant SKU, required when variants exist.
 * @returns {Promise<import('./ecommerce-contracts.js').CartResponse>}
 * @example
 * const cart = await addToCart(product._id, 1); // returns the server-priced cart
 * cart.total;
 */
export function addToCart(productId: string, qty?: number | undefined, variantId?: string | undefined): Promise<import("./ecommerce-contracts.js").CartResponse>;
/**
 * @param {string} lineId Server-returned line identity (base productId for non-variants).
 * @param {number} qty
 * @returns {Promise<import('./ecommerce-contracts.js').CartResponse>}
 */
export function updateCartItem(lineId: string, qty: number): Promise<import("./ecommerce-contracts.js").CartResponse>;
/**
 * @param {string} lineId
 * @returns {Promise<import('./ecommerce-contracts.js').CartResponse>}
 */
export function removeFromCart(lineId: string): Promise<import("./ecommerce-contracts.js").CartResponse>;
/**
 * @returns {Promise<import('./ecommerce-contracts.js').CartResponse>}
 */
export function clearCart(): Promise<import("./ecommerce-contracts.js").CartResponse>;
/**
 * @param {string} code
 * @returns {Promise<import('./ecommerce-contracts.js').CartResponse>}
 */
export function applyCoupon(code: string): Promise<import("./ecommerce-contracts.js").CartResponse>;
/**
 * @returns {Promise<import('./ecommerce-contracts.js').CartResponse>}
 */
export function removeCoupon(): Promise<import("./ecommerce-contracts.js").CartResponse>;
/**
 * Delivery options the merchant offers at checkout. Each has a `kind`:
 * 'pickup' (collect in-store), 'manual', 'tipax' or 'iran_post'. For pickup
 * methods you can skip the shipping address and show pickup locations instead.
 * @returns {Promise<import('./ecommerce-contracts.js').ShippingMethodsResponse>}
 */
export function getShippingMethods(): Promise<import("./ecommerce-contracts.js").ShippingMethodsResponse>;
/**
 * Iran provinces and their cities, owned and versioned by the backend.
 * @returns {Promise<import('./ecommerce-contracts.js').ShippingLocationsResponse>}
 */
export function getShippingLocations(): Promise<import("./ecommerce-contracts.js").ShippingLocationsResponse>;
/**
 * Store pickup points (for 'pickup' delivery methods).
 * @returns {Promise<import('./ecommerce-contracts.js').PickupLocationsResponse>}
 */
export function getPickupLocations(): Promise<import("./ecommerce-contracts.js").PickupLocationsResponse>;
/**
 * Select a shipping method + destination on the server cart and get the
 * re-priced cart back (server computes shippingCost + tax + total).
 * @param {string} methodId
 * @param {Record<string,unknown>|null|undefined} address
 * @param {{addressId?:string,pickupLocationId?:string}=} options
 * @returns {Promise<import('./ecommerce-contracts.js').CartResponse>}
 */
export function setShipping(methodId: string, address: Record<string, unknown> | null | undefined, { addressId, pickupLocationId }?: {
    addressId?: string;
    pickupLocationId?: string;
} | undefined): Promise<import("./ecommerce-contracts.js").CartResponse>;
/**
 * Saved shipping addresses, default first. Requires a signed-in shopper — a
 * guest has no address book and checks out with an inline address instead.
 * @returns {Promise<import('./ecommerce-contracts.js').ShopperAddressListResponse>}
 */
export function listAddresses(): Promise<import("./ecommerce-contracts.js").ShopperAddressListResponse>;
/**
 * Save a new address. `province` and `city` must be values from
 * getShippingLocations(); the server validates that the city really belongs to
 * the province, normalizes the phone and requires a 10-digit postal code.
 * @param {Record<string,unknown>} address
 * @returns {Promise<import('./ecommerce-contracts.js').ShopperAddressResponse>}
 */
export function createAddress(address: Record<string, unknown>): Promise<import("./ecommerce-contracts.js").ShopperAddressResponse>;
/**
 * @param {string} addressId
 * @param {Record<string,unknown>} address
 * @returns {Promise<import('./ecommerce-contracts.js').ShopperAddressResponse>}
 */
export function updateAddress(addressId: string, address: Record<string, unknown>): Promise<import("./ecommerce-contracts.js").ShopperAddressResponse>;
/**
 * @param {string} addressId
 * @returns {Promise<Record<string,unknown>>}
 */
export function deleteAddress(addressId: string): Promise<Record<string, unknown>>;
/**
 * Make one saved address the default. Returns the refreshed list.
 * @param {string} addressId
 * @returns {Promise<import('./ecommerce-contracts.js').ShopperAddressResponse>}
 */
export function setDefaultAddress(addressId: string): Promise<import("./ecommerce-contracts.js").ShopperAddressResponse>;
/** Canonical ASCII Iranian mobile in E.164 (`+989121234567`), else ''.
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizePhone(raw: unknown): string;
/**
 * @param {unknown} raw
 * @returns {boolean}
 */
export function isValidPhone(raw: unknown): boolean;
/**
 * `+989121234567` → `09121234567` for display beside a Persian address.
 * @param {unknown} value
 * @returns {string}
 */
export function localPhone(value: unknown): string;
/**
 * Iranian postal code: 10 digits, kept as a string. '' when invalid.
 *
 * The first five digits are the routing half (کد رهسپاری) and Iran Post
 * never uses 0 or 2 there. MUST stay identical to the server's rule in
 * shopper-address.util.ts — a storefront that accepts what checkout rejects
 * strands the shopper on the payment step.
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizePostalCode(raw: unknown): string;
/**
 * @param {unknown} raw
 * @returns {boolean}
 */
export function isValidPostalCode(raw: unknown): boolean;
/**
 * Does `city` belong to `province`? Pass the `provinces` array from
 * getShippingLocations() — never a browser-side copy of the dataset.
 * @param {Array<{name?:string,cities?:string[]}>} provinces
 * @param {string} province
 * @param {string} city
 * @returns {boolean}
 */
export function isCityOfProvince(provinces: Array<{
    name?: string;
    cities?: string[];
}>, province: string, city: string): boolean;
/**
 * Where the gateway (or the server return bridge) sends the shopper back to:
 * the order-success route under the app base (the preview base in previews), or
 * `/miniapp` inside a Telegram Mini App.
 * @param {string=} orderId
 * @returns {string}
 */
export function shopReturnUrl(orderId?: string | undefined): string;
/**
 * @param {string} id
 * @returns {Promise<import('./ecommerce-contracts.js').OrderResponse>}
 */
export function getOrder(id: string): Promise<import("./ecommerce-contracts.js").OrderResponse>;
/**
 * Create an order from the current server cart. The server snapshots live
 * prices, recomputes the total (incl. tax + shipping), and reserves stock.
 * Pass shippingMethodId to lock in shipping at checkout time.
 * Pass paymentMethod:'cod' for delivery settlement or 'cardtocard' for the
 * private receipt flow. Returns { orderId, total, currency, paymentUrl?, redirect? }.
 * For an online order the response already carries the gateway hand-off: call
 * redirectToPayment(order) — do NOT call startCheckout() right after it (that
 * would open a second payment attempt; startCheckout is only the retry path).
 * Concurrent identical calls share one request.
 * @param {Partial<import('./ecommerce-contracts.js').CheckoutBody>} [options]
 * @returns {Promise<import('./ecommerce-contracts.js').CheckoutResponse & {redirect?: import('../joorchin.js').PaymentRedirect, sandbox?: boolean}>}
 * @example
 * const order = await checkout({ addressId, shippingMethodId, paymentMethod: 'online' });
 * redirectToPayment(order); // GET or POST hand-off to the gateway
 */
export function checkout({ address, customer, addressId, pickupLocationId, shippingMethodId, paymentMethod, callbackUrl }?: Partial<import("./ecommerce-contracts.js").CheckoutBody>): Promise<import("./ecommerce-contracts.js").CheckoutResponse & {
    redirect?: import("../joorchin.js").PaymentRedirect;
    sandbox?: boolean;
}>;
/**
 * @returns {Promise<import('./ecommerce-contracts.js').CheckoutPaymentMethodsResponse>}
 */
export function getCheckoutPaymentMethods(): Promise<import("./ecommerce-contracts.js").CheckoutPaymentMethodsResponse>;
/**
 * @param {string} authority
 * @returns {Promise<import('./ecommerce-contracts.js').ManualPaymentResponse>}
 */
export function getManualPayment(authority: string): Promise<import("./ecommerce-contracts.js").ManualPaymentResponse>;
/**
 * @param {string} authority
 * @param {File|Blob} file
 * @param {string=} trackingNumber
 * @returns {Promise<Record<string,unknown>>}
 */
export function submitManualPaymentReceipt(authority: string, file: File | Blob, trackingNumber?: string | undefined): Promise<Record<string, unknown>>;
/**
 * Live carrier tracking for an order: { trackingNumber, status, location, eta }.
 * @param {string} orderId
 * @returns {Promise<import('./ecommerce-contracts.js').TrackResponse>}
 */
export function trackOrder(orderId: string): Promise<import("./ecommerce-contracts.js").TrackResponse>;
/**
 * Retry payment for an already-created online order. Amount is derived
 * server-side. The response carries `paymentUrl` and, when the gateway needs a
 * form POST, `redirect`; pass it to redirectToPayment() (or set
 * `{ redirect: true }` to navigate automatically). A missing gateway fails
 * closed; only a server-confirmed zero-total order returns without a redirect.
 * Concurrent calls for one order share one request.
 * @param {string} orderId
 * @param {{redirect?: boolean}=} options
 * @returns {Promise<import('./ecommerce-contracts.js').PayResponse & {redirect?: import('../joorchin.js').PaymentRedirect, sandbox?: boolean}>}
 */
export function startCheckout(orderId: string, { redirect }?: {
    redirect?: boolean;
} | undefined): Promise<import("./ecommerce-contracts.js").PayResponse & {
    redirect?: import("../joorchin.js").PaymentRedirect;
    sandbox?: boolean;
}>;
/**
 * Confirm an order after returning from the payment gateway. The server
 * verifies the gateway callback and only then marks the order paid — the
 * browser cannot set order status itself. Pass the raw return query (string,
 * URLSearchParams or object): Authority/Status, Zibal trackId/success, SEP
 * RefNum/State, Mellat SaleReferenceId/ResCode are all located and forwarded.
 * `outcome` is present on newer servers; older ones only send `paid`.
 * @param {string} orderId
 * @param {string|URLSearchParams|{authority?:string,status?:string,[key:string]:unknown}=} returned
 * @returns {Promise<import('./ecommerce-contracts.js').ConfirmResponse & {outcome?: import('../joorchin.js').PaymentOutcome}>}
 */
export function confirmOrder(orderId: string, returned?: (string | URLSearchParams | {
    authority?: string;
    status?: string;
    [key: string]: unknown;
}) | undefined): Promise<import("./ecommerce-contracts.js").ConfirmResponse & {
    outcome?: import("../joorchin.js").PaymentOutcome;
}>;
/**
 * Map a confirm response or order row to an outcome. Tolerates old servers
 * that only send `paid`/`status`.
 * @param {Record<string,unknown>|null|undefined} value
 * @returns {import('../joorchin.js').PaymentOutcome}
 */
export function orderOutcome(value: Record<string, unknown> | null | undefined): import("../joorchin.js").PaymentOutcome;
/**
 * Drives the order result page. Reads the gateway/bridge query once, confirms
 * with the server at most once per return (StrictMode-safe), polls the order
 * while verification is pending, and exposes one of
 * 'checking' | 'paid' | 'pending' | 'cancelled' | 'failed'.
 * `retry()` opens a fresh payment attempt (online orders only).
 * @param {{orderId?: string, search?: string}} [options] Defaults: query string of the current URL.
 * @returns {{state: 'checking'|'paid'|'pending'|'cancelled'|'failed', orderId?: string, order: Record<string,unknown>|null, message: string, sandbox: boolean, retry: () => Promise<void>, refresh: () => void}}
 */
export function useOrderPaymentResult(options?: {
    orderId?: string;
    search?: string;
}): {
    state: "checking" | "paid" | "pending" | "cancelled" | "failed";
    orderId?: string;
    order: Record<string, unknown> | null;
    message: string;
    sandbox: boolean;
    retry: () => Promise<void>;
    refresh: () => void;
};
/**
 * Telegram Mini App: the gateway runs in the external browser, so re-read the
 * order whenever the app returns to the foreground. Returns an unsubscribe.
 * @param {string} orderId
 * @param {(order: Record<string,unknown>) => void} onChange
 * @returns {() => void}
 */
export function watchOrderPayment(orderId: string, onChange: (order: Record<string, unknown>) => void): () => void;
/**
 * @param {Record<string,unknown>=} params
 * @returns {Promise<import('./ecommerce-contracts.js').OrdersResponse>}
 */
export function listOrders(params?: Record<string, unknown> | undefined): Promise<import("./ecommerce-contracts.js").OrdersResponse>;
/** @typedef {{enabled?: boolean}} ShopHookOptions */
/** @template T @typedef {{data: T|undefined, error: Error|null, isLoading: boolean, isPending: boolean, isError: boolean, isFetching: boolean, isSuccess: boolean, refetch: Function}} ShopQuery */
/**
 * Active products. @param {{filter?:Record<string,unknown>,sort?:string,limit?:number,skip?:number}} [params]
 * @param {ShopHookOptions} [options]
 * @returns {ShopQuery<Array<import('../plugin-models.js').EcommerceProductRow>>}
 */
export function useProducts(params?: {
    filter?: Record<string, unknown>;
    sort?: string;
    limit?: number;
    skip?: number;
}, options?: ShopHookOptions): ShopQuery<Array<import("../plugin-models.js").EcommerceProductRow>>;
/**
 * One product with `attributeList`. Disabled until `id` is set.
 * @param {string|undefined} id @param {ShopHookOptions} [options]
 * @returns {ShopQuery<import('../plugin-models.js').EcommerceProductRow & {attributeList: Array<{key: string, label: string, value: unknown}>}>}
 */
export function useProduct(id: string | undefined, options?: ShopHookOptions): ShopQuery<import("../plugin-models.js").EcommerceProductRow & {
    attributeList: Array<{
        key: string;
        label: string;
        value: unknown;
    }>;
}>;
/**
 * Faceted product search; the previous result stays visible while a filter changes.
 * @param {Omit<Partial<import('./ecommerce-contracts.js').ProductSearchQuery>, 'tags'> & {tags?:string|string[],attributes?:Record<string,string|string[]>}} [params] @param {ShopHookOptions} [options]
 * @returns {ShopQuery<Array<import('../plugin-models.js').EcommerceProductRow> & {total?: number, facets?: unknown}>}
 */
export function useProductSearch(params?: Omit<Partial<import("./ecommerce-contracts.js").ProductSearchQuery>, "tags"> & {
    tags?: string | string[];
    attributes?: Record<string, string | string[]>;
}, options?: ShopHookOptions): ShopQuery<Array<import("../plugin-models.js").EcommerceProductRow> & {
    total?: number;
    facets?: unknown;
}>;
/** Catalog categories ordered by `order`.
 * @param {Record<string,unknown>} [params] @param {ShopHookOptions} [options]
 * @returns {ShopQuery<Array<import('../plugin-models.js').EcommerceCategoryRow>>}
 */
export function useCategories(params?: Record<string, unknown>, options?: ShopHookOptions): ShopQuery<Array<import("../plugin-models.js").EcommerceCategoryRow>>;
/** One category. Disabled until `id` is set.
 * @param {string|undefined} id @param {ShopHookOptions} [options]
 * @returns {ShopQuery<import('../plugin-models.js').EcommerceCategoryRow>}
 */
export function useCategory(id: string | undefined, options?: ShopHookOptions): ShopQuery<import("../plugin-models.js").EcommerceCategoryRow>;
/** Settings, delivery choices, pickup points and cold facets in one request.
 * @param {ShopHookOptions} [options]
 * @returns {ShopQuery<import('./ecommerce-contracts.js').StorefrontResponse>}
 */
export function useStorefront(options?: ShopHookOptions): ShopQuery<import("./ecommerce-contracts.js").StorefrontResponse>;
/** The signed-in customer's orders.
 * @param {Record<string,unknown>} [params] @param {ShopHookOptions} [options]
 * @returns {ShopQuery<import('./ecommerce-contracts.js').OrdersResponse>}
 */
export function useOrders(params?: Record<string, unknown>, options?: ShopHookOptions): ShopQuery<import("./ecommerce-contracts.js").OrdersResponse>;
/** One order of the signed-in customer. Disabled until `id` is set.
 * @param {string|undefined} id @param {ShopHookOptions} [options]
 * @returns {ShopQuery<import('./ecommerce-contracts.js').OrderResponse>}
 */
export function useOrder(id: string | undefined, options?: ShopHookOptions): ShopQuery<import("./ecommerce-contracts.js").OrderResponse>;
/** The signed-in customer's saved addresses.
 * @param {ShopHookOptions} [options]
 * @returns {ShopQuery<import('./ecommerce-contracts.js').ShopperAddressListResponse>}
 */
export function useAddresses(options?: ShopHookOptions): ShopQuery<import("./ecommerce-contracts.js").ShopperAddressListResponse>;
/** Backend-owned province/city catalog.
 * @returns {ShopQuery<import('./ecommerce-contracts.js').ShippingLocationsResponse>}
 */
export function useShippingLocations(): ShopQuery<import("./ecommerce-contracts.js").ShippingLocationsResponse>;
/** Same-session or signed-in owned tracking; this is not cross-session recovery.
 * @param {string} id @param {ShopHookOptions} [options]
 * @returns {ShopQuery<import('./ecommerce-contracts.js').TrackResponse>}
 */
export function useOrderTracking(id: string, options?: ShopHookOptions): ShopQuery<import("./ecommerce-contracts.js").TrackResponse>;
/** Authoritative checkout-mode notice. @returns {ShopQuery<import('./ecommerce-contracts.js').CheckoutPaymentMethodsResponse>} */
export function useCheckoutPaymentMethods(): ShopQuery<import("./ecommerce-contracts.js").CheckoutPaymentMethodsResponse>;
export namespace SHOP_ROUTES {
    let productList: string;
    let shopIndex: string;
    let productDetail: string;
    let cart: string;
    let checkout: string;
    let orderSuccess: string;
    let cardToCard: string;
    let account: string;
    let orders: string;
    let orderDetail: string;
    let addresses: string;
    let profile: string;
}
export namespace ATTRIBUTE_LABELS {
    let color: string;
    let colour: string;
    let size: string;
    let material: string;
    let weight: string;
    let dimensions: string;
    let brand: string;
    let model: string;
    let warranty: string;
    let storage: string;
    let capacity: string;
    let origin: string;
    let karat: string;
    let purity: string;
    let style: string;
    let gender: string;
    let pattern: string;
    let volume: string;
    let fit: string;
    let season: string;
}
/**
 * Active products, newest first by default.
 * @param {{filter?:Record<string,unknown>,sort?:string,limit?:number,skip?:number}} [options]
 * @returns {Promise<Array<Record<string,unknown>>>} product rows (`.items` also works).
 * @example
 * const products = await listProducts({ sort: '-created_at', limit: 12 });
 * products.map((p) => p.title);
 */
export function getProducts({ filter, sort, limit, skip }?: {
    filter?: Record<string, unknown>;
    sort?: string;
    limit?: number;
    skip?: number;
}): Promise<Array<Record<string, unknown>>>;
/**
 * Active products, newest first by default.
 * @param {{filter?:Record<string,unknown>,sort?:string,limit?:number,skip?:number}} [options]
 * @returns {Promise<Array<Record<string,unknown>>>} product rows (`.items` also works).
 * @example
 * const products = await listProducts({ sort: '-created_at', limit: 12 });
 * products.map((p) => p.title);
 */
export function fetchProducts({ filter, sort, limit, skip }?: {
    filter?: Record<string, unknown>;
    sort?: string;
    limit?: number;
    skip?: number;
}): Promise<Array<Record<string, unknown>>>;
/**
 * Catalog categories, ordered by their `order` field.
 * @returns {Promise<Array<import('../plugin-models.js').EcommerceCategoryRow>>} an Array — category rows (`.items` also works).
 * @param {Record<string,unknown>=} params
 */
export function getCategories(params?: Record<string, unknown> | undefined): Promise<Array<import("../plugin-models.js").EcommerceCategoryRow>>;
/**
 * Catalog categories, ordered by their `order` field.
 * @returns {Promise<Array<import('../plugin-models.js').EcommerceCategoryRow>>} an Array — category rows (`.items` also works).
 * @param {Record<string,unknown>=} params
 */
export function fetchCategories(params?: Record<string, unknown> | undefined): Promise<Array<import("../plugin-models.js").EcommerceCategoryRow>>;
export { toLatinDigits } from "../auth.js";
export type ShopHookOptions = {
    enabled?: boolean;
};
export type ShopQuery<T> = {
    data: T | undefined;
    error: Error | null;
    isLoading: boolean;
    isPending: boolean;
    isError: boolean;
    isFetching: boolean;
    isSuccess: boolean;
    refetch: Function;
};
import { isSandboxPayment } from '@/api/joorchin';
import { normalizeGatewayReturn } from '@/api/joorchin';
import { paymentRedirectOf } from '@/api/joorchin';
import { redirectToPayment } from '@/api/joorchin';
import { APP_ID } from '@/api/joorchin';
export { isSandboxPayment, normalizeGatewayReturn, paymentRedirectOf, redirectToPayment, APP_ID };
