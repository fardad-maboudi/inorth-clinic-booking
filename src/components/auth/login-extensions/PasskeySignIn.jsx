import { useState } from 'react';
import { signInWithPasskey, supportsPasskeys } from '@/api/plugins/passkeys';

export default function PasskeySignIn() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!supportsPasskeys()) return null;

  async function signIn() {
    setBusy(true);
    setError('');
    try {
      await signInWithPasskey();
      window.location.href = '/';
    } catch (reason) {
      if (reason?.name !== 'NotAllowedError') {
        setError(reason?.message || 'ورود با کلید عبور انجام نشد.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 border-t border-neutral-200 pt-4">
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className="w-full rounded-lg border border-neutral-300 py-2 text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-60"
      >
        {busy ? 'در حال بررسی…' : 'ورود با کلید عبور یا اثر انگشت'}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
