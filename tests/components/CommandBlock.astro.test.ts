// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import CommandBlock from '#components/astro/CommandBlock.astro'

const COMMANDS = ['/plugin marketplace add shawn-sandy/oncue', '/plugin install oncue@oncue']

const render = async (commands: string[] = COMMANDS): Promise<string> => {
  const container = await AstroContainer.create()
  return container.renderToString(CommandBlock, { props: { commands } })
}

describe('CommandBlock.astro', () => {
  it('renders every command, one per line, in a pre > code', async () => {
    const html = await render()
    const code =
      /<pre\b[^>]*\sdata-command-block(?=[\s>=])[^>]*>\s*<code\b[^>]*>([\s\S]*?)<\/code>/.exec(html)

    expect(code?.[1]).toBe(COMMANDS.join('\n'))
  })

  it('escapes command text', async () => {
    const html = await render(['echo <b>&</b>'])

    expect(html).toContain('echo &lt;b&gt;&amp;&lt;/b&gt;')
    expect(html).not.toContain('<b>')
  })

  it('ships the copy button hidden, so the no-JS page has no dead control', async () => {
    const button = /<button\b[^>]*>/.exec(await render())?.[0] ?? ''

    expect(button).toMatch(/\stype="button"/)
    expect(button).toMatch(/\shidden(?=[\s>=])/)
  })

  it('has a status region for the copy result', async () => {
    expect(await render()).toMatch(/\srole="status"/)
  })
})
