/**
 * Suspense fallback for a lazily-loaded page. Neutral + RTL so it reads as
 * "this section is loading", not as a finished design.
 */
export default function PageSkeleton() {
  return (
    <div
      lang="fa"
      dir="rtl"
      className="mx-auto w-full max-w-5xl animate-pulse space-y-6 px-6 py-12"
      data-testid="loading-state"
      aria-busy="true"
      aria-label="در حال بارگذاری صفحه"
    >
      <div className="h-8 w-1/3 rounded-lg bg-neutral-200" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-neutral-200" />
        <div className="h-4 w-5/6 rounded bg-neutral-200" />
        <div className="h-4 w-2/3 rounded bg-neutral-200" />
      </div>
    </div>
  );
}
