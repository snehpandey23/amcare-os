import { AppointmentCreatedPayload, WebhookProcessingResult } from '../types';
import { RetryHandler } from '../retry';
import { pool } from '@amcare/database';
import { AuditService } from '@amcare/audit';

/**
 * Handler for appointment_created webhook
 */
export class AppointmentCreatedHandler {
  private retryHandler: RetryHandler;

  constructor() {
    this.retryHandler = new RetryHandler({
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
    });
  }

  async handle(payload: AppointmentCreatedPayload): Promise<WebhookProcessingResult> {
    const startTime = new Date();

    try {
      return await this.retryHandler.execute(async () => {
        return await this.processAppointment(payload);
      }, (attempt, error) => {
        console.warn(`Retry attempt ${attempt} for appointment_created:`, error.message);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to process appointment_created webhook:', error);

      // Log to audit
      await AuditService.log({
        action: 'webhook_appointment_created_failed',
        resourceType: 'webhook',
        resourceId: payload.data.appointment_id,
        metadata: {
          error: errorMessage,
          payload: payload,
        },
      });

      return {
        success: false,
        error: errorMessage,
        retryable: this.retryHandler.isRetryableError(
          error instanceof Error ? error : new Error(errorMessage)
        ),
        processedAt: new Date(),
      };
    }
  }

  private async processAppointment(
    payload: AppointmentCreatedPayload
  ): Promise<WebhookProcessingResult> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { data } = payload;

      // Check if appointment already exists
      const existingCheck = await client.query(
        `SELECT id FROM appointments WHERE zoho_record_id = $1`,
        [data.zoho_record_id]
      );

      let appointmentId: string;

      if (existingCheck.rows.length > 0) {
        // Update existing appointment
        appointmentId = existingCheck.rows[0].id;
        await client.query(
          `UPDATE appointments SET
            patient_id = $1,
            patient_name = $2,
            patient_email = $3,
            patient_phone = $4,
            appointment_date = $5,
            appointment_time = $6,
            timezone = $7,
            provider_id = $8,
            provider_name = $9,
            appointment_type = $10,
            status = $11,
            notes = $12,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $13`,
          [
            data.patient_id,
            data.patient_name,
            data.patient_email || null,
            data.patient_phone || null,
            data.appointment_date,
            data.appointment_time,
            data.timezone,
            data.provider_id || null,
            data.provider_name || null,
            data.appointment_type,
            data.status,
            data.notes || null,
            appointmentId,
          ]
        );
      } else {
        // Create new appointment
        const result = await client.query(
          `INSERT INTO appointments (
            zoho_record_id, patient_id, patient_name, patient_email, patient_phone,
            appointment_date, appointment_time, timezone, provider_id, provider_name,
            appointment_type, status, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id`,
          [
            data.zoho_record_id,
            data.patient_id,
            data.patient_name,
            data.patient_email || null,
            data.patient_phone || null,
            data.appointment_date,
            data.appointment_time,
            data.timezone,
            data.provider_id || null,
            data.provider_name || null,
            data.appointment_type,
            data.status,
            data.notes || null,
          ]
        );
        appointmentId = result.rows[0].id;
      }

      // Create pre-charting task
      const taskResult = await client.query(
        `INSERT INTO tasks (
          type, title, description, status, priority, patient_id, patient_name,
          appointment_id, zoho_record_id, due_date, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id`,
        [
          'prechart',
          `Pre-chart for ${data.patient_name}`,
          `Prepare chart for appointment on ${data.appointment_date} at ${data.appointment_time}`,
          'pending',
          'high',
          data.patient_id,
          data.patient_name,
          appointmentId,
          data.zoho_record_id,
          `${data.appointment_date} ${data.appointment_time}`,
        ]
      );

      const taskId = taskResult.rows[0].id;

      await client.query('COMMIT');

      // Log to audit
      await AuditService.log({
        action: 'webhook_appointment_created',
        resourceType: 'appointment',
        resourceId: appointmentId,
        metadata: {
          zoho_record_id: data.zoho_record_id,
          task_id: taskId,
        },
      });

      return {
        success: true,
        taskId,
        retryable: false,
        processedAt: new Date(),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
