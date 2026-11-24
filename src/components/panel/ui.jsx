import { useId, useRef } from 'react';
import { AlertTriangle, CalendarDays, Inbox, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { STATUS_LABELS, errMsg, jalaliMid } from './format';
import { TONES, btn, card, inputCls } from './styles';

export function StatusBadge({ status, label, tone, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONES[tone || status] || TONES.neutral,
        className,
      )}
    >
      {label || STATUS_LABELS[status] || status}
    </span>
  );
}

export function Card({ className, children, ...props }) {
  return (
    <section className={cn(card, 'min-w-0 p-4 sm:p-5', className)} {...props}>
      {children}
    </section>
  );
}

export function SectionTitle({ title, hint, actions }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <div role="heading" aria-level={2} className="text-base font-bold">{title}</div>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {actions}
    </div>
  );
}

const STAT_TONES = { default: '', warn: 'text-amber-700', bad: 'text-rose-700', good: 'text-emerald-700' };
export function StatCard({ label, value, hint, tone = 'default', icon }) {
  const Icon = icon;
  return (
    <div className={cn(card, 'pn-lift flex min-w-0 items-start justify-between gap-3 p-4')}>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <p className={cn('mt-1.5 text-2xl font-bold leading-none sm:text-3xl', STAT_TONES[tone])}>{value}</p>
        {hint && <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>}
      </div>
      {Icon && (
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

export function LoadingState({ label = 'در حال دریافت اطلاعات…', rows = 4 }) {
  return (
    <div role="status" aria-live="polite" className="space-y-2">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="pn-shimmer h-12 rounded-lg" style={{ opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  );
}

export function EmptyState({ title = 'موردی یافت نشد', hint, action, icon = Inbox }) {
  const Icon = icon;
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-7" aria-hidden="true" /></span>
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="max-w-sm text-xs leading-6 text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'دریافت اطلاعات انجام نشد' }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
      <AlertTriangle className="size-7 text-destructive" aria-hidden="true" />
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-md text-xs leading-6 text-muted-foreground">{errMsg(error)}</p>
      {onRetry && (
        <button type="button" className={cn(btn.outline, btn.sm)} onClick={onRetry}>
          تلاش دوباره
        </button>
      )}
    </div>
  );
}

/** Loading / error / empty / content switch for one react-query result. */
export function QueryBoundary({ query, isEmpty, empty, rows, children }) {
  if (query.isLoading) return <LoadingState rows={rows} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  if (isEmpty) return empty || <EmptyState />;
  return children;
}

export function Spinner({ className }) {
  return <Loader2 className={cn('size-4 animate-spin', className)} aria-hidden="true" />;
}

export function Field({ label, hint, className, children }) {
  const id = useId();
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5 text-sm', className)}>
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {typeof children === 'function' ? children(id) : children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, placeholder, className, disabled }) {
  return (
    <Field label={label} className={className}>
      {(id) => (
        <select id={id} className={inputCls} value={value ?? ''} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

/** Destructive-action confirmation. `onConfirm` may return a promise; the dialog shows progress. */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'تأیید', tone = 'danger', pending, confirmDisabled, onConfirm, children }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-start">
          <button type="button" className={tone === 'danger' ? btn.danger : btn.primary} disabled={pending || confirmDisabled} onClick={onConfirm}>
            {pending && <Spinner />}
            {confirmLabel}
          </button>
          <button type="button" className={btn.outline} disabled={pending} onClick={() => onOpenChange(false)}>
            انصراف
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Table on desktop, stacked cards on phones. Columns: `{ key, header, cell(row), className, primary, hideOnMobile }`.
 * The `primary` column leads each mobile card.
 */
export function DataTable({ columns, rows, onRowClick, rowKey, caption }) {
  const primary = columns.find((c) => c.primary) || columns[0];
  const rest = columns.filter((c) => c !== primary);
  return (
    <>
      <div className={cn(card, 'hidden overflow-x-auto md:block')}>
        <table className="pn-rows w-full text-start text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-subtle text-xs text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className={cn('whitespace-nowrap px-4 py-2.5 text-start font-medium', c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                className={cn('border-t border-border', onRowClick && 'cursor-pointer hover:bg-subtle/60')}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-4 py-3 align-middle', c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="pn-rows-m space-y-2 md:hidden">
        {rows.map((row, i) => (
          <li key={rowKey(row, i)}>
            <div
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onRowClick(row) : undefined}
              className={cn(card, 'space-y-2 p-3', onRowClick && 'cursor-pointer active:bg-subtle')}
            >
              <div className="min-w-0 text-sm font-medium">{primary.cell(row)}</div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                {rest
                  .filter((c) => !c.hideOnMobile)
                  .map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-muted-foreground">{c.header}</dt>
                      <dd className="mt-0.5 min-w-0">{c.cell(row)}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Jalali-labelled date picker (the native input stays hidden; it only supplies the calendar popup). */
export function DatePick({ label, value, onChange, emptyLabel = 'همه روزها', min, className }) {
  const ref = useRef(null);
  return (
    <Field label={label} className={className}>
      {() => (
        <div className="relative">
          <button type="button" className={cn(inputCls, 'flex items-center justify-between gap-2 text-start')} onClick={() => ref.current?.showPicker?.()}>
            <span className={value ? '' : 'text-muted-foreground'}>{value ? jalaliMid(value) : emptyLabel}</span>
            <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
          </button>
          <input ref={ref} type="date" min={min} tabIndex={-1} aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0" value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
      )}
    </Field>
  );
}

export function FilterBar({ children }) {
  return <div className={cn(card, 'grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4')}>{children}</div>;
}
