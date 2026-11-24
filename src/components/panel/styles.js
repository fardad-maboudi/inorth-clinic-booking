/** Shared class strings for the panel. Theme-token classes only (no hard-coded brand colours). */
export const inputCls =
  'h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';
export const textareaCls = inputCls.replace('h-10 ', 'min-h-20 py-2 ');
const btnBase =
  'pn-press inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
export const btn = {
  primary: `${btnBase} bg-primary text-primary-foreground! hover:opacity-90`,
  outline: `${btnBase} border border-border bg-surface text-foreground! hover:bg-subtle`,
  ghost: `${btnBase} text-foreground! hover:bg-subtle`,
  danger: `${btnBase} bg-destructive text-destructive-foreground! hover:opacity-90`,
  dangerOutline: `${btnBase} border border-destructive/40 bg-surface text-destructive! hover:bg-destructive/10`,
  sm: 'h-8! px-3! text-xs!',
};
export const card = 'pn-card rounded-xl border border-border bg-surface';

/** Status colours: fixed semantic hues so a receptionist reads state at a glance in any brand theme. */
export const TONES = {
  pending: 'border-amber-300 bg-amber-50 text-amber-900',
  confirmed: 'border-sky-300 bg-sky-50 text-sky-900',
  completed: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  no_show: 'border-rose-300 bg-rose-50 text-rose-900',
  cancelled: 'border-border bg-subtle text-muted-foreground',
  rescheduled: 'border-border bg-subtle text-muted-foreground',
  neutral: 'border-border bg-subtle text-foreground',
  good: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  warn: 'border-amber-300 bg-amber-50 text-amber-900',
  bad: 'border-rose-300 bg-rose-50 text-rose-900',
};
/** Calendar block colours by status (left accent stays the staff colour). */
export const BLOCK_TONES = {
  pending: 'bg-amber-50 text-amber-950 border-amber-300',
  confirmed: 'bg-sky-50 text-sky-950 border-sky-300',
  completed: 'bg-emerald-50 text-emerald-950 border-emerald-300',
  no_show: 'bg-rose-50 text-rose-950 border-rose-300',
};
