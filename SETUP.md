# AmCare OS Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v14 or higher)
3. **Redis** (for caching and queues)
4. **npm** or **yarn**

## Installation

### 1. Install Dependencies

From the root directory:

```bash
npm install
```

This will install dependencies for all workspaces (apps, integrations, packages, scripts).

### 2. Database Setup

Create PostgreSQL database:

```bash
createdb amcare_os
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database credentials
- JWT secret
- Integration API keys (Zoho, Klarity, WellSync, Stripe)
- Application ports

### 4. Build Shared Packages

Build all shared packages:

```bash
cd packages/database && npm run build && cd ../..
cd packages/auth && npm run build && cd ../..
cd packages/audit && npm run build && cd ../..
cd packages/api-client && npm run build && cd ../..
```

### 5. Database Migration

Run database migrations (you'll need to create migration scripts based on your schema).

### 6. Start Development Servers

Start all applications:

```bash
npm run dev
```

Or start individually:

```bash
# Staff Dashboard (port 3001)
npm run dev --workspace=apps/staff-dashboard

# Patient Management (port 3002)
npm run dev --workspace=apps/patient-management

# Operations Hub (port 3003)
npm run dev --workspace=apps/operations-hub

# Analytics Engine (port 3004)
npm run dev --workspace=apps/analytics-engine

# OET LMS – Medical Assistants (port 3005)
npm run dev --workspace=apps/oet-lms
```

## Running Scripts

### Daily Sync

Synchronize with external services:

```bash
npm run sync:daily
```

Or manually:

```bash
cd scripts/daily-sync
npm run build
npm start
```

### Report Generation

Generate compliance or operational reports:

```bash
npm run report:generate
```

Or with options:

```bash
cd scripts/report-generation
npm run build
npm start compliance ./reports
```

### Error Monitoring

Monitor system errors:

```bash
cd scripts/error-handling
npm run build
npm run monitor
```

## Integration Setup

### Zoho Integration

1. Set up Zoho OAuth application
2. Get client ID, client secret, and refresh token
3. Add to `.env`:
   ```
   ZOHO_CLIENT_ID=your_client_id
   ZOHO_CLIENT_SECRET=your_client_secret
   ZOHO_REFRESH_TOKEN=your_refresh_token
   ```

### Klarity Integration

1. Get API key from Klarity
2. Add to `.env`:
   ```
   KLARITY_API_KEY=your_api_key
   KLARITY_API_URL=https://api.klarity.com
   ```

### WellSync Integration

1. Get API key from WellSync
2. Add to `.env`:
   ```
   WELLSYNC_API_KEY=your_api_key
   WELLSYNC_API_URL=https://api.wellsync.com
   ```

### Stripe Webhook

1. Set up Stripe account
2. Get webhook secret
3. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. Start webhook server:
   ```bash
   cd integrations/stripe-webhook
   npm run build
   npm start
   ```

## Project Structure

```
amcare-os/
├── apps/                    # Frontend applications
│   ├── staff-dashboard
│   ├── patient-management
│   ├── operations-hub
│   └── analytics-engine
├── integrations/            # External service integrations
│   ├── zoho-sync
│   ├── klarity-sync
│   ├── wellsync-api
│   └── stripe-webhook
├── packages/                # Shared packages
│   ├── database
│   ├── auth
│   ├── audit
│   └── api-client
├── scripts/                 # Automation scripts
│   ├── daily-sync
│   ├── report-generation
│   └── error-handling
└── docs/                    # Documentation
    ├── workflows
    ├── api-specs
    └── compliance
```

## Development Workflow

1. Make changes in the appropriate workspace
2. Build if necessary (TypeScript packages)
3. Test locally
4. Run linting: `npm run lint`
5. Type check: `npm run type-check`

## Production Deployment

1. Build all workspaces:
   ```bash
   npm run build
   ```

2. Set `NODE_ENV=production` in `.env`

3. Use process manager (PM2) for each service

4. Set up reverse proxy (nginx) for frontend apps

5. Configure SSL/TLS certificates

6. Set up monitoring and logging

## Troubleshooting

### Workspace Dependencies

If packages aren't found, ensure they're built:
```bash
npm run build --workspaces
```

### Port Conflicts

Change ports in `.env` if needed:
```
STAFF_DASHBOARD_PORT=3001
PATIENT_MANAGEMENT_PORT=3002
OPERATIONS_HUB_PORT=3003
ANALYTICS_ENGINE_PORT=3004
```

### Database Connection

Verify PostgreSQL is running and credentials are correct in `.env`.

## Support

For issues, refer to documentation in `/docs` or contact the development team.
