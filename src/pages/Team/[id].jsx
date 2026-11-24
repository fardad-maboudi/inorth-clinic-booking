import { Link, useParams } from 'react-router-dom';
import { listSlots } from '@/api/plugins/bookings';
import { Avatar, ServiceIcon, StateBox } from '@/components/site/ui';
import { dayKey, durationLabel, errText, fmtFullDate, fmtTime, idOf, money, rowsOf } from '@/components/site/format';
import { useAsync, useCatalog, useTitle } from '@/components/site/hooks';

function NextSlots({ staffId }) {
  const q = useAsync(() => listSlots({ resourceId: staffId }).then(rowsOf), [staffId]);
  if (q.loading) return <StateBox title="در حال دریافت زمان‌های خالی…" />;
  if (q.error) return <StateBox kind="error" title="زمان‌های خالی دریافت نشد" text={errText(q.error)} onRetry={q.reload} />;
  const rows = q.data.filter((s) => s.available !== false).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  if (!rows.length) return <StateBox kind="empty" title="فعلاً زمان خالی ندارد" text="چند روز دیگر دوباره سر بزنید یا با متخصص دیگری نوبت بگیرید." />;
  const days = new Map();
  for (const s of rows) {
    const k = dayKey(s.startsAt);
    days.set(k, [...(days.get(k) ?? []), s]);
  }
  return (
    <div className="cl-nextslots">
      {[...days.entries()].slice(0, 3).map(([k, list]) => (
        <div key={k} className="cl-card p-5 rounded-2xl flex flex-col justify-between gap-3">
          <h3 className="text-base font-bold text-neutral-900 m-0">{fmtFullDate(list[0].startsAt)}</h3>
          <p className="cl-times cl-times-sm m-0 my-1">
            {list.slice(0, 8).map((s) => (
              <Link
                key={idOf(s)}
                className="cl-time tabular-nums font-semibold"
                to={`/book?service=${s.service}&staff=${staffId}`}
                aria-label={`رزرو ${fmtTime(s.startsAt)} – ${s.title}`}
              >
                {fmtTime(s.startsAt)}
              </Link>
            ))}
          </p>
          <p className="cl-muted cl-small text-xs text-neutral-500 m-0 mt-1 leading-normal">
            {[...new Set(list.map((s) => s.title))].join('، ')}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function TeamProfile() {
  const { id } = useParams();
  const { data, loading, error, reload } = useCatalog();
  const person = data?.staff.find((p) => idOf(p) === id);
  useTitle(person?.name || 'متخصص');
  if (loading) return <div className="cl-wrap cl-section"><StateBox /></div>;
  if (error) return <div className="cl-wrap cl-section"><StateBox kind="error" title="اطلاعات متخصص دریافت نشد" text={errText(error)} onRetry={reload} /></div>;
  if (!person) {
    return <div className="cl-wrap cl-section"><StateBox kind="empty" title="این متخصص پیدا نشد" action={<Link className="cl-btn cl-btn-primary" to="/team">تیم متخصصان</Link>} /></div>;
  }
  const services = data.services.filter((s) => s.resourceIds?.includes(idOf(person)));
  return (
    <>
      <header className="cl-pagehead cl-profile-head">
        <div className="cl-wrap cl-profile flex items-center gap-5 sm:gap-6">
          <Avatar name={person.name} color={person.color} size={96} />
          <div>
            <p className="cl-eyebrow mb-1.5"><Link to="/team">‹ تیم متخصصان</Link></p>
            <h1>{person.name}</h1>
            <p className="cl-person-title mt-1.5">{person.title}</p>
            <p className="cl-lead mt-2.5">{person.bio}</p>
          </div>
        </div>
      </header>
      <div className="cl-wrap cl-section">
        <h3 className="text-lg font-bold tracking-tight text-neutral-900 mb-3.5">
          خدمات {person.name}
        </h3>
        {services.length ? (
          <ul className="cl-opts">
            {services.map((s) => (
              <li key={idOf(s)}>
                <Link className="cl-opt" to={`/book?service=${idOf(s)}&staff=${idOf(person)}`}>
                  <ServiceIcon group={s.group} color={s.color} />
                  <span className="cl-opt-body flex flex-col gap-1">
                    <strong>{s.name}</strong>
                    <span className="cl-muted cl-small">{durationLabel(s.durationMinutes)}</span>
                  </span>
                  <span className="cl-opt-price tabular-nums font-semibold">{money(s.price, s.currency)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <StateBox kind="empty" title="خدمتی برای این متخصص ثبت نشده است" />}
        <h3 className="cl-gap mt-10 sm:mt-12 mb-3.5 text-lg font-bold tracking-tight text-neutral-900">
          نزدیک‌ترین زمان‌های خالی
        </h3>
        <NextSlots staffId={idOf(person)} />
      </div>
    </>
  );
}
