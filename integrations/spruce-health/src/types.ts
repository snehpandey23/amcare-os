/**
 * Spruce Health API Types
 */

export interface SpruceAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  timezone: string;
  appointmentType: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'overdue';
  amountDue: number;
  currency: string;
  providerId?: string;
  providerName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpruceMessage {
  id: string;
  patientId: string;
  patientName: string;
  type: 'sms' | 'email' | 'in_app';
  direction: 'inbound' | 'outbound';
  subject?: string;
  body: string;
  status: 'sent' | 'delivered' | 'failed' | 'read';
  sentAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

export interface SpruceTask {
  id: string;
  type: 'payment_check' | 'form_completion' | 'pre_charting' | 'chat_review' | 'fax_handling' | 'note_locking';
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CancelAppointmentRequest {
  appointmentId: string;
  reason: string;
  notifyPatient: boolean;
  cancellationNotes?: string;
}

export interface CancelAppointmentResponse {
  success: boolean;
  appointmentId: string;
  cancelledAt: string;
  message?: string;
}

export interface LockNoteRequest {
  noteId: string;
  encounterId: string;
  patientId: string;
  lockedBy: string;
  lockReason?: string;
}

export interface LockNoteResponse {
  success: boolean;
  noteId: string;
  lockedAt: string;
  message?: string;
}

export interface AppointmentQueryParams {
  paymentStatus?: 'paid' | 'unpaid' | 'partial' | 'overdue';
  hoursBefore?: number; // Default 24 for unpaid appointments
  startDate?: string;
  endDate?: string;
  status?: string;
  patientId?: string;
}

export interface MessageQueryParams {
  hoursBack?: number; // Default 48
  patientId?: string;
  type?: 'sms' | 'email' | 'in_app';
  direction?: 'inbound' | 'outbound';
}

export interface TaskQueryParams {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  type?: string;
  patientId?: string;
  assignedTo?: string;
}

// Webhook Event Types
export interface AppointmentCreatedEvent {
  event: 'appointment.created';
  timestamp: string;
  data: {
    appointment: SpruceAppointment;
    patient: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
  };
}

export interface PaymentFailedEvent {
  event: 'payment.failed';
  timestamp: string;
  data: {
    appointmentId: string;
    patientId: string;
    patientName: string;
    amount: number;
    currency: string;
    failureReason: string;
    transactionId?: string;
    retryAttempt?: number;
  };
}

export type SpruceWebhookEvent = AppointmentCreatedEvent | PaymentFailedEvent;

// Queue Job Types
export interface QueueJobData {
  type: string;
  payload: any;
  retries?: number;
  delay?: number;
}

export interface EventPayload {
  eventType: string;
  data: any;
  timestamp: Date;
  source: 'spruce_health';
}
