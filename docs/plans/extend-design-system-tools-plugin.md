---
status: completed
type: feature
created: 2026-10-30
modified: 2026-10-30
repo-name: oncue-app
effort: high
artifact-url: https://claude.ai/artifact/RhRkjTkpTwfua95DgvYNVT
issue: https://github.com/shawn-sandy/oncue-app/issues/10
glance: Today the design-system workflow is split across a repo-only skill with Astro Kit paths baked in, a plugin skill that publishes, and a hand-done alignment pass, so every other project starts from zero and the record drifts. Done means one plugin carries all three stages, the generalized contrast script reproduces OnCue's eight ratios from a plain CSS file as well as the SCSS mixins, a project with no tokens yet gets the seven-token direction scaffolded in three scopes, and a run against oncue-app republishes the OnCue system with nothing changed but its provenance.
---

# Plan: Make the OnCue design-system workflow a plugin any DESIGN.md project can run

## Objective

Extend the `design-system-tools` plugin in `shawn-sandy/agentics` with a generalized `customize-design` skill and a new `align-design-md` skill, and fold this session's publishing lessons into its existing `from-design-md` skill, so a project with a `DESIGN.md` and a stylesheet declaring its tokens can rebrand, re-align its record with its code, and publish a claude.ai Design System without any Astro Kit path in the loop.

## Context

On 2026-10-30 one session in `oncue-app` ran the whole design-system workflow by hand, in three stages, each living somewhere different:

- **Align the record with the code.** `DESIGN.md` and its two mirrors (`src/content/docs/guide/design-direction.mdx`, `project-docs/03-features/design-direction.md`) still described a single Copy button, a 44px logo and a two-column feature-section header after three merges had changed all of them. Nothing compares the record to the component sources, so the fix was manual: read each component's `<style>` block, list its literal colours, lengths and radii, and rewrite the frontmatter `components:` and the prose. No skill exists for this stage.
- **Customize the tokens.** `oncue-app/.claude/skills/customize-design/SKILL.md` rebrands the seven direction tokens in all three theme scopes and measures contrast with its own `scripts/contrast.mjs`. It works only in Astro Kit forks: the script hardcodes `../../../../src/styles/_design-tokens.scss` and the `direction-light` / `direction-dark` mixin names, the skill names `npm run sass:build`, Starlight's accent variables and the two mirror files by path.
- **Publish the system.** The `from-design-md` skill of the `design-system-tools` plugin (`~/devbox/agentics/kit/plugins/design-system-tools`, marketplace `agentics-kit`, version 0.2.0) turned `DESIGN.md` into the OnCue Design System artifact at https://claude.ai/artifact/HZkvaPFwEVEbpuv6udpWiT. A second copy of that skill at `~/.claude/skills/design-system-from-design-md/` is the one the session actually ran; it carries a `contrast.test.mjs` the plugin copy lacks, and the two will keep drifting while both exist.

The publishing run surfaced five lessons the skill does not yet state. The Design System page shows blank component rows for any system without `components/bundle.js`, even static ones, so a one-line namespace stub is required. `type.families` values over 200 characters are dropped by the page, so DM Sans lost its emoji fallbacks. Heading ceilings read from the vendor stylesheet with a regex were wrong twice: the shared header band's `h1` reads `--fs-12` (6.375rem), not the 5.063rem the old record carried. The page publishes a new version with generated files right after the first publish, so a second publish must re-read the index first. And the cover and previews had to be checked in both themes with the browser's colour-scheme emulation before the result could be called verified.

**Placement.** Three homes were weighed. Astro Kit's `.claude/skills/` reaches only forks of that repo. A new marketplace plugin would sit beside `design-system-tools`, whose description already promises "turn a repository's DESIGN.md and the stylesheets behind it into a claude.ai Design System", and would split one workflow across two installs. Extending `design-system-tools` keeps the three stages under one `/design-system-tools:` prefix, reuses its tested contrast script pattern, and ships through the marketplace the user already maintains. The Astro Kit repo copy of `customize-design` is superseded in a follow-up, not in this plan.

**Generalization approach.** The skills discover what the repo-only skill hardcoded: the file declaring `--<token>:` custom properties under `:root`, the dark scopes (`prefers-color-scheme: dark`, `[data-theme="dark"]`, `.dark`), a Sass build script if `package.json` has one, and any Markdown or MDX file that repeats three or more of the token values (the "mirrors"). The findings are shown once in an `AskUserQuestion` and confirmed; nothing is written to a config file, because a rediscovery is three greps. `DESIGN.md` itself follows the public DESIGN.md format spec, so any project that has one is in scope.

**Constraints and risks.** claude.ai-hosted marketplaces refuse a plugin with a top-level `bin/` (plugin CHANGELOG 0.2.0), so scripts run as `node "${CLAUDE_SKILL_DIR}/scripts/<name>.mjs"` and must stay dependency-free (`node:` modules only), since the target project may have no `node_modules`. The contrast script cannot measure `hsl()`, `oklch()` or translucent values; a project on those gets "measure by hand" rather than a wrong number. Heading sizes are measured from the rendered page only when a dev server is reachable; otherwise the skill records the stylesheet's own declaration and flags it as unmeasured rather than guessing. A mirror the grep misses (one that repeats names but not values) is a known gap, listed under Unresolved Questions.

## Decisions

- Extend `design-system-tools` rather than add a plugin or an Astro Kit skill, because the plugin already owns the publish stage and the three stages are one workflow.
- Three skills under one plugin: `customize-design`, `align-design-md`, `from-design-md`, invoked in the order align, customize, publish.
- No config file: each skill discovers the token file, scopes, build command and mirrors by grep and confirms once; the user's answers live in the conversation, not the repo.
- Scripts are dependency-free Node run through `${CLAUDE_SKILL_DIR}`, matching the 0.2.0 change that removed `bin/`.
- The static route of `from-design-md` always ships `components/bundle.js` with the `@ds-bundle` header and an empty exports object, because the page renders no preview without it.
- Heading ceilings come from the rendered page's computed `font-size` when a server is reachable, never from a regex over vendor CSS.
- `oncue-app` is the fixture and the parity bar: the generalized script must print the same eight ratios the repo script prints today, and a `from-design-md` run must republish the OnCue system with only its `meta` changed.
- Scaffold is in scope (confirmed 2026-10-30): when discovery finds no token file, `scripts/scaffold.mjs` writes the seven-token direction in three scopes plus a starter `DESIGN.md` from the OnCue template, adjusting the brand colour step by step until every pair clears 4.5:1, so `customize-design` always has something to rebrand.
- Interview, 2026-10-30: a brand colour too light for text is darkened step by step until it measures, with the original kept for the wash or the logo, never refused.
- Interview, 2026-10-30: a mirror is a `.md` or `.mdx` file that repeats three or more token values; matching on token names alone is out, because a guide that merely discusses the tokens would then be edited.
- Interview, 2026-10-30: a control under a size floor the record states (the 40px copy button under the 44px rule) is reported as drift with its file and line and never changed by the skill; the user decides whether the record or the code moves.
- Red-green-verify phases apply only inside the `customize-design` lane, the one lane that changes runnable code; the other lanes are Markdown and have nothing to fail first.

## Files

- kit/plugins/design-system-tools/skills/customize-design/SKILL.md (new) — the generalized rebrand skill
- kit/plugins/design-system-tools/skills/customize-design/scripts/contrast.mjs (new) — reads SCSS mixins, plain CSS scopes, DESIGN.md frontmatter or bare hex pairs
- kit/plugins/design-system-tools/skills/customize-design/scripts/contrast.test.mjs (new) — node:test cases against the fixtures
- kit/plugins/design-system-tools/skills/customize-design/fixtures/oncue/\_design-tokens.scss (new) — copy of oncue-app's token file at 2f0b5d2
- kit/plugins/design-system-tools/skills/customize-design/fixtures/oncue/DESIGN.md (new) — copy of oncue-app's DESIGN.md frontmatter
- kit/plugins/design-system-tools/skills/customize-design/fixtures/plain-css/tokens.css (new) — the same seven tokens as plain CSS in `:root` and `[data-theme="dark"]`
- kit/plugins/design-system-tools/skills/customize-design/scripts/scaffold.mjs (new) — writes tokens.css in three scopes and a starter DESIGN.md from the templates
- kit/plugins/design-system-tools/skills/customize-design/scripts/scaffold.test.mjs (new) — node:test cases that scaffold into a temp dir and measure the result
- kit/plugins/design-system-tools/skills/customize-design/templates/tokens.css (new) — the OnCue direction with placeholders for the derived values
- kit/plugins/design-system-tools/skills/customize-design/templates/DESIGN.md (new) — the starter spec in the DESIGN.md format, frontmatter filled from the derived values
- kit/plugins/design-system-tools/skills/align-design-md/SKILL.md (new) — the drift finder and record updater
- kit/plugins/design-system-tools/skills/align-design-md/references/drift-checklist.md (new) — what counts as drift and what does not
- kit/plugins/design-system-tools/skills/from-design-md/SKILL.md (modified) — the five publishing lessons
- kit/plugins/design-system-tools/skills/from-design-md/scripts/contrast.test.mjs (new) — ported from the user-level copy
- kit/plugins/design-system-tools/README.md (modified) — three skills, usage order, requirements
- kit/plugins/design-system-tools/CHANGELOG.md (modified) — 0.3.0 entry
- kit/plugins/design-system-tools/.claude-plugin/plugin.json (modified) — description and keywords
- .claude-plugin/marketplace.json (modified) — version 0.3.0 and description
- tests/plugins/design-system-tools.test.mjs (new) — plugin structure and version consistency

## Steps

### Lane: customize-design (owns: kit/plugins/design-system-tools/skills/customize-design/\*\*)

### Phase: RED

1. [x] Copy oncue-app's `src/styles/_design-tokens.scss` and the frontmatter of its `DESIGN.md` (both at commit 2f0b5d2 plus that day's uncommitted component tokens) into `skills/customize-design/fixtures/oncue/`, write `fixtures/plain-css/tokens.css` declaring the same seven tokens under `:root` and `[data-theme="dark"]` with no Sass, and write `scripts/contrast.test.mjs` with `node:test` cases asserting: the SCSS fixture prints 21.00, 6.28, 5.31, 18.42, 5.51, 4.65, 4.60 and 18.19 in light and 16.86, 7.48, 7.32, 15.22, 6.75, 6.61, 6.20 and 14.29 in dark for the eight Astro Kit pairs; the plain CSS fixture prints the same table; `--design-md` resolves `colors.island` and `colors.paper` to 5.31; a bare `#185c53:#fcfcfd` pair measures; 4.499 floors to 4.49; exit code 1 below 4.5:1 and 2 for `oklch()`; and, in `scripts/scaffold.test.mjs`, that `scaffold.mjs --accent '#185c53' --out <tmp>` writes `tokens.css` with the seven tokens in all three scopes and a `DESIGN.md` whose frontmatter names them, and that `contrast.mjs --tokens <tmp>/tokens.css` exits 0 for a light accent such as `#f5a623` after the script darkens it. Why: the generalized script has to reproduce exactly what the Astro Kit script prints today before it may replace it, and the plain CSS fixture is what proves it is no longer tied to Sass mixins. Verify: `node --test kit/plugins/design-system-tools/skills/customize-design/scripts/` fails because neither `contrast.mjs` nor `scaffold.mjs` exists yet.

### Phase: GREEN

2. [x] Write `skills/customize-design/scripts/contrast.mjs` using only `node:fs` and `node:url`: `--tokens <file>` reads `--name: value` declarations and assigns each to light or dark by its enclosing scope (a `direction-light` or `direction-dark` mixin, `:root`, `@media (prefers-color-scheme: dark)`, `[data-theme="dark"]`, `.dark`, overridable with `--light-scope` and `--dark-scope`), `--design-md <file>` reads the frontmatter `colors:` map, `--pairs fg:bg,...` names the pairs and defaults to the eight Astro Kit pairs when those seven names exist, bare `#fg:#bg` arguments measure directly, comments are stripped first, ratios floor to two decimals, and the exit code is 1 below 4.5:1 and 2 when a value cannot be measured. Why: the repo script's only tie to Astro Kit is its hardcoded path and mixin names; everything else, the floor, the exit codes and the pair table, is already right and must carry over unchanged. Verify: `node --test kit/plugins/design-system-tools/skills/customize-design/scripts/contrast.test.mjs` passes.
3. [x] Write `scripts/scaffold.mjs` and the two templates: `--accent <hex>` and `--out <dir>` (default `src/styles`) are required, `--name` defaults to the folder name; the light accent is the brand colour darkened toward black in steps of 2% until it clears 4.5:1 on white and on the sunk paper, the dark accent is the same hue lightened toward white until it clears 4.5:1 on `#111111`, the wash is the accent at 8% over paper, and the neutrals are the OnCue values; `templates/tokens.css` declares the seven colour tokens and the three `--font-family-*` roles under `:root`, `@media (prefers-color-scheme: dark) { :root }`, `:root[data-theme="dark"]` and `:root[data-theme="light"]`; `templates/DESIGN.md` is the OnCue spec's frontmatter and section headings with the derived hex values and the script's measured ratios filled in and the prose left as short placeholders; the script refuses to overwrite an existing file. Why: a project with no tokens has nothing for customize-design to rebrand, and deriving the accent until it measures is what keeps the scaffold inside the contrast rule rather than a colour the user then has to fix by hand. Verify: `node --test kit/plugins/design-system-tools/skills/customize-design/scripts/scaffold.test.mjs` passes.
4. [x] Write `skills/customize-design/SKILL.md` from oncue-app's `.claude/skills/customize-design/SKILL.md`, keeping its Path A (rebrand every scope) and Path B (a scoped brand sheet) and its A1 to A7 structure, but replacing every Astro Kit path with discovery: Step 0 greps for the file declaring `--` custom properties under `:root`, the dark scopes, a `sass` or `sass:build` script in `package.json`, every `.md` and `.mdx` file repeating three or more token values (the mirrors), and `DESIGN.md`, then shows the findings in the one `AskUserQuestion` that also asks scope, colour, fonts, corners and name; the drift pre-flight becomes "run the discovered build command and confirm `git status` is clean for the compiled stylesheet, or skip when there is no build"; A5 runs the discovered build command, `node "${CLAUDE_SKILL_DIR}/scripts/contrast.mjs" --tokens <file>`, and the project's own test command if one exists; A6 sweeps `DESIGN.md` and each mirror with the same hex-and-ratio grep; A7 hands off to `/design-system-tools:from-design-md` by name; when Step 0 finds no file declaring the tokens, the skill offers the scaffold, runs `node "${CLAUDE_SKILL_DIR}/scripts/scaffold.mjs"` with the brand colour from the same question, and continues into Path A on the files it wrote; frontmatter carries `name`, `description` and the same `allowed-tools` list as `from-design-md`. Why: the repo skill's procedure is sound and already field-tested; only its addresses are Astro Kit's, so the rewrite is substitution, not invention. Verify: `grep -nE "astro-basics|_design-tokens\.scss|starlight|project-docs" SKILL.md` matches only lines inside a clearly labelled "Astro Kit example" callout, and `/skill-reviewer:reviewing-skills` reports no blocker.

### Phase: VERIFY

5. [x] Run the new script against the live oncue-app checkout, `node "<skill>/scripts/contrast.mjs" --tokens ~/devbox/oncue-app/src/styles/_design-tokens.scss`, and against `~/devbox/oncue-app/DESIGN.md` with `--design-md`, and compare with `node .claude/skills/customize-design/scripts/contrast.mjs` run inside oncue-app. Why: the fixtures prove the parser; the live repo proves the discovery of scopes and the pair defaults on the real file, which is the parity bar the plan sets. Verify: the two outputs agree on every ratio for every pair, `node "<skill>/scripts/scaffold.mjs" --accent '#185c53' --out <tmp>` followed by the contrast script on its output exits 0, and the lane's test command still passes.

### Lane: align-design-md (owns: kit/plugins/design-system-tools/skills/align-design-md/\*\*)

6. [x] Write `skills/align-design-md/SKILL.md`: inventory `DESIGN.md`'s frontmatter `components:`, `typography:`, `rounded:` and `spacing:` entries and the named rules in its prose; locate each component's source by grepping the component key's words across `src/components`, `components` and `app`; list every literal in each source's style block with one grep for `#[0-9a-fA-F]{3,8}`, `[0-9.]+(px|rem|em)` and `var(--`; compare against the frontmatter values and the prose claims; print a drift table (component, spec value, code value, file and line), including a control whose size sits under a floor the record states; on the user's confirmation rewrite the frontmatter and prose of `DESIGN.md` and apply the same change to every mirror found with the customize-design grep; never edit a source file; offer `/design-system-tools:from-design-md` as the next step when the record changed. Include this session's three drifts as the worked example: `CommandBlock`'s padding and radius no longer matching `code-block`, the 56px `nav-logo`, and the stacked feature-section header. Why: the record drifted across three consecutive merges because no step compares it to the code; turning the manual pass into a skill is what makes the published system trustworthy over time. Verify: run the skill against oncue-app checked out at `bede805` (the commit before the alignment) and the drift table names all three; run it against oncue-app at `2f0b5d2` with the aligned working tree and it reports no drift.
7. [x] Write `skills/align-design-md/references/drift-checklist.md`: what counts as drift (a frontmatter value the code contradicts, a component in the code with no frontmatter entry, a selector or data attribute the prose names that no longer exists, a rule the code breaks such as a 40px control under a stated 44px floor) and what does not (a vendor default the project never overrides, the literal inside a `var(--x, fallback)`, a value that differs only in unit when `rem` and `px` agree at 16px), plus the one-line report format. Why: without a written boundary the skill either reports every pixel or misses the real changes; the checklist is what makes two runs agree. Verify: `SKILL.md` links the file by relative path and `/skill-reviewer:reviewing-skills` reports no blocker for the skill.

### Lane: from-design-md (owns: kit/plugins/design-system-tools/skills/from-design-md/\*\*)

8. [x] Patch `skills/from-design-md/SKILL.md` step 4 ("Components are static and hand-written") to always write `components/bundle.js` on the static route, its first line the `@ds-bundle` header with the namespace and an empty `components` list and its body `window.<Namespace> = {};`, keeping `libraries: []`, and say why: the Design System page renders no preview, static or not, without that file. Why: this session published once without it and every component row came back blank; the old Astro Kit system has the same blank rows today. Verify: `grep -n "@ds-bundle" kit/plugins/design-system-tools/skills/from-design-md/SKILL.md` finds the new instruction inside step 4.
9. [x] Patch step 4's typography mapping in the same file: cap every `type.families` value at 200 characters by dropping the emoji fallback families last and listing the cut in the final report; take each heading style's ceiling from the rendered page when a dev server is reachable (computed `font-size` of `h1`, `h2` and `h3` at a 1280px viewport through the browser tools) and cite the stylesheet rule that sets it; without a server, record the stylesheet's declaration and write "unmeasured" into the style's usage note. Why: the page drops a family over 200 characters silently, and two regex passes over the vendor CSS gave the wrong ceiling for the header band's `h1`. Verify: `grep -n "200 characters\|computed" kit/plugins/design-system-tools/skills/from-design-md/SKILL.md` finds both instructions in step 4.
10. [x] Patch steps 7 and 8 in the same file: before any publish after the first, `read` `project/design-system.json` again because the page publishes a new version with generated files right after the first publish and a stale index is refused; record `meta.ref` as `branch@sha` and add `meta.note` when `DESIGN.md` had uncommitted changes at sync time; in step 8 check the cover and every preview in both themes with the browser's colour-scheme emulation, and name "blank rows" and "a block that vanishes in one theme" as the two failures to fix before reporting. Why: each of these cost a round trip this session, and a skill that states them turns three recoveries into none. Verify: `grep -n "read.*design-system.json\|colorScheme\|uncommitted" kit/plugins/design-system-tools/skills/from-design-md/SKILL.md` finds all three.
11. [x] Copy `~/.claude/skills/design-system-from-design-md/scripts/contrast.test.mjs` to `skills/from-design-md/scripts/contrast.test.mjs`, adjusting its import path to `./contrast.mjs`. Why: the user-level copy of this skill was the only tested one, and once the plugin copy carries the test the user-level copy can be deleted without losing coverage. Verify: `node --test kit/plugins/design-system-tools/skills/from-design-md/scripts/` passes.

### Lane: lead (after: customize-design, align-design-md, from-design-md)

12. [x] Update the plugin's shared files: `README.md` lists the three skills in a table, documents the usage order align, customize, publish with each `/design-system-tools:<skill>` command, and names the requirements (Node 22 or newer, the Artifact tool, the built-in browser tools for measuring); `CHANGELOG.md` gains `## 0.3.0 — <date>` with Added entries for `customize-design` and `align-design-md` and a Changed entry for `from-design-md`; `.claude-plugin/plugin.json` gains the two skills in its description and keywords; `.claude-plugin/marketplace.json` sets `design-system-tools` to `0.3.0` with the same description; and `tests/plugins/design-system-tools.test.mjs` asserts each skill folder has a `SKILL.md` with `name` and `description`, every `scripts/` path a SKILL.md names exists, and the marketplace version equals the CHANGELOG's newest heading. Why: the marketplace entry is what reaches other projects, and a version that disagrees with the changelog is how the 0.1.0 and 0.2.0 drift started. Verify: `node --test tests/` in the agentics repo passes and `git diff --stat` lists only files named in this plan.
13. [x] Install the plugin into oncue-app from the local agentics checkout and run the three skills there in order: `align-design-md` reports no drift, `customize-design` chooses "keep OnCue Rust" and changes no token while printing the eight ratios, and `from-design-md` re-syncs https://claude.ai/artifact/HZkvaPFwEVEbpuv6udpWiT. Why: oncue-app is the fixture the whole plan was derived from, so a run there is the one check that exercises every lane together. Verify: an Artifact `read` of `project/tokens.json` after the run differs from the 2026-10-30 version only in `meta`, the index's `lastChange` is updated, and the Components view shows every preview in both themes.

## Tests

Tier 1 — This plan adds runnable scripts and their tests to the plugin

- Objective: the contrast script works on a project that is not Astro Kit. File: kit/plugins/design-system-tools/skills/customize-design/scripts/contrast.test.mjs; Type: smoke; Asserts: the plain CSS fixture with `:root` and `[data-theme="dark"]` scopes, no Sass and no mixins, prints all eight pairs in both themes with the same ratios the SCSS fixture prints; Run: node --test kit/plugins/design-system-tools/skills/customize-design/scripts/
- Unit: token parsing and measurement. File: kit/plugins/design-system-tools/skills/customize-design/scripts/contrast.test.mjs; Targets: the scope assignment, the DESIGN.md frontmatter reader, the ratio floor and the exit codes; Key cases: SCSS mixins, plain CSS scopes, `--light-scope` override, frontmatter `colors:`, bare hex pair, 4.499 floors to 4.49, below-floor exits 1, `oklch()` exits 2
- Unit: the scaffold. File: kit/plugins/design-system-tools/skills/customize-design/scripts/scaffold.test.mjs; Targets: the accent derivation and the template writer; Key cases: a dark brand colour passes unchanged, a light one is darkened until it measures, the dark-theme tint clears 4.5:1 on `#111111`, three scopes are written, an existing file is never overwritten
- Unit: the publishing script's own test, ported. File: kit/plugins/design-system-tools/skills/from-design-md/scripts/contrast.test.mjs; Targets: `resolve` and the ratio function of from-design-md's contrast.mjs; Key cases: alias following, first-theme fallback, translucent value refused
- Integration: plugin structure and version consistency. File: tests/plugins/design-system-tools.test.mjs; Targets: the three skill folders, their referenced scripts, plugin.json, marketplace.json and CHANGELOG.md together; Key cases: every SKILL.md has frontmatter name and description, every `scripts/` path a SKILL.md mentions exists, marketplace version equals the newest CHANGELOG heading

## Acceptance Criteria

- [x] `node --test kit/plugins/design-system-tools/skills/customize-design/scripts/` and `node --test kit/plugins/design-system-tools/skills/from-design-md/scripts/` both exit 0 in the agentics repo.
- [x] The plugin's `customize-design` script run against `~/devbox/oncue-app/src/styles/_design-tokens.scss` prints the same ratio for every pair as oncue-app's own `.claude/skills/customize-design/scripts/contrast.mjs`.
- [x] `node scaffold.mjs --accent '#f5a623' --out <tmp>` writes `tokens.css` and `DESIGN.md`, and `contrast.mjs --tokens <tmp>/tokens.css` exits 0 on all eight pairs in both themes.
- [x] `grep -rnE "astro-basics|_design-tokens\.scss|starlight|project-docs" kit/plugins/design-system-tools/skills/*/SKILL.md` matches only lines inside a labelled "Astro Kit example" callout.
- [x] `align-design-md` run against oncue-app at `bede805` names the CommandBlock, nav-logo and feature-section header drifts, and at the aligned `2f0b5d2` working tree names none.
- [x] A `from-design-md` re-sync of https://claude.ai/artifact/HZkvaPFwEVEbpuv6udpWiT from the plugin leaves `project/tokens.json` identical to the 2026-10-30 version except `meta`, and every component row in the page's Components view renders in both themes.
- [x] `.claude-plugin/marketplace.json` lists `design-system-tools` at `0.3.0`, `CHANGELOG.md`'s newest heading is `0.3.0`, and `node --test tests/` passes in the agentics repo.

## Verification

In a fresh clone of the agentics branch, run `node --test tests/` and the two skill-level `node --test` commands; all exit 0. Then create a scratch Astro project outside Astro Kit with no tokens and no `DESIGN.md`, install the plugin from the local checkout, and run `/design-system-tools:customize-design` with a brand colour: the skill offers the scaffold, writes `src/styles/tokens.css` in three scopes and a starter `DESIGN.md`, and continues into the rebrand; choose a second accent and both scopes of `tokens.css` carry the new values, `DESIGN.md`'s frontmatter and prose carry the new hex values and the script's measured ratios, and the script exits 0. Run `/design-system-tools:align-design-md` there and it reports no drift. Run `/design-system-tools:from-design-md` there and the new artifact's Components view shows the static previews rendering in light and dark. Finally, in `~/devbox/oncue-app`, run the three skills in order as step 12 describes and confirm the OnCue artifact's `project/tokens.json` differs from the 2026-10-30 version only in `meta`.

## Completion Report

- Lanes built and tested — on branch `claude/design-system-tools-0-3-0-6d598f` of `shawn-sandy/agentics`: `customize-design` 25 tests, `from-design-md` 4, `tests/plugins/design-system-tools.test.mjs` 5 (its fifth runs the skill-level suites so `run-all.sh` and CI reach them), all passing; an adversarial review of the diff found seven script and template defects and five tests that could not fail, each fixed with a regression test observed failing first; a follow-up security review of the commit found the scaffold's no-overwrite guard open to a dangling symlink and a check-then-write race, fixed with exclusive creates and its own regression test; the parity run printed byte-identical output to oncue-app's own script; `bash scripts/verify.sh`, the repo's merge gate running `tests/run-all.sh`, is green at 111 passed, 0 failed, 4 skipped.
- `node --test <dir>/` run as a glob — the directory form in steps 1, 2, 3, 11 and 12 and in criteria 1 and 7 exits 1 on Node 26 before running anything, so each was run as `node --test "<dir>/*.test.mjs"`; the whole-tree glob also runs `tests/publish/test-dist-transforms.mjs`, which fails without a built `dist/` and is on `run-all.sh`'s skip list, so `run-all.sh` is the tree-wide check that passed.
- Drift verified at `2f0b5d2`, not `bede805` — at `bede805` the record and the code agree; the three drifts were introduced by the two commits after it (`4401ed4`, `2f0b5d2`), so the table was checked against `2f0b5d2`'s committed record and code, where it names all three, and the skill's worked example says so.
- Criterion 5 and step 13 closed on a second run — the first align run on the aligned working tree reported one row the hand-made alignment had missed, `components.input.backgroundColor` `{colors.paper}` against `src/styles/components/_form.scss:27` painting `input, textarea, select` with `var(--paper-sunk)` on purpose; the oncue-app session changed the record to `{colors.paper-sunk}` and its Inputs prose to say so, and the re-run over all eighteen component entries, the prose claims and both mirrors reported no drift (the ghost button's hover is a `color-mix()` of the accent, which the checklist leaves alone).
- The rest of step 13 held — `customize-design` discovery found the token file, the mixins, `sass:build`, `DESIGN.md` and the three mirrors, kept OnCue Rust and printed the eight ratios; `from-design-md` re-synced the OnCue system to version 1793373091-74df with `project/tokens.json` identical to the 2026-10-30 version except `meta`, `lastChange.at` 2026-10-30T15:10:18Z, and all ten previews and the cover rendering in light and dark under colour-scheme emulation.
- One file outside the plan's list changed — the repo root `README.md` plugin table, regenerated with `scripts/build-readme-table.mjs` because the plugin description changed and the gate's `readme` stage fails otherwise.
- Skill review done through a report-only subagent — `/skill-reviewer:reviewing-skills` found no blockers (10, 10 and 9 of 10); its suggestions were applied, so `customize-design` and `align-design-md` list `Skill` in `allowed-tools` and drop the unused `Artifact` rather than copying `from-design-md`'s list verbatim, and the hand-off to `from-design-md` never prompts.

## Next Steps

- Supersede the Astro Kit repo copy of customize-design
  Once the plugin ships, the copy in oncue-app only drifts.
  ```text
  In the oncue-app repo, replace .claude/skills/customize-design/SKILL.md with a short skill that says the
  workflow now lives in the design-system-tools plugin (/design-system-tools:customize-design), keeps the
  Astro Kit-specific notes (the sass:build drift check, the Starlight accent variables, the two mirror
  files) as a "project notes" section the plugin skill reads when present, and deletes scripts/contrast.mjs.
  Update project-docs/02-guides/customize-design-skill.md and src/content/docs/guide/customize-design.mdx
  to match. Verify: npm run lint:md passes and grep -rn "scripts/contrast.mjs" .claude/skills returns nothing.
  ```
- Delete the user-level copy of from-design-md
  The plugin copy becomes the tested one after step 10.
  ```text
  After design-system-tools 0.3.0 is installed, remove ~/.claude/skills/design-system-from-design-md/ so
  only the plugin's from-design-md skill remains. Verify: ToolSearch for "design-system-from-design-md"
  finds nothing and /design-system-tools:from-design-md still loads.
  ```
## Unresolved Questions

- Mirror discovery by value may miss a mirror that repeats token names but not hex values
  ```text
  In ~/devbox/oncue-app, list every .md and .mdx file that mentions --ink, --island or --paper-sunk but
  contains none of the seven direction hex values. Recommend whether design-system-tools' mirror discovery
  should match on names as well as values, and what false positives that would add.
  ```
- Whether align-design-md should also read the e2e specs that assert the design
  ```text
  In ~/devbox/oncue-app, read e2e/homepage-design-direction.spec.ts and e2e/home-accessibility.spec.ts and
  say which of their assertions encode DESIGN.md rules. Recommend whether an align-design-md run should
  report a rule the spec no longer asserts, and how it would find the spec files in another project.
  ```

## Resources

- The DESIGN.md format spec that `DESIGN.md` follows: https://raw.githubusercontent.com/google-labs-code/design.md/main/docs/spec.md
- The Design System artifact type (its `SKILL.md` and `artifact-type/reference/*.md` define every file shape): https://claude.ai/artifact/5M7UeXXcx16TP3vzVFNDzd
- The OnCue design system published on 2026-10-30, the parity target for step 12: https://claude.ai/artifact/HZkvaPFwEVEbpuv6udpWiT
- The older Astro Kit system, left in place as the upstream kit's record: https://claude.ai/artifact/HKxyaqURmUX9WE4G8TiiW4
- The plugin to extend: https://github.com/shawn-sandy/agentics/tree/main/kit/plugins/design-system-tools
- The repo-only skill being generalized: `oncue-app/.claude/skills/customize-design/SKILL.md` and its `scripts/contrast.mjs`
- The user-level copy of the publishing skill, source of the ported test: `~/.claude/skills/design-system-from-design-md/`
