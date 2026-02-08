import dotenv from 'dotenv';
import { ZohoService } from './services/zohoService';
import { KlarityService } from './services/klarityService';
import { CancellationLogger } from './services/logger';
import { UnpaidAppointment, ProcessResult, CancellationMessage } from './types';

dotenv.config();

/**
 * Main script to check for unpaid appointments and send cancellation messages
 */
class UnpaidAppointmentCancellationScript {
  private zohoService: ZohoService;
  private klarityService: KlarityService;
  private logger: CancellationLogger;

  constructor() {
    this.zohoService = new ZohoService();
    this.klarityService = new KlarityService();
    this.logger = new CancellationLogger();
  }

  /**
   * Main execution function
   */
  async execute(): Promise<ProcessResult> {
    const startTime = Date.now();
    const result: ProcessResult = {
      success: true,
      timestamp: new Date(),
      appointmentsChecked: 0,
      unpaidAppointmentsFound: 0,
      messagesSent: 0,
      messagesFailed: 0,
      errors: [],
      duration: 0,
    };

    try {
      this.logger.log('Starting unpaid appointment check...');

      // Fetch unpaid appointments from Zoho
      this.logger.log('Fetching unpaid appointments from Zoho...');
      const unpaidAppointments = await this.zohoService.fetchUnpaidAppointments(24);
      result.appointmentsChecked = unpaidAppointments.length;
      result.unpaidAppointmentsFound = unpaidAppointments.length;

      this.logger.log(`Found ${unpaidAppointments.length} unpaid appointment(s)`);

      if (unpaidAppointments.length === 0) {
        this.logger.log('No unpaid appointments found. Exiting.');
        result.duration = Date.now() - startTime;
        await this.logger.logProcessResult(result);
        return result;
      }

      // Process each unpaid appointment
      for (const appointment of unpaidAppointments) {
        try {
          // Log unpaid appointment
          await this.logger.logUnpaidAppointment(appointment);

          // Fetch patient contact information
          this.logger.log(`Fetching contact info for patient ${appointment.patientId}...`);
          const contactInfo = await this.zohoService.fetchPatientContactInfo(appointment.patientId);

          if (!contactInfo.email && !contactInfo.phone) {
            const error = `No contact information available for patient ${appointment.patientName}`;
            this.logger.log(error, 'warn');
            result.errors.push({
              appointmentId: appointment.appointmentId,
              error,
            });
            result.messagesFailed++;
            continue;
          }

          // Determine contact method
          const contactMethod = this.determineContactMethod(contactInfo);

          // Send cancellation message
          this.logger.log(
            `Sending ${contactMethod} cancellation message to ${appointment.patientName}...`
          );
          const message = await this.klarityService.sendCancellationMessage(
            appointment,
            contactMethod,
            contactInfo
          );

          // Log message result
          await this.logger.logCancellationMessage(message);

          if (message.status === 'sent') {
            result.messagesSent++;
            this.logger.log(
              `Successfully sent ${contactMethod} message to ${appointment.patientName}`
            );
          } else {
            result.messagesFailed++;
            result.errors.push({
              appointmentId: appointment.appointmentId,
              error: message.error || 'Unknown error',
            });
            this.logger.log(
              `Failed to send message to ${appointment.patientName}: ${message.error}`,
              'error'
            );
          }
        } catch (error: any) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.log(
            `Error processing appointment ${appointment.appointmentId}: ${errorMessage}`,
            'error'
          );
          result.errors.push({
            appointmentId: appointment.appointmentId,
            error: errorMessage,
          });
          result.messagesFailed++;
        }
      }

      result.duration = Date.now() - startTime;
      result.success = result.messagesFailed === 0;

      this.logger.log(
        `Process completed: ${result.messagesSent} sent, ${result.messagesFailed} failed in ${result.duration}ms`
      );

      // Log final result
      await this.logger.logProcessResult(result);

      return result;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.log(`Fatal error: ${errorMessage}`, 'error');

      result.success = false;
      result.duration = Date.now() - startTime;
      result.errors.push({
        appointmentId: 'system',
        error: errorMessage,
      });

      await this.logger.logProcessResult(result);
      throw error;
    }
  }

  /**
   * Determine best contact method based on available information
   */
  private determineContactMethod(contactInfo: {
    email?: string;
    phone?: string;
    preferredContactMethod?: 'email' | 'sms' | 'both';
  }): 'email' | 'sms' {
    // Use preferred method if available
    if (contactInfo.preferredContactMethod) {
      if (contactInfo.preferredContactMethod === 'email' && contactInfo.email) {
        return 'email';
      }
      if (contactInfo.preferredContactMethod === 'sms' && contactInfo.phone) {
        return 'sms';
      }
    }

    // Default: prefer email, fallback to SMS
    if (contactInfo.email) {
      return 'email';
    }
    if (contactInfo.phone) {
      return 'sms';
    }

    throw new Error('No contact method available');
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.endsWith('index.js') ||
                     process.argv[1]?.endsWith('index.ts');

if (isMainModule) {
  const script = new UnpaidAppointmentCancellationScript();
  script
    .execute()
    .then((result) => {
      console.log('Script completed successfully:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default UnpaidAppointmentCancellationScript;
