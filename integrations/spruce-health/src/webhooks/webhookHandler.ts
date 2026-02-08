import express, { Request, Response } from 'express';
import crypto from 'crypto';
import {
  AppointmentCreatedEvent,
  PaymentFailedEvent,
  SpruceWebhookEvent,
} from '../types';
import { RedisQueueManager } from '../queue/redisQueue';
import { AuditService } from '@amcare/audit';
import { AuditActionType, AuditResourceType, AuditSeverity } from '@amcare/audit';

/**
 * Spruce Health Webhook Handler
 */
export class SpruceWebhookHandler {
  private router: express.Router;
  private queueManager: RedisQueueManager;
  private webhookSecret: string;

  constructor(queueManager: RedisQueueManager) {
    this.router = express.Router();
    this.queueManager = queueManager;
    this.webhookSecret = process.env.SPRUCE_WEBHOOK_SECRET || '';

    this.setupRoutes();
  }

  /**
   * Setup webhook routes
   */
  private setupRoutes(): void {
    // Webhook endpoint
    this.router.post('/webhook', this.handleWebhook.bind(this));

    // Health check
    this.router.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'spruce-webhook-handler' });
    });
  }

  /**
   * Handle incoming webhook
   */
  private async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Verify webhook signature
      const signature = req.headers['x-spruce-signature'] as string;
      const timestamp = req.headers['x-spruce-timestamp'] as string;

      if (!this.verifySignature(req.body, signature, timestamp)) {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }

      const event = req.body as SpruceWebhookEvent;

      // Log webhook receipt
      await AuditService.log({
        actionType: AuditActionType.API_REQUEST,
        resourceType: AuditResourceType.API,
        description: `Webhook received: ${event.event}`,
        metadata: { event: event.event, timestamp: event.timestamp },
        severity: AuditSeverity.LOW,
        success: true,
      });

      // Route to appropriate handler
      switch (event.event) {
        case 'appointment.created':
          await this.handleAppointmentCreated(event as AppointmentCreatedEvent);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(event as PaymentFailedEvent);
          break;

        default:
          console.warn(`Unknown webhook event: ${event.event}`);
      }

      // Publish event to Redis
      await this.queueManager.publishEvent({
        eventType: event.event,
        data: event,
        timestamp: new Date(),
        source: 'spruce_health',
      });

      // Add job to queue for async processing
      await this.queueManager.addJob('spruce-webhooks', {
        type: event.event,
        payload: event,
      });

      res.status(200).json({ success: true, received: true });
    } catch (error: any) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Handle appointment.created event
   */
  private async handleAppointmentCreated(event: AppointmentCreatedEvent): Promise<void> {
    try {
      const { appointment, patient } = event.data;

      // Log to audit
      await AuditService.log({
        actionType: AuditActionType.APPOINTMENT_CREATE,
        resourceType: AuditResourceType.APPOINTMENT,
        resourceId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        description: `Appointment created via Spruce Health webhook`,
        metadata: {
          appointmentType: appointment.appointmentType,
          appointmentDate: appointment.appointmentDate,
          paymentStatus: appointment.paymentStatus,
        },
        severity: AuditSeverity.MEDIUM,
        success: true,
      });

      // Emit event for other listeners
      this.queueManager.emit('appointment:created', event);

      console.log(`Appointment created: ${appointment.id} for patient ${patient.name}`);
    } catch (error) {
      console.error('Error handling appointment.created:', error);
      throw error;
    }
  }

  /**
   * Handle payment.failed event
   */
  private async handlePaymentFailed(event: PaymentFailedEvent): Promise<void> {
    try {
      const { appointmentId, patientId, patientName, amount, failureReason } = event.data;

      // Log to audit
      await AuditService.log({
        actionType: AuditActionType.API_REQUEST,
        resourceType: AuditResourceType.PAYMENT,
        resourceId: appointmentId,
        patientId,
        patientName,
        description: `Payment failed for appointment: ${failureReason}`,
        metadata: {
          amount,
          failureReason,
          transactionId: event.data.transactionId,
        },
        severity: AuditSeverity.HIGH,
        success: false,
        errorMessage: failureReason,
      });

      // Emit event for other listeners
      this.queueManager.emit('payment:failed', event);

      console.log(`Payment failed for appointment ${appointmentId}: ${failureReason}`);
    } catch (error) {
      console.error('Error handling payment.failed:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  private verifySignature(payload: any, signature: string, timestamp: string): boolean {
    if (!this.webhookSecret) {
      console.warn('SPRUCE_WEBHOOK_SECRET not set, skipping signature verification');
      return true; // Allow in development
    }

    try {
      const payloadString = JSON.stringify(payload);
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      hmac.update(timestamp);
      hmac.update(payloadString);
      const expectedSignature = hmac.digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Get Express router
   */
  getRouter(): express.Router {
    return this.router;
  }
}
