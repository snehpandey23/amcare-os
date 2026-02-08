import { pool } from '@amcare/database';
import { randomUUID } from 'crypto';
import {
  AuditLogEntry,
  AuditLogQuery,
  AuditActionType,
  AuditResourceType,
  AuditSeverity,
} from './types';

/**
 * HIPAA-Compliant Audit Logging Service
 * 
 * All access to patient data is logged with:
 * - Timestamp
 * - User ID and information
 * - Action type
 * - Resource accessed
 * - IP address
 * - Request details
 */
export class AuditService {
  /**
   * Log an audit event
   */
  static async log(entry: Partial<AuditLogEntry>): Promise<string> {
    const logId = randomUUID();
    const timestamp = new Date();

    try {
      const query = `
        INSERT INTO audit_logs (
          id, timestamp, user_id, user_name, user_email, user_role,
          action_type, resource_type, resource_id, resource_name,
          patient_id, patient_name, description, ip_address, user_agent,
          request_method, request_path, request_body, response_status,
          changes, metadata, severity, success, error_message,
          session_id, location, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
        )
      `;

      await pool.query(query, [
        logId,
        timestamp,
        entry.userId || null,
        entry.userName || null,
        entry.userEmail || null,
        entry.userRole || null,
        entry.actionType || AuditActionType.OTHER,
        entry.resourceType || AuditResourceType.OTHER,
        entry.resourceId || null,
        entry.resourceName || null,
        entry.patientId || null,
        entry.patientName || null,
        entry.description || '',
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.requestMethod || null,
        entry.requestPath || null,
        entry.requestBody ? JSON.stringify(entry.requestBody) : null,
        entry.responseStatus || null,
        entry.changes ? JSON.stringify(entry.changes) : null,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        entry.severity || AuditSeverity.LOW,
        entry.success !== undefined ? entry.success : true,
        entry.errorMessage || null,
        entry.sessionId || null,
        entry.location || null,
        timestamp,
      ]);

      return logId;
    } catch (error) {
      // Never throw - audit logging should never break the application
      console.error('Audit log error:', error);
      return logId; // Return ID even if logging failed
    }
  }

  /**
   * Log patient data access
   */
  static async logPatientAccess(
    userId: string,
    patientId: string,
    actionType: AuditActionType,
    details: {
      userName?: string;
      userEmail?: string;
      userRole?: string;
      patientName?: string;
      ipAddress?: string;
      userAgent?: string;
      requestPath?: string;
      changes?: Record<string, any>;
      description?: string;
    }
  ): Promise<string> {
    return this.log({
      userId,
      userName: details.userName,
      userEmail: details.userEmail,
      userRole: details.userRole,
      actionType,
      resourceType: AuditResourceType.PATIENT,
      resourceId: patientId,
      patientId,
      patientName: details.patientName,
      description: details.description || `${actionType} for patient ${patientId}`,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      requestPath: details.requestPath,
      changes: details.changes,
      severity: this.getSeverityForAction(actionType),
      success: true,
    });
  }

  /**
   * Query audit logs with filters
   */
  static async query(query: AuditLogQuery): Promise<AuditLogEntry[]> {
    try {
      const conditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (query.userId) {
        conditions.push(`user_id = $${paramIndex++}`);
        values.push(query.userId);
      }

      if (query.patientId) {
        conditions.push(`patient_id = $${paramIndex++}`);
        values.push(query.patientId);
      }

      if (query.actionType) {
        const actions = Array.isArray(query.actionType) ? query.actionType : [query.actionType];
        conditions.push(`action_type = ANY($${paramIndex++})`);
        values.push(actions);
      }

      if (query.resourceType) {
        const resources = Array.isArray(query.resourceType)
          ? query.resourceType
          : [query.resourceType];
        conditions.push(`resource_type = ANY($${paramIndex++})`);
        values.push(resources);
      }

      if (query.resourceId) {
        conditions.push(`resource_id = $${paramIndex++}`);
        values.push(query.resourceId);
      }

      if (query.startDate) {
        conditions.push(`timestamp >= $${paramIndex++}`);
        values.push(query.startDate);
      }

      if (query.endDate) {
        conditions.push(`timestamp <= $${paramIndex++}`);
        values.push(query.endDate);
      }

      if (query.severity) {
        const severities = Array.isArray(query.severity) ? query.severity : [query.severity];
        conditions.push(`severity = ANY($${paramIndex++})`);
        values.push(severities);
      }

      if (query.success !== undefined) {
        conditions.push(`success = $${paramIndex++}`);
        values.push(query.success);
      }

      if (query.ipAddress) {
        conditions.push(`ip_address = $${paramIndex++}`);
        values.push(query.ipAddress);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const limit = query.limit || 1000;
      const offset = query.offset || 0;
      const sortBy = query.sortBy || 'timestamp';
      const sortOrder = query.sortOrder || 'desc';

      const sql = `
        SELECT 
          id, timestamp, user_id, user_name, user_email, user_role,
          action_type, resource_type, resource_id, resource_name,
          patient_id, patient_name, description, ip_address, user_agent,
          request_method, request_path, request_body, response_status,
          changes, metadata, severity, success, error_message,
          session_id, location
        FROM audit_logs
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      values.push(limit, offset);

      const result = await pool.query(sql, values);

      return result.rows.map(this.mapRowToEntry);
    } catch (error) {
      console.error('Error querying audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  static async getStatistics(startDate: Date, endDate: Date): Promise<any> {
    try {
      const result = await pool.query(
        `
        SELECT 
          COUNT(*) as total_logs,
          COUNT(DISTINCT user_id) as total_users,
          COUNT(DISTINCT patient_id) as total_patients,
          COUNT(*) FILTER (WHERE success = true) as successful_logs,
          COUNT(*) FILTER (WHERE success = false) as failed_logs,
          json_object_agg(action_type, action_count) as action_breakdown,
          json_object_agg(severity, severity_count) as severity_breakdown
        FROM (
          SELECT 
            action_type,
            severity,
            COUNT(*) as action_count,
            COUNT(*) as severity_count
          FROM audit_logs
          WHERE timestamp >= $1 AND timestamp <= $2
          GROUP BY action_type, severity
        ) subquery,
        audit_logs
        WHERE timestamp >= $1 AND timestamp <= $2
        GROUP BY 1
        `,
        [startDate, endDate]
      );

      return result.rows[0] || {};
    } catch (error) {
      console.error('Error getting audit statistics:', error);
      throw error;
    }
  }

  /**
   * Get patient access history
   */
  static async getPatientAccessHistory(
    patientId: string,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    return this.query({
      patientId,
      limit,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    });
  }

  /**
   * Get user activity history
   */
  static async getUserActivityHistory(
    userId: string,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    return this.query({
      userId,
      limit,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    });
  }

  /**
   * Determine severity based on action type
   */
  private static getSeverityForAction(actionType: AuditActionType): AuditSeverity {
    const criticalActions = [
      AuditActionType.PATIENT_DELETE,
      AuditActionType.RECORD_DELETE,
      AuditActionType.SYSTEM_CONFIG_CHANGE,
      AuditActionType.DATA_RESTORE,
    ];

    const highActions = [
      AuditActionType.PATIENT_UPDATE,
      AuditActionType.RECORD_UPDATE,
      AuditActionType.PATIENT_EXPORT,
      AuditActionType.RECORD_EXPORT,
      AuditActionType.PERMISSION_GRANTED,
      AuditActionType.PERMISSION_REVOKED,
    ];

    if (criticalActions.includes(actionType)) {
      return AuditSeverity.CRITICAL;
    }

    if (highActions.includes(actionType)) {
      return AuditSeverity.HIGH;
    }

    if (actionType === AuditActionType.PATIENT_VIEW || actionType === AuditActionType.RECORD_VIEW) {
      return AuditSeverity.MEDIUM;
    }

    return AuditSeverity.LOW;
  }

  /**
   * Map database row to AuditLogEntry
   */
  private static mapRowToEntry(row: any): AuditLogEntry {
    return {
      id: row.id,
      timestamp: row.timestamp,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userRole: row.user_role,
      actionType: row.action_type as AuditActionType,
      resourceType: row.resource_type as AuditResourceType,
      resourceId: row.resource_id,
      resourceName: row.resource_name,
      patientId: row.patient_id,
      patientName: row.patient_name,
      description: row.description,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      requestMethod: row.request_method,
      requestPath: row.request_path,
      requestBody: row.request_body ? JSON.parse(row.request_body) : undefined,
      responseStatus: row.response_status,
      changes: row.changes ? JSON.parse(row.changes) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      severity: row.severity as AuditSeverity,
      success: row.success,
      errorMessage: row.error_message,
      sessionId: row.session_id,
      location: row.location,
    };
  }
}
