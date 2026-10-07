# Transition check AFTER `8e58be98`

## Diagnose summary (fixed)
- Leave/enter state machine (LEAVING 280ms → hide/reset → ENTERING); builds start only on enter.
- Slide-scoped timers; cancelled on exit.
- Auto-advance = computeAdvanceMs(lastBuildEnd + dwell).
- Next: first click finishes builds; second advances. Debounced while tx≠idle.
- Back: re-enters at final state.

## Timing table — desk-1440

| id | hand data-dur | lastAt | buildEnd | advance (computed) |
|---|---:|---:|---:|---:|
| statement | 0 | 2412 | 3112 | 6432 |
| p-time | 0 | 4556 | 5356 | 8576 |
| p-away | 0 | 4824 | 5624 | 10720 |
| p-familiar | 0 | 2680 | 3380 | 6432 |
| p-response | 0 | 4288 | 5088 | 10720 |
| p-whole | 0 | 4020 | 4720 | 8576 |
| p-coord | 0 | 5896 | 6996 | 8576 |
| question | 0 | 1608 | 2408 | 6432 |
| turn | 0 | 4288 | 4988 | 10720 |
| care-checklist | 0 | 3216 | 3916 | 8576 |
| f-time | 0 | 4288 | 4988 | 10720 |
| f-ways | 0 | 3752 | 4552 | 8576 |
| f-response | 0 | 3752 | 4552 | 8576 |
| f-urgent | 0 | 4020 | 4820 | 8576 |
| f-whole | 0 | 2680 | 3480 | 8576 |
| employer | 0 | 3216 | 3916 | 8576 |
| journey | 0 | 1608 | 8304 | 12864 |
| outcomes | 0 | 4288 | 5120 | 10720 |
| clinicians | 0 | 5360 | 6060 | 10720 |
| cost | 0 | 3216 | 4016 | 8576 |
| privacy | 0 | 3752 | 4552 | 8576 |
| proof | 0 | 2680 | 3380 | 6432 |
| close | 0 | 3216 | 4016 | 0 |

## Timing table — phone-390

| id | hand data-dur | lastAt | buildEnd | advance (computed) |
|---|---:|---:|---:|---:|
| statement | 0 | 2412 | 3112 | 6432 |
| p-time | 0 | 4556 | 5356 | 8576 |
| p-away | 0 | 4824 | 5624 | 10720 |
| p-familiar | 0 | 2680 | 3380 | 6432 |
| p-response | 0 | 4288 | 5088 | 10720 |
| p-whole | 0 | 3484 | 4184 | 8576 |
| p-coord | 0 | 2144 | 2944 | 4288 |
| question | 0 | 1608 | 2408 | 6432 |
| turn | 0 | 4288 | 4988 | 10720 |
| care-checklist | 0 | 3216 | 3916 | 8576 |
| f-time | 0 | 4288 | 4988 | 10720 |
| f-ways | 0 | 3752 | 4552 | 8576 |
| f-response | 0 | 3752 | 4552 | 8576 |
| f-urgent | 0 | 4020 | 4820 | 8576 |
| f-whole | 0 | 2680 | 3480 | 8576 |
| employer | 0 | 3216 | 3916 | 8576 |
| journey | 0 | 1608 | 8304 | 12864 |
| outcomes | 0 | 4288 | 5120 | 10720 |
| clinicians | 0 | 5360 | 6060 | 10720 |
| cost | 0 | 3216 | 4016 | 8576 |
| privacy | 0 | 3752 | 4552 | 8576 |
| proof-nums | 0 | 2680 | 3380 | 6432 |
| close | 0 | 3216 | 4016 | 0 |

## Autoplay overlap
- desk: 0 prolonged overlap window(s)
- phone: 0 prolonged overlap window(s)

## Spam Next×10 / Back×5
- desk: visible=1 ids=p-whole chapter=Problem tx=idle
- phone: visible=1 ids=p-whole chapter=Problem tx=idle

## Result: PASS
