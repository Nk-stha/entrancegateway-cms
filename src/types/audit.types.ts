// ─── Audit Log Types ─────────────────────────────────────────────

export type AuditActionType = 
  | 'LOGIN_SUCCESS' 
  | 'LOGIN_FAILURE'
  | 'LOGIN_FAILED'
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'VIEW' 
  | 'EXPORT'
  | 'TOKEN_REFRESH';

export type AuditEntityType = 
  | 'Authentication' 
  | 'Course' 
  | 'Category' 
  | 'User' 
  | 'QuestionSet' 
  | 'Question' 
  | 'EntranceType' 
  | 'Blog'
  | 'Training'
  | 'OldQuestionCollection';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'SYSTEM' | 'UNKNOWN';

export interface AuditLogApiResponse {
  id: number;
  adminEmail: string;
  adminName: string;
  adminRole: AdminRole;
  action: AuditActionType;
  entityType: AuditEntityType;
  entityId: string | null;
  description: string | null;
  ipAddress: string;
  userAgent: string;
  requestUri: string;
  requestMethod: string;
  responseStatus: number;
  timestamp: string;
}

export interface AuditLog {
  id: number;
  adminEmail: string;
  adminName: string;
  adminRole: AdminRole;
  action: AuditActionType;
  entityType: AuditEntityType;
  entityId: string | null;
  description: string | null;
  ipAddress: string;
  userAgent: string;
  requestUri: string;
  requestMethod: string;
  responseStatus: number;
  timestamp: string;
}

export interface AuditLogFilters {
  search?: string;
  action?: AuditActionType | '';
  entity?: AuditEntityType | '';
  startDate?: string;
  endDate?: string;
}

export interface AuditLogQueryParams extends AuditLogFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
