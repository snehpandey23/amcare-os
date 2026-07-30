# Team admin (portal)

**Who:** Portal **Admin** accounts only (`/admin/team` in the staff app).

## What you can do

- **Invite** — create email + temporary password + **Staff** or **Admin** portal role
- **Email** — optional if `RESEND_API_KEY` is set on **siya-staff-assist** (checkbox on invite form). Otherwise **copy invite text** and send via Slack DM / Zoho / etc.
- **Change roles** — Staff ↔ Admin (not your own row; disabled while deactivated)
- **Edit** — **Edit name / reset password** on each row (optional new password, 8+ chars)
- **Deactivate** — blocks sign-in; progress kept. **Reactivate** restores access. You cannot deactivate yourself.
- **Track**
  - **Last sign-in** — updated on login and when the app refreshes your session
  - **HIPAA** — modules completed / total, final exam ready, time in course
  - **Level Up** — XP, streak, last active day
  - **Practice counts** — chat typing, US map/timezone/English, billing MCQs (after drills are completed post-deploy)

## How colleagues sign in

Same URL as everyone: production staff assist `/login`. No self-signup while `HIPAA_TRAINING_ALLOW_REGISTER=false`.

Share **link + email + temp password** securely. They should use a password manager.

## CLI alternative

```bash
cd integrations/hipaa-training-api
DATABASE_URL='…' node scripts/create-portal-user.mjs email pass 'Name' trainee
```

## Not in v1 yet

- Hard-delete users from the database
- Zoho SSO
- Hour-by-hour attendance / timesheets
- Export to CSV
