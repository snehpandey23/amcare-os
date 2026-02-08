import { PatientIntakeSubmittedPayload, WebhookProcessingResult } from '../types';
import { RetryHandler } from '../retry';
import { pool } from '@amcare/database';
import { AuditService } from '@amcare/audit';

/**
 * Handler for patient_intake_submitted webhook
 */
export class PatientIntakeSubmittedHandler {
  private retryHandler: RetryHandler;

  constructor() {
    this.retryHandler = new RetryHandler({
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
    });
  }

  async handle(payload: PatientIntakeSubmittedPayload): Promise<WebhookProcessingResult> {
    try {
      return await this.retryHandler.execute(async () => {
        return await this.processIntake(payload);
      }, (attempt, error) => {
        console.warn(`Retry attempt ${attempt} for patient_intake_submitted:`, error.message);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to process patient_intake_submitted webhook:', error);

      await AuditService.log({
        action: 'webhook_patient_intake_submitted_failed',
        resourceType: 'webhook',
        resourceId: payload.data.form_id,
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

  private async processIntake(
    payload: PatientIntakeSubmittedPayload
  ): Promise<WebhookProcessingResult> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { data } = payload;

      // Check if form submission already exists
      const existingCheck = await client.query(
        `SELECT id FROM patient_intake_forms WHERE zoho_record_id = $1`,
        [data.zoho_record_id]
      );

      let formId: string;

      if (existingCheck.rows.length > 0) {
        // Update existing form
        formId = existingCheck.rows[0].id;
        await client.query(
          `UPDATE patient_intake_forms SET
            patient_id = $1,
            patient_name = $2,
            patient_email = $3,
            submission_date = $4,
            form_type = $5,
            form_data = $6,
            status = $7,
            appointment_id = $8,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $9`,
          [
            data.patient_id,
            data.patient_name,
            data.patient_email || null,
            data.submission_date,
            data.form_type,
            JSON.stringify(data.form_data),
            data.status,
            data.appointment_id || null,
            formId,
          ]
        );
      } else {
        // Create new form submission
        const result = await client.query(
          `INSERT INTO patient_intake_forms (
            zoho_record_id, patient_id, patient_name, patient_email,
            submission_date, form_type, form_data, status, appointment_id,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id`,
          [
            data.zoho_record_id,
            data.patient_id,
            data.patient_name,
            data.patient_email || null,
            data.submission_date,
            data.form_type,
            JSON.stringify(data.form_data),
            data.status,
            data.appointment_id || null,
          ]
        );
        formId = result.rows[0].id;
      }

      // Create form completion task
      const taskResult = await client.query(
        `INSERT INTO tasks (
          type, title, description, status, priority, patient_id, patient_name,
          form_id, zoho_record_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id`,
        [
          'form',
          `Form Completion: ${data.patient_name}`,
          `${data.form_type} form submitted - requires review`,
          'pending',
          'medium',
          data.patient_id,
          data.patient_name,
          formId,
          data.zoho_record_id,
        ]
      );

      const taskId = taskResult.rows[0].id;

      // Update patient record with form data if needed
      if (data.form_data) {
        await client.query(
          `UPDATE patients SET
            intake_data = COALESCE(intake_data, '{}'::jsonb) || $1::jsonb,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2`,
          [JSON.stringify(data.form_data), data.patient_id]
        );
      }

      await client.query('COMMIT');

      // Log to audit
      await AuditService.log({
        action: 'webhook_patient_intake_submitted',
        resourceType: 'patient_intake_form',
        resourceId: formId,
        metadata: {
          zoho_record_id: data.zoho_record_id,
          form_type: data.form_type,
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
