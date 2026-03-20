# Amplify setup – OET LMS (Siya Health)

Step-by-step setup so the app builds, deploys, and sign-in works on your Amplify URL.

---

## 1. Connect the repo (if not already)

1. Open **AWS Console** → **Amplify** → **New app** → **Host web app**.
2. Choose **GitHub** (or your provider), pick **snehpandey23/amcare-os**, branch **main**.
3. Amplify will detect the repo and use the **amplify.yml** at the root. Do **not** change the build spec unless you know what you’re doing.
4. Click **Save and deploy** and wait for the first build.

---

## 2. SPA redirect (required for /simulator, /login, etc.)

Without this, opening `https://your-app.amplifyapp.com/simulator` or `/login` directly will show 404.

1. In Amplify, open your app → **Hosting** (left) → **Rewrites and redirects**.
2. Click **Manage redirects** (or **Edit**).
3. Add a **single rule** (or replace existing with this):

   - **Source address:** ` /<<*>> ` (space, slash, two angle brackets, asterisk, two angle brackets)
   - **Target address:** ` /index.html `
   - **Type:** **Rewrite (200)**

   Or paste this in the **JSON editor** (if available):

   ```json
   [{"source": "/<<*>>", "status": "200", "target": "/index.html", "condition": null}]
   ```

   A reference copy is in this repo: **amplify-redirects.json**.

4. Save. New deployments will use this so routes like `/`, `/simulator`, `/login`, `/progress` all serve the app.

---

## 3. Environment variables (for sign-in and live chat)

The app needs your **API URL** in production so sign-in and “Send to supervisor” work.

1. In Amplify: **App settings** (left) → **Environment variables**.
2. Click **Manage variables** → **Add variable**.
3. Add:

   | Name                 | Value                    | Notes |
   |----------------------|--------------------------|--------|
   | `VITE_API_ORIGIN`    | `https://your-api-url.com` | Submissions API (auth + sessions). Required for sign-in. |
   | `VITE_CHAT_WS_ORIGIN`| `wss://your-chat-ws.com/chat-ws` | Optional. Live AI chat WebSocket URL. |

   Replace with your real URLs when you deploy the backends (see below).

4. Save. Then trigger a **new build** (e.g. **Redeploy this version** or push a commit) so the new env vars are baked into the build.

**If you don’t set `VITE_API_ORIGIN` yet:**  
The app will still load, but **Sign in** and **Create account** will fail (network error) until you deploy the submissions API and set this variable.

---

## 4. Deploying the backends (so sign-in works)

The frontend on Amplify is static. Auth and sessions come from **oet-lms-submissions** (Node API + PostgreSQL).

- **Option A – Same AWS account:**  
  Deploy **oet-lms-submissions** (e.g. App Runner, Elastic Beanstalk, or Lambda + API Gateway). Set **DATABASE_URL** and **JWT_SECRET** for that service. Then set **VITE_API_ORIGIN** in Amplify to that API’s public URL (e.g. `https://xxxxx.us-east-1.awsapprunner.com`).

- **Option B – Run API elsewhere:**  
  Host the submissions API on any server (Railway, Render, etc.), create a PostgreSQL DB, set **DATABASE_URL** and **JWT_SECRET**, then set **VITE_API_ORIGIN** in Amplify to that API’s URL.

After **VITE_API_ORIGIN** is set and you redeploy the app, sign-in and personalized feedback will work on the Amplify URL.

---

## 5. Summary checklist

- [ ] App is connected to **amcare-os** (branch **main**).
- [ ] Build uses **amplify.yml** and completes successfully.
- [ ] **Rewrites and redirects**: one rule ` /<<*>> ` → ` /index.html `, type **200**.
- [ ] **Environment variables**: `VITE_API_ORIGIN` (and optionally `VITE_CHAT_WS_ORIGIN`) set, then **Redeploy**.
- [ ] Submissions API deployed and **VITE_API_ORIGIN** points to it (for sign-in).

Your live app URL will be like: **https://main.xxxxx.amplifyapp.com**
