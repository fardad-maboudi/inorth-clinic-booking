import { createClient } from "@joorchin/client-sdk";

export const joorchin = createClient({
  serverUrl: import.meta.env.VITE_JOORCHIN_SERVER_URL || "https://api.joorchin.site",
  appId: import.meta.env.VITE_APP_ID || "6ae869523c5af491ed8a859b",
  tokenStorageKey: "joorchin_token_6ae869523c5af491ed8a859b",
});

export default joorchin;
