import { Link, useNavigate } from "react-router-dom";
import { BellRing, CalendarCheck, CalendarPlus, CalendarDays, ClipboardList, Sparkles, Ticket } from "lucide-react";
import { listMyBookings } from "@/api/plugins/bookings";
import { telegramUser } from "@/api/plugins/telegram-miniapp";
import { siteConfig } from "@/config/site.js";
import { useMiniAppActor } from "@/miniapp/shell/MiniAppShell";
import { useLoad } from "@/miniapp/shell/states";
import { loadCatalog, byId } from "@/miniapp/components/data";
import { ACTIVE_STATUSES, faDateRelative, faTime, untilLabel } from "@/miniapp/components/format";
import { Failure, IconChip, MainAction, Screen, StaffAvatar } from "@/miniapp/components/ui";

const TILES = [
  { to: "/services", icon: Sparkles, title: "خدمات کلینیک", hint: "فهرست و قیمت" },
  { to: "/my-bookings", icon: CalendarCheck, title: "نوبت‌های من", hint: "تغییر یا لغو" },
  { to: "/credits", icon: Ticket, title: "جلسات و بسته‌ها", hint: "جلسات باقی‌مانده" },
  { to: "/reminders", icon: BellRing, title: "یادآوری", hint: "پیام تلگرام" },
];

function HeroSkeleton() {
  return <div role="status" aria-label="در حال بارگذاری" className="ma-skel h-[188px] rounded-surface" />;
}

function NextAppointment({ booking, now, services, staff }) {
  const service = services.get(String(booking.service));
  const member = staff.get(String(booking.resource));
  return (
    <Link to="/my-bookings" className="ma-press relative block overflow-hidden rounded-surface bg-primary p-5 text-primary-foreground shadow-[0_18px_36px_-18px_color-mix(in_srgb,var(--primary)_80%,transparent)]">
      <span aria-hidden className="pointer-events-none absolute -left-10 -top-12 size-44 rounded-full border border-primary-foreground/15" />
      <span aria-hidden className="pointer-events-none absolute -left-4 -top-6 size-28 rounded-full border border-primary-foreground/15" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm opacity-85">نوبت بعدی شما</p>
        <span className="rounded-full bg-primary-foreground/18 px-3 py-1 text-xs font-bold">{untilLabel(booking.startsAt, now)}</span>
      </div>
      <p className="mt-3 text-xl font-extrabold leading-8">{service?.name ?? "نوبت"}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[34px] font-extrabold leading-none tracking-tight">{faTime(booking.startsAt)}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm opacity-90">
            <CalendarDays size={15} strokeWidth={1.75} aria-hidden />
            {faDateRelative(booking.startsAt)}
          </p>
        </div>
        {member ? (
          <div className="flex items-center gap-2 text-sm">
            <span>{member.name}</span>
            <StaffAvatar member={member} size={36} onDark />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function NoAppointment() {
  return (
    <Link to="/services" className="ma-press flex items-center gap-4 rounded-surface border border-dashed border-foreground/25 p-5">
      <IconChip icon={CalendarPlus} size={52} />
      <span className="min-w-0">
        <span className="block text-base font-bold">هنوز نوبتی ندارید</span>
        <span className="block text-sm leading-6 text-muted-foreground">اولین نوبت خود را در چند لمس بگیرید.</span>
      </span>
    </Link>
  );
}

/** Home: greeting, next appointment, shortcuts. */
export default function MiniappHome() {
  const session = useMiniAppActor();
  const navigate = useNavigate();
  const profile = telegramUser();
  const first = profile?.first_name || session?.user?.fullName || "";
  const data = useLoad(async () => {
    const [mine, catalog] = await Promise.all([listMyBookings(), loadCatalog()]);
    const now = Date.now();
    const upcoming = mine
      .filter((b) => ACTIVE_STATUSES.has(b.status) && new Date(b.startsAt).getTime() > now)
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    return { now, next: upcoming[0] ?? null, services: byId(catalog.services), staff: byId(catalog.staff) };
  }, []);
  const canManage = session?.capabilities?.includes("booking:manage");

  return (
    <Screen back={false} action={<MainAction text="رزرو نوبت جدید" onClick={() => navigate("/services")} />}>
      <header className="mb-5 flex items-center gap-3">
        {profile?.photo_url ? (
          <img src={profile.photo_url} alt="" className="size-12 rounded-full object-cover" />
        ) : (
          <span aria-hidden className="grid size-12 place-items-center rounded-full bg-primary/15 text-lg font-bold text-brand">{(first || "؟").charAt(0)}</span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-[22px] font-extrabold leading-8 tracking-tight">سلام{first ? ` ${first}` : ""}</h1>
          <p className="truncate text-sm text-muted-foreground">{siteConfig.name}</p>
        </div>
      </header>

      {data.loading ? (
        <HeroSkeleton />
      ) : data.error ? (
        <Failure message="دریافت نوبت‌ها انجام نشد." onRetry={data.reload} />
      ) : data.data.next ? (
        <NextAppointment booking={data.data.next} now={data.data.now} services={data.data.services} staff={data.data.staff} />
      ) : (
        <NoAppointment />
      )}

      <nav aria-label="میان‌بر" className="mt-4 grid grid-cols-2 gap-3">
        {TILES.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className="ma-press flex min-h-[116px] flex-col justify-between rounded-surface bg-card p-4 shadow-[0_1px_2px_rgb(0_0_0/.05),0_6px_16px_-10px_rgb(0_0_0/.12)] ring-1 ring-foreground/[.07]"
          >
            <IconChip icon={tile.icon} size={42} />
            <span>
              <span className="block text-[15px] font-bold leading-6">{tile.title}</span>
              <span className="block text-xs leading-5 text-muted-foreground">{tile.hint}</span>
            </span>
          </Link>
        ))}
        {canManage ? (
          <Link to="/owner" className="ma-press col-span-2 flex items-center gap-3.5 rounded-surface bg-foreground p-4 text-background">
            <ClipboardList size={22} strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold">پذیرش و برنامهٔ امروز</span>
              <span className="block text-xs opacity-70">ویژهٔ پرسنل کلینیک</span>
            </span>
          </Link>
        ) : null}
      </nav>
    </Screen>
  );
}
