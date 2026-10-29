// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import FeatureWordSync from '#components/astro/FeatureWordSync.astro'

const render = async (): Promise<string> => {
  const container = await AstroContainer.create()
  return container.renderToString(FeatureWordSync)
}

/** Text of each `tr` in the table body, one array of cell texts per row. */
const bodyRows = (html: string): string[][] => {
  const body = /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/.exec(html)?.[1] ?? ''
  return [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(row =>
    [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g)].map(cell =>
      cell[1].replace(/<[^>]*>/g, '').trim()
    )
  )
}

describe('FeatureWordSync.astro', () => {
  // The Gleaner example's real timings, on an 8.0 s to 12.0 s ruler.
  it('places each word on the timeline at its start time', async () => {
    const html = await render()
    const leftOf = (word: string) =>
      new RegExp(`<span\\b[^>]*style="left:\\s*([\\d.]+)%[^"]*"[^>]*>${word}</span>`).exec(
        html
      )?.[1]

    expect(leftOf('Tabs')).toBe('5')
    expect(leftOf('bookmarks')).toBe('34.5')
    expect(leftOf('notes')).toBe('86.5')
  })

  it('hides the drawn timeline from screen readers, which get the table instead', async () => {
    expect(await render()).toMatch(/<div\b[^>]*\saria-hidden="true"[^>]*\sdata-word-ribbon/)
  })

  it('lists every cue word with when it is heard and what it brings in', async () => {
    expect(bodyRows(await render())).toEqual([
      ['tabs', '8.20 s', 'Too many tabs'],
      ['bookmarks', '9.38 s', 'Dead bookmarks'],
      ['notes', '11.46 s', 'Messy notes'],
    ])
  })
})
