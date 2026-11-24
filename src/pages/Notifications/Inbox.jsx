/**
 * Notifications inbox — full-page list of the signed-in user's notifications.
 */
import { useEffect, useState } from 'react';
import {
  listMyNotifications,
  markRead,
  markAllRead,
  subscribeToNotifications,
} from '../../api/plugins/notifications.js';

const TYPE_LABELS = {
  order: 'سفارش',
  account: 'حساب کاربری',
  system: 'سیستمی',
  promo: 'تبلیغاتی',
  platform: 'پلتفرم',
};

function formatDate(value) {
  try {
    return new Date(value).toLocaleString('fa-IR');
  } catch {
    return '';
  }
}

export default function Inbox() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    function fetchNotifications() {
      listMyNotifications({ limit: 50 })
        .then((payload) => {
          if (!cancelled) {
            setRows(payload?.data ?? payload ?? []);
            setError('');
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err?.message || 'خطا در دریافت اعلان‌ها');
            setRows((current) => current ?? []);
          }
        });
    }

    fetchNotifications();
    const unsubscribe = subscribeToNotifications(() => fetchNotifications());
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  async function onRowClick(row) {
    if (!row.readAt) {
      markRead([String(row._id)]).catch(() => {});
      setRows((rs) =>
        rs.map((r) => (r._id === row._id ? { ...r, readAt: new Date() } : r)),
      );
    }
    if (row.link) window.location.assign(row.link);
  }

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-neutral-900">اعلان‌ها</h1>
        <button
          type="button"
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50"
          onClick={async () => {
            await markAllRead().catch(() => {});
            setRows((rs) => (rs ?? []).map((r) => ({ ...r, readAt: r.readAt ?? new Date() })));
          }}
        >
          علامت‌گذاری همه به‌عنوان خوانده‌شده
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {rows === null ? (
        <p className="py-16 text-center text-neutral-400">در حال بارگذاری…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 py-16 text-center text-neutral-400">
          هنوز اعلانی ندارید
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row._id}>
              <button
                type="button"
                onClick={() => onRowClick(row)}
                className={`block w-full rounded-xl border p-4 text-right transition hover:border-brand-300 ${
                  row.readAt
                    ? 'border-neutral-200 bg-white'
                    : 'border-brand-200 bg-brand-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-neutral-900">
                      {row.title}
                      {!row.readAt && (
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand-500 align-middle" />
                      )}
                    </p>
                    {row.body && (
                      <p className="mt-1 whitespace-pre-line text-sm text-neutral-600">{row.body}</p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                    {TYPE_LABELS[row.type] || 'سیستمی'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-neutral-400">{formatDate(row.created_at)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
