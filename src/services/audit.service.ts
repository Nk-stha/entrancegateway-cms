import { apiClient } from '@/lib/api/apiClient';
import type {
  AuditLog,
  AuditLogApiResponse,
  AuditLogQueryParams,
} from '@/types/audit.types';

interface AuditLogsResponse {
  success: boolean;
  logs: AuditLog[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  error?: string;
}

class AuditService {
  private endpoint = '/audit-logs';

  private transformAuditLog(apiLog: AuditLogApiResponse): AuditLog {
    return {
      id: apiLog.id,
      adminEmail: apiLog.adminEmail,
      adminName: apiLog.adminName,
      adminRole: apiLog.adminRole,
      action: apiLog.action,
      entityType: apiLog.entityType,
      entityId: apiLog.entityId,
      description: apiLog.description,
      ipAddress: apiLog.ipAddress,
      userAgent: apiLog.userAgent,
      requestUri: apiLog.requestUri,
      requestMethod: apiLog.requestMethod,
      responseStatus: apiLog.responseStatus,
      timestamp: apiLog.timestamp,
    };
  }

  async getAuditLogs(params: AuditLogQueryParams): Promise<AuditLogsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDir) queryParams.append('sortDir', params.sortDir);

      let endpoint = this.endpoint;

      // Use date range endpoint if dates are provided
      if (params.startDate && params.endDate) {
        endpoint = `${this.endpoint}/by-date-range`;
        queryParams.append('startDate', params.startDate);
        queryParams.append('endDate', params.endDate);
      }

      // Add other filters
      if (params.search) queryParams.append('search', params.search);
      if (params.action) queryParams.append('action', params.action);
      if (params.entity) queryParams.append('entityType', params.entity);

      const response = await apiClient.get<{
        content: AuditLogApiResponse[];
        totalElements: number;
        totalPages: number;
        pageNumber: number;
        pageSize: number;
        last: boolean;
      }>(`${endpoint}?${queryParams.toString()}`);

      if (!response.data) {
        console.error('Audit logs: No data received from server');
        return {
          success: false,
          logs: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          error: 'No data received from server',
        };
      }

      return {
        success: true,
        logs: response.data.content.map((log: AuditLogApiResponse) => this.transformAuditLog(log)),
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        currentPage: response.data.pageNumber,
      };
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return {
        success: false,
        logs: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch audit logs',
      };
    }
  }

  async getAuditLogById(id: number): Promise<{ success: boolean; log: AuditLog | null; error?: string }> {
    try {
      const response = await apiClient.get<AuditLogApiResponse>(`${this.endpoint}/${id}`);

      if (!response.data) {
        console.error(`Audit log ${id}: No data received from server`);
        return {
          success: false,
          log: null,
          error: 'No data received from server',
        };
      }

      return {
        success: true,
        log: this.transformAuditLog(response.data),
      };
    } catch (error) {
      console.error(`Failed to fetch audit log ${id}:`, error);
      return {
        success: false,
        log: null,
        error: error instanceof Error ? error.message : 'Failed to fetch audit log',
      };
    }
  }

  async exportAuditLogs(params: AuditLogQueryParams): Promise<{ success: boolean; error?: string }> {
    try {
      const queryParams = new URLSearchParams();

      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const blob = await apiClient.download(`${this.endpoint}/export?${queryParams.toString()}`);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export audit logs',
      };
    }
  }
}

export const auditService = new AuditService();
