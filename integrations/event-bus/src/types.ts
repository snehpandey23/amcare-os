/**
 * Master Event Bus Types
 * Central event definitions for all integrations
 */

export enum EventType {
  // Spruce Health Events
  SPRUCE_APPOINTMENT_CREATED = 'spruce.appointment.created',
  SPRUCE_APPOINTMENT_CANCELLED = 'spruce.appointment.cancelled',
  SPRUCE_PAYMENT_FAILED = 'spruce.payment.failed',
  SPRUCE_NOTE_LOCKED = 'spruce.note.locked',
  SPRUCE_MESSAGE_RECEIVED = 'spruce.message.received',

  // Klarity Events
  KLARITY_FORM_SUBMITTED = 'klarity.form.submitted',
  KLARITY_FAX_RECEIVED = 'klarity.fax.received',
  KLARITY_PRE_CHARTING_READY = 'klarity.pre_charting.ready',

  // Carepatron Events
  CAREPATRON_FORM_SUBMITTED = 'carepatron.form.submitted',
  CAREPATRON_FAX_RECEIVED = 'carepatron.fax.received',

  // Zoho Events
  ZOHO_PATIENT_CREATED = 'zoho.patient.created',
  ZOHO_PATIENT_UPDATED = 'zoho.patient.updated',
  ZOHO_PAYMENT_FAILED = 'zoho.payment.failed',
  ZOHO_APPOINTMENT_SYNCED = 'zoho.appointment.synced',
  ZOHO_KPI_UPDATED = 'zoho.kpi.updated',

  // Twilio Events
  TWILIO_CALL_INBOUND = 'twilio.call.inbound',
  TWILIO_CALL_OUTBOUND = 'twilio.call.outbound',
  TWILIO_CALL_COMPLETED = 'twilio.call.completed',
  TWILIO_SMS_SENT = 'twilio.sms.sent',
  TWILIO_SMS_RECEIVED = 'twilio.sms.received',

  // System Events
  DAILY_TASK_COMPLETED = 'system.daily_task.completed',
  AUTOMATION_TRIGGERED = 'system.automation.triggered',
  KPI_REPORT_GENERATED = 'system.kpi_report.generated',
}

export interface BaseEvent {
  eventType: EventType;
  timestamp: Date;
  source: 'spruce' | 'klarity' | 'carepatron' | 'zoho' | 'twilio' | 'system';
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface SpruceAppointmentCreatedEvent extends BaseEvent {
  eventType: EventType.SPRUCE_APPOINTMENT_CREATED;
  data: {
    appointmentId: string;
    patientId: string;
    patientName: string;
    appointmentDate: string;
    paymentStatus: string;
    amountDue: number;
  };
}

export interface KlarityFormSubmittedEvent extends BaseEvent {
  eventType: EventType.KLARITY_FORM_SUBMITTED;
  data: {
    formId: string;
    patientId: string;
    patientName: string;
    formType: string;
    formData: Record<string, any>;
  };
}

export interface KlarityFaxReceivedEvent extends BaseEvent {
  eventType: EventType.KLARITY_FAX_RECEIVED;
  data: {
    faxId: string;
    patientId?: string;
    patientName?: string;
    fromNumber: string;
    pages: number;
    receivedAt: string;
  };
}

export interface ZohoPaymentFailedEvent extends BaseEvent {
  eventType: EventType.ZOHO_PAYMENT_FAILED;
  data: {
    paymentId: string;
    appointmentId: string;
    patientId: string;
    amount: number;
    failureReason: string;
  };
}

export interface TwilioCallCompletedEvent extends BaseEvent {
  eventType: EventType.TWILIO_CALL_COMPLETED;
  data: {
    callSid: string;
    patientId?: string;
    direction: 'inbound' | 'outbound';
    duration: number;
    status: string;
    transcript?: string;
  };
}

export type IntegrationEvent =
  | SpruceAppointmentCreatedEvent
  | KlarityFormSubmittedEvent
  | KlarityFaxReceivedEvent
  | ZohoPaymentFailedEvent
  | TwilioCallCompletedEvent
  | BaseEvent;

export interface EventHandler {
  eventType: EventType | EventType[];
  handle(event: IntegrationEvent): Promise<void>;
}

export interface EventSubscription {
  eventType: EventType;
  handler: (event: IntegrationEvent) => Promise<void>;
  queue?: string;
}
