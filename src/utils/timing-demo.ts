/**
 * Timeline of the homepage timing demo (`TimingDemo.astro`).
 *
 * The reference design kept this math inside its `requestAnimationFrame`
 * loop. As a pure function of the playhead it can be unit-tested without a
 * DOM, and the component script only paints the frames it returns.
 */

/** Length of the demo, in milliseconds. The readout ends on `00:08`. */
export const DEMO_DURATION_MS = 8000

/** Silence before the first caption word lands. */
export const LEAD_MS = 600

/** How long each caption word stays current. */
export const WORD_MS = 1050

/** What the demo shows at one playhead position. */
export type DemoFrame = {
  /** Index of the caption word being said, or -1 for none (lead-in and the finished frame). */
  wordIndex: number
  /** How many step cards are revealed, counted from the first. */
  revealedSteps: number
  /** Elapsed time as zero-padded `mm:ss`. */
  elapsedLabel: string
  /** Playhead as a fraction of the duration, from 0 to 1. */
  progress: number
  /** True once the playhead reaches the end. */
  ended: boolean
}

/** Zero-padded `mm:ss` for a whole number of seconds. */
const formatSeconds = (seconds: number): string =>
  [Math.floor(seconds / 60), seconds % 60].map(part => String(part).padStart(2, '0')).join(':')

/**
 * The frame at `positionMs`.
 *
 * Words and steps alternate, as in the design: step `i` appears on word
 * `i * 2 + 1`, so six words reveal three steps. The finished frame shows every
 * step and no current word, which is also what the component renders on the
 * server, so the ended demo and the no-JS view are the same picture.
 *
 * @param positionMs - Playhead in milliseconds. Negative and non-finite values count as 0;
 *   values past the end clamp to it.
 * @param wordCount - Number of caption words.
 */
export function frameAt(positionMs: number, wordCount = 6): DemoFrame {
  const position = Number.isFinite(positionMs)
    ? Math.min(Math.max(positionMs, 0), DEMO_DURATION_MS)
    : 0
  const ended = position >= DEMO_DURATION_MS
  const stepCount = Math.floor(wordCount / 2)

  const wordIndex =
    ended || position < LEAD_MS
      ? -1
      : Math.min(wordCount - 1, Math.floor((position - LEAD_MS) / WORD_MS))

  return {
    wordIndex,
    revealedSteps: ended ? stepCount : Math.floor((wordIndex + 1) / 2),
    elapsedLabel: formatSeconds(Math.floor(position / 1000)),
    progress: position / DEMO_DURATION_MS,
    ended,
  }
}
