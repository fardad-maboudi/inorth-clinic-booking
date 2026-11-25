import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, CalendarClock, CheckCircle2, Clock, Wallet } from 'lucide-react';
import BookingDrawer from '@/components/panel/BookingDrawer';
import PanelShell from '@/components/panel/PanelShell';
import { useBookings, useLookups, usePanelMutation } from '@/components/panel/data';
import { confirmBooking } from '@/api/backoffice/bookings';
import { addDays, dayKey, fa, idOf, isLive, jalaliLong, timeLabel, todayKey, toToman } from '@/components/panel/format';
import { btn } from '@/components/panel/styles';
import { Card, EmptyState, QueryBoundary, SectionTitle, StatCard, StatusBadge } from '@/components/panel/ui';

function Line({ booking, lookups, onOpen, trailing }) {
  const service = lookups.services.get(String(booking.service));
  const resource = lookups.resources.get(String(booking.resource));
  return (
    <li className="flex items-center gap-3 border-b border-border py-2.5 last:border-0">
      <button type="button" onClick={() => onOpen(booking)} className="flex min-w-0 flex-1 items-center gap-3 text-start">
        <span className="w-14 shrink-0 text-sm font-bold">{timeLabel(booking.startsAt)}</span>
        <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: resource?.color || 'var(--border)' }} aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{booking.customerName}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {service?.name || 'خدمت'} · {resource?.name || '—'}
          </span>
        </span>
      </button>
      {trailing || <StatusBadge status={booking.status} />}
    </li>
  );
}

export default function PanelDashboard() {
  const bookings = useBookings();
  const lookups = useLookups();
  const [selected, setSelected] = useState(null);
  const confirm = usePanelMutation((id) => confirmBooking(id), { success: 'نوبت تأیید شد' });
  const today = todayKey();
  const rows = bookings.data?.rows || [];
  const live = rows.filter(isLive);
  const todays = live.filter((b) => dayKey(b.startsAt) === today).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  const pending = live.filter((b) => b.status === 'pending').sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  const weekEnd = addDays(today, 7);
  const noShowsWeek = rows.filter((b) => b.status === 'no_show' && dayKey(b.startsAt) >= addDays(today, -7)).length;
  const noShowsToday = todays.filter((b) => b.status === 'no_show').length;
  const earned = todays.filter((b) => b.status === 'completed').reduce((sum, b) => sum + toToman(b.price ?? b.totalPrice), 0);
  const expected = todays.filter((b) => b.status !== 'no_show').reduce((sum, b) => sum + toToman(b.price ?? b.totalPrice), 0);
  const upcoming = live
    .filter((b) => new Date(b.startsAt) > new Date() && dayKey(b.startsAt) > today && dayKey(b.startsAt) <= weekEnd && b.status !== 'completed')
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
    .slice(0, 8);
  const doneToday = todays.filter((b) => b.status === 'completed').length;

  return (
    <PanelShell
      title="داشبورد"
      description={jalaliLong(today)}
      actions={
        <Link to="/panel/pos" className={btn.primary}>
          پذیرش حضوری
        </Link>
      }
    >
      <QueryBoundary query={bookings} rows={6}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="نوبت‌های امروز" value={fa(todays.length)} hint={`${fa(doneToday)} انجام‌شده`} icon={CalendarClock} />
          <StatCard label="در صف تأیید" value={fa(pending.length)} hint="منتظر تصمیم پذیرش" tone={pending.length ? 'warn' : 'default'} icon={Clock} />
          <StatCard label="عدم حضور" value={fa(noShowsToday)} hint={`${fa(noShowsWeek)} مورد در هفته گذشته`} tone={noShowsToday ? 'bad' : 'default'} icon={AlertOctagon} />
          <StatCard label="درآمد امروز" value={`${fa(earned)}`} hint={`تومان · پیش‌بینی ${fa(expected)}`} tone="good" icon={Wallet} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <SectionTitle
              title="برنامه امروز"
              hint="به ترتیب ساعت؛ برای عملیات روی نوبت کلیک کنید"
              actions={
                <Link to="/panel/calendar" className={`${btn.outline} ${btn.sm}`}>
                  تقویم کامل
                </Link>
              }
            />
            {todays.length ? (
              <ul>
                {todays.map((b) => (
                  <Line key={idOf(b)} booking={b} lookups={lookups} onOpen={setSelected} />
                ))}
              </ul>
            ) : (
              <EmptyState icon={CheckCircle2} title="امروز نوبتی ثبت نشده است" hint="نوبت‌های حضوری را از بخش پذیرش حضوری ثبت کنید." />
            )}
          </Card>

          <div className="space-y-4">
            <Card>
              <SectionTitle
                title="صف تأیید"
                hint={pending.length ? `${fa(pending.length)} نوبت منتظر تأیید` : undefined}
                actions={
                  <Link to="/panel/appointments" className={`${btn.outline} ${btn.sm}`}>
                    همه نوبت‌ها
                  </Link>
                }
              />
              {pending.length ? (
                <ul>
                  {pending.slice(0, 5).map((b) => (
                    <Line
                      key={idOf(b)}
                      booking={b}
                      lookups={lookups}
                      onOpen={setSelected}
                      trailing={
                        <button type="button" className={`${btn.primary} ${btn.sm}`} disabled={confirm.isPending} onClick={() => confirm.mutate(idOf(b))}>
                          تأیید
                        </button>
                      }
                    />
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">صف تأیید خالی است.</p>
              )}
            </Card>
            <Card>
              <SectionTitle title="نوبت‌های پیش‌رو" hint="هفت روز آینده" />
              {upcoming.length ? (
                <ul>
                  {upcoming.map((b) => (
                    <li key={idOf(b)} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0">
                      <button type="button" className="min-w-0 text-start" onClick={() => setSelected(b)}>
                        <span className="block truncate font-medium">{b.customerName}</span>
                        <span className="block text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'Asia/Tehran', weekday: 'short', day: 'numeric', month: 'long' }).format(new Date(b.startsAt))} · {timeLabel(b.startsAt)}
                        </span>
                      </button>
                      <StatusBadge status={b.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">نوبت پیش‌رویی وجود ندارد.</p>
              )}
            </Card>
          </div>
        </div>
      </QueryBoundary>
      {selected && <BookingDrawer booking={selected} lookups={lookups} onClose={() => setSelected(null)} />}
    </PanelShell>
  );
}
