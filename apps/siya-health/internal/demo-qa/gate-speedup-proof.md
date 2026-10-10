# Gate settle proof

The collision gate’s fast and slow paths use one settle wait. A missing signal fails that wait on both the collision fixture and the no-scroll fixture.

## Equivalence

`git diff` of `internal/demo-qa/collision-check.mjs` against the committed file replaces the split delay with one wait. The old code was not the same on the two paths:

```
-    const wait = FAST ? 350 : ((id === 'p-away' || id === 'p-coord' || id === 'f-time') ? 6500 : 4000);
-    await slidePage.waitForTimeout(wait);
+    try {
+      await slidePage.waitForFunction((n) => (window.__slideSettled?.gen || 0) > n, before, { timeout: 2000 });
+    } catch (e) {
+      failures.push({ slideId: id, viewport: `${w}x${h}`, type: 'not-settled', err: String(e.message || e) });
```

`before` is read once, above that wait, for every viewport. `FAST` does not choose a different predicate. After the wait, both paths call the same `check()`.

The signal is `window.__slideSettled`. `scheduleFit` queues one settle and does not clear it when a later beat asks again. The generation increments only after the fonts are ready, slide images have decoded, the running build animations and transitions have finished (or 1.1s, so a loop cannot hold it), then `fitFrame()` plus 80 ms. A deep link, `showSlide`, next, back, and resize each call `scheduleFit`. The entering lock uses a wall-clock timer, including while paused, so a paused `showSlide` cannot leave the next deep link queued forever.

`no-scroll-gate.mjs` reads `__slideSettled.gen` before `playSlideDeepLink`, `showSlide`, resize, next, and back, then waits for a greater value. Its slow path still samples the build at 300 / 1200 / 2400 ms before the final `showSlide` wait.

## Diagnosis, 2026-10-10

On the current build, e1-time with the old fixed 6500 ms wait: 0 overlaps at every phone and desktop viewport. The settle signal was sampling the “With Siya” card during its 700 ms entrance, not a layout overlap from the shorter clip.

Production `63a04478` does not set `__slideSettled`. The same settle wait on that file is `not-settled` at all 8 viewports, so it never reaches the overlap check.

## Mutation check

Page: generated `employers/demo.html?review=1`. The property `__slideSettled` was frozen so writes do nothing and `gen` stays 0. Predicate: `(window.__slideSettled?.gen || 0) > before`, timeout 2000 ms. Playwright, 2026-10-09.

| Fixture | Call | Result |
|---|---|---|
| Collision | `showSlide('p-time')` | timeout. Failed. |
| No-scroll | `playSlideDeepLink('p-away', { playBuild: true })` | timeout. Failed. |

Both fixtures fail when the signal cannot change. The wait does not pass because time elapsed.
