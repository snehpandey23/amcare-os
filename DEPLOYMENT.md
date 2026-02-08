# Deployment Guide

## Quick Start (7-Day Plan)

### Day 1-2: Spruce API Client + Unpaid Appointment Automation
```bash
cd integrations/spruce-health
npm install
npm run build
npm start
```

### Day 3-4: Zoho CRM Sync + Patient Tracker
```bash
cd integrations/zoho-sync
npm install
npm run build
npm start
```

### Day 5: Klarity Webhook Handler + Fax Queue
```bash
cd integrations/klarity-sync
npm install
npm run build
npm start
```

### Day 6: Twilio SMS Automation + Call Logging
```bash
cd integrations/twilio-voip
npm install
npm run build
npm start
```

### Day 7: Full Dashboard + KPI Reporting
```bash
cd apps/staff-dashboard
npm install
npm run build
npm run dev
```

## Local Development

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Manual Setup

1. **Start Databases**
   ```bash
   # PostgreSQL
   docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:14
   
   # Redis
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   
   # MongoDB
   docker run -d --name mongodb -p 27017:27017 mongo:7
   ```

2. **Run Migrations**
   ```bash
   npm run migrate
   ```

3. **Start Services**
   ```bash
   # API Server
   npm run dev --workspace=packages/database
   
   # Integrations
   npm run dev --workspace=integrations/spruce-health
   npm run dev --workspace=integrations/klarity-sync
   
   # Automation
   npm run dev --workspace=scripts/automation-engine
   ```

## OET LMS (Siya Health Chat Simulator)

**Not currently running on AWS.** The app runs locally or can be deployed to Railway/Vercel (see below). To run on the internet with auth and reports, you need PostgreSQL and the API running.

### Local run (full stack: chat + auth + frontend)

From repo root (`/Users/sp/amcare-os` or your clone):

```bash
cd /path/to/amcare-os
npm install
```

1. **Chat (AI patient):** In `integrations/oet-lms-chat/.env` set `PERPLEXITY_API_KEY=pplx-...`.
2. **Auth & reports:** In `integrations/oet-lms-submissions/.env` set:
   - `DATABASE_URL=postgresql://user:pass@host:5432/dbname` (PostgreSQL)
   - `JWT_SECRET=your-secret-string`
3. **PostgreSQL:** Use Docker or a local/cloud Postgres. Example:
   ```bash
   docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=amcare postgres:14
   # Then DATABASE_URL=postgresql://postgres:postgres@localhost:5432/amcare
   ```
4. Start everything:
   ```bash
   npm run dev:oet-lms
   ```
   This runs: chat backend (port 3007), submissions API (port 3006), OET LMS frontend (e.g. port 3005). Open the URL Vite prints (e.g. `http://127.0.0.1:3005`).

5. **First admin:** Register in the app, then in Postgres: `UPDATE lms_users SET role = 'admin' WHERE email = 'your@email.com';` so you can open **All reports**.

### Running on AWS

The repo does **not** include AWS config yet. To run OET LMS on AWS you would:

- **Frontend (OET LMS):** Build `apps/oet-lms` and deploy to **AWS Amplify** (or S3 + CloudFront).
- **APIs:** Deploy `integrations/oet-lms-chat` and `integrations/oet-lms-submissions` to **AWS App Runner**, **ECS**, or **Elastic Beanstalk** (Node.js). Set env: `DATABASE_URL`, `JWT_SECRET`, `PERPLEXITY_API_KEY`, etc.
- **Database:** Use **Amazon RDS (PostgreSQL)** for `DATABASE_URL`.
- **WebSocket:** The chat backend uses WebSockets; App Runner and ECS support them; Lambda would need API Gateway WebSocket APIs and a different setup.

After deployment, point the frontend’s API base (or reverse proxy) to your API URLs. If you want, we can add concrete AWS config (e.g. Amplify + App Runner + RDS) in a follow-up.

## Railway Deployment

1. **Create Railway Project**
   ```bash
   railway login
   railway init
   ```

2. **Add Services**
   - PostgreSQL (Railway PostgreSQL plugin)
   - Redis (Railway Redis plugin)
   - MongoDB (Railway MongoDB plugin)

3. **Deploy**
   ```bash
   railway up
   ```

4. **Set Environment Variables**
   - Add all required API keys
   - Configure webhook URLs
   - Set up Slack/Teams webhooks

## Vercel Deployment (Frontend)

```bash
cd apps/staff-dashboard
vercel deploy
```

## Environment Variables Checklist

```env
# Database
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb://...
REDIS_URL=redis://...

# APIs
SPRUCE_HEALTH_API_KEY=...
KLARITY_API_KEY=...
CAREPATRON_API_KEY=...
ZOHO_CLIENT_ID=...
ZOHO_CLIENT_SECRET=...
ZOHO_REFRESH_TOKEN=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Webhooks
SPRUCE_WEBHOOK_SECRET=...
KLARITY_WEBHOOK_SECRET=...

# Notifications
SLACK_WEBHOOK_URL=...
TEAMS_WEBHOOK_URL=...
```

## Monitoring

- Health checks: `GET /health` on each service
- Queue monitoring: Redis CLI or Bull Board
- Logs: Docker logs or Railway logs
- Metrics: Custom dashboard endpoints

## Production Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Webhook URLs configured
- [ ] SSL certificates configured
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] HIPAA compliance verified
- [ ] Audit logging enabled
