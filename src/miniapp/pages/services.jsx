import { Clock, Flower2, Layers, Sparkles, Stethoscope, Ticket, Zap } from "lucide-react";
import { useLoad } from "@/miniapp/shell/states";
import { formatMoney } from "@/lib/money.js";
import { loadCatalog } from "@/miniapp/components/data";
import { digits } from "@/miniapp/components/format";
import { Empty, Failure, IconChip, RowLink, Screen, SkeletonRows } from "@/miniapp/components/ui";

const GROUP_ICON = [
  [/پوست|مو/, Stethoscope],
  [/لیزر/, Zap],
  [/ماساژ|اسپا/, Flower2],
];
const iconFor = (group = "") => GROUP_ICON.find(([pattern]) => pattern.test(group))?.[1] ?? Sparkles;

/** Step 1: choose a service, grouped by category. */
export default function MiniappServices() {
  const { loading, error, data, reload } = useLoad(loadCatalog, []);
  const groups = new Map();
  for (const service of data?.services ?? []) {
    const key = service.group || "خدمات";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(service);
  }
  return (
    <Screen title="کدام خدمت؟" step={1}>
      {loading ? (
        <SkeletonRows rows={4} height={104} />
      ) : error ? (
        <Failure message="فهرست خدمات بارگذاری نشد." onRetry={reload} />
      ) : groups.size === 0 ? (
        <Empty icon={Layers} title="هنوز خدمتی تعریف نشده" hint="کمی بعد دوباره سر بزنید." />
      ) : (
        [...groups.entries()].map(([group, items]) => (
          <section key={group} className="mb-6">
            <h2 className="mb-2.5 px-1 text-sm font-bold text-muted-foreground">{group}</h2>
            <div className="space-y-3">
              {items.map((service) => (
                <RowLink key={service._id} to={`/book/${service._id}`}>
                  <IconChip icon={iconFor(service.group)} size={48} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold leading-6">{service.name}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[13px] leading-5 text-muted-foreground">{service.description}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock size={13} strokeWidth={1.75} aria-hidden />
                        {digits.format(service.durationMinutes)} دقیقه
                      </span>
                      <span className="font-bold">{formatMoney(service.price, service.currency)}</span>
                      {service.package?.enabled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 font-semibold text-brand">
                          <Ticket size={12} strokeWidth={1.75} aria-hidden />
                          بستهٔ {digits.format(service.package.sessionCount)} جلسه‌ای
                        </span>
                      ) : null}
                    </span>
                  </span>
                </RowLink>
              ))}
            </div>
          </section>
        ))
      )}
    </Screen>
  );
}
