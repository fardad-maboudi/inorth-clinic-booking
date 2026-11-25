import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { durationLabel, idOf, initials, money, nf } from "./format";
import { serviceImageFor, staffImageFor } from "./images";

export function Logo({ size = 30, className = "" }) {
  const width = Math.round(size * (342 / 421));
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 342 421"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cl-brand-logo${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 171.5 4 L 170 6.5 L 170 8.5 L 168 11.5 L 168 13.5 L 161 27.5 L 159 29.5 L 158 32.5 L 156 34.5 L 156 35.5 L 154 37.5 L 152 41.5 L 145 49.5 L 145 50.5 L 141 54.5 L 141 55.5 L 130 66.5 L 130 67.5 L 127.5 70 L 126.5 70 L 111.5 85 L 110.5 85 L 105.5 90 L 104.5 90 L 99.5 95 L 98.5 95 L 92.5 101 L 91.5 101 L 81.5 110 L 80.5 110 L 74.5 116 L 73.5 116 L 64.5 125 L 63.5 125 L 54 134.5 L 54 135.5 L 41 149.5 L 41 150.5 L 38 153.5 L 36 157.5 L 33 160.5 L 32 163.5 L 30 165.5 L 29 168.5 L 27 170.5 L 23 179.5 L 21 181.5 L 21 183.5 L 15 195.5 L 15 197.5 L 12 203.5 L 12 206.5 L 11 207.5 L 11 209.5 L 9 213.5 L 9 216.5 L 8 217.5 L 8 220.5 L 7 221.5 L 7 225.5 L 6 226.5 L 6 230.5 L 5 231.5 L 5 239.5 L 4 240.5 L 4 272.5 L 5 273.5 L 5 280.5 L 6 281.5 L 6 286.5 L 7 287.5 L 7 290.5 L 8 291.5 L 8 294.5 L 9 295.5 L 10 302.5 L 11 303.5 L 11 305.5 L 12 306.5 L 12 308.5 L 13 309.5 L 13 311.5 L 14 312.5 L 15 317.5 L 28 343.5 L 30 345.5 L 30 346.5 L 32 348.5 L 32 349.5 L 37.5 357 L 38 355.5 L 32 344.5 L 32 342.5 L 30 339.5 L 30 337.5 L 28 334.5 L 28 332.5 L 27 331.5 L 27 329.5 L 26 328.5 L 26 326.5 L 24 322.5 L 24 319.5 L 23 318.5 L 23 315.5 L 22 314.5 L 22 310.5 L 21 309.5 L 21 303.5 L 20 302.5 L 20 294.5 L 19 293.5 L 19 282.5 L 20 281.5 L 20 273.5 L 21 272.5 L 21 267.5 L 22 266.5 L 22 263.5 L 23 262.5 L 23 259.5 L 24 258.5 L 24 256.5 L 25 255.5 L 26 250.5 L 29 245.5 L 29 243.5 L 32 237.5 L 34 235.5 L 38 227.5 L 41 224.5 L 41 223.5 L 44 220.5 L 44 219.5 L 48 215.5 L 48 214.5 L 68.5 194 L 69.5 194 L 76.5 187 L 77.5 187 L 82.5 182 L 83.5 182 L 88.5 177 L 89.5 177 L 94.5 172 L 95.5 172 L 101.5 166 L 102.5 166 L 110.5 158 L 111.5 158 L 132 137.5 L 132 136.5 L 139 129.5 L 139 128.5 L 143 124.5 L 143 123.5 L 145 121.5 L 145 120.5 L 153 109.5 L 156 102.5 L 158 100.5 L 158 98.5 L 161 94.5 L 161 92.5 L 166 82.5 L 166 80.5 L 167 79.5 L 167 76.5 L 168 75.5 L 168 73.5 L 169 72.5 L 169 69.5 L 170 68.5 L 170 65.5 L 171 64.5 L 172 55.5 L 173 54.5 L 173 46.5 L 174 45.5 L 174 19.5 L 173 18.5 L 173 10.5 L 172 9.5 L 172 4.5 Z M 180.5 20 L 180 22.5 L 181 23.5 L 181 29.5 L 182 30.5 L 182 37.5 L 183 38.5 L 183 70.5 L 182 71.5 L 182 78.5 L 181 79.5 L 181 84.5 L 180 85.5 L 180 89.5 L 179 90.5 L 178 97.5 L 176 101.5 L 176 104.5 L 175 105.5 L 174 110.5 L 170 118.5 L 170 120.5 L 162 136.5 L 160 138.5 L 159 141.5 L 157 143.5 L 157 144.5 L 155 146.5 L 155 147.5 L 153 149.5 L 153 150.5 L 151 152.5 L 149 156.5 L 141 165.5 L 141 166.5 L 136 171.5 L 136 172.5 L 74 233.5 L 74 234.5 L 71 237.5 L 71 238.5 L 67 242.5 L 67 243.5 L 61 251.5 L 59 256.5 L 57 258.5 L 54 264.5 L 54 266.5 L 51 271.5 L 51 273.5 L 50 274.5 L 50 276.5 L 49 277.5 L 49 279.5 L 47 283.5 L 47 286.5 L 46 287.5 L 46 291.5 L 45 292.5 L 45 299.5 L 44 300.5 L 44 322.5 L 45 323.5 L 45 329.5 L 46 330.5 L 46 333.5 L 47 334.5 L 47 338.5 L 48 339.5 L 49 344.5 L 51 347.5 L 52 352.5 L 58 364.5 L 60 366.5 L 60 367.5 L 62 369.5 L 64 373.5 L 67 376.5 L 67 377.5 L 72 382.5 L 72 383.5 L 85.5 396 L 86.5 396 L 89.5 399 L 90.5 399 L 98.5 405 L 110.5 411 L 112.5 411 L 117.5 414 L 119.5 414 L 123.5 416 L 125 415.5 L 122.5 413 L 121.5 413 L 115.5 407 L 114.5 407 L 100 391.5 L 100 390.5 L 97 387.5 L 97 386.5 L 93 381.5 L 92 378.5 L 90 376.5 L 83 362.5 L 83 360.5 L 81 357.5 L 81 355.5 L 80 354.5 L 80 352.5 L 78 348.5 L 78 345.5 L 77 344.5 L 77 341.5 L 76 340.5 L 76 335.5 L 75 334.5 L 75 325.5 L 74 324.5 L 74 313.5 L 75 312.5 L 75 304.5 L 76 303.5 L 76 299.5 L 77 298.5 L 77 295.5 L 78 294.5 L 78 292.5 L 79 291.5 L 79 289.5 L 80 288.5 L 81 283.5 L 88 269.5 L 90 267.5 L 90 266.5 L 92 264.5 L 94 260.5 L 101 252.5 L 101 251.5 L 127.5 225 L 128.5 225 L 148 204.5 L 148 203.5 L 152 199.5 L 152 198.5 L 161 187.5 L 162 184.5 L 164 182.5 L 167 176.5 L 169 174.5 L 173.5 165 L 175 165.5 L 174 166.5 L 174 171.5 L 173 172.5 L 173 175.5 L 172 176.5 L 172 180.5 L 171 181.5 L 171 184.5 L 170 185.5 L 170 187.5 L 169 188.5 L 169 190.5 L 168 191.5 L 167 196.5 L 165 199.5 L 165 201.5 L 161 209.5 L 159 211.5 L 157 216.5 L 155 218.5 L 154 221.5 L 152 223.5 L 152 224.5 L 149 227.5 L 149 228.5 L 144 234.5 L 144 235.5 L 141 238.5 L 141 239.5 L 137 243.5 L 137 244.5 L 130 252.5 L 128 256.5 L 125 259.5 L 125 260.5 L 121 265.5 L 119 270.5 L 117 272.5 L 113 280.5 L 113 282.5 L 110 287.5 L 110 289.5 L 109 290.5 L 109 292.5 L 107 296.5 L 107 299.5 L 106 300.5 L 106 303.5 L 105 304.5 L 105 308.5 L 104 309.5 L 104 314.5 L 103 315.5 L 103 340.5 L 104 341.5 L 104 346.5 L 105 347.5 L 105 351.5 L 106 352.5 L 106 355.5 L 107 356.5 L 107 358.5 L 108 359.5 L 108 361.5 L 109 362.5 L 110 367.5 L 112 370.5 L 112 372.5 L 116 380.5 L 118 382.5 L 121 388.5 L 124 391.5 L 124 392.5 L 135.5 404 L 136.5 404 L 144.5 410 L 150.5 413 L 155.5 414 L 156.5 415 L 159.5 415 L 160.5 416 L 164.5 416 L 165.5 417 L 187.5 417 L 188.5 416 L 195.5 416 L 196.5 415 L 202.5 415 L 203.5 414 L 212.5 413 L 213.5 412 L 216.5 412 L 217.5 411 L 219.5 411 L 223.5 409 L 226.5 409 L 227.5 408 L 232.5 407 L 235.5 405 L 237.5 405 L 240.5 403 L 242.5 403 L 258.5 395 L 260.5 393 L 263.5 392 L 265.5 390 L 266.5 390 L 268.5 388 L 269.5 388 L 271.5 386 L 275.5 384 L 285.5 375 L 286.5 375 L 300 361.5 L 300 360.5 L 306 354.5 L 306 353.5 L 309 350.5 L 309 349.5 L 314 343.5 L 319 333.5 L 321 331.5 L 325 323.5 L 325 321.5 L 327 318.5 L 327 316.5 L 329 313.5 L 329 311.5 L 330 310.5 L 330 308.5 L 332 304.5 L 332 301.5 L 333 300.5 L 333 297.5 L 334 296.5 L 334 293.5 L 335 292.5 L 335 287.5 L 336 286.5 L 336 282.5 L 337 281.5 L 337 271.5 L 338 270.5 L 338 252.5 L 337 251.5 L 337 242.5 L 336 241.5 L 336 236.5 L 335 235.5 L 335 230.5 L 334 229.5 L 333 222.5 L 332 221.5 L 332 219.5 L 331 218.5 L 331 215.5 L 329 212.5 L 328 207.5 L 320 191.5 L 320 189.5 L 318 187.5 L 316 182.5 L 314 180.5 L 313 177.5 L 311 175.5 L 311 174.5 L 309 172.5 L 309 171.5 L 307 169.5 L 305 165.5 L 302 162.5 L 302 161.5 L 299 158.5 L 299 157.5 L 295 153.5 L 295 152.5 L 290 147.5 L 290 146.5 L 277 132.5 L 277 131.5 L 269 123.5 L 269 122.5 L 262 115.5 L 262 114.5 L 245 96.5 L 245 95.5 L 237 87.5 L 237 86.5 L 229 78.5 L 229 77.5 L 217 64.5 L 217 63.5 L 212 58.5 L 212 57.5 L 207 52.5 L 207 51.5 L 201 45.5 L 201 44.5 L 197 40.5 L 197 39.5 L 192 34.5 L 192 33.5 L 188 29.5 L 188 28.5 Z M 214 196.5 L 214.5 196 L 250.5 196 L 251.5 197 L 253.5 197 L 255 198.5 L 255 230.5 L 256 231.5 L 256 234.5 L 255 235.5 L 255 239.5 L 256 240.5 L 256.5 243 L 297.5 243 L 301 245.5 L 301 285.5 L 296.5 289 L 256.5 289 L 255 290.5 L 256 291.5 L 255 292.5 L 255 332.5 L 252.5 335 L 213.5 335 L 211.5 334 L 210 331.5 L 210 289.5 L 209.5 289 L 168.5 289 L 166.5 288 L 164 284.5 L 164 247.5 L 166.5 244 L 168.5 243 L 209.5 243 L 210 242.5 L 210 200.5 L 211 198.5 Z"
        fill="currentColor"
      />
    </svg>
  );
}

const ICONS = {
  "پوست و مو": (
    <path d="M12 3c3 3.500 5 6.200 5 9.200A5 5 0 0 1 12 17a5 5 0 0 1-5-4.800C7 9.200 9 6.500 12 3Zm0 16c-2.500-2-4-3.800-4-5.500 1.800.3 3.200 1.200 4 2.600.8-1.400 2.200-2.300 4-2.600 0 1.700-1.500 3.500-4 5.500Z" />
  ),
  لیزر: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  "ماساژ و اسپا": (
    <path d="M12 4c-1.500 3-1.500 5 0 7 1.500-2 1.500-4 0-7Zm-6 5c-.5 3 .5 5 3 6.500.5-3-.5-5-3-6.500Zm12 0c.5 3-.5 5-3 6.500-.5-3 .5-5 3-6.500ZM5 18h14v2H5v-2Z" />
  ),
};
export function ServiceIcon({ group, color }) {
  return (
    <span
      className="cl-sicon"
      style={{ "--tile": color || "var(--color-brand-600)" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
        {ICONS[group] || ICONS["پوست و مو"]}
      </svg>
    </span>
  );
}

export function Avatar({ name, color, size = 56 }) {
  return (
    <span
      className="cl-avatar"
      style={{
        "--tile": color || "var(--color-brand-600)",
        width: size,
        height: size,
        fontSize: size * 0.36,
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function Stars({ value = 0, label }) {
  const v = Math.round(Number(value) || 0);
  return (
    <span
      className="cl-stars"
      role="img"
      aria-label={label || `امتیاز ${nf(v)} از ${nf(5)}`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          width="16"
          height="16"
          className={i <= v ? "on" : ""}
          aria-hidden="true"
        >
          <path d="m10 1.500 2.600 5.400 5.900.8-4.300 4.100 1 5.800L10 14.800 4.800 17.600l1-5.800L1.500 7.700l5.900-.8L10 1.500Z" />
        </svg>
      ))}
    </span>
  );
}

/** Loading / empty / error block shared by every data screen. */
export function StateBox({
  kind = "loading",
  title,
  text,
  onRetry,
  action,
  icon,
  className,
}) {
  if (kind === "loading") {
    return (
      <div
        className={`cl-state cl-state-loading${className ? ` ${className}` : ""}`}
        role="status"
        aria-live="polite"
        data-testid="loading-state"
      >
        <span className="cl-spinner" aria-hidden="true" />
        <p className="cl-state-title">{title || "در حال بارگذاری…"}</p>
      </div>
    );
  }
  return (
    <div
      className={`cl-state cl-state-${kind}${className ? ` ${className}` : ""}`}
      role={kind === "error" ? "alert" : "status"}
    >
      {icon}
      <p className="cl-state-title">
        {title ||
          (kind === "error" ? "دریافت اطلاعات انجام نشد" : "موردی پیدا نشد")}
      </p>
      {text ? <p className="cl-state-text cl-muted">{text}</p> : null}
      {kind === "error" && onRetry ? (
        <button
          type="button"
          className="cl-btn cl-btn-outline"
          onClick={onRetry}
        >
          تلاش دوباره
        </button>
      ) : null}
      {action}
    </div>
  );
}

export function FilterBar({
  items = [],
  value = "all",
  onChange,
  label = "فیلترها",
  allLabel = "همه",
}) {
  if (!items || items.length <= 1) return null;
  return (
    <div className="cl-filters" role="group" aria-label={label}>
      <button
        type="button"
        className={`cl-pill${value === "all" ? " on" : ""}`}
        aria-pressed={value === "all"}
        onClick={() => onChange("all")}
      >
        {allLabel}
      </button>
      {items.map((item) => {
        const key =
          typeof item === "string" ? item : item.key || item.id || item.value;
        const text = typeof item === "string" ? item : item.label || item.name;
        const isSelected = value === key;
        return (
          <button
            key={key}
            type="button"
            className={`cl-pill${isSelected ? " on" : ""}`}
            aria-pressed={isSelected}
            onClick={() => onChange(key)}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

export function SkeletonGrid({ n = 3, cols = 3 }) {
  const colClass =
    cols === 4 ? "cl-grid-4" : cols === 2 ? "cl-grid-2" : "cl-grid-3";
  return (
    <div
      className={`cl-grid ${colClass}`}
      aria-busy="true"
      aria-label="در حال بارگذاری"
    >
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="cl-card cl-skel" style={{ height: 210 }} />
      ))}
    </div>
  );
}

export function FaqToggleIcon() {
  return (
    <span className="cl-faq-toggle-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" focusable="false">
        <path className="cl-faq-toggle-vertical" d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    </span>
  );
}

export function FaqSkeleton({ n = 4, className = "" }) {
  const widths = ["68%", "82%", "56%", "74%", "62%"];
  return (
    <div
      className={`cl-faq cl-faq-skel${className ? ` ${className}` : ""}`}
      aria-busy="true"
      aria-label="در حال بارگذاری پرسش‌ها"
    >
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="cl-card cl-faq-skel-item">
          <div
            className="cl-faq-skel-line cl-skel"
            style={{ width: widths[i % widths.length] }}
          />
          <div className="cl-faq-skel-btn cl-skel" />
        </div>
      ))}
    </div>
  );
}

export function PageHead({ eyebrow, title, lead, children }) {
  return (
    <header className="cl-pagehead">
      <div className="cl-wrap cl-rv">
        {eyebrow ? <p className="cl-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {lead ? <p className="cl-lead">{lead}</p> : null}
        {children}
      </div>
    </header>
  );
}

export function SectionHead({
  eyebrow,
  title,
  moreTo,
  moreLabel,
  light = false,
}) {
  return (
    <div className="cl-sechead cl-rv">
      <div>
        {eyebrow ? (
          <p className={`cl-eyebrow${light ? " cl-eyebrow-light" : ""}`}>
            {eyebrow}
          </p>
        ) : null}
        <h2>{title}</h2>
      </div>
      {moreTo && moreLabel ? (
        <Link to={moreTo} className="cl-more">
          <span>{moreLabel}</span>
          <ChevronLeft size={18} strokeWidth={2.4} aria-hidden="true" className="cl-more-arrow" />
        </Link>
      ) : null}
    </div>
  );
}

export function ServiceCard({ service, staffCount, compact = false }) {
  const id = idOf(service);
  const imageSrc = serviceImageFor(service);
  const imageFallback = serviceImageFor({ ...service, image: undefined });
  const pkg = service.package?.enabled ? service.package : null;
  return (
    <article
      className={`cl-card cl-service cl-rv${compact ? " cl-service-compact" : ""}`}
      style={{ "--tile": service.color || "var(--color-brand-600)" }}
    >
      <div className="cl-service-visual" aria-hidden="true">
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => {
            if (event.currentTarget.dataset.fallback) return;
            event.currentTarget.dataset.fallback = 'true';
            event.currentTarget.src = imageFallback;
          }}
        />
        <span className="cl-service-group">{service.group || "خدمات تخصصی"}</span>
        <ServiceIcon group={service.group} color={service.color} />
      </div>
      <h3>
        <Link to={`/services/${id}`} className="cl-stretch">
          {service.name}
        </Link>
      </h3>
      <p className="cl-muted cl-clamp">{service.description}</p>
      {pkg ? (
        <p className="cl-badge">
          {pkg.name} · {nf(pkg.sessionCount)} جلسه
        </p>
      ) : null}
      <dl className="cl-meta">
        <div>
          <dt>مدت</dt>
          <dd>{durationLabel(service.durationMinutes)}</dd>
        </div>
        <div>
          <dt>هزینه</dt>
          <dd>{money(service.price, service.currency)}</dd>
        </div>
        {staffCount ? (
          <div>
            <dt>متخصص</dt>
            <dd>{nf(staffCount)} نفر</dd>
          </div>
        ) : null}
      </dl>

      <div className="cl-card-actions cl-service-actions">
        <Link
          to={`/book?service=${id}`}
          className="cl-btn cl-btn-sm cl-btn-primary cl-btn-book"
        >
          رزرو این خدمت
        </Link>
      </div>
    </article>
  );
}

export function StaffCard({ person, services = [] }) {
  const id = idOf(person);
  const remaining = services.length - 2;
  const primaryService = services[0];
  const image = staffImageFor(person, services);
  const imageFallback = staffImageFor({ ...person, avatar: undefined, image: undefined }, services).src;
  const bookingTo = primaryService
    ? `/book?service=${idOf(primaryService)}&staff=${id}`
    : `/book?staff=${id}`;

  return (
    <article
      className="cl-card cl-person cl-rv"
      style={{ "--tile": person.color || "var(--color-brand-600)" }}
    >
      <div className={`cl-person-art${image.isPortrait ? " has-portrait" : ""}`}>
        <img
          className="cl-person-photo"
          src={image.src}
          alt={image.isPortrait ? person.name : ""}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            if (event.currentTarget.dataset.fallback) return;
            event.currentTarget.dataset.fallback = 'true';
            event.currentTarget.src = imageFallback;
            event.currentTarget.alt = '';
            event.currentTarget.closest('.cl-person-art')?.classList.remove('has-portrait');
          }}
        />
        <span className="cl-person-art-note">نمایی از فضای درمان</span>
        <span className="cl-person-art-avatar">
          <Avatar name={person.name} color={person.color} size={52} />
        </span>
      </div>
      <div className="cl-person-body">
        <h3>
          <Link to={`/team/${id}`} className="cl-stretch">
            {person.name}
          </Link>
        </h3>
        <p className="cl-person-title">{person.title}</p>
        <p className="cl-muted cl-clamp">{person.bio}</p>
        {services.length ? (
          <p className="cl-tags">
            {services.slice(0, 2).map((s) => (
              <span key={idOf(s)} className="cl-chip">
                {s.group || s.name}
              </span>
            ))}
            {remaining > 0 ? (
              <span
                className="cl-chip cl-chip-more"
                aria-label={`${nf(remaining)} خدمت دیگر`}
              >
                +{nf(remaining)}
              </span>
            ) : null}
          </p>
        ) : null}
        <div className="cl-card-actions">
          <Link
            to={bookingTo}
            className="cl-btn cl-btn-sm cl-btn-primary cl-btn-book"
          >
            رزرو نوبت
          </Link>
          <Link to={`/team/${id}`} className="cl-btn cl-btn-sm cl-btn-outline">
            مشاهدهٔ رزومه
          </Link>
        </div>
      </div>
    </article>
  );
}
