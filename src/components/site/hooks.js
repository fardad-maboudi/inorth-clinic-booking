import { useCallback, useEffect, useRef, useState } from 'react';
import { getUserAuthHeaders, me } from '@/api/plugins/auth';
import { listServices, listResources } from '@/api/plugins/bookings';
import { rowsOf } from './format';

/** Minimal async-data hook: { data, error, loading, reload }. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: undefined, error: null, loading: true });
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    Promise.resolve()
      .then(() => {
        if (!live) return undefined;
        return fnRef.current();
      })
      .then((data) => live && setState({ data, error: null, loading: false }))
      .catch((error) => live && setState({ data: undefined, error, loading: false }));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setTick((t) => t + 1);
  }, []);
  return { ...state, reload };
}

/** Catalog (services + staff), cached per page load. */
let catalogPromise = null;
export function loadCatalog(force = false) {
  if (!catalogPromise || force) {
    catalogPromise = Promise.all([listServices(), listResources()])
      .then(([s, r]) => ({ services: rowsOf(s), staff: rowsOf(r) }))
      .catch((e) => {
        catalogPromise = null;
        throw e;
      });
  }
  return catalogPromise;
}
export const useCatalog = () => useAsync(() => loadCatalog(), []);

/** Signed-in member (null = guest). `loading` until the first answer. */
export function useSession() {
  const [state, setState] = useState({ user: null, loading: true });
  useEffect(() => {
    let live = true;
    const run = async () => {
      if (!getUserAuthHeaders()?.Authorization) {
        live && setState({ user: null, loading: false });
        return;
      }
      try {
        const u = await me();
        live && setState({ user: u?.userId ? u : null, loading: false });
      } catch {
        live && setState({ user: null, loading: false });
      }
    };
    run();
    const on = () => run();
    window.addEventListener('clinic-auth', on);
    return () => {
      live = false;
      window.removeEventListener('clinic-auth', on);
    };
  }, []);
  return state;
}
export const announceAuthChange = () => window.dispatchEvent(new Event('clinic-auth'));

/** Set the document title for a page. */
export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | کلینیک زیبایی نیلوفر` : 'کلینیک زیبایی نیلوفر';
  }, [title]);
}
