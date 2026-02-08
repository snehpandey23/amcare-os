import express, { Request, Response } from 'express';
import crypto from 'crypto';
import {
  KlarityWebhookPayload,
  KlarityFaxReceivedPayload,
  KlarityFormSubmittedPayload,
} from './types';
import { eventBus } from '@amcare/event-bus';
import { EventType } from '@amcare/event-bus';
import { AuditService } from '@amcare/audit';
import { AuditActionType, AuditResourceType, AuditSeverity } from '@amcare/audit';

/**
 * Klarity Webhook Handler
 */
export class KlarityWebhookHandler {
  private router: express.Router;
  private webhookSecret: string;

  constructor() {
    this.router = express.Router();
    this.webhookSecret = process.env.KLARITY_WEBHOOK_SECRET || '';
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/klarity', this.handleWebhook.bind(this));
    this.router.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'klarity-webhook-handler' });
    });
  }

  private async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-klarity-signature'] as string;
      const timestamp = req.headers['x-klarity-timestamp'] as string;

      if (!this.verifySignature(req.body, signature, timestamp)) {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }

      const payload = req.body as KlarityWebhookPayload;

      // Log webhook receipt
      await AuditService.log({
        actionType: AuditActionType.API_REQUEST,
        resourceType: AuditResourceType.API,
        description: `Klarity webhook received: ${payload.event}`,
        metadata: { event: payload.event, webhook_id: payload.webhook_id },
        severity: AuditSeverity.LOW,
        success: true,
      });

      // Route to appropriate handler
      switch (payload.event) {
        case 'fax.received':
          await this.handleFaxReceived(payload as KlarityFaxReceivedPayload);
          break;

        case 'form.submitted':
          await this.handleFormSubmitted(payload as KlarityFormSubmittedPayload);
          break;

        default:
          console.warn(`Unknown Klarity webhook event: ${payload.event}`);
      }

      res.status(200).json({ success: true, received: true });
    } catch (error: any) {
      console.error('Error handling Klarity webhook:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  private async handleFaxReceived(payload: KlarityFaxReceivedPayload): Promise<void> {
    const { data } = payload;

    // Publish to event bus
    await eventBus.publish({
      eventType: EventType.KLARITY_FAX_RECEIVED,
      timestamp: new Date(),
      source: 'klarity',
      data: {
        faxId: data.fax_id,
        patientId: data.patient_id,
        patientName: data.patient_name,
        fromNumber: data.from_number,
        pages: data.pages,
        receivedAt: data.received_at,
      },
      metadata: {
        fileUrl: data.file_url,
        toNumber: data.to_number,
      },
    });

    // Log to audit
    await AuditService.log({
      actionType: AuditActionType.API_REQUEST,
      resourceType: AuditResourceType.API,
      resourceId: data.fax_id,
      patientId: data.patient_id,
      patientName: data.patient_name,
      description: `Fax received from ${data.from_number}`,
      metadata: {
        pages: data.pages,
        receivedAt: data.received_at,
      },
      severity: AuditSeverity.MEDIUM,
      success: true,
    });

    console.log(`📠 Fax received: ${data.fax_id} from ${data.from_number}`);
  }

  private async handleFormSubmitted(payload: KlarityFormSubmittedPayload): Promise<void> {
    const { data } = payload;

    // Publish to event bus
    await eventBus.publish({
      eventType: EventType.KLARITY_FORM_SUBMITTED,
      timestamp: new Date(),
      source: 'klarity',
      data: {
        formId: data.form_id,
        patientId: data.patient_id,
        patientName: data.patient_name,
        formType: data.form_type,
        formData: data.form_data,
      },
      metadata: {
        formName: data.form_name,
        submissionDate: data.submission_date,
        status: data.status,
        appointmentId: data.appointment_id,
      },
    });

    // Log to audit
    await AuditService.log({
      actionType: AuditActionType.API_REQUEST,
      resourceType: AuditResourceType.FORM,
      resourceId: data.form_id,
      patientId: data.patient_id,
      patientName: data.patient_name,
      description: `Form submitted: ${data.form_name}`,
      metadata: {
        formType: data.form_type,
        status: data.status,
      },
      severity: AuditSeverity.MEDIUM,
      success: true,
    });

    console.log(`📝 Form submitted: ${data.form_id} for patient ${data.patient_name}`);
  }

  private verifySignature(payload: any, signature: string, timestamp: string): boolean {
    if (!this.webhookSecret) {
      console.warn('KLARITY_WEBHOOK_SECRET not set, skipping signature verification');
      return true;
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

  getRouter(): express.Router {
    return this.router;
  }
}
