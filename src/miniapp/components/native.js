import { useTelegram } from "@/miniapp/runtime/hooks";

/** True only inside a real Telegram client (not a browser or Studio simulation). */
export function useNative() {
  const app = useTelegram();
  return Boolean(app?.initData) && !app.__joorchinSimulated;
}
