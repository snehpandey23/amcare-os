/**
 * Example webhook payloads for testing
 */

import {
  AppointmentCreatedPayload,
  PaymentStatusPayload,
  PatientIntakeSubmittedPayload,
} from './types';

export const exampleAppointmentCreated: AppointmentCreatedPayload = {
  event: 'appointment_created',
  timestamp: '2024-01-15T10:30:00Z',
  source: 'zoho_crm',
  webhook_id: 'webhook_123456',
  data: {
    appointment_id: 'apt_123456',
    patient_id: 'pat_789012',
    patient_name: 'John Doe',
    patient_email: 'john.doe@example.com',
    patient_phone: '+1-555-123-4567',
    appointment_date: '2024-01-20',
    appointment_time: '10:00 AM',
    timezone: 'America/New_York',
    provider_id: 'prov_345678',
    provider_name: 'Dr. Jane Smith',
    appointment_type: 'Consultation',
    status: 'scheduled',
    notes: 'Follow-up appointment',
    created_by: 'staff_001',
    zoho_record_id: 'zoho_apt_123456',
  },
};

export const examplePaymentStatus: PaymentStatusPayload = {
  event: 'payment_status',
  timestamp: '2024-01-15T11:00:00Z',
  source: 'zoho_books',
  webhook_id: 'webhook_123457',
  data: {
    payment_id: 'pay_123456',
    invoice_id: 'inv_789012',
    patient_id: 'pat_789012',
    patient_name: 'John Doe',
    amount: 150.0,
    currency: 'USD',
    payment_method: 'credit_card',
    payment_status: 'completed',
    transaction_id: 'txn_345678',
    payment_date: '2024-01-15',
    zoho_record_id: 'zoho_pay_123456',
  },
};

export const examplePaymentStatusPending: PaymentStatusPayload = {
  event: 'payment_status',
  timestamp: '2024-01-15T11:00:00Z',
  source: 'zoho_books',
  webhook_id: 'webhook_123458',
  data: {
    payment_id: 'pay_123457',
    invoice_id: 'inv_789013',
    patient_id: 'pat_789013',
    patient_name: 'Jane Smith',
    amount: 200.0,
    currency: 'USD',
    payment_method: 'bank_transfer',
    payment_status: 'pending',
    zoho_record_id: 'zoho_pay_123457',
  },
};

export const examplePaymentStatusFailed: PaymentStatusPayload = {
  event: 'payment_status',
  timestamp: '2024-01-15T11:00:00Z',
  source: 'zoho_books',
  webhook_id: 'webhook_123459',
  data: {
    payment_id: 'pay_123458',
    invoice_id: 'inv_789014',
    patient_id: 'pat_789014',
    patient_name: 'Bob Johnson',
    amount: 100.0,
    currency: 'USD',
    payment_method: 'credit_card',
    payment_status: 'failed',
    failure_reason: 'Insufficient funds',
    zoho_record_id: 'zoho_pay_123458',
  },
};

export const examplePatientIntakeSubmitted: PatientIntakeSubmittedPayload = {
  event: 'patient_intake_submitted',
  timestamp: '2024-01-15T12:00:00Z',
  source: 'zoho_crm',
  webhook_id: 'webhook_123460',
  data: {
    form_id: 'form_123456',
    patient_id: 'pat_789012',
    patient_name: 'John Doe',
    patient_email: 'john.doe@example.com',
    submission_date: '2024-01-15T12:00:00Z',
    form_type: 'New Patient Intake',
    form_data: {
      medical_history: 'Hypertension, Diabetes Type 2',
      current_medications: ['Lisinopril 10mg daily', 'Metformin 500mg twice daily'],
      allergies: 'Penicillin',
      emergency_contact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1-555-987-6543',
      },
      insurance_provider: 'Blue Cross Blue Shield',
      insurance_id: 'BCBS123456',
    },
    status: 'submitted',
    appointment_id: 'apt_123456',
    zoho_record_id: 'zoho_form_123456',
  },
};
