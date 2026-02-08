import axios, { AxiosInstance } from 'axios';
import { UnpaidAppointment } from '../types';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Zoho Service for fetching unpaid appointments
 */
export class ZohoService {
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
   * Get or refresh access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
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
      // Set expiry to 55 minutes (tokens typically last 1 hour)
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);

      return this.accessToken;
    } catch (error: any) {
      console.error('Error getting Zoho access token:', error.message);
      throw new Error(`Failed to get Zoho access token: ${error.message}`);
    }
  }

  /**
   * Fetch unpaid appointments from Zoho
   */
  async fetchUnpaidAppointments(hoursBeforeAppointment: number = 24): Promise<UnpaidAppointment[]> {
    try {
      const token = await this.getAccessToken();
      
      // Calculate cutoff date (appointments within the next X hours)
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() + hoursBeforeAppointment);

      // Fetch appointments from Zoho CRM
      const appointmentsResponse = await this.client.get('/crm/v3/Appointments', {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
        },
        params: {
          fields: 'id,Appointment_Name,Appointment_Date,Appointment_Time,Patient,Type,Status',
          sort_by: 'Appointment_Date',
          sort_order: 'asc',
          criteria: `Appointment_Date:less_than:${cutoffDate.toISOString()}:and:Status:equals:Scheduled`,
        },
      });

      const appointments = appointmentsResponse.data.data || [];
      const unpaidAppointments: UnpaidAppointment[] = [];

      // For each appointment, check payment status
      for (const appointment of appointments) {
        try {
          const paymentStatus = await this.checkPaymentStatus(appointment.id, token);
          
          if (paymentStatus.status === 'unpaid' || paymentStatus.status === 'partial' || paymentStatus.status === 'overdue') {
            const appointmentDate = new Date(appointment.Appointment_Date);
            const daysUntil = Math.ceil((appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            unpaidAppointments.push({
              appointmentId: appointment.id,
              zohoRecordId: appointment.id,
              patientId: appointment.Patient?.id || '',
              patientName: appointment.Patient?.name || appointment.Appointment_Name || 'Unknown',
              appointmentDate: appointment.Appointment_Date,
              appointmentTime: appointment.Appointment_Time || '',
              appointmentType: appointment.Type || 'Consultation',
              amountDue: paymentStatus.amountDue,
              currency: paymentStatus.currency || 'USD',
              invoiceId: paymentStatus.invoiceId,
              paymentStatus: paymentStatus.status,
              daysUntilAppointment: daysUntil,
            });
          }
        } catch (error: any) {
          console.error(`Error checking payment for appointment ${appointment.id}:`, error.message);
          // Continue with next appointment
        }
      }

      return unpaidAppointments;
    } catch (error: any) {
      console.error('Error fetching unpaid appointments from Zoho:', error.message);
      throw error;
    }
  }

  /**
   * Check payment status for an appointment
   */
  private async checkPaymentStatus(
    appointmentId: string,
    token: string
  ): Promise<{
    status: 'paid' | 'unpaid' | 'partial' | 'overdue';
    amountDue: number;
    currency: string;
    invoiceId?: string;
  }> {
    try {
      // Fetch related invoices from Zoho Books
      const invoicesResponse = await this.client.get('/books/v3/invoices', {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
        },
        params: {
          customer_id: appointmentId, // Assuming appointment links to customer
          status: 'unpaid,partially_paid,overdue',
        },
      });

      const invoices = invoicesResponse.data.invoices || [];

      if (invoices.length === 0) {
        // Check if there's a payment requirement for this appointment type
        // For now, assume unpaid if no invoice found
        return {
          status: 'unpaid',
          amountDue: 0,
          currency: 'USD',
        };
      }

      // Calculate total amount due
      let totalDue = 0;
      let hasOverdue = false;
      let hasPartial = false;

      for (const invoice of invoices) {
        const balance = parseFloat(invoice.balance || '0');
        totalDue += balance;

        if (invoice.payment_expected_date) {
          const dueDate = new Date(invoice.payment_expected_date);
          if (dueDate < new Date()) {
            hasOverdue = true;
          }
        }

        if (invoice.status === 'partially_paid') {
          hasPartial = true;
        }
      }

      let status: 'paid' | 'unpaid' | 'partial' | 'overdue' = 'unpaid';
      if (hasOverdue) {
        status = 'overdue';
      } else if (hasPartial) {
        status = 'partial';
      } else if (totalDue > 0) {
        status = 'unpaid';
      } else {
        status = 'paid';
      }

      return {
        status,
        amountDue: totalDue,
        currency: invoices[0]?.currency_code || 'USD',
        invoiceId: invoices[0]?.invoice_id,
      };
    } catch (error: any) {
      // If error checking payment, assume unpaid
      console.warn(`Could not verify payment status for appointment ${appointmentId}:`, error.message);
      return {
        status: 'unpaid',
        amountDue: 0,
        currency: 'USD',
      };
    }
  }

  /**
   * Fetch patient contact information
   */
  async fetchPatientContactInfo(patientId: string): Promise<{
    email?: string;
    phone?: string;
    preferredContactMethod?: 'email' | 'sms' | 'both';
  }> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.get(`/crm/v3/Contacts/${patientId}`, {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
        },
        params: {
          fields: 'Email,Phone,Preferred_Contact_Method',
        },
      });

      const contact = response.data.data?.[0] || response.data.data;

      return {
        email: contact?.Email,
        phone: contact?.Phone,
        preferredContactMethod: contact?.Preferred_Contact_Method || 'both',
      };
    } catch (error: any) {
      console.error(`Error fetching patient contact info for ${patientId}:`, error.message);
      return {};
    }
  }
}
