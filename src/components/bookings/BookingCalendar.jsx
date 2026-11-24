import { useState } from 'react';
import { buttonClass, dateKey, formatDate, civilDate, monthGrid } from './bookingUtils';

export default function BookingCalendar({ value, available, onChange, onMonthChange }) {
  const [view, setView] = useState(value || available[0] || dateKey(new Date()));
  const grid = monthGrid(view);
  const today = dateKey(new Date());
  return (
    <section aria-label="تقویم انتخاب تاریخ" className="min-w-0 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">
          {civilDate(view).toLocaleDateString('fa-IR', {
            timeZone: 'UTC',
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <div className="flex gap-1">
          <button
            className={buttonClass}
            aria-label="ماه قبل"
            onClick={() => {
              setView(grid.previous);
              onMonthChange?.(grid.previous);
            }}
          >
            ‹
          </button>
          <button
            className={buttonClass}
            aria-label="ماه بعد"
            onClick={() => {
              setView(grid.next);
              onMonthChange?.(grid.next);
            }}
          >
            ›
          </button>
        </div>
      </header>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, index) => (
          <span key={index} aria-hidden="true" className="py-2 text-muted-foreground">
            {day}
          </span>
        ))}
        {grid.cells.map((cell) => (
          <button
            key={cell.key}
            type="button"
            disabled={!cell.inMonth || !available.includes(cell.key)}
            aria-label={formatDate(cell.key + 'T12:00:00Z')}
            aria-pressed={value === cell.key}
            aria-current={cell.key === today ? 'date' : undefined}
            onClick={() => onChange(cell.key)}
            className={
              'min-h-11 min-w-0 rounded-lg text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-25 ' +
              (value === cell.key
                ? 'bg-primary font-bold text-on-primary'
                : available.includes(cell.key)
                  ? 'bg-primary/10 font-semibold text-primary-ink'
                  : '')
            }
          >
            {Number(cell.day).toLocaleString('fa-IR')}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">زمان‌ها به وقت تهران نمایش داده می‌شوند.</p>
    </section>
  );
}
