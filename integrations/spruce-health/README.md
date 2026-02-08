# Spruce Health API Integration

TypeScript API client for Spruce Health API with webhook handlers and event-driven architecture using Redis.

## Features

- ✅ **Complete API Client** - All required endpoints implemented
- ✅ **Webhook Handlers** - appointment.created and payment.failed
- ✅ **Event-Driven Architecture** - Redis-based queue system
- ✅ **Automatic Processing** - Queue processors for webhook events
- ✅ **Error Handling** - Retry logic and error recovery
- ✅ **HIPAA Compliant** - All actions logged to audit trail

## API Endpoints

### GET /appointments
Fetch appointments with filtering options.

```typescript
import { SpruceHealthClient } from '@amcare/spruce-health';

const client = new SpruceHealthClient();

// Get unpaid appointments within 24 hours (default)
const unpaidAppointments = await client.getAppointments();

// Custom filters
const appointments = await client.getAppointments({
  paymentStatus: 'unpaid',
  hoursBefore: 24,
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  status: 'scheduled',
});
```

### POST /cancel-appointment
Cancel an appointment.

```typescript
const result = await client.cancelAppointment({
  appointmentId: 'apt_123',
  reason: 'Unpaid balance - 24 hour policy',
  notifyPatient: true,
  cancellationNotes: 'Payment required before appointment',
});
```

### GET /messages
Get messages from past 48 hours.

```typescript
// Get all messages from past 48 hours (default)
const messages = await client.getMessages();

// Custom filters
const messages = await client.getMessages({
  hoursBack: 48,
  patientId: 'pat_123',
  type: 'sms',
  direction: 'inbound',
});
```

### POST /lock-note
Lock a clinical note.

```typescript
const result = await client.lockNote({
  noteId: 'note_123',
  encounterId: 'enc_456',
  patientId: 'pat_789',
  lockedBy: 'user_123',
  lockReason: 'Note finalized after 4 hours',
});
```

### GET /tasks
Get tasks.

```typescript
// Get all tasks
const tasks = await client.getTasks();

// Filtered tasks
const tasks = await client.getTasks({
  status: 'pending',
  type: 'payment_check',
  patientId: 'pat_123',
});
```

## Webhook Handlers

### appointment.created
Automatically processes when appointment is created:
- Checks payment status
- Cancels if unpaid within 24 hours
- Creates pre-charting tasks
- Logs to audit trail

### payment.failed
Automatically processes when payment fails:
- Checks appointment status
- Cancels appointment if needed
- Notifies patient
- Logs to audit trail

## Event-Driven Architecture

### Redis Queue System

Events are processed asynchronously using Redis queues:

```typescript
import { RedisQueueManager } from '@amcare/spruce-health';

const queueManager = new RedisQueueManager();

// Add job to queue
await queueManager.addJob('spruce-webhooks', {
  type: 'appointment.created',
  payload: eventData,
});

// Process queue
queueManager.processQueue('spruce-webhooks', async (job) => {
  // Process job
  return await processEvent(job.data);
});
```

### Event Publishing

Events are published to Redis pub/sub:

```typescript
await queueManager.publishEvent({
  eventType: 'appointment.created',
  data: eventData,
  timestamp: new Date(),
  source: 'spruce_health',
});
```

### Event Subscription

Subscribe to events:

```typescript
queueManager.subscribeToEvents(
  ['appointment.created', 'payment.failed'],
  (event) => {
    console.log('Event received:', event.eventType);
    // Handle event
  }
);
```

## Configuration

### Environment Variables

```env
# Spruce Health API
SPRUCE_HEALTH_API_KEY=your_api_key
SPRUCE_HEALTH_API_URL=https://api.sprucehealth.com

# Webhook Security
SPRUCE_WEBHOOK_SECRET=your_webhook_secret

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# Service Port
SPRUCE_HEALTH_PORT=3006
```

## Usage

### Start Service

```bash
npm start
# or
node dist/index.js
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Webhook Endpoint

The service exposes webhook endpoints at:

- `POST /webhooks/webhook` - Main webhook endpoint
- `GET /webhooks/health` - Health check

### Webhook Payload Example

```json
{
  "event": "appointment.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "appointment": {
      "id": "apt_123",
      "patientId": "pat_456",
      "appointmentDate": "2024-01-20",
      "paymentStatus": "unpaid",
      "amountDue": 150.00
    },
    "patient": {
      "id": "pat_456",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

## Queue Processing

Jobs are automatically processed with:
- **Retry Logic** - 3 attempts with exponential backoff
- **Error Handling** - Failed jobs logged and retried
- **Job Retention** - Last 100 completed, 500 failed jobs kept

## Integration with AmCare OS

The integration automatically:
1. Logs all API calls to audit trail
2. Creates tasks in AmCare OS
3. Updates appointment status
4. Sends notifications via Klarity (if configured)

## Error Handling

- **API Errors** - Retried with exponential backoff
- **Webhook Errors** - Logged and queued for retry
- **Queue Errors** - Jobs retried automatically
- **Network Errors** - Handled gracefully

## Monitoring

### Health Check

```bash
curl http://localhost:3006/health
```

### Queue Status

```typescript
const queue = queueManager.getQueue('spruce-webhooks');
const waiting = await queue.getWaitingCount();
const active = await queue.getActiveCount();
const completed = await queue.getCompletedCount();
const failed = await queue.getFailedCount();
```

## Security

- **Webhook Signature Verification** - HMAC-SHA256 verification
- **Token Management** - Automatic token refresh
- **Audit Logging** - All actions logged
- **Error Sanitization** - Sensitive data not exposed

## License

Proprietary - AmCare Internal Use Only
