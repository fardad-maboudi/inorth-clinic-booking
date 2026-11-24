/**
 * True only on a published site. Previews are served under `/app/<id>/`
 * (vite `base`) or from a `preview-<slug>` host and must never carry the eNamad
 * tag or seal: eNamad verifies the live domain, and a preview showing a
 * trust seal would be a false claim.
 */
export function isPublishedSite(
  baseUrl = import.meta.env.BASE_URL,
  hostname = typeof window === "undefined" ? "" : window.location.hostname,
) {
  if (typeof baseUrl === "string" && baseUrl.trim() !== "" && baseUrl.trim() !== "/") return false;
  return !String(hostname).toLowerCase().startsWith("preview-");
}
