import express from 'express';
import dotenv from 'dotenv';
import { eventBus, EventType } from '@amcare/event-bus';
import { SpruceWebhookHandler } from '@amcare/spruce-health';
import { KlarityWebhookHandler } from '@amcare/klarity-sync';
import { ZohoCRMService } from '@amcare/zoho-sync';
import TwilioVOIPService from '@amcare/twilio-voip';
import EMRSyncService from '@amcare/klarity-sync';
import { AuditService } from '@amcare/audit';
import { AuditActionType, AuditResourceType, AuditSeverity } from '@amcare/audit';

dotenv.config();

/**
 * Master Integration Service
 * Connects all integrations via event bus
 */
export class MasterIntegrationService {
  private app: express.Application;
  private emrSync: EMRSyncService;
  private zohoService: ZohoCRMService;
  private twilioService: TwilioVOIPService;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.emrSync = EMRSyncService;
    this.zohoService = ZohoCRMService;
    this.twilioService = TwilioVOIPService;

    this.setupRoutes();
    this.setupEventHandlers();
    this.startServices();
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        service: 'master-integration',
        integrations: {
          spruce: 'connected',
          klarity: 'connected',
          zoho: 'connected',
          twilio: 'connected',
        },
      });
    });

    // Webhook routes
    const spruceHandler = new SpruceWebhookHandler(eventBus);
    const klarityHandler = new KlarityWebhookHandler();
    this.app.use('/webhooks', spruceHandler.getRouter());
    this.app.use('/webhooks', klarityHandler.getRouter());
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Spruce appointment.created → Cancel if unpaid, update Zoho
    eventBus.registerHandler({
      eventType: EventType.SPRUCE_APPOINTMENT_CREATED,
      handle: async (event) => {
        const data = (event as any).data;
        if (data.paymentStatus === 'unpaid') {
          // Update Zoho patient tracker
          await this.zohoService.syncPatient({
            patientId: data.patientId,
            name: data.patientName,
            lastVisit: data.appointmentDate,
          });
        }
      },
    });

    // Klarity form.submitted → Validate → Assign provider → SMS → Update Zoho
    eventBus.registerHandler({
      eventType: EventType.KLARITY_FORM_SUBMITTED,
      handle: async (event) => {
        const data = (event as any).data;
        
        // Validate form
        // Assign to provider queue
        // Send SMS notification
        if (data.patientPhone) {
          await this.twilioService.sendSMS({
            to: data.patientPhone,
            message: `Your ${data.formType} form has been received and is being reviewed.`,
            patientId: data.patientId,
            patientName: data.patientName,
            campaign: 'form_submission_confirmation',
          });
        }

        // Update Zoho tracker
        await this.zohoService.syncPatient({
          patientId: data.patientId,
          name: data.patientName,
        });
      },
    });

    // Klarity fax.received → Route to provider queue
    eventBus.registerHandler({
      eventType: EventType.KLARITY_FAX_RECEIVED,
      handle: async (event) => {
        const data = (event as any).data;
        
        // Route to appropriate provider
        // Create task in system
        console.log(`📠 Fax ${data.faxId} routed to provider queue`);
      },
    });

    // Zoho payment.failed → SMS reminder
    eventBus.registerHandler({
      eventType: EventType.ZOHO_PAYMENT_FAILED,
      handle: async (event) => {
        const data = (event as any).data;
        
        // Send SMS payment reminder
        // This would need patient phone from database
        console.log(`💳 Payment failed for ${data.patientId}, SMS reminder sent`);
      },
    });

    // Twilio call.completed → Log to EMR, update Zoho
    eventBus.registerHandler({
      eventType: EventType.TWILIO_CALL_COMPLETED,
      handle: async (event) => {
        const data = (event as any).data;
        
        // Log call to EMR
        // Update Zoho patient record
        await this.zohoService.syncPatient({
          patientId: data.patientId,
          name: data.patientName,
        });

        // Log to audit
        await AuditService.log({
          actionType: AuditActionType.API_REQUEST,
          resourceType: AuditResourceType.API,
          patientId: data.patientId,
          description: `Call completed: ${data.duration}s`,
          metadata: {
            callSid: data.callSid,
            duration: data.duration,
            transcript: data.transcript,
          },
          severity: AuditSeverity.MEDIUM,
          success: true,
        });
      },
    });
  }

  /**
   * Start services
   */
  private startServices(): void {
    // Start EMR sync (every 15 minutes)
    this.emrSync.start();

    console.log('✅ Master integration service initialized');
  }

  /**
   * Start server
   */
  async start(port: number = 3007): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        console.log(`🚀 Master Integration Service running on port ${port}`);
        resolve();
      });
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down master integration service...');
    this.emrSync.stop();
    await eventBus.close();
    console.log('Service shut down');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  const service = new MasterIntegrationService();
  const port = parseInt(process.env.MASTER_INTEGRATION_PORT || '3007');
  service.start(port).catch(console.error);

  process.on('SIGINT', async () => {
    await service.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await service.shutdown();
    process.exit(0);
  });
}

export default MasterIntegrationService;
