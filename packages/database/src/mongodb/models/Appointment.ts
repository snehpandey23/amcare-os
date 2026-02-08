import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Pre-charting status enum
 */
export enum PreChartingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
}

/**
 * Appointment status enum
 */
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

/**
 * Appointment Document Interface
 */
export interface IAppointment extends Document {
  // Patient Information
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  patientDateOfBirth?: Date;

  // Appointment Details
  appointmentDate: Date;
  appointmentTime: string;
  timezone: string;
  duration: number; // in minutes
  appointmentType: string;
  status: AppointmentStatus;

  // Provider Information
  providerId?: string;
  providerName?: string;
  providerSpecialty?: string;

  // Pre-Charting
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

  // Location & Platform
  location?: string;
  isTelehealth: boolean;
  telehealthPlatform?: string;
  meetingLink?: string;

  // Zoho Integration
  zohoRecordId?: string;
  zohoAppointmentId?: string;

  // Metadata
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
 * Appointment Schema
 */
const AppointmentSchema: Schema = new Schema(
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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'appointments',
  }
);

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
AppointmentSchema.virtual('isPreChartingDue').get(function (this: IAppointment) {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilAppointment <= 24 && this.preChartingStatus === PreChartingStatus.NOT_STARTED;
});

/**
 * Methods
 */
AppointmentSchema.methods.markPreChartingComplete = function (completedBy: string, notes?: string) {
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
AppointmentSchema.statics.findByPatient = function (patientId: string) {
  return this.find({ patientId }).sort({ appointmentDate: -1 });
};

AppointmentSchema.statics.findByProvider = function (providerId: string, startDate?: Date, endDate?: Date) {
  const query: any = { providerId };
  if (startDate || endDate) {
    query.appointmentDate = {};
    if (startDate) query.appointmentDate.$gte = startDate;
    if (endDate) query.appointmentDate.$lte = endDate;
  }
  return this.find(query).sort({ appointmentDate: 1 });
};

AppointmentSchema.statics.findPendingPreCharting = function (hoursBefore: number = 24) {
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
export const Appointment: Model<IAppointment> = mongoose.model<IAppointment>(
  'Appointment',
  AppointmentSchema
);

export default Appointment;
