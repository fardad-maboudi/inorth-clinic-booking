import { useMiniAppSession } from "./AuthGate.jsx";

/** UI-only actor/capabilities; every privileged API enforces its own authorization. */
export function useMiniAppActor() { return useMiniAppSession(); }

export default function MiniAppShell({ children }) {
  const session = useMiniAppSession();
  if (!session) return null;
  return (
    <div className="min-h-[var(--tg-viewport-stable-height,100dvh)] bg-background text-foreground">
      {session.simulated ? <div role="status" className="sticky top-0 z-50 bg-amber-100 px-3 py-1 text-center text-xs font-semibold text-amber-950">Simulated</div> : null}
      {children}
    </div>
  );
}
