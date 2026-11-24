# Niloofar Clinic — Design System Specification

> **Design Language Reference Document (DESIGN.md)**  
> Based on clinical user experience analysis, home page visual identity, healthcare design principles, and web interface standards (`web-design-guidelines` and interaction design engineering).

---

## 1. Design Principles & Philosophy

This platform is crafted for patients and visitors of an aesthetic, wellness, and medical clinic. When booking appointments, users require **Trust**, **Visual Calm**, **Information Clarity**, and a **Fast Path to Booking**.

1. **Clinical Calm & Warmth**: Avoid harsh, hyper-saturated or jarring colors. Use clinical teal (`--color-brand-600`) to evoke hygiene and professionalism, paired with carefully measured warm rose (`--color-rose-600`) accents for comfort and hospitality.
2. **Cognitive Load Reduction**: Available time slots, prices, and treatment durations must be instantly scannable. Booking must never hide behind convoluted multi-step forms.
3. **Uncompromising Accessibility**: Every text, interactive element, and indicator must satisfy WCAG AA standards (minimum 4.5:1 contrast for normal text, 3:1 for graphical elements and large text).
4. **RTL-First Ergonomics**: Native right-to-left alignment, CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline-*`), Persian typography line-heights, and localized numeral formatting (`۰۱۲۳۴۵۶۷۸۹`).
5. **Restrained, Dignified Motion**: Motion must be calm, smooth, and free of bounce or overshoot (`var(--ease): cubic-bezier(0.16, 1, 0.3, 1)`), projecting the poise of a professional healthcare practice.

---

## 2. Color Tokens & Semantic Usage

Colors are declared in [`app/src/styles/tokens.css`](file:///f:/iNorth/inorth-gallery/gallery/clinic-booking/app/src/styles/tokens.css) and [`app/src/styles/site.css`](file:///f:/iNorth/inorth-gallery/gallery/clinic-booking/app/src/styles/site.css), accessible via CSS custom properties and Tailwind CSS v4 utilities.

### 2.1. Core Color Palettes

| Token Name | CSS Custom Property | Hex Value | Semantic Role / Usage |
| :--- | :--- | :--- | :--- |
| **Brand 50** | `--color-brand-50` | `#f0fdfa` | Tinted light band background (`.cl-band`), subtle chips, soft highlight |
| **Brand 100** | `--color-brand-100` | `#ccfbf1` | Subtle borders of light bands and active chip outlines |
| **Brand 200** | `--color-brand-200` | `#99f6e4` | Active card borders, verified badges on dark surfaces |
| **Brand 300** | `--color-brand-300` | `#5eead4` | Quote mark glyphs on dark themes, soft cyan accents |
| **Brand 500** | `--color-brand-500` | `#0d9488` | Focus ring indicator (`:focus-visible`), active element highlights |
| **Brand 600** | `--color-brand-600` | `#0f766e` | Primary brand color (main buttons, icons, avatars, section accents) |
| **Brand 700** | `--color-brand-700` | `#115e59` | Dark brand accent, primary featured Bento card, loyalty card gradient |
| **Brand 800** | `--color-brand-800` | `#134e4a` | Dark gradient start (`--cl-gradient-dark`), primary button hover |
| **Brand 950** | `--color-brand-950` | `#042f2e` | Dark gradient end, site footer (`.cl-foot`), deepest surface |
| **Rose 50** | `--color-rose-50` | `#fdf2f4` | Background tint for promotional chips and special discounts |
| **Rose 100** | `--color-rose-100` | `#fbe3e8` | **WARNING:** Border only for tiny rose tags; NEVER use for full-width sections |
| **Rose 200** | `--color-rose-200` | `#f6c7d1` | Eyebrow text on dark gradient surfaces (`.cl-eyebrow-light`) |
| **Rose 500** | `--color-rose-500` | `#d05a75` | Active hero slider indicator dot (`.cl-hero-dot.on`), warm glows |
| **Rose 600** | `--color-rose-600` | `#b4415b` | Key booking action button (`.cl-btn-rose`), eyebrow text on light surface |
| **Rose 700** | `--color-rose-700` | `#8f3248` | High-contrast text on light rose badges |
| **Surface** | `--color-surface` | `#f4f8f7` | Default site page background (`body`, `.cl-app`, `.cl-bg`) |
| **Card** | `--cl-card` | `#ffffff` | Background of standard cards on light surfaces |
| **Ink** | `--color-ink` | `#1d2523` | Primary text and headings on light backgrounds (> 11:1 contrast) |
| **Muted** | `--color-muted` | `#5d6563` | Secondary descriptions, metadata, and dates (> 4.8:1 contrast) |
| **Border** | `--color-neutral-200` | `#e4dfdb` | Standard card borders and dividers on light surface (`--cl-line`) |

---

### 2.2. Section Background Rhythm Rules

> [!IMPORTANT]
> **Golden Section Rule (Permanently Preventing the Testimonials Clash):**
> Saturated, raw, or standalone pink backgrounds (such as the legacy `#fbe3e8`) are strictly prohibited for full-width sections. The vertical rhythm of pages must strictly adhere to the alternating cadence:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HERO SLIDER BANNER (Dark Cinematic Background + Left Overlay NextSlot on Desktop) │
├─────────────────────────────────────────────────────────────┤
│ 2. SLIM TRUST STRIP (.cl-trust-strip) / NextSlot in normal flow on mobile │
├─────────────────────────────────────────────────────────────┤
│ 3. SERVICES BENTO GRID (Light Surface: var(--cl-bg) #f4f8f7) │
├─────────────────────────────────────────────────────────────┤
│ 4. TEAM SECTION BAND (Light Brand Band: var(--cl-band))     │
├─────────────────────────────────────────────────────────────┤
│ 5. PACKAGES SECTION (Light Surface: var(--cl-bg) #f4f8f7)   │
├─────────────────────────────────────────────────────────────┤
│ 6. TESTIMONIALS BAND (Dark Gradient: var(--cl-gradient-dark))│
├─────────────────────────────────────────────────────────────┤
│ 7. FAQ ACCORDION (Light Surface: var(--cl-bg) #f4f8f7)      │
├─────────────────────────────────────────────────────────────┤
│ 8. FINAL BOOKING CTA BAND (Dark Gradient: var(--cl-cta))    │
├─────────────────────────────────────────────────────────────┤
│ 9. FOOTER (Deep Brand Dark: var(--color-brand-950))         │
└─────────────────────────────────────────────────────────────┘
```

#### Guidelines for Full-Width Bands:
1. **Light Tint Bands (`.cl-band`)**:
   - Must use standard background `var(--cl-teal-soft)` (`#f0fdfa`) with boundary border `border-block: 1px solid var(--color-brand-100)`.
   - Cards inside this band are pure white (`#ffffff`) with `--cl-line` borders.
2. **Dark Gradient Bands (`.cl-band-reviews` and `.cl-cta`)**:
   - Both sections must exclusively consume the single token `--cl-gradient-dark: linear-gradient(135deg, var(--color-brand-800), var(--color-brand-950))`.
   - Cards within dark bands must be translucent glassmorphic (`rgba(255, 255, 255, 0.07)` with `backdrop-filter: blur(12px)` and border `rgba(255, 255, 255, 0.14)`).
3. **Dark Section Separation Rule**:
   - Two dark sections must never sit immediately adjacent to each other. A light surface section (`.cl-section.cl-wrap`, `#f4f8f7`) like the FAQ accordion must always separate them.

---

### 2.3. Feedback & State Palette

To ensure WCAG AA compliance, raw state colors must never be used directly as text on light surfaces. Always use the `-ink` tokens:

- **Error**:
  - Background / Border: `#fff1f1` / `#f1c5c7`
  - Message Text: `var(--color-state-error-ink)` (`#bb171c` — 6.8:1 contrast)
- **Success**:
  - Background / Border: `#e6f6ea` / `#a7f3d0`
  - Message Text: `var(--color-state-success-ink)` (`#006e1c` — 6.5:1 contrast)
- **Warning**:
  - Background / Border: `#fff4d6` / `#fde68a`
  - Message Text: `var(--color-state-warning-ink)` (`#785900` — 7.1:1 contrast)

---

## 3. Typography Scale & Persian/RTL Typography

### 3.1. Typefaces

- **Primary UI & Headings Font**: `Vazirmatn` (Variable weight 100–900, self-hosted at `/fonts/vazirmatn-arabic.woff2` and `/fonts/vazirmatn-latin.woff2`, zero external CDN dependencies).
- **Secondary Display / Numerals Font**: `Estedad` (Modern geometric accents).
- **System Fallbacks**: `system-ui, Tahoma, sans-serif`.
- **Strict Rule**: Never apply Latin-only fonts (e.g. Inter or Roboto) to Persian body text; they lack Persian glyphs and disrupt word shapes.

### 3.2. Type Scale & Line Heights

Persian typography requires taller line-heights (`line-height`) than Latin (an extra `+0.15` to `+0.25`) to accommodate diacritics, dots, and tall ascenders:

| Level | Element / Class | Weight | Font Size | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Display / H1** | `h1`, `.cl-hero-slide-title` | 700 (Bold) | `clamp(1.7rem, 4.6vw, 2.6rem)` | `1.35` |
| **Section Head (H2)** | `h2` | 700 (Bold) | `clamp(1.25rem, 3vw, 1.7rem)` | `1.35` |
| **Card Head (H3)** | `h3` | 700 (Bold) | `1.08rem` – `1.15rem` | `1.4` |
| **Lead Paragraph** | `.cl-lead` | 400 (Regular) | `1.05rem` | `1.9` |
| **Body Paragraph** | `p`, `blockquote` | 400 (Regular) | `0.95rem` – `1rem` | `1.7` – `1.85` |
| **Eyebrow / Overline** | `.cl-eyebrow` | 700 (Bold) | `0.85rem` | `1.2` (with accent dash) |
| **Small / Metadata** | `.cl-small`, `.cl-meta` | 500 / 600 | `0.78rem` – `0.85rem` | `1.5` |

### 3.3. Persian Numerals and Formatting
- All displayed numbers must be passed through `nf(number)` to render Persian numerals (`۱۲ جلسه`, never `12 جلسه`).
- All currency values must use `money(amount, currency)` with clear Persian denomination (`تومان`).
- Rating star containers (`.cl-stars`) must enforce `direction: ltr; unicode-bidi: isolate;` so stars fill naturally from start to end without flipping.

---

## 4. Spacing, Layout & Elevation

### 4.1. Containers & Grid Structure

- **Standard Max Width (`.cl-wrap`)**: `max-width: 72rem` (`1152px`).
- **Focused Max Width (`.cl-narrow`)**: `max-width: 46rem` (`736px`).
- **Gutter Padding**: `padding-inline: 1rem` (mobile) to `1.5rem` (desktop).
- **Vertical Section Padding (`.cl-section`)**:
  - Mobile (< 640px): `padding-block: 1.75rem`
  - Tablet & Desktop: `padding-block: 2.5rem` to `3.5rem`

### 4.2. Border Radii

- **Buttons & Controls**: `var(--radius-button)` = `12px`
- **Cards (Service, Team, Review)**: `var(--radius-lg)` = `18px` – `20px`
- **Dialogs & Large Containers**: `22px` – `28px`
- **Chips, Badges & Pills**: `9999px` (full pill)

### 4.3. Elevation & Shadows

- **Subtle Card Shadow (`--shadow-sm`)**: `0 1px 2px rgb(29 37 35 / 0.06)`
- **Hover Card Lift (`--shadow-md`)**: `0 12px 32px rgb(15 118 110 / 0.10)`
- **Dark Surface Glass Cards**: `0 4px 20px rgb(0 0 0 / 0.18), 0 1px 3px rgb(0 0 0 / 0.12)`
- **Rose Booking CTA Shadow**: `0 8px 20px rgb(180 65 91 / 0.28)`

---

## 5. Component Patterns

### 5.1. Buttons & Action Links

- **Minimum Touch Target**: All interactive controls must satisfy `min-height: 44px` and `min-width: 44px`.
- **Button Variants**:
  1. `.cl-btn-primary`: Teal brand background (`--color-brand-600`) with white text.
  2. `.cl-btn-rose`: Primary clinic booking action (`--color-rose-600`) with vibrant shadow.
  3. `.cl-btn-outline`: White background with subtle teal outline (`--color-brand-200`) for secondary actions.
  4. `.cl-btn-glass`: Translucent button for dark hero slides or banners.
  5. `.cl-btn-ghost`: Borderless button with gentle transparent hover.

### 5.2. Section Headers (`SectionHead`)

Section headers must follow the unified `<SectionHead />` component pattern:
```jsx
<SectionHead
  eyebrow="خدمات"
  title="مراقبت‌هایی که برای شما می‌چینیم"
  moreTo="/services"
  moreLabel="همهٔ خدمات"
/>
```
- On dark gradient surfaces, pass the `light` prop to activate `.cl-eyebrow-light` (`var(--color-rose-200)` with 6.5:1 contrast).

### 5.3. Cards & Extended Click Area (`.cl-stretch`)

- **Bento Service Grid (`.cl-service`)**:
  First card is emphasized with deep brand gradient while remaining cards have clean light surfaces. Uses a vertical flex column layout with `margin-top: auto` on `.cl-service-actions` so bottom action buttons (`رزرو این خدمت`) dock uniformly at the card baseline regardless of content height or package badge presence.
- **Accessible Card Link Pattern (`.cl-stretch`)**:
  Card titles contain an `<a>` tag with `.cl-stretch`, extending the click surface over the card with `::after` without compromising screen reader hierarchy.
- **Keyboard Focus Ring**:
  `.cl-service:has(.cl-stretch:focus-visible)` highlights the full card boundary during keyboard navigation without intrusive mouse outlines.

### 5.4. Filter Bar (`FilterBar`)

- **Role & Ergonomics**: Used for browsing and comparison pages (e.g. `/services` and `/team`) to filter items by category or specialty.
- **Structure**: Rendered via `<FilterBar items={...} value={...} onChange={...} label="دسته‌بندی" allLabel="همه" />`.
- **Styling**: Uses `.cl-filters` container with `.cl-pill` buttons:
  - **Inactive state**: Solid white card background (`#fff`) with subtle neutral border (`var(--cl-line)`).
  - **Hover state (Inactive)**: Soft clinical teal tint (`var(--cl-teal-soft)` / `#f0fdfa`), crisp teal brand border (`var(--cl-teal)` / `#0f766e`), and high-contrast deep teal typography (`var(--cl-teal-d)` / `#134e4a`, 9.5:1 contrast).
  - **Active state (`.cl-pill.on`)**: Solid primary brand fill (`var(--cl-teal)`) with white text and border.
  - **Hover state (Active)**: Deep brand teal fill (`var(--cl-teal-d)` / `#134e4a`) matching primary button hover behavior.
  - **Micro-interaction**: Smooth 150ms transitions on background, border, and text color, with subtle active-press response (`transform: translateY(1px) scale(.99)`).
- **Accessibility**:
  - Encapsulated in `<div className="cl-filters" role="group" aria-label="...">`.
  - Every filter button exposes its active state to assistive technology via `aria-pressed={true | false}`.
  - Satisfies `min-height: 44px` touch targets.
- **Empty State Guideline**: When a filter returns 0 items, display a `<StateBox kind="empty" />` with an action button that resets the filter back to `"all"` (`نمایش همه`).

### 5.5. Card Actions Pattern (`.cl-card-actions`)

- **Dual-Action Layout**: Both `ServiceCard` and `StaffCard` feature a standardized bottom action row:
  - **Primary Action**: Direct booking button (`.cl-btn.cl-btn-sm.cl-btn-primary.cl-btn-book`), flexed to fill available width.
  - **Secondary Action**: Detail/Profile link (`.cl-btn.cl-btn-sm.cl-btn-outline`).
- **Interaction Layering with `.cl-stretch`**:
  - The card actions container uses `position: relative; z-index: 2; margin-top: auto; padding-top: 0.65rem; border-top: 1px dashed var(--cl-line);`.
  - Because `z-index: 2` elevates the buttons above the card's `::after` overlay (`z-index: 1`), clicking either button directly triggers its specific link/action, while clicking anywhere else on the card body navigates to the card's primary route via `.cl-stretch`.

### 5.6. Skeleton Grid Stability (`SkeletonGrid` with `cols`)

- **CLS Prevention**: `<SkeletonGrid n={...} cols={2 | 3 | 4} />` guarantees that skeleton placeholder cards render using the exact grid template class (`.cl-grid-2`, `.cl-grid-3`, or `.cl-grid-4`) as the loaded data grid.
- **Rule**: Whenever creating a loading skeleton, pass `cols` matching the target page layout (e.g., `cols={4}` for `/team`, `cols={2}` for `/packages`, `cols={3}` for `/services`). Defaults to `3`.

### 5.7. Empty States (`StateBox` & `.cl-reviews-empty`)

- **Solid Surface Rule**: Empty states must use an opaque solid surface (`var(--cl-card, #ffffff)`). Never use semi-transparent gradients that bleed underlying container colors.
- **Card Geometry & Harmony**: For testimonial and content sections, empty states share the card's `20px` border radius (`border-radius: 20px`), solid `1.5px` brand border (`var(--color-brand-100, #ccfbf1)`), and comfortable padding (`2.5rem 2rem` on desktop, `2rem 1.25rem` on mobile).
- **Text & Icon Contrast (WCAG AAA)**:
  - Title: `var(--cl-ink, #0f172a)` $\rightarrow$ **16.6:1** contrast ratio.
  - Secondary Text: `var(--color-neutral-600, #475569)` $\rightarrow$ **7.1:1** contrast ratio.
  - Icon Badge: 48px circle badge in `var(--cl-teal-soft, #f0fdfa)` with `var(--cl-teal, #0f766e)` icon $\rightarrow$ **4.8:1** contrast ratio.
- **Dark Section Isolation**: When rendered inside dark gradient bands like `.cl-band-reviews`, `.cl-state` explicitly isolates text colors from inherited `#fff`, ensuring the card remains crisp, elevated, and readable across both light and dark parent sections.

---

## 6. Motion & Interaction Rules

Motion in a clinic app must feel **reassuring, steady, and distraction-free**.

1. **GPU-Optimized Properties Only**:
   - Only `transform` and `opacity` may be animated.
   - Never animate layout properties (`width`, `height`, `margin`, `padding`, `top`, `left`).
2. **Timing Scale**:
   - Micro-interactions (hover, active): `120ms` – `180ms`.
   - Card lifts and transitions: `220ms` with smooth cubic curve (`var(--ease): cubic-bezier(0.16, 1, 0.3, 1)`).
   - Hero slider slide changes: `600ms` – `750ms` (with a layered 250ms text entry delay).
3. **Respect Reduced Motion (`prefers-reduced-motion`)**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
   The hero slider drops lateral sliding and gracefully falls back to a simple opacity cross-fade.
4. **Autoplay Pausing & Motion Control**:
   Any automated movement must automatically pause immediately on pointer hover and keyboard focus, and completely stop when `prefers-reduced-motion` is active. Hero banners provide direct slide navigation dots and previous/next arrows.

---

## 7. Persian & RTL Engineering Rules

1. **Strict Logical Properties**:
   - Never write `margin-left`, `margin-right`, `padding-left`, or `left/right`.
   - Always use `margin-inline-start`, `margin-inline-end`, `padding-inline`, and `inset-inline-*`.
2. **Directional Arrow Icons**:
   - Forward / Next in RTL: `‹` (points left).
   - Back / Previous in RTL: `›` (points right).
3. **Punctuation & Zero-Width Non-Joiner (ZWNJ)**:
   - Use Persian quotes `« »` or balanced quotes.
   - Punctuation attaches directly to the preceding word without spaces.
   - Use ZWNJ (نیم‌فاصله) for compound words and prefixes: `نوبت‌دهی`, `چندجلسه‌ای`, `می‌گویند`, `تأییدشده`.

---

## 8. Page Personalities & Variation Axes

To prevent visual monotony across the product while strictly adhering to the design tokens and component foundations, each page possesses a defined **Page Personality**. Variation is expressed through **layout structure, density, background sequence, signature elements, and visual hierarchy**, never through ad-hoc colors or foreign fonts.

### 8.1. System Invariants (What Must Stay Fixed)
- **Design Tokens**: Colors exclusively from `tokens.css` (`--color-brand-*`, `--color-rose-*`, `--cl-bg`, `--cl-card`, `--cl-ink`, `--cl-muted`, `--cl-line`).
- **Typography**: Single typeface `Vazirmatn` with Persian numerals (`nf()`) and Persian currency format (`money()`).
- **Accessibility & Touch**: WCAG AA contrast (min 4.5:1 text, 3:1 graphics), 44×44px minimum interactive targets, visible focus rings, native RTL logical properties.
- **Section Banding Harmony**: No saturated pink full-width backgrounds; dark sections exclusively consume `--cl-gradient-dark`; two dark bands never touch directly.
- **Motion Ceiling**: Dignified and calm (`var(--ease)` cubic-bezier(0.16, 1, 0.3, 1), max 250ms for UI transitions).

### 8.2. System Variation Axes (What May Vary)
1. **Header Architecture**: Split editorial vs. compact catalog toolbars vs. full-viewport media hero vs. tiered value banner.
2. **Layout & Density**: Side-by-side comparison matrix vs. high-density categorized directory vs. human-centric portrait cards.
3. **Section Cadence**: Single light canvas vs. rhythmic light/tinted/dark band alternations.
4. **Accent Lead**: Clinical Teal (precision/hygiene) vs. Warm Rose (care/empathy) vs. Value/Savings emphasis.
5. **Signature Element**: A unique functional component tailored to that page's specific patient decision stage.

---

### 8.3. Page Personality Specifications

#### 1. Home Page (`/`) — *The Welcoming Gateway & Instant Trust*
- **Journey Role & Emotion**: Welcomes the patient, validates clinic prestige and medical hygiene, and provides an instant path to booking.
- **Header Architecture**: Full-viewport cinematic slider (`100svh`) with physical-left overlaid `NextSlot` quick-booking card and centered dot indicators.
- **Layout & Density**: Sectional showcase rhythm — Hero $\rightarrow$ Trust Strip $\rightarrow$ 3-Card Equal Flex Services $\rightarrow$ Multi-session Teaser $\rightarrow$ Team Spotlight Band $\rightarrow$ Testimonials Band $\rightarrow$ FAQ $\rightarrow$ Final CTA.
- **Background Sequence**: Dark Hero $\rightarrow$ Soft Teal Trust (`#f0fdfa`) $\rightarrow$ Light Surface (`#f4f8f7`) $\rightarrow$ Dark Reviews (`--cl-gradient-dark`) $\rightarrow$ Light Band $\rightarrow$ Dark CTA.
- **Brand Accent Lead**: Balanced Teal (`--color-brand-600`) with vibrant Rose booking actions (`--color-rose-600`).
- **Signature Element**: Live `NextSlot` quick-booking card with instant today/tomorrow time slot links.
- **Motion Character**: Layered parallax hero transitions, smooth dot morphing, gentle scroll cues.

#### 2. Services Page (`/services`) — *The Clinical Catalog & Treatment Explorer*
- **Journey Role & Emotion**: Empowering and diagnostic. Helps patients compare treatments, understand exact procedure durations and pricing, and find the right medical care without friction.
- **Header Architecture**: **Compact Functional Catalog Header** — Clean, utilitarian layout. Instead of an empty decorative banner, the header integrates category navigation pills (`FilterBar`) directly into the bottom of the header zone, accompanied by a quick search/filter count indicator.
- **Layout & Density**: **Structured Categorized Directory (High Density & Scannability)** — Services grouped logically by specialty (Skin Care, Laser Treatments, Massage Therapy). Cards feature clear duration, transparent cost, associated specialist count, and single-click booking.
- **Background Sequence**: Light Gradient Catalog Header (`var(--cl-teal-soft)`) $\rightarrow$ Light Surface Treatment Cards (`var(--cl-bg)`) $\rightarrow$ Consultation Guidance Band (`.cl-band`: "Not sure which treatment suits your skin?") $\rightarrow$ Light FAQ.
- **Brand Accent Lead**: **Clinical Teal Dominant (`--color-brand-600` / `--color-brand-700`)** — Evokes medical expertise, sanitation, precision, and tranquility.
- **Signature Element**: **Quick Category Anchor Navigation & Duration/Cost Scannability Matrix** — Fast, fluid filtering with immediate count feedback (e.g. «نمایش ۵ خدمت پوست»).
- **Motion Character**: Rapid, crisp filter cross-fades (120ms opacity fade) prioritizing instantaneous feedback over sluggish layout morphs.

#### 3. Team Page (`/team`) — *The Human Trust & Medical Credentials Editorial*
- **Journey Role & Emotion**: Reassuring and deeply personal. Patients are placing their face, body, and health in someone's hands; this page must feel warm, authoritative, and medically credible.
- **Header Architecture**: **Asymmetrical Editorial Split Header** — Warm introduction emphasizing physician qualifications, continuing medical education, and patient safety protocols, accompanied by a verified trust badge and specialist count.
- **Layout & Density**: **Portrait Profile Cards (Medium Density, Person-First)** — 4-column desktop grid of elegant portrait cards. Each card highlights the practitioner's portrait/avatar, full name, medical title, specialty badges, affiliated treatments tags, and a dual-action footer ("رزرو با این پزشک" primary + "مشاهده پروفایل" secondary).
- **Background Sequence**: Warm Light Editorial Header (`var(--cl-teal-soft)`) $\rightarrow$ Light Surface Profile Grid (`var(--cl-bg)`) $\rightarrow$ Deep Dark Clinic Standards Band (`--cl-gradient-dark`: "Our Medical Board & Patient Care Standards") $\rightarrow$ Light Assurance Band.
- **Brand Accent Lead**: **Warm Rose & Soft Teal Leading (`--color-rose-600` / `--color-rose-50`)** — Projects human empathy, hospitality, and personalized bedside care.
- **Signature Element**: **Doctor Expertise Tagging & Direct Pre-Selected Booking Action** — One-click booking with that specific doctor preselected in the booking flow (`/book?staff={id}`).
- **Motion Character**: Gentle card lift on hover (`translateY(-4px)` with subtle `--shadow-md`), soft avatar expansion, dignified and steady.

#### 4. Packages Page (`/packages`) — *The Value Proposition & Treatment Commitment*
- **Journey Role & Emotion**: Rewarding, smart, and motivating. Patients here are investing in comprehensive treatment courses (e.g., 6 laser sessions or 4 skin therapy visits); they want clear evidence of financial savings and session flexibility.
- **Header Architecture**: **Tiered Value Banner** — Direct headline on the economic and health advantages of multi-session care ("جلسات برنامه‌ریزی‌شده با تضمین قیمت و صرفه‌جویی"), featuring a prominent value stat banner (e.g. «تا ۳۰٪ صرفه‌جویی در هر جلسه»).
- **Layout & Density**: **Comparison & Value Matrix (Structured Commercial Density)** — 2-column or 3-column prominent package cards. Each card displays:
  - Total package investment vs single-session cumulative cost.
  - Prominent "Savings Badge" (`XX٪ صرفه‌جویی`).
  - Unit breakdown: "هر جلسه معادل X تومان (Y تومان ارزان‌تر از جلسه تکی)".
  - Validity terms, session credits details, and instant online checkout modal.
  - Followed by a dedicated Gift Cards showcase band (`.cl-band`).
- **Background Sequence**: Soft Mint Value Header $\rightarrow$ Light Surface Package Comparison Cards $\rightarrow$ Tinted Gift Card Band (`.cl-band`) $\rightarrow$ Dark Custom Plan CTA Band (`--cl-gradient-dark`: "Need a custom combination package?").
- **Brand Accent Lead**: **Deep Teal (`--color-brand-800`) + Vibrant Savings Badges (`--color-rose-600`)** — Signals smart value, financial advantage, and premium care.
- **Signature Element**: **Unit Economics Calculator Ribbon** on each package card that breaks down exact per-session savings and remaining session redemption rules.
- **Motion Character**: Subtle hover highlight on package cards, smooth modal transition for online checkout.

#### 5. Admin Authentication Gateway (`/admin/login`) — *Secure & Distraction-Free Access*
- **Journey Role & Emotion**: Reassuring, secure, and focused. Designed exclusively for clinic physicians, specialists, and system managers to authenticate without visual distractions or consumer marketing clutter.
- **Header Architecture**: **Dedicated Minimalist Security Header** — Centered clinic brand identity (`Logo`), clear practice title, and high-contrast, uncluttered layout.
- **Layout & Density**: **Elevated Centered Form Card (`max-width: 440px`)** — Centered inside `.cl-admin-login-bg` with generous internal padding (`2rem`–`2.5rem`), resting on a soft clinical radial backdrop (`rgba(15, 118, 110, 0.08)` to `var(--cl-bg)`).
- **Interactive Controls**:
  - Segmented authentication mode pills (`.cl-pill`): "ورود با پیامک (OTP)" and "ورود با رمز عبور" with smooth active states.
  - Standardized `.cl-field` inputs with explicit `inputMode` (`tel`, `numeric`, `password`), monospace digits with `dir="ltr"` for telephone numbers and 6-digit verification codes.
  - WCAG AA compliant alert banner for errors (`#fff1f1`, `--color-state-error-ink`) and confirmation messages (`#e6f6ea`, `--color-state-success-ink`).
  - High-affordance primary submit button (`.cl-btn.cl-btn-primary.cl-btn-block.cl-btn-lg`) with interactive loading spinner during authentication.
  - Discreet secondary link to return to the public storefront (`/`) with directional chevron (`ChevronRight`).
- **Brand Accent Lead**: **Clinical Teal (`--color-brand-600`) & Deep Ink (`--color-ink`)** — Emphasizes institutional security, clinical authority, and operational hygiene.
- **Motion Character**: Snappy 150ms tab transition, calm loading spinner on submit, zero decorative motion.

#### 6. Clinic Backoffice Dashboard (`/admin`) — *Operational Command Center*
- **Journey Role & Emotion**: Crisp, organized, and reliable. Enables practice administrators, receptionists, and clinic directors to oversee appointments, orders, product catalog, team members, and permissions with zero cognitive friction.
- **Header Architecture**: **Sticky Clinical App Bar (`.cl-admin-header`, `64px`)** — Glassmorphic backdrop (`rgba(255, 255, 255, 0.92)` with `backdrop-filter: blur(12px)`), clinic branding (`Logo`), authenticated user badge with role chip, quick link to public storefront ("مشاهده سایت"), and secure sign-out action (`LogOut`).
- **Layout & Density**:
  - **KPI Metrics Ribbon (`.cl-admin-stat-grid`)**: 4 high-density metric cards at the top displaying vital clinic volume: Today's Bookings (with pending alerts), Shop Orders (with unfulfilled alerts), Active Products, and Registered Team Members.
  - **Segmented Horizontal Tab Bar (`.cl-filters`)**: Responsive scrollable tabs (`.cl-pill`) with embedded counts and Lucide icons for instant section jumping (Orders, Bookings, Products, Customers, Team Members, Settings).
  - **Dense Operational Tables (`.cl-admin-table-wrap`)**: Clean, high-legibility tabular layouts with alternating subtle row hovers, localized Persian numerals (`nf()`), localized Jalali dates (`fmtFullDate`, `fmtTime`), and Persian currency formatting (`money()`).
  - **Slide-out / Detail Cards (`.cl-admin-detail-card`)**: Inspection views for order fulfillment and booking status transitions with distinct danger/warning buttons for cancellations and refunds.
- **Background Sequence**: Unified Medical Surface (`var(--cl-bg)` `#f4f8f7`) with pure white elevated workspace cards (`#ffffff`) and standard `--cl-line` dividers.
- **Status Badges Standard (`.cl-admin-badge`)**:
  - `confirmed` / `paid` / `completed`: Soft Emerald (`#e6f6ea`, border `#a7f3d0`, text `#006e1c`)
  - `pending` / `unfulfilled`: Soft Amber (`#fff4d6`, border `#fde68a`, text `#785900`)
  - `cancelled` / `refunded` / `no-show`: Soft Coral (`#fff1f1`, border `#f1c5c7`, text `#bb171c`)
  - `shipped` / `delivered`: Soft Teal (`#f0fdfa`, border `#ccfbf1`, text `#0f766e`)
- **Brand Accent Lead**: **Clinical Teal (`--color-brand-600`)** as primary operational anchor, with Rose (`--color-rose-600`) for urgent actions and notifications.
- **Accessibility & RTL**: Logical properties throughout, explicit button accessibility labels, screen reader announcements for live updates (`role="status"` / `role="alert"`), strict right-to-left layout hierarchy.

