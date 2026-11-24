/**
 * Light/dark override. Wire only for `*-with-toggle` themeMode.
 * Reads prefers-color-scheme, persists to localStorage, sets `data-theme`.
 */
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'joorchin-theme';

function systemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle({
  lightLabel = 'روشن',
  darkLabel = 'تیره',
} = {}) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const next = stored === 'dark' || stored === 'light' ? stored : systemTheme();
    setTheme(next);
    applyTheme(next);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      data-testid="theme-toggle-button"
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm text-ink transition hover:bg-surface hover:text-ink"
    >
      {theme === 'dark' ? lightLabel : darkLabel}
    </button>
  );
}

export default ThemeToggle;
