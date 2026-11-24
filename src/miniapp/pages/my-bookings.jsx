import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, CalendarDays, Phone } from "lucide-react";
import { cancelMyBooking, listMyBookings } from "@/api/plugins/bookings";
import { hapticFeedback } from "@/api/plugins/telegram-miniapp";
import { siteConfig } from "@/config/site.js";
import { Button } from "@/components/ui/button.jsx";
import { useLoad } from "@/miniapp/shell/states";
import { byId, loadCatalog, loadSettings } from "@/miniapp/components/data";
import { ACTIVE_STATUSES, digits, errorText, faDateRelative, faTime, withinWindow } from "@/miniapp/components/format";
import { Card, Empty, Failure, MainAction, Notice, Screen, SkeletonRows, StaffAvatar, StatusBadge } from "@/miniapp/components/ui";

function BookingCard({ booking, now, service, member, settings, onChanged, index }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(null);
  const navigate = useNavigate();
  const active = ACTIVE_STATUSES.has(booking.status) && new Date(booking.startsAt).getTime() > now;
  const cancelHours = service?.cancellationWindowHours ?? settings.cancellationWindowHours;
  const rescheduleHours = service?.rescheduleWindowHours ?? settings.rescheduleWindowHours;
  const canCancel = active && withinWindow(booking.startsAt, cancelHours, now);
  const canMove = active && withinWindow(booking.startsAt, rescheduleHours, now);

  async function cancel() {
    hapticFeedback("medium");
    setBusy(true);
    setFailure(null);
    try {
      await cancelMyBooking(booking._id, "لغو توسط مشتری از مینی‌اپ تلگرام");
      onChanged();
    } catch (err) {
      setFailure(errorText(err));
      setBusy(false);
    }
  }

  return (
    <Card className={`ma-rise ${active ? "" : "opacity-75"}`} style={{ "--i": index }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-bold leading-7">{service?.name ?? "نوبت"}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays size={14} strokeWidth={1.75} aria-hidden />
            {faDateRelative(booking.startsAt)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm">
          {member ? <StaffAvatar member={member} size={28} /> : null}
          <span className="truncate text-muted-foreground">{member?.name}</span>
        </span>
        <span className="text-2xl font-extrabold tracking-tight">{faTime(booking.startsAt)}</span>
      </div>

      {active && !confirming ? (
        <div className="mt-4 space-y-3 border-t border-foreground/10 pt-4">
          <div className="grid grid-cols-2 gap-2.5">
            <Button type="button" variant="outline" className="ma-press h-11" disabled={!canMove} onClick={() => navigate(`/reschedule/${booking._id}`)}>
              تغییر زمان
            </Button>
            <Button type="button" variant="outline" className="ma-press h-11 text-red-600 hover:text-red-700" disabled={!canCancel} onClick={() => setConfirming(true)}>
              لغو نوبت
            </Button>
          </div>
          {!canCancel || !canMove ? (
            <Notice tone="warn">
              تغییر یا لغو آنلاین تا {digits.format(Math.max(cancelHours, rescheduleHours))} ساعت قبل از نوبت ممکن است. برای تغییر دیرهنگام تماس بگیرید:{" "}
              <a href={`tel:${siteConfig.phone}`} className="inline-flex items-center gap-1 font-bold underline">
                <Phone size={13} aria-hidden />
                <bdi dir="ltr">{siteConfig.phone}</bdi>
              </a>
            </Notice>
          ) : null}
        </div>
      ) : null}

      {confirming ? (
        <div className="ma-rise mt-4 space-y-3 border-t border-foreground/10 pt-4">
          <p className="text-sm font-bold">این نوبت لغو شود؟</p>
          {failure ? <Notice tone="error">{failure}</Notice> : null}
          <div className="grid grid-cols-2 gap-2.5">
            <Button type="button" variant="destructive" className="ma-press h-11" onClick={cancel} disabled={busy}>
              {busy ? "در حال لغو…" : "بله، لغو شود"}
            </Button>
            <Button type="button" variant="outline" className="ma-press h-11" onClick={() => setConfirming(false)} disabled={busy}>
              انصراف
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

/** My bookings: upcoming first, then history; reschedule / cancel within policy windows. */
export default function MiniappMyBookings() {
  const navigate = useNavigate();
  const { loading, error, data, reload } = useLoad(async () => {
    const [mine, catalog, settings] = await Promise.all([listMyBookings(), loadCatalog(), loadSettings()]);
    return { mine, now: Date.now(), services: byId(catalog.services), staff: byId(catalog.staff), settings };
  }, []);

  const now = data?.now ?? 0;
  const upcoming = (data?.mine ?? []).filter((b) => ACTIVE_STATUSES.has(b.status) && new Date(b.startsAt).getTime() > now).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  const history = (data?.mine ?? []).filter((b) => !upcoming.includes(b)).sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
  let row = 0;
  const render = (b) => (
    <BookingCard key={b._id} index={row++} booking={b} now={data.now} service={data.services.get(String(b.service))} member={data.staff.get(String(b.resource))} settings={data.settings} onChanged={reload} />
  );

  return (
    <Screen title="نوبت‌های من" action={<MainAction text="رزرو نوبت جدید" onClick={() => navigate("/services")} />}>
      {loading ? (
        <SkeletonRows rows={2} height={176} />
      ) : error ? (
        <Failure message="نوبت‌ها بارگذاری نشد." onRetry={reload} />
      ) : data.mine.length === 0 ? (
        <Empty icon={CalendarCheck} title="هنوز نوبتی ندارید" hint="اولین نوبت خود را همین حالا بگیرید." />
      ) : (
        <div className="space-y-6">
          {upcoming.length ? <section className="space-y-3"><h2 className="px-1 text-sm font-bold text-muted-foreground">پیش‌رو</h2>{upcoming.map(render)}</section> : (
            <Notice tone="info">نوبت فعالی ندارید. برای رزرو، دکمهٔ پایین را بزنید.</Notice>
          )}
          {history.length ? <section className="space-y-3"><h2 className="px-1 text-sm font-bold text-muted-foreground">سابقه</h2>{history.map(render)}</section> : null}
        </div>
      )}
    </Screen>
  );
}
