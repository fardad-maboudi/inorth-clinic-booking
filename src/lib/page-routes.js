const PAGE_FILE_RE = /^src\/pages\/(.+)\.jsx$/;
const MINIAPP_PAGE_FILE_RE = /^src\/miniapp\/pages\/(.+)\.jsx$/;
const ROUTE_HELPER_RE = /Routes\.jsx$/;
export const PLUGIN_SCAFFOLD_PAGE_DIRS = [
    "Account",
    "Admin",
    "Auth",
    "Bookings",
    "Cms",
    "Forms",
    "Media",
    "Merchants",
    "Notifications",
    "Plans",
    "Shop",
    "Support",
    "Telegram",
];
export function normalizePagePath(file) {
  const clean = file.replace(/^\.\//, "");
  return clean.startsWith("pages/") ? `src/${clean}` : clean;
}
export function isPageModule(file) {
  const path = normalizePagePath(file);
  return PAGE_FILE_RE.test(path) && !ROUTE_HELPER_RE.test(path);
}
export function pageRoutePath(file) {
  const path = normalizePagePath(file);
  if (!isPageModule(path))
    return null;
  const match = PAGE_FILE_RE.exec(path);
  if (!match)
    return null;
  const segments = match[1].split("/").map((segment) => {
    const param = /^\[(.+)\]$/.exec(segment);
    return param ? `:${param[1]}` : segment.replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase();
  }).filter((segment, index, all) => index === all.length - 1 ? !/^(home|index)$/.test(segment) : true);
  return segments.length ? `/${segments.join("/")}` : "/";
}
export function miniAppPageRoutePath(file) {
  const path = file.replace(/\\/g, "/").replace(/^\.\//, "src/miniapp/");
  const match = MINIAPP_PAGE_FILE_RE.exec(path);
  if (!match || ROUTE_HELPER_RE.test(path))
    return null;
  const segments = match[1].split("/").map((segment) => {
    const param = /^\[(.+)\]$/.exec(segment);
    return param ? `:${param[1]}` : segment.replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase();
  }).filter((segment, index, all) => index === all.length - 1 ? !/^(home|index)$/.test(segment) : true);
  return `/miniapp${segments.length ? `/${segments.join("/")}` : ""}`;
}
export function isPluginScaffoldPage(file) {
  const path = normalizePagePath(file);
  return PLUGIN_SCAFFOLD_PAGE_DIRS.some((dir) => path.startsWith(`src/pages/${dir}/`));
}
export function deriveMountedRoutes(scaffoldFiles, purposes = {}) {
  return scaffoldFiles.map((file) => {
    const path = pageRoutePath(file.path);
    if (!path)
      return null;
    const segments = normalizePagePath(file.path).split("/");
    const base = segments.pop().replace(/\.jsx$/, "");
    const key = /^\[.+\]$/.test(base) ? segments[segments.length - 1] ?? base : base;
    return {
      path,
      page: normalizePagePath(file.path),
      purpose: purposes[key] ?? key
    };
  }).filter((route) => route !== null).sort((a, b) => a.path.localeCompare(b.path));
}
export const AUTH_LOGIN_FILE = "src/pages/Auth/Login.jsx";
export const AUTH_LOGIN_PATH = pageRoutePath(AUTH_LOGIN_FILE) ?? "/auth/login";
export function legacyPageRoutePath(file) {
  const path = normalizePagePath(file);
  if (!isPageModule(path))
    return null;
  const match = PAGE_FILE_RE.exec(path);
  if (!match)
    return null;
  const segments = match[1].split("/").map((segment) => {
    const param = /^\[(.+)\]$/.exec(segment);
    return param ? `:${param[1]}` : segment.toLowerCase();
  }).filter((segment, i, all) => i !== all.length - 1 || !/^(home|index)$/.test(segment));
  const old = segments.length ? `/${segments.join("/")}` : "/";
  return old === pageRoutePath(file) ? null : old;
}

/**
 * Strip only the generated preview base that Vite actually serves
 * (`/app/:appId`). Published root paths and arbitrary nested `/app/` content
 * remain untouched.
 */
export function normalizeGeneratedAppPathname(pathname) {
  const raw = String(pathname || "/");
  const path = (raw.split(/[?#]/, 1)[0] || "/").replace(/\/{2,}/g, "/");
  const normalized = path.replace(/^\/app\/[^/]+(?=\/|$)/i, "");
  return normalized
    ? normalized.startsWith("/")
      ? normalized
      : `/${normalized}`
    : "/";
}

const TRANSACTIONAL_OR_AUTH_ROUTE =
  /^\/(?:install(?:\/|$)|auth(?:\/|$)|shop\/(?:cart|checkout|order(?:[-/]?(?:success|return))?)(?:\/|$)|orders?(?:\/|$))/i;

/** Platform chrome must leave transactional/auth routes in document flow. */
export function isTransactionalOrAuthPath(pathname) {
  return TRANSACTIONAL_OR_AUTH_ROUTE.test(
    normalizeGeneratedAppPathname(pathname),
  );
}
