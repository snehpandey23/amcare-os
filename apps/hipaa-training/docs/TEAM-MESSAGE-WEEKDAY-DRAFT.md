# Weekday team messages (Mon–Fri) — content + Feedback Friday

**Status:** Copy **approved** · Feedback Friday live · Weekday + lead-digest crons must be registered on **siya-staff-assist** via CLI deploy using `vercel.siya-staff-assist.json` (confirm with `vercel crons list --project siya-staff-assist`).

## Cron (staff app)

| Item | Value |
|------|--------|
| Route | `GET/POST /api/cron/weekday-team-messages` |
| Schedule | Mon–Fri **09:00 IST** (`30 3 * * 1-5` UTC) |
| Lead digest | `GET/POST /api/cron/lead-gap-digests` · Mondays **12:00 UTC** (`0 12 * * 1`) |
| Config | `vercel.siya-staff-assist.json` (used by `scripts/deploy-staff-portal.sh --local-config`) |

## Delivery modes (`SIYA_WEEKDAY_EMAIL_MODE`)

| Mode | Behavior |
|------|----------|
| **pilot** | Only `SIYA_WEEKDAY_PILOT_TO` (default `qa-test@siya.health`) |
| **live** (production) | All signed-in staff (`last_login_at` set, not deactivated) |
| **dry_run** | Preview only, no Resend |
| **test_recipient** | Resend → `SIYA_WEEKDAY_TEST_TO` / `SIYA_ESCALATION_TEST_TO` |

**Promoted 2026-08-27:** `SIYA_WEEKDAY_EMAIL_MODE=live` on **siya-staff-assist** production. First live send (Thoughtful Thursday) delivered to 7 real staff + QA; see `.cursor-verify/weekday-live-send.json`.

## Verify

```bash
CRON_SECRET='…' npx tsx apps/hipaa-training/scripts/verify-weekday-team-messages.ts
# Manual cron (pilot, all 5 themes):
curl -X POST "https://siya-staff-assist.vercel.app/api/cron/weekday-team-messages?verifyAllThemes=1&mode=pilot&skipMark=1" \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Cadence recommendation

Continue **five weekdays** for everyone. Heavy users get tip/check-in variants — they do **not** “graduate out” of mail.

## Usage segments (existing data only)

| Segment | Signal | Tone |
|---------|--------|------|
| **New / light Ask** | No Ask turns (or none in ~30d) | Gentle intro + theme |
| **Regular Ask** | Recent Ask activity | Warm tip / deeper prompt |
| **Practice-active, Ask-light** | Level-up / drills, little Ask | Bridge Practice ↔ Ask where relevant |

---

## Draft copy — all five themes

Placeholders: `{firstName}` · `{portalUrl}` · `{practiceUrl}` · `{feedbackUrl}`

### Motivational Monday

**New / light**  
Subject: A steady start to the week  

Hi {firstName} — from your Siya Assist.  
Whatever this week throws at you, you don’t have to hold every answer alone. When something’s fuzzy mid-shift, Ask on My day is here in plain language.  
One small question is enough to start: {portalUrl}

**Regular**  
Subject: You’ve got this week  

Hi {firstName} — quick Monday note from Siya Assist.  
You’re already using Ask when work gets sticky — keep that rhythm. If you want a quieter stretch, try **Focus** on My day so it’s just priorities + chat.  
I’m here when you need me: {portalUrl}

---

### Therapeutic Tuesday

**New / light**  
Subject: A soft pause mid-week  

Hi {firstName}.  
Tuesdays can stack fast. Take one breath before the next ping — you’re allowed a short reset.  
When you’re ready for work questions again, Ask is waiting without judgment: {portalUrl}

**Regular**  
Subject: Care for the person doing the work  

Hi {firstName}.  
You’re showing up for patients and teammates — leave a little room for yourself today, even five quiet minutes.  
If work noise creeps back in, I’m still here on My day: {portalUrl}

---

### Working Wednesday

**New / light**  
Subject: One skill rep for today  

Hi {firstName}.  
Midweek is a good day for one small Practice drill — typing, culture, or healthcare terms — so the next real shift feels easier.  
Try a short one here: {practiceUrl}  
Work questions still live on Ask: {portalUrl}

**Regular**  
Subject: Build one muscle today  

Hi {firstName}.  
You’re already asking solid work questions — pair that with one **Learn → Practice** drill this week (typing speed or culture trivia both count).  
Open Practice: {practiceUrl}

---

### Thoughtful Thursday

**New / light**  
Subject: One reflection before Friday  

Hi {firstName}.  
Before the week closes, what’s one thing that went smoother than you expected? No essay — just notice it.  
If a work question is still open, bring it to Ask: {portalUrl}

**Regular**  
Subject: What are you carrying into Friday?  

Hi {firstName}.  
What’s one decision or handoff you’d like clearer tomorrow? Naming it is enough — Ask can help unpack the SOP side when you’re ready.  
My day: {portalUrl}

---

### Feedback Friday

**All segments (same theme; CTA = form)**  
Subject: A kindness for someone on the team  

Hi {firstName}.  
Fridays are for appreciation and honest, useful feedback — to a peer or to a lead.  
You’ll choose every time: **share your name**, or **send anonymously**. Anonymous means they see the note with no name, team, or other clues about who wrote it.  
Give feedback: {feedbackUrl}

---

## Feedback Friday — product rules (shipped)

1. Per submission: name shared **or** anonymous (not a global setting).  
2. Anonymous recipient view: **no** giver name, email, team, or user id.  
3. Giver account stored **internally** for abuse/moderation only.  
4. Recipient + normal admin views of inbox use the same stripped payload.  
5. Abuse investigation: separate admin moderation path only.  
6. Lightweight harassment/profanity filter — reject before delivery.

### Routes

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/team-feedback/directory` | Peers + leads for picker |
| POST | `/api/team-feedback` | Submit |
| GET | `/api/team-feedback/inbox` | Recipient inbox (stripped) |
| GET | `/api/admin/team-feedback/moderation/:id` | Admin abuse path only (includes giver) |

Staff UI: `/feedback`
