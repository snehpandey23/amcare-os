# Step 2: Deploy the submissions API so sign-in works

The live app needs a **server** that handles sign-in and saves progress. This guide gets that server online and gives you a URL to put in Amplify.

You need two things:
1. A **database** (PostgreSQL) for users and sessions.
2. The **API** (Node app) running on the internet.

We’ll use **Railway** (one place for both, free tier). If you prefer not to use Railway, see “Alternative: Render” at the end.

---

## Part A: Create a PostgreSQL database (Railway)

**Step 1.** Go to **https://railway.app** in your browser and sign in (GitHub is fine).

**Step 2.** Click **New Project**.

**Step 3.** Click **Add a plugin** or **Provision** → choose **PostgreSQL**. Railway will create a database and show it in the project.

**Step 4.** Click the **Postgres** service. Open the **Variables** or **Connect** tab. You’ll see **DATABASE_URL** (or something like `POSTGRES_URL`). Copy the full value. It looks like:
`postgresql://user:password@host:port/railway`
Save it somewhere safe; you’ll need it in Part B.

---

## Part B: Deploy the submissions API (Railway)

**Step 5.** In the same Railway project, click **New** → **GitHub Repo** (or **Deploy from GitHub**). If it asks, connect your GitHub account and choose the repo **snehpandey23/amcare-os**.

**Step 6.** Railway may ask “Which branch?” Choose **main**. It may ask “Root directory” or “Monorepo”:
- If you see **Root directory**, set it to: **integrations/oet-lms-submissions**
- If you see a list of services, choose the one that points to **oet-lms-submissions** or set the root to **integrations/oet-lms-submissions**

**Step 7.** After the service is created, click the **submissions** (or **oet-lms-submissions**) service. Go to **Settings** or **Variables**.

**Step 8.** Add these **variables** (use “Add variable” or “Raw Editor”):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Paste the URL you copied in Step 4 (the Postgres URL from Railway). |
| `JWT_SECRET` | Any long random string (e.g. 32+ letters/numbers). Example: `mySecretKey123ChangeThisToRandomString` |

**Step 9.** In **Settings**, find **Build** or **Build Command**. Set:
- **Build command:** `npm install && npm run build`
- **Start command** or **Start:** `node dist/index.js`
- **Root directory:** `integrations/oet-lms-submissions` (if not already set).

**Step 10.** In **Settings**, find **Networking** or **Public networking**. Turn on **Generate domain** or **Public URL** so Railway gives you a URL like `https://xxxxx.up.railway.app`.

**Step 11.** Save. Railway will build and deploy. Wait until the deployment is **Success** or **Active**.

**Step 12.** Copy the **public URL** (e.g. `https://amcare-os-submissions-production.up.railway.app`). You’ll add `/api` to this when you set Amplify (Step 15). Example: `https://xxxxx.up.railway.app`

---

## Part C: Point the Amplify app at your API

**Step 13.** Open **AWS Console** → **Amplify** → your app.

**Step 14.** Left menu: **App settings** → **Environment variables**. Click **Manage variables** → **Add variable**.

**Step 15.** Add one variable:
- **Name:** `VITE_API_ORIGIN`
- **Value:** the URL from Step 12 **plus `/api`** (e.g. `https://xxxxx.up.railway.app/api`). No trailing slash after `api`.

**Step 16.** Save. Then go to the **main branch** (or your deploy tab) and click **Redeploy this version** so the frontend is rebuilt with the new API URL.

**Step 17.** When the Amplify build is done, open your live app URL and try **Sign in** or **Create account**. It should work.

---

## If Railway doesn’t support monorepo root

If Railway deploys from the repo root and can’t find the app:

- Set **Root directory** to **integrations/oet-lms-submissions**.
- **Build command:** `npm install && npm run build`
- **Start command:** `node dist/index.js`

If `npm install` at that root doesn’t install dependencies, try:
- **Build command:** `npm install && npx tsc`  
  (and ensure **Start** is still `node dist/index.js`).

---

## Alternative: Render

1. Go to **https://render.com**, sign in with GitHub.
2. **New** → **PostgreSQL**. Create a DB and copy the **Internal Database URL** (or **External** if you’ll run the API elsewhere).
3. **New** → **Web Service**. Connect **amcare-os**, branch **main**.
4. **Root directory:** `integrations/oet-lms-submissions`.
5. **Build command:** `npm install && npm run build`
6. **Start command:** `node dist/index.js`
7. **Environment variables:** Add `DATABASE_URL` (from step 2) and `JWT_SECRET` (any long random string).
8. Deploy. Copy the service URL (e.g. `https://oet-lms-submissions.onrender.com`).
9. In Amplify, set **VITE_API_ORIGIN** to that URL **plus `/api`** (e.g. `https://oet-lms-submissions.onrender.com/api`) and redeploy (Steps 13–17 above).

---

## Checklist

- [ ] Postgres created (Railway or Render).
- [ ] Submissions API deployed with **DATABASE_URL** and **JWT_SECRET**.
- [ ] API has a public URL.
- [ ] Amplify env var **VITE_API_ORIGIN** = that URL + `/api` (e.g. `https://xxxxx.up.railway.app/api`).
- [ ] Amplify app redeployed.
- [ ] Sign-in and Create account work on the live app.
