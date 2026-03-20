# Deploy only the OET LMS backend on Railway

The Amcare OS repo has many apps (analytics, scrum master, klarity sync, zoho sync, etc.). **For the OET LMS login and Create account to work, you only need to deploy this one service:** the **OET LMS Submissions API**. Ignore the others for now.

---

## What you’re deploying

- **One service:** Submissions API (handles sign-in, Create account, sessions).
- **One database:** PostgreSQL (Railway can add it for you).

---

## Steps on Railway

### 1. New project and Postgres

1. Go to [railway.app](https://railway.app) and sign in.
2. **New Project** → choose **Deploy from GitHub repo**.
3. Select **snehpandey23/amcare-os** (or your fork), branch **main**.
4. Railway may add one service from the repo. **Add a database:** click **+ New** → **Database** → **PostgreSQL**. Wait until it’s running.

### 2. Configure the Submissions API service

1. Click the **app** service (the one from the repo, not Postgres).
2. **Settings** (or **Variables**):
   - **Root Directory:** set to **`integrations/oet-lms-submissions`** (so Railway builds only this API).
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. **Variables** (or **Environment**): add
   - **DATABASE_URL**  
     In Railway, open the **Postgres** service → **Variables** or **Connect** tab and copy the **connection URL** (often `DATABASE_URL`). Paste that into the **app** service variables.
   - **JWT_SECRET**  
     Any long random string (e.g. 32+ characters). You can generate one at [randomkeygen.com](https://randomkeygen.com) or use a long passphrase.
4. Save. Railway will rebuild and redeploy.

### 3. Public URL for the API

1. In the **app** service, open **Settings** → **Networking** (or **Deploy**).
2. Click **Generate domain** (or use the one Railway gives). You’ll get a URL like **`https://something.up.railway.app`**.
3. Copy that URL. The full API base is that URL **+ `/api`**, e.g. **`https://something.up.railway.app/api`**.

### 4. Tell the frontend (Amplify) this URL

In your repo, open **`amplify.yml`** (in the root). Find the line:

```yaml
VITE_API_ORIGIN: "https://YOUR-RAILWAY-APP.up.railway.app/api"
```

Replace **`YOUR-RAILWAY-APP.up.railway.app`** with the hostname from step 3 (e.g. **`something.up.railway.app`**). Commit and push. Amplify will rebuild and the login page will use this API.

---

## Summary

| Item | What to do |
|------|------------|
| Repo | Use **amcare-os**, branch **main**. |
| Service | Only the **Submissions API** (root: `integrations/oet-lms-submissions`). |
| Database | Add **PostgreSQL** in the same project; set **DATABASE_URL** on the app. |
| Secret | Set **JWT_SECRET** on the app. |
| URL | Generate domain for the app → copy URL → put `https://that-url/api` in **amplify.yml** as **VITE_API_ORIGIN**. |

You do **not** need to deploy analytics engine, scrum master, klarity sync, zoho sync, or any other service for OET LMS login to work.
