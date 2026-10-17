# Known issues

## Phone settle signal can stick after a long gate session

2026-10-17. The second settle run in a long suite failed once: phone 390×664, `e1-time`, sound on, playing, Next, generation stayed at 73. Load at the start of that run was 1.25, and 4.35 at the end. The same settle had passed minutes earlier with an end load of 7.04.

Isolated reruns the same day, with the 1-minute load held under 4, did not reproduce it:

- Next from `proof-nums` onto `e1-time`, sound on, phone: 0/10 on production, 0/10 on `3b0de794`. Scale stayed 1, the frame did not overlap the bar, and `fitFrame()` ran.
- Next while already on `e1-time`: 0/10 and 0/10.

`3b0de794` changes only the 14 clip files and their duration numbers. The player matches production. Treated as a non-reproducible long-session race, not a clip regression. Likely Next pressed while the previous slide's leave transition or clip handoff is still running.

Follow-up, not a release gate: `long-session-settle.mjs` keeps one phone page, sound on, and drives every slide twice without reloading.
