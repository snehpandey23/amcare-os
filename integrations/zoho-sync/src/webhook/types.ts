/**
 * Zoho Webhook Payload Types
 */

export interface ZohoWebhookBase {
  event: string;
  timestamp: string;
  source: 'zoho_crm' | 'zoho_books';
  webhook_id: string;
}

export interface AppointmentCreatedPayload extends ZohoWebhookBase {
  event: 'appointment_created';
  data: {
    appointment_id: string;
    patient_id: string;
    patient_name: string;
    patient_email?: string;
    patient_phone?: string;
    appointment_date: string;
    appointment_time: string;
    timezone: string;
    provider_id?: string;
    provider_name?: string;
    appointment_type: string;
    status: 'scheduled' | 'confirmed' | 'pending';
    notes?: string;
    created_by?: string;
    zoho_record_id: string;
  };
}

export interface PaymentStatusPayload extends ZohoWebhookBase {
  event: 'payment_status';
  data: {
    payment_id: string;
    invoice_id?: string;
    patient_id: string;
    patient_name: string;
    amount: number;
    currency: string;
    payment_method: string;
    payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
    transaction_id?: string;
    payment_date?: string;
    failure_reason?: string;
    zoho_record_id: string;
  };
}

export interface PatientIntakeSubmittedPayload extends ZohoWebhookBase {
  event: 'patient_intake_submitted';
  data: {
    form_id: string;
    patient_id: string;
    patient_name: string;
    patient_email?: string;
    submission_date: string;
    form_type: string;
    form_data: Record<string, any>;
    status: 'submitted' | 'reviewed' | 'approved';
    appointment_id?: string;
    zoho_record_id: string;
  };
}

export type ZohoWebhookPayload =
  | AppointmentCreatedPayload
  | PaymentStatusPayload
  | PatientIntakeSubmittedPayload;

export interface WebhookProcessingResult {
  success: boolean;
  taskId?: string;
  error?: string;
  retryable: boolean;
  processedAt: Date;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}
