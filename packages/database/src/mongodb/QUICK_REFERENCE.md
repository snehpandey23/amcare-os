# MongoDB Schema Quick Reference

## Appointment Model

### Status Values
- `scheduled` - Appointment is scheduled
- `confirmed` - Patient confirmed
- `checked_in` - Patient checked in
- `in_progress` - Appointment in progress
- `completed` - Appointment completed
- `cancelled` - Appointment cancelled
- `no_show` - Patient did not show

### Pre-Charting Status
- `not_started` - Pre-charting not started
- `in_progress` - Pre-charting in progress
- `completed` - Pre-charting completed
- `reviewed` - Pre-charting reviewed

### Key Queries
```typescript
// Find appointments needing pre-charting (24 hours before)
const pending = await Appointment.findPendingPreCharting(24);

// Find patient appointments
const appointments = await Appointment.findByPatient('pat_123');

// Find provider appointments
const providerAppts = await Appointment.findByProvider('prov_456', startDate, endDate);

// Mark pre-charting complete
await appointment.markPreChartingComplete('user_123', 'Notes');
```

---

## FormCompletion Model

### Status Values
- `not_started` - Form not started
- `in_progress` - Form in progress
- `submitted` - Form submitted (needs review)
- `reviewed` - Form reviewed
- `approved` - Form approved
- `rejected` - Form rejected
- `requires_revision` - Form needs revision

### Form Types
- `new_patient_intake`
- `annual_update`
- `medical_history`
- `consent_form`
- `insurance_verification`
- `pharmacy_form`
- `referral_form`
- `other`

### Key Queries
```typescript
// Find pending forms
const pending = await FormCompletion.findPending();

// Find overdue forms
const overdue = await FormCompletion.findOverdue();

// Find forms needing review
const needsReview = await FormCompletion.findNeedingReview();

// Submit form
await form.submit('user_123');

// Approve form
await form.approve('provider_456', 'Approved');
```

---

## NoteStatus Model

### Status Values
- `draft` - Note in draft
- `in_progress` - Note being written
- `pending_review` - Note submitted for review
- `reviewed` - Note reviewed
- `locked` - Note locked (finalized)
- `amended` - Note amended after locking

### Note Types
- `encounter_note`
- `progress_note`
- `consultation_note`
- `procedure_note`
- `discharge_note`
- `telehealth_note`
- `other`

### Key Queries
```typescript
// Find notes needing locking (4+ hours after completion)
const needsLocking = await NoteStatus.findNeedingLocking();

// Find notes pending review
const pendingReview = await NoteStatus.findPendingReview();

// Complete note
await note.complete('provider_123');

// Lock note (required within 4 hours)
await note.lock('system', 'Auto-lock');

// Find patient notes
const patientNotes = await NoteStatus.findByPatient('pat_123');
```

---

## Common Query Patterns

### Patient Encounter Summary
```typescript
const [appointments, forms, notes] = await Promise.all([
  Appointment.find({ patientId: 'pat_123' }).sort({ appointmentDate: -1 }),
  FormCompletion.find({ patientId: 'pat_123' }).sort({ createdAt: -1 }),
  NoteStatus.find({ patientId: 'pat_123' }).sort({ encounterDate: -1 }),
]);
```

### Daily Dashboard Queries
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const [todayAppointments, pendingForms, notesNeedingLock] = await Promise.all([
  Appointment.find({
    appointmentDate: { $gte: today, $lt: tomorrow },
    status: { $in: ['scheduled', 'confirmed'] },
  }),
  FormCompletion.findPending(),
  NoteStatus.findNeedingLocking(),
]);
```

### Provider Schedule
```typescript
const startDate = new Date('2024-01-20');
const endDate = new Date('2024-01-27');

const schedule = await Appointment.findByProvider('prov_123', startDate, endDate);
```

---

## Index Usage

All models include optimized compound indexes for:
- Patient-centric queries
- Provider queries
- Status-based filtering
- Date range queries
- Zoho synchronization
- Text search

Indexes are automatically created when models are first used.
