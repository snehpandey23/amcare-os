/**
 * HIPAA-Compliant Audit Log Types
 */

export enum AuditActionType {
  // Patient Data Access
  PATIENT_VIEW = 'patient_view',
  PATIENT_CREATE = 'patient_create',
  PATIENT_UPDATE = 'patient_update',
  PATIENT_DELETE = 'patient_delete',
  PATIENT_EXPORT = 'patient_export',
  PATIENT_SEARCH = 'patient_search',

  // Appointment Access
  APPOINTMENT_VIEW = 'appointment_view',
  APPOINTMENT_CREATE = 'appointment_create',
  APPOINTMENT_UPDATE = 'appointment_update',
  APPOINTMENT_DELETE = 'appointment_delete',

  // Medical Records Access
  RECORD_VIEW = 'record_view',
  RECORD_CREATE = 'record_create',
  RECORD_UPDATE = 'record_update',
  RECORD_DELETE = 'record_delete',
  RECORD_PRINT = 'record_print',
  RECORD_EXPORT = 'record_export',

  // Authentication & Authorization
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGE = 'password_change',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',

  // System Access
  SYSTEM_ACCESS = 'system_access',
  SYSTEM_CONFIG_CHANGE = 'system_config_change',
  DATA_BACKUP = 'data_backup',
  DATA_RESTORE = 'data_restore',

  // API Access
  API_REQUEST = 'api_request',
  API_RESPONSE = 'api_response',

  // Other
  OTHER = 'other',
}

export enum AuditResourceType {
  PATIENT = 'patient',
  APPOINTMENT = 'appointment',
  MEDICAL_RECORD = 'medical_record',
  NOTE = 'note',
  FORM = 'form',
  PAYMENT = 'payment',
  USER = 'user',
  SYSTEM = 'system',
  API = 'api',
  OTHER = 'other',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  actionType: AuditActionType;
  resourceType: AuditResourceType;
  resourceId?: string;
  resourceName?: string;
  patientId?: string;
  patientName?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  requestBody?: Record<string, any>;
  responseStatus?: number;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  severity: AuditSeverity;
  success: boolean;
  errorMessage?: string;
  sessionId?: string;
  location?: string;
}

export interface AuditLogQuery {
  userId?: string;
  patientId?: string;
  actionType?: AuditActionType | AuditActionType[];
  resourceType?: AuditResourceType | AuditResourceType[];
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: AuditSeverity | AuditSeverity[];
  success?: boolean;
  ipAddress?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'userId' | 'actionType';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditReport {
  reportId: string;
  reportType: string;
  generatedAt: Date;
  generatedBy: string;
  startDate: Date;
  endDate: Date;
  summary: {
    totalLogs: number;
    totalUsers: number;
    totalPatients: number;
    actionBreakdown: Record<string, number>;
    severityBreakdown: Record<string, number>;
    successRate: number;
  };
  logs: AuditLogEntry[];
  compliance: {
    hipaaCompliant: boolean;
    retentionPeriod: number;
    dataIntegrity: boolean;
  };
}

export interface AuditStatistics {
  totalLogs: number;
  logsByAction: Record<string, number>;
  logsByResource: Record<string, number>;
  logsBySeverity: Record<string, number>;
  logsByUser: Record<string, number>;
  logsByPatient: Record<string, number>;
  successRate: number;
  averageResponseTime?: number;
  peakHours: Array<{ hour: number; count: number }>;
  topUsers: Array<{ userId: string; userName: string; count: number }>;
  topPatients: Array<{ patientId: string; patientName: string; count: number }>;
}
