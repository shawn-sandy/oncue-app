import { createRequire } from 'node:module'
import { test, expect } from '@playwright/test'

/**
 * The homepage feature sections (FeatureSection and the eight sections built
 * on it). Colour, reflow, font weights and token contrast are already gated
 * page-wide by homepage-design-direction.spec.ts and home-accessibility.spec.ts;
 * this file covers what those do not: that each section is a landmark named by
 * its own heading, and that the sections pass axe at a desktop and a phone
 * width in both themes. The phone width matters because that is where the
 * wide table and the code samples become scroll regions.
 *
 * axe is injected from `node_modules/axe-core` as in navigation-popover.spec.ts:
 * a transitive install, resolved with `require.resolve` so a missing install
 * fails loudly instead of skipping the scan.
 */
const require = createRequire(import.meta.url)

const SECTION = '[data-feature-section]'

/** One per feature component on the page. */
const SECTION_COUNT = 8

type AxeResults = {
  violations: { id: string; impact: string | null; help: string; nodes: { target: string[] }[] }[]
  passes: { id: string }[]
}

test.describe('Homepage feature sections', () => {
  test('every section is labelled by its own h2', async ({ page }) => {
    await page.goto('/')

    const sections = await page.locator(SECTION).evaluateAll(nodes =>
      nodes.map(node => {
        const id = node.getAttribute('aria-labelledby') ?? ''
        const heading = id ? document.getElementById(id) : null
        return {
          id,
          isOwnH2: heading?.tagName === 'H2' && node.contains(heading),
          name: heading?.textContent?.trim() ?? '',
        }
      })
    )

    expect(sections).toHaveLength(SECTION_COUNT)
    for (const section of sections) {
      expect(section.isOwnH2, `${section.id} does not name an h2 inside its section`).toBe(true)
      expect(section.name, `${section.id} names an empty heading`).not.toBe('')
    }
    expect(new Set(sections.map(s => s.id)).size, 'section ids repeat').toBe(SECTION_COUNT)
  })

  // Astro scopes every part of a component's selector to that component, so a
  // section rule that reaches up through `.feature-section` (rendered by
  // FeatureSection, not by the section) matches nothing, and a one-class
  // override can tie with the shared rule it means to replace. Each reading
  // below is a property one such rule exists to set.
  test('each section’s own styles reach its elements', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)

    const measured = await page.evaluate(() => {
      const style = (selector: string) => {
        const el = document.querySelector(selector)
        return el ? getComputedStyle(el) : null
      }
      const firstCell = document.querySelector('.requirements__table tbody th')
      const inset = document.querySelector('.frame-sizes__inset')
      const card = inset?.closest('.feature-card')

      return {
        skillFont: style('.skills__name')?.fontFamily ?? '',
        requirementsInset: firstCell ? parseFloat(getComputedStyle(firstCell).paddingLeft) : -1,
        sharpRadius: style('.brand__frame--sharp')?.borderTopLeftRadius ?? '',
        roundRadius: style('.brand__frame--round')?.borderTopLeftRadius ?? '',
        insetOffset:
          inset && card
            ? Math.abs(inset.getBoundingClientRect().left - card.getBoundingClientRect().left)
            : -1,
        footMargins: Array.from(document.querySelectorAll('.facts__foot')).map(
          el => getComputedStyle(el).marginTop
        ),
      }
    })

    expect(measured.skillFont, 'skill names are not set in DM Mono').toMatch(/^"?DM Mono/)
    expect(
      measured.requirementsInset,
      'requirements text sits on the table border'
    ).toBeGreaterThanOrEqual(16)
    expect(measured.sharpRadius, 'no sharp theme frame').not.toBe('')
    expect(measured.sharpRadius, 'the two theme frames share one corner radius').not.toBe(
      measured.roundRadius
    )
    // Within the card's 1px border: the sample runs edge to edge.
    expect(
      measured.insetOffset,
      'the format sample does not run edge to edge'
    ).toBeGreaterThanOrEqual(0)
    expect(measured.insetOffset, 'the format sample does not run edge to edge').toBeLessThanOrEqual(
      1
    )
    expect(measured.footMargins, 'expected two facts card footers').toHaveLength(2)
    expect(new Set(measured.footMargins).size, `footers sit apart: ${measured.footMargins}`).toBe(1)
  })

  for (const colorScheme of ['light', 'dark'] as const) {
    for (const width of [1280, 375]) {
      test(`zero axe WCAG 2.2 AA violations at ${width}px (${colorScheme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme })
        await page.setViewportSize({ width, height: 900 })
        await page.goto('/')
        await page.evaluate(() => document.fonts.ready)
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })

        const results: AxeResults = await page.evaluate(
          async selector =>
            (
              window as unknown as {
                axe: { run: (context: unknown, options: unknown) => Promise<AxeResults> }
              }
            ).axe.run(
              { include: Array.from(document.querySelectorAll(selector)) },
              {
                runOnly: {
                  type: 'tag',
                  values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
                },
              }
            ),
          SECTION
        )

        // An empty violations list means nothing if axe matched no node.
        expect(results.passes.length, 'axe scanned nothing in the sections').toBeGreaterThan(0)

        const summary = results.violations.map(
          v =>
            `${v.id} (${v.impact ?? 'n/a'}): ${v.help} -> ${v.nodes.map(n => n.target.join(' ')).join(', ')}`
        )
        expect(summary, `axe violations in the feature sections`).toEqual([])
      })
    }
  }
})
