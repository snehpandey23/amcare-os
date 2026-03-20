import { Document, Model } from 'mongoose';
/**
 * Pre-charting status enum
 */
export declare enum PreChartingStatus {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    REVIEWED = "reviewed"
}
/**
 * Appointment status enum
 */
export declare enum AppointmentStatus {
    SCHEDULED = "scheduled",
    CONFIRMED = "confirmed",
    CHECKED_IN = "checked_in",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
}
/**
 * Appointment Document Interface
 */
export interface IAppointment extends Document {
    patientId: string;
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    patientDateOfBirth?: Date;
    appointmentDate: Date;
    appointmentTime: string;
    timezone: string;
    duration: number;
    appointmentType: string;
    status: AppointmentStatus;
    providerId?: string;
    providerName?: string;
    providerSpecialty?: string;
    preChartingStatus: PreChartingStatus;
    preChartingCompletedAt?: Date;
    preChartingCompletedBy?: string;
    preChartingNotes?: string;
    preChartingItems: {
        medicalHistory: boolean;
        medications: boolean;
        allergies: boolean;
        vitals: boolean;
        labResults: boolean;
        imaging: boolean;
        previousNotes: boolean;
    };
    location?: string;
    isTelehealth: boolean;
    telehealthPlatform?: string;
    meetingLink?: string;
    zohoRecordId?: string;
    zohoAppointmentId?: string;
    notes?: string;
    cancellationReason?: string;
    cancelledAt?: Date;
    cancelledBy?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
/**
 * Model
 */
export declare const Appointment: Model<IAppointment>;
export default Appointment;
//# sourceMappingURL=Appointment.d.ts.map