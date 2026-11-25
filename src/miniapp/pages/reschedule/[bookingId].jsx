import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarX, ArrowLeft } from "lucide-react";
import { getBooking, listSlots, rescheduleBooking } from "@/api/plugins/bookings";
import { hapticFeedback } from "@/api/plugins/telegram-miniapp";
import { useLoad } from "@/miniapp/shell/states";
import { loadCatalog } from "@/miniapp/components/data";
import { errorText, faDateLong, faTime } from "@/miniapp/components/format";
import SlotPicker from "@/miniapp/components/SlotPicker";
import { Card, Empty, Failure, MainAction, Notice, Screen, SkeletonRows } from "@/miniapp/components/ui";

/** Reschedule: same specialist and service, pick a new free slot. */
export default function MiniappReschedule() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [slotId, setSlotId] = useState(null);
  const [picked, setPicked] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState(null);

  const { loading, error, data, reload } = useLoad(async () => {
    const booking = await getBooking(bookingId);
    const [catalog, slots] = await Promise.all([
      loadCatalog(),
      listSlots({ serviceId: booking.service, resourceId: booking.resource }),
    ]);
    return { booking, catalog, slots: slots.filter((slot) => slot.id !== booking.slotId && slot.available !== false) };
  }, [bookingId]);

  async function move() {
    if (!slotId) return;
    hapticFeedback("medium");
    setSubmitting(true);
    setFailure(null);
    try {
      await rescheduleBooking(bookingId, slotId, "تغییر زمان توسط مشتری از مینی‌اپ تلگرام");
      navigate("/my-bookings", { replace: true });
    } catch (err) {
      setFailure(errorText(err));
      setSubmitting(false);
    }
  }

  const service = data?.catalog.services.find((item) => String(item._id) === String(data?.booking.service));
  return (
    <Screen
      title="تغییر زمان نوبت"
      action={data?.slots.length ? <MainAction text={picked ? `انتقال به ${faTime(picked.startsAt)}` : "زمان جدید را انتخاب کنید"} onClick={move} disabled={!slotId} loading={submitting} /> : null}
    >
      {loading ? (
        <SkeletonRows rows={3} height={90} />
      ) : error ? (
        <Failure message={errorText(error, "نوبت پیدا نشد.")} onRetry={reload} />
      ) : (
        <>
          <Card className="mb-5 !p-3.5">
            <p className="text-xs text-muted-foreground">نوبت فعلی</p>
            <p className="mt-0.5 flex items-center gap-2 font-bold">
              {service?.name}
              <ArrowLeft size={14} aria-hidden className="text-muted-foreground" />
              <span className="font-medium text-muted-foreground">{faDateLong(data.booking.startsAt)}، {faTime(data.booking.startsAt)}</span>
            </p>
          </Card>
          {data.slots.length === 0 ? (
            <Empty icon={CalendarX} title="زمان آزاد دیگری وجود ندارد" hint="با کلینیک تماس بگیرید." />
          ) : (
            <SlotPicker slots={data.slots} value={slotId} onChange={(slot) => { hapticFeedback("light"); setSlotId(slot.id); setPicked(slot); }} />
          )}
          {failure ? <div className="mt-4"><Notice tone="error">{failure}</Notice></div> : null}
        </>
      )}
    </Screen>
  );
}
