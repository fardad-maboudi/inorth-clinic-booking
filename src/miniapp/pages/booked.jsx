import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BellRing, CalendarDays } from "lucide-react";
import { getBooking } from "@/api/plugins/bookings";
import { Button } from "@/components/ui/button.jsx";
import { useLoad } from "@/miniapp/shell/states";
import { loadCatalog, loadSettings } from "@/miniapp/components/data";
import { faDateRelative, faTime, offsetLabel } from "@/miniapp/components/format";
import { Card, Failure, MainAction, Screen, SkeletonRows } from "@/miniapp/components/ui";

/** Success moment after a booking: the check draws itself, then the summary. */
export default function MiniappBooked() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");
  const { loading, error, data, reload } = useLoad(async () => {
    const [booking, catalog, settings] = await Promise.all([getBooking(id), loadCatalog(), loadSettings()]);
    return { booking, service: catalog.services.find((s) => String(s._id) === String(booking.service)), settings };
  }, [id]);

  return (
    <Screen back={false} action={<MainAction text="نوبت‌های من" onClick={() => navigate("/my-bookings", { replace: true })} />}>
      {loading ? (
        <SkeletonRows rows={2} height={140} />
      ) : error || !id ? (
        <Failure message="جزئیات نوبت بارگذاری نشد، اما نوبت شما ثبت شده است." onRetry={id ? reload : () => navigate("/my-bookings", { replace: true })} />
      ) : (
        <div className="flex flex-col items-center pt-6 text-center">
          <div className="relative grid size-24 place-items-center">
            <span className="grid size-24 place-items-center rounded-full bg-primary text-primary-foreground">
              <svg viewBox="0 0 32 32" className="size-12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path className="ma-draw" d="M8 17l5.5 5.5L24 11" />
              </svg>
            </span>
          </div>
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
            {data.booking.status === "pending" ? "درخواست نوبت ثبت شد" : "نوبت شما تأیید شد"}
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            {data.service?.name}
          </p>
          <Card className="mt-6 w-full text-start">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays size={16} strokeWidth={1.75} aria-hidden />
              {faDateRelative(data.booking.startsAt)}
            </p>
            <p className="mt-1 text-[32px] font-extrabold leading-tight tracking-tight">{faTime(data.booking.startsAt)}</p>
          </Card>
          <Link to="/reminders" className="ma-press mt-3 flex w-full items-center gap-3 rounded-surface bg-primary/10 p-4 text-start">
            <BellRing size={20} strokeWidth={1.75} aria-hidden className="shrink-0 text-brand" />
            <span className="min-w-0 flex-1 text-sm leading-6">
              یادآور تلگرام {(data.settings.reminderOffsetsMinutes ?? []).map((m) => offsetLabel(m)).join(" و ")} قبل از نوبت برایتان ارسال می‌شود.
            </span>
          </Link>
          <Button type="button" variant="ghost" className="mt-2 h-11" onClick={() => navigate("/", { replace: true })}>
            بازگشت به خانه
          </Button>
        </div>
      )}
    </Screen>
  );
}
