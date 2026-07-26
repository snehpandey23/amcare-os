"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormCompletion = exports.FormType = exports.FormCompletionStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Form completion status enum
 */
var FormCompletionStatus;
(function (FormCompletionStatus) {
    FormCompletionStatus["NOT_STARTED"] = "not_started";
    FormCompletionStatus["IN_PROGRESS"] = "in_progress";
    FormCompletionStatus["SUBMITTED"] = "submitted";
    FormCompletionStatus["REVIEWED"] = "reviewed";
    FormCompletionStatus["APPROVED"] = "approved";
    FormCompletionStatus["REJECTED"] = "rejected";
    FormCompletionStatus["REQUIRES_REVISION"] = "requires_revision";
})(FormCompletionStatus || (exports.FormCompletionStatus = FormCompletionStatus = {}));
/**
 * Form type enum
 */
var FormType;
(function (FormType) {
    FormType["NEW_PATIENT_INTAKE"] = "new_patient_intake";
    FormType["ANNUAL_UPDATE"] = "annual_update";
    FormType["MEDICAL_HISTORY"] = "medical_history";
    FormType["CONSENT_FORM"] = "consent_form";
    FormType["INSURANCE_VERIFICATION"] = "insurance_verification";
    FormType["PHARMACY_FORM"] = "pharmacy_form";
    FormType["REFERRAL_FORM"] = "referral_form";
    FormType["OTHER"] = "other";
})(FormType || (exports.FormType = FormType = {}));
/**
 * Form Completion Schema
 */
const FormCompletionSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
        default: {},
    },
    submittedData: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    reviewedData: {
        type: mongoose_1.Schema.Types.Mixed,
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
}, {
    timestamps: true,
    collection: 'form_completions',
});
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
FormCompletionSchema.virtual('isOverdue').get(function () {
    if (!this.dueDate)
        return false;
    if (this.status === FormCompletionStatus.APPROVED)
        return false;
    return new Date() > this.dueDate;
});
/**
 * Virtual for checking if form needs review
 */
FormCompletionSchema.virtual('needsReview').get(function () {
    return this.status === FormCompletionStatus.SUBMITTED;
});
/**
 * Methods
 */
FormCompletionSchema.methods.submit = function (submittedBy) {
    this.status = FormCompletionStatus.SUBMITTED;
    this.submittedAt = new Date();
    this.completedBy = submittedBy;
    this.submittedData = { ...this.formData };
    return this.save();
};
FormCompletionSchema.methods.approve = function (approvedBy, notes) {
    this.status = FormCompletionStatus.APPROVED;
    this.approvedAt = new Date();
    this.approvedBy = approvedBy;
    if (notes) {
        this.reviewNotes = notes;
    }
    this.reviewedData = { ...this.submittedData };
    return this.save();
};
FormCompletionSchema.methods.reject = function (rejectedBy, reason) {
    this.status = FormCompletionStatus.REJECTED;
    this.reviewedAt = new Date();
    this.reviewedBy = rejectedBy;
    this.rejectionReason = reason;
    return this.save();
};
FormCompletionSchema.methods.requestRevision = function (reviewedBy, reason) {
    this.status = FormCompletionStatus.REQUIRES_REVISION;
    this.reviewedAt = new Date();
    this.reviewedBy = reviewedBy;
    this.requiresRevisionReason = reason;
    return this.save();
};
/**
 * Static methods
 */
FormCompletionSchema.statics.findByPatient = function (patientId) {
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
FormCompletionSchema.statics.findByAppointment = function (appointmentId) {
    return this.find({ appointmentId }).sort({ createdAt: -1 });
};
/**
 * Model
 */
exports.FormCompletion = mongoose_1.default.model('FormCompletion', FormCompletionSchema);
exports.default = exports.FormCompletion;
//# sourceMappingURL=FormCompletion.js.map