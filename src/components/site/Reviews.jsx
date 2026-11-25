import { listApprovedReviews } from '@/api/plugins/reviews';
import { Avatar, Stars, StateBox } from './ui';
import { fmtShortDate, idOf, nf, rowsOf } from './format';
import { useAsync } from './hooks';

/** Approved reviews for one or many targets (service ids). */
async function fetchReviews(targetIds, limit = 6) {
  const lists = await Promise.all(
    targetIds.map((t) => listApprovedReviews(t, { limit }).then(rowsOf).catch(() => [])),
  );
  const seen = new Set();
  return lists
    .flat()
    .filter((r) => (seen.has(idOf(r)) ? false : seen.add(idOf(r))))
    .sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0))
    .slice(0, limit);
}

export function ReviewCard({ review }) {
  const author = review.authorName || review.name || 'مراجع کلینیک';
  const date = review.created_at || review.createdAt;

  return (
    <figure className="cl-card cl-review">
      <div className="cl-review-top">
        <Stars value={review.rating} />
        <span className="cl-review-quote-mark" aria-hidden="true">“</span>
      </div>

      {review.title ? <strong className="cl-review-title">{review.title}</strong> : null}

      <blockquote className="cl-review-quote">
        <p>{review.body || review.comment}</p>
      </blockquote>

      <figcaption className="cl-review-author">
        <Avatar name={author} color="var(--color-brand-600)" size={42} />
        <div className="cl-review-author-info">
          <span className="cl-review-author-name">{author}</span>
          <div className="cl-review-author-meta">
            <span className="cl-review-verified">
              <span className="cl-review-check" aria-hidden="true">✓</span>
              <span>مراجع تأییدشده</span>
            </span>
            {date ? (
              <>
                <span className="cl-review-sep" aria-hidden="true">·</span>
                <time dateTime={date} className="cl-review-date">{fmtShortDate(date)}</time>
              </>
            ) : null}
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Reviews({ targetIds, limit = 6, emptyText }) {
  const q = useAsync(() => fetchReviews(targetIds, limit), [targetIds.join(',')]);
  if (q.loading) return <StateBox title="در حال دریافت نظرات…" className="cl-reviews-empty" />;
  if (q.error) return <StateBox kind="error" title="نظرات دریافت نشد" onRetry={q.reload} className="cl-reviews-empty" />;
  if (!q.data.length) {
    return (
      <StateBox
        kind="empty"
        className="cl-reviews-empty"
        icon={
          <div className="cl-reviews-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        }
        title="هنوز نظری ثبت نشده است"
        text={emptyText || 'پس از اولین مراجعه می‌توانید تجربهٔ خود را از «حساب من» ثبت کنید.'}
      />
    );
  }
  const avg = q.data.reduce((a, r) => a + Number(r.rating || 0), 0) / q.data.length;
  const roundedAvg = Math.round(avg * 10) / 10;

  return (
    <div className="cl-reviews-container">
      <div className="cl-reviews-bar" role="status" aria-label={`امتیاز مراجعان: میانگین ${nf(roundedAvg)} از ۵ بر پایه ${nf(q.data.length)} نظر تأییدشده`}>
        <div className="cl-reviews-badge">
          <span className="cl-reviews-score">{nf(roundedAvg)}</span>
          <Stars value={roundedAvg} label={`امتیاز ${nf(roundedAvg)} از ۵`} />
        </div>
        <p className="cl-reviews-count">
          بر پایهٔ <strong>{nf(q.data.length)}</strong> نظر تأییدشده مراجعان
        </p>
      </div>

      <div className="cl-grid cl-grid-3">
        {q.data.map((r) => (
          <ReviewCard key={idOf(r)} review={r} />
        ))}
      </div>
    </div>
  );
}
