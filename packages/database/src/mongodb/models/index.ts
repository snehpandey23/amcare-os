/**
 * MongoDB Models Index
 * 
 * Central export for all MongoDB models
 */

export { Appointment, IAppointment, AppointmentStatus, PreChartingStatus } from './Appointment';
export { FormCompletion, IFormCompletion, FormCompletionStatus, FormType } from './FormCompletion';
export { NoteStatus, INoteStatus, NoteStatus as NoteStatusEnum, NoteType } from './NoteStatus';

// Re-export for convenience
export type {
  IAppointment as AppointmentDocument,
  IFormCompletion as FormCompletionDocument,
  INoteStatus as NoteStatusDocument,
};
