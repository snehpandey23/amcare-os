/**
 * Types for unpaid appointment cancellation script
 */

export interface UnpaidAppointment {
  appointmentId: string;
  zohoRecordId: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  amountDue: number;
  currency: string;
  invoiceId?: string;
  paymentStatus: 'unpaid' | 'partial' | 'overdue';
  daysUntilAppointment: number;
}

export interface PatientContactInfo {
  patientId: string;
  email?: string;
  phone?: string;
  preferredContactMethod: 'email' | 'sms' | 'both';
}

export interface CancellationMessage {
  appointmentId: string;
  patientId: string;
  patientName: string;
  contactMethod: 'email' | 'sms';
  message: string;
  sentAt: Date;
  status: 'sent' | 'failed';
  error?: string;
}

export interface ProcessResult {
  success: boolean;
  timestamp: Date;
  appointmentsChecked: number;
  unpaidAppointmentsFound: number;
  messagesSent: number;
  messagesFailed: number;
  errors: Array<{
    appointmentId: string;
    error: string;
  }>;
  duration: number; // milliseconds
}
