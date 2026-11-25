import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './panel.css';
import {
  CalendarDays,
  ClipboardList,
  Gift,
  HeartPulse,
  PartyPopper,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Menu,
  Package,
  Receipt,
  Scissors,
  Settings,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useMembership } from './data';
import { ErrorState, LoadingState } from './ui';
import { btn, card } from './styles';

const NAV = [
  { to: '/panel', label: 'داشبورد', icon: LayoutDashboard, end: true, bottom: true },
  { to: '/panel/calendar', label: 'تقویم روزانه', icon: CalendarDays, bottom: true },
  { to: '/panel/appointments', label: 'نوبت‌ها', icon: ClipboardList, bottom: true },
  { to: '/panel/clients', label: 'مشتریان', icon: Users, bottom: true },
  { to: '/panel/pos', label: 'پذیرش حضوری', icon: Receipt },
  { to: '/panel/services', label: 'خدمات و برنامه کاری', icon: Scissors },
  { to: '/panel/packages', label: 'بسته‌ها و اعتبار', icon: Package },
  { to: '/panel/events', label: 'رویدادها و کلاس‌ها', icon: PartyPopper },
  { to: '/panel/loyalty', label: 'باشگاه مشتریان', icon: Gift },
  { to: '/panel/support', label: 'پشتیبانی', icon: LifeBuoy },
  { to: '/panel/broadcast', label: 'پیام تلگرام', icon: Megaphone },
  { to: '/panel/settings', label: 'تنظیمات', icon: Settings },
];

function NavItems({ onNavigate, className }) {
  return (
    <ul className={className}>
      {NAV.map(({ to, label, icon, end }) => {
        const Icon = icon;
        return (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                isActive ? 'pn-nav-active bg-primary text-primary-foreground!' : 'text-foreground! hover:bg-subtle',
              )
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </NavLink>
        </li>
        );
      })}
    </ul>
  );
}

/** Portal to <body>: the visitor layout animates/transforms its subtree, which would trap `fixed` inside it. */
function Overlay({ className, children }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
  return createPortal(
    <div dir="rtl" className={cn('pn-root fixed inset-0 z-[45] bg-subtle text-foreground', className)}>
      {children}
    </div>,
    document.body,
  );
}

function Gate({ title, children }) {
  return (
    <Overlay className="grid place-items-center overflow-y-auto p-4">
      <div className={cn(card, 'w-full max-w-md space-y-4 p-6 text-center')}>
        <ShieldAlert className="mx-auto size-9 text-muted-foreground" aria-hidden="true" />
        <div role="heading" aria-level={1} className="text-lg font-bold">{title}</div>
        {children}
      </div>
    </Overlay>
  );
}

/**
 * Chrome + access guard for every /panel page. The guard only decides what to
 * render: the server stays authoritative and 403s every call a non-manager makes.
 */
export default function PanelShell({ title, description, actions, children }) {
  const membership = useMembership();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  if (membership.isLoading) {
    return (
      <Gate title="در حال بررسی دسترسی…">
        <LoadingState rows={2} />
      </Gate>
    );
  }
  if (membership.isError) {
    const status = membership.error?.status;
    if (status === 401 || status === 403 || status === undefined) {
      return (
        <Gate title="ورود همکاران">
          <p className="text-sm leading-7 text-muted-foreground">برای استفاده از پنل مدیریت ابتدا با حساب همکار یا مدیر سایت وارد شوید.</p>
          <Link to="/admin/login" className={cn(btn.primary, 'w-full')}>
            ورود به پنل
          </Link>
          <Link to="/" className="block text-xs text-muted-foreground! underline">
            بازگشت به سایت
          </Link>
        </Gate>
      );
    }
    return (
      <Gate title="پنل در دسترس نیست">
        <ErrorState error={membership.error} onRetry={() => void membership.refetch()} />
      </Gate>
    );
  }
  const member = membership.data?.membership || membership.data;
  const allowed = member?.isOwner || member?.capabilities?.includes('booking:manage');
  if (!allowed) {
    return (
      <Gate title="دسترسی کافی ندارید">
        <p className="text-sm leading-7 text-muted-foreground">برای مدیریت نوبت‌ها به دسترسی «مدیریت نوبت» نیاز است. با مدیر سایت تماس بگیرید یا با حساب دیگری وارد شوید.</p>
        <Link to="/admin/login" className={cn(btn.outline, 'w-full')}>
          ورود با حساب دیگر
        </Link>
      </Gate>
    );
  }

  const bottom = NAV.filter((item) => item.bottom);
  return (
    <Overlay className="flex">
      <Toaster position="top-center" />
      <aside className="hidden w-60 shrink-0 flex-col gap-4 border-e border-border bg-surface p-3 md:flex">
        <div className="flex items-center gap-3 px-2 pt-2">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <HeartPulse className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-tight">پنل مدیریت</p>
            <p className="text-xs text-muted-foreground">پذیرش و نوبت‌دهی</p>
          </div>
        </div>
        <nav aria-label="منوی پنل" className="min-h-0 flex-1 overflow-y-auto">
          <NavItems className="space-y-1" />
        </nav>
        <Link to="/" className="px-3 pb-1 text-xs text-muted-foreground! underline">
          مشاهده سایت
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
          <button type="button" className="grid size-9 place-items-center rounded-lg hover:bg-subtle md:hidden" aria-label="منو" onClick={() => setMoreOpen(true)}>
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <div role="heading" aria-level={1} className="truncate text-base font-bold md:text-lg">{title}</div>
            {description && <p className="hidden truncate text-xs text-muted-foreground sm:block">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-3 pb-24 sm:p-4 md:p-6 md:pb-6">
          <div key={pathname} className="mx-auto w-full max-w-7xl space-y-4">{children}</div>
        </main>
        <nav aria-label="منوی سریع" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
          {bottom.map(({ to, label, icon, end }) => {
            const Icon = icon;
            return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium', isActive ? 'text-primary!' : 'text-muted-foreground!')
              }
            >
              <Icon className="size-5" aria-hidden="true" />
              {label.split(' ')[0]}
            </NavLink>
            );
          })}
          <button type="button" className="flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground" onClick={() => setMoreOpen(true)}>
            <Menu className="size-5" aria-hidden="true" />
            بیشتر
          </button>
        </nav>
      </div>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen} direction="right">
        <SheetContent dir="rtl" className="overflow-y-auto">
          <SheetTitle>پنل مدیریت</SheetTitle>
          <SheetDescription className="sr-only">همه بخش‌های پنل</SheetDescription>
          <NavItems className="space-y-1" onNavigate={() => setMoreOpen(false)} />
          <Link to="/" className="mt-2 text-xs text-muted-foreground underline" onClick={() => setMoreOpen(false)}>
            مشاهده سایت
          </Link>
        </SheetContent>
      </Sheet>
    </Overlay>
  );
}
