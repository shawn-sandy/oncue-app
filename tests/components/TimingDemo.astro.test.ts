// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import TimingDemo from '#components/astro/TimingDemo.astro'

const render = async (): Promise<string> => {
  const container = await AstroContainer.create()
  return container.renderToString(TimingDemo)
}

/** Every opening tag carrying the attribute `name`. */
const tagsWith = (html: string, name: string) =>
  html.match(new RegExp(`<[a-z]+\\b[^>]*\\s${name}(?=[\\s>=])[^>]*>`, 'g')) ?? []

describe('TimingDemo.astro', () => {
  it('marks its root as the #demo target and the brand accent scope', async () => {
    const root = tagsWith(await render(), 'data-timing-demo')

    expect(root).toHaveLength(1)
    expect(root[0]).toMatch(/\sid="demo"/)
    expect(root[0]).toMatch(/\sdata-accent="brand"/)
  })

  it('ships the transport hidden, labelled for Play', async () => {
    const html = await render()

    expect(tagsWith(html, 'data-demo-transport')[0]).toMatch(/\shidden(?=[\s>=])/)
    expect(tagsWith(html, 'data-demo-play')[0]).toMatch(/\saria-label="Play timing demo"/)
  })

  it('reads 00:00 of 00:08 before it plays', async () => {
    const html = await render()

    expect(/<[a-z]+\b[^>]*\sdata-demo-elapsed[^>]*>([^<]*)</.exec(html)?.[1]).toBe('00:00')
    expect(html).toContain('00:08')
  })

  it('hides the annotations and ghost cards from assistive tech', async () => {
    const html = await render()
    const decorative = [
      ...tagsWith(html, 'data-demo-annotation'),
      ...tagsWith(html, 'data-demo-ghost'),
    ]

    expect(tagsWith(html, 'data-demo-annotation')).toHaveLength(2)
    expect(tagsWith(html, 'data-demo-ghost')).toHaveLength(1)
    expect(decorative.every(tag => tag.includes('aria-hidden="true"'))).toBe(true)
  })

  it('holds the film card', async () => {
    expect(tagsWith(await render(), 'data-film')).toHaveLength(1)
  })
})
