// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import FeatureBlog from '#components/astro/FeatureBlog.astro'

const POSTS = [
  { title: 'First post', date: '2026-11-02', excerpt: 'First excerpt.', href: '/posts/first/' },
  { title: 'Second post', date: '2026-10-14', excerpt: 'Second excerpt.', href: '/posts/second/' },
]

const render = async (props: Record<string, unknown> = {}): Promise<string> => {
  const container = await AstroContainer.create()
  return container.renderToString(FeatureBlog, { props })
}

const state = (html: string) => /\sdata-blog-state="([^"]+)"/.exec(html)?.[1]
const links = (html: string) => [...html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)].map(m => m[1])

describe('FeatureBlog.astro', () => {
  it('lists each post with its title link, date and excerpt, in order', async () => {
    const html = await render({ load: async () => POSTS })

    expect(state(html)).toBe('ready')
    expect(links(html)).toEqual(['/posts/first/', '/posts/second/'])
    expect(html).toMatch(/<time\b[^>]*\sdatetime="2026-11-02"[^>]*>\s*2 November 2026\s*<\/time>/)
    expect(html).toContain('Second excerpt.')
    expect(html.indexOf('First post')).toBeLessThan(html.indexOf('Second post'))
  })

  // Midnight UTC is still the previous day west of Greenwich; the date must not shift.
  it('formats the date in UTC, not the server timezone', async () => {
    const html = await render({ load: async () => [{ ...POSTS[0], date: '2026-01-01' }] })

    expect(html).toMatch(/>\s*1 January 2026\s*</)
  })

  it('renders the placeholder posts when no loader is passed', async () => {
    const html = await render()

    expect(state(html)).toBe('ready')
    expect(links(html).length).toBeGreaterThan(0)
  })

  it('shows the empty state, with no post links, when there are no posts', async () => {
    const html = await render({ load: async () => [] })

    expect(state(html)).toBe('empty')
    expect(links(html)).toEqual([])
    expect(html).not.toMatch(/<ul\b/)
  })

  it('shows the error state, with no post links, when loading throws', async () => {
    const html = await render({
      load: async () => {
        throw new Error('network down')
      },
    })

    expect(state(html)).toBe('error')
    expect(links(html)).toEqual([])
    // The cause stays in the server log, not on the page.
    expect(html).not.toContain('network down')
  })
})
