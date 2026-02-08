import axios, { AxiosInstance } from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { eventBus } from '@amcare/event-bus';
import { EventType } from '@amcare/event-bus';

dotenv.config();

/**
 * EMR Sync Service for Klarity and Carepatron
 * Checks every 15 minutes for updates
 */
export class EMRSyncService {
  private klarityClient: AxiosInstance;
  private carepatronClient: AxiosInstance;
  private syncInterval: cron.ScheduledTask | null = null;

  constructor() {
    this.klarityClient = axios.create({
      baseURL: process.env.KLARITY_API_URL || 'https://api.klarity.com',
      headers: {
        'Authorization': `Bearer ${process.env.KLARITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.carepatronClient = axios.create({
      baseURL: process.env.CAREPATRON_API_URL || 'https://api.carepatron.com',
      headers: {
        'Authorization': `Bearer ${process.env.CAREPATRON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Start sync service (runs every 15 minutes)
   */
  start(): void {
    console.log('🔄 Starting EMR sync service (every 15 minutes)');

    // Run immediately
    this.sync().catch(console.error);

    // Schedule every 15 minutes
    this.syncInterval = cron.schedule('*/15 * * * *', async () => {
      console.log('⏰ Running scheduled EMR sync...');
      await this.sync();
    });
  }

  /**
   * Stop sync service
   */
  stop(): void {
    if (this.syncInterval) {
      this.syncInterval.stop();
      console.log('🛑 EMR sync service stopped');
    }
  }

  /**
   * Perform sync
   */
  private async sync(): Promise<void> {
    try {
      await Promise.all([
        this.syncKlarityForms(),
        this.syncKlarityFaxes(),
        this.syncKlarityPreCharting(),
        this.syncCarepatronForms(),
        this.syncCarepatronFaxes(),
      ]);
      console.log('✅ EMR sync completed');
    } catch (error) {
      console.error('❌ EMR sync failed:', error);
    }
  }

  /**
   * Sync Klarity forms
   */
  private async syncKlarityForms(): Promise<void> {
    try {
      const response = await this.klarityClient.get('/forms/pending');
      const forms = response.data.forms || [];

      for (const form of forms) {
        await eventBus.publish({
          eventType: EventType.KLARITY_FORM_SUBMITTED,
          timestamp: new Date(),
          source: 'klarity',
          data: {
            formId: form.id,
            patientId: form.patient_id,
            patientName: form.patient_name,
            formType: form.form_type,
            formData: form.form_data,
          },
        });
      }

      if (forms.length > 0) {
        console.log(`📝 Synced ${forms.length} Klarity forms`);
      }
    } catch (error) {
      console.error('Error syncing Klarity forms:', error);
    }
  }

  /**
   * Sync Klarity faxes
   */
  private async syncKlarityFaxes(): Promise<void> {
    try {
      const response = await this.klarityClient.get('/faxes/pending');
      const faxes = response.data.faxes || [];

      for (const fax of faxes) {
        await eventBus.publish({
          eventType: EventType.KLARITY_FAX_RECEIVED,
          timestamp: new Date(),
          source: 'klarity',
          data: {
            faxId: fax.id,
            patientId: fax.patient_id,
            patientName: fax.patient_name,
            fromNumber: fax.from_number,
            pages: fax.pages,
            receivedAt: fax.received_at,
          },
        });
      }

      if (faxes.length > 0) {
        console.log(`📠 Synced ${faxes.length} Klarity faxes`);
      }
    } catch (error) {
      console.error('Error syncing Klarity faxes:', error);
    }
  }

  /**
   * Sync Klarity pre-charting status
   */
  private async syncKlarityPreCharting(): Promise<void> {
    try {
      const response = await this.klarityClient.get('/pre-charting/ready');
      const preCharts = response.data.pre_charts || [];

      for (const preChart of preCharts) {
        await eventBus.publish({
          eventType: EventType.KLARITY_PRE_CHARTING_READY,
          timestamp: new Date(),
          source: 'klarity',
          data: {
            appointmentId: preChart.appointment_id,
            patientId: preChart.patient_id,
            patientName: preChart.patient_name,
            readyAt: preChart.ready_at,
          },
        });
      }

      if (preCharts.length > 0) {
        console.log(`📋 Synced ${preCharts.length} pre-charting records`);
      }
    } catch (error) {
      console.error('Error syncing Klarity pre-charting:', error);
    }
  }

  /**
   * Sync Carepatron forms
   */
  private async syncCarepatronForms(): Promise<void> {
    try {
      const response = await this.carepatronClient.get('/forms/pending');
      const forms = response.data.forms || [];

      for (const form of forms) {
        await eventBus.publish({
          eventType: EventType.CAREPATRON_FORM_SUBMITTED,
          timestamp: new Date(),
          source: 'carepatron',
          data: {
            formId: form.id,
            patientId: form.patient_id,
            patientName: form.patient_name,
            formType: form.form_type,
            formData: form.form_data,
          },
        });
      }

      if (forms.length > 0) {
        console.log(`📝 Synced ${forms.length} Carepatron forms`);
      }
    } catch (error) {
      console.error('Error syncing Carepatron forms:', error);
    }
  }

  /**
   * Sync Carepatron faxes
   */
  private async syncCarepatronFaxes(): Promise<void> {
    try {
      const response = await this.carepatronClient.get('/faxes/pending');
      const faxes = response.data.faxes || [];

      for (const fax of faxes) {
        await eventBus.publish({
          eventType: EventType.CAREPATRON_FAX_RECEIVED,
          timestamp: new Date(),
          source: 'carepatron',
          data: {
            faxId: fax.id,
            patientId: fax.patient_id,
            patientName: fax.patient_name,
            fromNumber: fax.from_number,
            pages: fax.pages,
            receivedAt: fax.received_at,
          },
        });
      }

      if (faxes.length > 0) {
        console.log(`📠 Synced ${faxes.length} Carepatron faxes`);
      }
    } catch (error) {
      console.error('Error syncing Carepatron faxes:', error);
    }
  }
}

export default new EMRSyncService();
