import { useNavigate, useParams } from "react-router-dom";
import { Clock, Shuffle } from "lucide-react";
import { useLoad } from "@/miniapp/shell/states";
import { formatMoney } from "@/lib/money.js";
import { loadCatalog, staffFor } from "@/miniapp/components/data";
import { digits } from "@/miniapp/components/format";
import { Card, Failure, IconChip, RowLink, Screen, SkeletonRows, StaffAvatar } from "@/miniapp/components/ui";

/** Step 2: choose a specialist (or the earliest available one). */
export default function MiniappStaff() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { loading, error, data, reload } = useLoad(loadCatalog, []);
  const service = data?.services.find((item) => String(item._id) === serviceId);
  const team = service ? staffFor(service, data.staff) : [];

  return (
    <Screen title="با چه کسی؟" step={2}>
      {loading ? (
        <SkeletonRows rows={3} height={80} />
      ) : error || !service ? (
        <Failure message={error ? "اطلاعات بارگذاری نشد." : "این خدمت پیدا نشد."} onRetry={error ? reload : () => navigate("/services", { replace: true })} />
      ) : (
        <>
          <Card className="ma-rise mb-4 flex items-center justify-between gap-3 !p-3.5">
            <p className="min-w-0 truncate font-bold">{service.name}</p>
            <p className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock size={13} strokeWidth={1.75} aria-hidden />{digits.format(service.durationMinutes)} دقیقه</span>
              <span className="font-bold text-foreground">{formatMoney(service.price, service.currency)}</span>
            </p>
          </Card>
          <div className="space-y-3">
            {team.length > 1 ? (
              <RowLink to={`/book/${serviceId}/slots?staff=any`} i={1}>
                <IconChip icon={Shuffle} size={48} className="!rounded-full" />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold">هر متخصصی</span>
                  <span className="block text-[13px] text-muted-foreground">نزدیک‌ترین نوبت آزاد</span>
                </span>
              </RowLink>
            ) : null}
            {team.map((member, index) => (
              <RowLink key={member._id} to={`/book/${serviceId}/slots?staff=${member._id}`} i={index + 2}>
                <StaffAvatar member={member} size={48} />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold">{member.name}</span>
                  <span className="block text-[13px] leading-5 text-muted-foreground">{member.title}</span>
                </span>
              </RowLink>
            ))}
          </div>
        </>
      )}
    </Screen>
  );
}
