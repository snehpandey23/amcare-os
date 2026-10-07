# ROOT CAUSE: mobile text cut off at top (2nd occurrence)

**Date:** 2026-10-07 · **Evidence:** `scroll-diag-before.json` @ 390×664 Chromium

## Step 1 — Reproduce

| Viewport | Engine | scrollY ≠ 0? | Headline top &lt; 0? |
|---|---|---|---|
| 390×664 | Chromium | **No** (always 0) | **Yes** — f-ways, outcomes, p-time, p-whole, employer, cost |
| 375×553 | Chromium/WebKit | No | close (final) + tall frames |

**Founder slides (f-ways, outcomes) at 390×664 during autoplay builds:**

| Slide | scrollY | headTop | frameTop | frameH | align-content | transform |
|---|---:|---:|---:|---:|---|---|
| f-ways | 0 | **−25.8** | **−37.8** | 634 | **center** | _(empty)_ |
| outcomes | 0 | **−60.5** | **−72.5** | 703 | **center** | _(empty)_ |

Document/`scrollingElement` never moved. The page *looks* scrolled because the headline is above y=0 and clipped by `#tour { overflow:hidden }`.

## Step 2 — Audit (suspects)

### a) scrollIntoView / scrollTo / focus
| Site | File:line | Verdict |
|---|---|---|
| `pinChatThread` → `thread.scrollTop = …` | `employer-demo-prototype.html` ~3083–3084 | **OK** — scrolls only `.chat-thread` |
| `chatThread.scrollTop=0` on enter | ~3404 | **OK** |
| `scrollIntoView` in demo | — | **None** in prototype/demo.html |
| Inquiry `#inquiry-heading` | close/Talk links leave the tour | N/A mid-tour |
| Playwright `scrollIntoViewIfNeeded` on `#pause` | QA only | Can scroll docs in tests; not production |

### b) Height sizing
| Site | Notes |
|---|---|
| `html,body{height:100%}` (shipped demo.html) | Layout viewport, not visual; no `--vh` |
| `#stage` / `#tour` `position:fixed;inset:0` | Covers layout viewport; can extend under browser chrome |
| `100vh` on walk phone (prototype partially → `--vh`) | Secondary |
| `#f-time` `max-height:calc(100dvh - 110px)` | Local only |

### c) Can html/body scroll?
- `body{overflow:hidden}` yes; **`html` had no overflow:hidden** in shipped demo
- Probe: `window.scrollTo(200)` → stayed 0 when scrollHeight===clientHeight
- **scrollY was never the failure mode in repro**

### d) Content taller than stage / no fit
| Site | File:line | Verdict |
|---|---|---|
| `.slide{align-content:center; place-items:center}` | ~74–75 | **PRIMARY** — centers oversized `.frame`, drives `frameTop`/`headTop` negative |
| `article.slide[data-vcenter]{justify-content:center}` (flex) | ~1204–1206 | **PRIMARY for close** — flex center ignores `alignContent` JS; still clips on short phones |
| `article.slide[data-vcenter] .frame{transform:none!important}` | ~1209–1211 | **PRIMARY for close** — blocked `fitFrame` scale entirely |
| `fitFrame` skips `data-vcenter` (pre-fix) | ~3352–3355 | Never scaled text-light slides |
| `fitFrame` refuses `scale < 0.82` (pre-fix) | ~3367 | Leaves overflow unscaled |
| `scheduleFit` once per slide (`if(fitFor===cur)return`) | ~3372 | **PRIMARY** — early fit before builds grow height; later chat/charts never re-fit |
| Phone CSS `align-content:start` (partial prototype) | not in shipped demo.html | Never regenerated |

### e) Address-bar resize
- Mid-slide `setViewportSize(h-80)` → p-time `headTop=-82`, close `frameTop<0`
- No listener re-running fit on `visualViewport` resize in shipped build

## Step 3 — Root cause (with evidence)

**Primary:** Tall phone slides use **CSS grid vertical centering** (`align-content: center`) inside `#tour { overflow: hidden }`. When `.frame` height (f-ways ~634px, outcomes ~703px) exceeds the visible area above the bar (~560px at 390×664), the browser centers the frame → **headline top becomes negative** → clipped. `scrollY` stays 0, so it looks like “scrolled under the URL bar.”

**Secondary:** `fitFrame` / `scheduleFit` do not keep up — one early fit (or skip), no re-fit as builds add height; scale floor 0.82 aborts; vcenter slides skipped.

**Why the earlier fix missed it:** Collision/smoke used tall phones (390×844 / 360×800); gates checked bar overlap / stage overflow, not `headline.getBoundingClientRect().top < 0`; `showSlide(final)` paths differed from autoplay build growth; prototype viewport tweaks were never written into `employers/demo.html`.

## Step 4–5 — Fix + permanent gate (this ship)

- Lock document scroll; `--vh` from `visualViewport`; phone slides top-align + scale-to-fit on every build; control bar icons; outcomes compact; `no-scroll-visible-top` gate + deploy refuse.

### Fixed call sites
| Change | Where |
|---|---|
| `html,body` `overflow:hidden; height:100dvh/svh; overscroll-behavior:none`; `body{position:fixed;inset:0}` | prototype CSS ~22–25 |
| `#stage` / `#tour` `100dvh` + `--vh` | ~25, ~72 |
| Phone `.slide{align-content:start}` | ~1252 |
| Phone `data-vcenter` → `justify-content:flex-start` (was `center`) | ~1253–1256 |
| Removed `transform:none!important` on vcenter `.frame` | ~1209–1211 |
| Close phone compact (next-steps / gaps) | ~1257–1260 |
| `fitFrame`: always top-align + `justifyContent:flex-start` + scale floor 0.42; re-fit; padding nudge | ~3388–3428 |
| `scheduleFit` every build reveal (no once-per-slide skip) | ~3421+, enterSlide revealChat |
| `pinChatThread` / chat enter: `scrollTop` only (no `scrollIntoView`) | ~3119, ~3458 |
| Runtime: `scrollY≠0` → `scrollTo(0)` + `employer_demo_error` | ~3570–3578 |
| `setVh` + `visualViewport`/`resize` → `scheduleFit(true)` | ~2289–2291 |
| Phone control bar icons + chapter line + Talk float | bar CSS / `syncBarIcons` |
| Outcomes phone: dual panels + Start under dot | outcomes CSS |
| Gate `no-scroll-gate.mjs` in `release-gates.mjs` + deploy refuse | QA + `scripts/deploy-siya-health.sh` |

### Gate before / after
| | Result |
|---|---|
| **Before** (`scroll-diag-before.json` @ 390×664) | f-ways `headTop≈−26`, outcomes `headTop≈−60`; mid-gate after partial fix: **22** failures (all `close`, flex-center + `transform:none!important`) |
| **After** | `no-scroll-gate.mjs` → **Failures: 0** (Chromium 5 views + WebKit toolbar heights; build/final/resize/pause/play/bar/nav) |

Contact sheet: `internal/demo-qa/walkthrough/contact-phone-390x664.html`
