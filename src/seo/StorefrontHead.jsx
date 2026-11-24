import { useEffect, useState } from "react";
import { getPublicSettings, getPublicSiteSettings } from "../api/joorchin.js";
import { isPublishedSite } from "./published.js";

/** Accept a bare content value or a pasted `<meta name="enamad" content="…">`. */
function enamadMetaContentValue(raw) {
  if (raw == null) return "";
  const s = String(raw).trim();
  if (!s) return "";
  const fromTag = s.match(/content\s*=\s*["']([^"']+)["']/i);
  return (fromTag ? fromTag[1] : s).trim();
}

/**
 * Injects owner-configured tracking + verification into the live storefront at
 * runtime — no rebuild needed. Tracking, verification, and custom code are
 * app-level settings; `trust-seals` setup is read separately for the eNamad meta.
 * The router injects that tag into the served HTML of published sites (eNamad's
 * crawler does not run JS); this is the runtime fallback, also published-only.
 * React 19 hoists <script>/<meta> into <head> natively.
 *
 * Custom HTML is owner-supplied for their OWN store (self-XSS is acceptable);
 * it is fetched per-app and only ever rendered inside this storefront, never in
 * the Studio admin context.
 */
export function StorefrontHead({ pluginId = "trust-seals" }) {
  const [cfg, setCfg] = useState(null);
  const [storeCfg, setStoreCfg] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([getPublicSiteSettings(), getPublicSettings(pluginId)]).then(([siteSettings, pluginSettings]) => {
      if (!alive) return;
      setCfg(siteSettings || {});
      setStoreCfg(pluginSettings || {});
    });
    return () => {
      alive = false;
    };
  }, [pluginId]);

  // eNamad verification looks in <head>. Append here so a late settings
  // fetch still lands in document.head (not only as a hoisted React child).
  useEffect(() => {
    const content = enamadMetaContentValue(storeCfg?.enamadMeta);
    if (!content || typeof document === "undefined" || !isPublishedSite()) return;
    if (document.head.querySelector('meta[name="enamad"]')) return;
    const el = document.createElement("meta");
    el.setAttribute("name", "enamad");
    el.setAttribute("content", content);
    document.head.appendChild(el);
    return () => el.remove();
  }, [storeCfg?.enamadMeta]);

  // Custom raw <head> HTML can't be expressed as JSX — append imperatively.
  useEffect(() => {
    const html = cfg?.customHeadHtml;
    if (!html || typeof document === "undefined") return;
    const frag = document.createElement("div");
    frag.innerHTML = html;
    const nodes = Array.from(frag.childNodes);
    // <script> created via innerHTML won't execute — recreate so it runs.
    const inserted = nodes.map((node) => {
      if (node.tagName === "SCRIPT") {
        const s = document.createElement("script");
        for (const attr of node.attributes) s.setAttribute(attr.name, attr.value);
        s.textContent = node.textContent;
        document.head.appendChild(s);
        return s;
      }
      document.head.appendChild(node);
      return node;
    });
    return () => inserted.forEach((n) => n.remove());
  }, [cfg?.customHeadHtml]);

  if (!cfg) return null;
  const { gtmId, googleAnalyticsId, clarityId, googleSiteVerification } = cfg;

  return (
    <>
      {googleSiteVerification ? <meta name="google-site-verification" content={googleSiteVerification} /> : null}
      {gtmId ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`,
          }}
        />
      ) : null}
      {googleAnalyticsId ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(googleAnalyticsId)});`,
            }}
          />
        </>
      ) : null}
      {clarityId ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarityId)});`,
          }}
        />
      ) : null}
    </>
  );
}

export default StorefrontHead;
