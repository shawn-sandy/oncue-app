import { test, expect } from '@playwright/test'

/**
 * Objective-verification smoke test for docs/plans/add-homepage-design-direction.md.
 *
 * The plan's objective is that the homepage *adopts* the design direction
 * rather than merely declaring it, so every assertion here is a measurement of
 * the running page and every one of them fails if the behaviour regresses to
 * what the original design review recorded. Those "before" numbers are quoted
 * inline so a future reader can see what each gate is holding back.
 *
 * The direction's structural rule is "colour marks hydration": the accent may
 * only paint something a visitor can operate. That is what makes this a
 * checkable contract instead of a taste preference, and it is what the accent
 * audit below enforces.
 */

/** Widths the plan's acceptance criteria name for the reflow gate. */
const WIDTHS = [320, 390, 768, 1280] as const

/**
 * Elements a visitor can operate. The accent audit permits these and their
 * descendants (a `<span>` inside a link inherits the link's colour without
 * being interactive itself) and fails on everything else.
 */
const INTERACTIVE = 'a[href], button, [role="button"], summary, input, select, textarea'

/**
 * The one scoped exception to the Hydration Rule (DESIGN.md). The headline's
 * accent phrase and the timing demo depict the brand, so they and their
 * descendants may paint the accent. The audit skips them, and a separate test
 * pins the marker to exactly those two elements so the exception cannot spread.
 */
const BRAND_ACCENT = '[data-accent="brand"]'

test.describe('Homepage design direction', () => {
  // Review baseline: exactly ONE family (-apple-system) rendered across every
  // h1, h2, h3, p, a and button, so headings and body copy differed only by
  // size. The plan assigns three roles: display, body sans, mono.
  test('three distinct font families resolve across heading, body and label', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')

    // `page.goto` resolves on `load`, but the display face is declared
    // `font-display: swap` and can activate after that. Without this wait the
    // probe can read the fallback stack and score the roles against metrics
    // that are about to change.
    await page.evaluate(() => document.fonts.ready)

    const roles = await page.evaluate(() => {
      const family = (el: Element | null) => (el ? getComputedStyle(el).fontFamily : null)

      const heading = document.querySelector('h1')
      const label = document.querySelector('[data-ui="eyebrow"], [data-ui="label"]')

      // Body copy: the first paragraph that is not itself a label/eyebrow and
      // carries real prose, found by walking the document rather than by
      // matching a class name.
      const body = Array.from(document.querySelectorAll('p')).find(
        p =>
          !p.matches('[data-ui="eyebrow"], [data-ui="label"]') &&
          (p.textContent ?? '').trim().length > 20
      )

      return {
        heading: family(heading),
        body: family(body ?? null),
        label: family(label),
      }
    })

    // Each role must exist on the page at all.
    expect(roles.heading, 'no h1 on the homepage').toBeTruthy()
    expect(roles.body, 'no body-copy paragraph on the homepage').toBeTruthy()
    expect(roles.label, 'no [data-ui="eyebrow"]/[data-ui="label"] element').toBeTruthy()

    // Was 1. The gate is 3.
    const distinct = new Set([roles.heading, roles.body, roles.label])
    expect(
      distinct.size,
      `expected 3 distinct font-family values, got ${distinct.size}: ${JSON.stringify(roles)}`
    ).toBe(3)
  })

  // A self-hosted face ships only the weights its `@font-face` declares, so a
  // rule that asks it for a heavier one gets a browser-synthesized bold. Before
  // the OnCue rebrand the mono role was a system stack with a real bold, and the
  // hero legend's `b` (weight 650) relied on it; DM Mono ships 400 only.
  test('no text asks a self-hosted face for a bold weight it does not ship', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)

    const { families, synthesized } = await page.evaluate(() => {
      // Heaviest weight each loaded family ships: "400" -> 400, "400 700" -> 700.
      const heaviest = new Map<string, number>()
      document.fonts.forEach(face => {
        if (face.status !== 'loaded') return
        const family = face.family.replace(/['"]/g, '')
        const max = Math.max(...face.weight.split(' ').map(Number))
        heaviest.set(family, Math.max(heaviest.get(family) ?? 0, max))
      })

      const offenders = Array.from(document.querySelectorAll('body *')).flatMap(el => {
        const text = (el.textContent ?? '').trim()
        if (!text) return []
        const style = getComputedStyle(el)
        const family = style.fontFamily.split(',')[0].trim().replace(/['"]/g, '')
        const weight = Number(style.fontWeight)
        const max = heaviest.get(family)
        // Browsers synthesize bold when 600+ is asked of a face lighter than 600.
        return max !== undefined && weight >= 600 && max < 600
          ? [`${el.tagName.toLowerCase()} "${text.slice(0, 30)}" asks ${family} for ${weight}`]
          : []
      })

      return { families: [...heaviest.keys()], synthesized: offenders }
    })

    // Guards against a vacuous pass: with no self-hosted face loaded there is
    // nothing to check.
    expect(families.length, 'no self-hosted font face loaded on the homepage').toBeGreaterThan(0)
    expect(synthesized, synthesized.join('\n')).toEqual([])
  })

  // Review baseline: 78.4px headline over a 48px deck = 1.63. The deck was
  // painted by a vendor descendant rule, not by the 2rem the stylesheet
  // declared. Checked at two widths because a desktop-only clamp would satisfy
  // a single-width assertion while the phone layout stayed flat.
  test('hero display-to-deck font-size ratio is at least 3.0', async ({ page }) => {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')

      const sizes = await page.evaluate(() => {
        const headline = document.querySelector('h1')
        if (!headline) return null

        // The deck is the first paragraph following the headline in document
        // order — derived from position, not from a class or data attribute,
        // so a markup rename does not quietly disable this gate.
        const deck = Array.from(document.querySelectorAll('p')).find(
          p => headline.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING
        )
        if (!deck) return null

        return {
          display: parseFloat(getComputedStyle(headline).fontSize),
          deck: parseFloat(getComputedStyle(deck).fontSize),
          align: getComputedStyle(headline).textAlign,
        }
      })

      expect(sizes, `no h1 + following paragraph at ${width}px`).not.toBeNull()

      const ratio = sizes!.display / sizes!.deck
      expect(
        ratio,
        `at ${width}px: ${sizes!.display}px display over ${sizes!.deck}px deck = ${ratio.toFixed(2)} (was 1.63)`
      ).toBeGreaterThanOrEqual(3.0)

      // The plan specifies a left-aligned hero headline, against the vendor
      // header pattern that centres it.
      expect(sizes!.align, `headline alignment at ${width}px`).toBe('left')
    }
  })

  // Review baseline: `--card-background` and `--header-background` were
  // declared in the alias layer and had ZERO var() consumers, so every painted
  // surface inherited @fpkit/acss defaults.
  test('--card-background and --header-background each have a consumer in the loaded CSS', async ({
    page,
  }) => {
    await page.goto('/')

    const audit = await page.evaluate(async () => {
      const chunks: string[] = []
      const pending: string[] = []

      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            chunks.push(rule.cssText)
          }
        } catch {
          // Cross-origin or otherwise unreadable: fall back to fetching it.
          if (sheet.href) pending.push(sheet.href)
        }
      }

      for (const href of pending) {
        try {
          chunks.push(await (await fetch(href)).text())
        } catch {
          /* unreachable stylesheet contributes nothing */
        }
      }

      const css = chunks.join('\n')
      const count = (token: string) =>
        (css.match(new RegExp(`var\\(\\s*${token}\\b`, 'g')) ?? []).length

      const root = getComputedStyle(document.documentElement)

      return {
        sheets: document.styleSheets.length,
        cssLength: css.length,
        cardConsumers: count('--card-background'),
        headerConsumers: count('--header-background'),
        cardValue: root.getPropertyValue('--card-background').trim(),
        headerValue: root.getPropertyValue('--header-background').trim(),
      }
    })

    // Guard against the vacuous pass where no CSS was readable at all.
    expect(audit.cssLength, 'no stylesheet text could be read').toBeGreaterThan(1000)

    // Both were 0.
    expect(
      audit.cardConsumers,
      `var(--card-background) consumers across ${audit.sheets} sheets`
    ).toBeGreaterThanOrEqual(1)
    expect(
      audit.headerConsumers,
      `var(--header-background) consumers across ${audit.sheets} sheets`
    ).toBeGreaterThanOrEqual(1)

    // A consumer of an undefined token paints nothing, so the aliases must
    // also resolve to a value.
    expect(audit.cardValue, '--card-background resolves to nothing').not.toBe('')
    expect(audit.headerValue, '--header-background resolves to nothing').not.toBe('')
  })

  // Review baseline: the loaded CSS held exactly one dark-scoped rule and it
  // redefined `:root` variables only, so ZERO painted surfaces responded and
  // body background was byte-identical in both themes.
  test('body and painted surfaces repaint between light and dark', async ({ page }) => {
    const readSurfaces = () =>
      page.evaluate(() => {
        const bg = (selector: string) => {
          const el = document.querySelector(selector)
          return el ? getComputedStyle(el).backgroundColor : null
        }
        return {
          body: getComputedStyle(document.body).backgroundColor,
          bodyText: getComputedStyle(document.body).color,
          ghost: bg('[data-demo-ghost]'),
        }
      })

    /** Relative luminance, used only to assert the dark theme is the darker one. */
    const luminance = (rgb: string) => {
      const [r, g, b] = (rgb.match(/[\d.]+/g) ?? ['0', '0', '0']).map(Number)
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    const light = await readSurfaces()

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    const dark = await readSurfaces()

    // The headline defect: these were identical. Light #fcfcfd, dark #0d1014.
    expect(dark.body, `body background did not change between themes (${light.body})`).not.toBe(
      light.body
    )
    expect(dark.bodyText, `body text colour did not change (${light.bodyText})`).not.toBe(
      light.bodyText
    )
    expect(luminance(dark.body), 'dark theme is not darker than light').toBeLessThan(
      luminance(light.body)
    )

    // Prove the probe matched before comparing it. `bg()` returns null for a
    // missing element, and two nulls compare equal, so a selector that stops
    // matching would fail here with a message that names it rather than as a
    // confusing "did not repaint".
    expect(light.ghost, '[data-demo-ghost] matched nothing; update the selector').not.toBeNull()
    expect(
      dark.ghost,
      '[data-demo-ghost] matched nothing in dark; update the selector'
    ).not.toBeNull()

    // A painted element -- not just a `:root` variable -- has to respond,
    // which is what the baseline failed to do. The ghost card behind the demo
    // film sits on `--paper-sunk`.
    expect(dark.ghost, `the demo ghost card did not repaint (${light.ghost})`).not.toBe(light.ghost)

    // The explicit toggle must beat the OS preference, otherwise a theme
    // switch cannot win over `prefers-color-scheme`.
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark')
    })
    const forcedDark = await readSurfaces()
    expect(
      forcedDark.body,
      'data-theme="dark" did not override prefers-color-scheme: light'
    ).not.toBe(light.body)
  })

  // The structural rule. Colour marks hydration, so the accent may only paint
  // something a visitor can operate; anything else carrying it means the rule
  // has decayed into decoration.
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`no non-interactive element paints the accent (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme })
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto('/')

      const result = await page.evaluate(
        ([interactive, brandAccent]) => {
          const accentToken = getComputedStyle(document.documentElement)
            .getPropertyValue('--island')
            .trim()
          if (!accentToken) return { accent: '', offenders: [] as string[] }

          // Resolve the author-level token, whatever notation it is written in
          // (hex, `oklch()`, a named colour), to the `rgb(...)` form
          // getComputedStyle returns, using the browser's own colour parser so
          // the comparison cannot drift from how the page actually paints.
          const probe = document.createElement('span')
          probe.style.display = 'none'
          probe.style.color = accentToken
          document.body.appendChild(probe)
          const accent = getComputedStyle(probe).color
          probe.remove()

          const offenders: string[] = []

          for (const el of Array.from(document.body.querySelectorAll('*'))) {
            // The element itself is operable, or it sits inside something that
            // is and merely inherits the accent.
            if (el.closest(interactive)) continue

            // The scoped brand exception, checked separately below.
            if (el.closest(brandAccent)) continue

            const style = getComputedStyle(el)
            const hits: string[] = []

            if (style.color === accent) hits.push('color')
            if (style.backgroundColor === accent) hits.push('background-color')

            for (const side of ['top', 'right', 'bottom', 'left'] as const) {
              // Only a border that actually paints counts: an unset border still
              // reports a colour.
              const width = parseFloat(style.getPropertyValue(`border-${side}-width`))
              const borderStyle = style.getPropertyValue(`border-${side}-style`)
              const color = style.getPropertyValue(`border-${side}-color`)
              if (width > 0 && borderStyle !== 'none' && color === accent) {
                hits.push(`border-${side}-color`)
              }
            }

            if (
              parseFloat(style.outlineWidth) > 0 &&
              style.outlineStyle !== 'none' &&
              style.outlineColor === accent
            ) {
              hits.push('outline-color')
            }

            if (hits.length > 0) {
              const classes =
                typeof el.className === 'string' && el.className.trim()
                  ? `.${el.className.trim().split(/\s+/).join('.')}`
                  : ''
              const id = `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${classes}`
              offenders.push(`${id} [${hits.join(', ')}]`)
            }
          }

          return { accent, offenders }
        },
        [INTERACTIVE, BRAND_ACCENT] as const
      )

      // If the accent token vanished the audit would pass trivially.
      expect(result.accent, '--island did not resolve to a colour').not.toBe('')

      expect(
        result.offenders,
        `accent ${result.accent} painted on non-interactive elements:\n  ${result.offenders.join('\n  ')}`
      ).toEqual([])
    })
  }

  // The exception above is only safe while it stays this narrow: the
  // headline's accent phrase and the timing demo, nothing else.
  test('the brand accent exception covers exactly the headline accent and the demo', async ({
    page,
  }) => {
    await page.goto('/')

    const marked = await page.locator(BRAND_ACCENT).evaluateAll(nodes =>
      nodes.map(node => ({
        inHeadline: node.closest('h1') !== null,
        isDemo: node.id === 'demo',
      }))
    )

    expect(marked, `${BRAND_ACCENT} should mark exactly two elements`).toHaveLength(2)
    expect(
      marked.filter(m => m.inHeadline),
      'one marker inside the h1'
    ).toHaveLength(1)
    expect(
      marked.filter(m => m.isDemo),
      'one marker on the #demo root'
    ).toHaveLength(1)
  })

  // Commit 254278a fixed a 320px reflow regression; step 4 repaints global
  // surfaces, so the gate is restated here at every width the plan names.
  test('no horizontal overflow at 320, 390, 768 and 1280', async ({ page }) => {
    const measured: Record<number, number> = {}

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')

      // Reflow is a text-metric question, so it has to be measured against the
      // loaded display face rather than the fallback that `load` fires with.
      await page.evaluate(() => document.fonts.ready)

      measured[width] = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      )
    }

    for (const width of WIDTHS) {
      expect(measured[width], `horizontal overflow at ${width}px`).toBe(0)
    }
  })

  /**
   * The hero's calls to action must land somewhere real.
   *
   * The Astro Kit hero once pointed "Browse components" at `/docs`, which
   * answered 500 while every other check here passed. The OnCue hero links
   * only to fragments on this page and to the OnCue repository, so the
   * contract is: each fragment resolves to an element, and everything else is
   * an OnCue repo URL. A link to anywhere else is a regression to investigate,
   * not a destination to fetch.
   */
  test('every hero link is a resolving fragment or an OnCue repo URL', async ({ page }) => {
    await page.goto('/')

    const links = await page.locator('[data-home-hero] a[href]').evaluateAll(nodes =>
      nodes.map(node => {
        const href = node.getAttribute('href') ?? ''
        return {
          href,
          resolves: href.startsWith('#') && document.getElementById(href.slice(1)) !== null,
        }
      })
    )

    expect(links.length, 'hero should link somewhere').toBeGreaterThan(0)

    for (const { href, resolves } of links) {
      const ok = resolves || /^https:\/\/github\.com\/shawn-sandy\/oncue([#/].*)?$/.test(href)
      expect(ok, `${href} is neither a resolving fragment nor an OnCue repo URL`).toBe(true)
    }
  })
})
