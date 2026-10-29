// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import WorkflowStrip from '#components/astro/WorkflowStrip.astro'

const PROPS = {
  eyebrow: 'One idea. One connected workflow.',
  title: 'From your first beat to the final frame.',
  phases: ['Storyboard', 'Voiceover', 'Editable deck', 'Finished video'],
}

const render = async (): Promise<string> => {
  const container = await AstroContainer.create()
  return container.renderToString(WorkflowStrip, { props: PROPS })
}

describe('WorkflowStrip.astro', () => {
  it('renders one li per phase inside an ordered list', async () => {
    const list = /<ol\b[^>]*>([\s\S]*?)<\/ol>/.exec(await render())?.[1] ?? ''
    const items = [...list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(m => m[1].trim())

    expect(items).toEqual(PROPS.phases)
  })

  it('keeps arrow glyphs out of the text, where a screen reader would read them', async () => {
    const text = (await render()).replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]*>/g, '')

    expect(text).not.toMatch(/[→↗➜⟶]/)
  })

  it('renders the eyebrow and the title', async () => {
    const html = await render()

    expect(html).toContain(PROPS.eyebrow)
    expect(html).toContain(PROPS.title)
  })
})
