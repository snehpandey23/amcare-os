# AI Scrum Master

Beginner-friendly AI Scrum Master with guided backlog, priorities, and sprint plans.

## Run

1. Add keys in `.env` (see `.env.example`).
2. Start the API: `npm run dev --workspace=integrations/ai-scrum-master-api`
3. Start the UI: `npm run dev --workspace=apps/ai-scrum-master`

## Zoho WorkDrive setup

1. Create a Zoho OAuth client (self client or server-based client).
2. Set in `.env`:
   - `ZOHO_CLIENT_ID`
   - `ZOHO_CLIENT_SECRET`
   - `ZOHO_REDIRECT_URI` (e.g. `http://localhost:3010/api/zoho/callback`)
3. Click **Connect Zoho** in the app and complete the consent flow.
