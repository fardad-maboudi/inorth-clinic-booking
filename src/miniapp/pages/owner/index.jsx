import { useState } from "react";
import { checkInBooking, completeBooking, confirmBooking, getCalendar, noShowBooking } from "@/api/backoffice/bookings";
import { Button } from "@/components/ui/button.jsx";
import { useMiniAppActor } from "@/miniapp/shell/MiniAppShell";
import { Armchair, Lock } from "lucide-react";
import { useLoad } from "@/miniapp/shell/states";
import { byId, loadCatalog } from "@/miniapp/components/data";
import { dayKey, digits, errorText, faDateRelative, faTime } from "@/miniapp/components/format";
import { Card, Empty, Failure, Notice, Screen, SkeletonRows, StatusBadge } from "@/miniapp/components/ui";

const ACTIONS = {
  pending: [["confirm", "تأیید", confirmBooking]],
  confirmed: [
    ["checkin", "ورود", checkInBooking],
    ["done", "انجام شد", completeBooking],
    ["noshow", "عدم حضور", noShowBooking],
  ],
};

function Appointment({ booking, service, member, onChanged }) {
  const [busy, setBusy] = useState(null);
  const [failure, setFailure] = useState(null);
  async function run(key, fn) {
    setBusy(key);
    setFailure(null);
    try {
      await fn(booking._id);
      onChanged();
    } catch (err) {
      setFailure(errorText(err));
      setBusy(null);
    }
  }
  return (
    <Card className="!p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold">
            <span className="ml-2">{faTime(booking.startsAt)}</span>
            {booking.customerName}
          </p>
          <p className="text-xs text-muted-foreground">{service?.name} · {member?.name}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      {(ACTIONS[booking.status] ?? []).length ? (
        <div className="mt-3 flex gap-2">
          {ACTIONS[booking.status].map(([key, label, fn]) => (
            <Button key={key} type="button" size="sm" variant={key === "confirm" || key === "done" ? "default" : "outline"} className="h-10 flex-1" disabled={busy !== null} onClick={() => run(key, fn)}>
              {busy === key ? "…" : label}
            </Button>
          ))}
        </div>
      ) : null}
      {failure ? <div className="mt-2"><Notice tone="error">{failure}</Notice></div> : null}
    </Card>
  );
}

/** Staff face: today's and the next days' appointments. Every action is re-authorized by the server. */
export default function MiniappOwner() {
  const session = useMiniAppActor();
  const allowed = Boolean(session?.capabilities?.includes("booking:manage"));
  const { loading, error, data, reload } = useLoad(async () => {
    if (!allowed) return null;
    const from = new Date(Date.now() - 6 * 3_600_000).toISOString();
    const to = new Date(Date.now() + 4 * 86_400_000).toISOString();
    const [calendar, catalog] = await Promise.all([getCalendar({ from, to }), loadCatalog()]);
    const live = (calendar.bookings ?? []).filter((b) => b.status !== "cancelled").sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    return { bookings: live, services: byId(catalog.services), staff: byId(catalog.staff) };
  }, [allowed]);

  const days = new Map();
  for (const booking of data?.bookings ?? []) {
    const key = dayKey(booking.startsAt);
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(booking);
  }

  return (
    <Screen title="پذیرش و برنامه" subtitle="نوبت‌های امروز و چند روز آینده">
      {!allowed ? (
        <Empty icon={Lock} title="این بخش ویژهٔ پرسنل است" hint="با حساب پرسنل وارد شوید." />
      ) : loading ? (
        <SkeletonRows rows={3} height={96} />
      ) : error ? (
        <Failure message={errorText(error, "برنامه بارگذاری نشد.")} onRetry={reload} />
      ) : days.size === 0 ? (
        <Empty icon={Armchair} title="نوبتی ثبت نشده" hint="برای چهار روز آینده نوبتی وجود ندارد." />
      ) : (
        [...days.entries()].map(([key, items]) => (
          <section key={key} className="mb-5">
            <h2 className="mb-2.5 px-1 text-sm font-bold text-muted-foreground">
              {faDateRelative(items[0].startsAt)} · {digits.format(items.length)} نوبت
            </h2>
            <div className="space-y-2.5">
              {items.map((b) => (
                <Appointment key={b._id} booking={b} service={data.services.get(String(b.service))} member={data.staff.get(String(b.resource))} onChanged={reload} />
              ))}
            </div>
          </section>
        ))
      )}
    </Screen>
  );
}
