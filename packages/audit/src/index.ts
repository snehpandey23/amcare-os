/**
 * HIPAA-Compliant Audit Logging Package
 * 
 * Main export file for audit logging functionality
 */

export { AuditService } from './auditService';
export { AuditReportGenerator } from './reportGenerator';
export { auditMiddleware, logPatientAccess, AuditRequest } from './middleware';
export * from './types';

// Re-export for convenience
export {
  AuditActionType,
  AuditResourceType,
  AuditSeverity,
} from './types';
