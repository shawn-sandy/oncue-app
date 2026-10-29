// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import FeatureSection from '#components/astro/FeatureSection.astro'

const PROPS = { id: 'sample-title', eyebrow: 'Sample eyebrow', title: 'Sample title' }

const render = async (): Promise<string> => {
  const container = await AstroContainer.create()
  return container.renderToString(FeatureSection, {
    props: PROPS,
    slots: { deck: 'Sample deck', default: '<p>Sample body</p>' },
  })
}

describe('FeatureSection.astro', () => {
  it('labels the section with its h2', async () => {
    const html = await render()
    const labelledBy = /<section\b[^>]*\saria-labelledby="([^"]+)"/.exec(html)?.[1]
    const headingId = /<h2\b[^>]*\sid="([^"]+)"/.exec(html)?.[1]

    expect(labelledBy).toBe(PROPS.id)
    expect(headingId).toBe(PROPS.id)
  })

  it('sets the eyebrow in the mono label role', async () => {
    expect(await render()).toMatch(/<p\b[^>]*\sdata-ui="eyebrow"[^>]*>\s*Sample eyebrow\s*<\/p>/)
  })

  it('renders the deck under the title and the body after it', async () => {
    const html = await render()

    expect(html.indexOf('Sample deck')).toBeGreaterThan(html.indexOf(PROPS.title))
    expect(html.indexOf('Sample body')).toBeGreaterThan(html.indexOf('Sample deck'))
  })
})
