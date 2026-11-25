import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CalendarDays, Clock, Smartphone, Ticket } from "lucide-react";
import { bookSlot, getSlot, myCredits } from "@/api/plugins/bookings";
import { hapticFeedback } from "@/api/plugins/telegram-miniapp";
import { formatMoney } from "@/lib/money.js";
import { Button } from "@/components/ui/button.jsx";
import { Switch } from "@/components/ui/switch.jsx";
import { useLoad } from "@/miniapp/shell/states";
import { loadCatalog, loadSettings } from "@/miniapp/components/data";
import { digits, errorText, faDateRelative, faTime } from "@/miniapp/components/format";
import { Card, Failure, Field, MainAction, Notice, Screen, SkeletonRows, StaffAvatar, inputClass } from "@/miniapp/components/ui";
import { useProfile } from "@/miniapp/components/useProfile";

/** Step 4: review, guest details from the Telegram profile, confirm. */
export default function MiniappConfirm() {
  const { serviceId } = useParams();
  const [params] = useSearchParams();
  const slotId = params.get("slot");
  const navigate = useNavigate();
  const profile = useProfile();
  const [useCredit, setUseCredit] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState(null);

  const { loading, error, data, reload } = useLoad(async () => {
    const [catalog, slot, settings, credits] = await Promise.all([
      loadCatalog(),
      getSlot(slotId),
      loadSettings(),
      myCredits().catch(() => []),
    ]);
    return { catalog, slot, settings, credits };
  }, [slotId]);

  const service = data?.catalog.services.find((item) => String(item._id) === serviceId);
  const member = data?.catalog.staff.find((item) => String(item._id) === String(data?.slot.resource));
  const credit = data?.credits.find(
    (row) => row.status !== "expired" && (row.unlimited || row.remainingSessions > 0) && (!row.serviceIds?.length || row.serviceIds.map(String).includes(serviceId)),
  );
  const phoneOk = Boolean(profile.canonicalPhone);
  const ready = profile.name.trim().length >= 2 && phoneOk && !submitting;

  async function confirm() {
    if (!ready) return;
    hapticFeedback("medium");
    setSubmitting(true);
    setFailure(null);
    try {
      const booking = await bookSlot({
        slotId,
        customerName: profile.name.trim(),
        customerPhone: profile.canonicalPhone,
        notes: notes.trim() || undefined,
        creditId: credit && useCredit ? String(credit._id) : undefined,
      });
      navigate(`/booked?id=${encodeURIComponent(booking._id)}`, { replace: true });
    } catch (err) {
      setFailure(errorText(err));
      setSubmitting(false);
    }
  }

  if (!slotId) return <Screen title="تأیید نوبت" step={4}><Failure message="زمانی انتخاب نشده است." onRetry={() => navigate(`/book/${serviceId}/slots?staff=any`, { replace: true })} /></Screen>;

  return (
    <Screen
      title="تأیید نوبت"
      step={4}
      action={data ? <MainAction text="ثبت نوبت" onClick={confirm} disabled={!ready} loading={submitting} /> : null}
    >
      {loading ? (
        <SkeletonRows rows={3} height={110} />
      ) : error || !service ? (
        <Failure message="اطلاعات نوبت بارگذاری نشد. ممکن است این زمان پر شده باشد." onRetry={reload} />
      ) : (
        <div className="space-y-5">
          <Card className="!p-0 overflow-hidden">
            <div className="p-4 pb-5">
              <p className="text-lg font-extrabold leading-8">{service.name}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[32px] font-extrabold leading-none tracking-tight">{faTime(data.slot.startsAt)}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarDays size={15} strokeWidth={1.75} aria-hidden />
                    {faDateRelative(data.slot.startsAt)}
                  </p>
                </div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={13} strokeWidth={1.75} aria-hidden />
                  {digits.format(service.durationMinutes)} دقیقه
                </p>
              </div>
            </div>
            <div aria-hidden className="relative h-px border-t border-dashed border-foreground/20">
              <span className="absolute -start-2 -top-2 size-4 rounded-full bg-background" />
              <span className="absolute -end-2 -top-2 size-4 rounded-full bg-background" />
            </div>
            <div className="flex items-center justify-between gap-3 p-4 pt-4">
              <span className="flex min-w-0 items-center gap-2.5 text-sm">
                {member ? <StaffAvatar member={member} size={32} /> : null}
                <span className="truncate font-semibold">{member?.name ?? "؟"}</span>
              </span>
              <span className="shrink-0 text-base font-extrabold">{credit && useCredit ? "با جلسهٔ بسته" : formatMoney(data.slot.price ?? service.price, service.currency)}</span>
            </div>
          </Card>

          {credit ? (
            <Card className="flex items-center gap-3 !p-3.5">
              <Ticket size={20} strokeWidth={1.75} aria-hidden className="shrink-0 text-brand" />
              <span className="min-w-0 flex-1 text-sm">
                <span className="block font-semibold">استفاده از جلسهٔ بسته</span>
                <span className="text-xs text-muted-foreground">{credit.unlimited ? "نامحدود" : `${digits.format(credit.remainingSessions)} جلسه باقی‌مانده`}</span>
              </span>
              <Switch checked={useCredit} onCheckedChange={setUseCredit} aria-label="استفاده از جلسهٔ بسته" />
            </Card>
          ) : null}

          <div className="space-y-4">
            <Field label="نام و نام خانوادگی">
              <input className={inputClass} value={profile.name} onChange={(e) => profile.setName(e.target.value)} autoComplete="name" placeholder="مثلاً سارا احمدی" />
            </Field>
            <Field label="شمارهٔ موبایل" hint={!profile.phone || phoneOk ? "برای تأیید و یادآوری نوبت استفاده می‌شود." : "شمارهٔ موبایل معتبر نیست."}>
              <input className={`${inputClass} text-start`} dir="ltr" inputMode="tel" placeholder="09120000000" value={profile.phone} onChange={(e) => profile.setPhone(e.target.value)} autoComplete="tel" />
            </Field>
            {profile.canShare && !phoneOk ? (
              <Button type="button" variant="outline" className="ma-press h-12 w-full gap-2" onClick={profile.sharePhone} disabled={profile.sharing}>
                <Smartphone size={18} strokeWidth={1.75} aria-hidden />
                اشتراک شمارهٔ تلگرام من
              </Button>
            ) : null}
            <Field label="توضیحات (اختیاری)">
              <textarea className={`${inputClass} h-24 resize-none py-3`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثلاً موضوع مراجعه" />
            </Field>
          </div>

          <p className="px-1 text-xs leading-6 text-muted-foreground">{data.settings.cancellationPolicyText}</p>
          {failure ? <Notice tone="error">{failure}</Notice> : null}
        </div>
      )}
    </Screen>
  );
}
