# Self-hosted font choices

These fonts are free to use and redistribute under the SIL Open Font License.
Each catalog family includes its license beside its WOFF2 file. No font CDN is
needed. `catalog.json` (Persian) and `latin-catalog.json` (English additions)
record exact sources, filenames and available weights.
The platform installs their `@font-face` declarations in `src/styles/tokens.css`;
OpenDesign receives `catalog.css` and should import it.

## New Persian-compatible families

| Family | Character and use |
| --- | --- |
| Cairo | Geometric, confident headings; shops, services, contemporary brands |
| Almarai | Compact, clear body copy; navigation and operational interfaces |
| Changa | Squared, expressive headings; technology, sport and bold brands |
| Noto Sans Arabic | Neutral, versatile body copy; multilingual interfaces |
| Lateef | Flowing calligraphic display; cultural and literary pages |
| Scheherazade New | Traditional Naskh; editorial, heritage and long prose |

## English families

| New family | Real variable weights | Character and use |
| --- | --- | --- |
| Fraunces | 100–900 | Expressive editorial serif; optical sizing and distinctive headlines |
| Cormorant Garamond | 300–700 | Elegant, high-contrast serif; luxury, culture and large headings |
| Manrope | 200–800 | Clear contemporary sans; body copy, products and interfaces |
| Sora | 100–800 | Geometric sans; technology and assertive headings |
| Outfit | 100–900 | Rounded geometric sans; friendly retail and services |

The template also bundles Inter, Roboto, Open Sans, Montserrat, Poppins, Lato,
Nunito, DM Sans, Space Grotesk, Plus Jakarta Sans, Work Sans, Playfair Display,
Lora, Merriweather and JetBrains Mono. Their exact weight declarations are in
`src/styles/tokens.css`. These template families are available to the builder;
the new catalog files are also uploaded to OpenDesign before design starts.
Pairing ideas: Fraunces / Manrope, Cormorant Garamond / Inter, Sora / DM Sans,
or Outfit for both roles when a cohesive interface suits the brief.

Also available in the catalog: IBM Plex Sans Arabic, El Messiri, Amiri,
Markazi Text, Noto Naskh Arabic, Noto Kufi Arabic, Lalezar, Reem Kufi,
Aref Ruqaa and Mirza. The generated-site template additionally bundles
Vazirmatn, Estedad and Sahel with their existing weight declarations.

Pairing ideas (heading / body), chosen to fit the brief rather than as defaults:

- El Messiri / IBM Plex Sans Arabic: expressive branding with clear body copy.
- Cairo / Almarai: contemporary commerce and services.
- Changa / Noto Sans Arabic: assertive technology or sport.
- Scheherazade New / IBM Plex Sans Arabic: heritage with practical navigation.
- Lateef / Noto Naskh Arabic: calligraphic headlines with restrained prose.

All Persian `catalog.json` families currently ship **normal, regular 400** only. Other
weights or italics would be browser synthesis, not supplied font files. Use
scale and spacing for hierarchy, or a template family with real heavier weights.
Display and calligraphic faces need larger sizes and generous line height;
check actual Persian copy on mobile. Do not letter-space joined Arabic script.

Apply a selected pair through `set_theme` / `update_design_decisions`, or the
existing theme tokens, using the exact family names:

```css
--font-heading: "Cairo", sans-serif;
--font-body: "Almarai", sans-serif;
```

## Multiple fonts and bilingual apps

One app can use separate heading/body pairs for each language, or one family
for all Persian text and another for all English text. Save them with
`update_design_decisions` as `fonts.byLanguage` (or `set_theme` as
`palette.byLanguage`), keeping `heading` and `body` as the default pair:

```json
{
  "fonts": {
    "heading": "El Messiri",
    "body": "IBM Plex Sans Arabic",
    "byLanguage": {
      "fa": { "heading": "El Messiri", "body": "IBM Plex Sans Arabic" },
      "en": { "heading": "Fraunces", "body": "Manrope" }
    }
  }
}
```

The theme emits `--font-heading-fa`, `--font-body-fa`, `--font-heading-en` and
`--font-body-en` and language rules. Mark pages, sections or inline runs with
the correct `lang` attribute. Inherited language and regional tags (`en-US`,
`fa-IR`) work, as do nested switches back to Persian. `font-heading` and
`font-body` utilities resolve to the local language pair. Unconfigured
languages inherit the existing font behavior. Additional decorative families can use
explicit CSS font-family classes without replacing these role pairs.

```jsx
<section lang="fa" dir="rtl">
  <h1>طراحی برای جزئیات</h1>
  <p>متن فارسی <span lang="en" dir="ltr">English product name</span></p>
</section>
<section lang="en" dir="ltr"><h1>Design for details</h1></section>
```

Language determines the font, not text direction: set `dir` separately and use
`bdi` for isolated mixed-direction values. Untagged English inside Persian
text is still Persian-language content; a fallback font stack alone does not
select the English family when the Persian font also contains Latin glyphs.

New sources are pinned to the Google Fonts repository commit recorded in each
entry. WOFF2 subsets retain Latin basics, Arabic and its extensions, Persian
digits, punctuation, joining controls and OpenType layout features. Variable
sources are instantiated at weight 400 and their other default axes. Licenses
remain unmodified. Glyph coverage, connected-script layout, asset ownership
and the combined catalog size budget are checked by the font catalog tests.
The Lateef and Scheherazade New derivatives use internal primary names
Joorchin Calligraphy and Joorchin Heritage Naskh to respect their reserved font
names; their original family names remain CSS aliases identifying the source.
