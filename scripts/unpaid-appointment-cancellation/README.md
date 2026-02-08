# Unpaid Appointment Cancellation Script

Automated script that runs every 30 minutes to check Zoho for unpaid appointments, fetch patient contact information, and send cancellation messages via Klarity.

## Features

- ✅ **Automated Scheduling** - Runs every 30 minutes via cron
- ✅ **Zoho Integration** - Fetches unpaid appointments and patient contact info
- ✅ **Klarity Integration** - Sends cancellation messages via email or SMS
- ✅ **Comprehensive Logging** - Tracks all operations and results
- ✅ **Error Handling** - Robust error handling with retry logic
- ✅ **HIPAA Compliant** - All actions logged to audit trail

## Configuration

### Environment Variables

```env
# Zoho Configuration
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token

# Klarity Configuration
KLARITY_API_KEY=your_klarity_api_key
KLARITY_API_URL=https://api.klarity.com

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/amcare_os

# Scheduler Configuration (optional)
CANCELLATION_SCRIPT_CRON=*/30 * * * *  # Every 30 minutes
RUN_ON_START=true  # Run immediately on startup
```

### Cron Expression

Default: `*/30 * * * *` (every 30 minutes)

Customize via `CANCELLATION_SCRIPT_CRON` environment variable.

## Installation

```bash
cd scripts/unpaid-appointment-cancellation
npm install
npm run build
```

## Usage

### Run Once

```bash
npm start
# or
node dist/index.js
```

### Run with Scheduler

```bash
npm run schedule
# or
node dist/scheduler.js
```

### Development

```bash
npm run dev
```

## How It Works

1. **Fetch Unpaid Appointments** - Queries Zoho for appointments with unpaid balances within 24 hours
2. **Fetch Contact Info** - Retrieves patient email and phone from Zoho
3. **Send Messages** - Sends cancellation messages via Klarity (email or SMS)
4. **Log Results** - Records all operations to database and audit trail

## Message Templates

### Email Template
```
Dear [Patient Name],

We regret to inform you that your appointment scheduled for [Date] at [Time] has been cancelled due to an outstanding balance.

Appointment Details:
- Type: [Type]
- Date: [Date]
- Time: [Time]
- Amount Due: [Currency] [Amount]

To reschedule your appointment, please contact us to resolve the outstanding balance.

Best regards,
AmCare Team
```

### SMS Template
```
AmCare: Your [Date] appointment is cancelled due to unpaid balance ([Currency] [Amount]). Please contact us to reschedule.
```

## Database Schema

The script creates/uses the following tables:

- `unpaid_appointment_checks` - Script execution logs
- `cancellation_messages` - Message sending history
- `unpaid_appointments` - Tracked unpaid appointments

Run migrations:
```sql
-- See src/database/migrations.sql
```

## Monitoring

### Check Recent Executions

```sql
SELECT * FROM unpaid_appointment_checks 
ORDER BY timestamp DESC 
LIMIT 10;
```

### Check Failed Messages

```sql
SELECT * FROM cancellation_messages 
WHERE status = 'failed' 
ORDER BY sent_at DESC;
```

### Check Unpaid Appointments

```sql
SELECT * FROM unpaid_appointments 
WHERE resolved_at IS NULL 
ORDER BY appointment_date ASC;
```

## Error Handling

- **Zoho API Errors** - Logged and script continues with next appointment
- **Klarity API Errors** - Message marked as failed, logged with error details
- **Missing Contact Info** - Appointment skipped, logged as error
- **Network Errors** - Retried automatically (if retry logic implemented)

## Logging

All operations are logged to:
1. **Console** - Real-time execution logs
2. **Database** - Structured logs in `unpaid_appointment_checks` and `cancellation_messages`
3. **Audit Trail** - HIPAA-compliant audit logs via `@amcare/audit`

## Scheduling Options

### Using PM2

```bash
pm2 start dist/scheduler.js --name unpaid-appointment-cancellation
pm2 save
```

### Using systemd

Create `/etc/systemd/system/unpaid-appointment-cancellation.service`:

```ini
[Unit]
Description=Unpaid Appointment Cancellation Script
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/path/to/amcare-os/scripts/unpaid-appointment-cancellation
ExecStart=/usr/bin/node dist/scheduler.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Using Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["node", "dist/scheduler.js"]
```

## Testing

### Test Zoho Connection

```typescript
import { ZohoService } from './services/zohoService';

const zoho = new ZohoService();
const appointments = await zoho.fetchUnpaidAppointments(24);
console.log('Unpaid appointments:', appointments);
```

### Test Klarity Connection

```typescript
import { KlarityService } from './services/klarityService';

const klarity = new KlarityService();
const message = await klarity.sendCancellationMessage(
  appointment,
  'email',
  { email: 'test@example.com' }
);
console.log('Message sent:', message);
```

## Troubleshooting

### No appointments found
- Check Zoho API credentials
- Verify appointment status in Zoho
- Check payment status logic

### Messages not sending
- Verify Klarity API key
- Check contact information availability
- Review Klarity API logs

### Database errors
- Verify database connection
- Run migrations
- Check table permissions

## Security

- All API keys stored in environment variables
- Database credentials never logged
- Patient information handled per HIPAA guidelines
- All actions logged to audit trail

## License

Proprietary - AmCare Internal Use Only
