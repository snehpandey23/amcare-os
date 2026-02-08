import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Form completion status enum
 */
export enum FormCompletionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_REVISION = 'requires_revision',
}

/**
 * Form type enum
 */
export enum FormType {
  NEW_PATIENT_INTAKE = 'new_patient_intake',
  ANNUAL_UPDATE = 'annual_update',
  MEDICAL_HISTORY = 'medical_history',
  CONSENT_FORM = 'consent_form',
  INSURANCE_VERIFICATION = 'insurance_verification',
  PHARMACY_FORM = 'pharmacy_form',
  REFERRAL_FORM = 'referral_form',
  OTHER = 'other',
}

/**
 * Form Completion Document Interface
 */
export interface IFormCompletion extends Document {
  // Patient Information
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;

  // Form Details
  formType: FormType;
  formName: string;
  formVersion?: string;
  status: FormCompletionStatus;

  // Form Data
  formData: Record<string, any>;
  submittedData?: Record<string, any>;
  reviewedData?: Record<string, any>;

  // Completion Tracking
  startedAt?: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  completedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;

  // Related Entities
  appointmentId?: string;
  encounterId?: string;

  // Review & Approval
  reviewNotes?: string;
  rejectionReason?: string;
  requiresRevisionReason?: string;

  // Zoho Integration
  zohoRecordId?: string;
  zohoFormId?: string;

  // Metadata
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
 * Form Completion Schema
 */
const FormCompletionSchema: Schema = new Schema(
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
    patientEmail: {
      type: String,
      index: true,
      sparse: true,
    },
    patientPhone: {
      type: String,
    },

    // Form Details
    formType: {
      type: String,
      enum: Object.values(FormType),
      required: true,
      index: true,
    },
    formName: {
      type: String,
      required: true,
    },
    formVersion: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(FormCompletionStatus),
      required: true,
      default: FormCompletionStatus.NOT_STARTED,
      index: true,
    },

    // Form Data
    formData: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    submittedData: {
      type: Schema.Types.Mixed,
    },
    reviewedData: {
      type: Schema.Types.Mixed,
    },

    // Completion Tracking
    startedAt: {
      type: Date,
      index: true,
      sparse: true,
    },
    submittedAt: {
      type: Date,
      index: true,
      sparse: true,
    },
    reviewedAt: {
      type: Date,
      index: true,
      sparse: true,
    },
    approvedAt: {
      type: Date,
      index: true,
      sparse: true,
    },
    completedBy: {
      type: String,
    },
    reviewedBy: {
      type: String,
    },
    approvedBy: {
      type: String,
    },

    // Related Entities
    appointmentId: {
      type: String,
      index: true,
      sparse: true,
    },
    encounterId: {
      type: String,
      index: true,
      sparse: true,
    },

    // Review & Approval
    reviewNotes: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    requiresRevisionReason: {
      type: String,
    },

    // Zoho Integration
    zohoRecordId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    zohoFormId: {
      type: String,
      index: true,
      sparse: true,
    },

    // Metadata
    isRequired: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    dueDate: {
      type: Date,
      index: true,
      sparse: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: {
      type: Date,
    },
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'form_completions',
  }
);

/**
 * Indexes for fast queries
 */

// Compound index for patient forms
FormCompletionSchema.index({ patientId: 1, status: 1, createdAt: -1 });

// Compound index for appointment-related forms
FormCompletionSchema.index({ appointmentId: 1, status: 1 });

// Compound index for form type and status
FormCompletionSchema.index({ formType: 1, status: 1, dueDate: 1 });

// Compound index for pending forms
FormCompletionSchema.index({ status: 1, isRequired: 1, dueDate: 1 });

// Compound index for overdue forms
FormCompletionSchema.index({ status: { $in: ['not_started', 'in_progress'] }, dueDate: 1, isRequired: 1 });

// Index for Zoho sync queries
FormCompletionSchema.index({ zohoRecordId: 1, updatedAt: -1 });

// Text search index for patient name
FormCompletionSchema.index({ patientName: 'text' });

// Index for reminder queries
FormCompletionSchema.index({ reminderSent: 1, dueDate: 1, status: 1 });

// Index for review queries
FormCompletionSchema.index({ status: 'submitted', reviewedAt: 1 });

/**
 * Virtual for checking if form is overdue
 */
FormCompletionSchema.virtual('isOverdue').get(function (this: IFormCompletion) {
  if (!this.dueDate) return false;
  if (this.status === FormCompletionStatus.APPROVED) return false;
  return new Date() > this.dueDate;
});

/**
 * Virtual for checking if form needs review
 */
FormCompletionSchema.virtual('needsReview').get(function (this: IFormCompletion) {
  return this.status === FormCompletionStatus.SUBMITTED;
});

/**
 * Methods
 */
FormCompletionSchema.methods.submit = function (submittedBy: string) {
  this.status = FormCompletionStatus.SUBMITTED;
  this.submittedAt = new Date();
  this.completedBy = submittedBy;
  this.submittedData = { ...this.formData };
  return this.save();
};

FormCompletionSchema.methods.approve = function (approvedBy: string, notes?: string) {
  this.status = FormCompletionStatus.APPROVED;
  this.approvedAt = new Date();
  this.approvedBy = approvedBy;
  if (notes) {
    this.reviewNotes = notes;
  }
  this.reviewedData = { ...this.submittedData };
  return this.save();
};

FormCompletionSchema.methods.reject = function (rejectedBy: string, reason: string) {
  this.status = FormCompletionStatus.REJECTED;
  this.reviewedAt = new Date();
  this.reviewedBy = rejectedBy;
  this.rejectionReason = reason;
  return this.save();
};

FormCompletionSchema.methods.requestRevision = function (reviewedBy: string, reason: string) {
  this.status = FormCompletionStatus.REQUIRES_REVISION;
  this.reviewedAt = new Date();
  this.reviewedBy = reviewedBy;
  this.requiresRevisionReason = reason;
  return this.save();
};

/**
 * Static methods
 */
FormCompletionSchema.statics.findByPatient = function (patientId: string) {
  return this.find({ patientId }).sort({ createdAt: -1 });
};

FormCompletionSchema.statics.findPending = function () {
  return this.find({
    status: { $in: [FormCompletionStatus.NOT_STARTED, FormCompletionStatus.IN_PROGRESS] },
    isRequired: true,
  }).sort({ dueDate: 1 });
};

FormCompletionSchema.statics.findOverdue = function () {
  return this.find({
    status: { $in: [FormCompletionStatus.NOT_STARTED, FormCompletionStatus.IN_PROGRESS] },
    dueDate: { $lt: new Date() },
    isRequired: true,
  }).sort({ dueDate: 1 });
};

FormCompletionSchema.statics.findNeedingReview = function () {
  return this.find({
    status: FormCompletionStatus.SUBMITTED,
  }).sort({ submittedAt: 1 });
};

FormCompletionSchema.statics.findByAppointment = function (appointmentId: string) {
  return this.find({ appointmentId }).sort({ createdAt: -1 });
};

/**
 * Model
 */
export const FormCompletion: Model<IFormCompletion> = mongoose.model<IFormCompletion>(
  'FormCompletion',
  FormCompletionSchema
);

export default FormCompletion;
