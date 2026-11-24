import { getPreviewToken } from "@/api/auth.js";

export function telegramWebApp() {
  return typeof window === "undefined" ? null : window.Telegram?.WebApp ?? null;
}

function setCss(name, value) {
  if (value != null && value !== "") document.documentElement.style.setProperty(name, String(value));
}

function resolvedColor(variable, fallback) {
  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  probe.hidden = true;
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color || fallback;
}

export function applyTelegramTheme(app = telegramWebApp()) {
  if (!app) return;
  for (const [key, value] of Object.entries(app.themeParams ?? {})) {
    setCss(`--tg-theme-${key.replaceAll("_", "-")}`, value);
  }
  setCss("--tg-viewport-height", `${app.viewportHeight || window.innerHeight}px`);
  setCss("--tg-viewport-stable-height", `${app.viewportStableHeight || app.viewportHeight || window.innerHeight}px`);
  const background = resolvedColor("--background", app.themeParams?.bg_color);
  const card = resolvedColor("--card", app.themeParams?.secondary_bg_color ?? background);
  app.setHeaderColor?.(background);
  app.setBackgroundColor?.(background);
  if (!app.isVersionAtLeast || app.isVersionAtLeast("7.10")) {
    app.setBottomBarColor?.(card);
  }
}

export function subscribeTelegramRuntime(app, onActivity) {
  if (!app?.onEvent) return () => {};
  const handlers = {
    themeChanged: () => applyTelegramTheme(app),
    viewportChanged: () => applyTelegramTheme(app),
    safeAreaChanged: () => applyTelegramTheme(app),
    contentSafeAreaChanged: () => applyTelegramTheme(app),
    activated: () => onActivity?.(true),
    deactivated: () => onActivity?.(false),
  };
  for (const [event, handler] of Object.entries(handlers)) app.onEvent(event, handler);
  return () => {
    for (const [event, handler] of Object.entries(handlers)) app.offEvent?.(event, handler);
  };
}

function previewTokenClaims(token) {
  try {
    return JSON.parse(atob(token.split(".")[1].replaceAll("-", "+").replaceAll("_", "/")));
  } catch {
    return null;
  }
}

async function validatedPreviewTicket() {
  const token = getPreviewToken();
  const claims = previewTokenClaims(token ?? "");
  if (!token || claims?.tokenKind !== "preview" || claims?.appId !== import.meta.env.VITE_APP_ID) return null;
  const response = await fetch("/api/v1/auth/me", { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) return null;
  const user = await response.json();
  return user.tokenKind === "preview" && String(user.appId) === String(import.meta.env.VITE_APP_ID) ? user : null;
}

export async function installStudioSimulation() {
  if (telegramWebApp()?.initData && !telegramWebApp().__joorchinSimulated) return { app: telegramWebApp(), previewUser: null };
  const previewUser = await validatedPreviewTicket();
  if (!previewUser) return { app: telegramWebApp(), previewUser: null };
  const listeners = new Map();
  const button = { show() {}, hide() {}, setText() {}, enable() {}, disable() {}, showProgress() {}, hideProgress() {}, onClick(fn) { this.handler = fn; }, offClick(fn) { if (this.handler === fn) this.handler = null; } };
  const mock = {
    __joorchinSimulated: true,
    initData: "studio-preview",
    initDataUnsafe: { user: { id: previewUser.userId, first_name: previewUser.fullName || "Studio" }, start_param: null },
    colorScheme: "light",
    themeParams: { bg_color: "#ffffff", text_color: "#111827", secondary_bg_color: "#f3f4f6" },
    viewportHeight: window.innerHeight,
    viewportStableHeight: window.innerHeight,
    MainButton: { ...button }, SecondaryButton: { ...button }, BackButton: { ...button },
    HapticFeedback: { impactOccurred() {}, notificationOccurred() {}, selectionChanged() {} },
    CloudStorage: { getItem(_key, cb) { cb?.(null, null); }, setItem(_key, _value, cb) { cb?.(null, true); }, removeItem(_key, cb) { cb?.(null, true); } },
    ready() {}, expand() {}, setHeaderColor() {}, setBackgroundColor() {}, setBottomBarColor() {},
    isVersionAtLeast() { return true; },
    onEvent(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    offEvent(name, fn) { listeners.get(name)?.delete(fn); },
    openLink(url) { window.open(url, "_blank", "noopener,noreferrer"); },
    openTelegramLink(url) { window.open(url, "_blank", "noopener,noreferrer"); },
  };
  window.Telegram = { ...(window.Telegram ?? {}), WebApp: mock };
  return { app: mock, previewUser };
}
