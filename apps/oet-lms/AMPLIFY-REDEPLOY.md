# OET LMS – Redeploy to AWS Amplify (after app was deleted)

Use this when you’ve had to create a **new** Amplify app (e.g. the previous one was deleted).

---

## 1. Connect and build

1. **AWS Console** → **AWS Amplify** → **New app** → **Host web app**.
2. **GitHub** → choose repo **snehpandey23/amcare-os**, branch **main** → **Next**.
3. Amplify will use **amplify.yml** from the repo (builds `@amcare/oet-lms`, outputs `dist`). Click **Next** → **Save and deploy**.
4. Wait for the first build to finish (green check). Your app URL will be like `https://main.xxxxx.amplifyapp.com`.

---

## 2. SPA redirect (fix “not found” on /simulator, /progress, etc.)

1. In Amplify: left menu **Hosting** → **Rewrites and redirects** → **Edit** / **Manage redirects**.
2. Add a rule:
   - **Source:** `/<*>`
   - **Target:** `/index.html`
   - **Type:** **Rewrite (200)** or **200 - Rewrite**
3. Save. Then **Redeploy this version** (or push a commit) so the change applies.

---

## 3. Sign-in / Create account (backend)

To make login and registration work:

1. Your **Submissions API** must be deployed and reachable (e.g. Railway) with **DATABASE_URL** and **JWT_SECRET** set.
2. In Amplify: **App settings** → **Environment variables** → **Manage variables**.
3. Add:
   - **Name:** `VITE_API_ORIGIN`
   - **Value:** your API base URL **including** `/api`, e.g. `https://your-app.up.railway.app/api` (no trailing slash).
4. **Save**, then **Redeploy this version**. Sign-in and Create account will use this API.

---

## Quick reference

| Step | Where | What |
|------|--------|------|
| Build | amplify.yml (repo) | Builds OET LMS from monorepo, outputs `dist` |
| Redirect | Hosting → Rewrites and redirects | `/<*>` → `/index.html` (200 Rewrite) |
| Auth | App settings → Environment variables | `VITE_API_ORIGIN` = `https://your-api-url/api` |

After redeploy, open the app URL and do a hard refresh (Cmd+Shift+R / Ctrl+Shift+R) to see the latest UI and theme.

---

## If you see "Registration failed"

1. **"Email already registered. Sign in instead."**  
   That email has an account. Use **Sign in** (and the same password), or use a different email to create an account.

2. **"Database not ready" or "Service temporarily unavailable"**  
   The Submissions API can’t use the database. On **Railway** (or wherever the API runs):
   - Confirm **DATABASE_URL** is set on the **app** service (the Postgres connection string).
   - Confirm **JWT_SECRET** is set.
   - In **Deploy logs**, check for errors like "Database init failed" or "relation lms_users does not exist". The API creates tables on startup when DATABASE_URL is set.

3. **"Can't connect to the server"**  
   The frontend can’t reach the API. In Amplify, set **VITE_API_ORIGIN** to your API URL including `/api` (e.g. `https://your-app.up.railway.app/api`), then **Redeploy this version**.
