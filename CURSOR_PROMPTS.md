# Cursor Prompts - Quick Reference

Use these 5 targeted prompts in Cursor to build the complete system:

## Prompt 1: Spruce Health API Client

```
Build Spruce Health API client + unpaid appointment automation from the pasted docs. 
24hr payment cancel + SMS reminder.

Requirements:
- GET /appointments (filter unpaid, 24hr policy)
- POST /cancel-appointment
- GET /messages (past 48hrs)
- POST /lock-note
- GET /tasks
- Webhook handlers: appointment.created, payment.failed
- Auto-cancel unpaid appointments within 24 hours
- Send SMS reminders via Twilio
- Event-driven architecture with Redis
```

## Prompt 2: Zoho CRM Sync

```
Create Zoho CRM sync for patient tracker + daily KPI dashboard. 
Pull appointments, payments, forms status.

Requirements:
- OAuth2 flow implementation
- Custom modules: DailyOperations, PatientTracker, ProviderQueue
- Patient record sync
- Daily KPI report generation:
  - Unpaid appointments count
  - Form completion rate
  - Chat response time
  - Patient satisfaction
  - Faxes processed
  - Notes locked
- Push reports to Slack/Teams
- Real-time sync with event bus
```

## Prompt 3: Klarity Webhook Handler

```
Klarity webhook handler for faxes + forms. Route to provider queue, update Zoho.

Requirements:
- Webhook types: fax.received, form.submitted
- Signature verification (HMAC-SHA256)
- Form validation logic
- Provider queue assignment
- SMS notification on form submission
- Update Zoho PatientTracker
- 15-minute sync cron job
- Event publishing to Redis
```

## Prompt 4: Twilio SMS Automation

```
Twilio SMS automation: form reminders, payment chases, re-engagement calls.

Requirements:
- Inbound/outbound call handling
- IVR support (English/Spanish)
- Call transcription → EMR notes
- SMS campaigns:
  - Form reminders
  - Payment chases
  - Re-engagement
- Call logging to Zoho
- Provider queue routing
- Webhook handlers for call events
```

## Prompt 5: React Dashboard

```
React dashboard consolidating all: daily checklist, real-time KPIs, task queue. 
Socket.io updates.

Requirements:
- Daily task checklist (8 tasks)
- Real-time sync status:
  - Spruce appointments (paid/unpaid)
  - Klarity faxes (pending/processed)
  - Zoho patient tracker updates
  - Twilio call queue
- KPI visualization
- Task queue management
- Socket.io for real-time updates
- 15-minute refresh button
- Integration health monitoring
```

## Architecture Decisions

### API Auth Issues
- **Spruce OAuth**: Token refresh handled automatically
- **Zoho OAuth2**: Refresh token flow implemented
- **Klarity**: API key authentication
- **Twilio**: Account SID + Auth Token

### HIPAA Compliance Patterns
- All API calls logged to audit trail
- Patient data access tracked
- 7-year retention policy
- Immutable audit logs
- Encryption at rest and in transit

### Multi-Service Orchestration
- Redis pub/sub for real-time events
- Bull queues for async processing
- Event handlers for cross-platform workflows
- Correlation IDs for event tracking

### Database Schema Optimization
- Indexed queries for fast lookups
- Partitioning support for large datasets
- Views for common queries
- Functions for complex operations

## Quick Start Commands

```bash
# 1. Spruce Health
cd integrations/spruce-health && npm install && npm start

# 2. Zoho Sync
cd integrations/zoho-sync && npm install && npm start

# 3. Klarity Webhooks
cd integrations/klarity-sync && npm install && npm start

# 4. Twilio
cd integrations/twilio-voip && npm install && npm start

# 5. Dashboard
cd apps/staff-dashboard && npm install && npm run dev

# Automation
cd scripts/automation-engine && npm install && npm start
```

## Testing Checklist

- [ ] Spruce webhooks receiving events
- [ ] Unpaid appointments auto-cancelling
- [ ] Zoho patient sync working
- [ ] Klarity forms routing to providers
- [ ] Twilio SMS sending
- [ ] Dashboard showing real-time updates
- [ ] Daily automation tasks running
- [ ] Audit logs capturing all actions

## Common Issues & Solutions

### Webhook Signature Verification
- Check `SPRUCE_WEBHOOK_SECRET` is set
- Verify timestamp is recent
- Use constant-time comparison

### Redis Connection
- Ensure Redis is running
- Check `REDIS_URL` environment variable
- Verify network connectivity

### OAuth Token Refresh
- Tokens auto-refresh before expiry
- Check refresh token is valid
- Verify client credentials

### Event Not Processing
- Check Redis connection
- Verify event handlers registered
- Check queue processor is running
