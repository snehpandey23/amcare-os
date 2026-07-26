import { Document, Model } from 'mongoose';
/**
 * Form completion status enum
 */
export declare enum FormCompletionStatus {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    SUBMITTED = "submitted",
    REVIEWED = "reviewed",
    APPROVED = "approved",
    REJECTED = "rejected",
    REQUIRES_REVISION = "requires_revision"
}
/**
 * Form type enum
 */
export declare enum FormType {
    NEW_PATIENT_INTAKE = "new_patient_intake",
    ANNUAL_UPDATE = "annual_update",
    MEDICAL_HISTORY = "medical_history",
    CONSENT_FORM = "consent_form",
    INSURANCE_VERIFICATION = "insurance_verification",
    PHARMACY_FORM = "pharmacy_form",
    REFERRAL_FORM = "referral_form",
    OTHER = "other"
}
/**
 * Form Completion Document Interface
 */
export interface IFormCompletion extends Document {
    patientId: string;
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    formType: FormType;
    formName: string;
    formVersion?: string;
    status: FormCompletionStatus;
    formData: Record<string, any>;
    submittedData?: Record<string, any>;
    reviewedData?: Record<string, any>;
    startedAt?: Date;
    submittedAt?: Date;
    reviewedAt?: Date;
    approvedAt?: Date;
    completedBy?: string;
    reviewedBy?: string;
    approvedBy?: string;
    appointmentId?: string;
    encounterId?: string;
    reviewNotes?: string;
    rejectionReason?: string;
    requiresRevisionReason?: string;
    zohoRecordId?: string;
    zohoFormId?: string;
    isRequired: boolean;
    dueDate?: Date;
    reminderSent: boolean;
    reminderSentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
/**
 * Model
 */
export declare const FormCompletion: Model<IFormCompletion>;
export default FormCompletion;
//# sourceMappingURL=FormCompletion.d.ts.map