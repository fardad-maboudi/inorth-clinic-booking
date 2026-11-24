import { Check, ExternalLink, Ticket } from "lucide-react";
import { myCredits } from "@/api/plugins/bookings";
import { tg } from "@/api/plugins/telegram-miniapp";
import { formatMoney } from "@/lib/money.js";
import { Button } from "@/components/ui/button.jsx";
import { useLoad } from "@/miniapp/shell/states";
import { byId, loadCatalog } from "@/miniapp/components/data";
import { digits, faDateLong } from "@/miniapp/components/format";
import { Card, Empty, Failure, IconChip, Screen, SkeletonRows } from "@/miniapp/components/ui";

/** Package checkout stays on the website (Telegram digital-goods policy); open it outside Telegram. */
function openPackagesPage() {
  const url = new URL(`${import.meta.env.BASE_URL}packages`, window.location.origin).toString();
  const app = tg();
  if (app?.openLink) app.openLink(url);
  else window.open(url, "_blank", "noopener,noreferrer");
}

/** Punch card: one dot per session, filled while remaining, checked once used. */
function PunchCard({ total, left }) {
  if (total > 14) {
    return (
      <div className="h-2 overflow-hidden rounded-full bg-foreground/10" role="img" aria-label="جلسات باقی‌مانده">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (left / total) * 100)}%` }} />
      </div>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2" aria-label={`${digits.format(left)} از ${digits.format(total)} جلسه باقی‌مانده`}>
      {Array.from({ length: total }, (_, index) => {
        const used = index >= left;
        return (
          <li
            key={index}
            style={{ "--i": index }}
            className={`ma-pop grid size-9 place-items-center rounded-full ${used ? "bg-foreground/[.06] text-muted-foreground ring-1 ring-foreground/15" : "bg-primary text-primary-foreground"}`}
          >
            {used ? <Check size={15} strokeWidth={2} aria-hidden /> : <span className="text-xs font-bold">{digits.format(index + 1)}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function CreditCard({ credit, services, index }) {
  const names = (credit.serviceIds ?? []).map((id) => services.get(String(id))?.name).filter(Boolean);
  const total = Number(credit.totalSessions) || 0;
  const left = credit.unlimited ? total : Number(credit.remainingSessions) || 0;
  return (
    <Card className="ma-rise" style={{ "--i": index }}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-bold leading-7">{names.join("، ") || "بستهٔ جلسات"}</p>
        <p className="shrink-0 text-end leading-none">
          <span className="text-3xl font-extrabold tracking-tight">{credit.unlimited ? "∞" : digits.format(left)}</span>
          {credit.unlimited ? null : <span className="block pt-1 text-xs text-muted-foreground">از {digits.format(total)} جلسه</span>}
        </p>
      </div>
      {credit.unlimited ? null : <div className="mt-4"><PunchCard total={total} left={left} /></div>}
      {credit.expiresAt ? <p className="mt-4 text-xs text-muted-foreground">اعتبار تا {faDateLong(credit.expiresAt)}</p> : null}
    </Card>
  );
}

/** My session credits and the packages the clinic sells. */
export default function MiniappCredits() {
  const { loading, error, data, reload } = useLoad(async () => {
    const [credits, catalog] = await Promise.all([myCredits(), loadCatalog()]);
    return { credits, services: byId(catalog.services), packages: catalog.services.filter((s) => s.package?.enabled) };
  }, []);
  const active = (data?.credits ?? []).filter((c) => c.status !== "expired" && c.status !== "cancelled" && c.status !== "used");

  return (
    <Screen title="جلسات و بسته‌ها">
      {loading ? (
        <SkeletonRows rows={2} height={150} />
      ) : error ? (
        <Failure message="اطلاعات جلسات بارگذاری نشد." onRetry={reload} />
      ) : (
        <>
          {active.length ? (
            <div className="space-y-3">{active.map((c, index) => <CreditCard key={c._id} index={index} credit={c} services={data.services} />)}</div>
          ) : (
            <Empty icon={Ticket} title="جلسهٔ فعالی ندارید" hint="با خرید بسته، هر جلسه ارزان‌تر تمام می‌شود." />
          )}

          {data.packages.length ? (
            <section className="mt-8">
              <h2 className="mb-2.5 px-1 text-sm font-bold text-muted-foreground">بسته‌های کلینیک</h2>
              <div className="space-y-3">
                {data.packages.map((service, index) => (
                  <Card key={service._id} className="ma-rise flex items-center gap-3.5 !p-3.5" style={{ "--i": index }}>
                    <IconChip icon={Ticket} size={44} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{service.package.name}</span>
                      <span className="block text-xs leading-5 text-muted-foreground">
                        {digits.format(service.package.sessionCount)} جلسه · اعتبار {digits.format(service.package.validityDays)} روز
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-extrabold">{formatMoney(service.package.price, service.currency)}</span>
                  </Card>
                ))}
              </div>
              <Button type="button" variant="outline" className="ma-press mt-4 h-12 w-full gap-2" onClick={openPackagesPage}>
                <ExternalLink size={16} strokeWidth={1.75} aria-hidden />
                خرید بسته در وب‌سایت
              </Button>
            </section>
          ) : null}
        </>
      )}
    </Screen>
  );
}
