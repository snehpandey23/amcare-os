import { Document, Model } from 'mongoose';
/**
 * Note status enum
 */
export declare enum NoteStatus {
    DRAFT = "draft",
    IN_PROGRESS = "in_progress",
    PENDING_REVIEW = "pending_review",
    REVIEWED = "reviewed",
    LOCKED = "locked",
    AMENDED = "amended"
}
/**
 * Note type enum
 */
export declare enum NoteType {
    ENCOUNTER_NOTE = "encounter_note",
    PROGRESS_NOTE = "progress_note",
    CONSULTATION_NOTE = "consultation_note",
    PROCEDURE_NOTE = "procedure_note",
    DISCHARGE_NOTE = "discharge_note",
    TELEHEALTH_NOTE = "telehealth_note",
    OTHER = "other"
}
/**
 * Note Status Document Interface
 */
export interface INoteStatus extends Document {
    patientId: string;
    patientName: string;
    noteId: string;
    noteType: NoteType;
    noteTitle: string;
    status: NoteStatus;
    encounterId: string;
    appointmentId?: string;
    encounterDate: Date;
    providerId: string;
    providerName: string;
    providerSignature?: string;
    noteSummary?: string;
    chiefComplaint?: string;
    assessment?: string;
    plan?: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    reviewedAt?: Date;
    lockedAt?: Date;
    amendedAt?: Date;
    createdBy: string;
    completedBy?: string;
    reviewedBy?: string;
    lockedBy?: string;
    amendedBy?: string;
    reviewNotes?: string;
    amendmentReason?: string;
    lockReason?: string;
    isLocked: boolean;
    lockExpirationDate?: Date;
    updatedAt: Date;
    lastModifiedBy?: string;
    zohoRecordId?: string;
    zohoNoteId?: string;
    hipaaCompliant: boolean;
    auditTrail: Array<{
        action: string;
        userId: string;
        timestamp: Date;
        details?: string;
    }>;
}
/**
 * Model
 */
export declare const NoteStatus: Model<INoteStatus>;
export default NoteStatus;
//# sourceMappingURL=NoteStatus.d.ts.map