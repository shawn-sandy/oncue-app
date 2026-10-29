// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import FilmCard from '#components/astro/FilmCard.astro'

const render = async (): Promise<string> => {
  const container = await AstroContainer.create()
  return container.renderToString(FilmCard)
}

/** Every opening tag carrying the attribute `name`. */
const tagsWith = (html: string, name: string) =>
  html.match(new RegExp(`<[a-z]+\\b[^>]*\\s${name}(?=[\\s>=])[^>]*>`, 'g')) ?? []

describe('FilmCard.astro', () => {
  it('is one image with one label', async () => {
    const html = await render()
    const root = tagsWith(html, 'data-film')

    expect(root).toHaveLength(1)
    expect(root[0]).toMatch(/\srole="img"/)
    expect(html.match(/\saria-label="[^"]+"/g)).toHaveLength(1)
  })

  it('renders the finished frame: three revealed steps and six said words', async () => {
    // This markup is the no-JS and reduced-motion view, so it has to be the
    // finished frame rather than the reference's 00:06 snapshot.
    const html = await render()
    const steps = tagsWith(html, 'data-step')
    const words = tagsWith(html, 'data-word')

    expect(steps).toHaveLength(3)
    expect(steps.every(tag => tag.includes('data-state="revealed"'))).toBe(true)
    expect(words).toHaveLength(6)
    expect(words.every(tag => tag.includes('data-state="said"'))).toBe(true)
    expect(html).not.toContain('data-state="current"')
  })

  it('names both video shapes in the footer', async () => {
    expect(await render()).toContain('9:16 · 16:9')
  })
})
