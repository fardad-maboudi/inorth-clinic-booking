/**
 * Plugin-owned cart behaviour, shipped in the base image so App.jsx can
 * statically import it. Activation is the plugins.js manifest, not the
 * module graph.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCart,
  addToCart as apiAdd,
  updateCartItem as apiUpdate,
  removeFromCart as apiRemove,
  clearCart as apiClear,
  applyCoupon as apiApplyCoupon,
  removeCoupon as apiRemoveCoupon,
  setShipping as apiSetShipping,
} from "@/api/plugins/ecommerce";
import { DEFAULT_CURRENCY } from "@/lib/money";
import {
  CartContext,
  cartItemCount,
  normalizeCartView,
} from "@/lib/cart-context";

const EMPTY = {
  items: [],
  subtotal: 0,
  discount: 0,
  tax: 0,
  shippingCost: 0,
  total: 0,
  currency: DEFAULT_CURRENCY,
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const queue = useRef(Promise.resolve());

  const run = useCallback((op) => {
    setMutating(true);
    let task;
    task = queue.current
      .catch(() => undefined)
      .then(() => {
        setError("");
        return op();
      })
      .then((next) => {
        const normalized = normalizeCartView(next || EMPTY, DEFAULT_CURRENCY);
        setCart(normalized);
        return normalized;
      })
      .catch((err) => {
        setError(err?.message || "Cart error");
        throw err;
      })
      .finally(() => {
        if (queue.current === task) setMutating(false);
      });
    queue.current = task;
    return task;
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const next = await getCart();
        if (active) {
          setCart(normalizeCartView(next || EMPTY, DEFAULT_CURRENCY));
        }
      } catch (err) {
        if (active) {
          setCart(EMPTY);
          setError(err?.message || "Cart error");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const add = useCallback(
    (productId, qty = 1, variantId) => run(() => apiAdd(productId, qty, variantId)),
    [run],
  );
  const update = useCallback(
    (productId, qty) => run(() => apiUpdate(productId, qty)),
    [run],
  );
  const remove = useCallback(
    (productId) => run(() => apiRemove(productId)),
    [run],
  );
  const clear = useCallback(() => run(() => apiClear()), [run]);
  const applyCoupon = useCallback(
    (code) => run(() => apiApplyCoupon(code)),
    [run],
  );
  // Visitor UI exposes this only while the provider's couponCode is non-empty.
  const removeCoupon = useCallback(() => run(() => apiRemoveCoupon()), [run]);
  // Raw apiSetShipping is provider infrastructure. Checkout uses
  // useCart().setShipping so this response updates totals/badge immediately.
  const setShipping = useCallback(
    (methodId, address, options) =>
      run(() => apiSetShipping(methodId, address, options)),
    [run],
  );

  const items = cart.items || [];
  const count = cartItemCount(cart);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal: cart.subtotal || 0,
        discount: cart.discount || 0,
        tax: cart.tax || 0,
        shippingCost: cart.shippingCost || 0,
        total: cart.total || 0,
        currency: cart.currency || DEFAULT_CURRENCY,
        couponCode: cart.couponCode || "",
        shipping: cart.shipping || null,
        count,
        loading,
        mutating,
        error,
        unavailable: false,
        add,
        update,
        remove,
        clear,
        addItem: add,
        updateItem: update,
        removeItem: remove,
        applyCoupon,
        removeCoupon,
        setShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;
