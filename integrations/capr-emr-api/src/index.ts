import express from 'express';
import dotenv from 'dotenv';
import { canAccess } from '@amcare/emr-core';
import type {
  Appointment,
  AuditEvent,
  ClinicalNote,
  Encounter,
  MessageThread,
  Patient,
  SessionContext,
  TaskItem,
  AgentSuggestion,
} from '@amcare/emr-core';

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' }));

const port = parseInt(process.env.CAPR_EMR_API_PORT || '3020', 10);

const patients: Patient[] = [];
const encounters: Encounter[] = [];
const notes: ClinicalNote[] = [];
const appointments: Appointment[] = [];
const tasks: TaskItem[] = [];
const messages: MessageThread[] = [];
const auditLog: AuditEvent[] = [];
const suggestions: AgentSuggestion[] = [];
const intakeForms: Array<{
  id: string;
  orgId: string;
  patientId: string;
  answers: Record<string, string>;
  completedAt: string;
}> = [];
const caregiverLinks: Array<{
  id: string;
  orgId: string;
  patientId: string;
  caregiverName: string;
  relationship: string;
}> = [];

const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();

const withSession = (req: express.Request): SessionContext => ({
  userId: String(req.headers['x-user-id'] || 'demo-user'),
  orgId: String(req.headers['x-org-id'] || 'demo-org'),
  role: (req.headers['x-role'] as SessionContext['role']) || 'admin',
});

const audit = (
  session: SessionContext,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, unknown>,
) => {
  auditLog.push({
    id: id('audit'),
    orgId: session.orgId,
    actorUserId: session.userId,
    action,
    resourceType,
    resourceId,
    timestamp: now(),
    metadata,
  });
};

const requireAccess =
  (action: string) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const session = withSession(req);
    if (!canAccess(session.role, action)) {
      return res.status(403).json({ error: `Forbidden for role ${session.role}` });
    }
    return next();
  };

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'capr-emr-api' });
});

app.get('/api/patients', requireAccess('patient:read'), (req, res) => {
  const session = withSession(req);
  const rows = patients.filter((row) => row.orgId === session.orgId);
  audit(session, 'patient.list', 'patient', 'bulk');
  res.json({ patients: rows });
});

app.post('/api/patients', requireAccess('patient:write'), (req, res) => {
  const session = withSession(req);
  const payload = req.body as Partial<Patient>;
  if (!payload.firstName || !payload.lastName || !payload.dob) {
    return res.status(400).json({ error: 'firstName, lastName, dob are required' });
  }

  const patient: Patient = {
    id: id('pat'),
    orgId: session.orgId,
    mrn: payload.mrn || `MRN-${Math.floor(Math.random() * 100000)}`,
    firstName: payload.firstName,
    lastName: payload.lastName,
    dob: payload.dob,
    insurance: payload.insurance || 'Unknown',
  };
  patients.push(patient);
  audit(session, 'patient.create', 'patient', patient.id);
  res.status(201).json({ patient });
});

app.get('/api/encounters', requireAccess('patient:read'), (req, res) => {
  const session = withSession(req);
  res.json({ encounters: encounters.filter((row) => row.orgId === session.orgId) });
});

app.post('/api/encounters', requireAccess('patient:write'), (req, res) => {
  const session = withSession(req);
  const payload = req.body as Partial<Encounter>;
  if (!payload.patientId) {
    return res.status(400).json({ error: 'patientId is required' });
  }
  const encounter: Encounter = {
    id: id('enc'),
    orgId: session.orgId,
    patientId: payload.patientId,
    clinicianId: session.userId,
    status: 'open',
    diagnosis: payload.diagnosis,
    createdAt: now(),
  };
  encounters.push(encounter);
  audit(session, 'encounter.create', 'encounter', encounter.id);
  res.status(201).json({ encounter });
});

app.post('/api/notes/draft', requireAccess('note:write'), (req, res) => {
  const session = withSession(req);
  const payload = req.body as { patientId?: string; encounterId?: string; transcript?: string };
  if (!payload.patientId || !payload.encounterId) {
    return res.status(400).json({ error: 'patientId and encounterId required' });
  }

  const draft = `S: ${payload.transcript || 'Patient reports fatigue.'}\nA: Pending clinician review.\nP: Follow-up in 2 weeks.`;
  const note: ClinicalNote = {
    id: id('note'),
    orgId: session.orgId,
    patientId: payload.patientId,
    encounterId: payload.encounterId,
    draft,
    signed: false,
  };
  notes.push(note);

  const suggestion: AgentSuggestion = {
    id: id('sugg'),
    orgId: session.orgId,
    agent: 'medical_scribe',
    patientId: payload.patientId,
    kind: 'note_draft',
    content: draft,
    confidence: 0.82,
    requiresApproval: true,
    approved: false,
    createdAt: now(),
  };
  suggestions.push(suggestion);
  audit(session, 'note.draft.create', 'note', note.id, { suggestionId: suggestion.id });
  res.status(201).json({ note, suggestion });
});

app.post('/api/notes/:id/sign', requireAccess('note:sign'), (req, res) => {
  const session = withSession(req);
  const note = notes.find((row) => row.id === req.params.id && row.orgId === session.orgId);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  note.signed = true;
  note.signedAt = now();
  audit(session, 'note.sign', 'note', note.id);
  res.json({ note });
});

app.get('/api/appointments', requireAccess('patient:read'), (req, res) => {
  const session = withSession(req);
  res.json({ appointments: appointments.filter((row) => row.orgId === session.orgId) });
});

app.post('/api/appointments', requireAccess('appointment:write'), (req, res) => {
  const session = withSession(req);
  const payload = req.body as Partial<Appointment>;
  if (!payload.patientId || !payload.providerName || !payload.startAt || !payload.visitType) {
    return res.status(400).json({ error: 'patientId, providerName, startAt, visitType are required' });
  }
  const appointment: Appointment = {
    id: id('appt'),
    orgId: session.orgId,
    patientId: payload.patientId,
    providerName: payload.providerName,
    startAt: payload.startAt,
    status: 'booked',
    visitType: payload.visitType,
  };
  appointments.push(appointment);
  audit(session, 'appointment.create', 'appointment', appointment.id);
  res.status(201).json({ appointment });
});

app.get('/api/tasks', requireAccess('task:read'), (req, res) => {
  const session = withSession(req);
  res.json({ tasks: tasks.filter((row) => row.orgId === session.orgId) });
});

app.post('/api/tasks', requireAccess('task:write'), (req, res) => {
  const session = withSession(req);
  const payload = req.body as Partial<TaskItem>;
  if (!payload.title || !payload.ownerRole) {
    return res.status(400).json({ error: 'title and ownerRole required' });
  }
  const task: TaskItem = {
    id: id('task'),
    orgId: session.orgId,
    patientId: payload.patientId,
    ownerRole: payload.ownerRole,
    title: payload.title,
    status: 'open',
    source: payload.source || 'manual',
  };
  tasks.push(task);
  audit(session, 'task.create', 'task', task.id);
  res.status(201).json({ task });
});

app.post('/api/messages', requireAccess('message:write'), (req, res) => {
  const session = withSession(req);
  const payload = req.body as Partial<MessageThread>;
  if (!payload.patientId || !payload.channel || !payload.latestMessage) {
    return res.status(400).json({ error: 'patientId, channel, latestMessage required' });
  }
  const thread: MessageThread = {
    id: id('msg'),
    orgId: session.orgId,
    patientId: payload.patientId,
    channel: payload.channel,
    latestMessage: payload.latestMessage,
    updatedAt: now(),
  };
  messages.push(thread);
  audit(session, 'message.create', 'message_thread', thread.id);
  res.status(201).json({ thread });
});

app.get('/api/messages', requireAccess('task:read'), (req, res) => {
  const session = withSession(req);
  res.json({ threads: messages.filter((row) => row.orgId === session.orgId) });
});

app.post('/api/patient/intake', requireAccess('message:write'), (req, res) => {
  const session = withSession(req);
  const payload = req.body as { patientId?: string; answers?: Record<string, string> };
  if (!payload.patientId || !payload.answers) {
    return res.status(400).json({ error: 'patientId and answers required' });
  }
  const form = {
    id: id('form'),
    orgId: session.orgId,
    patientId: payload.patientId,
    answers: payload.answers,
    completedAt: now(),
  };
  intakeForms.push(form);
  audit(session, 'patient.intake.submit', 'intake_form', form.id);
  res.status(201).json({ form });
});

app.get('/api/patient/intake/:patientId', requireAccess('patient:read'), (req, res) => {
  const session = withSession(req);
  const forms = intakeForms.filter(
    (row) => row.orgId === session.orgId && row.patientId === req.params.patientId,
  );
  res.json({ forms });
});

app.post('/api/patient/caregivers', requireAccess('patient:write'), (req, res) => {
  const session = withSession(req);
  const payload = req.body as {
    patientId?: string;
    caregiverName?: string;
    relationship?: string;
  };
  if (!payload.patientId || !payload.caregiverName || !payload.relationship) {
    return res.status(400).json({ error: 'patientId, caregiverName, relationship required' });
  }
  const link = {
    id: id('cg'),
    orgId: session.orgId,
    patientId: payload.patientId,
    caregiverName: payload.caregiverName,
    relationship: payload.relationship,
  };
  caregiverLinks.push(link);
  audit(session, 'patient.caregiver.add', 'caregiver_link', link.id);
  res.status(201).json({ link });
});

app.get('/api/patient/caregivers/:patientId', requireAccess('patient:read'), (req, res) => {
  const session = withSession(req);
  const links = caregiverLinks.filter(
    (row) => row.orgId === session.orgId && row.patientId === req.params.patientId,
  );
  res.json({ caregivers: links });
});

app.get('/api/audit', requireAccess('audit:billing_read'), (req, res) => {
  const session = withSession(req);
  res.json({ events: auditLog.filter((row) => row.orgId === session.orgId) });
});

app.post('/api/automation/lab-result', requireAccess('task:write'), (req, res) => {
  const session = withSession(req);
  const payload = req.body as { patientId?: string; wbc?: number };
  if (!payload.patientId || typeof payload.wbc !== 'number') {
    return res.status(400).json({ error: 'patientId and numeric wbc required' });
  }

  if (payload.wbc > 11) {
    const urgentTask: TaskItem = {
      id: id('task'),
      orgId: session.orgId,
      patientId: payload.patientId,
      ownerRole: 'clinician',
      title: 'High WBC alert: review immediately',
      status: 'open',
      source: 'automation',
    };
    tasks.push(urgentTask);
    audit(session, 'automation.trigger', 'task', urgentTask.id, { rule: 'high_wbc_alert' });
    return res.json({ rule: 'high_wbc_alert', task: urgentTask });
  }

  const followupTask: TaskItem = {
    id: id('task'),
    orgId: session.orgId,
    patientId: payload.patientId,
    ownerRole: 'staff',
    title: 'Re-order labs in 6 months',
    status: 'open',
    source: 'automation',
  };
  tasks.push(followupTask);
  audit(session, 'automation.trigger', 'task', followupTask.id, { rule: 'normal_wbc_followup' });
  res.json({ rule: 'normal_wbc_followup', task: followupTask });
});

app.get('/api/agents/suggestions', requireAccess('task:read'), (req, res) => {
  const session = withSession(req);
  res.json({ suggestions: suggestions.filter((row) => row.orgId === session.orgId) });
});

app.post('/api/agents/suggestions/:id/approve', requireAccess('note:sign'), (req, res) => {
  const session = withSession(req);
  const suggestion = suggestions.find((row) => row.id === req.params.id && row.orgId === session.orgId);
  if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });
  suggestion.approved = true;
  audit(session, 'agent.suggestion.approve', 'agent_suggestion', suggestion.id);
  res.json({ suggestion });
});

app.listen(port, () => {
  console.log(`CAPR EMR API listening on ${port}`);
});
