import { useEffect, useState } from "react";
import { getPublicSettings } from "../api/joorchin.js";
import { isPublishedSite } from "./published.js";

const SEAL_LABEL = "نماد اعتماد الکترونیکی";

/** Only the https enamad.ir hosts the owner is told to copy from the eNamad panel. */
function enamadHttpsUrl(value) {
  try {
    const url = new URL(String(value || ""));
    const host = url.hostname.toLowerCase();
    const ok = url.protocol === "https:" && (host === "enamad.ir" || host === "trustseal.enamad.ir");
    return ok ? url.toString() : "";
  } catch {
    return "";
  }
}

/**
 * Iranian "نماد اعتماد الکترونیکی" trust seal.
 * Links to the verification URL the owner copied from the eNamad panel after
 * the meta-tag check passed (`trust-seals` setup, `enamadVerificationUrl`),
 * with the badge image when one was given and a text link otherwise — no
 * Joorchin-provided stand-in asset. Renders nothing in previews, nothing until
 * that URL is set, and
 * steps aside when the site's own footer already renders `TrustSeals`
 * (`data-enamad-seal`).
 *
 * Out of flow on purpose: an in-flow wrapper after the site Layout painted a
 * white band under every generated footer, even when this returned null.
 */
export function EnamadSeal({ pluginId = "trust-seals" }) {
  const [cfg, setCfg] = useState(null);
  const [inFooter, setInFooter] = useState(false);

  useEffect(() => {
    let alive = true;
    getPublicSettings(pluginId).then((c) => alive && setCfg(c || {}));
    return () => {
      alive = false;
    };
  }, [pluginId]);

  useEffect(() => {
    if (!cfg || typeof document === "undefined") return;
    const frame = requestAnimationFrame(() =>
      setInFooter(Boolean(document.querySelector("[data-enamad-seal]"))),
    );
    return () => cancelAnimationFrame(frame);
  }, [cfg]);

  const href = isPublishedSite() ? enamadHttpsUrl(cfg?.enamadVerificationUrl) : "";
  if (!href || inFooter) return null;
  const image = enamadHttpsUrl(cfg?.enamadBadgeUrl);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="origin"
      aria-label={SEAL_LABEL}
      style={{
        position: "fixed",
        right: 16,
        bottom: "max(16px, env(safe-area-inset-bottom, 0px))",
        zIndex: 30,
        display: "inline-block",
      }}
    >
      {image ? (
        <img src={image} alt={SEAL_LABEL} style={{ maxWidth: 120, height: "auto" }} />
      ) : (
        <span
          style={{
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: 8,
            background: "#fff",
            color: "#111",
            font: "12px/1.4 system-ui, sans-serif",
            boxShadow: "0 1px 6px rgba(0,0,0,.2)",
          }}
        >
          {SEAL_LABEL}
        </span>
      )}
    </a>
  );
}

export default EnamadSeal;
