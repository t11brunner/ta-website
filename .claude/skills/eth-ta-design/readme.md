# ETH TA Design System

A minimalist, modernist design system for **ETH Teaching Assistant** course sites — static, single-file class pages TAs maintain themselves (slides, problem sets, interactive visualisations).

## Sources

- GitHub: [t11brunner/ta-website](https://github.com/t11brunner/ta-website) — the "Control Systems I" TA site this system is built from (single `index.html`, no build step, deployed via GitHub Pages). Explore it directly for the exact interaction logic (canvas simulation math, week/viz data model) this design system's UI kit reproduces at a cosmetic level.

Everything here — tokens, components, the UI kit — is derived from that one repo. There was no separate Figma file, deck, or additional codebase attached. If you have access to the repo, read it for ground truth on anything this system simplifies.

## Context

The site is a weekly-updated course companion: a lecture/exercise index ("weeks"), per-week downloads (exercise slides, problem sets, solutions), and a growing gallery of interactive control-theory visualisations (pole plots, Bode plots, root locus, PID tuning — currently one is live: an interactive second-order step-response demo with draggable damping ratio and natural frequency).

## Intentional additions

The source repo has no separate component library — it's one HTML file. No concrete inventory to enumerate, so a standard small set was authored, sized to what the site actually uses:
- **Button** — the source has no explicit button; this generalizes its pill/tag visual language for cases a UI kit needs an explicit action.
- **Tag, ActionCard, Row, PlaceholderMedia, RangeControl, NavPills, SectionHeader** — all lifted directly from concrete classes in the source (`.tag`, `.dl-card`, `.row`, `.ph`, `input[type=range]` controls, `nav.main`, `.sec-title`/`.sec-note`).

## Components

- **Core** — `Button`, `Tag`, `PlaceholderMedia`
- **Navigation** — `NavPills`
- **Forms** — `RangeControl`
- **Layout** — `ActionCard`, `Row`, `SectionHeader`

## Content fundamentals

- **Voice**: plain, direct, instructional — written by a TA for students. No marketing language, no exclamation points.
- **Person**: mostly impersonal/descriptive ("Weekly material", "Interactive demos that accompany the lectures") rather than "you"; occasional direct address in explanatory copy ("Drag the sliders to see how the poles move").
- **Casing**: sentence case throughout for headings and body copy; labels/timestamps/badges are the one exception — always UPPERCASE Public Sans (medium weight, +0.06em tracking, `--text-secondary`) with tracked-out letterspacing (`WEEK 05`, `LECTURE · SEP 28, 2026`). Monospace is never used for labels.
- **Punctuation as structure**: middle dots (·) separate metadata fragments instead of commas or pipes (`WEEK 05 · VISUALISATION`); em/en dashes introduce a clarifying clause.
- **No emoji, ever.** No decorative icons in copy. A → arrow is the one recurring glyph, used for row/card navigation affordance.
- **Numbers precisely**: math is set as real notation (ζ, ωₙ, G(s) = ωₙ² / (s² + 2ζωₙs + ωₙ²)), not approximated or spelled out.
- **Status is always explicit and honest**: "posts on session day", "posting soon", "○ in development" — never a silent missing state.

## Visual foundations

- **Palette**: cool technical grey-blue paper (`#eef1f2`) ground, near-black ink (`#1d2326`) text, a single cool desaturated blue accent (`oklch(0.52 0.09 250)`) used sparingly — for the current nav pill, links-on-hover, live status, slider thumbs, chart lines. Chosen specifically to avoid the warm-cream/off-white look that reads as a generic AI-generated default; the cool grey-blue also now harmonizes directly with the accent hue. No gradients, no second accent hue.
- **Type**: two families only. Public Sans (display/heading/body, and every eyebrow/metadata label — dates, "LECTURE ·" tags, week numbers — set uppercase, medium (500) weight, +0.06em letter-spacing, `--text-secondary` color) — bold/semibold headings at tight negative letter-spacing, regular body at generous 1.6–1.7 line-height. IBM Plex Mono is reserved strictly for numeric/data readouts (percentages, seconds, ζ/ωₙ values, counts) — never for labels or timestamps. This split is the system's single strongest signature.
- **Backgrounds**: flat paper color only — no photography, no illustration, no texture, no gradients. The one repeating "image" motif is a 45°-diagonal, 2%-black hatch pattern standing in for unbuilt charts/visuals.
- **Borders & cards**: 1px hairline borders (`--line` / lighter `--line-soft`) in a cool neutral grey-blue, never black. Cards (`.dl-card`, plot panels, controls) get a 14px radius, a hairline border, and a slightly-lighter-than-paper fill (`--card:#f8fafb`) — no shadows anywhere, at rest or hover.
- **Radii**: 14px for cards/panels, 999px (pill) for tags/nav/buttons, 50% for round badges. Never sharp corners on interactive surfaces, never an exaggerated "bubble" radius either.
- **Shadows**: none. Depth is communicated by hairline borders and subtle background tint shifts only.
- **List rows** (the weekly index) intentionally have *no* card surface at rest — just a hairline top border; hovering indents the row 8px and tints the background to `--card`. This is the site's primary "interactive but flat" pattern, preferred over boxed cards where content is a scannable list.
- **Motion**: fast and subtle only. 140ms for hover transitions (color, background, small translateX/Y nudges — arrows slide 4px, cards lift 3px). Screen transitions are a 300ms opacity+translateY(6px) fade, ease timing — no bounce, no spring, no scale.
- **Hover states**: color shifts (ink → accent on row titles/links) and background tints (transparent → `--card` or `--accent-soft`), plus small directional nudges (arrow translateX, card translateY). Never a shadow or scale-up.
- **Press states**: card press is a slightly smaller translateY than hover (settles down 1px) — a quieting motion, not a shrink/bounce.
- **Transparency/blur**: only ever a flat alpha-blended accent tint (`--accent-soft` at 10–18% opacity) for selected-state backgrounds and chart reference bands — never a backdrop-blur or glass effect.
- **Imagery color vibe**: n/a — there is no photography or illustration in this system; the hatch placeholder is intentionally colorless (near-transparent black on paper).
- **Layout rule**: a single fixed reading column, 760px max-width, centered; a "wide" 980px variant for grid screens (visualisation gallery). No sidebar, no sticky header — the whole page scrolls as one column under a centered masthead + nav.

## Iconography

No icon font, no SVG icon set, no emoji, no unicode-glyph icons beyond the plain `→` and `↓` (and `←` for back links) used as directional affordances in text. There is no logo in the source repo — the brand mark is simply the course name set in Public Sans wherever a mark would go (see the "Wordmark" specimen card). If a real ETH or course logo becomes available, drop it in `assets/` and this system should switch to it.

## Repo index

- `styles.css` — root stylesheet, `@import`s everything below.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `base.css` (resets + `.lbl` utility).
- `components/core/` — `Button`, `Tag`, `PlaceholderMedia`
- `components/navigation/` — `NavPills`
- `components/forms/` — `RangeControl`
- `components/layout/` — `ActionCard`, `Row`, `SectionHeader`
- `guidelines/` — foundation specimen cards (colors, type, spacing, brand/motion/placeholder-media)
- `ui_kits/ta-site/` — full click-through recreation of the Control Systems I TA site (plain React/JSX, for reference)
- `templates/ta-site/` — the same TA site as a **Design Component template** (`TaSite.dc.html`) — the one to copy into a new project as a starting point
- `assets/` — empty; no visual assets (logo/imagery) were provided in the source repo
- `SKILL.md` — Claude-Code-compatible skill wrapper for this system
- `github.md` — source-repo sync record

## Caveats & ask

- No logo, illustration, or imagery was in the source repo — only CSS/markup/JS. If ETH or the course has an actual wordmark or photography, attach it and this system will incorporate it.
- Fonts (Public Sans, IBM Plex Mono) are loaded from Google Fonts by `@import` — no local font files were in the source repo either. Fine for prototyping; for production, host them locally instead.
- Only the one interactive visualisation from the source (second-order step response) is live; the rest (Bode, root locus, PID, etc.) are represented as "in development" placeholders, matching the source's own current state.
- The nine other planned visualisations (Laplace, transfer-function builder, block-diagram reduction, Routh, root locus, pole/zero drag, Bode, PID tuner) don't exist as built demos yet anywhere — only as `PlaceholderMedia`. Tell me if you'd like the design system to sketch what any of those *could* look like once built, using the step-response demo as the template.
