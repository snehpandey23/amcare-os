import {
  ZohoWebhookPayload,
  AppointmentCreatedPayload,
  PaymentStatusPayload,
  PatientIntakeSubmittedPayload,
  WebhookProcessingResult,
} from './types';
import { ZohoWebhookVerifier } from './verification';
import { AppointmentCreatedHandler } from './handlers/appointmentHandler';
import { PaymentStatusHandler } from './handlers/paymentHandler';
import { PatientIntakeSubmittedHandler } from './handlers/intakeHandler';
import { AuditService } from '@amcare/audit';
import { pool } from '@amcare/database';

/**
 * Main webhook service that routes webhooks to appropriate handlers
 */
export class ZohoWebhookService {
  private verifier: ZohoWebhookVerifier;
  private appointmentHandler: AppointmentCreatedHandler;
  private paymentHandler: PaymentStatusHandler;
  private intakeHandler: PatientIntakeSubmittedHandler;

  constructor(webhookSecret: string) {
    this.verifier = new ZohoWebhookVerifier(webhookSecret);
    this.appointmentHandler = new AppointmentCreatedHandler();
    this.paymentHandler = new PaymentStatusHandler();
    this.intakeHandler = new PatientIntakeSubmittedHandler();
  }

  /**
   * Process incoming webhook
   */
  async processWebhook(
    payload: ZohoWebhookPayload,
    signature: string,
    timestamp: string,
    rawBody: string | Buffer
  ): Promise<WebhookProcessingResult> {
    // Verify signature
    const isValidSignature = this.verifier.verifySignature(
      rawBody,
      signature,
      timestamp
    );

    if (!isValidSignature) {
      await AuditService.log({
        action: 'webhook_signature_verification_failed',
        resourceType: 'webhook',
        metadata: {
          event: payload.event,
          webhook_id: payload.webhook_id,
        },
      });

      throw new Error('Invalid webhook signature');
    }

    // Verify timestamp
    const isValidTimestamp = this.verifier.verifyTimestamp(timestamp);
    if (!isValidTimestamp) {
      await AuditService.log({
        action: 'webhook_timestamp_verification_failed',
        resourceType: 'webhook',
        metadata: {
          event: payload.event,
          webhook_id: payload.webhook_id,
          timestamp,
        },
      });

      throw new Error('Webhook timestamp is too old or invalid');
    }

    // Log webhook receipt
    await this.logWebhookReceipt(payload);

    // Route to appropriate handler
    let result: WebhookProcessingResult;

    switch (payload.event) {
      case 'appointment_created':
        result = await this.appointmentHandler.handle(
          payload as AppointmentCreatedPayload
        );
        break;

      case 'payment_status':
        result = await this.paymentHandler.handle(
          payload as PaymentStatusPayload
        );
        break;

      case 'patient_intake_submitted':
        result = await this.intakeHandler.handle(
          payload as PatientIntakeSubmittedPayload
        );
        break;

      default:
        const errorMessage = `Unknown webhook event: ${payload.event}`;
        await AuditService.log({
          action: 'webhook_unknown_event',
          resourceType: 'webhook',
          metadata: {
            event: payload.event,
            webhook_id: payload.webhook_id,
          },
        });

        result = {
          success: false,
          error: errorMessage,
          retryable: false,
          processedAt: new Date(),
        };
    }

    // Log processing result
    await this.logWebhookProcessing(payload, result);

    return result;
  }

  /**
   * Log webhook receipt
   */
  private async logWebhookReceipt(payload: ZohoWebhookPayload): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO webhook_logs (
          webhook_id, event_type, source, payload, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (webhook_id) DO NOTHING`,
        [
          payload.webhook_id,
          payload.event,
          payload.source,
          JSON.stringify(payload),
          'received',
        ]
      );
    } catch (error) {
      console.error('Error logging webhook receipt:', error);
    }
  }

  /**
   * Log webhook processing result
   */
  private async logWebhookProcessing(
    payload: ZohoWebhookPayload,
    result: WebhookProcessingResult
  ): Promise<void> {
    try {
      await pool.query(
        `UPDATE webhook_logs SET
          status = $1,
          task_id = $2,
          error_message = $3,
          processed_at = CURRENT_TIMESTAMP
        WHERE webhook_id = $4`,
        [
          result.success ? 'processed' : 'failed',
          result.taskId || null,
          result.error || null,
          payload.webhook_id,
        ]
      );
    } catch (error) {
      console.error('Error logging webhook processing:', error);
    }
  }

  /**
   * Retry failed webhook
   */
  async retryWebhook(webhookId: string): Promise<WebhookProcessingResult> {
    try {
      const result = await pool.query(
        `SELECT payload, event_type FROM webhook_logs WHERE webhook_id = $1`,
        [webhookId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Webhook ${webhookId} not found`);
      }

      const { payload, event_type } = result.rows[0];
      const webhookPayload = JSON.parse(payload) as ZohoWebhookPayload;

      // Process with current timestamp (skip signature verification for retries)
      let handlerResult: WebhookProcessingResult;

      switch (event_type) {
        case 'appointment_created':
          handlerResult = await this.appointmentHandler.handle(
            webhookPayload as AppointmentCreatedPayload
          );
          break;
        case 'payment_status':
          handlerResult = await this.paymentHandler.handle(
            webhookPayload as PaymentStatusPayload
          );
          break;
        case 'patient_intake_submitted':
          handlerResult = await this.intakeHandler.handle(
            webhookPayload as PatientIntakeSubmittedPayload
          );
          break;
        default:
          throw new Error(`Unknown event type: ${event_type}`);
      }

      return handlerResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        retryable: false,
        processedAt: new Date(),
      };
    }
  }
}
