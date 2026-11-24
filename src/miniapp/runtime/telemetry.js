export function reportMiniAppOpen({ simulated, actor, platform, version }) {
  window.__joorchinTelemetry?.report?.({
    type: "miniapp_open",
    message: simulated ? "Studio simulation opened" : "Telegram Mini App opened",
    meta: { surface: "miniapp", simulated: Boolean(simulated), actor: actor ?? "user", platform: platform ?? "unknown", version: version ?? "unknown" },
  });
}
