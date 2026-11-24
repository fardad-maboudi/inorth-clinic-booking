import { useCallback, useEffect, useMemo, useState } from "react";
import { telegramWebApp } from "./telegram.js";

export function useTelegram() { return telegramWebApp(); }

function useTelegramButton(name, { text, onClick, disabled = false, loading = false } = {}) {
  const app = useTelegram();
  useEffect(() => {
    const button = app?.[name];
    if (!button || !onClick || !text) { button?.hide?.(); return undefined; }
    button.setText?.(text);
    disabled ? button.disable?.() : button.enable?.();
    loading ? button.showProgress?.() : button.hideProgress?.();
    button.onClick?.(onClick);
    button.show?.();
    return () => {
      button.offClick?.(onClick);
      button.hideProgress?.();
      button.hide?.();
    };
  }, [app, disabled, loading, name, onClick, text]);
}

export function useMainButton(options) { useTelegramButton("MainButton", options); }
export function useSecondaryButton(options) { useTelegramButton("SecondaryButton", options); }
export function useBottomButton(options) {
  const app = useTelegram();
  const target = app?.BottomButton ? "BottomButton" : "MainButton";
  useTelegramButton(target, options);
}

export function useBackButton(onClick, visible = true) {
  const app = useTelegram();
  useEffect(() => {
    const button = app?.BackButton;
    if (!button || !onClick || !visible) { button?.hide?.(); return undefined; }
    button.onClick?.(onClick);
    button.show?.();
    return () => { button.offClick?.(onClick); button.hide?.(); };
  }, [app, onClick, visible]);
}

export function useViewport() {
  const app = useTelegram();
  const read = useCallback(() => ({ height: app?.viewportHeight ?? window.innerHeight, stableHeight: app?.viewportStableHeight ?? window.innerHeight, expanded: Boolean(app?.isExpanded) }), [app]);
  const [viewport, setViewport] = useState(read);
  useEffect(() => {
    const update = () => setViewport(read());
    app?.onEvent?.("viewportChanged", update);
    window.addEventListener("resize", update);
    return () => { app?.offEvent?.("viewportChanged", update); window.removeEventListener("resize", update); };
  }, [app, read]);
  return viewport;
}

export function useSafeArea() {
  const app = useTelegram();
  const read = useCallback(() => ({ safeArea: app?.safeAreaInset ?? {}, contentSafeArea: app?.contentSafeAreaInset ?? {} }), [app]);
  const [insets, setInsets] = useState(read);
  useEffect(() => {
    const update = () => setInsets(read());
    app?.onEvent?.("safeAreaChanged", update); app?.onEvent?.("contentSafeAreaChanged", update);
    return () => { app?.offEvent?.("safeAreaChanged", update); app?.offEvent?.("contentSafeAreaChanged", update); };
  }, [app, read]);
  return insets;
}

export function useHaptics() {
  const app = useTelegram();
  return useMemo(() => ({
    impact: (style = "light") => app?.HapticFeedback?.impactOccurred?.(style),
    notify: (type) => app?.HapticFeedback?.notificationOccurred?.(type),
    select: () => app?.HapticFeedback?.selectionChanged?.(),
  }), [app]);
}

export function useCloudStorage() {
  const app = useTelegram();
  return useMemo(() => ({
    get: (key) => new Promise((resolve, reject) => app?.CloudStorage?.getItem?.(key, (error, value) => error ? reject(error) : resolve(value))),
    set: (key, value) => new Promise((resolve, reject) => app?.CloudStorage?.setItem?.(key, value, (error, ok) => error ? reject(error) : resolve(ok))),
    remove: (key) => new Promise((resolve, reject) => app?.CloudStorage?.removeItem?.(key, (error, ok) => error ? reject(error) : resolve(ok))),
  }), [app]);
}

export function openExternal(url) {
  const app = telegramWebApp();
  if (/^https:\/\/t\.me\//i.test(url)) app?.openTelegramLink?.(url);
  else app?.openLink?.(url, { try_instant_view: false });
}
