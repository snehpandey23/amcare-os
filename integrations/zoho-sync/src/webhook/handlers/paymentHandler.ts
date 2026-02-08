import { PaymentStatusPayload, WebhookProcessingResult } from '../types';
import { RetryHandler } from '../retry';
import { pool } from '@amcare/database';
import { AuditService } from '@amcare/audit';

/**
 * Handler for payment_status webhook
 */
export class PaymentStatusHandler {
  private retryHandler: RetryHandler;

  constructor() {
    this.retryHandler = new RetryHandler({
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
    });
  }

  async handle(payload: PaymentStatusPayload): Promise<WebhookProcessingResult> {
    try {
      return await this.retryHandler.execute(async () => {
        return await this.processPayment(payload);
      }, (attempt, error) => {
        console.warn(`Retry attempt ${attempt} for payment_status:`, error.message);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to process payment_status webhook:', error);

      await AuditService.log({
        action: 'webhook_payment_status_failed',
        resourceType: 'webhook',
        resourceId: payload.data.payment_id,
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

  private async processPayment(
    payload: PaymentStatusPayload
  ): Promise<WebhookProcessingResult> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { data } = payload;

      // Check if payment already exists
      const existingCheck = await client.query(
        `SELECT id FROM payments WHERE zoho_record_id = $1`,
        [data.zoho_record_id]
      );

      let paymentId: string;

      if (existingCheck.rows.length > 0) {
        // Update existing payment
        paymentId = existingCheck.rows[0].id;
        await client.query(
          `UPDATE payments SET
            invoice_id = $1,
            patient_id = $2,
            patient_name = $3,
            amount = $4,
            currency = $5,
            payment_method = $6,
            payment_status = $7,
            transaction_id = $8,
            payment_date = $9,
            failure_reason = $10,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $11`,
          [
            data.invoice_id || null,
            data.patient_id,
            data.patient_name,
            data.amount,
            data.currency,
            data.payment_method,
            data.payment_status,
            data.transaction_id || null,
            data.payment_date || null,
            data.failure_reason || null,
            paymentId,
          ]
        );
      } else {
        // Create new payment record
        const result = await client.query(
          `INSERT INTO payments (
            zoho_record_id, invoice_id, patient_id, patient_name,
            amount, currency, payment_method, payment_status,
            transaction_id, payment_date, failure_reason,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id`,
          [
            data.zoho_record_id,
            data.invoice_id || null,
            data.patient_id,
            data.patient_name,
            data.amount,
            data.currency,
            data.payment_method,
            data.payment_status,
            data.transaction_id || null,
            data.payment_date || null,
            data.failure_reason || null,
          ]
        );
        paymentId = result.rows[0].id;
      }

      // Create payment check task if payment is pending or failed
      let taskId: string | undefined;

      if (data.payment_status === 'pending' || data.payment_status === 'failed') {
        const taskResult = await client.query(
          `INSERT INTO tasks (
            type, title, description, status, priority, patient_id, patient_name,
            payment_id, zoho_record_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id`,
          [
            'payment',
            `Payment Check: ${data.patient_name}`,
            `Payment ${data.payment_status}: $${data.amount} ${data.currency}`,
            'pending',
            data.payment_status === 'failed' ? 'high' : 'medium',
            data.patient_id,
            data.patient_name,
            paymentId,
            data.zoho_record_id,
          ]
        );
        taskId = taskResult.rows[0].id;
      }

      await client.query('COMMIT');

      // Log to audit
      await AuditService.log({
        action: 'webhook_payment_status',
        resourceType: 'payment',
        resourceId: paymentId,
        metadata: {
          zoho_record_id: data.zoho_record_id,
          payment_status: data.payment_status,
          amount: data.amount,
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
