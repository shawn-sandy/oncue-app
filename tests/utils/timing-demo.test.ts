import { describe, expect, it } from 'vitest'
import { DEMO_DURATION_MS, frameAt } from '#utils/timing-demo'

/**
 * `frameAt` is the whole timeline of the homepage timing demo: the component
 * script only paints what it returns. The cases sit on the boundaries where
 * the design's DOM loop changed state -- the 600ms lead-in, each 1050ms word,
 * and the 8s end -- plus the inputs a paused or throttled tab can produce.
 */
describe('frameAt', () => {
  it('shows no word and no step before the lead-in ends', () => {
    expect(frameAt(0)).toEqual({
      wordIndex: -1,
      revealedSteps: 0,
      elapsedLabel: '00:00',
      progress: 0,
      ended: false,
    })
    expect(frameAt(599)).toMatchObject({ wordIndex: -1, revealedSteps: 0 })
  })

  it('lands the first word at 600ms without revealing a step', () => {
    expect(frameAt(600)).toMatchObject({ wordIndex: 0, revealedSteps: 0 })
  })

  it('holds each word for 1050ms and reveals step i at word i*2+1', () => {
    expect(frameAt(1649)).toMatchObject({ wordIndex: 0, revealedSteps: 0, elapsedLabel: '00:01' })
    expect(frameAt(1650)).toMatchObject({ wordIndex: 1, revealedSteps: 1 })
    expect(frameAt(600 + 3 * 1050)).toMatchObject({ wordIndex: 3, revealedSteps: 2 })
  })

  it('stays on the last word until the timeline ends', () => {
    const frame = frameAt(7999)

    expect(frame).toMatchObject({ wordIndex: 5, revealedSteps: 3, elapsedLabel: '00:07' })
    expect(frame.ended).toBe(false)
    expect(frame.progress).toBeCloseTo(7999 / DEMO_DURATION_MS)
  })

  it('ends on the finished frame: every step, no current word, full progress', () => {
    expect(frameAt(8000)).toEqual({
      wordIndex: -1,
      revealedSteps: 3,
      elapsedLabel: '00:08',
      progress: 1,
      ended: true,
    })
  })

  it('clamps a position past the end to the finished frame', () => {
    expect(frameAt(12000)).toEqual(frameAt(DEMO_DURATION_MS))
  })

  it('treats negative and non-finite positions as the start', () => {
    for (const position of [-5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(frameAt(position), String(position)).toEqual(frameAt(0))
    }
  })

  it('scales the steps to the word count', () => {
    expect(frameAt(DEMO_DURATION_MS, 4).revealedSteps).toBe(2)
    expect(frameAt(7999, 4).wordIndex).toBe(3)
  })
})
