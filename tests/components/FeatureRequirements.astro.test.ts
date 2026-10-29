// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import FeatureRequirements from '#components/astro/FeatureRequirements.astro'

const COMMANDS = ['/plugin marketplace add shawn-sandy/oncue', '/plugin install oncue@oncue']

const render = async (): Promise<string> => {
  const container = await AstroContainer.create()
  return container.renderToString(FeatureRequirements, {
    props: {
      commands: COMMANDS,
      requirementsHref: 'https://github.com/shawn-sandy/oncue#requirements',
    },
  })
}

const table = async () => /<table\b[\s\S]*?<\/table>/.exec(await render())?.[0] ?? ''

describe('FeatureRequirements.astro', () => {
  it('gives every output row one cell per tool column', async () => {
    const html = await table()
    const tools = (/<thead\b[\s\S]*?<\/thead>/.exec(html)?.[0].match(/<th\b/g) ?? []).length - 1
    const body = /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/.exec(html)?.[1] ?? ''
    const rows = [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(r => r[1])

    expect(tools).toBeGreaterThan(0)
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) expect(row.match(/<td\b/g)).toHaveLength(tools)
  })

  // A dot or a dash alone says nothing to a screen reader.
  it('says in text whether each tool is needed, not only with a glyph', async () => {
    const cells = [...(await table()).matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(c =>
      c[1]
        .replace(/<span\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/g, '')
        .replace(/<[^>]*>/g, '')
        .trim()
    )

    expect(cells.length).toBeGreaterThan(0)
    for (const text of cells) expect(text).not.toBe('')
  })

  it('makes the wide table a keyboard-reachable scroll region', async () => {
    const wrapper = /<div\b[^>]*>\s*<table\b/.exec(await render())?.[0] ?? ''

    expect(wrapper).toMatch(/\stabindex="0"/)
    expect(wrapper).toMatch(/\srole="region"/)
    expect(wrapper).toMatch(/\saria-label="[^"]+"/)
  })

  it('renders the install commands with the shared command block', async () => {
    const code = /<pre\b[^>]*\sdata-command-block[^>]*>\s*<code\b[^>]*>([\s\S]*?)<\/code>/.exec(
      await render()
    )

    expect(code?.[1]).toBe(COMMANDS.join('\n'))
  })
})
