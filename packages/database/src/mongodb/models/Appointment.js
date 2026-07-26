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
exports.Appointment = exports.AppointmentStatus = exports.PreChartingStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Pre-charting status enum
 */
var PreChartingStatus;
(function (PreChartingStatus) {
    PreChartingStatus["NOT_STARTED"] = "not_started";
    PreChartingStatus["IN_PROGRESS"] = "in_progress";
    PreChartingStatus["COMPLETED"] = "completed";
    PreChartingStatus["REVIEWED"] = "reviewed";
})(PreChartingStatus || (exports.PreChartingStatus = PreChartingStatus = {}));
/**
 * Appointment status enum
 */
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["SCHEDULED"] = "scheduled";
    AppointmentStatus["CONFIRMED"] = "confirmed";
    AppointmentStatus["CHECKED_IN"] = "checked_in";
    AppointmentStatus["IN_PROGRESS"] = "in_progress";
    AppointmentStatus["COMPLETED"] = "completed";
    AppointmentStatus["CANCELLED"] = "cancelled";
    AppointmentStatus["NO_SHOW"] = "no_show";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
/**
 * Appointment Schema
 */
const AppointmentSchema = new mongoose_1.Schema({
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
        index: true,
        sparse: true,
    },
    patientDateOfBirth: {
        type: Date,
    },
    // Appointment Details
    appointmentDate: {
        type: Date,
        required: true,
        index: true,
    },
    appointmentTime: {
        type: String,
        required: true,
    },
    timezone: {
        type: String,
        required: true,
        default: 'America/New_York',
    },
    duration: {
        type: Number,
        required: true,
        default: 30, // 30 minutes default
    },
    appointmentType: {
        type: String,
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: Object.values(AppointmentStatus),
        required: true,
        default: AppointmentStatus.SCHEDULED,
        index: true,
    },
    // Provider Information
    providerId: {
        type: String,
        index: true,
        sparse: true,
    },
    providerName: {
        type: String,
    },
    providerSpecialty: {
        type: String,
    },
    // Pre-Charting
    preChartingStatus: {
        type: String,
        enum: Object.values(PreChartingStatus),
        required: true,
        default: PreChartingStatus.NOT_STARTED,
        index: true,
    },
    preChartingCompletedAt: {
        type: Date,
        index: true,
        sparse: true,
    },
    preChartingCompletedBy: {
        type: String,
    },
    preChartingNotes: {
        type: String,
    },
    preChartingItems: {
        medicalHistory: { type: Boolean, default: false },
        medications: { type: Boolean, default: false },
        allergies: { type: Boolean, default: false },
        vitals: { type: Boolean, default: false },
        labResults: { type: Boolean, default: false },
        imaging: { type: Boolean, default: false },
        previousNotes: { type: Boolean, default: false },
    },
    // Location & Platform
    location: {
        type: String,
    },
    isTelehealth: {
        type: Boolean,
        required: true,
        default: true,
        index: true,
    },
    telehealthPlatform: {
        type: String,
    },
    meetingLink: {
        type: String,
    },
    // Zoho Integration
    zohoRecordId: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
    },
    zohoAppointmentId: {
        type: String,
        index: true,
        sparse: true,
    },
    // Metadata
    notes: {
        type: String,
    },
    cancellationReason: {
        type: String,
    },
    cancelledAt: {
        type: Date,
        index: true,
        sparse: true,
    },
    cancelledBy: {
        type: String,
    },
    createdBy: {
        type: String,
    },
    updatedBy: {
        type: String,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'appointments',
});
/**
 * Indexes for fast queries
 */
// Compound index for patient appointments
AppointmentSchema.index({ patientId: 1, appointmentDate: -1 });
// Compound index for provider appointments
AppointmentSchema.index({ providerId: 1, appointmentDate: -1 });
// Compound index for pre-charting queries
AppointmentSchema.index({ preChartingStatus: 1, appointmentDate: 1 });
// Compound index for status and date queries
AppointmentSchema.index({ status: 1, appointmentDate: 1 });
// Compound index for date range queries
AppointmentSchema.index({ appointmentDate: 1, status: 1, preChartingStatus: 1 });
// Text search index for patient name
AppointmentSchema.index({ patientName: 'text' });
// Index for Zoho sync queries
AppointmentSchema.index({ zohoRecordId: 1, updatedAt: -1 });
// Index for telehealth appointments
AppointmentSchema.index({ isTelehealth: 1, appointmentDate: 1 });
// Index for appointment type queries
AppointmentSchema.index({ appointmentType: 1, appointmentDate: -1 });
/**
 * Virtual for checking if pre-charting is due
 */
AppointmentSchema.virtual('isPreChartingDue').get(function () {
    const now = new Date();
    const appointmentDateTime = new Date(this.appointmentDate);
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilAppointment <= 24 && this.preChartingStatus === PreChartingStatus.NOT_STARTED;
});
/**
 * Methods
 */
AppointmentSchema.methods.markPreChartingComplete = function (completedBy, notes) {
    this.preChartingStatus = PreChartingStatus.COMPLETED;
    this.preChartingCompletedAt = new Date();
    this.preChartingCompletedBy = completedBy;
    if (notes) {
        this.preChartingNotes = notes;
    }
    return this.save();
};
AppointmentSchema.methods.startPreCharting = function () {
    this.preChartingStatus = PreChartingStatus.IN_PROGRESS;
    return this.save();
};
/**
 * Static methods
 */
AppointmentSchema.statics.findByPatient = function (patientId) {
    return this.find({ patientId }).sort({ appointmentDate: -1 });
};
AppointmentSchema.statics.findByProvider = function (providerId, startDate, endDate) {
    const query = { providerId };
    if (startDate || endDate) {
        query.appointmentDate = {};
        if (startDate)
            query.appointmentDate.$gte = startDate;
        if (endDate)
            query.appointmentDate.$lte = endDate;
    }
    return this.find(query).sort({ appointmentDate: 1 });
};
AppointmentSchema.statics.findPendingPreCharting = function (hoursBefore = 24) {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() + hoursBefore);
    return this.find({
        appointmentDate: { $lte: cutoffDate },
        preChartingStatus: { $in: [PreChartingStatus.NOT_STARTED, PreChartingStatus.IN_PROGRESS] },
        status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
    }).sort({ appointmentDate: 1 });
};
/**
 * Model
 */
exports.Appointment = mongoose_1.default.model('Appointment', AppointmentSchema);
exports.default = exports.Appointment;
//# sourceMappingURL=Appointment.js.map