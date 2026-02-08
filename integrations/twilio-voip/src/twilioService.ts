import twilio from 'twilio';
import { eventBus } from '@amcare/event-bus';
import { EventType } from '@amcare/event-bus';
import { AuditService } from '@amcare/audit';
import { AuditActionType, AuditResourceType, AuditSeverity } from '@amcare/audit';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Twilio VOIP Service for Patient Calls and SMS
 */
export class TwilioVOIPService {
  private client: twilio.Twilio;
  private accountSid: string;
  private authToken: string;
  private phoneNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!this.accountSid || !this.authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required');
    }

    this.client = twilio(this.accountSid, this.authToken);
  }

  /**
   * Make outbound call to patient
   */
  async makeCall(request: {
    to: string;
    patientId?: string;
    patientName?: string;
    callType: 'reminder' | 'payment' | 're_engagement' | 'form_reminder';
    script?: string;
  }): Promise<twilio.twilio.Call> {
    try {
      const call = await this.client.calls.create({
        to: request.to,
        from: this.phoneNumber,
        url: `${process.env.APP_URL}/twilio/voice/${request.callType}`,
        method: 'POST',
        statusCallback: `${process.env.APP_URL}/twilio/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: true,
        recordingStatusCallback: `${process.env.APP_URL}/twilio/recording`,
      });

      // Log call
      await AuditService.log({
        actionType: AuditActionType.API_REQUEST,
        resourceType: AuditResourceType.API,
        patientId: request.patientId,
        patientName: request.patientName,
        description: `Outbound call initiated: ${request.callType}`,
        metadata: {
          callSid: call.sid,
          to: request.to,
          callType: request.callType,
        },
        severity: AuditSeverity.MEDIUM,
        success: true,
      });

      // Publish event
      await eventBus.publish({
        eventType: EventType.TWILIO_CALL_OUTBOUND,
        timestamp: new Date(),
        source: 'twilio',
        data: {
          callSid: call.sid,
          patientId: request.patientId,
          direction: 'outbound',
          callType: request.callType,
        },
      });

      return call;
    } catch (error: any) {
      console.error('Error making call:', error);
      throw error;
    }
  }

  /**
   * Send SMS to patient
   */
  async sendSMS(request: {
    to: string;
    message: string;
    patientId?: string;
    patientName?: string;
    campaign?: string;
  }): Promise<twilio.twilio.Message> {
    try {
      const message = await this.client.messages.create({
        to: request.to,
        from: this.phoneNumber,
        body: request.message,
      });

      // Log SMS
      await AuditService.log({
        actionType: AuditActionType.API_REQUEST,
        resourceType: AuditResourceType.API,
        patientId: request.patientId,
        patientName: request.patientName,
        description: `SMS sent: ${request.campaign || 'manual'}`,
        metadata: {
          messageSid: message.sid,
          to: request.to,
          campaign: request.campaign,
        },
        severity: AuditSeverity.LOW,
        success: true,
      });

      // Publish event
      await eventBus.publish({
        eventType: EventType.TWILIO_SMS_SENT,
        timestamp: new Date(),
        source: 'twilio',
        data: {
          messageSid: message.sid,
          patientId: request.patientId,
          to: request.to,
          campaign: request.campaign,
        },
      });

      return message;
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  /**
   * Get call transcript
   */
  async getCallTranscript(callSid: string): Promise<string | null> {
    try {
      const recordings = await this.client.recordings.list({ callSid });
      if (recordings.length === 0) return null;

      // Use Twilio's transcription API or external service
      // This is a placeholder - actual implementation would use transcription service
      return 'Call transcript would be here';
    } catch (error) {
      console.error('Error getting call transcript:', error);
      return null;
    }
  }

  /**
   * Handle inbound call webhook
   */
  async handleInboundCall(callSid: string, from: string, to: string): Promise<void> {
    // Publish event
    await eventBus.publish({
      eventType: EventType.TWILIO_CALL_INBOUND,
      timestamp: new Date(),
      source: 'twilio',
      data: {
        callSid,
        from,
        to,
        direction: 'inbound',
      },
    });

    // Log to audit
    await AuditService.log({
      actionType: AuditActionType.API_REQUEST,
      resourceType: AuditResourceType.API,
      description: `Inbound call received from ${from}`,
      metadata: { callSid, from, to },
      severity: AuditSeverity.MEDIUM,
      success: true,
    });
  }

  /**
   * Handle call completion
   */
  async handleCallCompleted(callSid: string, duration: number, status: string): Promise<void> {
    const transcript = await this.getCallTranscript(callSid);

    // Publish event
    await eventBus.publish({
      eventType: EventType.TWILIO_CALL_COMPLETED,
      timestamp: new Date(),
      source: 'twilio',
      data: {
        callSid,
        duration,
        status,
        transcript,
      },
    });

    // Log to audit
    await AuditService.log({
      actionType: AuditActionType.API_REQUEST,
      resourceType: AuditResourceType.API,
      description: `Call completed: ${status}`,
      metadata: { callSid, duration, status },
      severity: AuditSeverity.MEDIUM,
      success: status === 'completed',
    });
  }
}

export default new TwilioVOIPService();
