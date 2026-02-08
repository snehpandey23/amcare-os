# Zoho Webhook Handlers

TypeScript handlers for processing Zoho webhook payloads with comprehensive error handling and retry logic.

## Supported Webhooks

1. **appointment_created** - Creates appointments and pre-charting tasks
2. **payment_status** - Updates payment records and creates payment check tasks
3. **patient_intake_submitted** - Processes intake forms and creates form completion tasks

## Features

- ✅ **Signature Verification** - HMAC-SHA256 signature verification
- ✅ **Timestamp Validation** - Prevents replay attacks
- ✅ **Retry Logic** - Exponential backoff with configurable retries
- ✅ **Error Handling** - Comprehensive error handling and logging
- ✅ **Audit Trail** - All webhook events logged for HIPAA compliance
- ✅ **Idempotency** - Handles duplicate webhooks gracefully
- ✅ **Task Creation** - Automatically creates tasks in the system

## Usage

### Express Integration

```typescript
import zohoWebhookRouter from './integrations/zoho-sync/src/webhook';

app.use('/api/webhooks', zohoWebhookRouter);
```

### Environment Variables

```env
ZOHO_WEBHOOK_SECRET=your_webhook_secret_here
```

### Webhook Endpoint

```
POST /api/webhooks/zoho
Headers:
  x-zoho-signature: <signature>
  x-zoho-timestamp: <timestamp>
Body: <webhook payload>
```

## Webhook Payloads

### appointment_created

```json
{
  "event": "appointment_created",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "zoho_crm",
  "webhook_id": "webhook_123",
  "data": {
    "appointment_id": "apt_123",
    "patient_id": "pat_456",
    "patient_name": "John Doe",
    "appointment_date": "2024-01-20",
    "appointment_time": "10:00 AM",
    "timezone": "America/New_York",
    "appointment_type": "Consultation",
    "status": "scheduled",
    "zoho_record_id": "zoho_789"
  }
}
```

### payment_status

```json
{
  "event": "payment_status",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "zoho_books",
  "webhook_id": "webhook_124",
  "data": {
    "payment_id": "pay_123",
    "patient_id": "pat_456",
    "patient_name": "John Doe",
    "amount": 150.00,
    "currency": "USD",
    "payment_method": "credit_card",
    "payment_status": "completed",
    "transaction_id": "txn_789",
    "payment_date": "2024-01-15",
    "zoho_record_id": "zoho_790"
  }
}
```

### patient_intake_submitted

```json
{
  "event": "patient_intake_submitted",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "zoho_crm",
  "webhook_id": "webhook_125",
  "data": {
    "form_id": "form_123",
    "patient_id": "pat_456",
    "patient_name": "John Doe",
    "submission_date": "2024-01-15T10:00:00Z",
    "form_type": "New Patient Intake",
    "form_data": {
      "medical_history": "...",
      "medications": "..."
    },
    "status": "submitted",
    "zoho_record_id": "zoho_791"
  }
}
```

## Retry Logic

The system uses exponential backoff for retries:

- **Initial Delay:** 1 second
- **Max Retries:** 3 attempts
- **Max Delay:** 10 seconds
- **Backoff Multiplier:** 2x

Retryable errors include:
- Network errors
- Timeouts
- 5xx HTTP errors

## Error Handling

All errors are:
1. Logged to audit trail
2. Stored in webhook_logs table
3. Returned with appropriate HTTP status codes
4. Marked as retryable or non-retryable

## Database Schema

Required tables:

```sql
-- Webhook logs
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY,
  webhook_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  source VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) NOT NULL,
  task_id UUID,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  zoho_record_id VARCHAR(255) UNIQUE,
  patient_id VARCHAR(255) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  -- ... other fields
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  zoho_record_id VARCHAR(255) UNIQUE,
  patient_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  -- ... other fields
);

-- Patient Intake Forms
CREATE TABLE patient_intake_forms (
  id UUID PRIMARY KEY,
  zoho_record_id VARCHAR(255) UNIQUE,
  patient_id VARCHAR(255) NOT NULL,
  form_type VARCHAR(255) NOT NULL,
  form_data JSONB NOT NULL,
  -- ... other fields
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  zoho_record_id VARCHAR(255),
  -- ... other fields
);
```

## Testing

### Manual Retry

```bash
POST /api/webhooks/zoho/retry/:webhookId
```

### Check Status

```bash
GET /api/webhooks/zoho/status/:webhookId
```

## Security

- All webhooks require valid signature
- Timestamps validated to prevent replay attacks
- All events logged for audit trail
- HIPAA-compliant data handling
