import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { pwaConfig } from "../config/pwa";
import { isTransactionalOrAuthPath } from "../lib/page-routes.js";
import { useSiteFooterTarget } from "../components/JoorchinBuiltBy.jsx";

export function suppressPwaInstallOnPath(pathname) {
  return isTransactionalOrAuthPath(pathname);
}

export function isPwaPreview(win, development) {
  return development || win.self !== win.top ||
    /^\/app\/[a-f\d]{24}(?:\/|$)/i.test(win.location.pathname);
}

export function isInstalledPwa(win) {
  return win.matchMedia("(display-mode: standalone)").matches ||
    win.navigator.standalone === true;
}

export function needsIosInstallGuide(nav) {
  return /iPad|iPhone|iPod/.test(nav.userAgent ?? "") ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
}

const STYLE = `
.jrch-pwa-root {
  position: static;
  display: flex;
  justify-content: center;
  width: 100%;
  padding-block: 8px;
  color: inherit;
  font-family: inherit;
}
.jrch-pwa-root[data-placement="utility-row"] {
  width: auto;
  flex: 0 0 auto;
  padding: 0;
  align-self: center;
}
.jrch-pwa-control {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  padding: 2px 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  color: inherit;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.5;
  text-decoration: none;
  cursor: pointer;
}
.jrch-pwa-control:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.jrch-pwa-control:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
.jrch-pwa-summary {
  display: list-item;
  list-style-position: inside;
}
.jrch-pwa-guide {
  max-inline-size: min(20rem, calc(100vw - 2rem));
  margin-block: 8px 0;
  font-size: 0.875rem;
  line-height: 1.7;
}
`;

/** Optional footer control. Chromium opens native UI; iOS gets inline guidance. */
export default function PwaInstallBanner() {
  const location = useLocation();
  const preview = isPwaPreview(window, import.meta.env.DEV);
  const enabled = Boolean(pwaConfig?.enabled) && !preview;
  const [installed, setInstalled] = useState(() => isInstalledPwa(window));
  const [deferred, setDeferred] = useState(null);
  const iosGuide = needsIosInstallGuide(window.navigator);
  const routeSuppressed = suppressPwaInstallOnPath(location.pathname);
  const { siteContentReady, footerTarget, footerPlacement } = useSiteFooterTarget(enabled);

  useEffect(() => {
    window.dispatchEvent(new Event("joorchin:route-change"));
  }, [location.pathname]);

  useEffect(() => {
    if (!enabled || installed) return;
    const onPrompt = (event) => {
      if (routeSuppressed || !siteContentReady || !footerTarget) return;
      event.preventDefault();
      setDeferred(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [enabled, installed, routeSuppressed, siteContentReady, footerTarget]);

  const install = async () => {
    if (!deferred) return;
    const prompt = deferred;
    // A BeforeInstallPromptEvent is single-use, including after cancellation.
    setDeferred(null);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
    } catch (error) {
      console.warn("[PWA] Native install prompt failed", error);
    }
  };

  if (!enabled || installed || routeSuppressed || !siteContentReady ||
      !footerTarget || (!deferred && !iosGuide)) return null;

  return createPortal(
    <div
      lang="fa"
      dir="rtl"
      data-joorchin-pwa-install-banner="1"
      data-placement={footerPlacement}
      className="jrch-pwa-root"
    >
      <style>{STYLE}</style>
      {deferred ? (
        <button type="button" onClick={install} className="jrch-pwa-control">
          نصب برنامه
        </button>
      ) : (
        <details>
          <summary className="jrch-pwa-control jrch-pwa-summary">
            افزودن به صفحهٔ اصلی
          </summary>
          <p className="jrch-pwa-guide">
            از منوی اشتراک‌گذاری (Share) مرورگر، «افزودن به صفحهٔ اصلی»
            (Add to Home Screen) را انتخاب کنید و سپس «افزودن» را بزنید.
          </p>
        </details>
      )}
    </div>,
    footerTarget,
  );
}
