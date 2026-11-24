/**
 * Notification bell — drop into any header/Layout.
 * Self-contained: subscribes to live updates internally, no provider needed.
 */
import { useEffect, useState } from 'react';
import {
  listMyNotifications,
  markRead,
  markAllRead,
} from '../../api/plugins/notifications.js';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [rows, setRows] = useState([]);

  // One full load for the panel rows, then live deltas. Re-running load() on
  // every push would cost four server-side queries per notification for a
  // number the push already carries.
  useEffect(() => {
    let cancelled = false;
    let unsubscribe;

    listMyNotifications({ limit: 8 })
      .then((payload) => {
        if (!cancelled) {
          setRows(payload?.data ?? payload ?? []);
          setUnread(Number(payload?.meta?.unread ?? 0));
        }
      })
      .catch(() => {
        /* ignore initial notification load error */
      });

    import('../../api/plugins/notifications.js').then((m) => {
      if (cancelled) return;
      unsubscribe = m.subscribeToNotifications(({ row, unread: next }) => {
        if (typeof next === 'number') setUnread(next);
        if (row?._id) {
          setRows((rs) =>
            rs.some((r) => String(r._id) === String(row._id))
              ? rs
              : [row, ...rs].slice(0, 8),
          );
        }
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  async function onOpenItem(row) {
    if (!row.readAt) {
      markRead([String(row._id)]).catch(() => {});
      setUnread((n) => Math.max(0, n - 1));
    }
    setOpen(false);
    if (row.link) window.location.assign(row.link);
  }

  return (
    <div className="relative" dir="rtl">
      <button
        type="button"
        aria-label="اعلان‌ها"
        className="relative rounded-full p-2 text-neutral-600 hover:bg-neutral-100"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 01-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -left-0.5 min-w-[1.15rem] rounded-full bg-red-500 px-1 text-center text-[11px] font-bold leading-[1.15rem] text-white">
            {unread > 99 ? '۹۹+' : unread.toLocaleString('fa-IR')}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute left-0 z-50 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <span className="text-sm font-bold">اعلان‌ها</span>
            {unread > 0 && (
              <button
                type="button"
                className="text-xs text-brand-600 underline"
                onClick={async () => {
                  await markAllRead().catch(() => {});
                  setUnread(0);
                  setRows((rs) => rs.map((r) => ({ ...r, readAt: new Date() })));
                }}
              >
                خواندن همه
              </button>
            )}
          </div>
          <ul className="max-h-96 divide-y divide-neutral-100 overflow-y-auto">
            {rows.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-neutral-400">
                اعلانی ندارید
              </li>
            )}
            {rows.map((row) => (
              <li key={row._id}>
                <button
                  type="button"
                  className={`block w-full px-4 py-3 text-right hover:bg-neutral-50 ${
                    row.readAt ? '' : 'bg-brand-50/60'
                  }`}
                  onClick={() => onOpenItem(row)}
                >
                  <p className="text-sm font-semibold text-neutral-800">{row.title}</p>
                  {row.body && (
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{row.body}</p>
                  )}
                  {!row.readAt && <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />}
                </button>
              </li>
            ))}
          </ul>
          <a
            href="/notifications/inbox"
            className="block border-t border-neutral-100 py-2.5 text-center text-sm text-brand-600"
            onClick={() => setOpen(false)}
          >
            مشاهده همه اعلان‌ها
          </a>
        </div>
      )}
    </div>
  );
}
