/**
 * Platform-owned cart context identity + fallback. Plugin-owned behaviour
 * (API, totals, coupons) lives in `src/platform/providers/cart-provider.jsx`.
 *
 * `useCart()` is safe to call only under a provider. When ecommerce is enabled
 * the platform always mounts either the real provider or `NullCartProvider`,
 * so "consumer without provider" is not a reachable state for a shop.
 */
import { createContext, useContext, useEffect, createElement } from "react";
import {
  CartUnavailableError,
  createNullCartValue,
} from "./cart-unavailable.js";

export { CartUnavailableError, createNullCartValue };

export const CartContext = createContext(null);

/**
 * Platform-owned adapter from the ecommerce CartResponse to the stable shopper
 * view shape. Monetary totals remain byte-for-byte server values; this only
 * supplies product-style display aliases used by generated pages.
 */
export function normalizeCartLine(line, currency = "IRR") {
  const source = line && typeof line === "object" ? line : {};
  const images = Array.isArray(source.images)
    ? source.images
    : source.image
      ? [source.image]
      : [];
  return {
    ...source,
    price: source.price ?? source.unitPrice ?? 0,
    images,
    currency: source.currency || currency,
  };
}

export function normalizeCartView(cart, fallbackCurrency = "IRR") {
  const source = cart && typeof cart === "object" ? cart : {};
  const currency = source.currency || fallbackCurrency;
  return {
    ...source,
    currency,
    items: Array.isArray(source.items)
      ? source.items.map((line) => normalizeCartLine(line, currency))
      : [],
  };
}

export function cartItemCount(cart) {
  return (cart?.items || []).reduce(
    (sum, line) => sum + (Number(line?.qty) || 0),
    0,
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return ctx;
}

function beaconCartUnavailable() {
  try {
    window.__joorchinTelemetry?.report({
      type: "cart_unavailable",
      message:
        "CartUnavailableError: ecommerce enabled but CartProvider failed to load",
      meta: { plugin: "ecommerce" },
    });
  } catch {
    /* telemetry must never throw into the app */
  }
}

/** Reads empty; writes throw CartUnavailableError. Beacons a blocking runtime event. */
export function NullCartProvider({ children }) {
  useEffect(() => {
    beaconCartUnavailable();
  }, []);
  return createElement(
    CartContext.Provider,
    { value: createNullCartValue() },
    children,
  );
}

/**
 * Suspense-fallback provider: same empty-cart value as NullCartProvider but
 * WITHOUT the cart_unavailable beacon. The lazy chunk loading briefly (cold
 * start) is normal, not a platform defect — beaconing here made every fresh
 * shop build look broken to the runtime validator and forced a degrade.
 */
export function PendingCartProvider({ children }) {
  return createElement(
    CartContext.Provider,
    { value: createNullCartValue() },
    children,
  );
}
