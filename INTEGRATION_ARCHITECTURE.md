# Master Integration Architecture

Event-driven architecture connecting Spruce Health, Klarity, Zoho CRM, and Twilio.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Master Event Bus (Redis)                  │
│                  Pub/Sub + Queue System                      │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
    │ Spruce │    │Klarity │    │  Zoho  │    │ Twilio │
    │ Health │    │  EMR   │    │  CRM   │    │  VOIP  │
    └────────┘    └────────┘    └────────┘    └────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
    ┌──────────────────────────────────────────────────┐
    │         Event Handlers & Processors                │
    │  - Appointment cancellation                        │
    │  - Form validation & routing                      │
    │  - Fax processing                                 │
    │  - Payment reminders                              │
    │  - Call logging                                   │
    └──────────────────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────────────────┐
    │         Automation Engine (8 Daily Tasks)         │
    │  - Unpaid appointment cancellation                │
    │  - Form reminders                                │
    │  - Pre-charting status                           │
    │  - Chat review                                    │
    │  - Fax processing                                │
    │  - Note locking                                  │
    │  - Re-engagement calls                          │
    │  - KPI reporting                                 │
    └──────────────────────────────────────────────────┘
```

## Event Flow Examples

### 1. Appointment Created → Auto-Cancel if Unpaid

```
Spruce webhook → Event Bus → Processor checks payment
  → If unpaid within 24hrs:
    → Cancel appointment
    → Send SMS via Twilio
    → Update Zoho PatientTracker
    → Log to audit trail
```

### 2. Form Submitted → Provider Assignment

```
Klarity webhook → Event Bus → Form validation
  → Assign to provider queue
  → Send SMS confirmation
  → Update Zoho tracker
  → Create task in system
```

### 3. Payment Failed → SMS Reminder

```
Zoho webhook → Event Bus → Check appointment status
  → Send SMS payment reminder
  → Update patient record
  → Log to audit
```

### 4. Call Completed → EMR Logging

```
Twilio webhook → Event Bus → Transcribe call
  → Log to EMR
  → Update Zoho patient record
  → Create follow-up task if needed
```

## Integration Services

### Spruce Health
- **Endpoints**: Appointments, messages, tasks, note locking
- **Webhooks**: appointment.created, payment.failed
- **Auto-cancellation**: Unpaid appointments within 24 hours

### Klarity EMR
- **Sync**: Forms, faxes, pre-charting (every 15 minutes)
- **Webhooks**: fax.received, form.submitted
- **Routing**: Forms → Provider queue → SMS notification

### Zoho CRM
- **Modules**: DailyOperations, PatientTracker, ProviderQueue
- **Sync**: Patient records, appointments, KPIs
- **Reporting**: Daily KPI reports → Slack/Teams

### Twilio VOIP
- **Calls**: Inbound/outbound with IVR
- **SMS**: Campaigns for reminders, payments, re-engagement
- **Logging**: Call transcripts → EMR notes

## Daily Automation Tasks

1. **Cancel Unpaid Appointments** (9 AM IST)
2. **Form Reminders** (Scheduled)
3. **Pre-Charting Status** (Continuous)
4. **48hr Chat Review** (Scheduled)
5. **Fax Processing** (Via webhooks)
6. **Note Locking Check** (4hr policy)
7. **Re-Engagement Calls** (Scheduled)
8. **KPI Report Generation** (End of day)

## Event Types

### Spruce Events
- `spruce.appointment.created`
- `spruce.appointment.cancelled`
- `spruce.payment.failed`
- `spruce.note.locked`
- `spruce.message.received`

### Klarity Events
- `klarity.form.submitted`
- `klarity.fax.received`
- `klarity.pre_charting.ready`

### Zoho Events
- `zoho.patient.created`
- `zoho.patient.updated`
- `zoho.payment.failed`
- `zoho.kpi.updated`

### Twilio Events
- `twilio.call.inbound`
- `twilio.call.outbound`
- `twilio.call.completed`
- `twilio.sms.sent`
- `twilio.sms.received`

## Queue System

- **Redis Pub/Sub**: Real-time event distribution
- **Bull Queues**: Async job processing
- **Retry Logic**: Exponential backoff
- **Job Retention**: 100 completed, 500 failed

## Compliance

- **HIPAA Audit Logging**: All events logged
- **Data Retention**: 7 years
- **Access Control**: Role-based permissions
- **Encryption**: At rest and in transit

## Deployment

See `DEPLOYMENT.md` for:
- Docker Compose setup
- Railway deployment
- Vercel frontend
- Environment configuration

## Monitoring

- Health checks on all services
- Queue monitoring via Bull Board
- Real-time sync status dashboard
- KPI reporting to Slack/Teams
