import PasskeySignIn from '@/components/auth/login-extensions/PasskeySignIn';

export default function PasskeyLoginPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold text-neutral-900">ورود با کلید عبور</h1>
      <p className="mt-2 text-sm text-neutral-500">
        از قفل دستگاه، اثر انگشت، تشخیص چهره یا کلید امنیتی استفاده کنید.
      </p>
      <PasskeySignIn />
      <button
        type="button"
        onClick={() => window.history.back()}
        className="mt-4 w-full text-center text-sm text-brand-700"
      >
        بازگشت به ورود پیامکی
      </button>
    </main>
  );
}
