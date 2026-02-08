import { Request, Response, NextFunction } from 'express';
import { AuditService } from './auditService';
import { AuditActionType, AuditResourceType, AuditSeverity } from './types';

/**
 * Express middleware to automatically log all requests
 */
export interface AuditRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
  };
  auditLogged?: boolean;
}

/**
 * Middleware to log all API requests
 */
export const auditMiddleware = (req: AuditRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // Capture response
  res.send = function (body: any) {
    const duration = Date.now() - startTime;
    const userId = req.user?.id;

    // Determine action type from request
    const actionType = getActionTypeFromRequest(req);
    const resourceType = getResourceTypeFromPath(req.path);

    // Extract patient ID from path or body
    const patientId = extractPatientId(req);

    // Log the request
    AuditService.log({
      userId,
      userName: req.user?.name,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      actionType,
      resourceType,
      resourceId: extractResourceId(req),
      patientId,
      description: `${req.method} ${req.path}`,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      requestMethod: req.method,
      requestPath: req.path,
      requestBody: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined,
      responseStatus: res.statusCode,
      severity: getSeverityFromRequest(req),
      success: res.statusCode < 400,
      errorMessage: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : undefined,
      metadata: {
        duration,
        query: req.query,
      },
    }).catch(console.error);

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Middleware to log patient data access specifically
 */
export const logPatientAccess = (
  actionType: AuditActionType,
  getPatientId?: (req: Request) => string | undefined
) => {
  return async (req: AuditRequest, res: Response, next: NextFunction) => {
    const patientId = getPatientId ? getPatientId(req) : req.params.patientId || req.body.patientId;

    if (patientId) {
      // Fetch patient name if available
      let patientName: string | undefined;
      try {
        // You would fetch from database here
        // patientName = await getPatientName(patientId);
      } catch (error) {
        // Ignore errors
      }

      await AuditService.logPatientAccess(
        req.user?.id || 'system',
        patientId,
        actionType,
        {
          userName: req.user?.name,
          userEmail: req.user?.email,
          userRole: req.user?.role,
          patientName,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.get('user-agent'),
          requestPath: req.path,
          changes: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined,
        }
      );
    }

    next();
  };
};

/**
 * Determine action type from HTTP request
 */
function getActionTypeFromRequest(req: Request): AuditActionType {
  const method = req.method.toUpperCase();
  const path = req.path.toLowerCase();

  if (path.includes('/patient')) {
    if (method === 'GET') return AuditActionType.PATIENT_VIEW;
    if (method === 'POST') return AuditActionType.PATIENT_CREATE;
    if (method === 'PUT' || method === 'PATCH') return AuditActionType.PATIENT_UPDATE;
    if (method === 'DELETE') return AuditActionType.PATIENT_DELETE;
    if (path.includes('/export')) return AuditActionType.PATIENT_EXPORT;
    if (path.includes('/search')) return AuditActionType.PATIENT_SEARCH;
  }

  if (path.includes('/appointment')) {
    if (method === 'GET') return AuditActionType.APPOINTMENT_VIEW;
    if (method === 'POST') return AuditActionType.APPOINTMENT_CREATE;
    if (method === 'PUT' || method === 'PATCH') return AuditActionType.APPOINTMENT_UPDATE;
    if (method === 'DELETE') return AuditActionType.APPOINTMENT_DELETE;
  }

  if (path.includes('/record') || path.includes('/note')) {
    if (method === 'GET') return AuditActionType.RECORD_VIEW;
    if (method === 'POST') return AuditActionType.RECORD_CREATE;
    if (method === 'PUT' || method === 'PATCH') return AuditActionType.RECORD_UPDATE;
    if (method === 'DELETE') return AuditActionType.RECORD_DELETE;
    if (path.includes('/export')) return AuditActionType.RECORD_EXPORT;
    if (path.includes('/print')) return AuditActionType.RECORD_PRINT;
  }

  return AuditActionType.API_REQUEST;
}

/**
 * Determine resource type from path
 */
function getResourceTypeFromPath(path: string): AuditResourceType {
  const lowerPath = path.toLowerCase();

  if (lowerPath.includes('/patient')) return AuditResourceType.PATIENT;
  if (lowerPath.includes('/appointment')) return AuditResourceType.APPOINTMENT;
  if (lowerPath.includes('/record') || lowerPath.includes('/note')) return AuditResourceType.MEDICAL_RECORD;
  if (lowerPath.includes('/form')) return AuditResourceType.FORM;
  if (lowerPath.includes('/payment')) return AuditResourceType.PAYMENT;
  if (lowerPath.includes('/user')) return AuditResourceType.USER;

  return AuditResourceType.API;
}

/**
 * Extract patient ID from request
 */
function extractPatientId(req: Request): string | undefined {
  return (
    req.params.patientId ||
    req.params.id ||
    req.body.patientId ||
    req.query.patientId ||
    undefined
  );
}

/**
 * Extract resource ID from request
 */
function extractResourceId(req: Request): string | undefined {
  return req.params.id || req.body.id || req.query.id || undefined;
}

/**
 * Get severity from request
 */
function getSeverityFromRequest(req: Request): AuditSeverity {
  const method = req.method.toUpperCase();
  const path = req.path.toLowerCase();

  if (method === 'DELETE') return AuditSeverity.CRITICAL;
  if (method === 'PUT' || method === 'PATCH') return AuditSeverity.HIGH;
  if (path.includes('/export') || path.includes('/print')) return AuditSeverity.HIGH;
  if (method === 'GET' && path.includes('/patient')) return AuditSeverity.MEDIUM;

  return AuditSeverity.LOW;
}

/**
 * Sanitize request body to remove sensitive data
 */
function sanitizeRequestBody(body: any): Record<string, any> {
  if (!body || typeof body !== 'object') return {};

  const sanitized: Record<string, any> = {};
  const sensitiveFields = ['password', 'ssn', 'creditCard', 'cvv', 'token', 'secret'];

  for (const [key, value] of Object.entries(body)) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
