# Employee portal — simplest setup (v1)

Internal staff app: **email + password** against the existing **`hipaa-training-api`** (Postgres + JWT). No Zoho SSO in v1.

## What you get

| Piece | Behavior |
|--------|----------|
| **Login** | `/login` when API URL is set |
| **Full portal gate** | Set `NEXT_PUBLIC_SIYA_PORTAL_REQUIRE_LOGIN=1` — home, Ask, Level Up, and training all require sign-in |
| **Pause onboarding (pilot)** | Set `NEXT_PUBLIC_SIYA_PORTAL_PAUSE_ONBOARDING=1` — sign-in goes straight to My day; wizard optional later |
| **Training-only gate** | Omit portal flag; set `NEXT_PUBLIC_HIPAA_TRAINING_REQUIRE_AUTH=true` — only `/training/*` requires login |
| **Progress** | HIPAA course + Level Up sync to Postgres after login |
| **Invite-only** | `HIPAA_TRAINING_ALLOW_REGISTER=false` on API (default) — admins create accounts |

## 1. Database (Neon or any Postgres)

Create a database and set on the **API** service:

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=<long-random-string>
CORS_ORIGIN=https://siya-staff-assist.vercel.app
HIPAA_TRAINING_ALLOW_REGISTER=false
```

Deploy **`integrations/hipaa-training-api`** (Railway, Render, Fly, or Vercel serverless if you already wired it). On first start, tables are created automatically.

## 2. Staff app (Vercel)

On **`apps/hipaa-training`** (siya-staff-assist):

```bash
NEXT_PUBLIC_HIPAA_TRAINING_API_URL=https://your-api.example.com
NEXT_PUBLIC_SIYA_PORTAL_REQUIRE_LOGIN=1
# Optional: mirror API register policy in UI (usually false)
NEXT_PUBLIC_HIPAA_TRAINING_ALLOW_REGISTER=false
```

Redeploy the Next app after env changes.

## 3. Create the first user

**Option A — script (local, needs `DATABASE_URL`):**

```bash
cd integrations/hipaa-training-api
node scripts/create-portal-user.mjs admin@siyahealth.com "TempPass123!" "Admin User" admin
```

**Option B — temporary self-register:** set `HIPAA_TRAINING_ALLOW_REGISTER=true` on API + `NEXT_PUBLIC_HIPAA_TRAINING_ALLOW_REGISTER=true` on the app, register once, then turn both off.

**Option C — SQL:** insert into `hipaa_training_users` with a bcrypt hash (use the script instead).

First admin: pass role `admin` in the script so you can use `/api/admin/training/summary` later.

## 4. Local dev

```bash
# Terminal 1 — API
cd integrations/hipaa-training-api
cp .env.example .env   # fill DATABASE_URL, JWT_SECRET, CORS_ORIGIN=http://localhost:3000
npm run dev

# Terminal 2 — app
cd apps/hipaa-training
NEXT_PUBLIC_HIPAA_TRAINING_API_URL=http://localhost:8787 \
NEXT_PUBLIC_SIYA_PORTAL_REQUIRE_LOGIN=1 \
npm run dev
```

## 5. Phase 2 (not v1)

- Zoho / Google SSO
- Vercel Deployment Protection + pilot allowlist
- HRIS-driven provisioning

## Troubleshooting

- **Login page says “not configured”** — `NEXT_PUBLIC_HIPAA_TRAINING_API_URL` missing on Vercel or not redeployed.
- **CORS errors** — `CORS_ORIGIN` on API must exactly match the browser origin (no trailing slash).
- **Level Up resets on new device** — sign in; progress pulls from `level_up_json` on login.
