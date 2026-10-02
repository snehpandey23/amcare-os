# Employer Demo Tour: Engineering Handoff

**Page:** `siya.health/employers/demo`
**Design source of truth:** `apps/siya-health/internal/employer-demo-prototype.html`
**Last updated:** 2026-10-02

---

## 1. How we work from now on

- **Design happens outside the repo.** The founder and Claude design and iterate in a standalone prototype (`employer-demo-prototype.html`). That file is the approved design.
- **Cursor owns code and deploys.** Port the prototype into the site, wire it to our shared data and tracking, deploy, and make follow-up changes.
- **Port, don't redesign.** Match the prototype's visuals, timing, motion, copy and sound exactly. If something can't be matched, say what and why. Don't substitute your own approach.
- **Deploy demo-only changes straight to production.** `/employers/demo` is unlinked and noindex, so it's the review environment.
- **Stop and ask before touching shared files:** `employer-pilot-facts.mjs`, `site-chrome.mjs`, tracking scripts, or any page other than the demo. `/employers/california-pilot` was removed 2026-09-30 and redirects to `/employers`.
- **After every deploy,** reply with the live URL, a one-line summary of what changed, anything you couldn't match, and screenshots of the affected slides at 1440×900 and 390×844.
- **Follow the Design QA protocol** below for every change request.

## Design QA protocol

For each feedback item:

1. Restate the intent in one line: what should the viewer understand or feel?
2. Pick a real-world reference the viewer already knows (a calendar app day view, a phone lock-screen notification, a voicemail list, a chat app) and follow its conventions. Never use abstract chips or floating labels to stand in for a real object.
3. Write a short design spec before coding: layout, elements, copy, timing, and a separate phone layout (390×844). Reuse the existing build classes and slide engine; no one-off styles.
4. Build it.
5. Render screenshots at 1440×900 and 390×844 after all builds on the slide have finished, and inspect them against this checklist:
   - Nothing overlaps (headings, captions, nodes, cards, the control bar)
   - Nothing clipped or off-screen
   - All text readable (size and contrast)
   - Everything meant to be inside an object (phone, calendar) is inside it
   - It looks like the real-world reference, not a diagram of it
   - It matches the intent from step 1
6. Fix every failure and re-check once.
7. Deploy. In the reply, include per slide: the intent, the reference used, the checklist results, and anything unsure.

If a request is ambiguous, or there is no good real-world reference, ask before building. Do not guess.

A new or redesigned visual still comes from the prototype when one exists. A text-only request for a new visual is not enough to invent a design: ask for a prototype, or follow this protocol only after the intent and reference are explicit.

## Mobile-first rule

- Design every slide for 390×844 first, then desktop.
- One idea per screen on phones. If a slide's content does not fit above the control bar at 390×844 without scaling the frame below 90%, split it into two or more slides on phones. Desktop may keep one slide. Do not shrink text to make it fit.
- Minimum sizes on phones: body text 14px, labels and captions 12px, tap targets 44px.

## Automated checks

Run with Playwright on every slide, at 1440×900 and 390×844, after all builds on the slide have finished.

- **Overlap:** compare bounding boxes of all visible text elements, cards, nodes, phones, calendars, and the control bar. Flag any overlap that is not intentional (text on its own card is fine; a card over a heading is not).
- **Off-screen or clipping:** flag any visible element that is partly outside the viewport or cut off by its container.
- **Contrast:** for every visible text element, compute its color against the actual background behind it, including gradients and images. Sample the darkest and lightest point. Flag anything under 4.5:1 for normal text, or under 3:1 for large text (24px or larger, or 19px or larger and bold).
- **Size:** flag text below the phone minimums above.
- **Containment:** flag anything meant to be inside a phone, calendar, or card that renders outside it.

## Audit report format

One table per slide: slide name, check, desktop result, phone result, proposed fix. Mark each fix as:

- **fix now:** contrast, size, clipping, and overlap fixes that do not change the design.
- **needs approval:** splitting a slide, changing layout, or changing copy.

For every slide proposed to split on phones, describe what goes on each screen.

Do the fix-now items. Do not make needs-approval changes until the founder confirms.

## Slide design system

Every slide follows this. A slide is never only text on a background.

1. **Structure:** eyebrow, then a headline of at most two lines, then an optional subline of at most two lines, then one hero visual that takes at least 45% of the slide height. A list is never plain text. Each item is a card with an icon.
2. **Heroes** are objects people already recognize: a form, a calendar invite, a chat thread, a booking page, an email, a video call, a dashboard, a review card. Draw them with the existing cream, navy, and magenta tokens. No vendor logos and no copies of another product's interface.
3. **Motion, and nothing else:** pop (cards), draw (lines, charts, rails), count-up (numbers), a travelling dot (flows), glow (emphasis), sequential ticks (checklists). Three to five beats, 400–600ms apart. Slides run 7–10 seconds.
4. **Type.** Desktop: headline 40–46px, subline 17–18px, card titles 15–16px, labels at least 12px. Phone: headline 26–28px, subline 15px, card titles 14px, labels at least 12px.
5. **Mobile:** design 390×844 first. One idea per screen. If a slide does not fit above the control bar, split it on phones. Desktop may keep one slide. Do not scale the whole slide below 90%. Keep a 120px safe zone above the bar. On phones, lay the hero out with flex or grid so pieces cannot overlap.

## Chapters

The progress bar is six labelled segments. Tap a label to jump to the first slide in that chapter.

1. The problem
2. Meet Siya
3. How it works — the click-through employee journey uses the same phone as the voicemail slide. “How your people get care” is removed. “Getting started as an employer” stays. The video step shows the website photo of Dr. Sneh Pandey, MD, Medical Director, and a silhouette labelled You.
4. The care now opens with the baseline slide (cognitive grid, then sleep, mood, stress, and focus, then Baseline set). Outcomes, the cost comparison, and the founder video are specified and not in the tour yet. The employee progress chart stays on Privacy until the outcomes slide is built. The founder file, when it exists, is `employers/demo/media/founder.mp4` with `founder.vtt`.
6. Proof — the numbers and the homepage reviews, then close.

## 2. Structure of the page

One full-screen stage with three layers, shown in this order:

1. **Intro** (`<canvas id="stage">`): dark starfield → stars converge into the "Siya Health" wordmark → tagline → cream bloom.
2. **Welcome** (`#welcome`): cream screen, "For HR and benefits leaders / See how Siya Health works for your people / Start the tour." Click anywhere starts the tour.
3. **Tour** (`#tour`): 16 full-screen slides that auto-play like a video, with a story-style progress bar and Back / Pause / Next.

The page never scrolls. Every slide must fit the viewport at 1440×900 and 390×844.

## 3. Techniques used (and why)

### 3.1 Intro canvas

- **Canvas 2D, no libraries.** Cap `devicePixelRatio` at 2 on desktop and 1.5 below 700px width.
- **Starfield:** ~680 stars on desktop, ~300 on phones, in three depth layers (size, brightness and drift speed scale with depth). Each star twinkles with a per-star sine phase. Mostly cream `#F4EFE7`, ~18% magenta/violet accents.
- **Constellation lines:** use a spatial hash grid (cell size = max link distance) so line-finding is O(n), not O(n²). Only the nearest layer draws lines, max 2 per star, alpha fades with distance.
- **Shooting stars** every 1.8–3.8s: a short gradient stroke with a fading tail.
- **Compositing:** `globalCompositeOperation = 'lighter'` for stars, lines and sparkles so overlaps glow. Reset to `source-over` for backgrounds.
- **Background:** radial gradient `#0E1F57` → `#081238` → `#050A24`. **Never** use `#001878` as a full-screen background; it reads as cheap royal blue.

### 3.2 Text-to-particles wordmark

- **Sample the text:** draw "Siya Health" (Poppins 700, `min(width × 0.13, 172px)`) on an offscreen canvas, read `getImageData`, and keep every pixel on a grid (`step = max(3, round(fontSize / 38))`) where alpha > 150. Those points are the targets.
- **Fonts must be loaded before sampling:** `await document.fonts.load('700 100px Poppins')`, or the letters form in the fallback font.
- **The letter particles start life as ordinary stars** scattered in the sky, so it looks like the constellation itself gathers.
- **Motion:** each particle travels a quadratic Bézier from its start to its target, with a random sideways control point so paths curve and swirl. Stagger delays left to right (0–0.9s), duration 1.3–1.7s, `easeInOutCubic`. Draw a faint trail while travelling.
- **The wordmark stays made of particles.** Arrived particles are drawn as small **diamonds**, colored by x-position along `#FF5CB8 → #E12193 → #D81088 → #A81490 → #9B3FB0 → #C9A0FF`, with ~20% near-white highlights.
- **Do not fade in a flat text wordmark on top.** The founder specifically rejected that.
- **Sparkle:** a highlight band sweeps left to right across the word every 2.6s (Gaussian falloff on x, boosts alpha, size and a white inner diamond). About 9% of particles are "flare" particles that periodically show a 4-point star glint.
- **Nebula:** 5 slowly drifting, large, soft radial gradients (cream + lavender at low alpha) behind the word for contrast.

### 3.3 Intro timeline (after click)

| Time | Event |
|---|---|
| 0s | Click. Particles begin travelling. Sound swell starts. Skip + Mute appear. |
| 2.6s | Letters lock. Bell chord plays. Pink glow pulse. Sparkle sweep begins. |
| 3.4s | Tagline fades in: "Integrated care for *busy professionals*" (light gradient `#FF5CB8 → #E12193 → #C9A0FF` on "busy professionals"). |
| 7.6s | Cream radial bloom expands from center. |
| 8.7s | Welcome screen. Stop the canvas loop to save battery. |

**Before the click:** a centered, glowing "Click to begin" button with the hint "Sound on for the full experience." Skip and Mute stay **hidden** until the intro plays. Clicking anywhere on the canvas also starts it. After the intro has started, any click, tap, Enter, or Space skips to the cream welcome. The Skip button does the same.

### 3.4 Sound (Web Audio, synthesized: no audio files, no licensing)

- **Must start from the user's click.** Browsers block audio before a gesture; this is why the page has a "Click to begin" gate.
- **Reverb:** a `ConvolverNode` with an impulse built from decaying white noise (3.4s).
- **Swell (0–2.5s):** a chord (C3 G3 C4 E4 G4 B4; sine/triangle, slightly detuned) → lowpass filter sweeping 240 Hz → 3 kHz → gain ramp up (crescendo), then a slow fade. Plus a rising sine shimmer into the reverb.
- **Bell at lock (2.6s):** C5 E5 G5 C6 E6 G6, each with 3 partials, fast attack, 3–4s exponential decay, slightly staggered.
- **Master gain** controls mute with a short ramp.

### 3.5 Tour engine

- **Declarative timeline.** Any element with `data-at="ms"` gets class `in` at that time after the slide starts; `data-out="ms"` adds `out`. `data-count="2700"` (with optional `data-dec`, `data-suf`) counts up when it fires.
- **One `requestAnimationFrame` scheduler** tracks `elapsed` per slide (capped delta so a background tab doesn't jump), fires due events, updates the progress bar, and auto-advances after `data-dur`. `data-dur="0"` = don't auto-advance (final slide).
- **Pause** freezes `elapsed`. **Click anywhere / Next / →** first completes the current slide's builds (PowerPoint-style), then advances on the next click. **Back / ←** goes back. **Space** toggles pause.
- **On every slide entry,** reset all `in`/`out` classes and count-up text so revisiting replays cleanly.
- **Slide transition:** outgoing and incoming slides cross-fade with `scale(1.03)` + `blur(10px)` → sharp.

### 3.6 Build classes

| Class | Effect |
|---|---|
| `.b` | Fade up 16px |
| `.pop` | Scale 0.6 → 1 with spring overshoot |
| `.grow` | `scaleX` 0 → 1 from the left (bars, rails) |
| `.draw` | SVG path draw-on: `pathLength="1"` + `stroke-dasharray:1; stroke-dashoffset:1 → 0` |
| `.fade` | Opacity only |
| `.grp.out` | Fade out a whole SVG group |
| `.split.in .mv` | Moves children outward via `--dx/--dy` custom properties |
| `.merge.in .appn` | Pulls nodes to the center and shrinks them |
| `.jit.in .app` | Short jitter shake |

**Transform rule:** never put two transforms on one element. An element that is centered with `translate(-50%,-50%)` must not also carry `.pop`. Either use the independent CSS `translate` property or wrap it (`.node` positions, inner element animates). Breaking this made tags jump off-position earlier.

### 3.7 Diagrams

- The node diagrams (apps web, conditions web) share one **1000 × 520 coordinate space**: lines in an SVG with `viewBox="0 0 1000 520"`, HTML nodes absolutely positioned at `left: x/10 %`, `top: y/5.2 %` inside an `aspect-ratio: 1000/520` box. Lines and nodes stay aligned at every width.
- **Problem and solution slides reuse the same generators** (same timeline, same phone, same constellation), so each fix visibly transforms its problem. Keep this mirroring when editing.

## 4. Lessons already learned: don't repeat these

1. **Blank slides:** each slide must be `position:absolute; inset:0` inside a fixed full-screen stage. An earlier build collapsed slides to 20px tall.
2. **Audio before a click is blocked.** Always gate with a click.
3. **Navy gradients disappear on dark backgrounds.** On the dark stage use the light gradient; the homepage navy gradient is for cream only.
4. **Don't hide controls behind other layers.** An image once covered the "Secure app" button. Check click targets at both sizes.
5. **Chat content taller than the stage** gets clipped. Use a fixed-height window, or trim.
6. **Don't show vendor UI or logos** (Spruce, CarePatron, app stores). Their terms require written permission. All product visuals are our own HTML mockups, labeled "Illustrative".
7. **Don't use AI-generated text in video/image assets.** It garbles. All on-screen text is real HTML.
8. **The tagline appears once** (on the dark intro). The welcome screen says something different.
9. **Phones get their own layouts, not a shrunk desktop.** On a viewport of 640px or less: hide "Click anywhere to continue"; raise slide padding so copy stays above the Back/Pause/Next bar; after a slide's builds finish, scale `.frame` down until it fits that space. Never let text sit under the bar.
10. **The AI concierge launcher is hidden on this page only**, with a rule in this page's own CSS (`iframe[title="Siya AI Concierge"]`). Do not change how the widget loads on other pages.
11. **Node diagrams on phones** (whole person, coordination, Meet Siya) use a taller 1000×900 box, nodes on a tighter ellipse, and smaller tiles (about 84px wide, 10px text, smaller badges). Nothing overlaps the heading, the caption, or another node. On the whole-person slide, specialist tags sit directly under each condition, and the outward split movement is small enough that the tags stay on screen.
12. **The Time slide on phones** is a vertical day, not the horizontal timeline. Hour labels run 9 AM to 6 PM. Meeting blocks stack with no gaps. The search chip travels down the day and ends on "No free slot", fully on screen. A magenta bracket marks clinic hours 9–5. Desktop keeps the horizontal timeline.

## 5. Content and compliance guardrails

- **Numbers come from `employer-pilot-facts.mjs`**, never hardcoded: patients treated, clinical evaluations, Google rating and review count, licensed states, concierge response time. If a number the tour needs isn't in that file, **stop and ask** before adding it.
- **No pricing** anywhere in the tour.
- **Keep these labels exactly:** "Illustrative · demo data" (getting-started slide), "Sample" (privacy report), "During business hours" (response slide), and "Aggregate reports only, for groups of 10 or more. Never who, or why."
- **Don't show** weekend/after-hours appointments, urgent care, therapy, or any outcome/ROI claim.
- **Health wording:** conditions "often show up together" / "connected." Never claim stress *causes* them.
- **Tagline:** "busy professionals," not "working professionals."
- **The experience slide** describes clinicians' other practice settings generically (direct primary care, community health centers, veterans' care). Don't add names, employers or facility names.

## 6. Site integration requirements

- **Route:** `/employers/demo`, `noindex, nofollow` meta + `X-Robots-Tag` header, excluded from the sitemap, not linked from nav.
- **Fonts:** Poppins (500/600/700) and Inter (400/500/600), matching the site.
- **Button:** the close slide has one button, "Submit an inquiry", to the employer inquiry form (`/employers#employer-inquiry-form`), read from **one config value**. Patients use Meet & Greet; employers use this form; providers use the provider inquiry form.
- **Prototype-only items to remove:** "Replay intro" on the welcome screen. Keep "Replay tour" on the final slide.
- **Analytics** (existing GTM exception, **no Meta pixel**, no personal data in parameters): `employer_demo_intro_start`, `employer_demo_intro_skip`, `employer_demo_tour_start`, `employer_demo_slide_view` (slide number + id, once per slide per visit), `employer_demo_pause`, `employer_demo_cta_click` (which button).
- **`?review=1`** sets a cookie that disables GTM and `siya-tracking.js` in that browser (internal reviewers).
- **Reduced motion:** skip the intro and show the welcome screen; tour builds appear instantly; no halo/ring pulses.
- **Performance:** keep the phone particle caps; stop the intro `requestAnimationFrame` loop after the welcome appears; target 60 fps on a mid-range phone.
- **The intro plays on every page load.**

## 7. Slide list (current approved version)

All of these play. Care hours and the reply standard come from `employer-pilot-facts.mjs` (6 AM – 10 PM, 7 days, patient's local time; replies within 1 hour in that window).

| # | Id | Theme label | Headline | Auto-advance |
|---|---|---|---|---|
| 0 | statement | The problem | Healthcare still runs on a schedule your people can't keep. | 4.8s |
| 1 | p-time | Time | Shared Monday calendar, 9 AM–6 PM. Appointments that don't fit a workday. | 12.5s |
| 2 | p-response | Response | Voicemail story, all inside the phone. Caption: Messages that go unanswered for days. | 14.5s |
| 3 | p-whole | The whole person | It's all connected. Their care isn't. | 10s |
| 4 | p-coord | Coordination | Five apps. Five logins. Badges 1–5 clockwise from the top. | 9s |
| 5 | question | — | But is it there when they need it? | 7s |
| 6 | turn | Introducing | Meet Siya Health. Ring of cards and a travelling light. Tagline is not repeated here. | 6.5s |
| 7 | f-time | How we help | Same Monday calendar. Care that works around their schedule. | 8s |
| 8 | f-hours | How we help | Evenings, weekends and holidays too. Hours line from employer-pilot-facts.mjs. | 10s |
| 9 | f-response | How we help | Real replies, from people who know them. | 11s |
| 10 | f-urgent | How we help | Something urgent? We'll get them seen tonight. | 9s |
| 11 | f-whole | How we help | One team that sees the whole picture. | 10s |
| 12 | employer | Getting started | Four-card rail. Phone splits into employer-a and employer-b. | 9s |
| 13 | people | How your people get care | Chat and booking, side by side. Phone uses people-chat then people-book. | 9s |
| 14 | people-after | How your people get care | Email, video visit, checklist. Same slide on both sizes. | 9s |
| 15 | privacy | Privacy | Two sample panels. Phone uses privacy-emp then privacy-you. | 9s |
| 16 | clinicians | Experience | Condition tiles, then practice chips. | 8s |
| 17 | proof | Proof | Counts, then three homepage reviews. Phone uses proof-nums then proof-revs. | 9s |
| 18 | close | Siya Health | See it live. One button: Submit an inquiry. | — |

Exact copy, timings and build order are in the prototype. Add a stable `id` to each slide when porting (used for analytics and deep links).

## 8. Handling change requests

Change requests will arrive as short specs, often with an updated prototype file. For each one:

1. If a new prototype file is provided, diff it against the current one and port only what changed.
2. Keep copy, numbers and labels within the guardrails in section 5.
3. Deploy to production and reply as described in section 1.

## 9. Acceptance checklist (every deploy)

- [ ] Intro: stars visibly drift before the click; "Click to begin" is readable; Skip/Mute hidden until play; wordmark stays particles with sparkle; tagline readable; sound plays after the click.
- [ ] Welcome and every playing slide fit at 1440×900 and 390×844 with nothing clipped or overlapping. Parked slides are not shown.
- [ ] Click completes builds, then advances. Back, Pause, Next, arrow keys and Space work.
- [ ] Numbers match `employer-pilot-facts.mjs`.
- [ ] Required labels present (section 5).
- [ ] No console errors apart from blocked ad/analytics requests.
- [ ] Tracking: GTM only on this page, no Meta pixel, `?review=1` works.
- [ ] Reduced motion works.
