/**
 * Test utilities for webhook handlers
 */

import crypto from 'crypto';
import {
  ZohoWebhookPayload,
  AppointmentCreatedPayload,
  PaymentStatusPayload,
  PatientIntakeSubmittedPayload,
} from './types';

/**
 * Generate webhook signature for testing
 */
export function generateWebhookSignature(
  payload: string | Buffer,
  secret: string,
  timestamp: string
): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(timestamp);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Create test webhook payload with signature
 */
export function createTestWebhook(
  payload: ZohoWebhookPayload,
  secret: string
): {
  payload: ZohoWebhookPayload;
  signature: string;
  timestamp: string;
  rawBody: Buffer;
} {
  const timestamp = new Date().toISOString();
  const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');
  const signature = generateWebhookSignature(rawBody, secret, timestamp);

  return {
    payload,
    signature,
    timestamp,
    rawBody,
  };
}

/**
 * Mock webhook service for testing
 */
export class MockWebhookService {
  private processedWebhooks: Array<{
    payload: ZohoWebhookPayload;
    result: any;
    timestamp: Date;
  }> = [];

  async processWebhook(
    payload: ZohoWebhookPayload,
    signature: string,
    timestamp: string,
    rawBody: string | Buffer
  ): Promise<any> {
    // Simulate processing
    const result = {
      success: true,
      taskId: `task_${Date.now()}`,
      retryable: false,
      processedAt: new Date(),
    };

    this.processedWebhooks.push({
      payload,
      result,
      timestamp: new Date(),
    });

    return result;
  }

  getProcessedWebhooks() {
    return this.processedWebhooks;
  }

  clear() {
    this.processedWebhooks = [];
  }
}

/**
 * Test helper to create appointment webhook
 */
export function createTestAppointmentWebhook(
  overrides?: Partial<AppointmentCreatedPayload['data']>
): AppointmentCreatedPayload {
  return {
    event: 'appointment_created',
    timestamp: new Date().toISOString(),
    source: 'zoho_crm',
    webhook_id: `webhook_${Date.now()}`,
    data: {
      appointment_id: 'apt_test_123',
      patient_id: 'pat_test_456',
      patient_name: 'Test Patient',
      appointment_date: '2024-01-20',
      appointment_time: '10:00 AM',
      timezone: 'America/New_York',
      appointment_type: 'Consultation',
      status: 'scheduled',
      zoho_record_id: 'zoho_test_789',
      ...overrides,
    },
  };
}

/**
 * Test helper to create payment webhook
 */
export function createTestPaymentWebhook(
  overrides?: Partial<PaymentStatusPayload['data']>
): PaymentStatusPayload {
  return {
    event: 'payment_status',
    timestamp: new Date().toISOString(),
    source: 'zoho_books',
    webhook_id: `webhook_${Date.now()}`,
    data: {
      payment_id: 'pay_test_123',
      patient_id: 'pat_test_456',
      patient_name: 'Test Patient',
      amount: 100.0,
      currency: 'USD',
      payment_method: 'credit_card',
      payment_status: 'completed',
      zoho_record_id: 'zoho_pay_test_789',
      ...overrides,
    },
  };
}

/**
 * Test helper to create intake webhook
 */
export function createTestIntakeWebhook(
  overrides?: Partial<PatientIntakeSubmittedPayload['data']>
): PatientIntakeSubmittedPayload {
  return {
    event: 'patient_intake_submitted',
    timestamp: new Date().toISOString(),
    source: 'zoho_crm',
    webhook_id: `webhook_${Date.now()}`,
    data: {
      form_id: 'form_test_123',
      patient_id: 'pat_test_456',
      patient_name: 'Test Patient',
      submission_date: new Date().toISOString(),
      form_type: 'New Patient Intake',
      form_data: {},
      status: 'submitted',
      zoho_record_id: 'zoho_form_test_789',
      ...overrides,
    },
  };
}
