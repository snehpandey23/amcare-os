/**
 * Klarity Webhook Payload Types
 */

export interface KlarityWebhookBase {
  event: string;
  timestamp: string;
  webhook_id: string;
}

export interface KlarityFaxReceivedPayload extends KlarityWebhookBase {
  event: 'fax.received';
  data: {
    fax_id: string;
    patient_id?: string;
    patient_name?: string;
    from_number: string;
    to_number: string;
    pages: number;
    file_url: string;
    received_at: string;
    metadata?: Record<string, any>;
  };
}

export interface KlarityFormSubmittedPayload extends KlarityWebhookBase {
  event: 'form.submitted';
  data: {
    form_id: string;
    patient_id: string;
    patient_name: string;
    patient_email?: string;
    form_type: string;
    form_name: string;
    submission_date: string;
    form_data: Record<string, any>;
    status: 'submitted' | 'reviewed' | 'approved';
    appointment_id?: string;
  };
}

export type KlarityWebhookPayload = KlarityFaxReceivedPayload | KlarityFormSubmittedPayload;
