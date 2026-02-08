import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Note status enum
 */
export enum NoteStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  REVIEWED = 'reviewed',
  LOCKED = 'locked',
  AMENDED = 'amended',
}

/**
 * Note type enum
 */
export enum NoteType {
  ENCOUNTER_NOTE = 'encounter_note',
  PROGRESS_NOTE = 'progress_note',
  CONSULTATION_NOTE = 'consultation_note',
  PROCEDURE_NOTE = 'procedure_note',
  DISCHARGE_NOTE = 'discharge_note',
  TELEHEALTH_NOTE = 'telehealth_note',
  OTHER = 'other',
}

/**
 * Note Status Document Interface
 */
export interface INoteStatus extends Document {
  // Patient Information
  patientId: string;
  patientName: string;

  // Note Details
  noteId: string;
  noteType: NoteType;
  noteTitle: string;
  status: NoteStatus;

  // Encounter/Appointment Reference
  encounterId: string;
  appointmentId?: string;
  encounterDate: Date;

  // Provider Information
  providerId: string;
  providerName: string;
  providerSignature?: string;

  // Note Content (reference or summary)
  noteSummary?: string;
  chiefComplaint?: string;
  assessment?: string;
  plan?: string;

  // Status Tracking
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  reviewedAt?: Date;
  lockedAt?: Date;
  amendedAt?: Date;

  // User Tracking
  createdBy: string;
  completedBy?: string;
  reviewedBy?: string;
  lockedBy?: string;
  amendedBy?: string;

  // Review & Locking
  reviewNotes?: string;
  amendmentReason?: string;
  lockReason?: string;
  isLocked: boolean;
  lockExpirationDate?: Date;

  // Timestamps
  updatedAt: Date;
  lastModifiedBy?: string;

  // Zoho Integration
  zohoRecordId?: string;
  zohoNoteId?: string;

  // Compliance
  hipaaCompliant: boolean;
  auditTrail: Array<{
    action: string;
    userId: string;
    timestamp: Date;
    details?: string;
  }>;
}

/**
 * Note Status Schema
 */
const NoteStatusSchema: Schema = new Schema(
  {
    // Patient Information
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      index: true,
    },

    // Note Details
    noteId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    noteType: {
      type: String,
      enum: Object.values(NoteType),
      required: true,
      index: true,
    },
    noteTitle: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(NoteStatus),
      required: true,
      default: NoteStatus.DRAFT,
      index: true,
    },

    // Encounter/Appointment Reference
    encounterId: {
      type: String,
      required: true,
      index: true,
    },
    appointmentId: {
      type: String,
      index: true,
      sparse: true,
    },
    encounterDate: {
      type: Date,
      required: true,
      index: true,
    },

    // Provider Information
    providerId: {
      type: String,
      required: true,
      index: true,
    },
    providerName: {
      type: String,
      required: true,
    },
    providerSignature: {
      type: String,
    },

    // Note Content
    noteSummary: {
      type: String,
    },
    chiefComplaint: {
      type: String,
    },
    assessment: {
      type: String,
    },
    plan: {
      type: String,
    },

    // Status Tracking
    startedAt: {
      type: Date,
      index: true,
      sparse: true,
    },
    completedAt: {
      type: Date,
      index: true,
      sparse: true,
    },
    reviewedAt: {
      type: Date,
      index: true,
      sparse: true,
    },
    lockedAt: {
      type: Date,
      index: true,
      sparse: true,
    },
    amendedAt: {
      type: Date,
      index: true,
      sparse: true,
    },

    // User Tracking
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    completedBy: {
      type: String,
    },
    reviewedBy: {
      type: String,
    },
    lockedBy: {
      type: String,
    },
    amendedBy: {
      type: String,
    },
    lastModifiedBy: {
      type: String,
    },

    // Review & Locking
    reviewNotes: {
      type: String,
    },
    amendmentReason: {
      type: String,
    },
    lockReason: {
      type: String,
    },
    isLocked: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    lockExpirationDate: {
      type: Date,
      index: true,
      sparse: true,
    },

    // Zoho Integration
    zohoRecordId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    zohoNoteId: {
      type: String,
      index: true,
      sparse: true,
    },

    // Compliance
    hipaaCompliant: {
      type: Boolean,
      required: true,
      default: true,
    },
    auditTrail: [
      {
        action: { type: String, required: true },
        userId: { type: String, required: true },
        timestamp: { type: Date, required: true, default: Date.now },
        details: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    collection: 'note_statuses',
  }
);

/**
 * Indexes for fast queries
 */

// Compound index for patient notes
NoteStatusSchema.index({ patientId: 1, encounterDate: -1, status: 1 });

// Compound index for provider notes
NoteStatusSchema.index({ providerId: 1, encounterDate: -1, status: 1 });

// Compound index for encounter notes
NoteStatusSchema.index({ encounterId: 1, status: 1 });

// Compound index for appointment notes
NoteStatusSchema.index({ appointmentId: 1, status: 1 });

// Compound index for pending review notes
NoteStatusSchema.index({ status: NoteStatus.PENDING_REVIEW, encounterDate: -1 });

// Compound index for unlocked notes
NoteStatusSchema.index({ isLocked: false, status: { $ne: NoteStatus.LOCKED }, encounterDate: -1 });

// Compound index for note type and status
NoteStatusSchema.index({ noteType: 1, status: 1, encounterDate: -1 });

// Index for Zoho sync queries
NoteStatusSchema.index({ zohoRecordId: 1, updatedAt: -1 });

// Text search index for patient name and note title
NoteStatusSchema.index({ patientName: 'text', noteTitle: 'text' });

// Index for notes needing locking (completed but not locked)
NoteStatusSchema.index({ status: NoteStatus.REVIEWED, isLocked: false, completedAt: 1 });

// Index for overdue notes (completed but not locked after 4 hours)
NoteStatusSchema.index({ status: NoteStatus.REVIEWED, isLocked: false, completedAt: 1 });

/**
 * Virtual for checking if note needs locking
 */
NoteStatusSchema.virtual('needsLocking').get(function (this: INoteStatus) {
  if (this.isLocked) return false;
  if (this.status !== NoteStatus.REVIEWED) return false;
  
  if (this.completedAt) {
    const hoursSinceCompletion = (Date.now() - this.completedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCompletion >= 4; // 4 hours after completion
  }
  
  return false;
});

/**
 * Virtual for checking if note is overdue for locking
 */
NoteStatusSchema.virtual('isOverdueForLocking').get(function (this: INoteStatus) {
  if (this.isLocked) return false;
  if (this.status !== NoteStatus.REVIEWED) return false;
  
  if (this.completedAt) {
    const hoursSinceCompletion = (Date.now() - this.completedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCompletion >= 4; // 4 hours after completion
  }
  
  return false;
});

/**
 * Methods
 */
NoteStatusSchema.methods.complete = function (completedBy: string) {
  this.status = NoteStatus.REVIEWED;
  this.completedAt = new Date();
  this.completedBy = completedBy;
  this.lastModifiedBy = completedBy;
  
  // Add to audit trail
  this.auditTrail.push({
    action: 'note_completed',
    userId: completedBy,
    timestamp: new Date(),
  });
  
  return this.save();
};

NoteStatusSchema.methods.lock = function (lockedBy: string, reason?: string) {
  this.status = NoteStatus.LOCKED;
  this.isLocked = true;
  this.lockedAt = new Date();
  this.lockedBy = lockedBy;
  this.lastModifiedBy = lockedBy;
  if (reason) {
    this.lockReason = reason;
  }
  
  // Add to audit trail
  this.auditTrail.push({
    action: 'note_locked',
    userId: lockedBy,
    timestamp: new Date(),
    details: reason,
  });
  
  return this.save();
};

NoteStatusSchema.methods.submitForReview = function (userId: string) {
  this.status = NoteStatus.PENDING_REVIEW;
  this.lastModifiedBy = userId;
  
  // Add to audit trail
  this.auditTrail.push({
    action: 'note_submitted_for_review',
    userId,
    timestamp: new Date(),
  });
  
  return this.save();
};

NoteStatusSchema.methods.amend = function (amendedBy: string, reason: string) {
  this.status = NoteStatus.AMENDED;
  this.amendedAt = new Date();
  this.amendedBy = amendedBy;
  this.amendmentReason = reason;
  this.isLocked = false; // Unlock for amendment
  this.lastModifiedBy = amendedBy;
  
  // Add to audit trail
  this.auditTrail.push({
    action: 'note_amended',
    userId: amendedBy,
    timestamp: new Date(),
    details: reason,
  });
  
  return this.save();
};

/**
 * Static methods
 */
NoteStatusSchema.statics.findByPatient = function (patientId: string) {
  return this.find({ patientId }).sort({ encounterDate: -1 });
};

NoteStatusSchema.statics.findByProvider = function (providerId: string) {
  return this.find({ providerId }).sort({ encounterDate: -1 });
};

NoteStatusSchema.statics.findPendingReview = function () {
  return this.find({ status: NoteStatus.PENDING_REVIEW }).sort({ encounterDate: 1 });
};

NoteStatusSchema.statics.findNeedingLocking = function () {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return this.find({
    status: NoteStatus.REVIEWED,
    isLocked: false,
    completedAt: { $lte: fourHoursAgo },
  }).sort({ completedAt: 1 });
};

NoteStatusSchema.statics.findByEncounter = function (encounterId: string) {
  return this.find({ encounterId }).sort({ createdAt: 1 });
};

NoteStatusSchema.statics.findByAppointment = function (appointmentId: string) {
  return this.find({ appointmentId }).sort({ createdAt: 1 });
};

/**
 * Model
 */
export const NoteStatus: Model<INoteStatus> = mongoose.model<INoteStatus>(
  'NoteStatus',
  NoteStatusSchema
);

export default NoteStatus;
