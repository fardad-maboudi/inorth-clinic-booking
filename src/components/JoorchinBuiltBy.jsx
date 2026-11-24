import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { version as APP_VERSION } from "../../package.json";
import { normalizeGeneratedAppPathname } from "../lib/page-routes.js";

/**
 * Platform attribution — mounted from main.jsx on every generated site.
 * Do not remove or re-implement in App.jsx / site Footer (would duplicate).
 *
 * Portaled into the generated site's own footer. Conventional footers get the
 * badge in their existing final utility row, alongside copyright/legal links,
 * instead of growing a separate attribution row. If the builder omitted a
 * footer, a semantic host is added at the end of the home page only. Inner
 * pages without a footer do not receive a floating attribution badge.
 *
 * Scoped CSS supplies layout only. Color and typography inherit from the
 * site's footer/global CSS so attribution follows each site's theme.
 */
const JOORCHIN_ORIGIN = "https://joorchin.ai";
const PLATFORM_SELECTOR =
  '[data-joorchin-platform="built-by"], [data-joorchin-attribution-host="1"], [data-joorchin-pwa-install-banner="1"]';
const CONTENT_FOOTER_SELECTOR = 'article, aside, nav, [role="article"]';
const FOOTER_MARKER = '[data-joorchin-site-footer="1"]';
const UTILITY_MARKER = '[data-joorchin-footer-utility="1"]';
const SITE_LOADING_SELECTOR =
  '#root [data-testid*="skeleton" i], #root [role="status"][aria-busy="true"], #root [aria-busy="true"].animate-pulse, #root [data-joorchin-loading="true"]';

export function hasSiteLoadingSkeleton(doc = document) {
  return Boolean(doc.querySelector(SITE_LOADING_SELECTOR));
}

export function isHomeRoute(pathname) {
  return normalizeGeneratedAppPathname(pathname) === "/";
}

export function findSiteFooter(doc = document) {
  const scope = doc.getElementById("root") ?? doc;
  const explicitFooter = scope.querySelector(FOOTER_MARKER);
  if (explicitFooter && !explicitFooter.closest(PLATFORM_SELECTOR)) {
    return explicitFooter;
  }
  const footers = [...scope.querySelectorAll('footer, [role="contentinfo"]')].filter(
    (footer) =>
      !footer.closest(PLATFORM_SELECTOR) &&
      !footer.closest(CONTENT_FOOTER_SELECTOR),
  );
  return footers.at(-1) ?? null;
}

export function findFooterContentTarget(footer) {
  const children = [...footer.children].filter(
    (child) => !child.matches(PLATFORM_SELECTOR),
  );
  return children.length === 1 && UTILITY_ROW_TAGS.has(children[0].tagName)
    ? children[0]
    : footer;
}

const UTILITY_ROW_TAGS = new Set(["DIV", "SECTION"]);

/**
 * Prefer a footer's existing trailing utility row. Generated footers normally
 * use a content wrapper whose final block holds copyright and legal links.
 * Mounting there avoids manufacturing a blank full-width row just for platform
 * attribution. Conservative tag/child checks keep article-like footer copy
 * and single-column footers on the safe standalone-row fallback.
 */
export function findFooterAttributionTarget(footer) {
  const explicitUtility = footer.querySelector(UTILITY_MARKER);
  if (explicitUtility && !explicitUtility.closest(PLATFORM_SELECTOR)) {
    return { target: explicitUtility, placement: "utility-row" };
  }
  const contentTarget = findFooterContentTarget(footer);
  const children = [...contentTarget.children].filter(
    (child) => !child.matches(PLATFORM_SELECTOR),
  );
  const lastChild = children.at(-1);
  const hasDistinctUtilityRow =
    children.length >= 2 &&
    lastChild &&
    UTILITY_ROW_TAGS.has(lastChild.tagName) &&
    lastChild.children.length >= 1 &&
    (/©|copyright|حقوق|حق نشر/i.test(lastChild.textContent ?? "") ||
      [...lastChild.querySelectorAll("a[href]")].some((link) =>
        /(?:^|\/)(?:privacy|terms|legal)(?:[/?#]|$)/i.test(link.getAttribute("href") ?? ""),
      ));

  return hasDistinctUtilityRow
    ? { target: lastChild, placement: "utility-row" }
    : { target: contentTarget, placement: "standalone-row" };
}

/** Landing URL with a back-reference to the site that sent the click. */
function joorchinHref() {
  const url = new URL(JOORCHIN_ORIGIN);
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host) url.searchParams.set("ref", host);
    const appId = import.meta.env.VITE_APP_ID;
    if (appId) url.searchParams.set("app", String(appId));
  }
  url.searchParams.set("utm_source", "built_by");
  url.searchParams.set("utm_medium", "badge");
  url.searchParams.set("utm_campaign", "built_with_joorchin");
  return url.toString();
}

/* Jigsaw-piece brand mark: knob on top, socket on the right. */
function PuzzleMark() {
  return (
    <svg
      className="jrchbb-mark"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 6.5h3.1a2.6 2.6 0 1 1 3.8 0H17A2.5 2.5 0 0 1 19.5 9v2.4a2.4 2.4 0 1 0 0 4.1V18a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 18V9A2.5 2.5 0 0 1 7 6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

const STYLE = `
.jrchbb-root {
  position: static !important;
  display: flex;
  justify-content: center;
  width: 100%;
  margin-inline: auto;
  padding: 12px 0 max(8px, env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  direction: ltr;
  color: inherit;
  font-family: inherit;
}
.jrchbb-root[data-placement="utility-row"] {
  flex: 0 0 auto;
  width: auto;
  padding: 0;
  align-self: center;
}
[data-joorchin-attribution-host="1"] {
  display: block;
  width: 100%;
  margin-block-start: auto;
  background: inherit;
}
.jrchbb-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  padding: 2px 0;
  background: transparent;
  border: 0;
  box-shadow: none;
  color: inherit;
  font-family: inherit;
  font-weight: 400;
  text-decoration: none;
  font-size: 0.75rem;
  line-height: 1.5;
  direction: rtl;
}
.jrchbb-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.jrchbb-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
.jrchbb-mark {
  color: currentColor;
  flex: none;
}
`;

/** Shared footer discovery for platform attribution and optional install UI. */
export function useSiteFooterTarget(enabled = true) {
  const [siteContentReady, setSiteContentReady] = useState(false);
  const [footerTarget, setFooterTarget] = useState(null);
  const [footerPlacement, setFooterPlacement] = useState("standalone-row");
  const [showHomeFallback, setShowHomeFallback] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const syncTarget = () => {
      const contentReady = !hasSiteLoadingSkeleton();
      setSiteContentReady((current) =>
        current === contentReady ? current : contentReady,
      );

      const siteFooter = findSiteFooter();
      if (siteFooter) {
        setShowHomeFallback(false);
        const { target, placement } = findFooterAttributionTarget(siteFooter);
        setFooterTarget((current) => (current === target ? current : target));
        setFooterPlacement((current) =>
          current === placement ? current : placement,
        );
        return;
      }

      setFooterTarget((current) => (current === null ? current : null));
      setFooterPlacement((current) =>
        current === "home-fallback" ? current : "home-fallback",
      );
      const shouldShowHomeFallback = isHomeRoute(window.location.pathname);
      setShowHomeFallback((current) =>
        current === shouldShowHomeFallback ? current : shouldShowHomeFallback,
      );
    };

    syncTarget();
    let pendingFrame = null;
    const scheduleSync = () => {
      if (pendingFrame !== null) return;
      pendingFrame = requestAnimationFrame(() => {
        pendingFrame = null;
        syncTarget();
      });
    };
    const observer = new MutationObserver((records) => {
      const siteChanged = records.some((record) => {
        if (record.target.parentElement?.closest(PLATFORM_SELECTOR) ||
            record.target.closest?.(PLATFORM_SELECTOR)) return false;
        const changedNodes = [...record.addedNodes, ...record.removedNodes];
        return !changedNodes.length || changedNodes.some(
          (node) => !node.matches?.(PLATFORM_SELECTOR),
        );
      });
      if (siteChanged) scheduleSync();
    });
    observer.observe(document.getElementById("root") ?? document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "aria-busy",
        "class",
        "data-testid",
        "data-joorchin-loading",
        "data-joorchin-site-footer",
        "data-joorchin-footer-utility",
        "role",
        "hidden",
      ],
    });
    window.addEventListener("joorchin:route-change", scheduleSync);
    window.addEventListener("popstate", scheduleSync);
    return () => {
      observer.disconnect();
      if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
      window.removeEventListener("joorchin:route-change", scheduleSync);
      window.removeEventListener("popstate", scheduleSync);
    };
  }, [enabled]);

  return { siteContentReady, footerTarget, footerPlacement, showHomeFallback };
}

export default function JoorchinBuiltBy() {
  const href = joorchinHref();
  const [hiddenWhileBuilding, setHiddenWhileBuilding] = useState(false);
  const { siteContentReady, footerTarget, footerPlacement, showHomeFallback } = useSiteFooterTarget();

  useEffect(() => {
    const onMessage = (event) => {
      if (event.data?.type === "joorchin:building") {
        setHiddenWhileBuilding(event.data.active === true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (
    hiddenWhileBuilding ||
    !siteContentReady ||
    (!footerTarget && !showHomeFallback)
  ) {
    return null;
  }

  const attribution = (
    <div
      lang="fa"
      dir="ltr"
      className="joorchin-built-by jrchbb-root"
      data-joorchin-platform="built-by"
      data-app-version={APP_VERSION}
      data-placement={footerPlacement}
    >
      <style>{STYLE}</style>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="jrchbb-link"
      >
        <PuzzleMark />
        <span className="jrchbb-label">ساخته‌شده با جورچین</span>
      </a>
    </div>
  );

  if (footerTarget) return createPortal(attribution, footerTarget);

  return (
    <footer
      data-joorchin-attribution-host="1"
      aria-label="اطلاعات سازنده سایت"
    >
      {attribution}
    </footer>
  );
}
