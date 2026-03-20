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
exports.NoteType = exports.NoteStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Note status enum
 */
var NoteStatus;
(function (NoteStatus) {
    NoteStatus["DRAFT"] = "draft";
    NoteStatus["IN_PROGRESS"] = "in_progress";
    NoteStatus["PENDING_REVIEW"] = "pending_review";
    NoteStatus["REVIEWED"] = "reviewed";
    NoteStatus["LOCKED"] = "locked";
    NoteStatus["AMENDED"] = "amended";
})(exports.NoteStatus || (exports.NoteStatus = {}));
/**
 * Note type enum
 */
var NoteType;
(function (NoteType) {
    NoteType["ENCOUNTER_NOTE"] = "encounter_note";
    NoteType["PROGRESS_NOTE"] = "progress_note";
    NoteType["CONSULTATION_NOTE"] = "consultation_note";
    NoteType["PROCEDURE_NOTE"] = "procedure_note";
    NoteType["DISCHARGE_NOTE"] = "discharge_note";
    NoteType["TELEHEALTH_NOTE"] = "telehealth_note";
    NoteType["OTHER"] = "other";
})(NoteType || (exports.NoteType = NoteType = {}));
/**
 * Note Status Schema
 */
const NoteStatusSchema = new mongoose_1.Schema({
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
        enum: Object.values(exports.NoteStatus),
        required: true,
        default: exports.NoteStatus.DRAFT,
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
}, {
    timestamps: true,
    collection: 'note_statuses',
});
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
NoteStatusSchema.index({ status: exports.NoteStatus.PENDING_REVIEW, encounterDate: -1 });
// Compound index for unlocked notes
NoteStatusSchema.index({ isLocked: false, status: { $ne: exports.NoteStatus.LOCKED }, encounterDate: -1 });
// Compound index for note type and status
NoteStatusSchema.index({ noteType: 1, status: 1, encounterDate: -1 });
// Index for Zoho sync queries
NoteStatusSchema.index({ zohoRecordId: 1, updatedAt: -1 });
// Text search index for patient name and note title
NoteStatusSchema.index({ patientName: 'text', noteTitle: 'text' });
// Index for notes needing locking (completed but not locked)
NoteStatusSchema.index({ status: exports.NoteStatus.REVIEWED, isLocked: false, completedAt: 1 });
// Index for overdue notes (completed but not locked after 4 hours)
NoteStatusSchema.index({ status: exports.NoteStatus.REVIEWED, isLocked: false, completedAt: 1 });
/**
 * Virtual for checking if note needs locking
 */
NoteStatusSchema.virtual('needsLocking').get(function () {
    if (this.isLocked)
        return false;
    if (this.status !== exports.NoteStatus.REVIEWED)
        return false;
    if (this.completedAt) {
        const hoursSinceCompletion = (Date.now() - this.completedAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceCompletion >= 4; // 4 hours after completion
    }
    return false;
});
/**
 * Virtual for checking if note is overdue for locking
 */
NoteStatusSchema.virtual('isOverdueForLocking').get(function () {
    if (this.isLocked)
        return false;
    if (this.status !== exports.NoteStatus.REVIEWED)
        return false;
    if (this.completedAt) {
        const hoursSinceCompletion = (Date.now() - this.completedAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceCompletion >= 4; // 4 hours after completion
    }
    return false;
});
/**
 * Methods
 */
NoteStatusSchema.methods.complete = function (completedBy) {
    this.status = exports.NoteStatus.REVIEWED;
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
NoteStatusSchema.methods.lock = function (lockedBy, reason) {
    this.status = exports.NoteStatus.LOCKED;
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
NoteStatusSchema.methods.submitForReview = function (userId) {
    this.status = exports.NoteStatus.PENDING_REVIEW;
    this.lastModifiedBy = userId;
    // Add to audit trail
    this.auditTrail.push({
        action: 'note_submitted_for_review',
        userId,
        timestamp: new Date(),
    });
    return this.save();
};
NoteStatusSchema.methods.amend = function (amendedBy, reason) {
    this.status = exports.NoteStatus.AMENDED;
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
NoteStatusSchema.statics.findByPatient = function (patientId) {
    return this.find({ patientId }).sort({ encounterDate: -1 });
};
NoteStatusSchema.statics.findByProvider = function (providerId) {
    return this.find({ providerId }).sort({ encounterDate: -1 });
};
NoteStatusSchema.statics.findPendingReview = function () {
    return this.find({ status: exports.NoteStatus.PENDING_REVIEW }).sort({ encounterDate: 1 });
};
NoteStatusSchema.statics.findNeedingLocking = function () {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    return this.find({
        status: exports.NoteStatus.REVIEWED,
        isLocked: false,
        completedAt: { $lte: fourHoursAgo },
    }).sort({ completedAt: 1 });
};
NoteStatusSchema.statics.findByEncounter = function (encounterId) {
    return this.find({ encounterId }).sort({ createdAt: 1 });
};
NoteStatusSchema.statics.findByAppointment = function (appointmentId) {
    return this.find({ appointmentId }).sort({ createdAt: 1 });
};
/**
 * Model
 */
exports.NoteStatus = mongoose_1.default.model('NoteStatus', NoteStatusSchema);
exports.default = exports.NoteStatus;
//# sourceMappingURL=NoteStatus.js.map