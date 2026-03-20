# Push to GitHub – do this once

Git is set up and your first commit is done. You only need to **create a repo on GitHub** and run **2 commands** in Terminal.

---

## Step 1: Create a new repo on GitHub

1. Open **https://github.com** and sign in.
2. Click the **+** (top right) → **New repository**.
3. **Repository name:** e.g. `amcare-os` or `oet-lms`.
4. Leave **Public** selected.
5. **Do not** check "Add a README file".
6. Click **Create repository**.

---

## Step 2: Run these 2 commands in Terminal

Replace `YOUR_USERNAME` with your GitHub username and `YOUR_REPO` with the repo name you chose.

```bash
cd /Users/sp/amcare-os
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**Example:** If your username is `sp` and repo is `amcare-os`:

```bash
cd /Users/sp/amcare-os
git remote add origin https://github.com/sp/amcare-os.git
git push -u origin main
```

When it asks for **password**, use a **Personal Access Token** (not your GitHub password):

- GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Generate new token (classic)**.
- Name it (e.g. "laptop"), check **repo**, generate, then **copy the token** and paste it when Terminal asks for password.

After this, your code will be on GitHub and you can connect it to AWS Amplify.
