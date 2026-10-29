/**
 * Regenerates `public/images/oncue-og.png`, the 1200x630 link preview that
 * `src/layouts/Base.astro` names in `og:image`, from the live homepage hero.
 *
 * Boots the Astro dev server, waits until `/` answers 200, screenshots the
 * hero in a 1200x630 light viewport with Playwright's Chromium, and stops the
 * server. Astro allows one dev server per project: when one is already
 * running, it exits naming that server's URL, and this script uses that
 * server instead and leaves it running.
 *
 * Usage: `node scripts/capture-og-image.mjs` (set `OG_PORT` to change the
 * port it boots on; default 4399). Rerun it whenever the hero changes.
 */
import { spawn } from 'node:child_process'
import { URL, fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const PORT = process.env.OG_PORT ?? '4399'
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = fileURLToPath(new URL('../public/images/oncue-og.png', import.meta.url))
const TIMEOUT_MS = 120_000

// Own process group, so stopping it also stops the node process npx starts.
const server = spawn('npx', ['astro', 'dev', '--port', PORT], {
  cwd: ROOT,
  detached: true,
  stdio: ['ignore', 'pipe', 'pipe'],
})
let output = ''
server.stdout.on('data', chunk => (output += chunk))
server.stderr.on('data', chunk => (output += chunk))

/**
 * Stops the server this script started, and only that one. A server that
 * already exited, by code or by signal, has no group left to signal, and
 * signalling it would replace the real error with ESRCH.
 */
function stopServer() {
  if (server.exitCode !== null || server.signalCode !== null) return
  try {
    process.kill(-server.pid, 'SIGTERM')
  } catch {
    // The group ended between the check and the kill.
  }
}

// The server runs in its own process group, so Ctrl-C in the terminal never
// reaches it, and Node's default exit on a signal skips `finally`.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    stopServer()
    process.exit(signal === 'SIGINT' ? 130 : 143)
  })
}

/** Resolves the homepage URL once it answers 200, from our server or the one already running. */
async function waitForHomepage() {
  const deadline = Date.now() + TIMEOUT_MS
  let url = `http://localhost:${PORT}/`

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      // Astro words this differently with and without a TTY; both name the URL.
      const running = /already running[\s\S]*?(https?:\/\/[^\s"()\\]+)/.exec(output)
      if (!running) throw new Error(`astro dev exited with code ${server.exitCode}:\n${output}`)
      url = new URL('/', running[1]).href
    }
    try {
      if ((await fetch(url)).ok) return url
    } catch {
      // Not listening yet.
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  throw new Error(`${url} did not answer 200 within ${TIMEOUT_MS / 1000}s`)
}

try {
  const url = await waitForHomepage()
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      colorScheme: 'light',
    })
    await page.goto(url)
    await page.evaluate(() => document.fonts.ready)
    // The dev toolbar is not part of the page, and the hero's small print
    // (note, outputs, player) would be cut off at the bottom of the frame.
    await page.addStyleTag({
      content: `astro-dev-toolbar, .home-hero__note, .home-hero__outputs,
        [data-demo-transport], .timing-demo__caption { display: none !important; }`,
    })
    await page
      .locator('[data-home-hero]')
      .evaluate(hero => window.scrollTo(0, hero.getBoundingClientRect().top + window.scrollY))
    await page.screenshot({ path: OUT })
    console.log(`Wrote ${OUT} from ${url}`)
  } finally {
    await browser.close()
  }
} finally {
  stopServer()
}
