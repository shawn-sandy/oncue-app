---
name: OnCue
description: Black ink on white paper with a single rust signal — an editorial serif over a plain sans, where the accent colour is a machine-checked signal, not decoration.
colors:
  ink: '#000000'
  ink-soft: '#606060'
  paper: '#ffffff'
  paper-sunk: '#f0f0f0'
  island: '#c7342b'
  island-bg: '#fcebe9'
  rule: '#dedede'
  success: '#22c55e'
  warning: '#f59e0b'
  error: '#ef4444'
  info: '#3b82f6'
typography:
  display:
    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif'
    fontSize: 'clamp(3rem, 6.6vw, 4.5rem)'
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: '-0.035em'
  headline:
    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif'
    fontWeight: 400
    letterSpacing: '-0.02em'
  title:
    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif'
    fontWeight: 400
    letterSpacing: '-0.015em'
  section-title:
    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif'
    fontSize: 'clamp(2rem, 2.6vw + 1rem, 2.75rem)'
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: '-0.015em'
  card-title:
    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif'
    fontSize: '1.375rem'
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: '-0.015em'
  deck:
    fontFamily: 'DM Sans, ui-sans-serif, system-ui, -apple-system, sans-serif'
    fontSize: 'clamp(1.125rem, 0.9vw + 0.9rem, 1.5rem)'
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: 'DM Sans, ui-sans-serif, system-ui, -apple-system, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'DM Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    fontSize: '0.75rem'
    fontWeight: 400
    letterSpacing: '0.12em'
  button:
    fontFamily: 'DM Sans, ui-sans-serif, system-ui, -apple-system, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 600
rounded:
  none: '0'
  base: '4px'
  lg: '8px'
  xl: '12px'
  2xl: '16px'
  full: '9999px'
spacing:
  1: '4px'
  2: '8px'
  3: '12px'
  4: '16px'
  6: '24px'
  8: '32px'
  11: '44px'
  12: '48px'
  16: '64px'
components:
  button-primary:
    backgroundColor: '{colors.island}'
    textColor: '{colors.paper}'
    rounded: '{rounded.lg}'
    padding: '11px 20px'
    typography: '{typography.button}'
    height: '44px'
  button-primary-hover:
    backgroundColor: '#a82a23'
    textColor: '{colors.paper}'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.island}'
    rounded: '{rounded.lg}'
    padding: '11px 20px'
    typography: '{typography.button}'
    height: '44px'
  button-ghost-hover:
    backgroundColor: '{colors.island-bg}'
    textColor: '{colors.island}'
  card:
    backgroundColor: '{colors.paper-sunk}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '24px'
  code-block:
    backgroundColor: '{colors.paper-sunk}'
    textColor: '{colors.ink-soft}'
    rounded: '{rounded.none}'
    padding: '16px 20px'
  input:
    backgroundColor: '{colors.paper-sunk}'
    textColor: '{colors.ink}'
    rounded: '{rounded.base}'
    padding: '8px 12px'
  nav-toggle:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    height: '44px'
    width: '44px'
  eyebrow:
    textColor: '{colors.ink-soft}'
    typography: '{typography.label}'
  command-block:
    backgroundColor: '{colors.paper-sunk}'
    textColor: '{colors.ink-soft}'
    rounded: '{rounded.lg}'
    padding: '8px 8px 8px 20px'
  copy-button:
    backgroundColor: 'transparent'
    textColor: '{colors.ink-soft}'
    rounded: '{rounded.lg}'
    height: '40px'
    width: '40px'
  copy-button-hover:
    backgroundColor: '{colors.island-bg}'
    textColor: '{colors.island}'
  nav-logo:
    height: '56px'
    width: '56px'
  feature-card:
    backgroundColor: '{colors.paper-sunk}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '24px'
  feature-panel:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '24px'
  chip:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '8px 12px'
  feature-frame:
    backgroundColor: '#111111'
    textColor: '#f2f2f2'
    rounded: '{rounded.xl}'
---

# Design System: OnCue

## Overview

**Creative North Star: "The Instrument Reading"**

OnCue looks like the face of a measuring instrument. The ground is neutral and quiet, the
scale is precise and legible at a glance, and exactly one thing on the dial is lit. Nothing is
decorated for its own sake; every mark on the surface is there because it reports something. The
palette's own token names say it out loud — `ink`, `paper`, `island` — and the accent behaves like
a needle rather than a brand flourish.

The density is calm and generous. Content sits on an 80rem measure with real air around it, prose
is capped at 60ch, and surfaces separate by tone and a single hairline rather than by shadow or
ornament. Type does the structural work: one serif display face at one weight, DM Sans for
reading, and small DM Mono capitals for anything that annotates rather than speaks. When a component
needs to explain itself, it does so by standing next to the source that produced it — the
instrument shows its reading and its calibration together.

What makes the system unusual is that its central rule is enforced by tests rather than taste.
Colour marks hydration: static content is ink on paper, and the accent appears only on things a
visitor can operate. `e2e/homepage-design-direction.spec.ts` walks the rendered homepage and fails
the build if a non-interactive element computes to the accent, and `e2e/home-accessibility.spec.ts`
asserts the 4.5:1 contrast floor against the tokens the page actually resolves. Breaking the
direction is a build failure, not a disagreement. Confirmed rejections: the violet/indigo family
every generated palette converges on, and stock Tailwind sky-500 — the accent is deliberately
neither.

**Key Characteristics:**

- One lit indicator: the accent is a signal, never decoration
- Ink-on-paper neutrals with tonal layering instead of shadow
- Three type roles and no fourth
- Small mono capitals for every annotation and label
- Measured, not estimated — contrast ratios are recorded and asserted
- The rendered artifact and its source shown together

## Colors

A colourless black-on-white ground carrying exactly one chromatic voice, a warm rust red taken from
the OnCue brand's primary button. The logo (`public/images/oncue-logo.svg`) is built from the same
three values — a `#000000` disc, a `#c7342b` ring and a `#ffffff` play triangle — so Ink, OnCue Rust
and Paper are the logo's own colours, not approximations of them. The dark theme comes from the
brand's dark film card: near-black paper and a salmon tint of the rust.

### Primary

- **OnCue Rust** (`#c7342b` light / `#ef827b` dark): The single accent. It appears on links,
  buttons, focus rings, and the interactive-specimen badge — and nowhere else. On a ground with no
  other hue, one warm colour is enough to say "you can press this", and it darkens under
  `color-mix` for hover states without going brown. Measures 5.31:1 on paper in light and 7.32:1 in
  dark.
- **Clay Wash** (`#fcebe9` light / `#3a1714` dark): The accent's tinted background. Backs
  interactive affordances on hover, and paints `::selection`. Paler than the brand's `#f5d5d2`
  clay, which held Rust at only 3.87:1. Rust on Clay Wash is the lowest pair in the whole system:
  4.60:1 light, 6.20:1 dark.

### Neutral

- **Ink** (`#000000` light / `#f2f2f2` dark): Primary text and the default `color` on `body`.
  21.00:1 on paper.
- **Soft Ink** (`#606060` light / `#a3a3a3` dark): Secondary text — decks, eyebrows, labels,
  captions, inline code. 6.28:1 on paper.
- **Paper** (`#ffffff` light / `#111111` dark): The page background.
- **Sunk Paper** (`#f0f0f0` light / `#1c1c1c` dark): Recessed surfaces — the header band, card
  backgrounds, code blocks. Soft Ink on Sunk Paper measures 5.51:1 light, 6.75:1 dark; Rust on Sunk
  Paper 4.65:1 light, 6.61:1 dark.
- **Rule** (`#dedede` light / `#2e2e2e` dark): Hairlines and dividers. Never text.

### Tertiary

Status colours, used only in alerts, form validation, and system feedback — never as brand colour:
**Success** (`#22c55e`), **Warning** (`#f59e0b`), **Error** (`#ef4444`), **Info** (`#3b82f6`).

### Named Rules

**The Hydration Rule.** Colour marks interactivity. Static content renders in ink on paper; the
accent appears only where something responds — links, buttons, focus rings, the specimen badge.
Never a decorative border, a heading, a hairline, or a card surface. This is machine-checked, not a
preference: `e2e/homepage-design-direction.spec.ts` fails the build when a non-interactive element
computes to the accent. Treat it exactly as you would a type error.

**The scoped brand exception.** `data-accent="brand"` lets the accent paint something static in exactly
two places on the homepage: the headline's accent phrase ("Right on cue.") and the `TimingDemo` root,
whose stage depicts the OnCue brand. The accent audit skips those two elements and their descendants,
and a separate test fails if the marker appears on any third element. It is an exception for depicting
the brand, not a licence: everywhere else the rule stands, and the eyebrow and the hero's output check
marks stay in Soft Ink.

**The Legacy Family Rule.** The `--color-primary-*` sky-blue ramp and the `--color-neutral-*` grey
ramp exist for backward compatibility with earlier component tokens. They are not the palette. New
work reaches for the seven direction tokens; a sky-blue that reaches the screen is a regression.

**The Three Scopes Rule.** Both palette families flip together in all three theming scopes —
`:root`, `@media (prefers-color-scheme: dark)`, and `:root[data-theme]`. Redefining only `:root`
looks correct in light mode and silently keeps the old values the moment the visitor's OS is dark.

## Typography

**Display Font:** Georgia 400 (a system serif, so no download; falls back through Cambria and
Times)
**Body Font:** DM Sans (self-hosted variable woff2, latin subset, 400–700 in one file)
**Label/Mono Font:** DM Mono 400 (self-hosted, latin subset, single weight)

**Character:** Editorial and instrument-like. The display serif is tight and confident — negative
tracking, one weight, upright except for two accent phrases — and DM Sans underneath it is plain and geometric so that reading
feels like reading rather than like being marketed to. The mono capitals are the
system's annotation voice: everything that labels, measures, or points at something else speaks in
them.

### Hierarchy

- **Display** (400, `clamp(3rem, 6.6vw, 4.5rem)`, 1.02, `-0.035em`): The homepage hero `h1` only.
  One knob drives both display and deck size, so the ratio between them stays pinned at 3.2 at
  every viewport width instead of collapsing at desktop.
- **Headline** (400, `h1` scale, `-0.02em`): Page-level `h1` on every other route. Capitalized.
- **Title** (400, `h2`/`h3` scale, `-0.015em`): Section and card titles. Capitalized.
- **Section Title** (400, `clamp(2rem, 2.6vw + 1rem, 2.75rem)`, 1.08, `-0.015em`): The `h2` of each
  homepage feature section, in sentence case. Its deck stacks under it at `--header-deck-font-size`,
  capped at 60ch.
- **Card Title** (400, 1.375rem, 1.2, `-0.015em`): The `h3` of a feature card or panel, also in
  sentence case.
- **Deck** (400, `clamp(1.125rem, 0.9vw + 0.9rem, 1.5rem)`, 1.5): The paragraph under a page
  heading, in Soft Ink. Its clamp runs a shallower slope than the heading's, so the two separate as
  the viewport grows rather than converging.
- **Body** (400, 1rem, 1.5): Prose and lists, capped at 60ch — 80ch inside `article`.
- **Label** (400, 0.75rem, `0.12em`, uppercase, Soft Ink): Eyebrows, figure captions, specimen
  badges, inline code. Opted into with `data-ui="eyebrow"` or `data-ui="label"`.
- **Button** (600, 0.9375rem): Interactive control labels. On the body sans, not the display face
  and not the mono label role — a button is neither a title nor an annotation.

### Named Rules

**The Three Roles Rule.** Display for `h1`–`h6`, body sans for everything that reads, mono for
everything that annotates. There is no fourth role. A new face is a new decision about the whole
system, not a local one.

**The One Weight Rule.** The display face renders at exactly one weight (400) on every heading
level, and it is a system serif, so headings cost no font request at all. The two self-hosted
faces are latin-subset woff2 files with no CDN: DM Sans as one variable file covering 400–700
(preloaded), DM Mono at 400 only. Two font requests total. A design that needs another face or a
static weight outside those files is asking for another network request; make that trade
deliberately or not at all.

**The Accent Italic Rule.** The display serif is set in italic for exactly two accent phrases: the
homepage headline's "Right on cue." and the film card's "Short stories.". Georgia italic is a system
face, so it costs no font request. Nothing else is italic in the display role.

**The Labels Keep Their Case Rule.** `text-transform: capitalize` applies to `h1`–`h3`, which are
titles. `h4`–`h6` are used as UI labels — the contact form renders its error summary as an `h6` —
and capitalizing a sentence produces "Please Correct The Following Errors". The homepage feature
sections opt out as well: their `h2` and card `h3` set `text-transform: none`, because each title is
a claim written as a sentence rather than a page title.

## Layout

A single centred measure of 80rem (`--max-content-width`, 1280px) governs `main`, direct `section`
children of `body`, and the inner column of full-bleed bands. Bands that paint a background span
the full viewport and push their content in with
`padding-inline: max(1.25rem, calc((100% - 80rem) / 2))` rather than being constrained themselves —
that keeps the band edge-to-edge while its contents stay on the shared measure, with no wrapper
element.

Vertical rhythm runs on an 8pt grid (`--space-*`). `main` carries 2rem block padding; sections take
2rem inline padding; sibling sections separate by 2rem; elements inside an `article` separate by
1.5rem. Composed pages own the space between their own regions — a reusable component never carries
page-specific margin, which is why `src/pages/index.astro` sets the workflow strip's margins at the
call site rather than inside `WorkflowStrip`.

The homepage hero is a two-column grid (`minmax(0, 1fr)` copy beside a `minmax(0, 1.15fr)` timing
demo) with a 2rem gutter, collapsing to a single column at 47.5rem. Interactive controls hold a 44px minimum
target (`--space-11`, WCAG 2.2 SC 2.5.8).

Below the workflow strip, the eight feature sections share one rhythm: 64px of block padding
(`--space-16`), a 48px gap between the header and the body, and a single Rule hairline under each
section — never above it, since the strip already ends in one and two touching rules read as one
heavy line. The header stacks eyebrow, title and deck in one column with a 1rem gap at every width,
and the deck is capped at 60ch. Bodies lay out on `.feature-grid`, an `auto-fit` grid of columns at
least 18rem wide (`--feature-min` raises that per section) with a 2rem row gap and a 3rem column
gap. The page sets the sections' 1.25rem inline margin at the call site.

### Named Rules

**The 320 Rule.** Nothing may widen the document at a 320px viewport (WCAG 2.1 SC 1.4.10 Reflow).
Grid children declare `min-width: 0`, long headings set `overflow-wrap: break-word` and
`hyphens: auto`, and any content wider than the viewport — code samples above all — scrolls inside
its own `overflow-x: auto` box rather than pushing the page.

**The Composition Owns Spacing Rule.** Space between two components belongs to the page that
composes them, never to either component. Components are exported for reuse; a margin baked into
one is a bug at every other call site.

## Elevation & Depth

Depth is tonal, not cast. Surfaces separate by stepping between Paper and Sunk Paper and by a
single 1px Rule hairline; the header band, cards, and code blocks are all recessed by tone alone.
The full eight-step shadow scale (`--shadow-sm` through `--shadow-2xl`) exists in the token file and
remains available, but resting surfaces do not spend it.

### Shadow Vocabulary

- **`--shadow-sm`** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): The lightest available lift. Hover response
  on an interactive card.
- **`--shadow-base`** (`0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): Aliased by
  `--card-shadow`. Reserved for a card that is genuinely lifting under interaction.
- **`--shadow-lg`** (`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`):
  Overlays and popovers that float above the page.

### Named Rules

**The Flat-At-Rest Rule.** Surfaces are flat at rest. A shadow is a response to state — hover,
focus, or genuine overlay — never a resting property of a card, a band, or a section. If a surface
needs to read as separate while sitting still, step its tone or draw a hairline.

## Shapes

Softly rounded, never pill-shaped, and never sharp except on purpose. The system default is 8px
(`--radius`, matching `--radius-lg`) and it covers buttons, cards, the specimen frame, and the
navigation toggle. Smaller controls that sit inside a form — text inputs, selects — use 4px
(`--radius-base`) so they read as fields rather than as buttons. Images take 16px
(`--img-radius`, `--radius-2xl`), the one place the geometry is allowed to soften noticeably, and the
depicted video frames in the feature sections take 12px (`--radius-xl`), between a card and an
image. Fully-round (`--radius-full`) is reserved for avatars, status dots and the requirements
table's output dots.

Borders are always exactly 1px in Rule; there is no 2px border anywhere in the resting system. The
only 2px stroke in the language is the focus ring, which is a 2px OnCue Rust outline offset by
2px — deliberately the heaviest line the system draws, because it is the one a keyboard user needs
to find.

### Named Rules

**The Squared-Insert Rule.** An element that spans its container edge-to-edge drops its own radius
to zero and separates with a hairline instead. The code block inside a specimen card is the
canonical case: it runs the full card width, so a rounded corner inside a rounded corner would read
as a mistake. `CommandBlock` is the counter-case: it stands alone in the install dialog and the
requirements section with nothing framing it, so it carries its own 8px corners and Rule hairline.

## Components

### Buttons

- **Shape:** Softly rounded (8px), 1px border, 44px minimum height.
- **Primary:** OnCue Rust fill with a matching border, label in Paper — not white. The accent
  lightens in dark mode, so white label text would fail contrast there; inverting to Paper
  measures 5.31:1 light and 7.32:1 dark. Padding `0.6875rem 1.25rem`, weight 600, 0.9375rem.
- **Ghost / Secondary:** Transparent fill, label in OnCue Rust, border in neutral Rule. The
  neutral border is what creates the hierarchy — an accent border here made the two buttons read as
  two equal calls to action.
- **Icon (copy):** The per-command button in `CommandBlock`. Transparent fill and border, a 16px
  Soft Ink glyph, 40px square — the one control that sits under the 44px floor, so a command row
  stays 40px tall. Hover paints Clay Wash behind a Rust glyph. A successful copy swaps the glyph for
  a check in Rust for two seconds, and the shared status region announces it.
- **Hover:** Fill mixes 12% toward ink in OKLCH (`color-mix(in oklch, …)`), and the label picks up
  an underline at 3px offset so the state never relies on hue alone. The ghost variant gains its
  Clay Wash tint and trades its neutral border for the accent — hover is where it earns the
  border its resting state gave up.
- **Active:** Fill mixes 22% toward ink.
- **Focus:** 2px OnCue Rust outline, 2px offset.
- **Transition:** Colour only, 150ms `ease-out`. Nothing moves, so there is nothing to suppress
  under `prefers-reduced-motion`.

### Cards

- **Corner Style:** Softly rounded (8px).
- **Background:** Sunk Paper, painted through `body [data-card]` so it flips with the theme.
- **Border:** 1px Rule.
- **Shadow Strategy:** None at rest — see Elevation & Depth.
- **Internal Padding:** 24px (`--card-padding`), 16px gap between children.
- **Behavior:** A card with a link renders a "Continue Reading" footer; the link, being
  interactive, carries the accent.

### Inputs / Fields

- **Style:** 4px radius, 1px border, Sunk Paper fill, so typed text stays readable when the dark theme
  lightens it; a literal light fill would paint light text on a light field.
- **Focus:** The system focus ring — 2px OnCue Rust outline, 2px offset.
- **Validation:** Deferred until blur (`:user-invalid:not(:focus)`), so a field never turns red
  while it is still being typed into. Invalid fields take an Error outline and a `⚠` prefixed
  message; valid fields take a Success outline and drop their hint. Required fields append a
  " required \*" marker generated from the label.

### Navigation

- **Style:** A single horizontal bar at every width, packed to the start, with the brand and a 44px
  hamburger toggle grouped left and the account slot pushed right by auto margin. The logo is 56px
  square inside a link that keeps the 44px target height; the bar adds 0.5rem of block padding
  around it and sets `flex-shrink: 0`, because `body` is a flex column that would otherwise shrink
  the bar back to the vendor's 4rem.
- **Mechanism:** The panel is a native HTML `popover` — toggle, Escape, and outside-click come from
  the platform, with no JavaScript involved. There is no open-state class; the only CSS hook is
  `:has(> [popover]:popover-open)`.
- **Colour:** The bar and panel both inherit their background rather than declaring one, so the
  chain body → nav → panel can never disagree about the active theme.
- **Toggle states:** Transparent border at rest (kept, not removed, so revealing it costs no layout
  shift), rising to 30% of the current text colour on hover and focus.

### The Specimen (signature component)

The system's signature pattern, and the clearest expression of the North Star: a rendered component
and the source that produced it, shown as one object. A framed panel carries a small mono-capital
"Rendered" badge on a Sunk Paper strip, the live component in a padded body, and a full-width code
block below a hairline with squared corners and its own horizontal scroll.

The rule that makes it worth having: **the rendered instance and the printed snippet are built from
the same constants**, so the sample cannot drift from the component standing beside it. It appears
in the promoted tier of `FeatureCards`.

### The OnCue homepage parts

The homepage is composed from small components, each of which renders complete HTML on the server.
Scripts only add behaviour on top, so every control works as a plain link or as text before
JavaScript loads.

- **`ExternalLink`** (atom): a link to another site with an `aria-hidden` ↗. Opens in the same tab, so
  there is no "opens in a new tab" text to add.
- **`CommandBlock`**: one row per command on a Sunk Paper panel with a Rule border and 8px corners
  (`command-block`), each row a mono `code` at 0.8125rem beside its own icon copy button
  (`copy-button`), named after its command and shipped `hidden`. One `role="status"` region serves
  the block: a successful copy swaps the icon for a check and is announced; a blocked clipboard
  selects that command and shows the Ctrl+C or Cmd+C hint visibly, since that path has no icon to
  change.
- **`InstallDialog`**: a native `dialog` (`showModal()`, `closedby="any"`, a `method="dialog"` close
  form) that upgrades links carrying `data-opens-dialog` and its `id`. Without a script those links open
  the README's install section.
- **`FilmCard`**: a static phone frame with a fixed dark palette in both themes, because it depicts a
  screen. Its accent is `#ef827b` (7.33:1 on `#111111`); its labels floor at 0.625rem.
- **`TimingDemo`**: the stage, the transport and the player script. Renders the finished frame, reveals
  its transport by script, and paints `frameAt()` from `src/utils/timing-demo.ts`.
- **`WorkflowStrip`**: a hairline-ruled strip with the workflow as an `ol`; its arrows are generated
  content with empty alternative text.
- **`FeatureSection`**: the frame the eight feature sections share — eyebrow, sentence-case title and
  deck stacked in one column at every width — and the parts they draw with, styled once as global
  rules fenced by a zero-specificity `:where(.feature-section)`:
  - **Card** (`feature-card`): Sunk Paper, 1px Rule border, 8px corners, 24px padding, 1rem gap.
  - **Panel** (`feature-panel`): the card without the fill, for content that should read as outlined
    rather than recessed.
  - **Chip** (`chip`): a 1px Rule outline at 8px corners, `0.5rem 0.75rem` padding, 0.9375rem. A list
    item, never a button.
  - **Code sample** (`code-block`): Sunk Paper, Soft Ink mono at 0.75rem, squared corners. It wraps
    unless its layout is the point; then it scrolls inside a focusable, labelled region, positioned so
    that visually hidden text inside it cannot escape the clip and widen the page.
  - **Table**: Rule hairlines between rows, no vertical lines, 0.9375rem. Header cells are 600 except
    mono cells, which stay at 400 because DM Mono ships one weight.
  - **Depicted frame** (`feature-frame`): `FilmCard`'s fixed dark palette at 12px corners with a Rule
    border, so its edge shows on the dark theme's paper.
- **Feature sections** (`FeatureOneFile`, `FeatureWordSync`, `FeatureFrameSizes`, `FeatureCheckIns`,
  `FeatureFactsPictures`, `FeatureBrand`, `FeatureSkills`, `FeatureRequirements`): one claim each from
  the plugin README, in that order below the workflow strip. Facts and timings come from the README and
  the Gleaner example, not from invention.

`HomeHero` composes `TimingDemo`; the feature sections compose `FeatureSection`; the page composes the
rest.

## Do's and Don'ts

### Do:

- **Do** reserve OnCue Rust for things a visitor can operate — links, buttons, focus rings,
  specimen badges. The only static exceptions are the two `data-accent="brand"` elements on the
  homepage. Run the homepage e2e spec before assuming another exception is safe.
- **Do** use the seven direction tokens (`--ink`, `--ink-soft`, `--paper`, `--paper-sunk`,
  `--island`, `--island-bg`, `--rule`) for every new surface.
- **Do** flip both palette families in all three theming scopes when overriding, and load your
  sheet after the kit's.
- **Do** separate surfaces with a tone step and a 1px Rule hairline before reaching for a shadow.
- **Do** put annotations, eyebrows, and captions in mono capitals via `data-ui="eyebrow"` or
  `data-ui="label"` rather than styling them ad hoc.
- **Do** let long content scroll inside its own box; check 320px before shipping.
- **Do** pair a rendered component with the source that produced it, built from shared constants.
- **Do** re-measure contrast when repointing a token — the recorded ratios are a budget, not a
  decoration.

### Don't:

- **Don't** put the accent on a heading, a decorative border, a hairline, or a card surface, and
  don't add a third `data-accent="brand"` marker. The test will catch it, and it is the one rule the
  whole system rests on.
- **Don't** reach for the legacy `--color-primary-*` sky-blue or `--color-neutral-*` greys in new
  work; they exist only for backward compatibility.
- **Don't** drift the accent toward violet, indigo, or Tailwind sky-500 — those are confirmed
  rejections, not untried options.
- **Don't** put white text on the accent. Use Paper; white fails contrast in dark mode.
- **Don't** add a shadow to a resting surface, or a second typeface, or a second display weight.
- **Don't** bake page-specific margin into a reusable component.
- **Don't** apply `text-transform: capitalize` to `h4`–`h6`; they carry sentence-cased UI labels.
- **Don't** style navigation state against `[aria-expanded]` — it is an implicit accessibility-tree
  mapping on a popover invoker, not a DOM attribute, and never matches.
