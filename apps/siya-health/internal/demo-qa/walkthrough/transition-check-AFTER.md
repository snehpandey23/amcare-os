# Transition check AFTER `debb1a07`

## Diagnose summary (fixed)
- Leave/enter state machine (LEAVING 280ms → hide/reset → ENTERING); builds start only on enter.
- Slide-scoped timers; cancelled on exit.
- Auto-advance = computeAdvanceMs(lastBuildEnd + dwell).
- Next: first click finishes builds; second advances. Debounced while tx≠idle.
- Back: re-enters at final state.

## Timing table — desk-1440

| id | hand data-dur | lastAt | buildEnd | advance (computed) |
|---|---:|---:|---:|---:|
| statement | 3200 | 1710 | 2410 | 4910 |
| p-time | 12700 | 10400 | 11200 | 14057 |
| p-away | 10500 | 5600 | 6400 | 17829 |
| p-familiar | 7800 | 4200 | 5000 | 9286 |
| p-response | 12500 | 11200 | 12000 | 18286 |
| p-whole | 8400 | 3040 | 3740 | 11169 |
| p-coord | 9000 | 5200 | 5900 | 8400 |
| question | 3700 | 2200 | 3000 | 7857 |
| turn | 7800 | 3600 | 4400 | 10114 |
| care-checklist | 9500 | 4200 | 4900 | 10900 |
| f-time | 7800 | 2800 | 3500 | 14071 |
| f-ways | 9800 | 2800 | 3600 | 9886 |
| f-response | 9200 | 5000 | 5800 | 10943 |
| f-urgent | 9000 | 5600 | 6400 | 15257 |
| f-whole | 9000 | 4200 | 5000 | 11857 |
| employer | 9000 | 7800 | 8600 | 13457 |
| journey | 16000 | 900 | 21800 | 24300 |
| outcomes | 8200 | 5600 | 6400 | 13257 |
| clinicians | 7200 | 3900 | 4600 | 9457 |
| cost | 9800 | 7200 | 8000 | 12571 |
| privacy | 7800 | 2800 | 3600 | 7029 |
| proof | 8000 | 1400 | 2200 | 4700 |
| close | 0 | 2500 | 3300 | 0 |

## Timing table — phone-390

| id | hand data-dur | lastAt | buildEnd | advance (computed) |
|---|---:|---:|---:|---:|
| statement | 3200 | 1710 | 2410 | 4910 |
| p-time | 12700 | 10400 | 11200 | 14057 |
| p-away | 10500 | 5600 | 6400 | 17829 |
| p-familiar | 7800 | 4200 | 5000 | 9286 |
| p-response | 12500 | 11200 | 12000 | 18286 |
| p-whole | 8400 | 2800 | 3500 | 10929 |
| p-coord | 9000 | 5200 | 5900 | 8400 |
| question | 3700 | 2200 | 3000 | 7857 |
| turn | 7800 | 3400 | 4200 | 9914 |
| care-checklist | 9500 | 4200 | 4900 | 10900 |
| f-time | 7800 | 2800 | 3500 | 14071 |
| f-ways | 9800 | 2800 | 3600 | 9886 |
| f-response | 9200 | 5000 | 5800 | 10943 |
| f-urgent | 9000 | 5600 | 6400 | 15257 |
| f-whole | 9000 | 4200 | 5000 | 11857 |
| employer | 9000 | 7800 | 8600 | 13457 |
| journey | 16000 | 900 | 21800 | 24300 |
| outcomes | 8200 | 5600 | 6400 | 13257 |
| clinicians | 7200 | 3900 | 4600 | 9457 |
| cost | 9800 | 7200 | 8000 | 12571 |
| privacy | 7800 | 2800 | 3600 | 7029 |
| proof-nums | 7000 | 1400 | 2200 | 4700 |
| close | 0 | 2500 | 3300 | 0 |

## Autoplay overlap
- desk: 0 prolonged overlap window(s)
- phone: 0 prolonged overlap window(s)

## Spam Next×10 / Back×5
- desk: visible=1 ids=p-whole chapter=Problem tx=idle
- phone: visible=1 ids=p-whole chapter=Problem tx=idle

## Result: PASS
