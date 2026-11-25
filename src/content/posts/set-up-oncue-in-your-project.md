---
title: 'How to Set Up OnCue in Your Project: A Beginner Guide'
pubDate: 2026-11-24
description: 'Install the OnCue plugin, prepare your machine, create a project folder, set up your design system, and run your first check, step by step.'
author: 'Shawn Sandy'
tags: ['oncue', 'setup', 'guide', 'design system', 'video']
publish: true
featured: false
---

OnCue turns one small file into a short explainer video. You describe the video once, and OnCue builds a PowerPoint deck, a voiceover script, and an animated video from that description. Every card and step on screen appears on the exact word the narrator says.

This guide gets you from nothing to a working project. You do not need to know video editing. You do need a terminal and a few minutes. By the end you will have:

- the OnCue plugin installed in Claude Code
- your machine checked and ready
- a project folder with a starter spec
- a design system file that sets your colors, fonts, and corners
- a passing check, and a deck built from your file

We stop before recording a voice or rendering the video. Those steps cost credits and time, so they deserve their own post. Setup is the part you want to get right first.

## What you need before you start

Gather these first. Most people already have half of them.

| You need                             | Why                                  | Required?            |
| ------------------------------------ | ------------------------------------ | -------------------- |
| Claude Code                          | OnCue is a plugin for it             | Yes                  |
| Node.js 22 or newer                  | Runs the OnCue engine                | Yes                  |
| ffmpeg (includes ffprobe)            | Encodes video and reads audio length | For video            |
| A browser OnCue can drive (Chromium) | Draws the still frames and video     | For stills and video |
| An ElevenLabs account                | Records an AI voiceover              | Optional             |

Two notes before moving on.

First, "optional" really means optional. Without ElevenLabs you can bring your own MP3 and a matching file of word timestamps, or skip audio and render a silent preview.

Second, you can plan a video with none of this. A text storyboard needs only Claude Code. The rest unlocks outputs one at a time.

Check Node now:

```bash
node --version
```

If it prints a number below 22, install a newer Node from nodejs.org or with your version manager. Then check ffmpeg. Run these as two separate commands, because one missing tool can hide behind the other:

```bash
ffmpeg -version
ffprobe -version
```

On a Mac, `brew install ffmpeg` installs both. On Debian or Ubuntu, use `sudo apt install ffmpeg`.

## Step 1: Install the OnCue plugin

A plugin is an add-on for Claude Code. It gives Claude new skills, which are saved instructions for a specific job. OnCue's skills cover storyboards, voiceover, decks, and video.

Open Claude Code and type these two commands in the chat, one at a time:

```text
/plugin marketplace add shawn-sandy/oncue
/plugin install oncue@oncue
```

The first command tells Claude Code where OnCue lives. The second installs it. Run `/reload-plugins`, or start a new session, so Claude loads the new skills.

Working on a team? Install it for the whole repository so everyone gets it:

```bash
claude plugin install oncue@oncue --scope project
```

This records the plugin in the repository's settings. Each teammate then installs it once on their own machine.

To update later, run this in your terminal:

```bash
claude plugin update oncue@oncue
```

Then reload plugins or start a fresh session.

## Step 2: Let OnCue check your machine

OnCue ships a setup skill that does the checking for you. In Claude Code, ask:

```text
Set up OnCue
```

You can also invoke it by name, `oncue:setup`. It looks at your Node version, ffmpeg, the browser, and your voice connector. It fixes what it can inside the session, and it asks before installing anything on your system. It never records or transcribes anything while checking, so it spends no credits.

It finishes with a report. Each item is marked ready, missing, blocked, or not tested. A second table then tells you which outputs will work right now: storyboard, deck, preview stills, silent video, voiceover, and final video.

Read that second table. It is your map. If the deck says ready and the final video says missing ffprobe, you know the exact next fix.

## Step 3: Create your project folder

Now make a home for your first video. Pick any name you like. This guide uses `oncue-quickstart`.

```bash
mkdir oncue-quickstart
cd oncue-quickstart
```

Inside it you need three things:

```text
oncue-quickstart/
  short.json     the spec: the whole video described in one file
  DESIGN.md      your design system: colors, fonts, corners
  logo.png       a square PNG logo
```

The `logo.png` is required. OnCue puts it in the header and on the opening scene. Use your real logo, any square PNG. While you experiment, a placeholder works fine, and you can swap it later without touching anything else.

You do not have to write these files by hand. Asking Claude to storyboard your topic produces a `short.json` for you. But you should understand what is inside it, because it is the one file that drives everything.

## Step 4: Understand the spec

Here is a small `short.json` with two beats. A beat is one voiceover line paired with one scene on screen.

```json
{
  "title": "Quickstart in 20 seconds",
  "format": { "width": 1080, "height": 1920 },
  "brand": {
    "name": "Quickstart",
    "logo": "logo.png",
    "colors": {
      "ground": "#fcfcfd",
      "card": "#f1f3f5",
      "chip": "#e6f2f6",
      "rule": "#dde1e6",
      "ink": "#101418",
      "muted": "#5a6472",
      "accent": "#0b6070",
      "highlight": "#0b6070",
      "you": "#0b6070",
      "panel": "#e6f2f6",
      "panelInk": "#101418",
      "panelMuted": "#5a6472",
      "panelRule": "#c9dfe6"
    },
    "fonts": { "sans": "inter", "mono": "jetbrains-mono" },
    "deckFonts": { "head": "Arial", "body": "Arial" }
  },
  "lines": [
    {
      "vo": "Want a video that lands on every word? This is Quickstart.",
      "scene": {
        "kind": "hook",
        "headline": "Your first video, built from {one file.}",
        "headlineCue": { "word": "want" }
      }
    }
  ]
}
```

(This example is the complete color block, all thirteen roles, which Step 5 explains. Leave one out and `check` stops with an error such as `brand.colors.card: is required`. This post covers the first beat only, so your `lines` list will be longer.)

Four ideas matter here.

**Format.** `1080` by `1920` is tall, the shape for YouTube Shorts, Reels, and TikTok. For a normal YouTube video, use `1920` by `1080`. Any frame size works within limits. Each side must be an even whole number from 320 to 4096, and the long side can be at most 2.4 times the short side. So `320` by `4096` is rejected even though each side is in range.

**Lines.** Each entry in `lines` is one beat. The `vo` text is what the narrator says. The `scene` is what the viewer sees.

**Braces.** The curly braces in `{one file.}` mark the words that get the accent color. They change the look and nothing else.

**Cues.** `headlineCue: { "word": "want" }` says the headline starts building when the narrator says "want". This is how OnCue lands every element on its word. A cue always names a word that appears in that beat's `vo` line.

Because the deck, the script, and the video all read this one file, they cannot drift apart. Change a word once and it changes everywhere.

## Step 5: Set up your design system

This is the step that makes the video look like yours. A design system is a short list of decisions: your colors, your fonts, how round the corners are. You make those decisions once, and every scene follows them.

OnCue stores the look in the `brand` block and an optional `theme` block of `short.json`. There are three ways to fill them.

### Option A: Use the default

Say nothing about design and OnCue copies its Astro default theme, a calm light look with one teal accent. It tells you what it chose, for example "Using the Astro default theme, light mode." If you want dark, say so and it uses the dark mode instead. This is a fine starting point and takes zero effort.

### Option B: Describe it in plain words

Tell Claude the feeling you want. OnCue maps words to settings:

| You say                    | OnCue sets                                       |
| -------------------------- | ------------------------------------------------ |
| playful, friendly, rounded | round corners, airy spacing                      |
| corporate, serious         | soft or sharp corners, regular spacing           |
| technical, dense           | sharp corners, compact spacing, hairline borders |
| editorial, calm, minimal   | flat or subtle background, airy spacing          |

### Option C: Bring your own

If you already have a look, hand it over. OnCue can read a `DESIGN.md` file, design tokens in W3C or Style Dictionary JSON, Figma tokens, a reference screenshot, or a website's CSS custom properties. It maps each into the same settings. When you give a file, that file wins over the defaults.

### What the settings are

Colors come as thirteen named roles. You do not need to memorize them. The ones you will touch most:

| Role              | Used for                          |
| ----------------- | --------------------------------- |
| `ground`          | page background                   |
| `card`            | card fill                         |
| `ink` and `muted` | main and secondary text           |
| `accent`          | highlighted words, icons, kickers |
| `highlight`       | step numbers, progress bar, glow  |

The rest (`chip`, `rule`, `you`, `panel`, `panelInk`, `panelMuted`, `panelRule`) style small fills, hairlines, and the result card.

The `theme` block picks named scales, and each key is optional:

```json
"theme": { "radius": "soft", "density": "regular", "background": "flat", "stroke": "hairline" }
```

`radius` sets corner roundness: `sharp`, `soft`, or `round`. `density` sets spacing: `compact`, `regular`, or `airy`. `background` can be `flat` or have a glow. On a light page, choose `flat`, because glows read as smudges on a light ground.

### Save the look as DESIGN.md

Once you are happy, keep the decisions in a file you can reuse. Put a `DESIGN.md` at the project root. Its top section, called frontmatter, looks like this:

```yaml
---
name: Quickstart
description: A calm, light look with one teal accent and hairline borders.
colors:
  ground: '#fcfcfd'
  ink: '#101418'
  accent: '#0b6070'
typography:
  body:
    fontFamily: Inter
  code:
    fontFamily: JetBrains Mono
rounded:
  card: 8px
spacing:
  gap: 16px
oncue:
  background: flat
  stroke: hairline
---
```

(Again shortened here, so list every color role in your real file.)

The `rounded` and `spacing` values turn into `radius` and `density`. Eight pixels of corner reads as `soft`, and a sixteen pixel gap reads as `regular`. The `oncue` section holds the few settings a standard design file has no slot for.

Claude offers to save this file for you after you approve your first storyboard. It only writes it if you say yes, and it never overwrites an existing `DESIGN.md`.

### Check your contrast

Pretty colors are not enough. Text must be readable. OnCue measures it for you with the `check` command, which warns whenever a text and background pair falls below the 4.5 to 1 contrast ratio from the WCAG accessibility guidelines. A warning names both colors, so you know exactly which to change. Fix every warning before you show anyone a frame.

Fonts are the one thing to watch. The video uses fonts from the `@fontsource` collection, such as `inter` or `plus-jakarta-sans`. If you pick one that is not installed, add it inside the engine folder, which we create next:

```bash
npm install @fontsource/plus-jakarta-sans
```

Good news: changing your design never touches the narration. The look is safe to change at any time, even after you record a voice.

## Step 6: Install the engine

The engine is the program that checks, builds, and renders. It comes bundled with the plugin, but you should never run it from inside the plugin's own folder. Instead you make a working copy in your project.

Setup does this for you. If you want to do it yourself, copy the engine folder from the plugin into your project as `oncue-engine`, then install its packages:

```bash
cd oncue-engine
npm install
npm run example:check
```

The last command checks the built-in example. Wait for the line `OK.` at the end. That one word is your proof the engine works. Seeing the packages download is not proof, so wait for it.

If you ever replace an old copy, rename the old folder first, for example to `oncue-engine.old`, and copy fresh. Never copy into an existing folder, or you end up with one engine nested inside another.

Add a `.gitignore` so you do not commit the engine's many files:

```text
oncue-engine/
build/
```

## Step 7: Add a browser for stills and video

Stills (single preview frames) and video are drawn in a real browser. OnCue uses Playwright for this. From the engine folder, install the Playwright package, then the browser it drives:

```bash
npm install --save-dev playwright
npx playwright install chromium
```

Already have a Chromium you trust? You can point OnCue at it instead. Use the exact, verified path to the program:

```bash
export ONCUE_CHROMIUM_PATH="/absolute/path/to/chromium"
```

Do not guess that path. A wrong one fails loudly, which is what you want.

Now prove it draws. Render the example stills:

```bash
node dist/cli.js stills examples/gleaner/short.json
```

Open one image in `examples/gleaner/build/stills/`. It should show a styled scene. A blank white page means the browser launched but something is off, so treat it as not ready.

## Step 8: Run your first check

Back in your project, point the engine at your spec:

```bash
node oncue-engine/dist/cli.js check short.json
```

You will see your layout, each beat, the estimated voiceover length, and any contrast warnings. For the two-beat starter above, it reported two beats and about twelve seconds, then `OK.`

Then build the deck, which needs only Node and the engine:

```bash
node oncue-engine/dist/cli.js deck short.json --out deck.pptx
```

Open `deck.pptx` in PowerPoint, Keynote, or Google Slides. Each beat is a slide, and the narration sits in the speaker notes. You made a presentation from a JSON file.

Other commands you will use soon:

| Command  | What it gives you                       |
| -------- | --------------------------------------- |
| `check`  | validates the spec and prints the plan  |
| `script` | prints the voiceover, one line per beat |
| `deck`   | the editable PowerPoint                 |
| `stills` | preview frames, to inspect the look     |
| `video`  | the animated MP4                        |

## Step 9: Connect a voice (optional)

When you want real narration, connect ElevenLabs. In your terminal:

```bash
claude mcp add --transport http elevenlabs https://api.elevenlabs.io/v1/mcp
```

Then sign in through Claude Code's `/mcp` command. Setup deliberately never generates audio, because audio costs credits. As a rough guide, one 75 second recording used about 1,100 credits and one transcription about 600. Charges vary, so treat those as an estimate.

Already have a recording? Bring the MP3 plus a matching word timestamp file instead. OnCue times everything from word timestamps, never from pauses in the audio, because pauses inside a sentence are about as long as pauses between sentences.

One rule keeps you out of trouble. Approve your beats before any audio is recorded. Changing the script after a recording means recording again.

## Common problems

**A tool shows as missing.** Run the setup skill again. It reports each tool on its own, so you will see which one.

**Downloads from ElevenLabs are refused.** Some sandboxed sessions block that file host. Allow the domain in your settings, or attach the MP3 and timestamps yourself.

**The check lists contrast warnings.** Read the two color names in the message. Darken `muted`, or lighten the surface it sits on, then check again.

**The video is slow.** Rendering speed depends on your machine. Run it in the background and keep working.

## What you have now

You installed the plugin, confirmed your machine, made a project folder, set up a design system, installed the engine and a browser, and ran a check and a deck from one file. That is the entire foundation.

The next step is the fun one. Ask Claude to storyboard a topic, approve the beats, then add a voice and render. Because you set the look first, every video you make from this folder will already look like yours.
