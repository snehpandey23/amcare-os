# Deploy Siya Health to Netlify

## Step 1: Create a New Netlify Site

1. Go to [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Connect your Git provider and select the **amcare-os** repository
3. When asked "Which branch to deploy?" → choose `main` (or your default branch)

## Step 2: Build Settings (critical)

In **Configure build settings**:

| Setting | Value |
|---------|-------|
| **Base directory** | Leave **empty** (or `/`) |
| **Build command** | Leave **empty** (or `echo 'Static'`) |
| **Publish directory** | `apps/siya-health` |
| **Package directory** | `apps/siya-health` |

**Important:** Set **Publish directory** explicitly to `apps/siya-health` in the UI. Do not rely on the config file alone — the UI can override it.

## Step 3: Deploy

Click **Deploy site**. The first deploy may take 1–2 minutes.

## Step 4: Custom Domain (siya.health)

1. In Netlify: **Domain settings** → **Add custom domain**
2. Enter `siya.health`
3. Follow the DNS instructions (add the Netlify A/CNAME records at your registrar)

## Troubleshooting

**404 after deploy**
- Open **Deploy settings** → **Build & deploy** → **Continuous deployment** → **Build settings**
- Confirm **Publish directory** is exactly `apps/siya-health` (no leading slash)
- Trigger a new deploy: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

**Old site still showing**
- The custom domain may still point to the previous host
- Check DNS (e.g. `dig siya.health`) to see where it resolves
- Update DNS to point to Netlify (see your site’s Domain settings for the right records)

**"Project to deploy" doesn’t list siya-health**
- Choose **Other** or **Configure manually**
- Enter the build settings above manually
