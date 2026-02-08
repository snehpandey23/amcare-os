# AmCare OS - Complete Integration System

## Overview

Complete event-driven integration system connecting:
- **Spruce Health** - Appointment management, messaging, note locking
- **Klarity + Carepatron** - EMR forms, faxes, pre-charting
- **Zoho CRM** - Patient database, appointments, KPIs
- **Twilio** - VOIP calls, SMS campaigns

## Quick Start

### 1. Start Infrastructure

```bash
docker-compose up -d
```

This starts:
- PostgreSQL
- Redis
- MongoDB

### 2. Start Integrations

```bash
# Spruce Health
cd integrations/spruce-health && npm install && npm start

# EMR Sync (Klarity)
cd integrations/klarity-sync && npm install && npm start

# Master Integration
cd integrations/master-integration && npm install && npm start
```

### 3. Start Automation

```bash
cd scripts/automation-engine && npm install && npm start
```

### 4. Start Dashboard

```bash
cd apps/staff-dashboard && npm install && npm run dev
```

## Integration Workflows

### Spruce Health Workflow

1. **Unpaid Appointments** → Auto-cancel within 24 hours
2. **Messages** → Review past 48 hours
3. **Note Locking** → Auto-lock after 4 hours
4. **Tasks** → Daily task management

### EMR Sync Workflow (Klarity)

1. **Forms** → Validate → Assign provider → SMS → Update Zoho
2. **Faxes** → Route to provider queue → Process → Update Zoho
3. **Pre-Charting** → Check status → Notify providers

### Zoho CRM Workflow

1. **Patient Sync** → Update PatientTracker module
2. **Daily KPIs** → Generate report → Push to Slack/Teams
3. **Provider Queue** → Track pre-charting and note locking

### Twilio VOIP Workflow

1. **Inbound Calls** → IVR → Provider queue → Record → Transcribe → EMR
2. **Outbound Calls** → Patient record → Script → Outcome logging
3. **SMS Campaigns** → Form reminders, payment chases, re-engagement

## Event Bus

All integrations communicate via Redis event bus:

```typescript
import { eventBus, EventType } from '@amcare/event-bus';

// Publish event
await eventBus.publish({
  eventType: EventType.SPRUCE_APPOINTMENT_CREATED,
  timestamp: new Date(),
  source: 'spruce',
  data: { /* event data */ },
});

// Subscribe to events
eventBus.subscribe({
  eventType: EventType.KLARITY_FORM_SUBMITTED,
  handler: async (event) => {
    // Handle form submission
  },
});
```

## Daily Automation

8 automated tasks run daily:

1. ✅ Cancel unpaid appointments (24hr policy)
2. ✅ Send form reminders
3. ✅ Check pre-charting status
4. ✅ Review 48hr chat messages
5. ✅ Process faxes
6. ✅ Check note locking (4hr policy)
7. ✅ Patient re-engagement calls
8. ✅ Generate KPI report

## Dashboard Features

- Real-time sync status (Socket.io)
- Live task updates
- Integration health monitoring
- 15-minute refresh button
- KPI visualization

## API Endpoints

### Spruce Health
- `GET /appointments` - Filter unpaid, 24hr policy
- `POST /cancel-appointment` - Cancel appointment
- `GET /messages` - Past 48 hours
- `POST /lock-note` - Lock clinical note
- `GET /tasks` - Get tasks

### Webhooks
- `POST /webhooks/spruce` - Spruce webhooks
- `POST /webhooks/klarity` - Klarity webhooks

## Configuration

All integrations require environment variables (see `.env.example`).

## Monitoring

- Health: `GET /health` on each service
- Queue status: Redis CLI or Bull Board
- Sync status: Dashboard real-time updates
- Audit logs: Database queries

## Next Steps

1. Configure API keys in `.env`
2. Set up webhook URLs
3. Configure Slack/Teams webhooks
4. Run database migrations
5. Start services
6. Test integrations
7. Deploy to production

See `DEPLOYMENT.md` for detailed deployment instructions.
