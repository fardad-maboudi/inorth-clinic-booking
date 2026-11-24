import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CalendarX, Clock, Shuffle } from "lucide-react";
import { listSlots } from "@/api/plugins/bookings";
import { hapticFeedback } from "@/api/plugins/telegram-miniapp";
import { useLoad } from "@/miniapp/shell/states";
import { loadCatalog } from "@/miniapp/components/data";
import { digits } from "@/miniapp/components/format";
import SlotPicker from "@/miniapp/components/SlotPicker";
import { Card, Empty, Failure, MainAction, Screen, SkeletonRows, StaffAvatar } from "@/miniapp/components/ui";

/** Step 3: Jalali day strip + free times for the chosen service and specialist. */
export default function MiniappSlots() {
  const { serviceId } = useParams();
  const [params] = useSearchParams();
  const staffId = params.get("staff") || "any";
  const navigate = useNavigate();
  const [slotId, setSlotId] = useState(null);

  const { loading, error, data, reload } = useLoad(async () => {
    const [catalog, slots] = await Promise.all([
      loadCatalog(),
      listSlots({ serviceId, ...(staffId !== "any" ? { resourceId: staffId } : {}) }),
    ]);
    // "Any specialist": one chip per start time; the slot keeps its own specialist.
    const seen = new Set();
    const unique = slots.filter((slot) => slot.available !== false && !seen.has(slot.startsAt) && seen.add(slot.startsAt));
    return { catalog, slots: unique };
  }, [serviceId, staffId]);

  const service = data?.catalog.services.find((item) => String(item._id) === serviceId);
  const member = data?.catalog.staff.find((item) => String(item._id) === staffId);

  return (
    <Screen
      title="چه زمانی؟"
      step={3}
      action={
        data?.slots.length ? (
          <MainAction text="ادامه" disabled={!slotId} onClick={() => navigate(`/book/${serviceId}/confirm?slot=${slotId}`)} />
        ) : null
      }
    >
      {loading ? (
        <SkeletonRows rows={4} height={72} />
      ) : error ? (
        <Failure message="نوبت‌های آزاد بارگذاری نشد." onRetry={reload} />
      ) : (
        <>
          <Card className="ma-rise mb-5 flex items-center gap-3 !p-3">
            {member ? (
              <StaffAvatar member={member} size={40} />
            ) : (
              <span aria-hidden className="grid size-10 place-items-center rounded-full bg-primary/12 text-brand"><Shuffle size={18} strokeWidth={1.75} /></span>
            )}
            <p className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-bold">{service?.name}</span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {member ? member.name : "هر متخصصی"}
                <span className="inline-flex items-center gap-1"><Clock size={12} strokeWidth={1.75} aria-hidden />{digits.format(service?.durationMinutes ?? 0)} دقیقه</span>
              </span>
            </p>
          </Card>
          {data.slots.length === 0 ? (
            <Empty icon={CalendarX} title="نوبت آزادی پیدا نشد" hint="متخصص دیگری را امتحان کنید یا کمی بعد سر بزنید." />
          ) : (
            <SlotPicker slots={data.slots} value={slotId} onChange={(slot) => { hapticFeedback("light"); setSlotId(slot.id); }} />
          )}
        </>
      )}
    </Screen>
  );
}
