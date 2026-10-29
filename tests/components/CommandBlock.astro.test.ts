// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import CommandBlock from '#components/astro/CommandBlock.astro'

const COMMANDS = ['/plugin marketplace add shawn-sandy/oncue', '/plugin install oncue@oncue']

const render = async (commands: string[] = COMMANDS): Promise<string> => {
  const container = await AstroContainer.create()
  return container.renderToString(CommandBlock, { props: { commands } })
}

const buttons = (html: string): string[] => html.match(/<button\b[^>]*>/g) ?? []

describe('CommandBlock.astro', () => {
  it('renders each command in its own code element, in order', async () => {
    const html = await render()
    const codes = [...html.matchAll(/<code\b[^>]*>([\s\S]*?)<\/code>/g)].map(m => m[1])

    expect(codes).toEqual(COMMANDS)
  })

  it('gives every command its own copy button carrying that command', async () => {
    const html = await render()

    expect(buttons(html).map(b => /\sdata-copy="([^"]*)"/.exec(b)?.[1])).toEqual(COMMANDS)
  })

  it('names each copy button after its command', async () => {
    const html = await render()

    expect(buttons(html).map(b => /\saria-label="([^"]*)"/.exec(b)?.[1])).toEqual(
      COMMANDS.map(c => `Copy ${c}`)
    )
  })

  it('escapes command text', async () => {
    const html = await render(['echo <b>&</b>'])
    const code = /<code\b[^>]*>([\s\S]*?)<\/code>/.exec(html)?.[1]

    expect(code).toBe('echo &lt;b&gt;&amp;&lt;/b&gt;')
  })

  it('escapes quotes and ampersands in the button attributes', async () => {
    const [button] = buttons(await render(['say "hi" & bye']))

    expect(/\sdata-copy="([^"]*)"/.exec(button ?? '')?.[1]).toBe('say &quot;hi&quot; &amp; bye')
    expect(/\saria-label="([^"]*)"/.exec(button ?? '')?.[1]).toBe(
      'Copy say &quot;hi&quot; &amp; bye'
    )
  })

  it('ships the copy buttons hidden, so the no-JS page has no dead control', async () => {
    const all = buttons(await render())

    expect(all).toHaveLength(COMMANDS.length)
    for (const button of all) {
      expect(button).toMatch(/\stype="button"/)
      expect(button).toMatch(/\shidden(?=[\s>=])/)
    }
  })

  it('has a status region for the copy result', async () => {
    expect(await render()).toMatch(/\srole="status"/)
  })
})
