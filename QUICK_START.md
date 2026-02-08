# Quick Start Guide - 2 Day Build Plan

## Day 1: Core Integrations

### Morning: Spruce Health API Client
```bash
# Use Cursor Prompt 1
cd integrations/spruce-health
npm install
npm run build
npm start

# Test endpoints
curl http://localhost:3006/health
```

### Afternoon: Zoho CRM Sync
```bash
# Use Cursor Prompt 2
cd integrations/zoho-sync
npm install
npm run build
npm start

# Test OAuth
# Configure webhook URLs in Zoho
```

## Day 2: Automation & Dashboard

### Morning: Klarity + Twilio
```bash
# Use Cursor Prompt 3 (Klarity)
cd integrations/klarity-sync
npm install && npm start

# Use Cursor Prompt 4 (Twilio)
cd integrations/twilio-voip
npm install && npm start
```

### Afternoon: Dashboard
```bash
# Use Cursor Prompt 5
cd apps/staff-dashboard
npm install
npm run dev

# Open http://localhost:3001
```

## Environment Setup

```bash
# Copy example env
cp .env.example .env

# Fill in:
# - Spruce Health API keys
# - Zoho OAuth credentials
# - Klarity API key
# - Twilio credentials
# - Redis URL
# - Database URLs
```

## Testing Workflow

1. **Create test appointment in Spruce**
   - Should appear in dashboard
   - Check unpaid → auto-cancel after 24hrs

2. **Submit form in Klarity**
   - Should route to provider queue
   - SMS sent to patient
   - Zoho updated

3. **Send SMS via Twilio**
   - Check delivery status
   - Verify audit log

4. **Check dashboard**
   - All integrations showing
   - Real-time updates working
   - KPIs displaying

## Deployment

```bash
# Railway
railway up

# Or Docker
docker-compose up -d
```

## When to Ask for Help

- ❌ API authentication errors
- ❌ Webhook signature verification failing
- ❌ Event bus not processing events
- ❌ Database connection issues
- ❌ HIPAA compliance questions
- ❌ Multi-service orchestration problems

## Success Criteria

✅ All 5 prompts implemented
✅ Webhooks receiving events
✅ Automation tasks running
✅ Dashboard showing real-time data
✅ Audit logs capturing actions
✅ SMS/calls working
✅ Zoho sync updating

**You're 95% there - just test and deploy!** 🚀
