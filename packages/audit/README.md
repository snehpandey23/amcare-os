# HIPAA-Compliant Audit Logging System

Comprehensive audit logging system that logs all access to patient data with timestamp, user ID, and action type. Includes audit report generator for compliance reporting.

## Features

- ✅ **Automatic Logging** - Middleware automatically logs all API requests
- ✅ **Patient Data Tracking** - All patient data access is logged
- ✅ **Comprehensive Metadata** - Timestamp, user ID, IP address, action type, etc.
- ✅ **Immutability** - Logs cannot be deleted or modified
- ✅ **Report Generation** - Generate PDF, CSV, and JSON reports
- ✅ **Query Interface** - Powerful querying capabilities
- ✅ **HIPAA Compliant** - 7-year retention, data integrity, audit trails

## Quick Start

### Basic Usage

```typescript
import { AuditService, AuditActionType, AuditResourceType } from '@amcare/audit';

// Log patient data access
await AuditService.logPatientAccess(
  'user_123',
  'patient_456',
  AuditActionType.PATIENT_VIEW,
  {
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userRole: 'provider',
    patientName: 'Jane Smith',
    ipAddress: '192.168.1.1',
    description: 'Viewed patient record',
  }
);

// Log general audit event
await AuditService.log({
  userId: 'user_123',
  actionType: AuditActionType.RECORD_UPDATE,
  resourceType: AuditResourceType.MEDICAL_RECORD,
  resourceId: 'record_789',
  patientId: 'patient_456',
  description: 'Updated medical record',
  severity: AuditSeverity.HIGH,
  success: true,
});
```

### Express Middleware

```typescript
import express from 'express';
import { auditMiddleware, logPatientAccess } from '@amcare/audit';

const app = express();

// Log all requests
app.use(auditMiddleware);

// Log specific patient access
app.get('/api/patients/:patientId', 
  logPatientAccess(AuditActionType.PATIENT_VIEW),
  (req, res) => {
    // Your route handler
  }
);
```

## Querying Audit Logs

### Get Patient Access History

```typescript
const logs = await AuditService.getPatientAccessHistory('patient_456', 100);
```

### Get User Activity

```typescript
const logs = await AuditService.getUserActivityHistory('user_123', 100);
```

### Custom Query

```typescript
const logs = await AuditService.query({
  patientId: 'patient_456',
  actionType: [AuditActionType.PATIENT_VIEW, AuditActionType.PATIENT_UPDATE],
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  severity: AuditSeverity.HIGH,
  limit: 1000,
});
```

## Report Generation

### Generate Comprehensive Report

```typescript
import { AuditReportGenerator } from '@amcare/audit';

const report = await AuditReportGenerator.generateReport(
  new Date('2024-01-01'),
  new Date('2024-01-31'),
  'admin_user',
  {
    includeLogs: true,
    reportType: 'detailed',
  }
);
```

### Generate Patient Access Report

```typescript
const report = await AuditReportGenerator.generatePatientAccessReport(
  'patient_456',
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
```

### Generate User Activity Report

```typescript
const report = await AuditReportGenerator.generateUserActivityReport(
  'user_123',
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
```

### Export Reports

```typescript
// Export to PDF
await AuditReportGenerator.exportToPDF(report, './reports/audit-report.pdf');

// Export to CSV
await AuditReportGenerator.exportToCSV(report, './reports/audit-report.csv');

// Export to JSON
await AuditReportGenerator.exportToJSON(report, './reports/audit-report.json');
```

## Action Types

### Patient Data Access
- `PATIENT_VIEW` - View patient information
- `PATIENT_CREATE` - Create new patient
- `PATIENT_UPDATE` - Update patient information
- `PATIENT_DELETE` - Delete patient (critical)
- `PATIENT_EXPORT` - Export patient data
- `PATIENT_SEARCH` - Search patients

### Medical Records
- `RECORD_VIEW` - View medical record
- `RECORD_CREATE` - Create medical record
- `RECORD_UPDATE` - Update medical record
- `RECORD_DELETE` - Delete medical record (critical)
- `RECORD_PRINT` - Print medical record
- `RECORD_EXPORT` - Export medical record

### Appointments
- `APPOINTMENT_VIEW` - View appointment
- `APPOINTMENT_CREATE` - Create appointment
- `APPOINTMENT_UPDATE` - Update appointment
- `APPOINTMENT_DELETE` - Delete appointment

### Authentication
- `LOGIN` - User login
- `LOGOUT` - User logout
- `LOGIN_FAILED` - Failed login attempt
- `PASSWORD_CHANGE` - Password changed

## Severity Levels

- **LOW** - Routine operations (viewing, searching)
- **MEDIUM** - Standard operations (viewing patient data)
- **HIGH** - Sensitive operations (updates, exports)
- **CRITICAL** - Dangerous operations (deletions, system changes)

## Database Schema

The audit logs table includes:

- User information (ID, name, email, role)
- Action details (type, resource, description)
- Patient information (if applicable)
- Request details (IP, user agent, method, path)
- Response information (status, errors)
- Change tracking (what changed)
- Metadata (additional context)
- Severity and success status

## HIPAA Compliance

### Requirements Met

1. **Access Logging** - All access to patient data is logged
2. **User Identification** - User ID, name, email, role tracked
3. **Timestamp** - Precise timestamp for all actions
4. **Action Type** - Detailed action classification
5. **Immutability** - Logs cannot be deleted or modified
6. **Retention** - 7-year retention period (2555 days)
7. **Data Integrity** - Immutable logs ensure integrity
8. **Audit Trail** - Complete trail of all actions

### Compliance Features

- **Immutability Triggers** - Database triggers prevent deletion/updates
- **Indexed Queries** - Fast queries for compliance audits
- **Report Generation** - Automated compliance reports
- **Export Capabilities** - PDF, CSV, JSON exports for auditors

## Performance

### Indexes

The system includes optimized indexes for:
- Patient access queries
- User activity queries
- Time range queries
- Action type queries
- Severity-based queries
- Failed action queries

### Query Optimization

- Compound indexes for common query patterns
- Partial indexes for filtered queries
- Text search indexes for description searches
- Partitioning support for large datasets

## Monitoring

### Suspicious Activity Detection

```sql
SELECT * FROM check_suspicious_activity('user_123', 24);
```

### Patient Access Summary

```sql
SELECT * FROM patient_access_summary WHERE patient_id = 'patient_456';
```

### User Activity Summary

```sql
SELECT * FROM user_activity_summary WHERE user_id = 'user_123';
```

## Best Practices

1. **Always Log Patient Access** - Use `logPatientAccess` for patient data
2. **Include Context** - Provide detailed descriptions
3. **Set Appropriate Severity** - Use severity levels correctly
4. **Regular Reports** - Generate compliance reports regularly
5. **Monitor Activity** - Review logs for suspicious activity
6. **Retention Policy** - Maintain 7-year retention period

## Security

- **Sensitive Data Redaction** - Passwords, SSNs automatically redacted
- **IP Tracking** - All requests tracked by IP address
- **Session Tracking** - Session IDs tracked for correlation
- **Error Logging** - Failed actions logged with error details

## License

Proprietary - AmCare Internal Use Only
