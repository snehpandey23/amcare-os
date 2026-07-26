export type Role = 'admin' | 'clinician' | 'staff' | 'billing' | 'patient';

export interface SessionContext {
  userId: string;
  orgId: string;
  role: Role;
}

export interface AuditEvent {
  id: string;
  orgId: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Patient {
  id: string;
  orgId: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  insurance?: string;
}

export interface Encounter {
  id: string;
  orgId: string;
  patientId: string;
  clinicianId: string;
  status: 'open' | 'closed';
  diagnosis?: string;
  createdAt: string;
}

export interface ClinicalNote {
  id: string;
  orgId: string;
  patientId: string;
  encounterId: string;
  draft: string;
  signed: boolean;
  signedAt?: string;
}

export interface Appointment {
  id: string;
  orgId: string;
  patientId: string;
  providerName: string;
  startAt: string;
  status: 'booked' | 'completed' | 'cancelled' | 'no_show';
  visitType: 'virtual' | 'in_person';
}

export interface TaskItem {
  id: string;
  orgId: string;
  patientId?: string;
  ownerRole: Role;
  title: string;
  status: 'open' | 'in_progress' | 'done';
  source: 'manual' | 'automation' | 'agent';
}

export interface MessageThread {
  id: string;
  orgId: string;
  patientId: string;
  channel: 'in_app' | 'sms' | 'internal';
  latestMessage: string;
  updatedAt: string;
}

export type AgentName =
  | 'front_desk'
  | 'patient_triager'
  | 'medical_scribe'
  | 'billing'
  | 'prior_auth_supervisor'
  | 'medical_assistant'
  | 'compliance_manager';

export interface AgentSuggestion {
  id: string;
  orgId: string;
  agent: AgentName;
  patientId?: string;
  kind: 'note_draft' | 'coding' | 'task' | 'compliance_alert';
  content: string;
  confidence: number;
  requiresApproval: boolean;
  approved: boolean;
  createdAt: string;
}

export const canAccess = (role: Role, action: string) => {
  const map: Record<Role, string[]> = {
    admin: ['*'],
    clinician: ['patient:read', 'patient:write', 'note:write', 'note:sign', 'task:read'],
    staff: ['patient:read', 'appointment:write', 'task:write', 'message:write'],
    billing: ['patient:read', 'claim:write', 'task:write', 'audit:billing_read'],
    patient: ['self:read', 'message:write'],
  };

  return map[role].includes('*') || map[role].includes(action);
};
