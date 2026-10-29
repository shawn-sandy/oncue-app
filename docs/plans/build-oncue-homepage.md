---
status: in-progress
type: feature
created: 2026-10-28
modified: 2026-10-28
repo-name: oncue-app
artifact-url: https://claude.ai/artifact/5wXUnsnrhLnWmHCXS8QG4y
issue: https://github.com/shawn-sandy/oncue-app/issues/5
effort: high
workflow: never
glance: The repo already uses OnCue's colours and fonts, but its homepage still sells Astro Kit. The reference design also has problems: labels as small as 7px, two contrast pairs that fail, no link previews, and a copy fallback that does nothing. Done means `/` describes what OnCue makes in both video shapes, and its install steps and demo work by mouse, by keyboard and with JavaScript turned off. The new e2e spec and the existing design-direction and accessibility gates must pass in light and dark.
---

# Plan: Ship the OnCue homepage, built from small parts and working before JavaScript loads

## Objective

Rebuild `/` as the OnCue plugin page from the OnCue Studio Hero design. Compose it from small Astro components that render complete HTML on the server. Add the install dialog, the copy button and the timing demo as progressive enhancements (features that work as plain links and text first, with scripts adding behaviour on top), and apply all eight fixes from the design review.

## Context

The design is a live single-file page at https://oncue-studio-hero.managed-pixe-1779.chatgpt.site with one inline script. It has five parts: a hero with an eyebrow, a two-line serif headline whose second line is a rust italic, two calls to action, a note and an outputs list; a "stage" holding a dark phone-shaped film card that highlights caption words in time with step cards, plus a play/pause transport; a four-phase workflow strip; a closing line; and a native `dialog` with the two install commands and a Copy button.

The "Oncue Studio Hero review" session measured that page at 1440px and 375px and found eight issues:

1. The copy only mentions vertical Shorts, but OnCue 1.3.0 added widescreen 16:9 and custom sizes.
2. Mono labels are fixed at 7–10px.
3. Rust labels measure 3.56:1 on the dark film and 4.37:1 on grey step badges.
4. There are no Open Graph or Twitter tags.
5. At 375px the annotations overlap the demo and the header drops two links.
6. The "Select text" fallback selects nothing.
7. Arrow glyphs are read aloud, new-tab links are not announced, and two links point at the same README section.
8. The demo opens at 00:06 with a 33×33px play button.

This repo (`oncue-app`, an Astro site that started as Astro Kit) was rebranded to OnCue's palette and fonts in the last commit, `5937220`. The homepage itself is still Astro Kit. `src/pages/index.astro` puts `HomeHero` (a component specimen) in the `header` slot and renders `FeatureCards` and `CollectionList` through `Layout`, which always adds the blog `Sidebar`.

The design system has hard rules that the e2e suite enforces, and the design breaks four of them:

- The Hydration Rule allows the accent only on interactive elements. The design paints rust on its headline, step cards and caption highlight.
- DESIGN.md allows one display weight and no italic. The design uses Georgia italic.
- The repo ships DM Mono at weight 400 only. The design asks for 500.
- The repo supports a dark theme in three scopes. The design is light-only.

The Decisions below settle each of these.

Known risks and mitigations:

- `astro.config.mjs` falls back to `site: https://example.com` when `SITE_URL` is unset, and `netlify.toml` does not set it. Absolute Open Graph URLs would then point at example.com. Step 14 builds them from `Astro.site`, and Unresolved Questions asks for the production value.
- Removing `FeatureCards` from `/` leaves the `[data-card]` probe in `e2e/homepage-design-direction.spec.ts` matching nothing. Step 3 repoints it before any code changes.
- The clipboard API is blocked in some contexts, including the review's own browser pane. Step 7 selects the text instead, and step 2 tests that path.
- Changing `SITE_TITLE` renames every page title. That is intended: the site is now OnCue.

## Decisions

- `/` becomes the OnCue plugin page. "What's in the kit" and "Latest posts" leave the homepage. `FeatureCards`, `CollectionList` and their tests stay in the repo (confirmed by the user on 2026-10-28).
- The shared `Navigation` stays, keeping the theme toggle and sign-in. Its brand becomes the OnCue logo, and How it works, Documentation and GitHub join its popover list (user).
- Accent rule: a scoped exception. `data-accent="brand"` is allowed on exactly two elements: the headline accent and the `TimingDemo` root. The accent audit skips their descendants and fails if the marker appears anywhere else. The eyebrow dot and the output check marks render in `--ink-soft`, not rust (user).
- The display serif may be italic for the two accent phrases only. Georgia italic is a system face, so it costs no font request (user).
- The hero renders inside `main` as a `section`, not in the `header` slot. It is the page's primary content, so the skip link should land on it. `index.astro` uses `Base` with `hideHeader` plus `MainSection`, because `Layout` always renders the blog sidebar.
- Every control works before JavaScript runs. "Make your first video" is a link to the README install section, and "See it in motion" is a link to `#demo`. Scripts upgrade them to open the dialog and start the demo. The Copy button and the demo transport ship `hidden` and are revealed by script, so the no-JS page has no dead controls.
- The dialog is native `dialog` plus `showModal()`. A `form method="dialog"` closes it, and `closedby="any"` adds light dismiss where browsers support it. There is no custom backdrop-click script.
- No framework island. Each behaviour is a small Astro `script` module, which Astro bundles, de-duplicates and defers. That avoids shipping the React runtime for a play button.
- The demo's timing math lives in `src/utils/timing-demo.ts` as a pure `frameAt(ms)` function, so it is unit-tested without a DOM. The component script only paints the frames it returns.
- The demo opens on its finished frame: all steps revealed, no current word, readout `00:00 / 00:08`. Play resets to 0 and runs. The markup is the same with JavaScript, without it and under reduced motion (review fix 8).
- The film card keeps a fixed dark palette in both themes because it depicts a phone screen. Its accent is `#ef827b` (7.32:1 on `#111111`), not `#c7342b` (3.55:1) (review fix 3).
- The command block uses DESIGN.md's `code-block` tokens (`--paper-sunk` / `--ink-soft`) instead of the design's black block, so it follows the theme.
- External links open in the same tab, so no "(opens in a new tab)" text is needed. `ExternalLink` hides the arrow glyph from screen readers (review fix 7; same-tab behaviour confirmed by the user).
- Label floors are 0.75rem outside the film and 0.625rem inside it, set in rem (review fix 2).
- The plan uses the red-green-verify shape: failing tests first (RED), the minimum code to pass them (GREEN), then full checks (VERIFY). In RED, the unit tests run against empty stubs (modules that export the right name and render nothing), so they fail on assertions instead of on a missing import.
- There is no SHIP phase. Committing and opening a PR were not requested.
- RED settled: the suites run against this worktree's own dev server through `PLAYWRIGHT_BASE_URL` (port 4341), because port 4321 belongs to another repository's server and Playwright's `reuseExistingServer` would test that one instead.
- RED settled: `frameAt(DEMO_DURATION_MS)` returns `wordIndex: -1` with every step revealed, so the ended frame and the server-rendered frame are the same picture rather than leaving the last word highlighted as the reference did.
- RED settled: the film contrast gate measures the computed colour of every text-bearing element in `[data-film]`, with the demo forced into a current word, a current step and an upcoming step, instead of asserting the planned hex pairs, because literal pairs pass whatever the CSS paints.
- RED settled: the Replay test drives `requestAnimationFrame` with Playwright's fake clock, so the 8-second run costs no wall time and the `00:00` readout after Replay cannot race a frame.
- GREEN settled: `og:image` is always the OnCue capture, never a page's `pageImageUrl`, because those images have unknown sizes and would make the `1200`×`630` size tags false.
- GREEN settled: component rules are qualified by their root class (`.timing-demo .timing-demo__play`), because Astro scopes with `:where()`, which adds no specificity, and the vendor's `button[type]` and `ul, ol` rules otherwise won.
- GREEN settled: the annotations show only when the stage itself is at least 40rem wide (a container query, not a viewport breakpoint), so they never cover the film; the hero splits 1fr to 1.15fr so the stage reaches that width at 1280px. They are hidden at 375px.
- GREEN settled: `scripts/capture-og-image.mjs` reuses a dev server that is already running, because Astro allows one per project and exits naming its URL; it stops only a server it started.
- GREEN settled: the copy fallback says "Press Ctrl+C or Cmd+C" (step 7) rather than the preview's "Ctrl+C", so macOS users are told the right key.
- VERIFY settled: `e2e/dividers.spec.ts` no longer checks `/`, which renders no `<hr>` now that it lists no posts; `e2e/astro-v7-upgrade.spec.ts` ignores the dev toolbar's own "Use the Image component" audit error, which the new `<img>` logo triggers only when the test leaves a page before that dev-only audit finishes.
- VERIFY settled: the footer's social links (`src/components/astro/Social.astro`) lose `target="_blank"` too (the user approved widening the scope on 2026-10-28), so the arrow and new-tab check in `e2e/home-oncue-hero.spec.ts` covers the whole page; it failed on the three old footer links before the fix.

## Files

- e2e/home-oncue-hero.spec.ts (new) — objective spec: content, dialog, demo, Open Graph, no-JS and failure paths
- e2e/homepage-design-direction.spec.ts (modified) — accent exception, new surface probes, hero link contract
- e2e/home-accessibility.spec.ts (modified) — film contrast pairs
- tests/utils/timing-demo.test.ts (new) — frameAt boundaries
- tests/components/ExternalLink.astro.test.ts (new) — arrow hidden, no target
- tests/components/CommandBlock.astro.test.ts (new) — commands, hidden button, status region
- tests/components/InstallDialog.astro.test.ts (new) — labelled dialog, close form, nested parts
- tests/components/FilmCard.astro.test.ts (new) — finished frame markup
- tests/components/TimingDemo.astro.test.ts (new) — accent marker, hidden transport, labels
- tests/components/WorkflowStrip.astro.test.ts (new) — ordered list
- tests/components/Navigation.astro.test.ts (modified) — brandLogo and external links
- src/utils/timing-demo.ts (new) — pure frameAt timeline
- src/components/astro/ExternalLink.astro (new) — atom: link plus hidden arrow
- src/components/astro/CommandBlock.astro (new) — commands with copy and select fallback
- src/components/astro/InstallDialog.astro (new) — modal upgraded from a README link
- src/components/astro/FilmCard.astro (new) — static phone frame
- src/components/astro/TimingDemo.astro (new) — stage, transport, player script
- src/components/astro/WorkflowStrip.astro (new) — four-phase ordered list
- src/components/astro/HomeHero.astro (modified) — rewritten as the OnCue hero
- src/components/astro/Navigation.astro (modified) — brandLogo prop, OnCue links
- src/components/index.ts (modified) — export the six new components
- src/pages/index.astro (modified) — compose the page on Base and MainSection
- src/layouts/Base.astro (modified) — OpenGraph in head, app names, nav logo
- src/utils/site-config.ts (modified) — SITE_TITLE and SITE_DESCRIPTION
- scripts/capture-og-image.mjs (new) — foreground driver that regenerates the preview image
- public/images/oncue-logo.svg (new) — logo asset, already present untracked; committed as is
- public/images/oncue-og.png (generated) — 1200×630 link preview
- DESIGN.md (modified) — accent exception, display italic, new components
- project-docs/03-features/design-direction.md (modified) — homepage and components
- src/content/docs/guide/design-direction.mdx (modified) — Starlight mirror
- src/content/docs/guide/components/navigation-popover.mdx (modified) — brandLogo prop
- CHANGELOG.md (modified) — entry for the new homepage
- src/components/astro/Social.astro (modified) — footer social links open in the same tab
- e2e/dividers.spec.ts (modified) — no longer checks `/`, which renders no `<hr>`
- e2e/astro-v7-upgrade.spec.ts (modified) — ignores the dev toolbar's aborted image audit
- .impeccable/config.json (new) — design-hook ignore for regex literals in a unit test

## Steps

### Phase: RED

1. [x] Write `e2e/home-oncue-hero.spec.ts` for the happy path on `/`. The `h1` reads "Every word. Right on cue.". Activating "Make your first video" opens a modal `dialog` that holds both `/plugin` commands and has focus inside it, and Escape closes it with focus back on the trigger. Pressing Play moves the time readout past `00:00` within 2s and relabels the button "Pause timing demo". The workflow `ol` has four items. `meta[property="og:image"]` ends in `/images/oncue-og.png`. Why: this is the objective test, the one check that proves the homepage became the OnCue page. Verify: `npx playwright test e2e/home-oncue-hero.spec.ts` exits non-zero on the `h1` assertion, receiving "Build agentic web apps on Astro Kit."; paste the output.
2. [x] Add the edge cases to the same spec. A rejected `navigator.clipboard.writeText` (stubbed with `page.addInitScript`) leaves `getSelection().toString()` equal to the two commands, and the status region says so. Closing and reopening the dialog resets the button label to "Copy". With `javaScriptEnabled: false`, the install call to action is a link to the README install anchor, the transport is hidden and all three steps are revealed. Under `reducedMotion: 'reduce'`, nothing advances until Play is pressed. A `visibilitychange` to hidden pauses a running demo. Replay after `00:08` restarts at `00:00`. At 375px the annotations compute `display: none` and `scrollWidth` equals `clientWidth`. Every `[data-ui]` label computes at least 12px outside `[data-film]` and at least 10px inside it. Why: these cases are the review's findings plus the progressive-enhancement promises, and each one must fail if its behaviour regresses. Verify: the spec still exits non-zero, and every new test fails on an assertion, not on a timeout or a selector error.
3. [x] Update the existing gates in `e2e/homepage-design-direction.spec.ts` and `e2e/home-accessibility.spec.ts`. The accent audit skips descendants of `[data-accent="brand"]`, and a new test fails unless exactly two elements carry that marker. The repaint test's `body > header` and `[data-card]` probes move to `[data-demo-ghost]`. The call-to-action test asserts that every hero link is either a `#fragment` that resolves to an element or an `https://github.com/shawn-sandy/oncue` URL, instead of fetching internal routes. The contrast test adds the film pairs: `#f2f2f2`, `#a3a3a3` and `#ef827b` on `#111111`, `#ffffff` on `#c7342b`, and `#606060` on `#e9e9e9`. Why: these specs encode the design system and still describe the Astro Kit homepage, so they must state the new contract before the code changes. Verify: `npx playwright test e2e/homepage-design-direction.spec.ts e2e/home-accessibility.spec.ts` fails only in the edited tests, each on a missing marker or probe; paste the output.
4. [x] Write the unit tests against empty stubs. `tests/utils/timing-demo.test.ts` calls `frameAt` at 0, 599, 600, 1649, 1650, 7999, 8000, 12000, -5 and `NaN`, and checks the word index, revealed steps, the `00:00`-style label, progress clamped between 0 and 1, and `ended`. Add one Astro Container test per component in `tests/components/` (`ExternalLink`, `CommandBlock`, `InstallDialog`, `FilmCard`, `TimingDemo`, `WorkflowStrip`), following `FeatureCards.astro.test.ts`. Create each module as a stub that exports the right name and renders nothing. Why: unit tests pin each part's contract in isolation, and the stubs make them fail on assertions instead of on a missing import. Verify: `npx vitest run tests/utils/timing-demo.test.ts tests/components` fails in the new files only, on assertions; paste the summary.

### Phase: GREEN

5. [x] Implement `src/utils/timing-demo.ts` with `DEMO_DURATION_MS = 8000`, `LEAD_MS = 600`, `WORD_MS = 1050`, and a pure `frameAt(positionMs, wordCount = 6)` that returns `{ wordIndex, revealedSteps, elapsedLabel, progress, ended }`. Step i is revealed at word i\*2+1, as in the design. The label is zero-padded `mm:ss`. Negative or non-finite input counts as 0. Why: the design's timing lives inside a DOM loop, and as a pure function it can be tested and shared by the component and its tests. Verify: `npx vitest run tests/utils/timing-demo.test.ts` passes.
6. [x] Build `src/components/astro/ExternalLink.astro` with props `href` and optional `class`, a slot for the label, an appended `aria-hidden` arrow span, and no `target` attribute. Why: five links on the page need the same arrow treatment, and one small component (an atom) applies review fix 7 to all of them. Verify: `npx vitest run tests/components/ExternalLink.astro.test.ts` passes.
7. [x] Build `src/components/astro/CommandBlock.astro`. A `commands: string[]` prop renders in `pre[data-command-block]` with a `code` child, next to a `hidden` Copy button and a `role="status"` region. Its script reveals the button and copies the joined commands with `navigator.clipboard.writeText`, then shows "Copied". If copying fails, the script selects the `code` with `Range.selectNodeContents` and `Selection.addRange`, labels the button "Selected" and announces "Commands selected. Press Ctrl+C or Cmd+C to copy.". It listens for the parent dialog's `close` event to reset the label to "Copy", and it is styled from DESIGN.md's `code-block` tokens. Why: the commands must be selectable with no JavaScript, and the review found the "Select text" fallback selected nothing. Verify: `npx vitest run tests/components/CommandBlock.astro.test.ts` passes, and so does the clipboard-rejection test from step 2.
8. [x] Build `src/components/astro/InstallDialog.astro` with props `id`, `commands` and `fallbackHref`. It is a `dialog` with `closedby="any"`, labelled by its `h2` ("Let's get you on cue."). It holds the eyebrow, the intro, `CommandBlock`, the sample prompt, the requirements, an `ExternalLink` to the setup guide and a named close button inside `form method="dialog"`. Its script finds `a[data-opens-dialog]` links that match its `id`, then calls `preventDefault()` and `showModal()`. If the script never runs, the link's README `href` still works. Why: a real link is the no-JS install path, and the native dialog provides focus trapping, Escape and focus return without custom code. Verify: `npx vitest run tests/components/InstallDialog.astro.test.ts` passes, and so do the dialog tests from step 1.
9. [x] Build `src/components/astro/FilmCard.astro` as a static frame. It is `role="img"` with one `aria-label`, and contains the logo, "Explained / 001", the title with an `em` accent, three `data-step` cards, six `data-word` caption spans and the footer "Made to make sense." / "9:16 · 16:9". It renders the finished frame. It uses a fixed dark palette: `#ef827b` accent, `#606060` step numbers on `#e9e9e9`, a 1px `var(--rule)` edge and a 0.625rem label floor. Why: a presentational part with no script can be previewed and tested in isolation, and its default markup doubles as the no-JS and reduced-motion view. Verify: `npx vitest run tests/components/FilmCard.astro.test.ts` passes.
10. [x] Build `src/components/astro/TimingDemo.astro` with `id="demo"` and `data-accent="brand"` on its root. It holds two `aria-hidden` ghost cards (one carrying `data-demo-ghost` on `--paper-sunk`), two `aria-hidden` annotations set to `display: none` below 30rem, `FilmCard`, a `hidden` transport and the caption "Illustrative preview · silent · word-synced animation". The transport has a 44×44px play button, a progress track and a `00:00 / 00:08` readout. Its script reveals the transport and paints `frameAt()` from a `requestAnimationFrame` loop. It switches the button label between Play, Pause and Replay, and pauses on `visibilitychange`. When any `a[data-demo-start]` is activated, it starts from 0, scrolls into view only below 47.5rem (instantly under reduced motion) and moves focus to the play button. Transitions are removed under `prefers-reduced-motion: reduce`. Why: the player is the page's one stateful behaviour, and keeping it in this component keeps every other part static. Verify: `npx vitest run tests/components/TimingDemo.astro.test.ts` passes, and so do the demo tests from steps 1 and 2.
11. [x] Build `src/components/astro/WorkflowStrip.astro` with props `eyebrow`, `title` and `phases: string[]`. It renders a `section` with hairline rules, the title in DM Mono 400 (the design's 500 is not a shipped weight) and an `ol` whose arrows are CSS-generated content, not text. Why: an ordered list tells screen readers the phases are a sequence, which the design's four `div`s with arrow glyphs did not. Verify: `npx vitest run tests/components/WorkflowStrip.astro.test.ts` passes.
12. [x] Rewrite `src/components/astro/HomeHero.astro` as the OnCue hero, `section[data-home-hero]`. Its props are `eyebrow` ("A Claude Code plugin for explainer videos"), `headline` ("Every word."), `headlineAccent` ("Right on cue.", rendered in `em` with `data-accent="brand"`), a `deck` that names vertical and widescreen output, and `installHref`. It also renders the note and the outputs list, with check marks in `--ink-soft`. The two calls to action are `a[data-opens-dialog="install"]` and `a[href="#demo"][data-demo-start]`. It composes `TimingDemo`, and its display and deck sizes reuse the existing `--hero-display-size` knob so the 3.0 ratio gate still holds. Why: `HomeHero` is the exported homepage hero, so rewriting it keeps the import surface while the content changes. Verify: `npx playwright test e2e/home-oncue-hero.spec.ts -g "h1|demo"` passes.
13. [x] Recompose `src/pages/index.astro` on `Base` with `hideHeader`, wrapping the content in `MainSection` with `showBreadcrumb={false}`. The page holds `HomeHero`, `WorkflowStrip`, the closing line "Made for Shorts, Reels, TikTok and YouTube." with an `ExternalLink` to the README usage section, and an `InstallDialog` with `id="install"`. Drop `FeatureCards` and `CollectionList` from this page only. Set `SITE_TITLE = 'OnCue'` and the new `SITE_DESCRIPTION` in `src/utils/site-config.ts`, and export the six new components from `src/components/index.ts`. Why: `Layout` always renders the blog sidebar, and `Base` with `MainSection` keeps the skip-link target without it. Verify: `npx playwright test e2e/home-oncue-hero.spec.ts e2e/skip-link.spec.ts e2e/home-structure.spec.ts` passes.
14. [x] Wire the unused `src/components/astro/OpenGraph.astro` into the `head` of `src/layouts/Base.astro`. Build an absolute `og:url` and `og:image` from `Astro.site`, set `imgWidth="1200"` and `imgHeight="630"`, and default the image to `/images/oncue-og.png`. Replace the hard-coded `AstroKit` app-name metas with `SITE_TITLE`, and pass `brandLogo="/images/oncue-logo.svg"` to `Navigation`. Why: shared links show no preview today (review fix 4), and the component that fixes it already exists. Verify: `npx playwright test e2e/home-oncue-hero.spec.ts -g "og:image"` passes, and `/about` also carries `og:title`.
15. [x] Extend `src/components/astro/Navigation.astro` with an optional `brandLogo` prop: an `img` whose `alt` is `brandTitle`, inside a brand link at least 44px tall. Add a second popover list with `ExternalLink`s to How it works, Documentation (the README top, not `#req`) and GitHub. Why: the review found the phone header dropped two of the three links, and inside the popover they are reachable at every width. Verify: `npx vitest run tests/components/Navigation.astro.test.ts` passes with a new `brandLogo` case, and `npx playwright test e2e/navigation-popover.spec.ts` still passes.
16. [x] Keep `public/images/oncue-logo.svg`, which is already in the worktree as an untracked file (the OnCue circular play logo, 630 bytes, with its own `title`); do not re-download it. Write `scripts/capture-og-image.mjs`, a foreground Node driver that boots `npm run dev`, polls `/` until it answers 200, screenshots the hero at a 1200×630 viewport with Playwright's Chromium into `public/images/oncue-og.png`, and kills the server in `finally`. Run it once and keep the PNG. Why: the preview image has to be regenerated whenever the hero changes, so it comes from a script rather than a hand export. Verify: `node scripts/capture-og-image.mjs` exits 0, and `file public/images/oncue-og.png` reports 1200 x 630.
17. Update the docs. In `DESIGN.md`, record the scoped `data-accent="brand"` exception under the Hydration Rule, display italic for accent phrases under Typography, and the six new components under Components. Describe the new homepage, its components and props, and the progressive-enhancement baseline in `project-docs/03-features/design-direction.md` and its Starlight mirror `src/content/docs/guide/design-direction.mdx`. Document `brandLogo` in `src/content/docs/guide/components/navigation-popover.mdx`, and add a `CHANGELOG.md` entry. If any GREEN test still fails after 8 fix-and-rerun rounds, stop and report the failing assertion, the last diff and what was ruled out, rather than claiming success. Why: CLAUDE.md requires every feature to be documented in both project docs and the Starlight guide, and DESIGN.md is the file the e2e gates cite. Verify: `npm run lint:md` exits 0, and `grep -q 'data-accent="brand"' DESIGN.md` succeeds.

### Phase: VERIFY

18. Run both full suites: `npm test -- --run` (Vitest) and `npx playwright test`. Why: the rebuild touches the shared layout and navigation, so every route's specs must still pass, not only the homepage's. Verify: both commands exit 0; paste the pass counts.
19. Run `npm run lint:all`, which covers ESLint, Stylelint, the Prettier check, `tsc --noEmit` and markdownlint. Format with `npx prettier --write` on touched files only. Why: a green suite over code that fails the type check or the style lint is not done. Verify: `npm run lint:all` exits 0.
20. [x] Do a live browser pass with the `mcp__Claude_Browser__*` tools against this worktree's dev server, after confirming its port and cwd. Load `/` at 320, 375, 768, 1280 and 1440px in light and dark, and report measured values: label sizes (at least 12px outside the film, 10px inside), the play button box (at least 44×44), `scrollWidth` against `clientWidth`, film contrast from computed colours, and zero console warnings or errors. Run axe-core in the page (it is not a project dependency) and expect zero violations. Open the dialog, copy, close and reopen it, then play, pause and replay the demo. Why: the e2e specs prove behaviour, but layout, theme repaint and real-browser warnings need a measured pass (`rules/ui-verification.md`). Verify: every reported value meets its floor; paste the numbers and the axe summary.

## Tests

Tier 1 — This plan changes application code

- Objective: `/` is the OnCue page, and its dialog, copy and demo behaviours work with and without JavaScript. File: e2e/home-oncue-hero.spec.ts; Type: smoke; Asserts: h1 text; the dialog opens with both commands, closes on Escape and returns focus; the demo plays from 00:00, pauses on a hidden tab and replays; the workflow has four steps; og:image is present; the clipboard-failure path selects the commands; the no-JS view shows a README link and a revealed demo; label sizes; no overflow at 375px; Run: npx playwright test e2e/home-oncue-hero.spec.ts
- Unit: demo timeline math. File: tests/utils/timing-demo.test.ts; Targets: frameAt; Key cases: 0, the 599/600 and 1649/1650 boundaries, 7999/8000, past the end, negative, NaN
- Unit: ExternalLink markup. File: tests/components/ExternalLink.astro.test.ts; Targets: ExternalLink.astro; Key cases: arrow is aria-hidden, no target attribute, label comes from the slot
- Unit: CommandBlock markup. File: tests/components/CommandBlock.astro.test.ts; Targets: CommandBlock.astro; Key cases: every command rendered and escaped, Copy button hidden in the server HTML, status region present
- Unit: InstallDialog markup. File: tests/components/InstallDialog.astro.test.ts; Targets: InstallDialog.astro; Key cases: dialog labelled by its h2, close form uses method=dialog, CommandBlock nested, setup link present
- Unit: FilmCard markup. File: tests/components/FilmCard.astro.test.ts; Targets: FilmCard.astro; Key cases: role=img with one label, three revealed steps, six words, no current word, footer reads 9:16 · 16:9
- Unit: TimingDemo markup. File: tests/components/TimingDemo.astro.test.ts; Targets: TimingDemo.astro; Key cases: data-accent=brand on the root, id=demo, transport hidden, play label reads Play timing demo, annotations aria-hidden
- Unit: WorkflowStrip markup. File: tests/components/WorkflowStrip.astro.test.ts; Targets: WorkflowStrip.astro; Key cases: one li per phase inside an ol, no arrow glyph in the text content
- Unit: Navigation brand logo. File: tests/components/Navigation.astro.test.ts; Targets: Navigation.astro; Key cases: img alt equals brandTitle, no img without the prop, the three external links render in the popover
- E2E: design-system gates. File: e2e/homepage-design-direction.spec.ts, e2e/home-accessibility.spec.ts; Asserts: the accent exception covers exactly two elements, repaint probes resolve, hero links are fragments or OnCue repo URLs, film pairs clear 4.5:1 in both themes

## Acceptance Criteria

- [x] `/` renders the `h1` "Every word. Right on cue." and no "Astro Kit" text inside `main`.
- [x] The hero copy mentions widescreen output, and the film footer reads "9:16 · 16:9".
- [x] With JavaScript disabled, "Make your first video" opens the OnCue README install section and the demo shows all three steps.
- [x] With JavaScript enabled, the same link opens a modal dialog; Escape closes it and focus returns to the link.
- [x] When the clipboard rejects, both commands are selected and a status message says how to copy them.
- [x] The demo starts at 00:00 when played and pauses when the tab is hidden, and its play button measures at least 44×44px.
- [x] No label computes below 12px outside the film or below 10px inside it.
- [x] Every text pair in the film measures at least 4.5:1 (lowest planned: 5.17:1).
- [x] `/` carries `og:title`, `og:description`, a 1200×630 `og:image` and `twitter:card`.
- [x] At 375px the annotations are hidden, nothing scrolls sideways, and How it works, Documentation and GitHub can be reached from the navigation.
- [x] No arrow glyph is exposed to screen readers, and no link opens a new tab.
- [x] The accent audit passes in light and dark, with `data-accent="brand"` on exactly two elements.
- [ ] `npm test -- --run`, `npx playwright test` and `npm run lint:all` all exit 0.

## Completion Report

- Step 17 — `npm run lint:md` exits 1 on 919 errors that predate this plan: 818 are in 119 Markdown files the plan does not touch, 100 are the long one-line steps this spec's renderer requires, and the rest are older errors in `CHANGELOG.md` and `DESIGN.md`. The plan's own Markdown edits add none (`CHANGELOG.md` 8 before and after, `DESIGN.md` 7 and 7, `project-docs/03-features/design-direction.md` 0 and 0), and `grep -q 'data-accent="brand"' DESIGN.md` succeeds.
- Step 18 — `npm test -- --run` exits 1 on 35 failures in 12 files that import nothing this plan changed (role validator, role guard, Clerk and Supabase integration, CSRF, email validation, input sanitization, message-us, connection status, role generator), plus `tests-examples/demo-todo-app.spec.ts`, which Vitest collects by mistake. Every new and changed unit file passes (15 files, 115 tests). `npx playwright test` cannot pass here: Firefox and WebKit are not installed (`npx playwright install firefox webkit`). Chromium passes 82 of 85; the 3 failures in `e2e/logging-correlation.spec.ts` need `CLERK_WEBHOOK_SECRET` and a configured Clerk and Supabase environment ("Webhook secret not configured", 503 on `/dashboard`).
- Step 19 — `npm run lint:all` exits non-zero: ESLint and Stylelint pass, but `prettier --check .` fails on 57 files the plan does not touch plus `docs/plans/index.html` (which also fails at HEAD), `tsc --noEmit` fails on 103 errors that predate this plan (it cannot resolve any `.astro` import) and six more of the same kind for the six new exports in `src/components/index.ts`, and `lint:md` fails as in step 17.
- Criterion "`npm test -- --run`, `npx playwright test` and `npm run lint:all` all exit 0." — not met, for the reasons in steps 18 and 19.
- End-to-end verification — ran in Chromium only, because Firefox and WebKit are not installed on this machine.

## Verification

Start the dev server from this worktree (`npm run dev`, port 4321) and confirm its cwd is the worktree. Then run `npx playwright test e2e/home-oncue-hero.spec.ts e2e/homepage-design-direction.spec.ts e2e/home-accessibility.spec.ts` and expect every test to pass in both colour schemes. Walk the page as a visitor would:

- Open `/` at 375px, open the menu and confirm the three OnCue links are there.
- Press "Make your first video", Tab to Copy and press it, then press Escape. Focus should be back on the link.
- Press "See it in motion". The readout should count from 00:00 to 00:08, and the button should end on "Replay timing demo".
- Turn JavaScript off and reload. The install link should go to the README's install section, and the film should show all three steps.
- Run `node scripts/capture-og-image.mjs` and check that `public/images/oncue-og.png` is 1200×630.

The end state is `npm test -- --run`, `npx playwright test` and `npm run lint:all` all exiting 0, plus the measured browser pass from step 20 with every value at or above its floor.

## Previews

- Film card: finished frame and mid-play (steps 9, 10)
  Page tokens copied from src/styles/\_design-tokens.scss (`--ink`, `--ink-soft`, `--paper`, `--rule`, `--island`, light and dark). The film palette is fixed in both themes, per Decisions. Contrast was measured with the WCAG relative-luminance script on every text pair shown; the lowest is 5.17:1 (`#606060` step number on `#e9e9e9`), and every pair passes AA.
  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Film card states</title>
      <style>
        :root {
          --ink: #000;
          --ink-soft: #606060;
          --paper: #fff;
          --rule: #dedede;
          --island: #c7342b;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme='light']) {
            --ink: #f2f2f2;
            --ink-soft: #a3a3a3;
            --paper: #111;
            --rule: #2e2e2e;
            --island: #ef827b;
          }
        }
        :root[data-theme='dark'] {
          --ink: #f2f2f2;
          --ink-soft: #a3a3a3;
          --paper: #111;
          --rule: #2e2e2e;
          --island: #ef827b;
        }
        body {
          margin: 0;
          padding: 12px;
          background: var(--paper);
          color: var(--ink);
          font:
            14px/1.4 system-ui,
            sans-serif;
        }
        .grid {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        h2 {
          margin: 0 0 6px;
          font:
            12px ui-monospace,
            monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-soft);
        }
        .film {
          width: 172px;
          box-sizing: border-box;
          padding: 12px;
          background: #111;
          color: #f2f2f2;
          border: 1px solid var(--rule);
          border-radius: 16px;
        }
        .lbl {
          display: flex;
          justify-content: space-between;
          font:
            10px ui-monospace,
            monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a3a3a3;
        }
        .title {
          margin: 10px 0;
          font:
            22px/1.05 Georgia,
            serif;
        }
        .title em {
          color: #ef827b;
        }
        .step {
          display: flex;
          gap: 6px;
          align-items: center;
          margin: 5px 0;
          padding: 5px;
          border-radius: 6px;
          background: #fff;
          color: #000;
          font-size: 11px;
          font-weight: 600;
        }
        .step b {
          display: grid;
          place-items: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #e9e9e9;
          color: #606060;
          font:
            10px ui-monospace,
            monospace;
        }
        .step.now {
          background: #c7342b;
          color: #fff;
        }
        .step.now b {
          background: #fff;
          color: #c7342b;
        }
        .step.up {
          background: #1c1c1c;
          color: #a3a3a3;
        }
        .step.up b {
          background: #2e2e2e;
          color: #a3a3a3;
        }
        .cap {
          margin: 10px 0;
          text-align: center;
          font-size: 12px;
          color: #a3a3a3;
        }
        .cap .said {
          color: #f2f2f2;
        }
        .cap .cur {
          padding: 0 3px;
          background: #c7342b;
          color: #fff;
        }
        .acc {
          color: #ef827b;
        }
        .bar {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 8px;
          font:
            12px ui-monospace,
            monospace;
          color: var(--ink-soft);
        }
        .play {
          width: 44px;
          height: 44px;
          border: 1px solid var(--rule);
          border-radius: 50%;
          background: var(--paper);
          color: var(--ink);
          font: inherit;
          cursor: pointer;
        }
        .play:focus-visible,
        .play.is-focus {
          outline: 2px solid var(--island);
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="grid">
        <section>
          <h2>Finished / no JS</h2>
          <div class="film" role="img" aria-label="Finished demo frame">
            <div class="lbl"><span>OnCue</span><span>Explained / 001</span></div>
            <div class="title">Big ideas.<br /><em>Short stories.</em></div>
            <div class="step"><b>01</b>Start with a script</div>
            <div class="step"><b>02</b>Give it a voice</div>
            <div class="step"><b>03</b>Bring visuals to life</div>
            <p class="cap"><span class="said">Your script. Your voice. Your visuals.</span></p>
            <div class="lbl">
              <span>Made to make sense.</span><span class="acc">9:16 · 16:9</span>
            </div>
          </div>
          <div class="bar">
            <button class="play" type="button" aria-label="Play timing demo">&#9654;</button
            ><span>00:00 / 00:08</span>
          </div>
        </section>
        <section>
          <h2>Playing, word 4 of 6</h2>
          <div class="film" role="img" aria-label="Demo mid-play">
            <div class="lbl"><span>OnCue</span><span>Explained / 001</span></div>
            <div class="title">Big ideas.<br /><em>Short stories.</em></div>
            <div class="step"><b>01</b>Start with a script</div>
            <div class="step now"><b>02</b>Give it a voice</div>
            <div class="step up"><b>03</b>Bring visuals to life</div>
            <p class="cap">
              <span class="said">Your script. Your</span> <span class="cur">voice.</span> Your
              visuals.
            </p>
            <div class="lbl">
              <span>Made to make sense.</span><span class="acc">9:16 · 16:9</span>
            </div>
          </div>
          <div class="bar">
            <button class="play is-focus" id="p" type="button" aria-label="Pause timing demo">
              II</button
            ><span>00:04 / 00:08</span>
          </div>
        </section>
      </div>
      <script>
        var p = document.getElementById('p')
        p.addEventListener('click', function () {
          var on = p.getAttribute('aria-label') === 'Pause timing demo'
          p.setAttribute('aria-label', on ? 'Play timing demo' : 'Pause timing demo')
          p.textContent = on ? '▶' : 'II'
        })
      </script>
    </body>
  </html>
  ```
- Install dialog and command block: default, copied, copy failed (steps 7, 8)
  Tokens copied from src/styles/\_design-tokens.scss (`--ink`, `--ink-soft`, `--paper`, `--paper-sunk`, `--rule`, `--island`, `--island-bg`) and DESIGN.md's `code-block`. Contrast measured with the same script: the lowest text pair is 4.60:1 (`--island` on `--island-bg`, light hover), the code text is 5.51:1 light and 6.75:1 dark, and every pair passes AA.
  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Install dialog states</title>
      <style>
        :root {
          --ink: #000;
          --ink-soft: #606060;
          --paper: #fff;
          --paper-sunk: #f0f0f0;
          --rule: #dedede;
          --island: #c7342b;
          --island-bg: #fcebe9;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme='light']) {
            --ink: #f2f2f2;
            --ink-soft: #a3a3a3;
            --paper: #111;
            --paper-sunk: #1c1c1c;
            --rule: #2e2e2e;
            --island: #ef827b;
            --island-bg: #3a1714;
          }
        }
        :root[data-theme='dark'] {
          --ink: #f2f2f2;
          --ink-soft: #a3a3a3;
          --paper: #111;
          --paper-sunk: #1c1c1c;
          --rule: #2e2e2e;
          --island: #ef827b;
          --island-bg: #3a1714;
        }
        body {
          margin: 0;
          padding: 12px;
          background: var(--paper-sunk);
          color: var(--ink);
          font:
            14px/1.45 system-ui,
            sans-serif;
        }
        .dlg {
          position: relative;
          padding: 16px;
          background: var(--paper);
          border: 1px solid var(--rule);
          border-radius: 8px;
        }
        .eb {
          margin: 0;
          font:
            12px ui-monospace,
            monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-soft);
        }
        h2 {
          margin: 4px 0 6px;
          font:
            400 26px/1.1 Georgia,
            serif;
        }
        p {
          margin: 0 0 10px;
        }
        .x {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: var(--ink);
          font-size: 20px;
          cursor: pointer;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 10px;
        }
        .cb {
          border: 1px solid var(--rule);
        }
        pre {
          margin: 0;
          padding: 10px 12px;
          background: var(--paper-sunk);
          color: var(--ink-soft);
          font:
            12px/1.6 ui-monospace,
            monospace;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
        }
        .st {
          font-size: 12px;
          color: var(--ink-soft);
        }
        .copy {
          min-height: 44px;
          padding: 0 14px;
          border: 1px solid var(--rule);
          border-radius: 8px;
          background: transparent;
          color: var(--island);
          font:
            600 15px system-ui,
            sans-serif;
          cursor: pointer;
        }
        .copy:hover,
        .copy.is-hover {
          background: var(--island-bg);
          border-color: var(--island);
        }
        .copy:focus-visible,
        .copy.is-focus,
        .x:focus-visible {
          outline: 2px solid var(--island);
          outline-offset: 2px;
        }
        .sel {
          background: var(--island-bg);
          color: var(--ink);
        }
        a {
          color: var(--island);
        }
      </style>
    </head>
    <body>
      <div class="dlg" role="dialog" aria-labelledby="t">
        <form>
          <button class="x" type="button" aria-label="Close installation instructions">
            &times;
          </button>
        </form>
        <p class="eb">Your first production</p>
        <h2 id="t">Let's get you on cue.</h2>
        <p>In Claude Code, add the marketplace and install OnCue.</p>
        <div class="grid">
          <div class="cb">
            <pre><code>/plugin marketplace add shawn-sandy/oncue
  /plugin install oncue@oncue</code></pre>
            <div class="row">
              <span class="st">Default</span><button class="copy" id="c" type="button">Copy</button>
            </div>
          </div>
          <div class="cb">
            <pre><code>/plugin marketplace add shawn-sandy/oncue
  /plugin install oncue@oncue</code></pre>
            <div class="row">
              <span class="st" role="status">Install commands copied.</span
              ><button class="copy is-focus" type="button">Copied</button>
            </div>
          </div>
          <div class="cb">
            <pre><code class="sel">/plugin marketplace add shawn-sandy/oncue
  /plugin install oncue@oncue</code></pre>
            <div class="row">
              <span class="st">Selected. Press Ctrl+C to copy.</span
              ><button class="copy is-hover" type="button">Selected</button>
            </div>
          </div>
        </div>
        <p style="margin-top:10px">
          <a href="#t">Read the setup guide <span aria-hidden="true">&#8599;</span></a>
        </p>
      </div>
      <script>
        var c = document.getElementById('c')
        c.addEventListener('click', function () {
          c.textContent = 'Copied'
          setTimeout(function () {
            c.textContent = 'Copy'
          }, 1200)
        })
      </script>
    </body>
  </html>
  ```

## Next Steps

- Update PRODUCT.md for OnCue as the product
  PRODUCT.md still describes Astro Kit's users and purpose, which no longer matches the homepage.
  ```text
  In the oncue-app repo, rewrite the Users and Product Purpose sections of PRODUCT.md so they describe the OnCue plugin page that `/` now is, keeping the Astro Kit developer audience only where it still applies. Keep the impeccable product-schema comment intact. Add a CHANGELOG.md entry. Verify with `npm run lint:md` exiting 0.
  ```
- Rebrand the web app manifest and theme colour
  `public/manifest.webmanifest` and Base.astro's `theme-color` (`#1e293b`) still carry Astro Kit values.
  ```text
  In the oncue-app repo, update public/manifest.webmanifest (name, short_name, theme_color) and the `theme-color` meta in src/layouts/Base.astro to OnCue values from DESIGN.md (`--paper` #ffffff light). Add a CHANGELOG.md entry. Verify by loading `/` and checking `document.querySelector('meta[name=theme-color]').content` and the manifest response in the browser network panel.
  ```
- Replace the empty homepage meta test
  `e2e/home-page.spec.ts` asserts `expect(true).toBe(true)`, so it passes whatever the page says.
  ```text
  In the oncue-app repo, replace the body of e2e/home-page.spec.ts with real assertions: the page title contains "OnCue", and `meta[name=description]` is non-empty. Confirm the test fails when SITE_TITLE in src/utils/site-config.ts is temporarily changed, then restore it. Verify with `npx playwright test e2e/home-page.spec.ts` exiting 0.
  ```
- Carry the review fixes back to the hosted design page
  The live design at oncue-studio-hero.managed-pixe-1779.chatgpt.site still has all eight issues; its source is not in this repo.
  ```text
  In the repository that hosts the OnCue Studio Hero page, apply the eight fixes from the "Oncue Studio Hero review" session: widescreen copy, label sizes in rem, the #ef827b film accent, Open Graph tags, hidden annotations below 480px, a selecting copy fallback, aria-hidden arrows with same-tab links, and a 00:00 demo start with a 44px play button. Verify each with measured values in a browser at 375px and 1440px.
  ```

## Unresolved Questions

- Production `SITE_URL`
  ```text
  In the oncue-app repo, `astro.config.mjs` sets `site: process.env.SITE_URL || 'https://example.com'` and `netlify.toml` does not define SITE_URL. Find where the production URL for this site should come from (Netlify environment, netlify.toml, or .env.example), check whether any other code reads SITE_URL, and recommend one place to set it so the Open Graph URLs in src/layouts/Base.astro resolve to the real domain. Do not change files; report the recommendation and the evidence.
  ```
- Call-to-action wording
  ```text
  In the oncue-app repo, the plan at docs/plans/build-oncue-homepage.md uses "Make your first video" for the hero's primary call to action because OnCue 1.3.0 added widescreen 16:9 output; the source design says "Make your first Short". Read the OnCue README at https://github.com/shawn-sandy/oncue and the plan's hero copy, then recommend one label and say why. Do not change files.
  ```
- axe in the e2e suite
  ```text
  In the oncue-app repo, there is no axe dependency, so step 20 of docs/plans/build-oncue-homepage.md runs axe-core by injecting it into the live page. Compare that with adding `@axe-core/playwright` as a devDependency and asserting zero violations on `/` in e2e/home-oncue-hero.spec.ts: cost, CI impact, and how the existing e2e specs are structured. Recommend one. Do not install anything.
  ```

## Resources

- OnCue Studio Hero design (live): https://oncue-studio-hero.managed-pixe-1779.chatgpt.site, the source of the layout, copy and demo script
- "Oncue Studio Hero review" session (local_54c80e30-7daf-4936-975e-9f9dca0690e8): the eight issues and recommended fixes, measured at 1440px and 375px
- DESIGN.md and src/styles/\_design-tokens.scss: the token values and named rules this plan cites
- e2e/homepage-design-direction.spec.ts: the machine-checked Hydration Rule and type-role gates
- Component Driven User Interfaces: https://www.componentdriven.org/, the bottom-up composition model the component split follows
