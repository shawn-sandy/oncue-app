import { test, expect, type Page } from '@playwright/test'

/**
 * Objective-verification spec for docs/plans/build-oncue-homepage.md.
 *
 * The objective is that `/` became the OnCue plugin page and that its three
 * behaviours -- the install dialog, the copy button and the timing demo --
 * work as progressive enhancements: plain links and text before any script
 * runs, upgraded by script afterwards. Every test measures the running page,
 * and the edge cases are the findings of the "Oncue Studio Hero review"
 * session, so each one fails if the page regresses to the reference design.
 */

const COMMANDS = ['/plugin marketplace add shawn-sandy/oncue', '/plugin install oncue@oncue']
const README = 'https://github.com/shawn-sandy/oncue'

const installLink = (page: Page) => page.locator('a[data-opens-dialog="install"]')
const dialog = (page: Page) => page.locator('dialog#install')
const playButton = (page: Page) => page.locator('[data-demo-play]')
const elapsed = (page: Page) => page.locator('[data-demo-elapsed]')

/** Opens the install dialog the way a keyboard user does. */
async function openDialog(page: Page): Promise<void> {
  await expect(installLink(page), 'no install call to action on the page').toHaveCount(1)
  await installLink(page).focus()
  await page.keyboard.press('Enter')
  await expect.poll(() => dialog(page).evaluate(d => d.matches(':modal'))).toBe(true)
}

test.describe('OnCue homepage', () => {
  test('the h1 names what OnCue does', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1').first()).toHaveText('Every word. Right on cue.')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('main')).not.toContainText('Astro Kit')
  })

  test('the copy covers both video shapes', async ({ page }) => {
    await page.goto('/')

    // Review fix 1: the reference copy only mentioned vertical Shorts.
    await expect(page.locator('[data-home-hero-deck]')).toContainText(/widescreen/i)
    await expect(page.locator('[data-film]')).toContainText('9:16 · 16:9')
  })

  test('the install link opens a modal dialog and Escape hands focus back', async ({ page }) => {
    await page.goto('/')
    await openDialog(page)

    for (const command of COMMANDS) await expect(dialog(page)).toContainText(command)
    expect(
      await dialog(page).evaluate(d => d.contains(document.activeElement)),
      'focus did not move into the dialog'
    ).toBe(true)

    await page.keyboard.press('Escape')
    await expect(dialog(page)).not.toHaveAttribute('open')
    await expect(installLink(page)).toBeFocused()
  })

  test('Play runs the demo from 00:00 and offers Pause', async ({ page }) => {
    await page.goto('/')

    await expect(playButton(page), 'no play button').toHaveCount(1)
    await expect(elapsed(page)).toHaveText('00:00')
    await playButton(page).click()

    await expect(elapsed(page)).not.toHaveText('00:00', { timeout: 2000 })
    await expect(playButton(page)).toHaveAttribute('aria-label', 'Pause timing demo')
  })

  test('the workflow is a four-step ordered list', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('[data-workflow-strip] ol > li')).toHaveCount(4)
  })

  test('the page carries a link preview', async ({ page }) => {
    for (const path of ['/', '/about']) {
      await page.goto(path)

      const meta = await page.evaluate(() => {
        const read = (key: string) =>
          document.querySelector(`meta[property="${key}"]`)?.getAttribute('content') ?? null
        return {
          title: read('og:title'),
          description: read('og:description'),
          image: read('og:image'),
          width: read('og:image:width'),
          height: read('og:image:height'),
          card: read('twitter:card'),
        }
      })

      expect(meta.title, `${path} og:title`).toBeTruthy()
      expect(meta.description, `${path} og:description`).toBeTruthy()
      // Layout's fallback copy for auth pages must not become every page's preview.
      expect(meta.description, `${path} og:description`).not.toMatch(/sign in to your account/i)
      expect(meta.card, `${path} twitter:card`).toBe('summary_large_image')
      expect(meta.image, `${path} og:image`).toMatch(/^https?:\/\/.+\/images\/oncue-og\.png$/)
      expect([meta.width, meta.height], `${path} og:image size`).toEqual(['1200', '630'])

      const empty = await page.evaluate(() =>
        Array.from(document.querySelectorAll('meta[property^="og:"], meta[property^="twitter:"]'))
          .filter(tag => !tag.getAttribute('content'))
          .map(tag => tag.getAttribute('property'))
      )
      expect(empty, `${path} preview tags with no content`).toEqual([])
    }
  })
})

test.describe('OnCue homepage edge cases', () => {
  test('a rejected clipboard selects both commands and says how to copy', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: () => Promise.reject(new window.DOMException('Blocked', 'NotAllowedError')),
        },
      })
    })
    await page.goto('/')
    await openDialog(page)

    await dialog(page).getByRole('button', { name: 'Copy' }).click()

    // Review fix 6: the reference fallback relabelled the button and selected nothing.
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe(COMMANDS.join('\n'))
    await expect(dialog(page).getByRole('status')).toHaveText(/selected/i)
    await expect(dialog(page).getByRole('status')).toHaveText(/Ctrl\+C/)
  })

  test('closing and reopening the dialog resets the copy button', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.resolve() },
      })
    })
    await page.goto('/')
    await openDialog(page)

    const copy = dialog(page).locator('[data-command-copy]')
    await copy.click()
    await expect(copy).not.toHaveText('Copy')

    await page.keyboard.press('Escape')
    await openDialog(page)
    await expect(copy).toHaveText('Copy')
    await expect(dialog(page).getByRole('status')).toHaveText('')
  })

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false })

    test('the install link goes to the README and the demo shows its finished frame', async ({
      page,
    }) => {
      // The README is external; answer it locally so the test checks where the
      // link goes without depending on github.com.
      await page.route(`${README}**`, route =>
        route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>OnCue README</h1>' })
      )
      await page.goto('/')

      await expect(page.locator('[data-demo-transport]'), 'no demo transport').toHaveCount(1)
      await expect(page.locator('[data-demo-transport]')).toBeHidden()
      await expect(page.locator('[data-command-copy]'), 'no copy button').toHaveCount(1)
      // The attribute itself: the closed dialog would hide the button anyway.
      await expect(page.locator('[data-command-copy]')).toHaveAttribute('hidden', '')
      await expect(page.locator('[data-step][data-state="revealed"]')).toHaveCount(3)

      await expect(installLink(page)).toHaveCount(1)
      await installLink(page).click()
      await expect(page).toHaveURL(`${README}#install`)
    })
  })

  test.describe('under reduced motion', () => {
    test('nothing advances until Play is pressed', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto('/')
      await expect(playButton(page), 'no play button').toHaveCount(1)

      await page.waitForTimeout(1500)
      await expect(elapsed(page)).toHaveText('00:00')
      await expect(page.locator('[data-step][data-state="revealed"]')).toHaveCount(3)
      await expect(playButton(page)).toHaveAttribute('aria-label', 'Play timing demo')

      const durations = await page
        .locator('[data-step]')
        .evaluateAll(steps => steps.map(step => getComputedStyle(step).transitionDuration))
      // 0.01ms is the conventional "off" value a reduced-motion reset uses.
      for (const duration of durations) {
        expect(Math.max(...duration.split(', ').map(parseFloat)), duration).toBeLessThanOrEqual(
          0.00001
        )
      }

      await playButton(page).click()
      await expect(elapsed(page)).not.toHaveText('00:00', { timeout: 2000 })
    })
  })

  test('hiding the tab pauses a running demo', async ({ page }) => {
    await page.goto('/')
    await expect(playButton(page), 'no play button').toHaveCount(1)
    await playButton(page).click()
    await expect(playButton(page)).toHaveAttribute('aria-label', 'Pause timing demo')

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      })
      document.dispatchEvent(new window.Event('visibilitychange'))
    })

    await expect(playButton(page)).toHaveAttribute('aria-label', 'Play timing demo')
    const pausedAt = await elapsed(page).textContent()
    await page.waitForTimeout(1200)
    await expect(elapsed(page)).toHaveText(pausedAt ?? '')
  })

  test('Replay after 00:08 starts again at 00:00', async ({ page }) => {
    // A fake clock drives requestAnimationFrame, so the 8-second run takes no
    // real time and the readout after Replay cannot race a frame.
    await page.clock.install()
    await page.goto('/')
    await expect(playButton(page), 'no play button').toHaveCount(1)

    await playButton(page).click()
    await page.clock.runFor(8500)
    await expect(playButton(page)).toHaveAttribute('aria-label', 'Replay timing demo')
    await expect(elapsed(page)).toHaveText('00:08')

    await playButton(page).click()
    await expect(elapsed(page)).toHaveText('00:00')
    await expect(playButton(page)).toHaveAttribute('aria-label', 'Pause timing demo')

    await page.clock.runFor(1500)
    await expect(elapsed(page)).toHaveText('00:01')
  })

  test('at 375px the annotations are hidden and nothing scrolls sideways', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)

    const annotations = page.locator('[data-demo-annotation]')
    await expect(annotations, 'no demo annotations').toHaveCount(2)
    expect(
      await annotations.evaluateAll(els => els.map(el => getComputedStyle(el).display))
    ).toEqual(['none', 'none'])

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(scrollWidth, 'the page scrolls sideways at 375px').toBe(clientWidth)

    // Review fix 5: the reference header dropped two of its three links here.
    await page.locator('nav[data-site-nav] button[popovertarget]').click()
    for (const name of ['How it works', 'Documentation', 'GitHub']) {
      await expect(page.locator('[popover]').getByRole('link', { name })).toBeVisible()
    }
  })

  test('no label is smaller than its floor', async ({ page }) => {
    await page.goto('/')

    // Review fix 2: the reference labels were fixed at 7-10px.
    const sizes = await page.evaluate(() => {
      const film = document.querySelector('[data-film]')
      const size = (el: Element) => parseFloat(getComputedStyle(el).fontSize)
      const name = (el: Element) =>
        `${el.tagName.toLowerCase()} "${el.textContent?.trim().slice(0, 24)}"`

      const outside = Array.from(document.querySelectorAll('[data-ui]'))
        .filter(el => !film?.contains(el))
        .map(el => ({ name: name(el), px: size(el) }))

      // Inside the film every element that holds text counts, not only the
      // marked labels, because the step numbers are labels too.
      const inside = film
        ? Array.from(film.querySelectorAll('*'))
            .filter(el =>
              Array.from(el.childNodes).some(
                node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
              )
            )
            .map(el => ({ name: name(el), px: size(el) }))
        : []

      return { outside, inside }
    })

    expect(sizes.inside.length, 'no text inside [data-film]').toBeGreaterThan(10)
    for (const { name, px } of sizes.outside)
      expect(px, `${name} outside the film`).toBeGreaterThanOrEqual(12)
    for (const { name, px } of sizes.inside)
      expect(px, `${name} inside the film`).toBeGreaterThanOrEqual(10)
  })

  test('links announce no arrow glyphs and open in the same tab', async ({ page }) => {
    await page.goto('/')

    // Review fix 7: arrows were read aloud and new-tab links were not announced.
    const report = await page.evaluate(() => {
      const spoken = (el: Element) => {
        const copy = el.cloneNode(true) as Element
        copy.querySelectorAll('[aria-hidden="true"]').forEach(node => node.remove())
        return el.getAttribute('aria-label') ?? copy.textContent ?? ''
      }
      // The whole page, footer included: a new-tab link anywhere breaks the promise.
      const controls = Array.from(document.querySelectorAll('a[href], button'))
      return {
        repoLinks: controls.filter(el =>
          el.getAttribute('href')?.startsWith('https://github.com/shawn-sandy/oncue')
        ).length,
        arrows: controls.map(spoken).filter(text => /[↗→▷▶↻⟶➜]/.test(text)),
        targets: controls
          .filter(el => el.hasAttribute('target'))
          .map(el => el.outerHTML.slice(0, 80)),
      }
    })

    expect(report.repoLinks).toBeGreaterThanOrEqual(4)
    expect(report.arrows).toEqual([])
    expect(report.targets).toEqual([])
  })
})
