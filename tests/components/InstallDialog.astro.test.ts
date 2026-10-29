// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import InstallDialog from '#components/astro/InstallDialog.astro'

const PROPS = {
  id: 'install',
  commands: ['/plugin marketplace add shawn-sandy/oncue', '/plugin install oncue@oncue'],
  fallbackHref: 'https://github.com/shawn-sandy/oncue#install',
}

const render = async (): Promise<string> => {
  const container = await AstroContainer.create()
  return container.renderToString(InstallDialog, { props: PROPS })
}

/** Read an attribute value out of a raw opening tag. */
const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1]

describe('InstallDialog.astro', () => {
  it('is a dialog labelled by its h2', async () => {
    const html = await render()
    const dialog = /<dialog\b[^>]*>/.exec(html)?.[0] ?? ''
    const heading = /<h2\b[^>]*>/.exec(html)?.[0] ?? ''

    expect(attr(dialog, 'id')).toBe('install')
    expect(attr(heading, 'id')).toBeTruthy()
    expect(attr(dialog, 'aria-labelledby')).toBe(attr(heading, 'id'))
  })

  it('adds light dismiss where the browser supports it', async () => {
    expect(/<dialog\b[^>]*>/.exec(await render())?.[0]).toMatch(/\sclosedby="any"/)
  })

  it('closes from a named button inside a method=dialog form', async () => {
    const form = /<form\b[^>]*>([\s\S]*?)<\/form>/.exec(await render())

    expect(form?.[0]).toMatch(/^<form\b[^>]*\smethod="dialog"/)
    expect(attr(/<button\b[^>]*>/.exec(form?.[1] ?? '')?.[0] ?? '', 'aria-label')).toBeTruthy()
  })

  it('nests the command block with both commands', async () => {
    const html = await render()

    expect(html).toMatch(/\sdata-command-block[\s>=]/)
    for (const command of PROPS.commands) expect(html).toContain(command)
  })

  it('links to the setup guide it stands in for', async () => {
    expect(await render()).toContain(`href="${PROPS.fallbackHref}"`)
  })
})
