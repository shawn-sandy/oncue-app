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
