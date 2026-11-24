import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { bookSlot, listSlots, myCredits } from '@/api/plugins/bookings';
import SlotPicker from './SlotPicker';
import { Avatar, ServiceIcon, SkeletonGrid, StateBox } from './ui';
import { durationLabel, errText, fmtFullDate, fmtTime, idOf, money, nf, normalizePhone, rowsOf } from './format';
import { useCatalog, useSession } from './hooks';

const STEPS = [
  ['service', 'خدمت'],
  ['staff', 'متخصص'],
  ['time', 'زمان'],
  ['details', 'مشخصات'],
];

function icsFor({ service, staff, slot }) {
  const z = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Niloofar Clinic//FA',
    'BEGIN:VEVENT',
    `UID:${idOf(slot)}@niloofar-clinic`,
    `DTSTAMP:${z(new Date().toISOString())}`,
    `DTSTART:${z(slot.startsAt)}`,
    `DTEND:${z(slot.endsAt)}`,
    `SUMMARY:${service.name}${staff ? ' - ' + staff.name : ''}`,
    'LOCATION:کلینیک زیبایی نیلوفر',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export default function BookingFlow() {
  const catalog = useCatalog();
  const { user } = useSession();
  const location = useLocation();
  const [params] = useSearchParams();
  const initialSlot = location.state?.slot;
  const slotParam = params.get('slot');
  const [serviceId, setServiceId] = useState(params.get('service') || '');
  const [staffId, setStaffId] = useState(params.get('staff') || '');
  const [slot, setSlot] = useState(initialSlot || null);
  const [step, setStep] = useState(params.get('service') ? (initialSlot || slotParam ? 'details' : (params.get('staff') ? 'time' : 'staff')) : 'service');
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setForm((f) => ({ ...f, name: f.name || user.name || user.fullName || '', phone: f.phone || normalizePhone(user.phoneNumber) || '' }));
    }
  }
  const [useCredit, setUseCredit] = useState(true);
  const [credits, setCredits] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErr, setFieldErr] = useState({});
  const [done, setDone] = useState(null);
  const top = useRef(null);

  const services = catalog.data?.services ?? [];
  const staffAll = useMemo(() => catalog.data?.staff ?? [], [catalog.data]);
  const service = services.find((s) => idOf(s) === serviceId);
  const eligible = useMemo(
    () => staffAll.filter((p) => !service?.resourceIds?.length || service.resourceIds.includes(idOf(p))),
    [staffAll, service],
  );
  const chosenStaff = slot ? staffAll.find((p) => idOf(p) === String(slot.resource)) : staffAll.find((p) => idOf(p) === staffId);
  const credit = service ? credits.find((c) => String(c.service ?? c.serviceId) === serviceId || c.serviceIds?.map(String).includes(serviceId)) : null;

  useEffect(() => {
    if (user) {





      myCredits()
        .then((r) => setCredits(rowsOf(r).filter((c) => (c.unlimited || (c.remainingSessions ?? c.remaining ?? 1) > 0) && c.status !== 'expired')))
        .catch(() => setCredits([]));
    }
  }, [user]);

  useEffect(() => {
    if (slotParam && !slot && serviceId) {
      listSlots({ serviceId, resourceId: staffId === 'any' ? undefined : staffId })
        .then((r) => {
          const found = rowsOf(r).find((s) => idOf(s) === slotParam || s.startsAt === slotParam);
          if (found) {
            setSlot(found);
            setStep('details');
          }
        })
        .catch(() => {});
    }
  }, [slotParam, serviceId, staffId, slot]);

  useEffect(() => {
    top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [step]);

  const view = step !== 'done' && !service ? 'service' : step;
  const idx = STEPS.findIndex(([k]) => k === view);

  function pickService(id) {
    setServiceId(id);
    setStaffId('');
    setSlot(null);
    setStep('staff');
  }
  function pickStaff(id) {
    setStaffId(id);
    setSlot(null);
    setStep('time');
  }

  async function submit(e) {
    e.preventDefault();
    const phone = normalizePhone(form.phone);
    const fe = {};
    if (form.name.trim().length < 3) fe.name = 'نام و نام خانوادگی را وارد کنید.';
    if (!phone) fe.phone = 'شمارهٔ موبایل معتبر وارد کنید (مثل ۰۹۱۲۱۲۳۴۵۶۷).';
    setFieldErr(fe);
    if (Object.keys(fe).length) return;
    setBusy(true);
    setError('');
    try {
      const body = {
        slotId: idOf(slot),
        customerName: form.name.trim(),
        customerPhone: phone,
        customerEmail: form.email.trim() || undefined,
        notes: form.notes.trim() || undefined,
        creditId: credit && useCredit ? idOf(credit) : undefined,
      };
      const booking = await bookSlot(body);
      setDone({ booking, slot, service, staff: chosenStaff });
      setStep('done');
    } catch (err) {
      setError(
        err?.status === 409
          ? 'این زمان همین الان رزرو شد. لطفاً زمان دیگری انتخاب کنید.'
          : errText(err, 'ثبت نوبت انجام نشد. دوباره تلاش کنید.'),
      );
      if (err?.status === 409) {
        setSlot(null);
        setStep('time');
      }
    } finally {
      setBusy(false);
    }
  }

  if (catalog.loading) return <div className="cl-wrap cl-section"><SkeletonGrid /></div>;
  if (catalog.error) {
    return <div className="cl-wrap cl-section"><StateBox kind="error" title="خدمات دریافت نشد" text={errText(catalog.error)} onRetry={catalog.reload} /></div>;
  }
  if (!services.length) return <div className="cl-wrap cl-section"><StateBox kind="empty" title="هنوز خدمتی برای رزرو ثبت نشده است" /></div>;

  if (step === 'done' && done) {
    const { slot: s, service: sv, staff: st } = done;
    const download = () => {
      const url = URL.createObjectURL(new Blob([icsFor({ service: sv, staff: st, slot: s })], { type: 'text/calendar' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'niloofar-booking.ics';
      a.click();
      URL.revokeObjectURL(url);
    };
    return (
      <div className="cl-wrap cl-section cl-narrow" ref={top}>
        <div className="cl-card cl-confirm" role="status" aria-live="polite">
          <span className="cl-check" aria-hidden="true">✓</span>
          <h1>نوبت شما ثبت شد</h1>
          <p className="cl-muted">
            {done.booking?.status === 'pending' ? 'پس از تأیید کلینیک به شما اطلاع می‌دهیم.' : 'نوبت شما تأیید شده است. منتظر دیدار شما هستیم.'}
          </p>
          <dl className="cl-summary">
            <div><dt>خدمت</dt><dd>{sv.name}</dd></div>
            {st ? <div><dt>متخصص</dt><dd>{st.name}</dd></div> : null}
            <div><dt>روز</dt><dd>{fmtFullDate(s.startsAt)}</dd></div>
            <div><dt>ساعت</dt><dd>{fmtTime(s.startsAt)} تا {fmtTime(s.endsAt)}</dd></div>
            <div><dt>هزینه</dt><dd>{credit && useCredit ? 'از اعتبار بستهٔ شما کسر شد' : `${money(sv.price, sv.currency)} (پرداخت در کلینیک)`}</dd></div>
          </dl>
          <div className="cl-actions">
            <Link className="cl-btn cl-btn-primary" to="/client">مشاهدهٔ نوبت‌های من</Link>
            <button type="button" className="cl-btn cl-btn-outline" onClick={download}>افزودن به تقویم</button>
            <Link className="cl-btn cl-btn-ghost" to="/">بازگشت به خانه</Link>
          </div>
          {!user ? <p className="cl-muted cl-small">برای مدیریت، جابه‌جایی یا لغو نوبت با همین شماره <Link to="/auth/login?next=/client">وارد شوید</Link>.</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="cl-wrap cl-section" ref={top} style={{ scrollMarginTop: 90 }}>
      <ol className="cl-steps" aria-label="مراحل رزرو">
        {STEPS.map(([k, label], i) => (
          <li key={k} className={i < idx ? 'done' : i === idx ? 'cur' : ''} aria-current={i === idx ? 'step' : undefined}>
            <span className="cl-steps-n">{i < idx ? '✓' : nf(i + 1)}</span>
            <span className="cl-steps-l">{label}</span>
          </li>
        ))}
      </ol>

      <div className="cl-book">
        <section className="cl-book-main" aria-live="polite">
          {view === 'service' && (
            <>
              <h2>کدام خدمت را می‌خواهید؟</h2>
              <ul className="cl-opts">
                {services.map((s) => (
                  <li key={idOf(s)}>
                    <button type="button" className="cl-opt" onClick={() => pickService(idOf(s))}>
                      <ServiceIcon group={s.group} color={s.color} />
                      <span className="cl-opt-body">
                        <strong>{s.name}</strong>
                        <span className="cl-muted cl-small">{durationLabel(s.durationMinutes)} · {s.group}</span>
                      </span>
                      <span className="cl-opt-price">{money(s.price, s.currency)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {view === 'staff' && service && (
            <>
              <h2>با کدام متخصص؟</h2>
              <ul className="cl-opts">
                <li>
                  <button type="button" className="cl-opt" onClick={() => pickStaff('any')}>
                    <span className="cl-avatar cl-avatar-any" style={{ width: 52, height: 52 }} aria-hidden="true">✦</span>
                    <span className="cl-opt-body">
                      <strong>هر متخصصِ آزاد</strong>
                      <span className="cl-muted cl-small">نزدیک‌ترین زمان خالی را پیدا می‌کنیم</span>
                    </span>
                  </button>
                </li>
                {eligible.map((p) => (
                  <li key={idOf(p)}>
                    <button type="button" className="cl-opt" onClick={() => pickStaff(idOf(p))}>
                      <Avatar name={p.name} color={p.color} size={52} />
                      <span className="cl-opt-body">
                        <strong>{p.name}</strong>
                        <span className="cl-muted cl-small">{p.title}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {!eligible.length ? <StateBox kind="empty" title="برای این خدمت متخصصی تعریف نشده است" /> : null}
              <div className="cl-actions"><button type="button" className="cl-btn cl-btn-ghost" onClick={() => setStep('service')}>‹ تغییر خدمت</button></div>
            </>
          )}

          {view === 'time' && service && (
            <>
              <h2>چه زمانی؟</h2>
              <SlotPicker serviceId={serviceId} resourceId={staffId || 'any'} value={slot} onChange={setSlot} />
              <div className="cl-actions">
                <button type="button" className="cl-btn cl-btn-ghost" onClick={() => setStep('staff')}>‹ تغییر متخصص</button>
                <button type="button" className="cl-btn cl-btn-primary" disabled={!slot} onClick={() => setStep('details')}>ادامه</button>
              </div>
            </>
          )}

          {view === 'details' && service && slot && (
            <form onSubmit={submit} noValidate>
              <h2>مشخصات شما</h2>
              {user ? <p className="cl-note">با حساب خود وارد شده‌اید؛ این نوبت در «حساب من» ثبت می‌شود.</p> : (
                <p className="cl-note">بدون ثبت‌نام هم می‌توانید نوبت بگیرید. <Link to="/auth/login?next=/book">ورود با پیامک</Link> برای مدیریت آسان‌تر نوبت‌ها.</p>
              )}
              <div className="cl-fields">
                <label className="cl-field">
                  <span>نام و نام خانوادگی</span>
                  <input autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!fieldErr.name} aria-describedby="e-name" required />
                  {fieldErr.name ? <em id="e-name" className="cl-err">{fieldErr.name}</em> : null}
                </label>
                <label className="cl-field">
                  <span>شمارهٔ موبایل</span>
                  <input dir="ltr" inputMode="tel" autoComplete="tel" placeholder="09121234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} aria-invalid={!!fieldErr.phone} aria-describedby="e-phone" required />
                  {fieldErr.phone ? <em id="e-phone" className="cl-err">{fieldErr.phone}</em> : null}
                </label>
                <label className="cl-field">
                  <span>ایمیل (اختیاری)</span>
                  <input dir="ltr" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </label>
                <label className="cl-field cl-field-wide">
                  <span>توضیحات (اختیاری)</span>
                  <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="حساسیت دارویی، سؤال یا درخواست خاص…" />
                </label>
              </div>
              {credit ? (
                <label className="cl-check-row">
                  <input type="checkbox" checked={useCredit} onChange={(e) => setUseCredit(e.target.checked)} />
                  <span>استفاده از اعتبار بسته ({nf(credit.remainingSessions ?? credit.remaining ?? 1)} جلسه باقی‌مانده)</span>
                </label>
              ) : null}
              {error ? <p className="cl-err cl-alert" role="alert">{error}</p> : null}
              <div className="cl-actions">
                <button type="button" className="cl-btn cl-btn-ghost" onClick={() => setStep('time')}>‹ تغییر زمان</button>
                <button type="submit" className="cl-btn cl-btn-primary" disabled={busy}>{busy ? 'در حال ثبت…' : 'ثبت نهایی نوبت'}</button>
              </div>
            </form>
          )}
        </section>

        {service ? <aside className="cl-book-side" aria-label="خلاصهٔ رزرو">
          <div className="cl-card cl-sticky">
            <h3>خلاصهٔ نوبت</h3>
            {service ? (
              <dl className="cl-summary">
                <div><dt>خدمت</dt><dd>{service.name}</dd></div>
                <div><dt>مدت</dt><dd>{durationLabel(service.durationMinutes)}</dd></div>
                <div><dt>متخصص</dt><dd>{chosenStaff ? chosenStaff.name : staffId === 'any' ? 'هر متخصصِ آزاد' : '—'}</dd></div>
                <div><dt>زمان</dt><dd>{slot ? `${fmtFullDate(slot.startsAt)}، ${fmtTime(slot.startsAt)}` : '—'}</dd></div>
                <div className="cl-total"><dt>هزینه</dt><dd>{view === 'details' && credit && useCredit ? 'از اعتبار بسته' : money(service.price, service.currency)}</dd></div>
              </dl>
            ) : <p className="cl-muted">هنوز چیزی انتخاب نشده است.</p>}
            <p className="cl-muted cl-small">لغو یا جابه‌جایی تا ۲۴ ساعت قبل از نوبت رایگان است.</p>
          </div>
        </aside> : null}
      </div>
    </div>
  );
}
