// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import ExternalLink from '#components/astro/ExternalLink.astro'

/** Renders the link with `label` in its default slot. */
const render = async (props: Record<string, unknown>, label = 'GitHub'): Promise<string> => {
  const container = await AstroContainer.create()
  return container.renderToString(ExternalLink, { props, slots: { default: label } })
}

describe('ExternalLink.astro', () => {
  it('links to href with the slot as its label', async () => {
    const html = await render({ href: 'https://github.com/shawn-sandy/oncue' })
    const anchor = /<a\b[^>]*>([\s\S]*?)<\/a>/.exec(html)

    expect(anchor?.[0]).toContain('href="https://github.com/shawn-sandy/oncue"')
    expect(
      anchor?.[1].replace(/<span\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/, '').trim()
    ).toBe('GitHub')
  })

  it('hides the arrow glyph from screen readers', async () => {
    // Review fix 7: the reference read "north east arrow" after every label.
    const html = await render({ href: 'https://example.com' })
    const hidden = /<span\b[^>]*aria-hidden="true"[^>]*>([\s\S]*?)<\/span>/.exec(html)

    expect(hidden?.[1]).toBe('↗')
  })

  it('opens in the same tab', async () => {
    const html = await render({ href: 'https://example.com' })

    expect(html).not.toMatch(/\starget=/)
  })

  it('passes a class through to the anchor', async () => {
    const html = await render({ href: 'https://example.com', class: 'closing-link' })

    expect(/<a\b[^>]*>/.exec(html)?.[0]).toMatch(/class="[^"]*\bclosing-link\b/)
  })
})
