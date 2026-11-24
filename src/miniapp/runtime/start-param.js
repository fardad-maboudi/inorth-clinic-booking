const ROUTES = {
  product: (id) => `/products/${encodeURIComponent(id)}`,
  order: (token) => token.includes("-") ? `/orders/start/${encodeURIComponent(token)}` : null,
  booking: (token) => token.includes("-") ? `/bookings/start/${encodeURIComponent(token)}` : null,
  ticket: (id) => `/support/${encodeURIComponent(id)}`,
};

/** Navigation hint only. Identity and authorization always come from the server session. */
export function startParamRoute(startParam) {
  if (typeof startParam !== "string" || startParam.length > 512) return null;
  const match = startParam.match(/^([a-z]+)_([A-Za-z0-9-]{1,128})$/);
  return match ? ROUTES[match[1]]?.(match[2]) ?? null : null;
}
