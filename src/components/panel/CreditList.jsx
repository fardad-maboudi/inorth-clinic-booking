import { jalaliShort, fa, idOf } from './format';
import { StatusBadge } from './ui';

const CREDIT_STATUS = { active: ['فعال', 'good'], exhausted: ['تمام‌شده', 'neutral'], expired: ['منقضی', 'warn'], cancelled: ['لغوشده', 'neutral'] };

/** Read-only list of credit rows with an optional per-row action slot. */
export default function CreditList({ credits, services, action }) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {credits.map((c) => {
        const [label, tone] = CREDIT_STATUS[c.status] || [c.status, 'neutral'];
        const service = services.get(String(c.serviceId || c.serviceIds?.[0]));
        return (
          <li key={idOf(c)} className="flex items-center justify-between gap-3 p-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{service?.name || 'اعتبار عمومی'}</p>
              <p className="text-xs text-muted-foreground">
                {c.unlimited ? 'نامحدود' : `${fa(c.remainingSessions)} از ${fa(c.totalSessions)} جلسه`}
                {c.expiresAt ? ` · تا ${jalaliShort(c.expiresAt)}` : ''}
              </p>
              {c.grantReason && <p className="truncate text-xs text-muted-foreground">{c.grantReason}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge label={label} tone={tone} />
              {action?.(c)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
