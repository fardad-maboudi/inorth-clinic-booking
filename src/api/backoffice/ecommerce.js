/**
 * Site back-office SDK — shop management (ecommerce plugin).
 *
 * For the site's owner, admins and staff: every order in the shop, fulfilment,
 * refunds, catalog edits, customers and store settings. Each call needs a staff
 * capability and 403s for shoppers. Storefront and "my account" pages use the
 * visitor client `@/api/plugins/ecommerce` (`listOrders` there is the
 * signed-in shopper's OWN orders).
 *
 * Money and status only move through the service routes below — never through
 * a generic `data/order` write. Platform-owned: re-synced from the template.
 */
import { backofficeList, backofficeRequest } from "./client.js";

const SHOP = "/plugins/ecommerce";
const id = (value) => encodeURIComponent(String(value?._id ?? value?.id ?? value));

// --- Orders -------------------------------------------------------------------

/** Every order in the shop, newest first. Filters: status, fulfillmentStatus, q, limit, offset. */
export function listShopOrders(query = {}) {
  return backofficeList(`${SHOP}/orders`, { limit: 50, ...query });
}

export function getShopOrder(orderId) {
  return backofficeRequest(`${SHOP}/orders/${id(orderId)}`);
}

/** Hand a paid order to fulfilment. `force` ships an unpaid order (COD-style). Requires `order:fulfil`. */
export function fulfillOrder(orderId, /** @type {{force?: unknown}} */ { force } = {}) {
  return backofficeRequest(`${SHOP}/orders/${id(orderId)}/fulfill`, {
    method: "POST",
    body: force ? { force: true } : {},
  });
}

/** Set the fulfilment status by hand (e.g. `ready_for_pickup`, `delivered`). Requires `order:fulfil`. */
export function setFulfillmentStatus(orderId, status) {
  return backofficeRequest(`${SHOP}/orders/${id(orderId)}/fulfillment-status`, {
    method: "POST",
    body: { status },
  });
}

/** Cancel a pending, unfulfilled order. */
export function cancelShopOrder(orderId, /** @type {{reason?: unknown}} */ { reason } = {}) {
  return backofficeRequest(`${SHOP}/orders/${id(orderId)}/cancel`, {
    method: "POST",
    body: reason ? { reason } : {},
  });
}

/**
 * Record a refund the owner already made at the gateway. `refundRef` is the
 * gateway's reference (proof the money moved). Requires `order:refund`.
 */
export function refundOrder(orderId, { refundRef, reason, amount }) {
  return backofficeRequest(`${SHOP}/orders/${id(orderId)}/refund`, {
    method: "POST",
    body: amount === undefined ? { refundRef, reason } : { refundRef, reason, amount },
  });
}

/** Approve a card-to-card / manual payment receipt. Requires `order:confirm`. */
export function approveManualPayment(orderId) {
  return backofficeRequest(`${SHOP}/orders/${id(orderId)}/manual-payment/approve`, {
    method: "POST",
    body: {},
  });
}

/** Sales totals for the dashboard. Requires `analytics:read`. */
export function getShopStats() {
  return backofficeRequest(`${SHOP}/stats`);
}

// --- Catalog ------------------------------------------------------------------

/** Products including inactive/draft rows. */
export function listCatalogProducts(query = {}) {
  return backofficeList(`${SHOP}/data/product`, { limit: 50, ...query });
}

export function getCatalogProduct(productId) {
  return backofficeRequest(`${SHOP}/data/product/${id(productId)}`);
}

/** Create (no id) or update a product. Requires `product:write`. */
export function saveProduct(product) {
  const productId = product?._id ?? product?.id;
  const fields = { ...product };
  delete fields._id;
  delete fields.id;
  return backofficeRequest(`${SHOP}/data/product${productId ? `/${id(productId)}` : ""}`, {
    method: productId ? "PUT" : "POST",
    body: fields,
  });
}

/** Requires `product:delete`. */
export function deleteProduct(productId) {
  return backofficeRequest(`${SHOP}/data/product/${id(productId)}`, { method: "DELETE" });
}

// --- Customers & settings -------------------------------------------------------

/** Requires `customer:read`. */
export function listCustomers(query = {}) {
  return backofficeList(`${SHOP}/data/customer`, { limit: 50, ...query });
}

/** The store's settings rows (currency, tax…). Requires `store:settings:read`. */
export function listStoreSettings() {
  return backofficeList(`${SHOP}/data/storesetting`, { limit: 10 });
}
