# Design Direction

The visual direction for astro-basics: a seven-token palette, three type roles, and one structural rule that ties
colour to interactivity. These tokens are the public styling contract for projects that consume this package, so the
names and their meanings are stable and overridable.

## Overview

The direction is one idea specific to Astro rather than to websites in general: **colour marks hydration**.

Astro ships static HTML and withholds JavaScript. The palette says the same thing the framework does. Static content
renders in ink on paper, and the accent (`--island`) appears only where something is interactive - links, buttons,
focus rings, the interactive-specimen badge. Nothing decorative carries it.

That is a structural rule, not a style preference, and it is machine-checked. `e2e/homepage-design-direction.spec.ts`
walks the rendered homepage and asserts that **no non-interactive element computes to the accent colour**. Using
`--island` for a decorative border, a heading, a rule or a card surface fails that test.

Three supporting decisions are already settled:

- **Self-hosted body and mono faces, a system display face.** Headings use Georgia, a system serif. Body and labels
  use latin-subset woff2 files in `public/fonts/`, not a CDN: `dm-sans-variable.woff2` (400-700 in one file, preloaded
  from `src/layouts/Base.astro`) and `dm-mono-400.woff2`. Both are declared with `font-display: swap`.
- **The token layer applies sitewide.** Body background and text colour are global, so there is no way to scope them.
  The OnCue hero and its timing demo are homepage-only.
- **Component prop signatures stay stable.** `Card` and `FeatureCards` are package exports via `src/components/index.ts`,
  so new props are optional with defaults and new slots are additive.

Source of truth: `src/styles/_design-tokens.scss` (definitions) and `src/styles/_base.scss` (consumers).

## The Seven Direction Tokens

| Token          | Light     | Dark      | Role                                                           |
| -------------- | --------- | --------- | -------------------------------------------------------------- |
| `--ink`        | `#000000` | `#f2f2f2` | Primary text; the default `color` on `body`                    |
| `--ink-soft`   | `#606060` | `#a3a3a3` | Secondary text: decks, eyebrows, labels, captions, inline code |
| `--paper`      | `#ffffff` | `#111111` | Page background                                                |
| `--paper-sunk` | `#f0f0f0` | `#1c1c1c` | Recessed surfaces: the header band, card backgrounds           |
| `--island`     | `#c7342b` | `#ef827b` | The accent. Interactive only                                   |
| `--island-bg`  | `#fcebe9` | `#3a1714` | Accent wash behind interactive affordances and `::selection`   |
| `--rule`       | `#dedede` | `#2e2e2e` | Hairlines and dividers                                         |

The accent is OnCue rust, the brand's primary-button red, on an otherwise colourless black-and-white ground —
deliberately not Tailwind sky-500 and not the violet/indigo family that generated palettes converge on, so the palette
does not read as a framework default. With no other hue on the page, one warm colour is enough to mark what can be
pressed, and it darkens under the `color-mix` hover states without going brown. The wash is paler than the brand's
`#f5d5d2` clay, which held rust at only 3.87:1. Every pair clears WCAG 2.1 AA. Measured with the contrast script
rather than estimated: in light, ink on paper is 21.00:1, ink-soft on paper 6.28:1, island on paper 5.31:1, and the
lowest pair of all — island on island-bg — 4.60:1; in dark, island on paper is 7.32:1 and the lowest pair — again
island on island-bg — is 6.20:1. `e2e/home-accessibility.spec.ts` asserts the 4.5:1 AA floor against the tokens the
page actually resolves, so no repoint can drop a pair below AA without failing the build. The exact figures above are
not themselves asserted — they record the current budget, and re-measuring is part of changing a token.

Both themes are defined as SCSS mixins - `direction-light` and `direction-dark` - and applied through three scopes:

```scss
:root {
  @include direction-light;
}

@media (prefers-color-scheme: dark) {
  :root {
    @include direction-dark;
  }

  @include direction-dark-surfaces;
}

:root[data-theme='dark'] {
  @include direction-dark;
  @include direction-dark-surfaces;
}

:root[data-theme='light'] {
  @include direction-light;
}
```

The `[data-theme]` scopes carry specificity (0,2,0) against the media query's (0,1,0), so an explicit toggle wins over
the OS preference regardless of source order. Starlight already stamps that attribute on the docs routes.

`direction-dark-surfaces` is the part that matters most. Redefining `:root` variables alone is not enough: @fpkit/acss
resolves `--color-surface` from a token this project never declares and hardcodes `whitesmoke` on the header band, so
the dark scope has to reach the elements themselves.

## Which Surfaces the Aliases Paint

Two component aliases existed in `_design-tokens.scss` with zero consumers, which is why every painted surface
inherited @fpkit/acss defaults. Both now point at direction tokens and both have real painted consumers.

### `--card-background: var(--paper-sunk)`

Painted by `body [data-card]` in `src/styles/_base.scss`, and again inside `direction-dark-surfaces` for the dark
scopes. `[data-card]` is the attribute @fpkit/acss puts on its `Card` root, so the alias reaches:

- `Card.astro` everywhere it renders
- the promoted-tier specimens in `FeatureCards.astro`
- `Featured.astro`
- `DashboardCard` and any other composition built on the @fpkit/acss `Card`

The selector is scoped through `body` on purpose. The vendor's own `[data-card]` rule is (0,1,0); `body [data-card]` is
(0,1,1) and wins on specificity rather than on whichever stylesheet the bundler happens to emit last. It also leaves
`[data-card] > header` - the card's own header strip - alone.

### `--header-background: var(--paper-sunk)`

Painted by `body > header`, which covers the shared `Header.astro` band on every route except the homepage,
which renders no header band. The child combinator is load-bearing twice over: (0,0,2) beats the vendor's
(0,0,1), and it cannot reach a nested `header` inside a card.

A third header token, `--header-deck-font-size`, sizes the deck paragraph under the shared header's `h1`. It is a
fluid `clamp()` on a shallower slope than the `h1` clamp, so the two separate as the viewport grows instead of
converging.

## The Three Type Roles

One typeface used to render across every heading, paragraph, link and button, so elements differed only by size. Three
roles is the smallest set that reads as deliberate.

| Role        | Token                   | Applies to                                                        | Treatment                                           |
| ----------- | ----------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| **Display** | `--font-family-display` | `h1` through `h6`                                                 | Georgia 400, negative tracking                      |
| **Body**    | `--font-family-sans`    | `body`, `p`, `li`, and everything inheriting from `body`          | DM Sans                                             |
| **Mono**    | `--font-family-mono`    | `code`, `kbd`, `samp`, `[data-ui="eyebrow"]`, `[data-ui="label"]` | DM Mono, uppercase, `0.12em` tracking, `--ink-soft` |

Details worth knowing:

- **Display covers every heading level.** `h1` through `h6` all render Georgia at weight 400. Georgia is a system
  serif, so the full range costs no font request.
- **Casing is not part of the role.** `text-transform: capitalize` stays on `h1`-`h3`, which are titles. `h4`-`h6` are
  used for UI labels - the contact form renders its error summary as an `h6` - and capitalizing a sentence would
  produce "Please Correct The Following Errors".
- **Tracking is negative on display.** `-0.015em` on `h1`-`h6`, tightened to `-0.02em` on `h1`.
- **The display stack falls back through other serifs** (Cambria, Times New Roman), so a system without Georgia still
  gets a serif rather than the body face.
- **Body is declared on `body`, not `html`.** @fpkit/acss sets `font-family` on `html`, which is why one face used to
  render everywhere. Declaring the body role on `body` beats that by inheritance and leaves the headings free.
- **Mono is opt-in for non-code.** Code semantics get it by element. Everything else opts in through
  `data-ui="eyebrow"` or `data-ui="label"`, so an eyebrow is a deliberate choice at the call site rather than a
  selector guessing at class names.

Use `data-ui="eyebrow"` for the small uppercase line above a headline and `data-ui="label"` for figure and specimen
labels. Both resolve to the mono family, `--ink-soft`, `0.75rem`, `0.12em` tracking, uppercase.

## Overriding the Tokens as a Consumer

Projects that import this package get the components, and the components read these custom properties at runtime.
Nothing is compiled in, so a consumer rebrands the kit by redefining the properties - no fork, no SCSS build, no
component edits.

To rebrand this repository itself rather than a consuming project, use the `customize-design` Claude skill. It edits
the tokens at their source in both themes, measures contrast and updates this spec. See
[customize-design-skill.md](../02-guides/customize-design-skill.md).

Two rules make an override stick:

1. **Load your sheet after the kit's stylesheet.** Every override below has the same specificity as the kit's own
   declaration, so source order decides.
2. **Override all three scopes.** The kit sets the tokens in `:root`, in `@media (prefers-color-scheme: dark) :root`,
   and in `:root[data-theme='dark']` / `:root[data-theme='light']`. Redefining only `:root` leaves the dark path on the
   kit's values.

```css
/* your-app/src/styles/brand.css - imported after the kit's index.css */

:root,
:root[data-theme='light'] {
  --ink: #12100e;
  --ink-soft: #6b6257;
  --paper: #fffdf9;
  --paper-sunk: #f5f0e6;
  --island: #b4531a;
  --island-bg: #fdeee2;
  --rule: #e4dbcb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ink: #f4efe7;
    --ink-soft: #a89a88;
    --paper: #14110d;
    --paper-sunk: #1d1913;
    --island: #ff9a5c;
    --island-bg: #2a1a10;
    --rule: #2e2820;
  }
}

:root[data-theme='dark'] {
  --ink: #f4efe7;
  --ink-soft: #a89a88;
  --paper: #14110d;
  --paper-sunk: #1d1913;
  --island: #ff9a5c;
  --island-bg: #2a1a10;
  --rule: #2e2820;
}
```

You do not need to re-declare the painted rules. `body`, `body > header`, `body [data-card]` and `::selection` all
resolve through `var()`, so redefining the variables repaints every surface that consumes them.

### Overriding type

```css
:root {
  /* Swap the display face. Keep a fallback chain - the kit's @font-face rule
     and Base.astro preload still reference the bundled DM Sans file. */
  --font-family-display: 'Söhne Breit', ui-sans-serif, system-ui, sans-serif;
  --font-family-sans: 'Söhne', ui-sans-serif, system-ui, sans-serif;
  --font-family-mono: 'Berkeley Mono', ui-monospace, monospace;
}
```

### Overriding component aliases

The component alias layer is a second, narrower override surface. Re-point an alias when a surface should diverge from
the direction rather than follow it:

```css
:root {
  --card-background: var(--paper); /* flush cards instead of recessed */
  --header-background: transparent; /* no header band at all */
  --header-deck-font-size: clamp(1rem, 0.8vw + 0.85rem, 1.375rem);
  --card-radius: 0;
}
```

### What an override must not break

`--island` is the only token bound to a structural rule. If you re-point it, keep it on interactive surfaces only.
Applying your accent to a heading, a decorative border or a static card background reintroduces exactly the ambiguity
the direction removes, and it fails `e2e/homepage-design-direction.spec.ts` if you run this project's suite.

## The OnCue Homepage

`/` is the OnCue plugin page. `src/pages/index.astro` composes it on `Base` with `hideHeader` and wraps it in
`MainSection`, not `Layout`, because `Layout` always renders the blog sidebar. The hero is therefore a `section` inside
`main`, and the skip link lands on it.

### Working before JavaScript loads

Every part renders complete HTML on the server. Scripts are small Astro `script` modules, with no framework island,
and they only add behaviour on top:

| Control               | Without JavaScript                                      | With JavaScript                                                                  |
| --------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Make your first video | A link to the OnCue README's install section            | Opens `InstallDialog` with `showModal()`; Escape closes it and returns focus     |
| See it in motion      | A link to `#demo`                                       | Plays the demo from 00:00 and moves focus to the play button                     |
| Copy                  | Not shown (`hidden`); the commands are selectable text  | Copies the commands; if the clipboard refuses, selects them and says how to copy |
| Demo player           | Not shown (`hidden`); the film shows its finished frame | Play, Pause and Replay, with a `00:00 / 00:08` readout; a hidden tab pauses it   |

The film's server markup is its finished frame: every step revealed and no current word. That is also the view under
`prefers-reduced-motion`, where nothing moves until Play is pressed, and the frame the demo ends on.

### Components

| Component       | Props                                                              | What it does                                                                                   |
| --------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `ExternalLink`  | `href`, `class?`, default slot                                     | A link with an `aria-hidden` arrow. Opens in the same tab                                      |
| `CommandBlock`  | `commands: string[]`                                               | `pre > code` from the `code-block` tokens, a `hidden` Copy button and a `role="status"` region |
| `InstallDialog` | `id`, `commands`, `fallbackHref`                                   | Native `dialog` with `closedby="any"`; upgrades every `a[data-opens-dialog]` naming its `id`   |
| `FilmCard`      | none                                                               | The static phone frame. `data-state` on `[data-step]` and `[data-word]` sets each frame        |
| `TimingDemo`    | none                                                               | `#demo`: the stage, the player and its script. Upgrades `a[data-demo-start][href="#demo"]`     |
| `WorkflowStrip` | `eyebrow`, `title`, `phases: string[]`                             | A hairline-ruled strip with the phases as an `ol`; the arrows are generated content            |
| `HomeHero`      | `installHref`, `eyebrow?`, `headline?`, `headlineAccent?`, `deck?` | The hero `section`; composes `TimingDemo`                                                      |

All six new components are exported from `src/components/index.ts`.

The demo's timing is `frameAt(positionMs, wordCount = 6)` in `src/utils/timing-demo.ts`, a pure function that returns
`{ wordIndex, revealedSteps, elapsedLabel, progress, ended }`. Words land every 1050ms after a 600ms lead-in, step `i`
appears on word `i * 2 + 1`, and the run lasts 8000ms. Negative and non-finite positions count as 0. The component
script only paints the frames it returns, so the timeline is unit-tested without a DOM in
`tests/utils/timing-demo.test.ts`.

### The scoped accent exception

`data-accent="brand"` lets the accent paint something static in exactly two places: the headline's accent phrase and
the `TimingDemo` root, whose stage depicts the OnCue brand. The accent audit in `e2e/homepage-design-direction.spec.ts`
skips those elements and their descendants, and a separate test fails unless exactly those two carry the marker. The
display serif is italic for the two accent phrases only.

The film card keeps a fixed dark palette in both themes because it depicts a phone screen. Its accent is `#ef827b`,
7.33:1 on `#111111`; the reference design's `#c7342b` measured 3.56:1 there. The lowest text pair in the film is
`#606060` step numbers on `#e9e9e9` badges, 5.18:1. `e2e/home-accessibility.spec.ts` measures every text element in
the film from its computed colours, with the demo forced through its current and upcoming states.

### Link preview

`src/layouts/Base.astro` renders `OpenGraph` on every page with absolute URLs built from `Astro.site`, and points
`og:image` at `public/images/oncue-og.png` (1200x630). Regenerate that image whenever the hero changes:

```bash
node scripts/capture-og-image.mjs
```

The script boots the dev server, screenshots the hero in a 1200x630 light viewport, and stops the server. If a dev
server is already running for the project, it uses that one and leaves it running. `Astro.site` comes from `SITE_URL`
and falls back to `https://example.com`, so set `SITE_URL` in production.

## Verification

Measured against the running dev server, light and dark:

| Surface                                 | Light              | Dark               |
| --------------------------------------- | ------------------ | ------------------ |
| `body` background                       | `rgb(255,255,255)` | `rgb(17,17,17)`    |
| `body` colour                           | `rgb(0,0,0)`       | `rgb(242,242,242)` |
| `body > header` (`--header-background`) | `rgb(240,240,240)` | `rgb(28,28,28)`    |
| `[data-card]` (`--card-background`)     | `rgb(240,240,240)` | `rgb(28,28,28)`    |
| Link colour (`--island`)                | `rgb(199,52,43)`   | `rgb(239,130,123)` |
| `code` colour (`--ink-soft`)            | `rgb(96,96,96)`    | `rgb(163,163,163)` |

Automated coverage:

- `e2e/homepage-design-direction.spec.ts` - three distinct font families resolve, the display-to-deck ratio clears 3.0,
  both aliases have at least one consumer, body background and the demo's ghost card differ between light and dark, no
  non-interactive element outside the two `data-accent="brand"` elements carries the accent, and horizontal overflow
  is 0 at 320, 390, 768 and 1280
- `e2e/home-oncue-hero.spec.ts` - the homepage's content, dialog, copy fallback, demo, link preview and no-JS view
- `tests/integration/design-tokens.test.ts` - `--card-background` and `--header-background` each keep at least one
  `var()` consumer in the compiled CSS, and the dark block sets at least one painted property rather than variables alone

## Related

- `src/styles/DESIGN-TOKENS-README.md` - the wider token layer this direction extends
- `docs/prototypes/restyle-astro-kit-homepage.html` - clickable prototype of the target state, with a working
  light/dark switch
- Starlight guide: **Design Direction** at `/guide/design-direction`
- [customize-design-skill.md](../02-guides/customize-design-skill.md) - the Claude skill that rebrands these tokens,
  fonts and corners and keeps this spec in step
