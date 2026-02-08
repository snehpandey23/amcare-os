# Deploy OET LMS to AWS Amplify (frontend live)

Get the Siya Health MA Chat Simulator on a public URL in a few steps.

## Prerequisites

- AWS CLI configured (`aws configure` done, `aws sts get-caller-identity` works)
- Your OET LMS code in a **Git** repo (GitHub, GitLab, Bitbucket, or AWS CodeCommit)

---

## Step 1: Push your code to a Git repo

If the repo isn’t on GitHub/GitLab/CodeCommit yet:

```bash
cd /Users/sp/amcare-os
git add .
git commit -m "Add Amplify build for OET LMS"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Use your real repo URL. If the repo already exists, just push:

```bash
git push origin main
```

---

## Step 2: Create the Amplify app in AWS

1. Open **AWS Console**: https://console.aws.amazon.com/
2. In the search bar, type **Amplify** and open **AWS Amplify**.
3. Click **New app** → **Host web app**.
4. Choose your **Git provider** (e.g. GitHub), then **Continue**.
5. If asked, authorize AWS Amplify to access your GitHub (or other) account.
6. Pick the **repository** and **branch** (e.g. `main`) that has the OET LMS code.
7. **Build and test settings**: Amplify should detect the repo.  
   - If it shows a default build spec, switch to **Monorepo** or **Use existing build spec**.  
   - Confirm the build spec is the repo’s **amplify.yml** at the root (the one that runs `npm run build --workspace=@amcare/oet-lms` and uses `apps/oet-lms/dist`).
8. **Advanced** (optional): under **Environment variables**, you can add:
   - `VITE_API_ORIGIN` = your submissions API URL (later, when you deploy the API)
   - `VITE_CHAT_WS_ORIGIN` = your chat WebSocket URL (later)
   Leave these empty for now; the app will run in **demo mode** (no live API/chat).
9. Click **Save and deploy**.

---

## Step 3: Wait for the build

- Amplify will clone the repo, run `npm ci`, then `npm run build --workspace=@amcare/oet-lms`, and deploy `apps/oet-lms/dist`.
- When the build is **green**, open the app with the link Amplify shows (e.g. `https://main.xxxxx.amplifyapp.com`).

---

## Step 4: Use the live app

- You can share that URL. Users get the same UI as locally.
- **Without** `VITE_API_ORIGIN` / `VITE_CHAT_WS_ORIGIN`: login and saved sessions won’t work; the **Chat Simulator** will use **demo mode** (you can still send messages and get feedback).
- **With** those env vars set (after you deploy the backends): login and live AI chat will work.

---

## Optional: Add env vars later (for API + chat)

When you have a submissions API and chat backend URL:

1. In Amplify: **App settings** → **Environment variables**.
2. Add:
   - `VITE_API_ORIGIN` = `https://your-submissions-api.com`
   - `VITE_CHAT_WS_ORIGIN` = `wss://your-chat-ws.com/chat-ws`
3. **Redeploy** the app (e.g. **Redeploy this version** or push a new commit).

---

## Troubleshooting

- **Build fails on “npm run build”**  
  Make sure the repo root has `package.json` with workspaces and `apps/oet-lms` exists. The root `amplify.yml` is correct for this monorepo.

- **Blank page or 404**  
  In Amplify **Rewrites and redirects**, add a rule:  
  Source: `/<*>`, Target: `/index.html`, Type: **200 (Rewrite)**.  
  So the SPA router works.

- **“Unable to locate credentials”**  
  That’s for AWS CLI on your machine; Amplify uses its own role. Configure AWS CLI with `aws configure` only for your local use.
