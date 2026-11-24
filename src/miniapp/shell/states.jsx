import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button.jsx";

export function Loading({ label = "در حال بارگذاری…" }) {
  return <div role="status" className="flex flex-col items-center justify-center gap-3 px-6 py-16"><div className="h-7 w-7 animate-spin rounded-full border-2 border-primary-ink border-t-transparent" /><p className="text-sm text-muted-foreground">{label}</p></div>;
}

export function ErrorState({ message = "خطایی رخ داد.", onRetry }) {
  return <div role="alert" className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"><p className="text-sm font-medium">{message}</p>{onRetry ? <Button onClick={onRetry}>تلاش دوباره</Button> : null}</div>;
}

export function EmptyState({ icon = "📭", title, hint }) {
  return <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center"><span className="text-3xl" aria-hidden>{icon}</span><p className="font-semibold">{title}</p>{hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}</div>;
}

export function useLoad(loader, deps = []) {
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        if (!active) return undefined;
        return loaderRef.current();
      })
      .then((data) => active && setState({ loading: false, data, error: null }))
      .catch((error) => active && setState({ loading: false, data: null, error }));
    return () => { active = false; };
  }, [...deps, version]);
  return {
    ...state,
    reload: () => {
      setState((previous) => ({ ...previous, loading: true, error: null }));
      setVersion((value) => value + 1);
    },
  };
}
