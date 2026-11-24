import { lazy, Suspense, useEffect, useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { miniAppPageRoutePath } from "@/lib/page-routes.js";
import AuthGate from "./shell/AuthGate.jsx";
import MiniAppShell from "./shell/MiniAppShell.jsx";
import { useBackButton } from "./runtime/hooks.js";
import { startParamRoute } from "./runtime/start-param.js";
import { telegramWebApp } from "./runtime/telegram.js";

const modules = import.meta.glob("./pages/**/*.jsx");
function EmptyMiniApp() { return <main className="grid min-h-[80dvh] place-items-center px-6 text-center"><p>این مینی‌اپ هنوز صفحه‌ای ندارد.</p></main>; }

function RuntimeRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  useBackButton(() => navigate(-1), location.pathname !== "/");
  useEffect(() => {
    const target = startParamRoute(telegramWebApp()?.initDataUnsafe?.start_param);
    if (target && location.pathname === "/") navigate(target, { replace: true });
  }, [location.pathname, navigate]);
  const routes = useMemo(() => Object.entries(modules).map(([file, importer]) => ({ path: miniAppPageRoutePath(file)?.replace(/^\/miniapp/, "") || "/", Component: lazy(importer) })), []);
  return <Suspense fallback={<div role="status" className="grid min-h-[70dvh] place-items-center">در حال بارگذاری…</div>}><Routes>{routes.map(({ path, Component }) => <Route key={path} path={path} Component={Component} />)}<Route path="/" element={<EmptyMiniApp />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></Suspense>;
}

const base = `${import.meta.env.BASE_URL || "/"}miniapp`.replace(/\/$/, "");
export default function MiniApp() {
  return <AuthGate><MiniAppShell><BrowserRouter basename={base}><RuntimeRoutes /></BrowserRouter></MiniAppShell></AuthGate>;
}
