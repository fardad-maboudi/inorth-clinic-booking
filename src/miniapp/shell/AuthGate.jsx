import { createContext, useContext, useEffect, useState } from "react";
import { authenticateMiniApp, clearMiniAppSession, maintainMiniAppSession } from "../runtime/session.js";
import { applyTelegramTheme, installStudioSimulation, subscribeTelegramRuntime } from "../runtime/telegram.js";
import { reportMiniAppOpen } from "../runtime/telemetry.js";

const MiniAppSessionContext = createContext(null);
export function useMiniAppSession() { return useContext(MiniAppSessionContext); }

export default function AuthGate({ children }) {
  const [state, setState] = useState({ status: "loading", session: null });
  useEffect(() => {
    let alive = true;
    let unsubscribe = () => {};
    let stopSession = () => {};
    async function boot() {
      try {
        const { app, previewUser } = await installStudioSimulation();
        if (!app?.initData) { if (alive) setState({ status: "guest", session: null }); return; }
        applyTelegramTheme(app);
        const session = await authenticateMiniApp(app, previewUser);
        if (!alive || !session) return;
        unsubscribe();
        stopSession();
        stopSession = maintainMiniAppSession(app, (next) => { if (alive) setState({ status: "ready", session: next }); }, (error) => { if (alive) setState({ status: "error", session: null, error }); });
        unsubscribe = subscribeTelegramRuntime(app, (active) => document.documentElement.toggleAttribute("data-miniapp-inactive", !active));
        app.expand?.();
        app.ready?.();
        reportMiniAppOpen({ ...session, platform: app.platform, version: app.version });
        setState({ status: "ready", session });
      } catch (error) {
        clearMiniAppSession();
        if (alive) setState({ status: "error", session: null, error });
      }
    }
    boot();
    window.addEventListener("joorchin:preview-auth-ready", boot);
    return () => { alive = false; unsubscribe(); stopSession(); window.removeEventListener("joorchin:preview-auth-ready", boot); };
  }, []);

  if (state.status === "loading") return <div role="status" className="grid min-h-[100dvh] place-items-center"><span>در حال اتصال…</span></div>;
  if (state.status === "guest") return <div role="alert" className="grid min-h-[100dvh] place-items-center px-6 text-center"><p>برای ادامه، این مینی‌اپ را داخل تلگرام باز کنید.</p></div>;
  if (state.status === "error") return <div role="alert" className="grid min-h-[100dvh] place-items-center px-6 text-center"><p>اتصال امن تلگرام انجام نشد. مینی‌اپ را دوباره باز کنید.</p></div>;
  return <MiniAppSessionContext.Provider value={state.session}>{children}</MiniAppSessionContext.Provider>;
}
