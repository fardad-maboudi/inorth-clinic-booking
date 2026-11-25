import { BellRing, CircleAlert, CircleCheck, Send } from "lucide-react";
import { getBotLink, isTelegramEnabled } from "@/api/plugins/telegram";
import { tg } from "@/api/plugins/telegram-miniapp";
import { Button } from "@/components/ui/button.jsx";
import { useLoad } from "@/miniapp/shell/states";
import { loadSettings } from "@/miniapp/components/data";
import { offsetLabel } from "@/miniapp/components/format";
import { useNative } from "@/miniapp/components/native";
import { Card, Failure, Screen, SkeletonRows } from "@/miniapp/components/ui";

function StatusRow({ ok, label, hint }) {
  const Icon = ok ? CircleCheck : CircleAlert;
  return (
    <li className="flex items-start gap-3 py-3.5">
      <Icon size={22} strokeWidth={1.75} aria-hidden className={`mt-0.5 shrink-0 ${ok ? "text-emerald-600" : "text-amber-600"}`} />
      <span className="min-w-0">
        <span className="block text-[15px] font-bold leading-6">{label}</span>
        <span className="block text-[13px] leading-5 text-muted-foreground">{hint}</span>
      </span>
    </li>
  );
}

/** Reminder opt-in: bot/account status, schedule from booking policy, deep link to the bot chat. */
export default function MiniappReminders() {
  const native = useNative();
  const { loading, error, data, reload } = useLoad(async () => {
    const [settings, botReady, link] = await Promise.all([loadSettings(), isTelegramEnabled(), getBotLink("reminders")]);
    return { settings, botReady, link };
  }, []);

  function openBot() {
    if (!data?.link) return;
    const app = tg();
    if (app?.openTelegramLink) app.openTelegramLink(data.link);
    else window.open(data.link, "_blank", "noopener,noreferrer");
  }

  const offsets = [...(data?.settings.reminderOffsetsMinutes ?? [])].sort((a, b) => a - b);
  return (
    <Screen title="یادآوری نوبت" subtitle="پیش از هر نوبت، در تلگرام خبرتان می‌کنیم.">
      {loading ? (
        <SkeletonRows rows={3} height={100} />
      ) : error ? (
        <Failure message="وضعیت یادآوری بارگذاری نشد." onRetry={reload} />
      ) : (
        <>
          <Card className="!py-1">
            <ul className="divide-y divide-foreground/10">
              <StatusRow ok={data.botReady} label={data.botReady ? "ربات کلینیک فعال است" : "ربات هنوز متصل نشده"} hint="پیام‌ها از ربات رسمی کلینیک ارسال می‌شود." />
              <StatusRow
                ok={native}
                label={native ? "حساب تلگرام شما وارد شده است" : "خارج از تلگرام"}
                hint={native ? "یادآورها به همین گفتگو می‌آید." : "برای دریافت یادآور، مینی‌اپ را از داخل ربات باز کنید."}
              />
            </ul>
          </Card>

          <section className="mt-7">
            <h2 className="mb-3 px-1 text-sm font-bold text-muted-foreground">زمان‌بندی پیام‌ها</h2>
            {offsets.length ? (
              <ol className="relative space-y-3 ps-1">
                <span aria-hidden className="absolute bottom-6 start-[25px] top-6 w-px bg-foreground/15" />
                {offsets.map((minutes) => (
                  <li key={minutes} className="relative flex items-center gap-3.5">
                    <span className="relative z-[1] grid size-12 shrink-0 place-items-center rounded-full bg-primary/12 text-brand ring-4 ring-background">
                      <BellRing size={20} strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="text-[15px] font-semibold">{offsetLabel(minutes)} قبل از نوبت</span>
                  </li>
                ))}
                <li className="relative flex items-center gap-3.5">
                  <span className="relative z-[1] grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">
                    <CircleCheck size={20} strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="text-[15px] font-bold">زمان نوبت شما</span>
                </li>
              </ol>
            ) : (
              <Card className="text-sm text-muted-foreground">یادآور خودکاری تنظیم نشده است.</Card>
            )}
            <p className="mt-5 px-1 text-[13px] leading-6 text-muted-foreground">
              تأیید، لغو و تغییر زمان نوبت هم همان لحظه در تلگرام اطلاع داده می‌شود. برای قطع پیام‌ها در گفتگوی ربات <span dir="ltr" className="inline-block font-semibold">/stop</span> را بفرستید.
            </p>
          </section>

          <Button type="button" className="ma-press mt-6 h-[52px] w-full gap-2 text-base font-bold" onClick={openBot} disabled={!data.link}>
            <Send size={18} strokeWidth={1.75} aria-hidden />
            فعال‌سازی در گفتگوی ربات
          </Button>
        </>
      )}
    </Screen>
  );
}
