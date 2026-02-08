# MongoDB Schema Documentation

Comprehensive MongoDB schemas for patient encounters with optimized indexes for fast queries.

## Models

### 1. Appointment Model

Tracks patient appointments with pre-charting status.

**Key Features:**
- Patient and provider information
- Pre-charting status tracking
- Appointment status workflow
- Telehealth support
- Zoho integration

**Indexes:**
- `patientId + appointmentDate` - Patient appointment history
- `providerId + appointmentDate` - Provider schedule
- `preChartingStatus + appointmentDate` - Pre-charting queries
- `status + appointmentDate` - Status-based queries
- `zohoRecordId` - Zoho sync
- Text search on `patientName`

**Usage:**
```typescript
import { Appointment, AppointmentStatus, PreChartingStatus } from '@amcare/database/mongodb';

// Create appointment
const appointment = new Appointment({
  patientId: 'pat_123',
  patientName: 'John Doe',
  appointmentDate: new Date('2024-01-20'),
  appointmentTime: '10:00 AM',
  appointmentType: 'Consultation',
  status: AppointmentStatus.SCHEDULED,
  preChartingStatus: PreChartingStatus.NOT_STARTED,
});

// Find pending pre-charting
const pending = await Appointment.findPendingPreCharting(24);

// Mark pre-charting complete
await appointment.markPreChartingComplete('user_123', 'All items reviewed');
```

---

### 2. FormCompletion Model

Tracks patient form submissions and completion status.

**Key Features:**
- Multiple form types
- Status workflow (not_started → submitted → reviewed → approved)
- Review and approval tracking
- Due date management
- Reminder system

**Indexes:**
- `patientId + status + createdAt` - Patient form history
- `appointmentId + status` - Appointment-related forms
- `formType + status + dueDate` - Form type queries
- `status + isRequired + dueDate` - Pending forms
- `zohoRecordId` - Zoho sync
- Text search on `patientName`

**Usage:**
```typescript
import { FormCompletion, FormType, FormCompletionStatus } from '@amcare/database/mongodb';

// Create form
const form = new FormCompletion({
  patientId: 'pat_123',
  patientName: 'John Doe',
  formType: FormType.NEW_PATIENT_INTAKE,
  formName: 'New Patient Intake Form',
  status: FormCompletionStatus.NOT_STARTED,
  formData: { /* form fields */ },
  isRequired: true,
  dueDate: new Date('2024-01-25'),
});

// Submit form
await form.submit('user_123');

// Approve form
await form.approve('provider_456', 'All information verified');

// Find overdue forms
const overdue = await FormCompletion.findOverdue();
```

---

### 3. NoteStatus Model

Tracks clinical note status and locking for HIPAA compliance.

**Key Features:**
- Note status workflow
- Automatic locking after 4 hours
- Amendment tracking
- Audit trail
- HIPAA compliance

**Indexes:**
- `patientId + encounterDate + status` - Patient notes
- `providerId + encounterDate + status` - Provider notes
- `encounterId + status` - Encounter notes
- `status: PENDING_REVIEW + encounterDate` - Notes needing review
- `isLocked: false + status + encounterDate` - Unlocked notes
- `zohoRecordId` - Zoho sync
- Text search on `patientName + noteTitle`

**Usage:**
```typescript
import { NoteStatus, NoteType, NoteStatus as NoteStatusEnum } from '@amcare/database/mongodb';

// Create note
const note = new NoteStatus({
  patientId: 'pat_123',
  patientName: 'John Doe',
  noteId: 'note_456',
  noteType: NoteType.ENCOUNTER_NOTE,
  noteTitle: 'Follow-up Visit',
  status: NoteStatusEnum.DRAFT,
  encounterId: 'enc_789',
  encounterDate: new Date(),
  providerId: 'prov_123',
  providerName: 'Dr. Smith',
  createdBy: 'user_123',
  hipaaCompliant: true,
  auditTrail: [],
});

// Complete note
await note.complete('provider_123');

// Lock note (required within 4 hours)
await note.lock('system', 'Automatic lock after completion');

// Find notes needing locking
const needsLocking = await NoteStatus.findNeedingLocking();
```

---

## Connection

```typescript
import mongoConnection from '@amcare/database/mongodb/connection';

// Connect
await mongoConnection.connect();

// Check connection
if (mongoConnection.connected) {
  console.log('Connected to MongoDB');
}

// Disconnect
await mongoConnection.disconnect();
```

---

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/amcare_os
# or
DATABASE_URL=mongodb://localhost:27017/amcare_os
MONGODB_POOL_SIZE=10
```

---

## Query Examples

### Find appointments needing pre-charting
```typescript
const appointments = await Appointment.findPendingPreCharting(24);
```

### Find patient's pending forms
```typescript
const forms = await FormCompletion.find({
  patientId: 'pat_123',
  status: { $in: [FormCompletionStatus.NOT_STARTED, FormCompletionStatus.IN_PROGRESS] },
  isRequired: true,
}).sort({ dueDate: 1 });
```

### Find notes needing review
```typescript
const notes = await NoteStatus.findPendingReview();
```

### Find notes overdue for locking
```typescript
const overdueNotes = await NoteStatus.findNeedingLocking();
```

### Complex query: Patient encounter summary
```typescript
const encounterSummary = await Promise.all([
  Appointment.find({ patientId: 'pat_123', appointmentDate: { $gte: startDate } }),
  FormCompletion.find({ patientId: 'pat_123', createdAt: { $gte: startDate } }),
  NoteStatus.find({ patientId: 'pat_123', encounterDate: { $gte: startDate } }),
]);
```

---

## Index Strategy

All indexes are optimized for:
1. **Patient-centric queries** - Fast patient history retrieval
2. **Provider queries** - Efficient provider schedule and notes
3. **Status-based filtering** - Quick status workflow queries
4. **Date range queries** - Efficient time-based filtering
5. **Zoho sync** - Fast integration sync queries
6. **Text search** - Patient name and note title searches

---

## Performance Considerations

- **Compound indexes** are used for multi-field queries
- **Sparse indexes** for optional fields reduce index size
- **Text indexes** enable full-text search
- **TTL indexes** can be added for data retention (if needed)

---

## HIPAA Compliance

- All models include audit trails
- Note locking prevents unauthorized modifications
- Timestamps track all changes
- User tracking for all actions
- Zoho integration maintains data consistency
