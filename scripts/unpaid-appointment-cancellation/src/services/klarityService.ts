import axios, { AxiosInstance } from 'axios';
import { CancellationMessage, UnpaidAppointment } from '../types';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Klarity Service for sending cancellation messages
 */
export class KlarityService {
  private client: AxiosInstance;
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.KLARITY_API_KEY || '';
    this.apiUrl = process.env.KLARITY_API_URL || 'https://api.klarity.com';

    if (!this.apiKey) {
      throw new Error('KLARITY_API_KEY environment variable is required');
    }

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Send cancellation message via Klarity
   */
  async sendCancellationMessage(
    appointment: UnpaidAppointment,
    contactMethod: 'email' | 'sms',
    contactInfo: { email?: string; phone?: string }
  ): Promise<CancellationMessage> {
    try {
      const message = this.generateCancellationMessage(appointment);

      if (contactMethod === 'email' && contactInfo.email) {
        return await this.sendEmail(contactInfo.email, appointment, message);
      } else if (contactMethod === 'sms' && contactInfo.phone) {
        return await this.sendSMS(contactInfo.phone, appointment, message);
      } else {
        throw new Error(`No valid ${contactMethod} contact information available`);
      }
    } catch (error: any) {
      return {
        appointmentId: appointment.appointmentId,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        contactMethod,
        message: '',
        sentAt: new Date(),
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * Send email via Klarity
   */
  private async sendEmail(
    email: string,
    appointment: UnpaidAppointment,
    message: string
  ): Promise<CancellationMessage> {
    try {
      const response = await this.client.post('/messages/email', {
        to: email,
        subject: `Appointment Cancellation - ${appointment.appointmentType} on ${appointment.appointmentDate}`,
        body: message,
        template_id: 'unpaid_appointment_cancellation', // Optional: use template
        metadata: {
          appointment_id: appointment.appointmentId,
          patient_id: appointment.patientId,
          appointment_date: appointment.appointmentDate,
          amount_due: appointment.amountDue,
        },
      });

      return {
        appointmentId: appointment.appointmentId,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        contactMethod: 'email',
        message,
        sentAt: new Date(),
        status: 'sent',
      };
    } catch (error: any) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send SMS via Klarity
   */
  private async sendSMS(
    phone: string,
    appointment: UnpaidAppointment,
    message: string
  ): Promise<CancellationMessage> {
    try {
      // Clean phone number (remove non-digits)
      const cleanPhone = phone.replace(/\D/g, '');

      const response = await this.client.post('/messages/sms', {
        to: cleanPhone,
        message: this.generateSMSText(appointment),
        metadata: {
          appointment_id: appointment.appointmentId,
          patient_id: appointment.patientId,
          appointment_date: appointment.appointmentDate,
        },
      });

      return {
        appointmentId: appointment.appointmentId,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        contactMethod: 'sms',
        message: this.generateSMSText(appointment),
        sentAt: new Date(),
        status: 'sent',
      };
    } catch (error: any) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Generate cancellation message for email
   */
  private generateCancellationMessage(appointment: UnpaidAppointment): string {
    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
Dear ${appointment.patientName},

We regret to inform you that your appointment scheduled for ${appointmentDate} at ${appointment.appointmentTime} has been cancelled due to an outstanding balance.

Appointment Details:
- Type: ${appointment.appointmentType}
- Date: ${appointmentDate}
- Time: ${appointment.appointmentTime}
- Amount Due: ${appointment.currency} ${appointment.amountDue.toFixed(2)}

To reschedule your appointment, please contact us to resolve the outstanding balance. You can reach us at [contact information] or visit our patient portal.

We apologize for any inconvenience this may cause.

Best regards,
AmCare Team
    `.trim();
  }

  /**
   * Generate SMS text (shorter version)
   */
  private generateSMSText(appointment: UnpaidAppointment): string {
    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return `AmCare: Your ${appointmentDate} appointment is cancelled due to unpaid balance (${appointment.currency} ${appointment.amountDue.toFixed(2)}). Please contact us to reschedule.`;
  }
}
