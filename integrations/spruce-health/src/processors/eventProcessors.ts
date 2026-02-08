import { Job } from 'bull';
import { AppointmentCreatedEvent, PaymentFailedEvent } from '../types';
import { SpruceHealthClient } from '../client/spruceClient';
import { AuditService } from '@amcare/audit';
import { AuditActionType, AuditResourceType, AuditSeverity } from '@amcare/audit';

/**
 * Event Processors for Queue Jobs
 */
export class EventProcessors {
  private client: SpruceHealthClient;

  constructor() {
    this.client = new SpruceHealthClient();
  }

  /**
   * Process appointment.created event
   */
  async processAppointmentCreated(job: Job<{ type: string; payload: AppointmentCreatedEvent }>): Promise<void> {
    try {
      const event = job.data.payload as AppointmentCreatedEvent;
      const { appointment, patient } = event.data;

      console.log(`Processing appointment.created: ${appointment.id}`);

      // Check if appointment needs cancellation (unpaid within 24 hours)
      if (appointment.paymentStatus === 'unpaid' || appointment.paymentStatus === 'overdue') {
        const appointmentDate = new Date(appointment.appointmentDate);
        const hoursUntil = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);

        if (hoursUntil <= 24 && hoursUntil > 0) {
          // Cancel appointment
          await this.client.cancelAppointment({
            appointmentId: appointment.id,
            reason: 'Unpaid balance - 24 hour policy',
            notifyPatient: true,
            cancellationNotes: `Appointment cancelled due to unpaid balance of ${appointment.currency} ${appointment.amountDue}`,
          });

          // Log cancellation
          await AuditService.log({
            actionType: AuditActionType.APPOINTMENT_DELETE,
            resourceType: AuditResourceType.APPOINTMENT,
            resourceId: appointment.id,
            patientId: appointment.patientId,
            patientName: appointment.patientName,
            description: 'Appointment auto-cancelled due to unpaid balance (24hr policy)',
            metadata: {
              amountDue: appointment.amountDue,
              hoursUntil: hoursUntil,
            },
            severity: AuditSeverity.HIGH,
            success: true,
          });

          console.log(`Appointment ${appointment.id} cancelled due to unpaid balance`);
        }
      }

      // Create pre-charting task if needed
      // This would integrate with your task system
      console.log(`Appointment ${appointment.id} processed successfully`);
    } catch (error: any) {
      console.error('Error processing appointment.created:', error);
      throw error;
    }
  }

  /**
   * Process payment.failed event
   */
  async processPaymentFailed(job: Job<{ type: string; payload: PaymentFailedEvent }>): Promise<void> {
    try {
      const event = job.data.payload as PaymentFailedEvent;
      const { appointmentId, patientId, patientName, amount, failureReason } = event.data;

      console.log(`Processing payment.failed: ${appointmentId}`);

      // Check if appointment should be cancelled
      const appointments = await this.client.getAppointments({
        paymentStatus: 'unpaid',
        hoursBefore: 24,
      });

      const appointment = appointments.find((apt) => apt.id === appointmentId);

      if (appointment) {
        // Cancel appointment
        await this.client.cancelAppointment({
          appointmentId,
          reason: `Payment failed: ${failureReason}`,
          notifyPatient: true,
          cancellationNotes: `Payment of ${appointment.currency} ${amount} failed. Reason: ${failureReason}`,
        });

        // Log cancellation
        await AuditService.log({
          actionType: AuditActionType.APPOINTMENT_DELETE,
          resourceType: AuditResourceType.APPOINTMENT,
          resourceId: appointmentId,
          patientId,
          patientName,
          description: `Appointment cancelled due to payment failure: ${failureReason}`,
          metadata: {
            amount,
            failureReason,
            transactionId: event.data.transactionId,
          },
          severity: AuditSeverity.HIGH,
          success: true,
        });

        console.log(`Appointment ${appointmentId} cancelled due to payment failure`);
      }

      console.log(`Payment failure for ${appointmentId} processed`);
    } catch (error: any) {
      console.error('Error processing payment.failed:', error);
      throw error;
    }
  }
}
