# SiyaOS — internal workforce assistant (+ HIPAA certification)

**Default experience:** chat-first **Siya** assistant at `/` for HIPAA, billing workflow, telehealth privacy, and **escalation pathways** (internal KB + retrieval over modules/references).

**Optional:** structured **HIPAA certification** at `/training` — modules, quizzes, final exam, certificate (unchanged).

## Run

From repo root:

```bash
npm run dev:hipaa-training
```

Or from this folder:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Layout

- `src/content/workspace-kb.ts` — internal playbook (billing, HIPAA, escalation).
- `src/lib/siya-os/` — retrieval + `/api/chat` assistant engine.
- `src/components/siya/` — chat UI and shell.
- `src/content/modules.ts` — certification course modules.
- `src/content/questionsPart1.ts` + `questionsPart2.ts` — digitized official test.
- `src/lib/quizEngine.ts` — queues, adaptation, reinforcement selection.
- `src/lib/scoring.ts` — topic summaries, readiness (**Ready / Needs review**).
- `src/lib/progressStorage.ts` — `localStorage` persistence.

## Production

Build: `npm run build` then `npm run start`. Deploy to Vercel/Netlify like any Next.js app. For org-wide completion tracking, replace `progressStorage` with your API + DB (Supabase/SQLite/etc.).

### Vercel (this monorepo)

The repository root `package.json` **`build`** script runs **`npm run build --workspaces`**, which builds every package (some currently fail TypeScript checks).

**Option A — recommended:** In Vercel: **Project → Settings → General → Root Directory** → **`apps/hipaa-training`**. Build command can stay **`npm run build`** (Next.js). Logs should **not** start with `amcare-os@1.0.0` / `npm run build --workspaces`.

**Option B — deploy the Git root without “Root Directory”:** Repository **`vercel.json`** runs **`npm run build -w @amcare/hipaa-training`** and sets **`outputDirectory`** to **`apps/hipaa-training/.next`** so Vercel reads the Next.js build where it is written (do **not** copy `.next` to the repo root — that breaks serverless path tracing). If the deploy step still complains about `.next`, use **Option A** instead.

For other apps from the same repo, either set **Root Directory** to that app, or remove/override root `vercel.json` in a branch — see [Vercel monorepos](https://vercel.com/docs/monorepos).

Local full monorepo build remains: **`npm run build`** (all workspaces). That is unchanged by root `vercel.json` (Vercel reads `vercel.json`; local **`npm run build`** still uses `package.json`).

## Print certificate

`/certificate` uses the browser print dialog (save as PDF). Text states this is an **organizational training record**, not a government credential.
