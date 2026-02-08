import axios, { AxiosInstance } from 'axios';
import { eventBus } from '@amcare/event-bus';
import { EventType } from '@amcare/event-bus';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Enhanced Zoho CRM Service with Custom Modules and Reporting
 */
export class ZohoCRMService {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://www.zohoapis.com',
      timeout: 30000,
    });
  }

  /**
   * Get access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
        params: {
          refresh_token: process.env.ZOHO_REFRESH_TOKEN,
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          grant_type: 'refresh_token',
        },
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
      return this.accessToken;
    } catch (error: any) {
      throw new Error(`Failed to get Zoho access token: ${error.message}`);
    }
  }

  /**
   * Sync patient record
   */
  async syncPatient(patientData: {
    patientId: string;
    name: string;
    email?: string;
    phone?: string;
    lastVisit?: string;
    controlledSubstances?: boolean;
    feedback?: string;
  }): Promise<void> {
    try {
      const token = await this.getAccessToken();

      // Update or create in Zoho CRM
      const response = await this.client.post(
        '/crm/v3/Contacts',
        {
          data: [
            {
              Patient_ID: patientData.patientId,
              First_Name: patientData.name.split(' ')[0],
              Last_Name: patientData.name.split(' ').slice(1).join(' '),
              Email: patientData.email,
              Phone: patientData.phone,
              Last_Visit: patientData.lastVisit,
              Controlled_Substances: patientData.controlledSubstances,
              Feedback: patientData.feedback,
            },
          ],
        },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
          },
        }
      );

      // Publish event
      await eventBus.publish({
        eventType: EventType.ZOHO_PATIENT_UPDATED,
        timestamp: new Date(),
        source: 'zoho',
        data: {
          patientId: patientData.patientId,
          zohoRecordId: response.data.data[0].id,
        },
      });
    } catch (error: any) {
      console.error('Error syncing patient to Zoho:', error);
      throw error;
    }
  }

  /**
   * Update DailyOperations module
   */
  async updateDailyOperations(data: {
    date: string;
    unpaidAppointments: number;
    formCompletionRate: number;
    chatResponseTime: number;
    patientSatisfaction: number;
    faxesProcessed: number;
    notesLocked: number;
  }): Promise<void> {
    try {
      const token = await this.getAccessToken();

      await this.client.post(
        '/crm/v3/DailyOperations',
        {
          data: [
            {
              Date: data.date,
              Unpaid_Appointments: data.unpaidAppointments,
              Form_Completion_Rate: data.formCompletionRate,
              Chat_Response_Time: data.chatResponseTime,
              Patient_Satisfaction: data.patientSatisfaction,
              Faxes_Processed: data.faxesProcessed,
              Notes_Locked: data.notesLocked,
            },
          ],
        },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
          },
        }
      );

      // Publish KPI update event
      await eventBus.publish({
        eventType: EventType.ZOHO_KPI_UPDATED,
        timestamp: new Date(),
        source: 'zoho',
        data,
      });
    } catch (error: any) {
      console.error('Error updating DailyOperations:', error);
      throw error;
    }
  }

  /**
   * Update ProviderQueue module
   */
  async updateProviderQueue(data: {
    providerId: string;
    preChartingCount: number;
    noteLockingCount: number;
    status: 'available' | 'busy' | 'offline';
  }): Promise<void> {
    try {
      const token = await this.getAccessToken();

      await this.client.post(
        '/crm/v3/ProviderQueue',
        {
          data: [
            {
              Provider_ID: data.providerId,
              Pre_Charting_Count: data.preChartingCount,
              Note_Locking_Count: data.noteLockingCount,
              Status: data.status,
            },
          ],
        },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
          },
        }
      );
    } catch (error: any) {
      console.error('Error updating ProviderQueue:', error);
      throw error;
    }
  }

  /**
   * Generate daily report
   */
  async generateDailyReport(date: Date): Promise<any> {
    try {
      const token = await this.getAccessToken();

      // Fetch data from various modules
      const [appointments, forms, chats, faxes, notes] = await Promise.all([
        this.getUnpaidAppointments(date),
        this.getFormCompletionRate(date),
        this.getChatResponseTime(date),
        this.getFaxesProcessed(date),
        this.getNotesLocked(date),
      ]);

      const report = {
        date: date.toISOString().split('T')[0],
        unpaidAppointments: appointments.length,
        formCompletionRate: forms.rate,
        chatResponseTime: chats.averageResponseTime,
        patientSatisfaction: 0, // Would come from feedback system
        faxesProcessed: faxes.count,
        notesLocked: notes.count,
      };

      // Update DailyOperations
      await this.updateDailyOperations(report);

      return report;
    } catch (error: any) {
      console.error('Error generating daily report:', error);
      throw error;
    }
  }

  private async getUnpaidAppointments(date: Date): Promise<any[]> {
    // Implementation would fetch from appointments module
    return [];
  }

  private async getFormCompletionRate(date: Date): Promise<{ rate: number }> {
    // Implementation would calculate from forms module
    return { rate: 0 };
  }

  private async getChatResponseTime(date: Date): Promise<{ averageResponseTime: number }> {
    // Implementation would calculate from messages
    return { averageResponseTime: 0 };
  }

  private async getFaxesProcessed(date: Date): Promise<{ count: number }> {
    // Implementation would count from faxes
    return { count: 0 };
  }

  private async getNotesLocked(date: Date): Promise<{ count: number }> {
    // Implementation would count from notes
    return { count: 0 };
  }
}

export default new ZohoCRMService();
