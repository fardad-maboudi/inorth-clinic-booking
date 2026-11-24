import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { cancelMyBooking, listMyBookings, myCredits, rescheduleBooking } from '@/api/plugins/bookings';
import { getMyLoyalty } from '@/api/plugins/loyalty-club';
import { updateMe } from '@/api/plugins/auth';
import Modal from '@/components/site/Modal';
import SlotPicker from '@/components/site/SlotPicker';
import { PageHead, StateBox } from '@/components/site/ui';
import {
  STATUS_FA, errText, fmtFullDate, fmtShortDate, fmtTime, idOf, money, nf, normalizePhone, rowsOf,
} from '@/components/site/format';
import { announceAuthChange, useAsync, useCatalog, useSession, useTitle } from '@/components/site/hooks';

const TABS = [
  ['upcoming', 'نوبت‌های پیش‌رو'],
  ['history', 'سوابق'],
  ['credits', 'اعتبار و بسته‌ها'],
  ['loyalty', 'باشگاه مشتریان'],
  ['profile', 'پروفایل'],
];
const TIER_FA = { bronze: 'برنزی', silver: 'نقره‌ای', gold: 'طلایی', platinum: 'پلاتینیوم' };
const isActive = (b) => ['pending', 'confirmed'].includes(b.status);

function BookingRow({ b, service, staff, onCancel, onResched, readOnly, now }) {
  const hoursLeft = (new Date(b.startsAt) - now) / 36e5;
  const window = Number(service?.cancellationWindowHours ?? 24);
  const locked = hoursLeft < window;
  return (
    <li className="cl-card cl-brow">
      <div className="cl-brow-date" aria-hidden="true">
        <strong>{new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'Asia/Tehran', day: 'numeric' }).format(new Date(b.startsAt))}</strong>
        <span>{new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'Asia/Tehran', month: 'short' }).format(new Date(b.startsAt))}</span>
      </div>
      <div className="cl-brow-body">
        <h3>{service?.name || 'نوبت'}</h3>
        <p className="cl-muted">{fmtFullDate(b.startsAt)} · ساعت {fmtTime(b.startsAt)}</p>
        <p className="cl-muted cl-small">{staff ? `با ${staff.name}` : ''}{b.totalPrice ? ` · ${money(b.totalPrice, service?.currency)}` : ''}</p>
        <span className={`cl-status cl-status-${b.status}`}>{STATUS_FA[b.status] || b.status}</span>
      </div>
      {!readOnly && isActive(b) ? (
        <div className="cl-brow-actions">
          <button type="button" className="cl-btn cl-btn-outline" onClick={() => onResched(b)} disabled={locked}>جابه‌جایی</button>
          <button type="button" className="cl-btn cl-btn-danger" onClick={() => onCancel(b)} disabled={locked}>لغو نوبت</button>
        </div>
      ) : null}
      {!readOnly && isActive(b) && locked ? (
        <p className="cl-brow-note cl-small cl-muted">کمتر از {nf(window)} ساعت تا نوبت مانده است؛ برای جابه‌جایی یا لغو با کلینیک تماس بگیرید.</p>
      ) : null}
    </li>
  );
}

function Bookings({ mode }) {
  const catalog = useCatalog();
  const [now] = useState(() => Date.now());
  const q = useAsync(() => listMyBookings().then(rowsOf), []);
  const [cancelling, setCancelling] = useState(null);
  const [resched, setResched] = useState(null);
  const [newSlot, setNewSlot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ ok: '', err: '' });

  const rows = useMemo(() => {
    const all = (q.data ?? []).slice().sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    return mode === 'upcoming'
      ? all.filter((b) => isActive(b) && new Date(b.endsAt || b.startsAt) >= now)
      : all.filter((b) => !(isActive(b) && new Date(b.endsAt || b.startsAt) >= now)).reverse();
  }, [q.data, mode, now]);

  async function doCancel() {
    setBusy(true);
    setMsg({ ok: '', err: '' });
    try {
      await cancelMyBooking(idOf(cancelling), 'لغو توسط مراجع');
      setMsg({ ok: 'نوبت لغو شد.', err: '' });
      setCancelling(null);
      q.reload();
    } catch (e) {
      setMsg({ ok: '', err: errText(e, 'لغو نوبت انجام نشد.') });
      setCancelling(null);
    } finally {
      setBusy(false);
    }
  }
  async function doResched() {
    setBusy(true);
    setMsg({ ok: '', err: '' });
    try {
      await rescheduleBooking(idOf(resched), idOf(newSlot), 'جابه‌جایی توسط مراجع');
      setMsg({ ok: `نوبت به ${fmtFullDate(newSlot.startsAt)}، ساعت ${fmtTime(newSlot.startsAt)} منتقل شد.`, err: '' });
      setResched(null);
      setNewSlot(null);
      q.reload();
    } catch (e) {
      setMsg({ ok: '', err: errText(e, 'جابه‌جایی انجام نشد.') });
    } finally {
      setBusy(false);
    }
  }

  const svc = (b) => catalog.data?.services.find((s) => idOf(s) === String(b.service));
  const stf = (b) => catalog.data?.staff.find((s) => idOf(s) === String(b.resource));

  if (q.loading) return <StateBox title="در حال دریافت نوبت‌ها…" />;
  if (q.error) return <StateBox kind="error" title="نوبت‌ها دریافت نشد" text={errText(q.error)} onRetry={q.reload} />;
  return (
    <>
      {msg.ok ? <p className="cl-note cl-note-ok" role="status">{msg.ok}</p> : null}
      {msg.err ? <p className="cl-err cl-alert" role="alert">{msg.err}</p> : null}
      {rows.length ? (
        <ul className="cl-blist">
          {rows.map((b) => (
            <BookingRow key={idOf(b)} b={b} service={svc(b)} staff={stf(b)} readOnly={mode === 'history'} now={now} onCancel={setCancelling} onResched={(x) => { setResched(x); setNewSlot(null); }} />
          ))}
        </ul>
      ) : (
        <StateBox kind="empty" title={mode === 'upcoming' ? 'نوبت پیش‌رویی ندارید' : 'هنوز سابقه‌ای ثبت نشده است'}
          action={mode === 'upcoming' ? <Link className="cl-btn cl-btn-primary" to="/book">رزرو نوبت</Link> : null} />
      )}

      <Modal open={!!cancelling} onClose={() => setCancelling(null)} title="لغو نوبت">
        <p>نوبت {svc(cancelling || {})?.name} در {cancelling ? fmtShortDate(cancelling.startsAt) : ''} ساعت {cancelling ? fmtTime(cancelling.startsAt) : ''} لغو شود؟</p>
        <div className="cl-actions">
          <button type="button" className="cl-btn cl-btn-danger" onClick={doCancel} disabled={busy}>{busy ? 'در حال لغو…' : 'بله، لغو شود'}</button>
          <button type="button" className="cl-btn cl-btn-ghost" onClick={() => setCancelling(null)}>انصراف</button>
        </div>
      </Modal>

      <Modal open={!!resched} onClose={() => setResched(null)} title="جابه‌جایی نوبت" wide>
        {resched ? (
          <>
            <p className="cl-muted">زمان جدید برای «{svc(resched)?.name}» را انتخاب کنید.</p>
            <SlotPicker serviceId={String(resched.service)} resourceId={String(resched.resource) || 'any'} value={newSlot} onChange={setNewSlot} excludeSlotId={String(resched.slotId)} />
            <div className="cl-actions">
              <button type="button" className="cl-btn cl-btn-primary" onClick={doResched} disabled={!newSlot || busy}>{busy ? 'در حال انتقال…' : 'تأیید زمان جدید'}</button>
              <button type="button" className="cl-btn cl-btn-ghost" onClick={() => setResched(null)}>انصراف</button>
            </div>
          </>
        ) : null}
      </Modal>
    </>
  );
}

function Credits() {
  const catalog = useCatalog();
  const q = useAsync(() => myCredits().then(rowsOf), []);
  if (q.loading) return <StateBox title="در حال دریافت اعتبار…" />;
  if (q.error) {
    return <StateBox kind="error" title="اعتبار بسته‌ها دریافت نشد" text={q.error?.status === 404 ? 'سرویس بسته‌ها در حال حاضر در دسترس نیست.' : errText(q.error)} onRetry={q.reload} />;
  }
  if (!q.data.length) {
    return <StateBox kind="empty" title="اعتبار فعالی ندارید" text="با خرید بستهٔ چندجلسه‌ای، جلسات باقی‌ماندهٔ شما اینجا نمایش داده می‌شود." action={<Link className="cl-btn cl-btn-primary" to="/packages">مشاهدهٔ بسته‌ها</Link>} />;
  }
  return (
    <ul className="cl-blist">
      {q.data.map((c) => {
        const s = catalog.data?.services.find((x) => idOf(x) === String(c.service ?? c.serviceId ?? c.serviceIds?.[0]));
        const left = c.unlimited ? null : (c.remainingSessions ?? c.remaining ?? c.sessionsRemaining);
        const total = c.totalSessions ?? c.sessionCount ?? c.total;
        return (
          <li key={idOf(c)} className="cl-card cl-brow cl-brow-2">
            <div className="cl-brow-body">
              <h3>{c.name || c.packageName || c.grantReason || s?.package?.name || s?.name}</h3>
              <p className="cl-muted">{c.unlimited ? 'جلسات نامحدود' : left != null ? `${nf(left)} جلسه باقی‌مانده${total ? ` از ${nf(total)}` : ''}` : ''}{c.expiresAt ? ` · اعتبار تا ${fmtShortDate(c.expiresAt)}` : ''}</p>
            </div>
            {s ? <Link className="cl-btn cl-btn-outline" to={`/book?service=${idOf(s)}`}>رزرو با اعتبار</Link> : null}
          </li>
        );
      })}
    </ul>
  );
}

function Loyalty() {
  const q = useAsync(() => getMyLoyalty(), []);
  if (q.loading) return <StateBox title="در حال دریافت امتیازها…" />;
  if (q.error) return <StateBox kind="error" title="اطلاعات باشگاه دریافت نشد" text={q.error?.status === 404 ? 'باشگاه مشتریان برای این کلینیک فعال نیست.' : errText(q.error)} onRetry={q.reload} />;
  const m = q.data?.member ?? q.data;
  if (!m || m.points == null) return <StateBox kind="empty" title="هنوز عضو باشگاه نیستید" text="با اولین پرداخت، عضویت شما به‌صورت خودکار ثبت می‌شود." />;
  const left = Number(q.data?.pointsToNextTier ?? 0);
  const pct = left > 0 ? Math.min(100, Math.round((Number(m.points) / (Number(m.points) + left)) * 100)) : 100;
  const ledger = q.data?.ledger ?? [];
  return (
    <div className="cl-loyalty">
      <div className="cl-card cl-tiercard">
        <p className="cl-tier-k">سطح عضویت</p>
        <p className="cl-tier-v">{TIER_FA[m.tier] || m.tier || '—'}</p>
        <p className="cl-tier-pts"><strong>{nf(m.points)}</strong> امتیاز</p>
        <div className="cl-meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="پیشرفت تا سطح بعد"><span style={{ width: `${pct}%` }} /></div>
        <p className="cl-small">{left > 0 ? `${nf(left)} امتیاز تا سطح ${TIER_FA[q.data?.nextTier] || 'بعدی'}` : 'بالاترین سطح'}</p>
      </div>
      <div className="cl-card">
        <h3>تاریخچهٔ امتیاز</h3>
        {ledger.length ? (
          <ul className="cl-ledger">
            {ledger.map((l) => (
              <li key={idOf(l)}>
                <span>{l.note || 'امتیاز'}<small className="cl-muted"> · {fmtShortDate(l.created_at || l.createdAt)}</small></span>
                <strong className={l.kind === 'redeem' ? 'neg' : 'pos'}>{l.kind === 'redeem' ? '−' : '+'}{nf(Math.abs(l.points))}</strong>
              </li>
            ))}
          </ul>
        ) : <p className="cl-muted">هنوز تراکنشی ثبت نشده است.</p>}
        <p className="cl-muted cl-small">مجموع خرید شما: {nf(Math.round(Number(m.lifetimeSpend || 0) / 10))} تومان</p>
      </div>
    </div>
  );
}

function Profile({ user }) {
  const [name, setName] = useState(user.name || user.fullName || '');
  const [state, setState] = useState({ busy: false, ok: '', err: '' });
  async function save(e) {
    e.preventDefault();
    setState({ busy: true, ok: '', err: '' });
    try {
      await updateMe({ name: name.trim() });
      announceAuthChange();
      setState({ busy: false, ok: 'پروفایل ذخیره شد.', err: '' });
    } catch (err) {
      setState({ busy: false, ok: '', err: errText(err, 'ذخیرهٔ پروفایل انجام نشد.') });
    }
  }
  return (
    <form className="cl-card cl-narrow" onSubmit={save}>
      <div className="cl-fields">
        <label className="cl-field"><span>نام و نام خانوادگی</span>
          <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="cl-field"><span>شمارهٔ موبایل</span>
          <input dir="ltr" value={normalizePhone(user.phoneNumber) || user.phoneNumber || ''} readOnly aria-readonly="true" />
          <small className="cl-muted">شمارهٔ ورود قابل ویرایش نیست.</small>
        </label>
      </div>
      {state.ok ? <p className="cl-note cl-note-ok" role="status">{state.ok}</p> : null}
      {state.err ? <p className="cl-err cl-alert" role="alert">{state.err}</p> : null}
      <div className="cl-actions"><button className="cl-btn cl-btn-primary" disabled={state.busy}>{state.busy ? 'در حال ذخیره…' : 'ذخیرهٔ تغییرات'}</button></div>
    </form>
  );
}

export default function ClientPage() {
  useTitle('حساب من');
  const { user, loading } = useSession();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'upcoming';

  if (loading) return <div className="cl-wrap cl-section"><StateBox /></div>;
  if (!user) {
    return (
      <div className="cl-wrap cl-section cl-narrow">
        <StateBox kind="empty" title="برای دیدن حساب خود وارد شوید" text="با شمارهٔ موبایل و کد پیامکی وارد شوید تا نوبت‌ها، بسته‌ها و امتیازهایتان را ببینید."
          action={<Link className="cl-btn cl-btn-primary" to="/auth/login?next=/client">ورود با پیامک</Link>} />
      </div>
    );
  }
  const onKey = (e) => {
    const i = TABS.findIndex(([k]) => k === tab);
    const next = e.key === 'ArrowLeft' ? i + 1 : e.key === 'ArrowRight' ? i - 1 : null;
    if (next == null) return;
    const [k] = TABS[(next + TABS.length) % TABS.length];
    setParams({ tab: k });
    document.getElementById('cl-tab-' + k)?.focus();
  };
  return (
    <>
      <PageHead eyebrow="پنل مراجع" title={user.name ? `سلام، ${user.name}` : 'حساب من'} lead="نوبت‌ها، اعتبار بسته‌ها و امتیازهای خود را اینجا مدیریت کنید." />
      <div className="cl-wrap cl-section">
        <div className="cl-tabs" role="tablist" aria-label="بخش‌های حساب" onKeyDown={onKey}>
          {TABS.map(([k, label]) => (
            <button key={k} id={'cl-tab-' + k} role="tab" type="button" aria-selected={tab === k} aria-controls="cl-panel" tabIndex={tab === k ? 0 : -1} className={tab === k ? 'on' : ''} onClick={() => setParams({ tab: k })}>
              {label}
            </button>
          ))}
        </div>
        <div id="cl-panel" role="tabpanel" aria-labelledby={'cl-tab-' + tab} className="cl-tabpanel">
          {tab === 'upcoming' || tab === 'history' ? <Bookings mode={tab} key={tab} /> : null}
          {tab === 'credits' ? <Credits /> : null}
          {tab === 'loyalty' ? <Loyalty /> : null}
          {tab === 'profile' ? <Profile user={user} /> : null}
        </div>
        <p className="cl-muted cl-small cl-gap">نیاز به کمک دارید؟ <Link to="/support/tickets">ارسال درخواست به پشتیبانی</Link></p>
      </div>
    </>
  );
}
