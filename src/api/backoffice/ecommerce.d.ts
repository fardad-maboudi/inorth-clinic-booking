/** Every order in the shop, newest first. Filters: status, fulfillmentStatus, q, limit, offset. */
export function listShopOrders(query?: {}): Promise<import("@/api/joorchin.js").RowList<any>>;
export function getShopOrder(orderId: any): Promise<unknown>;
/** Hand a paid order to fulfilment. `force` ships an unpaid order (COD-style). Requires `order:fulfil`. */
export function fulfillOrder(orderId: any, { force }?: {
    force?: unknown;
}): Promise<unknown>;
/** Set the fulfilment status by hand (e.g. `ready_for_pickup`, `delivered`). Requires `order:fulfil`. */
export function setFulfillmentStatus(orderId: any, status: any): Promise<unknown>;
/** Cancel a pending, unfulfilled order. */
export function cancelShopOrder(orderId: any, { reason }?: {
    reason?: unknown;
}): Promise<unknown>;
/**
 * Record a refund the owner already made at the gateway. `refundRef` is the
 * gateway's reference (proof the money moved). Requires `order:refund`.
 */
export function refundOrder(orderId: any, { refundRef, reason, amount }: {
    refundRef: any;
    reason: any;
    amount: any;
}): Promise<unknown>;
/** Approve a card-to-card / manual payment receipt. Requires `order:confirm`. */
export function approveManualPayment(orderId: any): Promise<unknown>;
/** Sales totals for the dashboard. Requires `analytics:read`. */
export function getShopStats(): Promise<unknown>;
/** Products including inactive/draft rows. */
export function listCatalogProducts(query?: {}): Promise<import("@/api/joorchin.js").RowList<any>>;
export function getCatalogProduct(productId: any): Promise<unknown>;
/** Create (no id) or update a product. Requires `product:write`. */
export function saveProduct(product: any): Promise<unknown>;
/** Requires `product:delete`. */
export function deleteProduct(productId: any): Promise<unknown>;
/** Requires `customer:read`. */
export function listCustomers(query?: {}): Promise<import("@/api/joorchin.js").RowList<any>>;
/** The store's settings rows (currency, tax…). Requires `store:settings:read`. */
export function listStoreSettings(): Promise<import("@/api/joorchin.js").RowList<any>>;
