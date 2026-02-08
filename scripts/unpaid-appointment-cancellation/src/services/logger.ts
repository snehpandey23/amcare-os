import { ProcessResult, CancellationMessage, UnpaidAppointment } from '../types';
import { pool } from '@amcare/database';
import { AuditService } from '@amcare/audit';

/**
 * Logger service for tracking script execution and results
 */
export class CancellationLogger {
  /**
   * Log process result to database
   */
  async logProcessResult(result: ProcessResult): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO unpaid_appointment_checks (
          timestamp, appointments_checked, unpaid_found, messages_sent, messages_failed,
          success, duration_ms, errors
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          result.timestamp,
          result.appointmentsChecked,
          result.unpaidAppointmentsFound,
          result.messagesSent,
          result.messagesFailed,
          result.success,
          result.duration,
          JSON.stringify(result.errors),
        ]
      );

      // Also log to audit trail
      await AuditService.log({
        action: 'unpaid_appointment_check_completed',
        resourceType: 'automated_script',
        metadata: {
          success: result.success,
          appointmentsChecked: result.appointmentsChecked,
          unpaidFound: result.unpaidAppointmentsFound,
          messagesSent: result.messagesSent,
          messagesFailed: result.messagesFailed,
        },
      });
    } catch (error) {
      console.error('Error logging process result:', error);
    }
  }

  /**
   * Log individual cancellation message
   */
  async logCancellationMessage(message: CancellationMessage): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO cancellation_messages (
          appointment_id, patient_id, patient_name, contact_method,
          message, status, sent_at, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          message.appointmentId,
          message.patientId,
          message.patientName,
          message.contactMethod,
          message.message,
          message.status,
          message.sentAt,
          message.error || null,
        ]
      );

      // Log to audit trail
      await AuditService.log({
        action: message.status === 'sent' ? 'cancellation_message_sent' : 'cancellation_message_failed',
        resourceType: 'appointment',
        resourceId: message.appointmentId,
        metadata: {
          patientId: message.patientId,
          contactMethod: message.contactMethod,
          error: message.error,
        },
      });
    } catch (error) {
      console.error('Error logging cancellation message:', error);
    }
  }

  /**
   * Log unpaid appointment found
   */
  async logUnpaidAppointment(appointment: UnpaidAppointment): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO unpaid_appointments (
          appointment_id, zoho_record_id, patient_id, patient_name,
          appointment_date, appointment_time, amount_due, currency,
          payment_status, days_until_appointment, found_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
        ON CONFLICT (appointment_id) DO UPDATE SET
          amount_due = EXCLUDED.amount_due,
          payment_status = EXCLUDED.payment_status,
          days_until_appointment = EXCLUDED.days_until_appointment,
          found_at = CURRENT_TIMESTAMP`,
        [
          appointment.appointmentId,
          appointment.zohoRecordId,
          appointment.patientId,
          appointment.patientName,
          appointment.appointmentDate,
          appointment.appointmentTime,
          appointment.amountDue,
          appointment.currency,
          appointment.paymentStatus,
          appointment.daysUntilAppointment,
        ]
      );
    } catch (error) {
      console.error('Error logging unpaid appointment:', error);
    }
  }

  /**
   * Console log with timestamp
   */
  log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(`${prefix} ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }
}
