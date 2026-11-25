import { test, expect } from '@playwright/test'

// Objective-verification test for the Astro v6 -> v7 upgrade.
// Must pass on v6 (this PR), stay green through the v7 bump, and
// through the 3-adapter CI matrix. Proves the framework actually
// renders end-to-end, not just that `npm install` resolved.

test('home page renders', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1').first()).toBeVisible()
})

test('published blog post renders', async ({ page }) => {
  const response = await page.goto('/posts/set-up-oncue-in-your-project')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1').first()).toBeVisible()
})

test('rss feed is served', async ({ page }) => {
  const response = await page.goto('/rss.xml')
  expect(response?.status()).toBe(200)
  const body = await response?.text()
  expect(body).toContain('<rss')
})

test('starlight guide renders', async ({ page }) => {
  const response = await page.goto('/guide/getting-started')
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1').first()).toBeVisible()
})

test('home to blog to post navigation has no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => {
    // The dev toolbar's "Use the Image component" audit fetches each plain
    // <img> after load. This test leaves every page at once, which aborts that
    // fetch and logs the toolbar's own error. The toolbar exists only in dev,
    // so its aborted audit is not a page error.
    if (
      msg.type() === 'error' &&
      !msg.text().includes("Error while running audit's match function")
    ) {
      errors.push(msg.text())
    }
  })

  await page.goto('/')
  await page.goto('/blog')
  // Follow the real link from the list, so a broken href (for example
  // /posts/undefined) fails here instead of being skipped by a direct goto.
  const hrefs = await page
    .locator('a[href*="posts/"]')
    .evaluateAll(links => links.map(link => link.getAttribute('href')))
  expect(hrefs.filter(href => href?.includes('undefined'))).toEqual([])
  await page
    .getByRole('link', { name: /How to Set Up OnCue in Your Project/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/posts\/set-up-oncue-in-your-project\/?$/)
  const heading = page.locator('h1').first()
  await expect(heading).toBeVisible()
  await expect(heading).toContainText('Set Up OnCue')
  await page.goto('/guide/getting-started')

  expect(errors).toEqual([])
})
