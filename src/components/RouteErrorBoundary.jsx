import { Component } from "react";

export function formatRuntimeError(error) {
  try {
    return String(error?.message ?? error);
  } catch {
    try {
      return JSON.stringify(error) || "Unprintable runtime error";
    } catch {
      return "Unprintable runtime error";
    }
  }
}

/** Reject malformed glob modules before React formats their namespace object. */
export function loadLazyEntry(loader, file) {
  return async () => {
    const module = await loader();
    if (module?.default == null) {
      const error = new Error(
        `${file} must export a default React component for React.lazy. Named exports alone cannot mount a page or layout.`,
      );
      error.file = file.replace(/^\.\//, "src/");
      throw error;
    }
    return module;
  };
}

/**
 * Per-route failure isolation. A page that throws on load (broken import,
 * runtime error) renders inline here instead of blanking the whole preview,
 * while sibling routes keep working.
 *
 * The error is re-posted on the SAME `app_error` channel that
 * `public/preview-error-observer.js` uses, so the studio error banner and
 * `.app-runtime` telemetry still see it — a boundary must not swallow signal.
 */
export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    const routeName = this.props.routeName ?? "route";
    try {
      window.parent?.postMessage(
        {
          type: "app_error",
          error: {
            title: `${routeName}: ${formatRuntimeError(error)}`,
            details: info?.componentStack ?? error?.stack ?? "",
            file: error?.file ?? `src/pages/${routeName}.jsx`,
          },
        },
        "*",
      );
    } catch {
      // ponytail: reporting is best-effort — never let it mask the real error.
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    if (typeof this.props.fallback === "function") {
      return this.props.fallback(this.state.error);
    }
    return (
      <div
        lang="fa"
        dir="rtl"
        className="mx-auto w-full max-w-3xl px-6 py-12 text-right"
        role="alert"
        data-testid="error-state"
      >
        <h2 className="text-lg font-semibold text-state-error-ink">
          این بخش فعلاً بارگذاری نشد
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          {this.props.routeName
            ? `صفحه «${this.props.routeName}» در حال ساخت یا دارای خطاست.`
            : "این صفحه در حال ساخت یا دارای خطاست."}
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-neutral-100 p-4 text-left text-xs text-neutral-700">
          {formatRuntimeError(this.state.error)}
        </pre>
      </div>
    );
  }
}
