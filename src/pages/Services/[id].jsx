import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Reviews from '@/components/site/Reviews';
import { Avatar, PageHead, ServiceIcon, StateBox } from '@/components/site/ui';
import { durationLabel, errText, idOf, money, nf } from '@/components/site/format';
import { useCatalog, useTitle } from '@/components/site/hooks';

export default function ServiceDetail() {
  const { id } = useParams();
  const { data, loading, error, reload } = useCatalog();
  const service = data?.services.find((s) => idOf(s) === id);
  useTitle(service?.name || 'خدمت');

  if (loading) return <div className="cl-wrap cl-section"><StateBox /></div>;
  if (error) return <div className="cl-wrap cl-section"><StateBox kind="error" title="اطلاعات خدمت دریافت نشد" text={errText(error)} onRetry={reload} /></div>;
  if (!service) {
    return (
      <div className="cl-wrap cl-section">
        <StateBox kind="empty" title="این خدمت پیدا نشد" text="ممکن است حذف یا غیرفعال شده باشد." action={<Link className="cl-btn cl-btn-primary" to="/services">همهٔ خدمات</Link>} />
      </div>
    );
  }
  const staff = data.staff.filter((p) => !service.resourceIds?.length || service.resourceIds.includes(idOf(p)));
  const pkg = service.package?.enabled ? service.package : null;
  return (
    <>
      <PageHead eyebrow={<Link to="/services">‹ خدمات</Link>} title={service.name} lead={service.description} />
      <div className="cl-wrap cl-section cl-detail">
        <div className="cl-detail-main">
          <div className="cl-card cl-facts">
            <ServiceIcon group={service.group} color={service.color} />
            <dl className="cl-meta cl-meta-lg">
              <div><dt>مدت جلسه</dt><dd>{durationLabel(service.durationMinutes)}</dd></div>
              <div><dt>هزینه</dt><dd>{money(service.price, service.currency)}</dd></div>
              <div><dt>دسته</dt><dd>{service.group || '—'}</dd></div>
              <div><dt>نحوهٔ برگزاری</dt><dd>حضوری در کلینیک</dd></div>
            </dl>
          </div>

          <h2>متخصصان این خدمت</h2>
          {staff.length ? (
            <ul className="cl-opts">
              {staff.map((p) => (
                <li key={idOf(p)}>
                  <Link className="cl-opt" to={`/team/${idOf(p)}`}>
                    <Avatar name={p.name} color={p.color} size={52} />
                    <span className="cl-opt-body"><strong>{p.name}</strong><span className="cl-muted cl-small">{p.title}</span></span>
                    <span className="cl-opt-go" aria-hidden="true"><ChevronLeft size={18} strokeWidth={2.4} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <StateBox kind="empty" title="متخصصی برای این خدمت تعریف نشده است" />}

          <h2>نظرات مراجعان</h2>
          <Reviews targetIds={[idOf(service), 'clinic']} limit={4} />
        </div>

        <aside className="cl-detail-side">
          <div className="cl-card cl-sticky">
            <h3>رزرو این خدمت</h3>
            <p className="cl-price">{money(service.price, service.currency)}</p>
            <p className="cl-muted cl-small">پرداخت در کلینیک و لغو رایگان تا ۲۴ ساعت قبل</p>
            <Link className="cl-btn cl-btn-primary cl-btn-block" to={`/book?service=${idOf(service)}`}>انتخاب زمان</Link>
            {pkg ? (
              <div className="cl-pkg-mini">
                <p className="cl-badge">{pkg.name}</p>
                <p>{nf(pkg.sessionCount)} جلسه با {money(pkg.price, service.currency)}</p>
                <Link to="/packages" className="cl-more" style={{ fontSize: '0.88rem' }}>
                  <span>مشاهدهٔ بسته</span>
                  <ChevronLeft size={16} strokeWidth={2.4} aria-hidden="true" className="cl-more-arrow" />
                </Link>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </>
  );
}
