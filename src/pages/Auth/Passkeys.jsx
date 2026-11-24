import { useCallback, useEffect, useState } from 'react';
import {
  enrollPasskey,
  listPasskeys,
  revokePasskey,
  supportsPasskeys,
} from '@/api/plugins/passkeys';

export default function PasskeysPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await listPasskeys();
      setItems(list);
    } catch (reason) {
      setError(reason?.message || 'دریافت کلیدهای عبور انجام نشد.');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    listPasskeys()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason?.message || 'دریافت کلیدهای عبور انجام نشد.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function add() {
    setBusy(true);
    setError('');
    try {
      await enrollPasskey(name || 'دستگاه من');
      setName('');
      await refresh();
    } catch (reason) {
      setError(reason?.message || 'ثبت کلید عبور انجام نشد. دوباره وارد حساب شوید.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('این کلید عبور غیرفعال شود؟')) return;
    setBusy(true);
    try {
      await revokePasskey(id);
      await refresh();
    } catch (reason) {
      setError(reason?.message || 'حذف کلید عبور انجام نشد.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">کلیدهای عبور</h1>
        <p className="mt-2 text-sm text-neutral-500">
          ورود پیامکی همیشه به‌عنوان روش جایگزین باقی می‌ماند.
        </p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {supportsPasskeys() ? (
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={64}
            placeholder="نام دستگاه"
            className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2"
          />
          <button
            type="button"
            onClick={add}
            disabled={busy}
            className="rounded-lg bg-brand-600 px-4 py-2 text-white disabled:opacity-60"
          >
            افزودن
          </button>
        </div>
      ) : (
        <p className="text-sm text-neutral-600">این مرورگر از کلید عبور پشتیبانی نمی‌کند.</p>
      )}
      <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium text-neutral-900">{item.name}</p>
              <p className="text-xs text-neutral-500">
                {item.backedUp ? 'همگام‌شده' : 'ذخیره‌شده روی دستگاه'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(item.id)}
              disabled={busy}
              className="text-sm text-red-600 disabled:opacity-60"
            >
              غیرفعال‌کردن
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
