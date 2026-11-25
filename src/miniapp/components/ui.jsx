import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, CalendarX, ChevronLeft, Info, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { useMainButton } from "@/miniapp/runtime/hooks";
import { useNative } from "./native";
import { STATUS_LABEL } from "./format";

const STEPS = ["خدمت", "متخصص", "زمان", "تأیید"];

/** Booking progress: four segments, the current one named. Replaces "step 2 of 4" text. */
export function Steps({ current }) {
  return (
    <ol aria-label="مراحل رزرو" className="mt-3 grid grid-cols-4 gap-1.5">
      {STEPS.map((label, index) => {
        const state = index + 1 < current ? "done" : index + 1 === current ? "now" : "todo";
        return (
          <li key={label} aria-current={state === "now" ? "step" : undefined} className="min-w-0">
            <span className={`block h-1 rounded-full transition-colors ${state === "todo" ? "bg-foreground/15" : "bg-primary"}`} />
            <span className={`mt-1.5 block truncate text-xs ${state === "now" ? "font-bold text-foreground" : "text-muted-foreground"}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Page frame: title block, optional booking steps, room for the main button. */
export function Screen({ title, subtitle, step, children, back = true, action }) {
  const native = useNative();
  const navigate = useNavigate();
  return (
    <main dir="rtl" className={`mx-auto min-h-[100dvh] w-full max-w-[560px] px-4 pt-4 ${action ? "pb-32" : "pb-10"}`}>
      {!native && back ? (
        <button type="button" aria-label="بازگشت" onClick={() => navigate(-1)} className="ma-press -ms-1 mb-2 grid size-10 place-items-center rounded-full bg-foreground/[.06] text-foreground">
          <ArrowRight size={20} strokeWidth={1.75} aria-hidden />
        </button>
      ) : null}
      {title ? (
        <header className="mb-5">
          <h1 className="text-[26px] font-extrabold leading-9 tracking-tight [text-wrap:balance]">{title}</h1>
          {subtitle ? <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
          {step ? <Steps current={step} /> : null}
        </header>
      ) : null}
      {children}
      {action}
    </main>
  );
}

/** Telegram MainButton inside Telegram; an in-page sticky bar in a plain browser. */
export function MainAction({ text, onClick, disabled = false, loading = false }) {
  const native = useNative();
  useMainButton(native ? { text, onClick, disabled, loading } : {});
  if (native) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-background from-70% to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
      <div className="mx-auto max-w-[560px]">
        <Button className="ma-press h-[52px] w-full rounded-control text-base font-bold shadow-[0_8px_20px_-8px_color-mix(in_srgb,var(--primary)_70%,transparent)]" onClick={onClick} disabled={disabled || loading}>
          {loading ? "لطفاً صبر کنید…" : text}
        </Button>
      </div>
    </div>
  );
}

export function Card({ children, className = "", style, ...rest }) {
  return (
    <section {...rest} style={style} className={`rounded-surface bg-card p-4 shadow-[0_1px_2px_rgb(0_0_0/.05),0_6px_16px_-10px_rgb(0_0_0/.12)] ring-1 ring-foreground/[.07] ${className}`}>
      {children}
    </section>
  );
}

/** Tinted icon tile. */
export function IconChip({ icon, size = 44, className = "" }) {
  const Icon = icon;
  return (
    <span style={{ width: size, height: size }} className={`grid shrink-0 place-items-center rounded-control bg-primary/12 text-brand ${className}`}>
      <Icon size={Math.round(size * 0.48)} strokeWidth={1.75} aria-hidden />
    </span>
  );
}

/** Whole-row tap target that navigates. */
export function RowLink({ to, children, className = "" }) {
  return (
    <Link to={to} className={`ma-press flex items-center gap-3.5 rounded-surface bg-card p-4 shadow-[0_1px_2px_rgb(0_0_0/.05),0_6px_16px_-10px_rgb(0_0_0/.12)] ring-1 ring-foreground/[.07] active:bg-foreground/[.04] ${className}`}>
      {children}
      <ChevronLeft size={18} strokeWidth={1.75} aria-hidden className="shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function StaffAvatar({ member, size = 44, onDark = false }) {
  const initial = (member?.name ?? "؟").replace(/^(دکتر|سرکار خانم|آقای)\s+/, "").trim().charAt(0) || "؟";
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.4, ...(onDark ? {} : { background: member?.color || "var(--color-brand-600)" }) }}
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-white ${onDark ? "bg-white/20 ring-1 ring-white/45" : "ring-2 ring-card"}`}
    >
      {initial}
    </span>
  );
}

const STATUS_TONE = {
  pending: "bg-amber-500/20",
  confirmed: "bg-emerald-500/20",
  cancelled: "bg-red-500/20",
  completed: "bg-sky-500/20",
  no_show: "bg-red-500/20",
  rescheduled: "bg-foreground/10",
};

export function StatusBadge({ status }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-foreground ${STATUS_TONE[status] ?? "bg-foreground/10"}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function Notice({ tone = "info", children }) {
  const tones = {
    info: ["bg-sky-500/12 ring-sky-500/25", Info],
    warn: ["bg-amber-500/15 ring-amber-500/30", AlertTriangle],
    error: ["bg-red-500/12 ring-red-500/30", AlertTriangle],
  };
  const [cls, Icon] = tones[tone];
  return (
    <p role={tone === "error" ? "alert" : "note"} className={`flex items-start gap-2.5 rounded-control px-3.5 py-3 text-sm leading-6 text-foreground ring-1 ${cls}`}>
      <Icon size={18} strokeWidth={1.75} aria-hidden className="mt-1 shrink-0" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs leading-5 text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "h-[52px] w-full rounded-control border border-foreground/15 bg-card px-4 text-base outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15";

/** Static loading placeholders shaped like the content they stand in for. */
export function SkeletonRows({ rows = 3, height = 84 }) {
  return (
    <div role="status" aria-label="در حال بارگذاری" className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} style={{ height }} className="ma-skel rounded-surface" />
      ))}
    </div>
  );
}

export function Empty({ icon = CalendarX, title, hint, children }) {
  const Icon = icon;
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-foreground/[.06] text-muted-foreground">
        <Icon size={28} strokeWidth={1.5} aria-hidden />
      </span>
      <p className="mt-4 text-base font-bold">{title}</p>
      {hint ? <p className="mt-1 max-w-[28ch] text-sm leading-6 text-muted-foreground">{hint}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function Failure({ message = "خطایی رخ داد.", onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-red-500/12 text-red-600">
        <AlertTriangle size={28} strokeWidth={1.5} aria-hidden />
      </span>
      <p className="mt-4 text-base font-bold">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" className="ma-press mt-5 h-11 gap-2 px-5" onClick={onRetry}>
          <RotateCw size={16} aria-hidden />
          تلاش دوباره
        </Button>
      ) : null}
    </div>
  );
}
