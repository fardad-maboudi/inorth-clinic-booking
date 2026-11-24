import { useCallback, useState } from "react";
import { formatIranianMobile, normalizeIranianMobile } from "@/api/auth";
import { telegramUser, tg } from "@/api/plugins/telegram-miniapp";
import { useMiniAppActor } from "@/miniapp/shell/MiniAppShell";

/**
 * Guest details for a booking, prefilled from the Telegram profile. The name
 * and any shared phone are display data from the client; identity and
 * authorization still come from the server session.
 */
export function useProfile() {
  const session = useMiniAppActor();
  const profile = telegramUser();
  const [name, setName] = useState(
    () => [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || session?.user?.fullName || "",
  );
  const [phone, setPhone] = useState(() => formatIranianMobile(session?.user?.phoneNumber ?? ""));
  const [sharing, setSharing] = useState(false);
  const canShare = typeof tg()?.requestContact === "function";

  /** Ask Telegram to share the user's own phone number; falls back to typing. */
  const sharePhone = useCallback(() => {
    const app = tg();
    if (!app?.requestContact) return;
    setSharing(true);
    const onContact = (event) => {
      app.offEvent?.("contactRequested", onContact);
      setSharing(false);
      const shared = event?.responseUnsafe?.contact?.phone_number;
      if (event?.status === "sent" && shared) setPhone(formatIranianMobile(`+${String(shared).replace(/^\+/, "")}`));
    };
    app.onEvent?.("contactRequested", onContact);
    app.requestContact((sent) => {
      if (!sent) {
        app.offEvent?.("contactRequested", onContact);
        setSharing(false);
      }
    });
  }, []);

  return {
    name, setName, phone, setPhone, sharePhone, sharing, canShare,
    canonicalPhone: normalizeIranianMobile(phone),
  };
}
