# Employee portal on Vercel — step by step

You need **two Vercel projects** (staff app + auth API) and **one Postgres database** (Neon via Vercel is easiest).

---

## What is already done

The **staff app** was deployed to production:

- **URL:** [https://siya-staff-assist.vercel.app](https://siya-staff-assist.vercel.app)
- **CLI (from repo root):**
  ```bash
  npx vercel deploy --prod --yes --project siya-staff-assist --local-config vercel.siya-staff-assist.json
  ```

Login will **not** work until you finish the steps below (API + env vars).

---

## Part A — Postgres (Neon) on Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your team → **Storage** (or **Integrations**).
2. **Add Integration** → **Neon** (Postgres).
3. Create a database (e.g. name `siya-staff-portal`).
4. Connect it to the project you will use for the **auth API** (create that project in Part B first if needed), or copy **`DATABASE_URL`** from Neon’s dashboard for use in Part C.

Keep **`DATABASE_URL`** private — only set it on the API project, never in the Next.js public env.

---

## Part B — Deploy the auth API (new Vercel project)

1. **Create project**
   - Dashboard → **Add New…** → **Project**
   - Import the same Git repo (`amcare-os`) *or* use CLI only (below).

2. **Project settings** (Settings → General):
   - **Project name:** e.g. `siya-staff-auth-api`
   - **Root Directory:** `integrations/hipaa-training-api`
   - **Framework Preset:** Other
   - **Node.js:** 20.x (recommended)

3. **Build settings** (should match `integrations/hipaa-training-api/vercel.json`):
   - Install: `cd ../.. && npm install`
   - Build: `cd ../.. && npm run build -w @amcare/hipaa-training-api`

4. **Environment variables** (Settings → Environment Variables) — **Production**:

   | Name | Value |
   |------|--------|
   | `DATABASE_URL` | From Neon (Part A) |
   | `JWT_SECRET` | Long random string (e.g. `openssl rand -hex 32`) |
   | `CORS_ORIGIN` | `https://siya-staff-assist.vercel.app` |
   | `HIPAA_TRAINING_ALLOW_REGISTER` | `false` |
   | `HIPAA_TRAINING_ADMIN_EMAIL` | Your admin email (gets `admin` role on register if you ever enable register) |

5. **Deploy** → Deployments → Redeploy, or from the API package (preferred):

   ```bash
   cd integrations/hipaa-training-api && npx vercel deploy --prod --yes
   ```

   Do **not** rely on `vercel.hipaa-training-api.json` from the monorepo root unless Vercel Root Directory is locked to `integrations/hipaa-training-api` — otherwise production can build the Next staff app into this project.

   Legacy from repo root (only if dashboard root is correct):

   ```bash
   cd /Users/sp/amcare-os
   npx vercel link --project siya-staff-auth-api   # first time: create this project in the dashboard, set Root Directory first
   npx vercel deploy --prod --yes --project siya-staff-auth-api --local-config vercel.hipaa-training-api.json
   ```

   In the dashboard, **Root Directory** for this project must be `integrations/hipaa-training-api` before the first deploy.

6. **Smoke test** — open in browser:

   `https://YOUR-API-PROJECT.vercel.app/api/health`

   Expect JSON like: `{ "ok": true, "database": "configured", ... }`.

   If `database` is `not configured`, fix `DATABASE_URL` on the API project and redeploy.

---

## Part C — Wire the staff app (existing project)

Project: **`siya-staff-assist`**

1. Vercel → **siya-staff-assist** → **Settings** → **Environment Variables** → **Production**:

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_HIPAA_TRAINING_API_URL` | `https://YOUR-API-PROJECT.vercel.app` (no trailing slash) |
   | `NEXT_PUBLIC_SIYA_PORTAL_REQUIRE_LOGIN` | `1` |
   | `NEXT_PUBLIC_HIPAA_TRAINING_ALLOW_REGISTER` | `false` |

   Do **not** put `DATABASE_URL` or `JWT_SECRET` on the Next.js project.

2. **Redeploy** the staff app (env vars apply only after redeploy):
   ```bash
   cd /Users/sp/amcare-os
   npx vercel deploy --prod --yes --project siya-staff-assist --local-config vercel.siya-staff-assist.json
   ```

3. Visit [https://siya-staff-assist.vercel.app/login](https://siya-staff-assist.vercel.app/login) — you should see the sign-in form (not “not configured”).

---

## Part D — Create your first employee account

From your laptop (with `DATABASE_URL` in env — same Neon URL):

```bash
cd /Users/sp/amcare-os/integrations/hipaa-training-api
DATABASE_URL='postgresql://...' node scripts/create-portal-user.mjs you@siyahealth.com 'YourSecurePass123!' 'Your Name' admin
```

Then sign in at [https://siya-staff-assist.vercel.app/login](https://siya-staff-assist.vercel.app/login).

---

## Part E — Optional hardening (pilot)

- **Vercel → siya-staff-assist → Settings → Deployment Protection** — password or SSO for the whole preview/production URL while you pilot.
- Keep **Internal Preview** banner and `/trust` for leadership.

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Login page says sign-in not configured | Set `NEXT_PUBLIC_HIPAA_TRAINING_API_URL` on **siya-staff-assist** and redeploy |
| Browser CORS error on login | `CORS_ORIGIN` on API must exactly match `https://siya-staff-assist.vercel.app` |
| `/api/health` shows database not configured | Set `DATABASE_URL` on **API** project only; redeploy API |
| 404 on API routes | API project **Root Directory** must be `integrations/hipaa-training-api` |
| Gate / KB score blocks deploy | Expected for wide rollout; CLI deploy still works; see `docs/DEPLOYMENT-GATE.md` |

---

## Order summary

1. Neon DB  
2. Deploy **auth API** + env  
3. Set **staff app** env + redeploy  
4. Create user script  
5. Sign in  

See also: [SETUP-EMPLOYEE-PORTAL-SIMPLE.md](./SETUP-EMPLOYEE-PORTAL-SIMPLE.md)
